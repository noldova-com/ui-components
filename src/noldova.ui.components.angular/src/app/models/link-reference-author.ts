/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class LinkReferenceAuthor {
  public readonly name: string;
  public readonly image: string | null;

  public constructor(name: string, image: string | null = null) {
    this.name = name;
    this.image = image;
  }
}
