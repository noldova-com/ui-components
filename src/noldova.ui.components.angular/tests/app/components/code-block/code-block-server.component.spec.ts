/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, PLATFORM_ID } from "@angular/core";
import { TestBed } from "@angular/core/testing";

import { CodeBlockComponent } from "../../../../src/app/components/code-block/code-block.component";
import { ShellRunOutputComponent } from "../../../../src/app/components/code-block/shell-run-output.component";
import { Resources } from "../../../../src/resources";
import { CodeBlockHarness } from "../../../fixtures/code-block-harness.fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";

const CODE = "npm install\n\nnpm test\n";

@Component({
  imports: [CodeBlockComponent, ShellRunOutputComponent],
  template: `
    <div #area>
      <nol-code-block #block [code]="code" language="Shell" />
      <nol-shell-run-output [codeBlock]="block" [area]="area" />
    </div>
  `
})
class CodeBlockServerHostComponent {
  protected readonly code: string = CODE;
}

describe("CodeBlockComponent on the server", () => {
  const harness = new CodeBlockHarness();

  beforeEach(() => {
    harness.configure();
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: "server" }] });
    vi.stubGlobal("ngServerMode", true);
    vi.stubGlobal("ResizeObserver", undefined);
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    await harness.resetAsync();
  });

  it("renders its code as lines in the HTML and observes no sizes when it is prerendered", async () => {
    const fixture = TestBed.createComponent(CodeBlockServerHostComponent);
    await fixture.whenStable();
    const block = DomFixture.one(DomFixture.host(fixture), "nol-code-block");
    const lines = DomFixture.all(block, `code > .${Resources.codeLineClass}`).map(t => t.textContent);
    const html = block.outerHTML;
    fixture.destroy();

    expect([lines, html.includes("npm install"), html.includes("ngskiphydration")]).toEqual([["npm install\n", "\n", "npm test\n"], true, true]);
  });
});
