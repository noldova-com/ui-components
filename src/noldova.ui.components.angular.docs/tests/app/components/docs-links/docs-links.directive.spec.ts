/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Location } from "@angular/common";
import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { Router, provideRouter } from "@angular/router";
import { MarkdownViewComponent, provideMarkdown } from "@noldova/ui.components.angular/markdown";
import type { MockInstance } from "vitest";

import { DocsLinksDirective } from "../../../../src/app/components/docs-links/docs-links.directive.js";
import { Resources } from "../../../../src/resources.js";
import { DocsFixture } from "../../../fixtures/docs.fixture.js";

@Component({
  selector: "test-page",
  template: ""
})
class PageComponent {}

@Component({
  selector: "test-docs-links",
  imports: [DocsLinksDirective, MarkdownViewComponent],
  template: `<nol-markdown-view nolDocsLinks [text]="text" />`
})
class DocsLinksHostComponent {
  public readonly text: string = [
    `[button](${Resources.kitDocumentsLink}button.md)`,
    `[states](${Resources.kitDocumentsLink}button.md#states)`,
    `[unlisted](${Resources.kitDocumentsLink}no-such-page.md)`,
    `[picture](${Resources.kitDocumentsLink}images/button.png)`,
    "[elsewhere](https://example.com/a)"
  ].join(" ");
}

describe("DocsLinksDirective", () => {
  const renderAsync = async (): Promise<HTMLElement> => {
    TestBed.configureTestingModule({ providers: [provideRouter([{ path: `${Resources.componentsPath}/button`, component: PageComponent }, { path: "**", component: PageComponent }]), provideMarkdown()] });
    const fixture = TestBed.createComponent(DocsLinksHostComponent);
    await fixture.whenStable();
    const host = DocsFixture.host(fixture);
    await vi.waitFor(() => expect(DocsFixture.all(host, "a").length).toBe(5));
    return host;
  };

  const opened = (): MockInstance<Window["open"]> => vi.spyOn(window, "open").mockReturnValue(null);

  const click = (link: HTMLElement, init: MouseEventInit = {}): void => {
    link.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, ...init }));
  };

  const router = (): Router => TestBed.inject(Router);

  const external = (path: string): string => TestBed.inject(Location).prepareExternalUrl(path);

  afterEach(async () => {
    vi.restoreAllMocks();
    await DocsFixture.resetAsync();
  });

  it("opens a kit document's page in this tab on a click, through the router", async () => {
    const host = await renderAsync();
    const open = opened();

    click(DocsFixture.byText(host, "a", "button"));

    await vi.waitFor(() => expect(router().url).toBe("/components/button"));
    expect(open).not.toHaveBeenCalled();
  });

  it("opens a kit document's section on its page, keeping the anchor, on Enter", async () => {
    const host = await renderAsync();
    const open = opened();

    DocsFixture.byText(host, "a", "states").dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "Enter" }));

    await vi.waitFor(() => expect(router().url).toBe("/components/button#states"));
    expect(open).not.toHaveBeenCalled();
  });

  it("opens a kit document's page in a new tab on a Ctrl click and a middle click, leaving this tab where it is", async () => {
    const host = await renderAsync();
    const open = opened();
    const link = DocsFixture.byText(host, "a", "button");

    click(link, { ctrlKey: true });
    link.dispatchEvent(new MouseEvent("auxclick", { bubbles: true, cancelable: true, button: 1 }));

    expect(open.mock.calls).toEqual([[external("/components/button"), "_blank", "noopener"], [external("/components/button"), "_blank", "noopener"]]);
    expect(router().url).toBe("/");
  });

  it("opens a kit document with no page here, a kit file that is no document, and any other address, at that address in a new tab", async () => {
    const host = await renderAsync();
    const open = opened();

    click(DocsFixture.byText(host, "a", "unlisted"));
    click(DocsFixture.byText(host, "a", "picture"));
    click(DocsFixture.byText(host, "a", "elsewhere"));

    expect(open.mock.calls).toEqual([[`${Resources.kitDocumentsLink}no-such-page.md`, "_blank", "noopener"], [`${Resources.kitDocumentsLink}images/button.png`, "_blank", "noopener"], ["https://example.com/a", "_blank", "noopener"]]);
    expect(router().url).toBe("/");
  });
});
