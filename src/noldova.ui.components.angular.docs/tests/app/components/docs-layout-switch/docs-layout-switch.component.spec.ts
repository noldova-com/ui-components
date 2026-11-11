/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ErrorHandler } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { indexPage } from "@docs-generated/index-page.js";
import { userEvent } from "vitest/browser";

import { DocsLayoutSwitchComponent } from "../../../../src/app/components/docs-layout-switch/docs-layout-switch.component.js";
import { DocsFixture } from "../../../fixtures/docs.fixture.js";

describe("DocsLayoutSwitchComponent", () => {
  const renderAsync = async (): Promise<HTMLElement> => {
    const fixture = TestBed.createComponent(DocsLayoutSwitchComponent);
    await fixture.whenStable();
    return DocsFixture.host(fixture);
  };

  const checked = (host: HTMLElement): readonly (string | undefined)[] =>
    DocsFixture.all(host, "[role=radio]").filter(t => t.getAttribute("aria-checked") === "true").map(t => t.textContent?.trim());

  const layoutBeforeBodyAsync = async (stored: string): Promise<unknown> => {
    localStorage.setItem(DocsFixture.LAYOUT_STORAGE_KEY, stored);
    const frame = document.createElement("iframe");
    let listener: (event: MessageEvent) => void = () => undefined;
    const answer = new Promise<unknown>(resolve => {
      listener = event => {
        if (event.source === frame.contentWindow)
          resolve(event.data);
      };
    });
    window.addEventListener("message", listener);
    const probe = `<script>window.parent.postMessage(document.documentElement.getAttribute("${DocsFixture.LAYOUT_ATTRIBUTE}"), "*");</script>`;
    frame.srcdoc = indexPage.replace("<body>", `<body>${probe}`);
    document.body.append(frame);
    try {
      return await answer;
    }
    finally {
      window.removeEventListener("message", listener);
      frame.remove();
    }
  };

  afterEach(async () => {
    vi.restoreAllMocks();
    await DocsFixture.resetAsync();
  });

  it("starts on Centered, then Full width, when nothing chose a layout", async () => {
    const host = await renderAsync();

    expect(DocsFixture.all(host, "[role=radio]").map(t => t.textContent?.trim())).toEqual(["Centered", "Full width"]);
    expect(checked(host)).toEqual(["Centered"]);
  });

  it("puts the chosen layout on the page's root and keeps it for the next visit", async () => {
    const host = await renderAsync();

    await userEvent.click(DocsFixture.byText(host, "[role=radio]", "Full width"));
    await vi.waitFor(() => expect(checked(host)).toEqual(["Full width"]));
    expect(document.documentElement.getAttribute(DocsFixture.LAYOUT_ATTRIBUTE)).toBe("Full");
    expect(localStorage.getItem(DocsFixture.LAYOUT_STORAGE_KEY)).toBe("Full");

    await userEvent.click(DocsFixture.byText(host, "[role=radio]", "Centered"));
    await vi.waitFor(() => expect(checked(host)).toEqual(["Centered"]));
    expect(document.documentElement.getAttribute(DocsFixture.LAYOUT_ATTRIBUTE)).toBeNull();
    expect(localStorage.getItem(DocsFixture.LAYOUT_STORAGE_KEY)).toBeNull();
  });

  it("still lays the page out as chosen when the browser refuses to keep it", async () => {
    const keep = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Refused.", "SecurityError");
    });
    const host = await renderAsync();

    await userEvent.click(DocsFixture.byText(host, "[role=radio]", "Full width"));

    await vi.waitFor(() => expect(checked(host)).toEqual(["Full width"]));
    expect(document.documentElement.getAttribute(DocsFixture.LAYOUT_ATTRIBUTE)).toBe("Full");
    expect(keep).toHaveBeenCalledWith(DocsFixture.LAYOUT_STORAGE_KEY, "Full");
  });

  it("passes on a failure to keep the layout that is not the browser's refusal", async () => {
    const handleError = vi.fn<(error: unknown) => void>();
    TestBed.configureTestingModule({ providers: [{ provide: ErrorHandler, useValue: { handleError } }] });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new TypeError("Broken.");
    });
    const host = await renderAsync();

    await userEvent.click(DocsFixture.byText(host, "[role=radio]", "Full width"));

    await vi.waitFor(() => expect(handleError).toHaveBeenCalledWith(expect.any(TypeError)));
  });

  it("shows the layout the page set before it rendered", async () => {
    document.documentElement.setAttribute(DocsFixture.LAYOUT_ATTRIBUTE, "Full");
    const host = await renderAsync();

    await vi.waitFor(() => expect(checked(host)).toEqual(["Full width"]));
  });

  it.each([["Full", "Full"], ["Centered", null], ["Wide", null]])("has the page shell set a kept %s layout before its body", async (stored, set) => {
    expect(await layoutBeforeBodyAsync(stored)).toBe(set);
  });
});
