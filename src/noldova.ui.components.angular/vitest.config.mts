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

const project = pathToFileURL(`${process.cwd()}/`);
const compilerOptions: { paths: Record<string, string[]> } = JSON.parse(readFileSync(new URL("./tsconfig.json", project), "utf8")).compilerOptions;
const wildcard = "*";
const special = /[.*+?^${}()|[\]\\]/gu;

const aliasOf = (name: string, target: string): { find: string | RegExp; replacement: string } => name.endsWith(wildcard)
  ? { find: new RegExp(`^${name.slice(0, -wildcard.length).replace(special, "\\$&")}(.*)$`, "u"), replacement: `${fileURLToPath(new URL(target.slice(0, -wildcard.length), project))}$1` }
  : { find: name, replacement: fileURLToPath(new URL(target, project)) };

const cacheDir = fileURLToPath(new URL("../../node_modules/.vite", import.meta.url));

// The Angular builder makes each test project from this file's test, resolve, optimizeDeps and plugins alone, so the project's Vite cache comes from a plugin;
// "pre" sets it before Vitest adds its vitest/<project> folder under it.
export default defineConfig({
  plugins: [new ClassMetadataCoverage(), { name: "noldova:cache-dir", config: { order: "pre", handler: () => ({ cacheDir }) } }],
  resolve: {
    alias: Object.entries(compilerOptions.paths).map(([name, targets]) => aliasOf(name, String(targets[0])))
  },
  test: {
    api: { port: 24315 },
    attachmentsDir: fileURLToPath(new URL("../../.vitest/attachments", import.meta.url)),
    coverage: {
      reportsDirectory: fileURLToPath(new URL("../../_build/angular-coverage", import.meta.url))
    }
  }
});
