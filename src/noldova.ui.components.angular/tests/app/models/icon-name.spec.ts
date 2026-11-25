/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { InputSignal, ModelSignal } from "@angular/core";

import { IconButtonComponent } from "../../../src/app/components/icon-button/icon-button.component";
import { IconChooserComponent } from "../../../src/app/components/icon-chooser/icon-chooser.component";
import { MenuItemComponent } from "../../../src/app/components/menu/menu-item.component";
import { QuickInputComponent } from "../../../src/app/components/quick-input/quick-input.component";
import { SectionHeaderComponent } from "../../../src/app/components/section-header/section-header.component";
import { SplitButtonComponent } from "../../../src/app/components/split-button/split-button.component";
import { TabComponent } from "../../../src/app/components/tab/tab.component";
import { TextFieldBoxComponent } from "../../../src/app/components/text-field/text-field-box.component";
import { ToolbarButtonComponent } from "../../../src/app/components/toolbar-button/toolbar-button.component";
import type { IconName } from "../../../src/app/models/icon-name";
import { IconNames } from "../../../src/app/models/icon-names";
import { LinkReferenceAction } from "../../../src/app/models/link-reference-action";
import { QuickInputItem } from "../../../src/app/models/quick-input-item";
import { SelectOption } from "../../../src/app/models/select-option";
import { TabMarker } from "../../../src/app/models/tab-marker";
import { TabStatus } from "../../../src/app/models/tab-status";
import { TreeNode } from "../../../src/app/models/tree.node";

type ValueOf<T> = T extends ModelSignal<infer V> ? V : T extends InputSignal<infer V> ? V : never;
type Takes<T, V> = [V] extends [T] ? true : false;
type TakenBy<V> = [
  Takes<ValueOf<IconButtonComponent["icon"]>, V>,
  Takes<ValueOf<MenuItemComponent["icon"]>, V>,
  Takes<ValueOf<QuickInputComponent["icon"]>, V>,
  Takes<ValueOf<SectionHeaderComponent["icon"]>, V>,
  Takes<ValueOf<SplitButtonComponent["icon"]>, V>,
  Takes<ValueOf<TabComponent["icon"]>, V>,
  Takes<ValueOf<TabComponent["imageGlyph"]>, V>,
  Takes<ValueOf<TextFieldBoxComponent["icon"]>, V>,
  Takes<ValueOf<ToolbarButtonComponent["icon"]>, V>,
  Takes<ValueOf<IconChooserComponent["value"]>, V>,
  Takes<ValueOf<IconChooserComponent["names"]>, readonly V[]>,
  Takes<ConstructorParameters<typeof SelectOption>[4], V>,
  Takes<SelectOption["icon"], V>,
  Takes<ConstructorParameters<typeof QuickInputItem>[2], V>,
  Takes<ConstructorParameters<typeof TreeNode>[2], V>,
  Takes<Parameters<typeof TreeNode.open>[2], V>,
  Takes<ConstructorParameters<typeof LinkReferenceAction>[2], V>,
  Takes<ConstructorParameters<typeof TabMarker>[0], V>,
  Takes<ConstructorParameters<typeof TabStatus>[0], V>,
  Takes<(typeof IconNames.all)[number], V>
];

describe("IconName", () => {
  it("is a name of the icon list, and a misspelt name or any text is not", () => {
    const names: readonly IconName[] = IconNames.all;
    const shown: [Takes<IconName, "folder">, Takes<IconName, "foldr">, Takes<IconName, string>] = [true, false, false];

    expect([names.includes("folder"), ...shown]).toEqual([true, true, false, false]);
  });

  it("is what every input, model and constructor that takes an icon takes, so a misspelt name fails the type check", () => {
    const known: TakenBy<"folder"> = [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true];
    const misspelt: TakenBy<"foldr"> = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];

    expect([known.every(t => t), misspelt.some(t => t)]).toEqual([true, false]);
  });
});
