/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@angular/compiler";

await import("@noldova/ui.components.angular");
await import("@noldova/ui.components.angular/button");
await import("@noldova/ui.components.angular/code-block");
await import("@noldova/ui.components.angular/code-highlighting");
await import("@noldova/ui.components.angular/code-highlighting/worker");
await import("@noldova/ui.components.angular/gallery");
await import("@noldova/ui.components.angular/glyphs.json", { with: { type: "json" } });
await import("@noldova/ui.components.angular/markdown");
await import("@noldova/ui.components.angular/package.json", { with: { type: "json" } });
await import("@noldova/ui.components.angular/site");
await import("@noldova/ui.components.angular/site/card");
await import("@noldova/ui.components.angular/site/closing");
await import("@noldova/ui.components.angular/site/footer");
await import("@noldova/ui.components.angular/site/header");
await import("@noldova/ui.components.angular/site/hero");
await import("@noldova/ui.components.angular/site/section");
await import("@noldova/ui.components.angular/typography");

export type * from "@noldova/ui.components.angular/testing";
