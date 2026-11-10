/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

export class LiveRegionFixture {
  private static readonly SELECTOR: string = ".cdk-live-announcer-element";
  private static readonly LIMIT: number = 5000;

  public static region(): Element | null {
    return document.querySelector(LiveRegionFixture.SELECTOR);
  }

  public static spokenAsync(limit: number = LiveRegionFixture.LIMIT): Promise<string> {
    const region = LiveRegionFixture.region();
    if (Object.isNull(region))
      return Promise.reject(new Error("The page has no live region to wait on."));
    return new Promise((resolve, reject) => {
      const observer = new MutationObserver(() => {
        const text = region.textContent ?? String.empty;
        if (text.length === 0)
          return;
        observer.disconnect();
        clearTimeout(deadline);
        resolve(text);
      });
      const deadline = setTimeout(() => {
        observer.disconnect();
        reject(new Error(`The live region spoke nothing within ${limit} ms.`));
      }, limit);
      observer.observe(region, { childList: true, characterData: true, subtree: true });
    });
  }
}
