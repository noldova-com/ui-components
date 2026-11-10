/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MessageImageDirective } from "../../../../src/app/components/message/message-image.directive";

describe("MessageImageDirective", () => {
  it("tells the template checker that the template's context is the image", () => {
    expect(MessageImageDirective.ngTemplateContextGuard({} as MessageImageDirective, { src: "chart.png", alt: "A chart", title: null })).toBe(true);
  });
});
