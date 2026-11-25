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
type Takes<T, V> = V extends T ? true : false;

class TypeCheck {
  public static takesNames<T>(known: Takes<T, "folder">, misspelt: Takes<T, "foldr">, text: Takes<T, string>): boolean {
    return known && !misspelt && !text;
  }
}

describe("IconName", () => {
  it("is a name of the icon list, and a misspelt name or any text is not", () => {
    const names: readonly IconName[] = IconNames.all;

    expect(names.includes("folder")).toBe(true);
    expect(TypeCheck.takesNames<IconName>(true, false, false)).toBe(true);
    expect(TypeCheck.takesNames<(typeof IconNames.all)[number]>(true, false, false)).toBe(true);
  });

  it("is what every input, model and constructor that takes an icon takes, so a misspelt name fails the type check", () => {
    const taken: readonly boolean[] = [
      TypeCheck.takesNames<ValueOf<IconButtonComponent["icon"]>>(true, false, false),
      TypeCheck.takesNames<ValueOf<MenuItemComponent["icon"]>>(true, false, false),
      TypeCheck.takesNames<ValueOf<QuickInputComponent["icon"]>>(true, false, false),
      TypeCheck.takesNames<ValueOf<SectionHeaderComponent["icon"]>>(true, false, false),
      TypeCheck.takesNames<ValueOf<SplitButtonComponent["icon"]>>(true, false, false),
      TypeCheck.takesNames<ValueOf<TabComponent["icon"]>>(true, false, false),
      TypeCheck.takesNames<ValueOf<TabComponent["imageGlyph"]>>(true, false, false),
      TypeCheck.takesNames<ValueOf<TextFieldBoxComponent["icon"]>>(true, false, false),
      TypeCheck.takesNames<ValueOf<ToolbarButtonComponent["icon"]>>(true, false, false),
      TypeCheck.takesNames<ValueOf<IconChooserComponent["value"]>>(true, false, false),
      TypeCheck.takesNames<ValueOf<IconChooserComponent["names"]>[number]>(true, false, false),
      TypeCheck.takesNames<ConstructorParameters<typeof SelectOption>[4]>(true, false, false),
      TypeCheck.takesNames<SelectOption["icon"]>(true, false, false),
      TypeCheck.takesNames<ConstructorParameters<typeof QuickInputItem>[2]>(true, false, false),
      TypeCheck.takesNames<ConstructorParameters<typeof TreeNode>[2]>(true, false, false),
      TypeCheck.takesNames<Parameters<typeof TreeNode.open>[2]>(true, false, false),
      TypeCheck.takesNames<ConstructorParameters<typeof LinkReferenceAction>[2]>(true, false, false),
      TypeCheck.takesNames<ConstructorParameters<typeof TabMarker>[0]>(true, false, false),
      TypeCheck.takesNames<ConstructorParameters<typeof TabStatus>[0]>(true, false, false)
    ];

    expect(taken.every(t => t)).toBe(true);
  });
});
