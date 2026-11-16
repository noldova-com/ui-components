/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { createHash } from "node:crypto";
import { basename, dirname, extname, join } from "node:path";

import type { IScreenshotCommandContext } from "./interfaces/i-screenshot-command-context.ts";
import type { IScreenshotOptions } from "./interfaces/i-screenshot-options.ts";
import type { ISavedScreenshot } from "./interfaces/i-saved-screenshot.ts";

// Vitest's screenshot command, with a file name too long to save shortened to a hash of it. Vitest names a failed test's screenshot after the test's
// full name, and a name past the 255 bytes macOS, Linux and Windows allow fails with ENAMETOOLONG and loses the screenshot. vitest.config.mts puts
// this in place of Vitest's own __vitest_screenshot command, which does what takeAsync does after the name: the Playwright provider's
// __vitest_takeScreenshot takes the screenshot, and the result is the path, the base64 image or both, as the options ask.
export class ShortScreenshotNames {
  private static readonly TAKE: string = "__vitest_takeScreenshot";
  private static readonly NAME_LIMIT: number = 255;
  private static readonly HASH: string = "sha256";
  private static readonly HASH_LENGTH: number = 16;
  private static readonly BASE64: BufferEncoding = "base64";

  public readonly screenshot: (context: IScreenshotCommandContext, name: string, options?: IScreenshotOptions) => Promise<string | ISavedScreenshot> =
    (context, name, options = {}) => this.takeAsync(context, name, options);

  private async takeAsync(context: IScreenshotCommandContext, name: string, options: IScreenshotOptions): Promise<string | ISavedScreenshot> {
    const save = options.save ?? true;
    const base64 = save ? options.base64 : true;
    // The provider saves to the path when there is one, and otherwise under the name.
    const target = options.path ?? name;
    const short = ShortScreenshotNames.shorten(target);
    const sent = options.path === undefined ? { ...options, save, base64 } : { ...options, save, base64, path: short };
    const taken = await context.triggerCommand(ShortScreenshotNames.TAKE, options.path === undefined ? short : name, sent);
    if (short !== target)
      context.project.vitest.logger.log(`Screenshot of "${basename(target)}": ${taken.path}`);
    if (!save)
      return taken.buffer.toString(ShortScreenshotNames.BASE64);
    return base64 === true ? { path: taken.path, base64: taken.buffer.toString(ShortScreenshotNames.BASE64) } : taken.path;
  }

  // A path whose file name fits is kept as it is; one past the limit keeps its folder and extension, with a hash of the name in between.
  private static shorten(path: string): string {
    const name = basename(path);
    if (Buffer.byteLength(name) <= ShortScreenshotNames.NAME_LIMIT)
      return path;
    const hash = createHash(ShortScreenshotNames.HASH).update(name).digest("hex").slice(0, ShortScreenshotNames.HASH_LENGTH);
    return join(dirname(path), `${hash}${extname(name)}`);
  }
}
