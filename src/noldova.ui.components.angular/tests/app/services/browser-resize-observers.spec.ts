/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { BrowserResizeObservers } from "../../../src/app/services/browser-resize-observers";

describe("BrowserResizeObservers", () => {
  it("starts a browser resize observer that reports the size of what it observes", async () => {
    const box = document.body.appendChild(document.createElement("div"));
    box.style.cssText = "width: 40px; height: 30px";
    try {
      const sizes = await new Promise<readonly number[]>(resolve => {
        const observer = new BrowserResizeObservers().create(entries => {
          observer.disconnect();
          resolve(entries.map(t => t.contentRect.width));
        });
        observer.observe(box);
      });

      expect(sizes).toEqual([40]);
    }
    finally {
      box.remove();
    }
  });
});
