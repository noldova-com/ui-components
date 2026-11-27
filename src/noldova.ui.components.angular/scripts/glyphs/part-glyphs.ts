/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from "node:path";

import ts from "typescript";

import "@noldova/context.core";

import { ExportedPart } from "./exported-part.ts";
import { GlyphPlace } from "./glyph-place.ts";
import { PartGlyphsFile } from "./part-glyphs-file.ts";
import { PartGlyphsReading } from "./part-glyphs-reading.ts";
import { PartTemplate } from "./part-template.ts";

// Reads, from the kit's source, the glyphs each part the package exports can draw: those its own file gives, those of the files it imports that
// its code uses or its template names, the names its template draws as written, and the same of the kit's parts it shows. A glyph is a string
// literal typed `IconName`, or, in a constant written `as const`, an icon name under a property whose name holds glyph or icon. Icons a site passes
// in are the site's own.
export class PartGlyphs {
  private static readonly ICON_TYPE: string = "IconName";
  private static readonly COMPONENT_DECORATOR: string = "Component";
  private static readonly TEMPLATE_FIELD: string = "template";
  private static readonly TEMPLATE_URL_FIELD: string = "templateUrl";
  private static readonly CONSTANT: string = "const";
  private static readonly PARENT: string = "..";
  private static readonly DECLARATIONS: string = ".d.ts";
  private static readonly RELATIVE: string = ".";
  private static readonly GLYPH_NAME: RegExp = /glyph|icon/iu;
  private static readonly WORD: RegExp = /[A-Za-z_$][\w$]*/gu;
  // An icon a template draws by its name, written between the symbol font's span tags.
  private static readonly DRAWN_ICON: RegExp = /<span[^>]*material-symbols-rounded[^>]*>\s*([a-z0-9_]+)\s*<\/span\s*>/gu;
  // An icon a template hands to an icon or glyph input as written, such as icon="forum" or [icon]="'forum'".
  private static readonly GIVEN_ICON: RegExp = /\s(?:\[[\w-]*(?:icon|glyph)[\w-]*\]="'([a-z0-9_]+)'"|[\w-]*(?:icon|glyph)[\w-]*="([a-z0-9_]+)")/giu;

  private readonly program: ts.Program;
  private readonly checker: ts.TypeChecker;
  private readonly names: ReadonlySet<string>;
  private readonly readText: (file: string) => string;
  private readonly places: GlyphPlace[] = [];
  // The glyphs each declaration holds, by its name, such as a resources class's `closeGlyph` or `copyGlyphs`, and the file that declares it. A
  // constant written `as const` gives its members' readers symbols of their own, so a reader is matched by the declarations of its symbol.
  private readonly owners: Map<ts.Identifier, Set<string>> = new Map();
  private readonly declaredIn: Map<ts.Identifier, ts.SourceFile> = new Map();
  // Each part's template, by the part's file, and the icons it draws as written.
  private readonly templates: Map<ts.SourceFile, PartTemplate> = new Map();
  private readonly drawn: Map<ts.SourceFile, readonly string[]> = new Map();
  // The declarations each file's code uses, read once for all the parts that import it.
  private readonly uses: Map<ts.SourceFile, ReadonlySet<ts.Identifier>> = new Map();
  // The declarations and the templates some part's list took its glyphs from.
  private readonly usedOwners: Set<ts.Identifier> = new Set();
  private readonly usedTemplates: Set<ts.SourceFile> = new Set();

  public constructor(program: ts.Program, names: ReadonlySet<string>, readText: (file: string) => string) {
    this.program = program;
    this.checker = program.getTypeChecker();
    this.names = names;
    this.readText = readText;
  }

  public static render(parts: ReadonlyMap<string, readonly string[]>): string {
    const sorted = new Map([...parts.keys()].sort().map(t => [t, parts.get(t) ?? []]));
    return `${JSON.stringify(new PartGlyphsFile(Object.fromEntries(sorted)), null, 2)}\n`;
  }

  // Reads every part the entries export, and every glyph of the source files under the folder that no part's list took.
  public read(entries: readonly string[], folder: string): PartGlyphsReading {
    const sources = this.program.getSourceFiles().filter(t => PartGlyphs.isUnder(t.fileName, folder));
    const iconType = this.findIconType(sources);
    for (const source of sources)
      this.collectGlyphs(source, iconType, folder);
    const parts = new Map<string, readonly string[]>();
    for (const entry of entries)
      for (const part of this.exportedParts(entry))
        parts.set(part.name, this.glyphsOf(part.source, folder));
    const orphans = this.places.filter(t => t.isDrawn ? !this.usedTemplates.has(t.file) : Object.isNull(t.owner) || !this.usedOwners.has(t.owner))
      .map(t => `${t.place}: ${t.name}`);
    return new PartGlyphsReading(parts, [...new Set(orphans)].sort());
  }

  private static isUnder(file: string, folder: string): boolean {
    const relative = path.relative(folder, path.resolve(file));
    return !relative.startsWith(PartGlyphs.PARENT) && !path.isAbsolute(relative) && !file.endsWith(PartGlyphs.DECLARATIONS);
  }

  private static placeOf(file: string, folder: string): string {
    return path.relative(folder, path.resolve(file)).split(path.sep).join(path.posix.sep);
  }

  // The name of the declaration a node is part of: a property, variable, parameter, method or function.
  private static ownerOf(node: ts.Node): ts.Identifier | null {
    for (let current = node.parent; !Object.isUndefined(current) && !ts.isSourceFile(current); current = current.parent)
      if ((ts.isPropertyAssignment(current) || ts.isPropertyDeclaration(current) || ts.isVariableDeclaration(current) || ts.isParameter(current) ||
        ts.isMethodDeclaration(current) || ts.isGetAccessorDeclaration(current) || ts.isFunctionDeclaration(current)) && !Object.isUndefined(current.name) &&
        ts.isIdentifier(current.name))
        return current.name;
    return null;
  }

  private static isConstant(node: ts.Node): boolean {
    for (let current = node.parent; !Object.isUndefined(current) && !ts.isSourceFile(current); current = current.parent)
      if (ts.isAsExpression(current) && ts.isTypeReferenceNode(current.type) && ts.isIdentifier(current.type.typeName) &&
        current.type.typeName.text === PartGlyphs.CONSTANT)
        return true;
    return false;
  }

  private static componentOf(declaration: ts.ClassDeclaration): ts.ObjectLiteralExpression | null {
    for (const decorator of ts.getDecorators(declaration) ?? []) {
      const call = decorator.expression;
      if (ts.isCallExpression(call) && ts.isIdentifier(call.expression) && call.expression.text === PartGlyphs.COMPONENT_DECORATOR) {
        const options = call.arguments[0];
        if (!Object.isUndefined(options) && ts.isObjectLiteralExpression(options))
          return options;
      }
    }
    return null;
  }

  private findIconType(sources: readonly ts.SourceFile[]): ts.Type | null {
    for (const source of sources)
      for (const statement of source.statements)
        if (ts.isTypeAliasDeclaration(statement) && statement.name.text === PartGlyphs.ICON_TYPE)
          return this.checker.getTypeAtLocation(statement.name);
    return null;
  }

  private collectGlyphs(source: ts.SourceFile, iconType: ts.Type | null, folder: string): void {
    const visit = (node: ts.Node): void => {
      if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && this.isGlyph(node, iconType)) {
        const owner = PartGlyphs.ownerOf(node);
        if (!Object.isNull(owner)) {
          const glyphs = this.owners.get(owner) ?? new Set<string>();
          glyphs.add(node.text);
          this.owners.set(owner, glyphs);
          this.declaredIn.set(owner, source);
        }
        const line = source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;
        this.places.push(new GlyphPlace(`${PartGlyphs.placeOf(source.fileName, folder)}:${line}`, node.text, owner, source, false));
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
    const template = this.readTemplate(source);
    if (!Object.isNull(template)) {
      const given = [...template.text.matchAll(PartGlyphs.GIVEN_ICON)].map(t => t[1] ?? t[2] ?? "").filter(t => this.names.has(t));
      const icons = [...[...template.text.matchAll(PartGlyphs.DRAWN_ICON)].map(t => t[1] ?? ""), ...given];
      this.templates.set(source, template);
      this.drawn.set(source, icons);
      for (const icon of icons)
        this.places.push(new GlyphPlace(PartGlyphs.placeOf(template.place, folder), icon, null, source, true));
    }
  }

  private isGlyph(node: ts.StringLiteral | ts.NoSubstitutionTemplateLiteral, iconType: ts.Type | null): boolean {
    if (!this.names.has(node.text))
      return false;
    const context = this.checker.getContextualType(node);
    const given = Object.isUndefined(context) ? undefined : this.checker.getNonNullableType(context);
    if (!Object.isNull(iconType) && !Object.isUndefined(given) && (given.flags & ts.TypeFlags.Any) === 0 &&
      this.checker.isTypeAssignableTo(given, iconType) && this.checker.isTypeAssignableTo(iconType, given))
      return true;
    const owner = PartGlyphs.ownerOf(node);
    return !Object.isNull(owner) && PartGlyphs.GLYPH_NAME.test(owner.text) && PartGlyphs.isConstant(node);
  }

  private exportedParts(entry: string): readonly ExportedPart[] {
    const source = this.program.getSourceFile(entry);
    const module = Object.isUndefined(source) ? undefined : this.checker.getSymbolAtLocation(source);
    if (Object.isUndefined(module))
      return [];
    const parts: ExportedPart[] = [];
    for (const exported of this.checker.getExportsOfModule(module)) {
      const symbol = (exported.flags & ts.SymbolFlags.Alias) === 0 ? exported : this.checker.getAliasedSymbol(exported);
      const declaration = symbol.declarations?.[0];
      if (!Object.isUndefined(declaration) && ts.isClassDeclaration(declaration) && !Object.isNull(PartGlyphs.componentOf(declaration)))
        parts.push(new ExportedPart(exported.name, declaration.getSourceFile()));
    }
    return parts;
  }

  private readTemplate(source: ts.SourceFile): PartTemplate | null {
    for (const statement of source.statements) {
      const options = ts.isClassDeclaration(statement) ? PartGlyphs.componentOf(statement) : null;
      for (const property of options?.properties ?? []) {
        if (!ts.isPropertyAssignment(property) || !ts.isIdentifier(property.name) || !ts.isStringLiteralLike(property.initializer))
          continue;
        if (property.name.text === PartGlyphs.TEMPLATE_FIELD)
          return new PartTemplate(property.initializer.text, source.fileName);
        if (property.name.text === PartGlyphs.TEMPLATE_URL_FIELD) {
          const file = path.join(path.dirname(source.fileName), property.initializer.text);
          return new PartTemplate(this.readText(file), file);
        }
      }
    }
    return null;
  }

  // The part's file and every file it imports for more than types, in turn; each part among them is one the part shows.
  private filesOf(source: ts.SourceFile, folder: string): ReadonlySet<ts.SourceFile> {
    const files = new Set<ts.SourceFile>([source]);
    for (const file of files)
      for (const statement of file.statements) {
        if (!ts.isImportDeclaration(statement) || statement.importClause?.isTypeOnly === true || !ts.isStringLiteral(statement.moduleSpecifier) ||
          !statement.moduleSpecifier.text.startsWith(PartGlyphs.RELATIVE))
          continue;
        const imported = this.checker.getSymbolAtLocation(statement.moduleSpecifier)?.valueDeclaration;
        if (!Object.isUndefined(imported) && ts.isSourceFile(imported) && PartGlyphs.isUnder(imported.fileName, folder))
          files.add(imported);
      }
    return files;
  }

  // A part's glyphs: those of the declarations its files' code uses or its parts' templates name, every one a part's own file declares, and the icons
  // its parts' templates draw as written.
  private glyphsOf(source: ts.SourceFile, folder: string): readonly string[] {
    const files = this.filesOf(source, folder);
    const used = new Set<ts.Identifier>();
    const words = new Set<string>();
    for (const file of files) {
      for (const owner of this.usesOf(file))
        used.add(owner);
      for (const word of this.templates.get(file)?.text.matchAll(PartGlyphs.WORD) ?? [])
        words.add(word[0]);
    }
    for (const [owner, file] of this.declaredIn)
      if (files.has(file) && (words.has(owner.text) || this.templates.has(file)))
        used.add(owner);
    const glyphs = new Set<string>();
    for (const owner of used) {
      this.usedOwners.add(owner);
      for (const name of this.owners.get(owner) ?? [])
        glyphs.add(name);
    }
    for (const file of files)
      if (this.templates.has(file)) {
        this.usedTemplates.add(file);
        for (const icon of this.drawn.get(file) ?? [])
          glyphs.add(icon);
      }
    return [...glyphs].sort();
  }

  private usesOf(file: ts.SourceFile): ReadonlySet<ts.Identifier> {
    const known = this.uses.get(file);
    if (!Object.isUndefined(known))
      return known;
    const used = new Set<ts.Identifier>();
    const visit = (node: ts.Node): void => {
      if (ts.isIdentifier(node) && PartGlyphs.ownerOf(node) !== node) {
        const found = this.checker.getSymbolAtLocation(node);
        const symbol = Object.isUndefined(found) || (found.flags & ts.SymbolFlags.Alias) === 0 ? found : this.checker.getAliasedSymbol(found);
        for (const declaration of symbol?.declarations ?? []) {
          const name = ts.getNameOfDeclaration(declaration);
          if (!Object.isUndefined(name) && ts.isIdentifier(name) && this.owners.has(name))
            used.add(name);
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(file);
    this.uses.set(file, used);
    return used;
  }
}
