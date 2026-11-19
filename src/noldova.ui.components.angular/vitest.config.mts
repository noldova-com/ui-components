/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

import { defineConfig } from "vitest/config";

import { ClassMetadataCoverage } from "./tests/coverage/class-metadata-coverage.ts";
import { ClosedPort } from "./tests/network/closed-port.ts";
import { FailedModuleRequests } from "./tests/network/failed-module-requests.ts";
import { ScriptedRefusal } from "./tests/network/scripted-refusal.ts";
import { ShortScreenshotNames } from "./tests/screenshots/short-screenshot-names.ts";

const project = pathToFileURL(`${process.cwd()}/`);
const compilerOptions: { paths: Record<string, string[]> } = JSON.parse(readFileSync(new URL("./tsconfig.json", project), "utf8")).compilerOptions;
const wildcard = "*";
const special = /[.*+?^${}()|[\]\\]/gu;

const aliasOf = (name: string, target: string): { find: string | RegExp; replacement: string } => name.endsWith(wildcard)
  ? { find: new RegExp(`^${name.slice(0, -wildcard.length).replace(special, "\\$&")}(.*)$`, "u"), replacement: `${fileURLToPath(new URL(target.slice(0, -wildcard.length), project))}$1` }
  : { find: name, replacement: fileURLToPath(new URL(target, project)) };

const cacheDir = fileURLToPath(new URL("../../node_modules/.vite", import.meta.url));

// The specs' one hang limit, for tests and hooks: at least three times the slowest test in main's runs on any target, as README's Checks gives it. A
// test's time there includes its beforeEach and afterEach hooks. The beforeAll hooks, under the same limit and outside that figure, are the shared
// setup's media reset and the TypeScript grammar's warm, in every kit spec file, the two language specs' grammar loads and the tokenizer spec's
// first tokenizer, whose afterAll, the only one, disposes it; README gives the slowest. A test that reaches it is a bug to fix, never a reason to
// raise it.
const hangLimit = 30_000;
// Every poll's bound: half the hang limit, so a poll that never passes fails first, naming what it waited for, and stops before the test's limit.
const pollLimit = hangLimit / 2;

// The Angular builder makes each test project from this file's test, resolve, optimizeDeps and plugins alone, so the project's Vite cache comes from a plugin;
// "pre" sets it before Vitest adds its vitest/<project> folder under it.
export default defineConfig({
  plugins: [new ClassMetadataCoverage(), { name: "noldova:cache-dir", config: { order: "pre", handler: () => ({ cacheDir }) } }],
  resolve: {
    alias: Object.entries(compilerOptions.paths).map(([name, targets]) => aliasOf(name, String(targets[0])))
  },
  test: {
    api: { port: 24315 },
    // __vitest_screenshot replaces Vitest's own screenshot command, so a failure screenshot whose name is too long for a file still saves.
    browser: { commands: { watchFailedModuleRequests: new FailedModuleRequests().watch, closedPort: new ClosedPort().find, scriptedRefusal: new ScriptedRefusal().print,
      __vitest_screenshot: new ShortScreenshotNames().screenshot } },
    attachmentsDir: fileURLToPath(new URL("../../.vitest/attachments", import.meta.url)),
    expect: { poll: { timeout: pollLimit } },
    hookTimeout: hangLimit,
    testTimeout: hangLimit,
    coverage: {
      reportsDirectory: fileURLToPath(new URL("../../_build/angular-coverage", import.meta.url))
    }
  }
});
