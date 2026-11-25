/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ElementRef, type OutputEmitterRef, type Signal, output, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";

import { ChoicePillsBehavior } from "../../../../src/app/components/choice-pills/choice-pills-behavior";
import type { IChoicePillsSource } from "../../../../src/app/interfaces/i-choice-pills-source";
import { SelectOption } from "../../../../src/app/models/select-option";
import { DomFixture } from "../../../fixtures/dom.fixture";

// The inputs and output a pills component gives its behavior, here set by the spec; it takes each value it emits, as a bound host does.
class PillsSource implements IChoicePillsSource {
  public readonly choices = signal<readonly SelectOption[]>([]);
  public readonly chosen = signal("");
  public readonly options: Signal<readonly SelectOption[]> = this.choices.asReadonly();
  public readonly value: Signal<string> = this.chosen.asReadonly();
  public readonly valueChange: OutputEmitterRef<string> = output<string>();
  public readonly emitted: string[] = [];

  public constructor() {
    this.valueChange.subscribe(t => {
      this.emitted.push(t);
      this.chosen.set(t);
    });
  }
}

describe("ChoicePillsBehavior", () => {
  let host: HTMLElement;
  let group: HTMLElement;
  let source: PillsSource;
  let behavior: ChoicePillsBehavior;

  afterEach(() => host.remove());

  // Builds the behavior on a host holding one pill button for each option, the given one chosen, its group moving on each key.
  function build(options: readonly SelectOption[], value: string, direction: string = "ltr"): void {
    host = document.createElement("div");
    host.dir = direction;
    group = document.createElement("div");
    for (const option of options) {
      const pill = document.createElement("button");
      pill.type = "button";
      pill.className = "nol-choice-pill";
      pill.textContent = option.title;
      group.append(pill);
    }
    host.append(group);
    document.body.append(host);
    TestBed.configureTestingModule({ providers: [{ provide: ElementRef, useValue: new ElementRef(host) }] });
    source = TestBed.runInInjectionContext(() => new PillsSource());
    source.choices.set(options);
    source.chosen.set(value);
    behavior = TestBed.runInInjectionContext(() => new ChoicePillsBehavior(source));
    group.addEventListener("keydown", event => behavior.move(event, group));
  }

  function pill(index: number): HTMLButtonElement {
    return DomFixture.at(DomFixture.allOf(group, ".nol-choice-pill", HTMLButtonElement), index);
  }

  // Presses a key on a pill and says whether the behavior took it.
  function press(index: number, key: string, modifiers: KeyboardEventInit = {}): boolean {
    pill(index).focus();
    const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...modifiers });
    pill(index).dispatchEvent(event);
    return event.defaultPrevented;
  }

  const modes = (disabled: string | null = null): SelectOption[] =>
    ["system", "light", "dark"].map(t => new SelectOption(t, t, null, t === disabled));

  it("stops Tab on the chosen pill, else the first enabled one, else the first", () => {
    build(modes(), "dark");
    const chosen = behavior.tabStop();
    source.chosen.set("none");
    const first = behavior.tabStop();
    source.choices.set(modes("system"));
    const firstEnabled = behavior.tabStop();
    source.choices.set([new SelectOption("light", "light", null, true), new SelectOption("dark", "dark", null, true)]);

    expect([chosen, first, firstEnabled, behavior.tabStop()]).toEqual(["dark", "system", "light", "light"]);
  });

  it("emits an enabled option it chooses, and nothing for the chosen one or a disabled one", () => {
    build(modes("dark"), "light");
    behavior.choose(DomFixture.at(modes("dark"), 1));
    behavior.choose(DomFixture.at(modes("dark"), 2));
    behavior.choose(DomFixture.at(modes("dark"), 0));

    expect(source.emitted).toEqual(["system"]);
  });

  it("moves to the next pill with ArrowRight and ArrowDown and back with ArrowLeft and ArrowUp, wrapping at both ends, and focuses it", () => {
    build(modes(), "system");
    const taken = [press(0, "ArrowRight"), press(2, "ArrowDown"), press(0, "ArrowLeft"), press(1, "ArrowUp")];

    expect([taken, source.emitted, document.activeElement]).toEqual([[true, true, true, true], ["light", "system", "dark", "system"], pill(0)]);
  });

  it("moves with ArrowLeft to the next pill and ArrowRight to the one before right to left", () => {
    build(modes(), "light", "rtl");
    press(1, "ArrowLeft");
    press(1, "ArrowRight");

    expect(source.emitted).toEqual(["dark", "system"]);
  });

  it("moves with Home and End to the first and last enabled pills, passing over disabled ones", () => {
    build([new SelectOption("a", "a", null, true), new SelectOption("b", "b"), new SelectOption("c", "c"), new SelectOption("d", "d", null, true)], "b");
    press(1, "End");
    press(2, "Home");

    expect([source.emitted, document.activeElement]).toEqual([["c", "b"], pill(1)]);
  });

  it("takes an arrow key but chooses and focuses nothing when every option is disabled", () => {
    build([new SelectOption("a", "a", null, true), new SelectOption("b", "b", null, true)], "a");
    const taken = press(0, "ArrowRight");

    expect([taken, source.emitted, document.activeElement]).toEqual([true, [], pill(0)]);
  });

  it("leaves a key alone when held with Alt, Ctrl or Meta, when it moves nothing, or when it isn't pressed on a pill", () => {
    build(modes(), "system");
    const held = [press(0, "ArrowRight", { altKey: true }), press(0, "ArrowRight", { ctrlKey: true }), press(0, "End", { metaKey: true }), press(0, "a")];
    const event = new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true });
    group.dispatchEvent(event);

    expect([held, event.defaultPrevented, source.emitted]).toEqual([[false, false, false, false], false, []]);
  });
});
