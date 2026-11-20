/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

import { ShortScreenshotNames } from "../../screenshots/short-screenshot-names.ts";

// The Failure screenshots check's run: Vitest's own browser mode, outside the Angular builder, on one test that fails with a title too long for a
// file name, so its failure screenshot goes through the same command the kit's vitest.config.mts puts in place of Vitest's.
export default defineConfig({
  test: {
    include: ["long-title.fixture.ts"],
    attachmentsDir: process.env["NOLDOVA_FAILURE_SCREENSHOT_ATTACHMENTS"],
    api: { port: 24315, host: "127.0.0.1" },
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
      commands: { __vitest_screenshot: new ShortScreenshotNames().screenshot }
    }
  }
});
