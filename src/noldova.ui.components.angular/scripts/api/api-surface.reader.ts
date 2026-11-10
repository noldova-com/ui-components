/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ts from "typescript";

import type { ApiProgram } from "./api-program.ts";
import { ApiSurface } from "./api-surface.ts";
import { ApiValue } from "./api-value.ts";

export class ApiSurfaceReader {
  private static readonly TYPE_FLAGS: number = ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.InTypeAlias;
  private static readonly KINDS: ReadonlyMap<number, string> = new Map([
    [ts.SymbolFlags.Class, "class"],
    [ts.SymbolFlags.Interface, "interface"],
    [ts.SymbolFlags.TypeAlias, "type"],
    [ts.SymbolFlags.Function, "function"],
    [ts.SymbolFlags.Variable, "variable"],
    [ts.SymbolFlags.Property, "property"],
    [ts.SymbolFlags.Method, "method"],
    [ts.SymbolFlags.GetAccessor, "get"],
    [ts.SymbolFlags.SetAccessor, "set"],
    [ts.SymbolFlags.RegularEnum, "enum"],
    [ts.SymbolFlags.ConstEnum, "const enum"],
    [ts.SymbolFlags.EnumMember, "member"],
    [ts.SymbolFlags.Module, "namespace"],
    [ts.SymbolFlags.Optional, "optional"]
  ]);
  private static readonly MODIFIERS: ReadonlyMap<number, string> = new Map([
    [ts.ModifierFlags.Protected, "protected"],
    [ts.ModifierFlags.Static, "static"],
    [ts.ModifierFlags.Abstract, "abstract"],
    [ts.ModifierFlags.Readonly, "readonly"],
    [ts.ModifierFlags.Accessor, "accessor"]
  ]);
  private static readonly HIDDEN_MEMBERS: ReadonlySet<string> = new Set(["prototype", "__constructor"]);
  private static readonly GENERATED_PREFIX: string = "ɵ";
  private static readonly VALUE_KINDS: number = ts.SymbolFlags.Variable | ts.SymbolFlags.Property | ts.SymbolFlags.Accessor;
  private static readonly CALLABLE_KINDS: number = ts.SymbolFlags.Function | ts.SymbolFlags.Method;
  private static readonly CONSTRUCTOR_PATH: string = "constructor";
  private static readonly IMPLICIT_CONSTRUCTOR: string = "()";
  private static readonly HIDDEN: number = ts.ModifierFlags.Private | ts.ModifierFlags.Protected;

  private readonly api: ApiProgram;

  public constructor(api: ApiProgram) {
    this.api = api;
  }

  public read(file: string): ApiSurface {
    const [, module] = this.api.readModule(file);
    const entries = new Map<string, string>();
    for (const exported of this.api.checker.getExportsOfModule(module))
      this.describe(exported.name, exported, entries);
    return new ApiSurface(entries);
  }

  private static isShown(name: string): boolean {
    return !ApiSurfaceReader.HIDDEN_MEMBERS.has(name) && !name.startsWith(ApiSurfaceReader.GENERATED_PREFIX);
  }

  private describe(path: string, exported: ts.Symbol, entries: Map<string, string>): void {
    const symbol = (exported.flags & ts.SymbolFlags.Alias) === 0 ? exported : this.api.checker.getAliasedSymbol(exported);
    const declarations = symbol.declarations ?? [];
    const flags = declarations.reduce((all, t) => all | ApiValue.readModifierFlags(t), ts.ModifierFlags.None);
    if ((flags & ApiSurfaceReader.HIDDEN) !== 0 || (symbol.flags & ts.SymbolFlags.TypeParameter) !== 0)
      return;
    const kinds = [...ApiSurfaceReader.KINDS].filter(([flag]) => (symbol.flags & flag) !== 0).map(([, name]) => name);
    const modifiers = [...ApiSurfaceReader.MODIFIERS].filter(([flag]) => (flags & flag) !== 0).map(([, name]) => name);
    entries.set(path, [...kinds, ...modifiers, this.describeDetail(symbol, declarations)].filter(t => t !== "").join(" "));
    if ((symbol.flags & ApiSurfaceReader.CALLABLE_KINDS) !== 0)
      this.describeSignatures(path, symbol, ts.SignatureKind.Call, "", entries);
    if ((symbol.flags & ts.SymbolFlags.Class) !== 0)
      this.describeSignatures(`${path}.${ApiSurfaceReader.CONSTRUCTOR_PATH}`, symbol, ts.SignatureKind.Construct, (flags & ts.ModifierFlags.Abstract) === 0 ? "new " : "abstract new ", entries);
    if ((symbol.flags & (ts.SymbolFlags.Class | ts.SymbolFlags.Enum | ts.SymbolFlags.Module)) !== 0)
      for (const [name, member] of ApiValue.listMembers(symbol.exports))
        if (ApiSurfaceReader.isShown(name))
          this.describe(`${path}.${name}`, member, entries);
    if ((symbol.flags & (ts.SymbolFlags.Class | ts.SymbolFlags.Interface)) !== 0)
      for (const [name, member] of ApiValue.listMembers(symbol.members))
        if (ApiSurfaceReader.isShown(name))
          this.describe(`${path}#${name}`, member, entries);
  }

  private describeDetail(symbol: ts.Symbol, declarations: readonly ts.Declaration[]): string {
    const checker = this.api.checker;
    if ((symbol.flags & ApiSurfaceReader.VALUE_KINDS) !== 0)
      return `: ${this.print(checker.getTypeOfSymbol(symbol))}`;
    if ((symbol.flags & ts.SymbolFlags.EnumMember) !== 0) {
      const member = declarations.find(ts.isEnumMember);
      return `= ${JSON.stringify(member === undefined ? undefined : checker.getConstantValue(member))}`;
    }
    if ((symbol.flags & ApiSurfaceReader.CALLABLE_KINDS) !== 0)
      return "";
    const parameters = this.describeTypeParameters(declarations.flatMap(t =>
      ts.isClassDeclaration(t) || ts.isInterfaceDeclaration(t) || ts.isTypeAliasDeclaration(t) ? t.typeParameters ?? [] : []));
    const declared = checker.getDeclaredTypeOfSymbol(symbol);
    if ((symbol.flags & ts.SymbolFlags.TypeAlias) !== 0)
      return `${parameters} = ${this.print(declared)}`;
    const bases = declared.isClassOrInterface() ? checker.getBaseTypes(declared) : [];
    const names = bases.map(t => this.print(t));
    return [parameters, names.length === 0 ? "" : `extends ${names.join(", ")}`].filter(t => t !== "").join(" ");
  }

  private describeSignatures(path: string, symbol: ts.Symbol, kind: ts.SignatureKind, prefix: string, entries: Map<string, string>): void {
    const type = this.api.checker.getTypeOfSymbol(symbol);
    for (const [index, signature] of this.api.checker.getSignaturesOfType(type, kind).entries())
      entries.set(`${path}(${index})`, this.describeSignature(signature, prefix));
  }

  private describeSignature(signature: ts.Signature, prefix: string): string {
    const declaration = signature.declaration;
    if (declaration === undefined || ts.isJSDocSignature(declaration))
      return `${prefix}${ApiSurfaceReader.IMPLICIT_CONSTRUCTOR}`;
    const flags = ApiValue.readModifierFlags(declaration);
    if ((flags & ts.ModifierFlags.Private) !== 0)
      return `private ${prefix}${ApiSurfaceReader.IMPLICIT_CONSTRUCTOR}`;
    const visibility = (flags & ts.ModifierFlags.Protected) === 0 ? "" : "protected ";
    const parameters = declaration.parameters.map(t => this.describeParameter(t));
    const returned = declaration.type !== undefined && ts.isTypePredicateNode(declaration.type)
      ? this.api.print(declaration.type)
      : this.print(this.api.checker.getReturnTypeOfSignature(signature));
    return `${visibility}${prefix}${this.describeTypeParameters(declaration.typeParameters ?? [])}(${parameters.join(", ")}): ${returned}`;
  }

  private describeParameter(parameter: ts.ParameterDeclaration): string {
    const checker = this.api.checker;
    const type = parameter.type === undefined ? checker.getTypeAtLocation(parameter) : checker.getTypeFromTypeNode(parameter.type);
    const isOptional = parameter.questionToken !== undefined || parameter.initializer !== undefined;
    return [
      parameter.dotDotDotToken === undefined ? "" : "...",
      this.api.print(parameter.name),
      isOptional ? "?" : "",
      `: ${this.print(type)}`
    ].join("");
  }

  private describeTypeParameters(parameters: readonly ts.TypeParameterDeclaration[]): string {
    const descriptions = parameters.map(parameter => {
      const constraint = parameter.constraint === undefined ? "" : ` extends ${this.printNodeType(parameter.constraint)}`;
      const fallback = parameter.default === undefined ? "" : ` = ${this.printNodeType(parameter.default)}`;
      return `${parameter.name.text}${constraint}${fallback}`;
    });
    return descriptions.length === 0 ? "" : `<${descriptions.join(", ")}>`;
  }

  private printNodeType(node: ts.TypeNode): string {
    return this.print(this.api.checker.getTypeFromTypeNode(node));
  }

  private print(type: ts.Type): string {
    return this.api.checker.typeToString(type, undefined, ApiSurfaceReader.TYPE_FLAGS);
  }
}
