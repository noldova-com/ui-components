/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ts from "typescript";

import type { ApiProgram } from "./api-program.ts";
import { ApiReach } from "./api-reach.ts";
import { ApiValue } from "./api-value.ts";
import type { IApiSymbolVisitor } from "./interfaces/i-api-symbol-visitor.ts";

export class ApiSymbolWalker {
  private static readonly CONTAINERS: number = ts.SymbolFlags.Class | ts.SymbolFlags.Interface | ts.SymbolFlags.Module | ts.SymbolFlags.Enum;
  private static readonly PROTOTYPE: string = "prototype";
  private static readonly GENERATED_PREFIX: string = "ɵ";
  private static readonly HIDDEN: number = ts.ModifierFlags.Private | ts.ModifierFlags.Protected;
  private static readonly MEMBER_NAMES: ReadonlyMap<string, string> = new Map([
    ["__constructor", ".constructor"],
    ["__call", " call signature"],
    ["__new", " construct signature"],
    ["__index", " index signature"]
  ]);

  private readonly api: ApiProgram;
  private readonly reach: ApiReach;

  public constructor(api: ApiProgram, reach: ApiReach = ApiReach.OWN) {
    this.api = api;
    this.reach = reach;
  }

  public walk(file: string, visit: IApiSymbolVisitor): void {
    const [source, module] = this.api.readModule(file);
    for (const exported of this.api.checker.getExportsOfModule(module))
      this.visit(exported.name, exported, this.reach.followsReExports ? null : source.fileName, visit);
  }

  private static nameMember(path: string, name: string): string {
    const special = ApiSymbolWalker.MEMBER_NAMES.get(name);
    return special === undefined ? `${path}#${name}` : `${path}${special}`;
  }

  private visit(path: string, exported: ts.Symbol, fileName: string | null, visit: IApiSymbolVisitor): void {
    const symbol = (exported.flags & ts.SymbolFlags.Alias) === 0 ? exported : this.api.checker.getAliasedSymbol(exported);
    if ((symbol.flags & ts.SymbolFlags.TypeParameter) !== 0)
      return;
    const declarations = symbol.declarations ?? [];
    const owned = fileName === null ? declarations : declarations.filter(t => t.getSourceFile().fileName === fileName);
    if (owned.length === 0 || owned.some(t => (ApiValue.readModifierFlags(t) & ApiSymbolWalker.HIDDEN) !== 0))
      return;
    visit(path, symbol, owned);
    if ((symbol.flags & ApiSymbolWalker.CONTAINERS) === 0)
      return;
    for (const [name, member] of ApiValue.listMembers(symbol.members))
      if (!name.startsWith(ApiSymbolWalker.GENERATED_PREFIX))
        this.visit(ApiSymbolWalker.nameMember(path, name), member, fileName, visit);
    for (const [name, member] of ApiValue.listMembers(symbol.exports))
      if (name !== ApiSymbolWalker.PROTOTYPE && !name.startsWith(ApiSymbolWalker.GENERATED_PREFIX))
        this.visit(`${path}.${name}`, member, fileName, visit);
  }
}
