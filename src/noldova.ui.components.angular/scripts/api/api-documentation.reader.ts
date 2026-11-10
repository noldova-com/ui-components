/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from "node:path";

import ts from "typescript";

import type { ApiProgram } from "./api-program.ts";
import { ApiSymbolWalker } from "./api-symbol-walker.ts";
import { ApiValue } from "./api-value.ts";

export class ApiDocumentationReader {
  private static readonly THIS_PARAMETER: string = "this";
  private static readonly HYPHEN: string = "-";
  private static readonly LICENSE_TAG: string = "license";

  private readonly api: ApiProgram;
  private readonly walker: ApiSymbolWalker;
  private readonly root: string;

  public constructor(api: ApiProgram, root: string) {
    this.api = api;
    this.walker = new ApiSymbolWalker(api);
    this.root = root;
  }

  public read(file: string, source: string): readonly string[] {
    const shown = path.relative(this.root, source).split(path.sep).join("/");
    const problems: string[] = [];
    this.walker.walk(file, (owner, _symbol, declarations) => this.inspect(shown, owner, declarations, problems));
    return problems;
  }

  private static isCallable(node: ts.Node): node is ts.SignatureDeclaration {
    return ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) || ts.isMethodSignature(node) || ts.isConstructorDeclaration(node)
      || ts.isCallSignatureDeclaration(node) || ts.isConstructSignatureDeclaration(node);
  }

  private static readDocs(node: ts.Node): readonly ts.JSDoc[] {
    return ApiValue.readOwnDocs(node).filter(t => !(t.tags ?? []).some(u => u.tagName.text === ApiDocumentationReader.LICENSE_TAG));
  }

  private static listParts(comment: string | ts.NodeArray<ts.JSDocComment> | undefined): readonly (string | ts.JSDocComment)[] {
    return comment === undefined ? [] : typeof comment === "string" ? [comment] : [...comment];
  }

  private static isEmpty(comment: string | ts.NodeArray<ts.JSDocComment> | undefined): boolean {
    return ApiDocumentationReader.listParts(comment).every(t => typeof t === "string" ? t.trim() === "" : t.kind === ts.SyntaxKind.JSDocText && t.text.trim() === "");
  }

  private static startsWithHyphen(comment: string | ts.NodeArray<ts.JSDocComment> | undefined): boolean {
    const first = ApiDocumentationReader.listParts(comment)[0];
    const text = first === undefined ? "" : typeof first === "string" ? first : first.kind === ts.SyntaxKind.JSDocText ? first.text : "";
    return text.startsWith(ApiDocumentationReader.HYPHEN);
  }

  private static isThrowing(result: ts.TypeNode | undefined): boolean {
    return result !== undefined && (result.kind === ts.SyntaxKind.NeverKeyword || ts.isTypePredicateNode(result) && result.assertsModifier !== undefined);
  }

  private static locate(shown: string, node: ts.Node): string {
    const file = node.getSourceFile();
    return `${shown}:${file.getLineAndCharacterOfPosition(node.getStart(file)).line + 1}`;
  }

  private static inspectSignature(shown: string, name: string, declaration: ts.SignatureDeclaration, docs: readonly ts.JSDoc[], problems: string[]): void {
    const at = ApiDocumentationReader.locate(shown, declaration);
    const tags = docs.flatMap(t => [...t.tags ?? []]);
    const documented = tags.filter(t => ts.isJSDocParameterTag(t)).map(t => t.name.getText());
    const parameters = declaration.parameters.map(t => t.name.getText()).filter(t => t !== ApiDocumentationReader.THIS_PARAMETER);
    for (const parameter of parameters.filter(t => !documented.includes(t)))
      problems.push(`${at}: ${name} has no @param for ${parameter}`);
    for (const parameter of documented.filter(t => !parameters.includes(t)))
      problems.push(`${at}: ${name} has a @param for ${parameter}, which is not a parameter`);
    if (ApiDocumentationReader.isThrowing(declaration.type)) {
      if (!tags.some(t => ts.isJSDocThrowsTag(t)))
        problems.push(`${at}: ${name} has no @throws, which its never or asserts result needs`);
      return;
    }
    const hasResult = declaration.type !== undefined && declaration.type.kind !== ts.SyntaxKind.VoidKeyword;
    const hasReturns = tags.some(t => ts.isJSDocReturnTag(t));
    if (hasResult && !hasReturns)
      problems.push(`${at}: ${name} has no @returns`);
    if (!hasResult && hasReturns)
      problems.push(`${at}: ${name} has a @returns, but no result`);
  }

  private inspect(shown: string, owner: string, declarations: readonly ts.Declaration[], problems: string[]): void {
    const callables = declarations.filter(t => ApiDocumentationReader.isCallable(t));
    for (const [index, declaration] of callables.entries()) {
      const name = callables.length === 1 ? owner : `${owner} overload ${index + 1}`;
      const docs = ApiDocumentationReader.readDocs(declaration);
      if (docs.length === 0)
        problems.push(`${ApiDocumentationReader.locate(shown, declaration)}: ${name} has no JSDoc`);
      else
        ApiDocumentationReader.inspectSignature(shown, name, declaration, docs, problems);
      this.inspectDocs(shown, name, docs, problems);
    }
    const others = declarations.filter(t => !ApiDocumentationReader.isCallable(t));
    const first = others[0];
    if (first !== undefined && others.every(t => ApiDocumentationReader.readDocs(t).length === 0))
      problems.push(`${ApiDocumentationReader.locate(shown, first)}: ${owner} has no JSDoc`);
    for (const declaration of others)
      this.inspectDocs(shown, owner, ApiDocumentationReader.readDocs(declaration), problems);
  }

  private inspectDocs(shown: string, name: string, docs: readonly ts.JSDoc[], problems: string[]): void {
    for (const doc of docs) {
      const file = doc.getSourceFile();
      if (file.getLineAndCharacterOfPosition(doc.getStart(file)).line === file.getLineAndCharacterOfPosition(doc.end).line)
        problems.push(`${ApiDocumentationReader.locate(shown, doc)}: ${name} has a single-line JSDoc`);
      if (ApiDocumentationReader.isEmpty(doc.comment) && (doc.tags ?? []).length === 0)
        problems.push(`${ApiDocumentationReader.locate(shown, doc)}: ${name} has an empty JSDoc`);
      const comments = [...ApiDocumentationReader.listParts(doc.comment)];
      for (const tag of doc.tags ?? []) {
        if (ApiDocumentationReader.isEmpty(tag.comment))
          problems.push(`${ApiDocumentationReader.locate(shown, tag)}: ${name} has an empty @${tag.tagName.text}`);
        else if (ts.isJSDocParameterTag(tag) && ApiDocumentationReader.startsWithHyphen(tag.comment))
          problems.push(`${ApiDocumentationReader.locate(shown, tag)}: ${name} has a hyphen after @param ${tag.name.getText()}`);
        comments.push(...ApiDocumentationReader.listParts(tag.comment));
        if (ts.isJSDocThrowsTag(tag) && tag.typeExpression !== undefined)
          this.inspectThrownTypes(shown, name, tag.typeExpression, problems);
      }
      for (const link of comments)
        if (typeof link !== "string")
          this.inspectLink(shown, name, link, problems);
    }
  }

  private inspectThrownTypes(shown: string, name: string, type: ts.Node, problems: string[]): void {
    const references: ts.Node[] = [];
    const collect = (node: ts.Node): undefined => {
      if (ts.isTypeReferenceNode(node))
        references.push(node.typeName);
      ts.forEachChild(node, collect);
    };
    collect(type);
    for (const reference of references) {
      const symbol = this.api.checker.getSymbolAtLocation(reference);
      if (symbol === undefined || (symbol.declarations ?? []).length === 0)
        problems.push(`${ApiDocumentationReader.locate(shown, reference)}: ${name} has a @throws type that does not resolve: ${reference.getText()}`);
    }
  }

  private inspectLink(shown: string, name: string, comment: ts.JSDocComment, problems: string[]): void {
    if (!ts.isJSDocLinkLike(comment))
      return;
    if (comment.name === undefined || this.api.checker.getSymbolAtLocation(comment.name) === undefined)
      problems.push(`${ApiDocumentationReader.locate(shown, comment)}: ${name} has a link that does not resolve: ${comment.getText()}`);
  }
}
