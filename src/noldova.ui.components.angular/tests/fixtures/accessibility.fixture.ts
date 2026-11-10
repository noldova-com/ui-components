/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {} from "@vitest/browser-playwright";
import { cdp } from "vitest/browser";

interface INamedNode {
  readonly name: string;
  readonly description: string | null;
  readonly checked: string | null;
}

interface IProperty {
  readonly name: string;
  readonly value: { readonly value?: unknown };
}

interface IFrame {
  readonly id: string;
  readonly url: string;
}

interface IFrameTree {
  readonly frame: IFrame;
  readonly childFrames?: readonly IFrameTree[];
}

export class AccessibilityFixture {
  public static async descriptionAsync(role: string, name: string): Promise<string | null> {
    return (await AccessibilityFixture.oneAsync(role, name))?.description ?? null;
  }

  public static async checkedAsync(role: string, name: string): Promise<string | null> {
    return (await AccessibilityFixture.oneAsync(role, name))?.checked ?? null;
  }

  public static async namesAsync(role: string): Promise<string[]> {
    return (await AccessibilityFixture.nodesAsync(role)).map(t => t.name);
  }

  private static async oneAsync(role: string, name: string): Promise<INamedNode | undefined> {
    const nodes = await AccessibilityFixture.nodesAsync(role);
    const named = nodes.filter(t => t.name === name);
    expect(named, `${role} "${name}" among ${JSON.stringify(nodes.map(t => t.name))}`).toHaveLength(1);
    return named[0];
  }

  private static async nodesAsync(role: string): Promise<INamedNode[]> {
    const { frameTree } = await cdp().send("Page.getFrameTree");
    const address = `${location.origin}${location.pathname}${location.search}`;
    const frames = AccessibilityFixture.framesOf(frameTree).filter(t => t.url === address);
    expect(frames, `the frame at ${address}`).toHaveLength(1);
    const trees = await Promise.all(frames.map(t => cdp().send("Accessibility.getFullAXTree", { frameId: t.id })));
    return trees.flatMap(t => t.nodes).filter(t => !t.ignored && t.role?.value === role)
      .map(t => ({ name: AccessibilityFixture.textOf(t.name), description: t.description ? AccessibilityFixture.textOf(t.description) : null,
        checked: AccessibilityFixture.checkedOf(t.properties) }));
  }

  private static checkedOf(properties: readonly IProperty[] | undefined): string | null {
    const checked = properties?.find(t => t.name === "checked");
    return checked === undefined ? null : AccessibilityFixture.textOf(checked.value);
  }

  private static textOf(value: { readonly value?: unknown } | undefined): string {
    return String(value?.value ?? String.empty).trim();
  }

  private static framesOf(tree: IFrameTree): IFrame[] {
    return [tree.frame, ...(tree.childFrames ?? []).flatMap(t => AccessibilityFixture.framesOf(t))];
  }
}
