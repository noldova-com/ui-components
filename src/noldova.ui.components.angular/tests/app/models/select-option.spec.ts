/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { SelectOption } from "../../../src/app/models/select-option";

describe("SelectOption", () => {
  it("holds an option's value and the title it shows", () => {
    const option = new SelectOption("dark", "Dark");

    expect([option.value, option.title, option.tag, option.isDisabled]).toEqual(["dark", "Dark", null, false]);
  });

  it("can be shown without being chosen, when given so", () => {
    const option = new SelectOption("deep", "Deep", null, true);

    expect([option.value, option.title, option.tag, option.isDisabled]).toEqual(["deep", "Deep", null, true]);
  });

  it("holds the tag it shows after its title, when given one", () => {
    const option = new SelectOption("medium", "Medium", "Recommended");

    expect([option.value, option.title, option.tag]).toEqual(["medium", "Medium", "Recommended"]);
  });
});
