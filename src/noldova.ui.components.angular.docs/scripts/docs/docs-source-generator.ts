/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { DocsExampleFile } from "./docs-example-file.ts";
import { DocsModuleWriter } from "./docs-module-writer.ts";

export class DocsSourceGenerator {
  public static readonly GENERATED_FOLDER: string = "_build/docs-generated";

  private static readonly COMPONENTS_FOLDER: string = "src/noldova.ui.components.angular.docs/src/app/components";
  private static readonly INDEX_FILE: string = "src/noldova.ui.components.angular.docs/src/index.html";
  private static readonly BASE_STYLES_FILE: string = "src/noldova.ui.components.angular/src/styles/base.css";
  private static readonly KIT_DOCUMENTS_FOLDER: string = "documents/kit";
  private static readonly EXAMPLES_FOLDER: string = "examples";
  private static readonly DOCUMENTS_FOLDER: string = "documents";
  private static readonly INDEX_MODULE: string = "index-page.ts";
  private static readonly BASE_STYLES_MODULE: string = "kit-base-styles.ts";
  private static readonly MODULE_EXTENSION: string = ".ts";
  private static readonly DOCUMENT_EXTENSION: string = ".md";
  private static readonly EXAMPLE_SUFFIX: string = "-example";
  private static readonly EXAMPLE_EXPORT: string = "exampleFiles";
  private static readonly DOCUMENT_EXPORT: string = "kitDocument";
  private static readonly INDEX_EXPORT: string = "indexPage";
  private static readonly BASE_STYLES_EXPORT: string = "kitBaseStyles";
  private static readonly REPOSITORY_FILES: string = "https://github.com/noldova-com/ui-components/blob/main";
  private static readonly LANGUAGES: ReadonlyMap<string, string> = new Map([[".html", "html"], [".ts", "typescript"], [".css", "css"]]);
  private static readonly LICENSE_HEADER: RegExp = /^(?:\/\*\*[\s\S]*?@license[\s\S]*?\*\/|<!--[\s\S]*?@license[\s\S]*?-->)\s*/u;
  private static readonly DOCUMENT_TITLE: RegExp = /^# [^\n]*\n+/u;
  private static readonly RELATIVE_LINK: RegExp = /\]\((?!https?:|#)([^)\s]+)\)/gu;
  private static readonly TEXT_ENCODING: BufferEncoding = "utf8";

  private readonly root: string;
  private readonly writer: DocsModuleWriter;

  public constructor(root: string) {
    this.root = root;
    this.writer = new DocsModuleWriter(root);
  }

  public async writeExamplesAsync(): Promise<number> {
    const folder = path.join(this.root, DocsSourceGenerator.COMPONENTS_FOLDER);
    const names = (await readdir(folder, { withFileTypes: true }))
      .filter(t => t.isDirectory() && t.name.endsWith(DocsSourceGenerator.EXAMPLE_SUFFIX))
      .map(t => t.name)
      .sort();
    for (const name of names)
      await this.writer.writeAsync(DocsSourceGenerator.locate(DocsSourceGenerator.EXAMPLES_FOLDER, `${name}${DocsSourceGenerator.MODULE_EXTENSION}`),
        DocsSourceGenerator.EXAMPLE_EXPORT, await this.readExampleAsync(path.join(folder, name)));
    return names.length;
  }

  public async writeDocumentsAsync(): Promise<number> {
    const files = (await readdir(path.join(this.root, DocsSourceGenerator.KIT_DOCUMENTS_FOLDER)))
      .filter(t => path.extname(t) === DocsSourceGenerator.DOCUMENT_EXTENSION)
      .sort();
    for (const file of files) {
      const text = await readFile(path.join(this.root, DocsSourceGenerator.KIT_DOCUMENTS_FOLDER, file), DocsSourceGenerator.TEXT_ENCODING);
      const name = `${path.basename(file, DocsSourceGenerator.DOCUMENT_EXTENSION)}${DocsSourceGenerator.MODULE_EXTENSION}`;
      await this.writer.writeAsync(DocsSourceGenerator.locate(DocsSourceGenerator.DOCUMENTS_FOLDER, name), DocsSourceGenerator.DOCUMENT_EXPORT, DocsSourceGenerator.formatDocument(text));
    }
    return files.length;
  }

  public async writeIndexAsync(): Promise<void> {
    const index = await readFile(path.join(this.root, DocsSourceGenerator.INDEX_FILE), DocsSourceGenerator.TEXT_ENCODING);
    await this.writer.writeAsync(DocsSourceGenerator.locate(DocsSourceGenerator.INDEX_MODULE), DocsSourceGenerator.INDEX_EXPORT, index);
  }

  public async writeBaseStylesAsync(): Promise<void> {
    const styles = await readFile(path.join(this.root, DocsSourceGenerator.BASE_STYLES_FILE), DocsSourceGenerator.TEXT_ENCODING);
    await this.writer.writeAsync(DocsSourceGenerator.locate(DocsSourceGenerator.BASE_STYLES_MODULE), DocsSourceGenerator.BASE_STYLES_EXPORT,
      styles.replace(DocsSourceGenerator.LICENSE_HEADER, "").trimEnd());
  }

  private static locate(...parts: readonly string[]): string {
    return path.posix.join(DocsSourceGenerator.GENERATED_FOLDER, ...parts);
  }

  private static formatDocument(text: string): string {
    return text.replace(DocsSourceGenerator.DOCUMENT_TITLE, "").replace(DocsSourceGenerator.RELATIVE_LINK, (_link: string, target: string) =>
      `](${DocsSourceGenerator.REPOSITORY_FILES}/${path.posix.join(DocsSourceGenerator.KIT_DOCUMENTS_FOLDER, target)})`).trimEnd();
  }

  private async readExampleAsync(folder: string): Promise<readonly DocsExampleFile[]> {
    const files = (await readdir(folder)).sort();
    const sources: DocsExampleFile[] = [];
    for (const [extension, language] of DocsSourceGenerator.LANGUAGES)
      for (const file of files.filter(t => path.extname(t) === extension)) {
        const text = await readFile(path.join(folder, file), DocsSourceGenerator.TEXT_ENCODING);
        sources.push(new DocsExampleFile(file, language, text.replace(DocsSourceGenerator.LICENSE_HEADER, "").trimEnd()));
      }
    return sources;
  }
}
