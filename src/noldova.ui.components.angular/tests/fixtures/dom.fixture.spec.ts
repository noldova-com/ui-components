/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";

import { DomFixture } from "./dom.fixture";

@Component({
  template: "<span>Host</span>"
})
class DomFixtureHostComponent {}

describe("DomFixture", () => {
  it("reads a component fixture's host as the element Angular rendered", () => {
    const fixture = TestBed.createComponent(DomFixtureHostComponent);

    expect([DomFixture.host(fixture) === fixture.componentRef.location.nativeElement, DomFixture.host(fixture).textContent]).toEqual([true, "Host"]);
  });

  for (const [name, host] of [["a text node", document.createTextNode("Host")], ["nothing", null], ["an SVG element", document.createElementNS("http://www.w3.org/2000/svg", "svg")]] as const)
    it(`refuses a fixture whose host is ${name}, since it isn't an HTML element`, () => {
      expect(() => DomFixture.host({ nativeElement: host })).toThrow("The fixture's host is not an HTML element.");
    });

  describe("queries", () => {
    const root = document.createElement("div");
    root.innerHTML = "<button class='go'>Go</button><input class='name'><svg class='mark'></svg><p class='line'>One</p><p class='line'>Two</p>";

    it("finds the first element a selector matches, of the class it asks for", () => {
      expect([DomFixture.one(root, ".go").textContent, DomFixture.oneOf(root, ".name", HTMLInputElement).localName, DomFixture.oneOf(root, ".mark", SVGElement).localName])
        .toEqual(["Go", "input", "svg"]);
    });

    it("refuses a selector that matches nothing, or an element of another class", () => {
      expect(() => DomFixture.one(root, ".missing")).toThrow("Nothing matches .missing.");
      expect(() => DomFixture.one(root, ".mark")).toThrow(".mark matches a svg, not a HTMLElement.");
      expect(() => DomFixture.oneOf(root, ".go", HTMLInputElement)).toThrow(".go matches a button, not a HTMLInputElement.");
    });

    it("reads an absent element as null, and checks one that is there", () => {
      expect([DomFixture.maybe(root, ".missing"), DomFixture.maybe(root, ".go")?.textContent]).toEqual([null, "Go"]);
      expect(() => DomFixture.maybe(root, ".mark")).toThrow(".mark matches a svg, not a HTMLElement.");
    });

    it("finds every element a selector matches, each of the class it asks for, and none where nothing matches", () => {
      expect([DomFixture.all(root, ".line").map(t => t.textContent), DomFixture.allOf(root, "p", HTMLParagraphElement).length, DomFixture.all(root, ".missing")])
        .toEqual([["One", "Two"], 2, []]);
      expect(() => DomFixture.allOf(root, ".line, .go", HTMLParagraphElement)).toThrow(".line, .go matches a button, not a HTMLParagraphElement.");
    });

    it("passes a value that is there and refuses one that is missing", () => {
      expect(DomFixture.present(root)).toBe(root);
      expect(() => DomFixture.present(null)).toThrow("The element is missing.");
      expect(() => DomFixture.present(undefined)).toThrow("The element is missing.");
    });
  });
});
