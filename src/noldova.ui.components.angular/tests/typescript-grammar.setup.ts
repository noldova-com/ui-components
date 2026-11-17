/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import { TypeScriptGrammarFixture } from "./fixtures/typescript-grammar.fixture";

// Highlights a TypeScript sample once a page, through the highlighter's own tokenizer, before a spec file's first test, so the page's first
// TypeScript highlight doesn't fall on whichever test renders it, as README's timing section says. The code highlighter's specs and the code block's
// highlighting start spec check that first load, so they skip it, and pay for it unless an earlier file on their page has already warmed it.
const loadSpecs = /[\\/](code-highlighter-[^\\/]*|code-block-highlighting-start\.component)\.spec\.ts$/;

beforeAll(async () => {
  if (!loadSpecs.test(expect.getState().testPath ?? String.empty))
    await TypeScriptGrammarFixture.warmAsync();
});
