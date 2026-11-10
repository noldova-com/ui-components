/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { DocsKey } from "../docs-key.js";

export class AvatarPageResources {
  public static readonly title: string = "Avatar";
  public static readonly componentName: string = "AvatarComponent";
  public static readonly avatarPeopleTitle: string = "Avatars beside the names they stand for";
  public static readonly avatarAloneTitle: string = "Avatars shown alone, named by their names";
  public static readonly keys: readonly DocsKey[] = [];
  public static readonly roles: readonly string[] = [
    "Shown alone, an avatar has the img role and is named by its name, or by the label its owner gives.",
    "Beside the name it stands for, its owner makes it decorative, and it is hidden from assistive technology; with a blank name and no label it is hidden too.",
    "An unavailable avatar is read as its name followed by “, unavailable”, since its dimmed look alone would not say so.",
    "An image avatar's picture has an empty alt text, so the avatar's own name is read once.",
    "It takes no focus and has no hover of its own; the control around it, such as a row, gives those."
  ];
}
