/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class LayoutTraceSuite {
  public static readonly title: string = "with a layout trace, in a browser of its own";
  // What a spec file that holds the suite has in its source, and the filter that runs every test outside it.
  public static readonly mark: string = "describe(LayoutTraceFixture.suite";
  public static readonly untracedFilter: string = `^(?!.*${LayoutTraceSuite.title})`;
}
