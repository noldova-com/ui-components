/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fs from "node:fs/promises";
import path from "node:path";

import CommandFailedException from "../../noldova.ui.components.angular/scripts/command-failed.exception.ts";
import Config from "../../noldova.ui.components.angular/scripts/config.ts";
import Script from "../../noldova.ui.components.angular/scripts/script.ts";
import { AngularCoverageReport } from "../../noldova.ui.components.angular/scripts/angular/angular-coverage-report.ts";
import { AngularTestReport } from "../../noldova.ui.components.angular/scripts/angular/angular-test-report.ts";
import { DocsSiteCheck } from "./docs-site-check.ts";
import { DocsPreparation } from "./docs/docs-preparation.ts";

export class TestDocs extends Script {
  private static readonly ANGULAR_PROJECT: string = "docs";
  private static readonly ROOT: string = path.resolve(Config.ROOT);
  private static readonly ANGULAR_CLI_PATH: string = path.join(TestDocs.ROOT, "node_modules/@angular/cli/bin/ng.js");
  private static readonly ANGULAR_TEST_ARGUMENTS: readonly string[] = ["test", TestDocs.ANGULAR_PROJECT, "--reporters=default", "--reporters=json", "--output-file"];
  private static readonly REPORT_FILE: string = "../../_build/docs-tests.json";
  private static readonly DEPENDENCY_CACHE: string = "../../node_modules/.vite";
  private static readonly COVERAGE_FILE: string = "../../_build/angular-coverage/coverage-final.json";
  private static readonly COVERAGE_OWNER: string = "The docs site's";
  private static readonly BLANK_LINE: string = "";
  private static readonly WORKSPACE_FOLDER: string = ".";
  private static readonly PLATFORM: NodeJS.Platform = "linux";
  private static readonly SUITE_OPTION: string = "--suite";
  private static readonly ACCEPTED_OPTIONS: readonly string[] = [TestDocs.SUITE_OPTION, "--skip-test-details", "--skip-coverage-details"];
  private static readonly BUILD_SCRIPT: string = "scripts/build-docs.ts";
  private static readonly SKIPPED_OFF_PLATFORM: string = "The docs site's build and tests run only on Linux; skipped.";
  private static readonly SKIPPED_FILTERED: string = "The docs site's build and tests skipped for a filtered run.";

  public override async runAsync(): Promise<void> {
    const arguments_ = process.argv.slice(2);
    if (arguments_.includes(TestDocs.SUITE_OPTION)) {
      if (process.platform !== TestDocs.PLATFORM) {
        await this.writeLogAsync(TestDocs.SKIPPED_OFF_PLATFORM);
        return;
      }
      if (arguments_.some(t => !TestDocs.ACCEPTED_OPTIONS.includes(t))) {
        await this.writeLogAsync(TestDocs.SKIPPED_FILTERED);
        return;
      }
      await this.executeProcessAsync(process.execPath, [path.resolve(TestDocs.BUILD_SCRIPT)], process.cwd());
    }
    await new DocsPreparation(TestDocs.ROOT).prepareAsync(process.stdout);
    const report = new AngularTestReport(TestDocs.WORKSPACE_FOLDER, TestDocs.ANGULAR_PROJECT);
    const specs = await report.listSpecFilesAsync();
    const file = path.resolve(TestDocs.REPORT_FILE);
    const coverage = new AngularCoverageReport(TestDocs.WORKSPACE_FOLDER, TestDocs.COVERAGE_FILE, TestDocs.COVERAGE_OWNER);
    await fs.rm(file, { force: true });
    await fs.rm(coverage.path, { force: true });
    await fs.rm(TestDocs.DEPENDENCY_CACHE, { recursive: true, force: true });
    let failed = false;
    try {
      await this.executeProcessAsync(process.execPath, [TestDocs.ANGULAR_CLI_PATH, ...TestDocs.ANGULAR_TEST_ARGUMENTS, file], TestDocs.WORKSPACE_FOLDER);
    }
    catch (error) {
      if (!(error instanceof CommandFailedException))
        throw error;
      failed = true;
    }
    const findings = [...await report.checkAsync(file, specs), ...await coverage.listUnhitAsync()];
    for (const finding of findings)
      await this.writeLogAsync(finding);
    const site = new DocsSiteCheck(TestDocs.ROOT);
    await this.writeLogAsync(TestDocs.BLANK_LINE);
    await this.writeLogAsync(site.title);
    const isSiteSound = await site.runAsync(process.stdout);
    if (failed || findings.length > 0 || !isSiteSound)
      process.exitCode = 1;
  }
}

const test = new TestDocs();
await test.runAsEntryPointAsync();
