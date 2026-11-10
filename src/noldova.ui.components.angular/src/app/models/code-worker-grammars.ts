/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { LanguageRegistration } from "@shikijs/primitive/types";

import typescriptGrammar from "@shikijs/langs/typescript";
import javascriptGrammar from "@shikijs/langs/javascript";
import tsxGrammar from "@shikijs/langs/tsx";
import jsxGrammar from "@shikijs/langs/jsx";
import jsonGrammar from "@shikijs/langs/json";
import jsoncGrammar from "@shikijs/langs/jsonc";
import yamlGrammar from "@shikijs/langs/yaml";
import tomlGrammar from "@shikijs/langs/toml";
import shellscriptGrammar from "@shikijs/langs/shellscript";
import powershellGrammar from "@shikijs/langs/powershell";
import batGrammar from "@shikijs/langs/bat";
import pythonGrammar from "@shikijs/langs/python";
import goGrammar from "@shikijs/langs/go";
import rustGrammar from "@shikijs/langs/rust";
import javaGrammar from "@shikijs/langs/java";
import kotlinGrammar from "@shikijs/langs/kotlin";
import cGrammar from "@shikijs/langs/c";
import csharpGrammar from "@shikijs/langs/csharp";
import swiftGrammar from "@shikijs/langs/swift";
import phpGrammar from "@shikijs/langs/php";
import sqlGrammar from "@shikijs/langs/sql";
import htmlGrammar from "@shikijs/langs/html";
import cssGrammar from "@shikijs/langs/css";
import scssGrammar from "@shikijs/langs/scss";
import markdownGrammar from "@shikijs/langs/markdown";
import xmlGrammar from "@shikijs/langs/xml";
import dockerGrammar from "@shikijs/langs/docker";
import diffGrammar from "@shikijs/langs/diff";
import iniGrammar from "@shikijs/langs/ini";
import graphqlGrammar from "@shikijs/langs/graphql";
import luaGrammar from "@shikijs/langs/lua";
import rGrammar from "@shikijs/langs/r";
import makeGrammar from "@shikijs/langs/make";

export class CodeWorkerGrammars {
  public static readonly byId: ReadonlyMap<string, readonly LanguageRegistration[]> = new Map([
    ["typescript", typescriptGrammar],
    ["javascript", javascriptGrammar],
    ["tsx", tsxGrammar],
    ["jsx", jsxGrammar],
    ["json", jsonGrammar],
    ["jsonc", jsoncGrammar],
    ["yaml", yamlGrammar],
    ["toml", tomlGrammar],
    ["shellscript", shellscriptGrammar],
    ["powershell", powershellGrammar],
    ["bat", batGrammar],
    ["python", pythonGrammar],
    ["go", goGrammar],
    ["rust", rustGrammar],
    ["java", javaGrammar],
    ["kotlin", kotlinGrammar],
    ["c", cGrammar],
    ["csharp", csharpGrammar],
    ["swift", swiftGrammar],
    ["php", phpGrammar],
    ["sql", sqlGrammar],
    ["html", htmlGrammar],
    ["css", cssGrammar],
    ["scss", scssGrammar],
    ["markdown", markdownGrammar],
    ["xml", xmlGrammar],
    ["docker", dockerGrammar],
    ["diff", diffGrammar],
    ["ini", iniGrammar],
    ["graphql", graphqlGrammar],
    ["lua", luaGrammar],
    ["r", rGrammar],
    ["make", makeGrammar]
  ]);
}
