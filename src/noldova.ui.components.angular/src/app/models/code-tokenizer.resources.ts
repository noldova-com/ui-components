/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CodeTokenKind } from "../enums/code-token-kind.js";

export class CodeTokenizerResources {
  public static readonly codePlainMarker: string = "plain";
  public static readonly codeLineLengthLimit: number = 2000;
  public static readonly codeWarmingSample: string = "import { a } from \"b\";\nexport interface C { readonly d: number; }\nconst e = { f: [1, \"g\", `h${i}`] }; // j\nfunction k(l: string): void { if (l.length > 0) { return; } }\n";
  public static readonly codeCarriageReturn: string = "\r";
  public static readonly codeSettledLinesKept: number = 8;
  public static readonly codePlainScopes: readonly string[] = ["keyword.operator", "punctuation"];
  public static readonly codeTokenScopes: Readonly<Record<CodeTokenKind, readonly string[]>> = {
    [CodeTokenKind.Comment]: ["comment", "punctuation.definition.comment"],
    [CodeTokenKind.Keyword]: ["keyword", "storage", "constant.language", "variable.language", "keyword.operator.new", "keyword.operator.expression", "keyword.operator.word",
      "keyword.operator.wordlike", "keyword.operator.logical.python"],
    [CodeTokenKind.Control]: ["keyword.control"],
    [CodeTokenKind.String]: ["string", "punctuation.definition.string", "markup.deleted"],
    [CodeTokenKind.Number]: ["constant.numeric", "keyword.other.unit", "markup.inserted"],
    [CodeTokenKind.Type]: ["entity.name.type", "entity.name.class", "entity.name.namespace", "entity.other.inherited-class", "support.type", "support.class"],
    [CodeTokenKind.Function]: ["entity.name.function", "support.function"],
    [CodeTokenKind.Variable]: ["variable", "meta.object-literal.key", "support.variable", "support.type.property-name", "entity.other.attribute-name"],
    [CodeTokenKind.Regex]: ["string.regexp"],
    [CodeTokenKind.Meta]: ["meta.preprocessor", "punctuation.decorator", "entity.name.tag", "markup.heading", "entity.name.section", "meta.diff.header", "meta.diff.range"]
  };
}
