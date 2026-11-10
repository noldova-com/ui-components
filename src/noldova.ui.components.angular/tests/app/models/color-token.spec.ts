/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ThemeMode } from "../../../src/app/enums/theme-mode";
import { ColorToken } from "../../../src/app/models/color-token";
import { Theme } from "../../../src/app/models/theme";

describe("ColorToken", () => {
  const theme = new Theme(
    "fixture.partial",
    "Partial",
    new Map([["raised", "#101010"], ["text", "#202020"]]),
    new Map([["dialog", "#303030"]]),
    new Map(),
    new Map());

  it("resolves its key, then its fallback key, and nothing when the theme has neither", () => {
    const dialog = new ColorToken("--nol-dialog", "dialog", "raised");
    const text = new ColorToken("--nol-text", "text");

    expect(dialog.variable).toBe("--nol-dialog");
    expect(dialog.key).toBe("dialog");
    expect(dialog.fallbackKey).toBe("raised");
    expect(text.fallbackKey).toBeNull();
    expect(dialog.resolve(theme, ThemeMode.Dark)).toBe("#303030");
    expect(dialog.resolve(theme, ThemeMode.Light)).toBe("#101010");
    expect(text.resolve(theme, ThemeMode.Light)).toBe("#202020");
    expect(text.resolve(theme, ThemeMode.Dark)).toBeUndefined();
    expect(new ColorToken("--nol-code", "code", "window").resolve(theme, ThemeMode.Light)).toBeUndefined();
  });
});
