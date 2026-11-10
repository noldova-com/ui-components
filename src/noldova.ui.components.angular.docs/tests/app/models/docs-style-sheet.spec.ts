/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsTokenGroup } from "../../../src/app/enums/docs-token-group.js";
import { DocsStyleSheet } from "../../../src/app/models/docs-style-sheet.js";
import { DocsTokenPrefixes } from "../../../src/app/models/docs-token-prefixes.js";

describe("DocsStyleSheet", () => {
  const prefixes = new DocsTokenPrefixes(new Map([["--nol-text-", DocsTokenGroup.Typography]]), DocsTokenGroup.Metrics);
  const text = [
    ":root {",
    "  --nol-text-panel: 0.8125rem;",
    "  --nol-pointer-target: 24px;",
    "}",
    "",
    ":root,",
    ".nol-theme-scope {",
    "  --nol-text-tab: var(--nol-text-muted);",
    "}",
    "",
    "body {",
    "  --nol-body-only: 1px;",
    "  color: var(--nol-text);",
    "}",
    "",
    "@keyframes nol-sample {",
    "  from {",
    "    opacity: 0;",
    "  }",
    "}"
  ].join("\n");

  it("reads the tokens the root declares, grouped by their prefix, and those a theme scope shares as built from other tokens", () => {
    const tokens = new DocsStyleSheet(text, prefixes).tokens;

    expect(tokens.map(t => [t.variable, t.group, t.light, t.dark])).toEqual([
      ["--nol-text-panel", DocsTokenGroup.Typography, "0.8125rem", "0.8125rem"],
      ["--nol-pointer-target", DocsTokenGroup.Metrics, "24px", "24px"],
      ["--nol-text-tab", DocsTokenGroup.Derived, "var(--nol-text-muted)", "var(--nol-text-muted)"]
    ]);
  });

  it("reads no token from a sheet without a root rule", () => {
    expect(new DocsStyleSheet("body {\n  --nol-body-only: 1px;\n}", prefixes).tokens).toEqual([]);
  });
});
