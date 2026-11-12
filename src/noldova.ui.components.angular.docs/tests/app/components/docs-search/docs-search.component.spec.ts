/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";
import { Router, provideRouter } from "@angular/router";
import { userEvent } from "vitest/browser";

import { DocsSearchComponent } from "../../../../src/app/components/docs-search/docs-search.component.js";
import { DocsFixture } from "../../../fixtures/docs.fixture.js";

describe("DocsSearchComponent", () => {
  const renderAsync = async (): Promise<HTMLElement> => {
    TestBed.configureTestingModule({ providers: [provideRouter([{ path: "**", children: [] }])] });
    const fixture = TestBed.createComponent(DocsSearchComponent);
    await fixture.whenStable();
    return DocsFixture.host(fixture);
  };

  const results = (host: HTMLElement): readonly (string | undefined)[] => DocsFixture.all(host, ".nol-docs-search-results li").map(t => t.textContent?.trim());

  const field = (host: HTMLElement): HTMLInputElement => {
    const input = DocsFixture.one(host, "input");
    if (!(input instanceof HTMLInputElement))
      throw new TypeError("The search field is not an input.");
    return input;
  };

  it("lists no results until something is typed", async () => {
    const host = await renderAsync();

    expect(host.querySelector(".nol-docs-search-results")).toBeNull();
  });

  it("lists the pages that match, linked to their addresses", async () => {
    const host = await renderAsync();

    await userEvent.type(field(host), "variant");
    await vi.waitFor(() => expect(results(host)).toEqual(["Button"]));
    expect(DocsFixture.one(host, ".nol-docs-search-result").getAttribute("href")).toBe("/components/button");
  });

  it("says when nothing matches", async () => {
    const host = await renderAsync();

    await userEvent.type(field(host), "zzzz-no-such-term");
    await vi.waitFor(() => expect(DocsFixture.all(host, ".nol-docs-search-empty").length).toBe(1));
  });

  const options = (host: HTMLElement): readonly HTMLElement[] => DocsFixture.all(host, ".nol-docs-search-option");

  const selected = (host: HTMLElement): readonly number[] =>
    options(host).flatMap((t, index) => t.getAttribute("aria-selected") === "true" ? [index] : []);

  // The pointer rests on the field, so the list that opens under it never takes the pointer's hover.
  const typedAsync = async (host: HTMLElement, text: string): Promise<void> => {
    await userEvent.hover(field(host));
    await userEvent.type(field(host), text);
    await vi.waitFor(() => expect(options(host).length).toBeGreaterThan(1));
  };

  it("names the results list as the field's popup, open only while it shows", async () => {
    const host = await renderAsync();

    expect([field(host).getAttribute("role"), field(host).getAttribute("aria-expanded")]).toEqual(["combobox", "false"]);
    await typedAsync(host, "button");
    expect([field(host).getAttribute("aria-expanded"), field(host).getAttribute("aria-controls")]).toEqual(["true", DocsFixture.one(host, "[role='listbox']").id]);
  });

  it("moves the active result down and up with the arrow keys, naming it as the field's active descendant, and stops at the ends", async () => {
    const host = await renderAsync();
    await typedAsync(host, "button");
    const last = options(host).length - 1;

    expect([selected(host), field(host).getAttribute("aria-activedescendant")]).toEqual([[], null]);
    await userEvent.keyboard("{ArrowUp}");
    expect([selected(host), field(host).getAttribute("aria-activedescendant")]).toEqual([[], null]);
    await userEvent.keyboard("{ArrowDown}");
    await vi.waitFor(() => expect(selected(host)).toEqual([0]));
    expect(field(host).getAttribute("aria-activedescendant")).toBe(options(host)[0]?.id);
    await userEvent.keyboard("{ArrowDown}");
    await vi.waitFor(() => expect(selected(host)).toEqual([1]));
    expect(field(host).getAttribute("aria-activedescendant")).toBe(options(host)[1]?.id);
    await userEvent.keyboard("{ArrowUp}{ArrowUp}{ArrowUp}");
    await vi.waitFor(() => expect(selected(host)).toEqual([0]));
    await userEvent.keyboard("{ArrowDown}".repeat(last + 2));
    await vi.waitFor(() => expect(selected(host)).toEqual([last]));
    expect(document.activeElement).toBe(field(host));
  });

  it("opens the active result's page on Enter and clears the search", async () => {
    const host = await renderAsync();
    await typedAsync(host, "button");
    const link = DocsFixture.all(host, ".nol-docs-search-result")[1]?.getAttribute("href");

    await userEvent.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    await vi.waitFor(() => expect(TestBed.inject(Router).url).toBe(link));
    await vi.waitFor(() => expect(host.querySelector(".nol-docs-search-results")).toBeNull());
    expect(field(host).value).toBe("");
  });

  it("leaves the page alone on Enter in an empty field and while no result is active", async () => {
    const host = await renderAsync();
    await userEvent.click(field(host));
    await userEvent.keyboard("{Enter}");
    expect(TestBed.inject(Router).url).toBe("/");
    await typedAsync(host, "button");

    await userEvent.keyboard("{Enter}");
    expect(TestBed.inject(Router).url).toBe("/");
    expect(options(host).length).toBeGreaterThan(1);
  });

  it("closes the results on Escape, keeping the text, and clears the text on a second Escape", async () => {
    const host = await renderAsync();
    await typedAsync(host, "button");

    await userEvent.keyboard("{ArrowDown}{Escape}");
    await vi.waitFor(() => expect(host.querySelector(".nol-docs-search-results")).toBeNull());
    expect([field(host).value, field(host).getAttribute("aria-expanded"), field(host).getAttribute("aria-activedescendant")]).toEqual(["button", "false", null]);
    await userEvent.keyboard("{Escape}");
    await vi.waitFor(() => expect(field(host).value).toBe(""));
  });

  it("opens the closed results again on the down arrow", async () => {
    const host = await renderAsync();
    await typedAsync(host, "button");

    await userEvent.keyboard("{Escape}{ArrowDown}");
    await vi.waitFor(() => expect(selected(host)).toEqual([0]));
  });
});
