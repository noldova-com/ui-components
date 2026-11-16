/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";

import { CodeHighlighterTokens } from "../../../src/app/models/code-highlighter-tokens";
import { CodeHighlighter } from "../../../src/app/services/code-highlighter";
import { CodeHighlightingFixture } from "../../../src/testing/models/code-highlighting-fixture";
import { CodeHighlighterFixture } from "../../fixtures/code-highlighter.fixture";

describe("CodeHighlighter", () => {
  const { languageShares, sampleResultsAsync } = CodeHighlighterFixture;

  beforeEach(() => TestBed.configureTestingModule({ providers: [{ provide: CodeHighlighterTokens.tokenizeTimeLimit, useValue: 0 }, CodeHighlightingFixture.sharedShiki] }));

  // One test per language, since each loads its own grammar, the most of a test's time.
  it.each(languageShares.compiled)("colors a sample of %s, of its compiled share, each token at its place in the sample", async language => {
    expect(await sampleResultsAsync(TestBed.inject(CodeHighlighter), [language])).toEqual([[language, true, true]]);
  });
});
