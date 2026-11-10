/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { Writable } from "node:stream";

import type { ICheck } from "./interfaces/i-check.ts";

export class NativeElementAssertionCheck implements ICheck {
  private static readonly TESTS: string = "src/noldova.ui.components.angular/tests";
  private static readonly SOURCE: RegExp = /\.ts$/;
  private static readonly CALL: string = String.raw`\((?:[^()]|\([^()]*\))*\)`;
  private static readonly STEP: string = String.raw`(?:\s*(?:\??\.[\w$]+|${NativeElementAssertionCheck.CALL}|\[[^\]]*\]))`;
  private static readonly CHAIN: string = String.raw`[\w$]+${NativeElementAssertionCheck.STEP}*?\.nativeElement`;
  private static readonly QUERY: string =
    String.raw`(?:\[\.\.\.)?${NativeElementAssertionCheck.CHAIN}${NativeElementAssertionCheck.STEP}*?\.querySelector(?:All)?\s*${NativeElementAssertionCheck.CALL}\]?`;
  private static readonly TYPE: string = String.raw`(?!unknown\b)[A-Za-z_$][\w$<>|.[\]\s]*`;
  private static readonly END: string = String.raw`\s*(?:[;,)]|$)`;
  private static readonly READS: readonly RegExp[] = [
    /\bnativeElement\b\s*\)*\s*as\s+(?!const\b)\w/,
    new RegExp(String.raw`<\s*${NativeElementAssertionCheck.TYPE}>\s*${NativeElementAssertionCheck.CHAIN}\b`),
    new RegExp(String.raw`:\s*${NativeElementAssertionCheck.TYPE}=(?![=>])\s*${NativeElementAssertionCheck.CHAIN}${NativeElementAssertionCheck.END}`),
    new RegExp(String.raw`\):\s*${NativeElementAssertionCheck.TYPE}=>\s*${NativeElementAssertionCheck.CHAIN}${NativeElementAssertionCheck.END}`),
    new RegExp(String.raw`\breturn\s+${NativeElementAssertionCheck.CHAIN}\s*;`),
    new RegExp(String.raw`(?:^|[;{])\s*[\w$.]+(?:\[[^\]]*\])?\s*=(?![=>])\s*${NativeElementAssertionCheck.CHAIN}${NativeElementAssertionCheck.END}`),
    new RegExp(String.raw`\.querySelector(?:All)?\s*(?:<[^>]*>)?\s*${NativeElementAssertionCheck.CALL}\s*!?\s*(?:,[^[\];]*\])?\s*[)\]!]*\s*as\s+(?!const\b)[\w$[]`),
    new RegExp(String.raw`:\s*${NativeElementAssertionCheck.TYPE}=(?![=>])\s*${NativeElementAssertionCheck.QUERY}${NativeElementAssertionCheck.END}`),
    new RegExp(String.raw`\):\s*${NativeElementAssertionCheck.TYPE}=>\s*${NativeElementAssertionCheck.QUERY}${NativeElementAssertionCheck.END}`),
    new RegExp(String.raw`\breturn\s+${NativeElementAssertionCheck.QUERY}\s*;`),
    new RegExp(
      String.raw`(?<![\w$)\]])<\s*${NativeElementAssertionCheck.TYPE}>\s*[(\[.\s]*[\w$]+${NativeElementAssertionCheck.STEP}*?\??\.querySelector(?:All)?\b`
    ),
    /^\s*[)\]]*\s*as\s+(?!const\b)[A-Za-z_$[]/,
    /^(?!\s*(?:\/\/|\/?\*)).*[\w$)\]]\s+as\s*$/
  ];
  private static readonly ENCODING: BufferEncoding = "utf8";

  private readonly root: string;

  public readonly title: string = "nativeElement assertions";

  public constructor(root: string) {
    this.root = root;
  }

  public async runAsync(output: Writable): Promise<boolean> {
    const folder = path.join(this.root, NativeElementAssertionCheck.TESTS);
    const files = (await readdir(folder, { recursive: true })).filter(t => NativeElementAssertionCheck.SOURCE.test(t)).sort();
    const findings: string[] = [];
    for (const file of files) {
      const lines = (await readFile(path.join(folder, file), NativeElementAssertionCheck.ENCODING)).split("\n");
      lines.forEach((line, index) => {
        if (NativeElementAssertionCheck.READS.some(t => t.test(line)))
          findings.push(`${path.posix.join(NativeElementAssertionCheck.TESTS, file.split(path.sep).join(path.posix.sep))}:${index + 1}`);
      });
    }
    for (const finding of findings)
      output.write(`${finding} takes a fixture's nativeElement or a query's result as a type unchecked; read it with DomFixture's host, one, oneOf, maybe or all instead.\n`);
    output.write(`Read ${files.length} files under ${NativeElementAssertionCheck.TESTS} for an unchecked nativeElement or query read.\n`);
    return findings.length === 0;
  }
}
