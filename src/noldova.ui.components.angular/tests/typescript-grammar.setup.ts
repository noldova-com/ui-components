/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

// Loads the TypeScript grammar and the highlighter's modules before a spec file's first test, so the page's first TypeScript highlight doesn't fall
// on whichever test renders it, as README's timing section says. The code highlighter's specs and the code block's highlighting start specs check
// that first load, so they skip it and pay for it as an app does.
const loadSpecs = /[\\/](code-highlighter-[^\\/]*|code-block-highlighting-start\.component)\.spec\.ts$/;

beforeAll(async () => {
  if (loadSpecs.test(expect.getState().testPath ?? String.empty))
    return;
  await Promise.all([import("@shikijs/langs/typescript"), import("@shikijs/primitive"), import("@shikijs/engine-javascript")]);
});
