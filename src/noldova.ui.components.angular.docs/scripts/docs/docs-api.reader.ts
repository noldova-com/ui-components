/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ts from "typescript";

import type { ApiProgram } from "../../../noldova.ui.components.angular/scripts/api/api-program.ts";
import { ApiException } from "../../../noldova.ui.components.angular/scripts/api/api.exception.ts";
import { DocsComponent } from "./docs-component.ts";
import { DocsHostDirective } from "./docs-host-directive.ts";
import { DocsInput } from "./docs-input.ts";
import { DocsOutput } from "./docs-output.ts";

export class DocsApiReader {
  private static readonly COMPONENT_SUFFIX: string = "Component";
  private static readonly COMPONENT_DECORATOR: string = "Component";
  private static readonly SELECTOR_PROPERTY: string = "selector";
  private static readonly ALIAS_PROPERTY: string = "alias";
  private static readonly HOST_DIRECTIVES_PROPERTY: string = "hostDirectives";
  private static readonly DIRECTIVE_PROPERTY: string = "directive";
  private static readonly INPUTS_PROPERTY: string = "inputs";
  private static readonly OUTPUTS_PROPERTY: string = "outputs";
  private static readonly BINDING_SEPARATOR: string = ":";
  private static readonly REQUIRED_SUFFIX: string = ".required";
  private static readonly UNSET_DEFAULT: string = "undefined";
  private static readonly INPUT_KINDS: ReadonlyMap<string, string> = new Map([["InputSignal", "input"], ["InputSignalWithTransform", "input"], ["ModelSignal", "model"]]);
  private static readonly WRITE_TYPE_ARGUMENTS: ReadonlyMap<string, number> = new Map([["InputSignalWithTransform", 1]]);
  private static readonly OUTPUT_TYPES: ReadonlySet<string> = new Set(["OutputEmitterRef", "OutputRef"]);
  private static readonly LINE_BREAK: RegExp = /\r?\n/u;
  private static readonly DOC_OPENING: RegExp = /^\s*\/\*\*\s?/u;
  private static readonly DOC_CLOSING: RegExp = /\s*\*\/\s*$/u;
  private static readonly DOC_MARGIN: RegExp = /^\s*\*\s?/u;
  private static readonly TAG_START: string = "@";
  private static readonly LINK: RegExp = /\{@link(code|plain)?\s+([^}\s|]+)(?:[\s|]+([^}]*))?\}/gu;
  private static readonly PLAIN_LINK: string = "plain";
  private static readonly CODE_MARK: string = "`";
  private static readonly SPACE: string = " ";

  private readonly api: ApiProgram;

  public constructor(api: ApiProgram) {
    this.api = api;
  }

  public read(declarations: string, implementation: string, entry: string): readonly DocsComponent[] {
    const declared = this.readSource(declarations);
    const sources = this.readImplementations(implementation);
    const classes = new Map<string, ts.ClassDeclaration>();
    for (const statement of declared.statements) {
      const name = ts.isClassDeclaration(statement) ? statement.name?.text : undefined;
      if (ts.isClassDeclaration(statement) && name !== undefined)
        classes.set(name, statement);
    }
    const components: DocsComponent[] = [];
    for (const [name, statement] of classes) {
      if (!name.endsWith(DocsApiReader.COMPONENT_SUFFIX))
        continue;
      const source = sources.get(name);
      if (source === undefined)
        throw new ApiException(`${declarations} declares ${name}, but ${implementation} exports no class of that name.`);
      components.push(DocsApiReader.describe(name, entry, statement, source, classes, sources));
    }
    return components;
  }

  private static describe(name: string, entry: string, declared: ts.ClassDeclaration, source: ts.ClassDeclaration, classes: ReadonlyMap<string, ts.ClassDeclaration>,
    sources: ReadonlyMap<string, ts.ClassDeclaration>): DocsComponent {
    const options = DocsApiReader.readOptions(source);
    const inputs: DocsInput[] = [];
    const outputs: DocsOutput[] = [];
    DocsApiReader.readMembers(declared, source, null, inputs, outputs);
    for (const host of options === undefined ? [] : DocsApiReader.readHostDirectives(options)) {
      const hostDeclared = classes.get(host.directive);
      const hostSource = sources.get(host.directive);
      if (hostDeclared === undefined || hostSource === undefined)
        continue;
      const hostInputs: DocsInput[] = [];
      const hostOutputs: DocsOutput[] = [];
      DocsApiReader.readMembers(hostDeclared, hostSource, host.directive, hostInputs, hostOutputs);
      inputs.push(...DocsApiReader.expose(host.directive, hostInputs, host.inputs, inputs, (member, exposed) => member.withName(exposed)));
      outputs.push(...DocsApiReader.expose(host.directive, hostOutputs, host.outputs, outputs, (member, exposed) => member.withName(exposed)));
    }
    return new DocsComponent(name, entry, DocsApiReader.readSelector(name, options), DocsApiReader.readDocs(declared), inputs, outputs);
  }

  private static readMembers(declared: ts.ClassDeclaration, source: ts.ClassDeclaration, directive: string | null, inputs: DocsInput[], outputs: DocsOutput[]): void {
    for (const member of declared.members) {
      if (!ts.isPropertyDeclaration(member) || member.type === undefined || !ts.isTypeReferenceNode(member.type))
        continue;
      const property = member.name.getText();
      const typeName = member.type.typeName.getText();
      const typeArguments = member.type.typeArguments ?? [];
      const call = DocsApiReader.findCall(source, property);
      const binding = call === undefined ? property : DocsApiReader.readAlias(call) ?? property;
      const kind = DocsApiReader.INPUT_KINDS.get(typeName);
      if (kind !== undefined) {
        const type = typeArguments[DocsApiReader.WRITE_TYPE_ARGUMENTS.get(typeName) ?? 0]?.getText() ?? DocsApiReader.UNSET_DEFAULT;
        const isRequired = call !== undefined && DocsApiReader.isRequired(call);
        const defaultValue = isRequired ? null : call?.arguments[0]?.getText() ?? DocsApiReader.UNSET_DEFAULT;
        inputs.push(new DocsInput(binding, kind, type, defaultValue, isRequired, DocsApiReader.readDocs(member), directive));
      }
      else if (DocsApiReader.OUTPUT_TYPES.has(typeName))
        outputs.push(new DocsOutput(binding, typeArguments[0]?.getText() ?? DocsApiReader.UNSET_DEFAULT, DocsApiReader.readDocs(member), directive));
    }
  }

  private static expose<T extends DocsInput | DocsOutput>(directive: string, members: readonly T[], bindings: ReadonlyMap<string, string>, own: readonly T[],
    rename: (member: T, name: string) => T): readonly T[] {
    const exposed: T[] = [];
    for (const [binding, name] of bindings) {
      const member = members.find(t => t.name === binding);
      if (member === undefined)
        throw new ApiException(`${directive} declares no input or output named ${binding} for its host to expose.`);
      if (!own.some(t => t.name === name))
        exposed.push(rename(member, name));
    }
    return exposed;
  }

  private static readHostDirectives(options: ts.ObjectLiteralExpression): readonly DocsHostDirective[] {
    const entries = DocsApiReader.readProperty(options, DocsApiReader.HOST_DIRECTIVES_PROPERTY);
    if (entries === undefined || !ts.isArrayLiteralExpression(entries))
      return [];
    const hosts: DocsHostDirective[] = [];
    for (const entry of entries.elements) {
      const directive = ts.isObjectLiteralExpression(entry) ? DocsApiReader.readProperty(entry, DocsApiReader.DIRECTIVE_PROPERTY) : undefined;
      if (ts.isObjectLiteralExpression(entry) && directive !== undefined)
        hosts.push(new DocsHostDirective(directive.getText(), DocsApiReader.readBindings(entry, DocsApiReader.INPUTS_PROPERTY),
          DocsApiReader.readBindings(entry, DocsApiReader.OUTPUTS_PROPERTY)));
    }
    return hosts;
  }

  private static readBindings(entry: ts.ObjectLiteralExpression, key: string): ReadonlyMap<string, string> {
    const list = DocsApiReader.readProperty(entry, key);
    const bindings = new Map<string, string>();
    for (const item of list !== undefined && ts.isArrayLiteralExpression(list) ? list.elements : []) {
      if (!ts.isStringLiteral(item))
        continue;
      const [binding, exposed] = item.text.split(DocsApiReader.BINDING_SEPARATOR).map(t => t.trim());
      if (binding !== undefined)
        bindings.set(binding, exposed ?? binding);
    }
    return bindings;
  }

  private static findCall(source: ts.ClassDeclaration, property: string): ts.CallExpression | undefined {
    const member = source.members.find((t): t is ts.PropertyDeclaration => ts.isPropertyDeclaration(t) && t.name.getText() === property);
    const initializer = member?.initializer;
    return initializer !== undefined && ts.isCallExpression(initializer) ? initializer : undefined;
  }

  private static isRequired(call: ts.CallExpression): boolean {
    return call.expression.getText().endsWith(DocsApiReader.REQUIRED_SUFFIX);
  }

  private static readAlias(call: ts.CallExpression): string | undefined {
    const options = call.arguments[DocsApiReader.isRequired(call) ? 0 : 1];
    return options !== undefined && ts.isObjectLiteralExpression(options) ? DocsApiReader.readText(options, DocsApiReader.ALIAS_PROPERTY) : undefined;
  }

  private static readOptions(source: ts.ClassDeclaration): ts.ObjectLiteralExpression | undefined {
    for (const modifier of source.modifiers ?? []) {
      if (!ts.isDecorator(modifier) || !ts.isCallExpression(modifier.expression) || modifier.expression.expression.getText() !== DocsApiReader.COMPONENT_DECORATOR)
        continue;
      const [options] = modifier.expression.arguments;
      if (options !== undefined && ts.isObjectLiteralExpression(options))
        return options;
    }
    return undefined;
  }

  private static readSelector(name: string, options: ts.ObjectLiteralExpression | undefined): string {
    const selector = options === undefined ? undefined : DocsApiReader.readText(options, DocsApiReader.SELECTOR_PROPERTY);
    if (selector === undefined)
      throw new ApiException(`${name} has no @Component decorator with a selector.`);
    return selector;
  }

  private static readText(options: ts.ObjectLiteralExpression, key: string): string | undefined {
    const value = DocsApiReader.readProperty(options, key);
    return value === undefined ? undefined : DocsApiReader.readLiteral(value);
  }

  private static readProperty(options: ts.ObjectLiteralExpression, key: string): ts.Expression | undefined {
    const value = options.properties.find(t => ts.isPropertyAssignment(t) && t.name.getText() === key);
    return value !== undefined && ts.isPropertyAssignment(value) ? value.initializer : undefined;
  }

  private static readLiteral(value: ts.Expression): string {
    return ts.isStringLiteral(value) ? value.text : value.getText();
  }

  private static readDocs(node: ts.Node): readonly string[] {
    const doc = ts.getJSDocCommentsAndTags(node).filter(t => ts.isJSDoc(t)).at(-1);
    if (doc === undefined)
      return [];
    const lines = doc.getText().split(DocsApiReader.LINE_BREAK)
      .map(t => t.replace(DocsApiReader.DOC_OPENING, "").replace(DocsApiReader.DOC_CLOSING, "").replace(DocsApiReader.DOC_MARGIN, "").trimEnd());
    const end = lines.findIndex(t => t.startsWith(DocsApiReader.TAG_START));
    const paragraphs: string[][] = [[]];
    for (const line of end === -1 ? lines : lines.slice(0, end)) {
      if (line === "")
        paragraphs.push([]);
      else
        paragraphs.at(-1)?.push(line);
    }
    return paragraphs.filter(t => t.length > 0)
      .map(t => t.join(DocsApiReader.SPACE).replace(DocsApiReader.LINK, (_link: string, kind: string | undefined, target: string, text: string | undefined) =>
        DocsApiReader.readLink(kind, target, text?.trim())));
  }

  private static readLink(kind: string | undefined, target: string, text: string | undefined): string {
    if (text !== undefined && text.length > 0)
      return text;
    return kind === DocsApiReader.PLAIN_LINK ? target : `${DocsApiReader.CODE_MARK}${target}${DocsApiReader.CODE_MARK}`;
  }

  private readSource(file: string): ts.SourceFile {
    const source = this.api.program.getSourceFile(file);
    if (source === undefined)
      throw new ApiException(`${file} is not a file of the project.`);
    return source;
  }

  private readImplementations(file: string): ReadonlyMap<string, ts.ClassDeclaration> {
    const [, module] = this.api.readModule(file);
    const classes = new Map<string, ts.ClassDeclaration>();
    for (const exported of this.api.checker.getExportsOfModule(module)) {
      const symbol = (exported.flags & ts.SymbolFlags.Alias) === 0 ? exported : this.api.checker.getAliasedSymbol(exported);
      for (const declaration of symbol.declarations ?? []) {
        if (ts.isClassDeclaration(declaration))
          classes.set(exported.getName(), declaration);
      }
    }
    return classes;
  }
}
