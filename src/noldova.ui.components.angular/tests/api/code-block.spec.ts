/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import * as codeBlock from "@noldova/ui.components.angular/code-block";

import * as kit from "../../src/api/index";
import { DomFixture } from "../fixtures/dom.fixture";

@Component({
  imports: [codeBlock.CodeBlockComponent],
  template: `<nol-code-block code="shasum -a 256 kit.tgz" language="bash" />`
})
class EntryCodeBlockHostComponent {}

describe("the kit's code block entry", () => {
  it("publishes the code block and what an app binds on it, the same classes as the kit's API", () => {
    expect({ ...codeBlock }).toEqual({
      CodeBlockComponent: kit.CodeBlockComponent,
      ShellRun: kit.ShellRun,
      ShellRunOutputDirective: kit.ShellRunOutputDirective,
      ShellRunState: kit.ShellRunState
    });
  });

  it("renders a block with the component it publishes", async () => {
    const fixture = TestBed.createComponent(EntryCodeBlockHostComponent);
    await fixture.whenStable();

    expect(DomFixture.one(DomFixture.host(fixture), "nol-code-block code").textContent).toBe("shasum -a 256 kit.tgz");
  });
});
