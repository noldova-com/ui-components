/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as typography from "@noldova/ui.components.angular/typography";

import * as kit from "../../src/api/index";

describe("the kit's typography entry", () => {
  it("publishes the typography, its painter, its sizing and the theme mode, the same classes as the kit's API", () => {
    expect({ ...typography }).toEqual({ ThemeMode: kit.ThemeMode, Typography: kit.Typography, TypographyPainter: kit.TypographyPainter, TypographySizing: kit.TypographySizing });
  });
});
