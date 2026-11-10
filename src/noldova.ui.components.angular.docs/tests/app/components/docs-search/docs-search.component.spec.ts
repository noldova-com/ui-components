/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { userEvent } from "vitest/browser";

import { DocsSearchComponent } from "../../../../src/app/components/docs-search/docs-search.component.js";
import { DocsFixture } from "../../../fixtures/docs.fixture.js";

describe("DocsSearchComponent", () => {
  const renderAsync = async (): Promise<HTMLElement> => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
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

  it("clears the search on Escape", async () => {
    const host = await renderAsync();

    await userEvent.type(field(host), "variant");
    await vi.waitFor(() => expect(results(host).length).toBe(1));
    await userEvent.keyboard("{Escape}");
    await vi.waitFor(() => expect(host.querySelector(".nol-docs-search-results")).toBeNull());
    expect(field(host).value).toBe("");
  });
});
