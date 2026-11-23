/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";
import type { MarkdownIt } from "markdown-it";

import { MarkdownParser } from "../../src/app/services/markdown.parser";

export class LoadedMarkdownParser {
  public static async ofAsync(): Promise<MarkdownIt> {
    const parser = await TestBed.inject(MarkdownParser).parserAsync();
    if (Object.isNull(parser))
      throw new Error("The Markdown parser didn't load.");
    return parser;
  }
}
