/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { userEvent } from "vitest/browser";

import { MentionFieldDirective } from "../../../../src/app/components/mention-field/mention-field.directive";
import { AnnouncementPoliteness } from "../../../../src/app/enums/announcement-politeness";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import type { Theme } from "../../../../src/app/models/theme";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { MentionCandidate } from "../../../../src/app/models/mention-candidate";
import { Announcer } from "../../../../src/app/services/announcer";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";
import { RowFillFixture } from "../../../fixtures/row-fill.fixture";

const alice = new MentionCandidate("person-1", "Alice", { section: "People" });
const albert = new MentionCandidate("person-2", "Albert", { section: "People", unavailable: true });
const alma = new MentionCandidate("agent-1", "Alma", { section: "Agents", initials: "AM", color: 6 });
const bob = new MentionCandidate("person-3", "Bob", { section: "People" });
const away = new MentionCandidate("person-1", "Alice", { section: "People", note: "away" });
const held = new MentionCandidate("person-2", "Albert", { section: "People", note: "provider disabled", unavailable: true });

@Component({
  imports: [MentionFieldDirective],
  template: `
    <div class="frame" style="position: fixed; top: 320px; left: 40px;" (keydown)="keys.push($event.key)">
      <textarea #field style="box-sizing: border-box; width: 20rem; height: 3rem;" [nolMentionField]="candidates()" [nolMentionFieldLabel]="label()"
        (nolMentioned)="mentioned.push($event)" (input)="values.push(field.value)" (keydown)="own.push($event.key)"></textarea>
    </div>
  `
})
class MentionFieldHostComponent {
  public readonly candidates = signal<readonly MentionCandidate[]>([alice, albert, alma, bob]);
  public readonly label = signal("Mentions");
  public readonly keys: string[] = [];
  public readonly own: string[] = [];
  public readonly mentioned: MentionCandidate[] = [];
  public readonly values: string[] = [];
}

describe("MentionFieldDirective", () => {
  let fixture: ComponentFixture<MentionFieldHostComponent>;
  let host: MentionFieldHostComponent;

  async function renderAsync(theme: Theme = DefaultTheme.theme, mode: ThemeMode = ThemeMode.Light): Promise<void> {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(MentionFieldHostComponent);
    host = fixture.componentInstance;
    await fixture.whenStable();
  }

  afterEach(() => {
    fixture.destroy();
    AppearanceFixture.reset();
  });

  function field(): HTMLTextAreaElement {
    return DomFixture.oneOf(DomFixture.host(fixture), "textarea", HTMLTextAreaElement);
  }

  function list(): HTMLElement | null {
    return document.querySelector<HTMLElement>(".cdk-overlay-container nol-mention-list");
  }

  function options(): HTMLElement[] {
    return Array.from(document.querySelectorAll<HTMLElement>(".cdk-overlay-container .nol-mention-option"));
  }

  function names(): string[] {
    return options().map(t => DomFixture.one(t, ".nol-mention-name").innerText.trim());
  }

  function part(option: HTMLElement, name: "name" | "note"): HTMLElement {
    return DomFixture.one(option, `.nol-mention-${name}`);
  }

  function expectNotePlaced(noted: readonly HTMLElement[]): void {
    for (const option of noted) {
      const [name, note] = [part(option, "name"), part(option, "note")];
      const text = document.createRange();
      text.selectNodeContents(note);
      const named = name.getBoundingClientRect();
      AppearanceFixture.expectPixels(text.getBoundingClientRect().left, named.right + AppearanceFixture.measureLook("space-2"));
      AppearanceFixture.expectPixels(note.getBoundingClientRect().top, named.top);
      AppearanceFixture.expectPixels(note.getBoundingClientRect().height, named.height);
      expect(getComputedStyle(note).fontSize).toBe(getComputedStyle(name).fontSize);
    }
  }

  function selected(): (string | null)[] {
    return options().map(t => t.getAttribute("aria-selected"));
  }

  async function writeAsync(text: string, caret: number = text.length): Promise<void> {
    field().focus();
    field().value = text;
    field().setSelectionRange(caret, caret);
    field().dispatchEvent(new Event("input", { bubbles: true }));
    await fixture.whenStable();
  }

  async function pressAsync(keys: string): Promise<void> {
    await userEvent.keyboard(keys);
    await fixture.whenStable();
  }

  function press(init: KeyboardEventInit): boolean {
    return field().dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...init }));
  }

  it("opens a listbox above the field, as wide, of the names that start with the word after the @, in their order, the first one active", async () => {
    await renderAsync();
    await userEvent.click(field());
    await userEvent.keyboard("Hi @al");
    await expect.poll(() => names()).toEqual(["Alice", "Albert", "Alma"]);
    await fixture.whenStable();
    const shown = list() as HTMLElement;
    const box = shown.getBoundingClientRect();
    const anchor = field().getBoundingClientRect();

    expect(selected()).toEqual(["true", "false", "false"]);
    expect([field().getAttribute("role"), field().getAttribute("aria-autocomplete"), field().getAttribute("aria-expanded")]).toEqual(["combobox", "list", "true"]);
    expect([field().getAttribute("aria-controls"), field().getAttribute("aria-activedescendant")]).toEqual([shown.id, options()[0]?.id]);
    expect([shown.getAttribute("role"), shown.getAttribute("aria-label")]).toEqual(["listbox", "Mentions"]);
    expect(options().map(t => t.getAttribute("role"))).toEqual(["option", "option", "option"]);
    AppearanceFixture.expectPixels(box.bottom, anchor.top);
    AppearanceFixture.expectPixels(box.left, anchor.left);
    AppearanceFixture.expectPixels(box.width, anchor.width);
    expect(document.activeElement).toBe(field());
  });

  it("narrows as the word grows, closes when no name starts with it or the word ends, and opens again as the caret comes back into it", async () => {
    await renderAsync();
    await writeAsync("Hi @al");
    await writeAsync("Hi @ali");
    const narrowed = names();
    await writeAsync("Hi @alix");
    const unmatched = [list(), field().getAttribute("aria-expanded"), field().getAttribute("aria-controls"), field().getAttribute("aria-activedescendant")];
    await writeAsync("Hi @ali");
    const again = names();
    await writeAsync("Hi @ali ");

    expect([narrowed, unmatched, again, list()]).toEqual([["Alice"], [null, "false", null, null], ["Alice"], null]);
  });

  it("offers every name after an @ that starts the text, follows a blank or opens a parenthesis, and none after an @ inside a word, in code, or before a word no name starts with", async () => {
    await renderAsync();
    const offered: string[][] = [];
    for (const text of ["@", "Hi @", "(@b", "x@", "me@al", "~~~\n@al", "Hi @-"]) {
      await writeAsync(text);
      offered.push(names());
    }

    expect(offered).toEqual([["Alice", "Albert", "Alma", "Bob"], ["Alice", "Albert", "Alma", "Bob"], ["Bob"], [], [], [], []]);
  });

  it("moves the active option with the arrow keys, wrapping at both ends, keeps the caret and the keys, and tells the field which option is active", async () => {
    await renderAsync();
    await writeAsync("Hi @al");
    const moves: (string | null)[][] = [];
    for (const key of ["{ArrowDown}", "{ArrowDown}", "{ArrowDown}", "{ArrowUp}"]) {
      await pressAsync(key);
      moves.push(selected());
    }
    const active = options().findIndex(t => t.id === field().getAttribute("aria-activedescendant"));

    expect(moves).toEqual([["false", "true", "false"], ["false", "false", "true"], ["true", "false", "false"], ["false", "false", "true"]]);
    expect([active, field().selectionStart, host.own, host.keys]).toEqual([2, 6, [], []]);
  });

  it("writes the active name with Enter as an @mention and a space, puts the caret after it, reports it and closes, without a new line", async () => {
    await renderAsync();
    await writeAsync("Hi @al");
    await pressAsync("{Enter}");

    expect([field().value, field().selectionStart, list(), host.mentioned, host.values.slice(-1)]).toEqual(["Hi @Alice ", 10, null, [alice], ["Hi @Alice "]]);
  });

  it("writes the active name with Tab over the whole word the caret is in, and keeps the focus", async () => {
    await renderAsync();
    await writeAsync("Hi @alxyz");
    field().setSelectionRange(5, 5);
    await pressAsync("{ArrowRight}");
    await pressAsync("{ArrowDown}");
    await pressAsync("{Tab}");

    expect([field().value, field().selectionStart, host.mentioned, document.activeElement === field()]).toEqual(["Hi @Albert ", 11, [albert], true]);
  });

  it("writes a name chosen with the pointer, keeping the focus in the field", async () => {
    await renderAsync();
    await writeAsync("@al and more", 3);
    await userEvent.click(options()[2] as HTMLElement);
    await fixture.whenStable();

    expect([field().value, field().selectionStart, host.mentioned, document.activeElement === field(), list()]).toEqual(["@Alma  and more", 6, [alma], true, null]);
  });

  it("opens no list while the field is read-only, on a click or a key that moves the caret into a name", async () => {
    await renderAsync();
    await writeAsync("Hi @al and", 0);
    field().readOnly = true;
    field().setSelectionRange(6, 6);
    field().dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await fixture.whenStable();
    const clicked = list();
    await pressAsync("{ArrowLeft}");

    expect([clicked, list(), field().getAttribute("aria-expanded")]).toEqual([null, null, "false"]);
  });

  it("leaves Enter and Tab to the field and the content around it once the field turns read-only with its list open, changing nothing and closing the list", async () => {
    await renderAsync();
    const prevented: boolean[] = [];
    const listen = (event: KeyboardEvent): void => {
      prevented.push(event.defaultPrevented);
    };
    document.addEventListener("keydown", listen);
    const outcomes: unknown[][] = [];
    try {
      for (const key of ["{Enter}", "{Tab}"]) {
        field().focus();
        field().readOnly = false;
        await writeAsync("Hi @al");
        const opened = options().length;
        field().readOnly = true;
        await pressAsync(key);
        outcomes.push([opened, field().value, field().selectionStart, field().selectionEnd, list()]);
      }
    } finally {
      document.removeEventListener("keydown", listen);
    }

    expect([outcomes, prevented, host.own, host.keys, document.activeElement === field(), host.mentioned])
      .toEqual([Array.from({ length: 2 }, () => [3, "Hi @al", 6, 6, null]), [false, false], ["Enter", "Tab"], ["Enter", "Tab"], false, []]);
  });

  it("changes nothing with a pick by the pointer once the field turns read-only with its list open, and closes the list", async () => {
    await renderAsync();
    await writeAsync("Hi @al");
    const opened = options().length;
    field().readOnly = true;
    await userEvent.click(options()[1] as HTMLElement);
    await fixture.whenStable();

    expect([opened, field().value, field().selectionStart, field().selectionEnd, list(), host.mentioned]).toEqual([3, "Hi @al", 6, 6, null, []]);
  });

  it("follows the caret on a click or a key that moves it", async () => {
    await renderAsync();
    await writeAsync("@al and more");
    const closed = list();
    field().setSelectionRange(3, 3);
    field().dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await fixture.whenStable();
    const clicked = names();
    await pressAsync("{End}");

    expect([closed, clicked, list()]).toEqual([null, ["Alice", "Albert", "Alma"], null]);
  });

  it("leaves Shift+Enter to the field, which starts a new line and so closes the list", async () => {
    await renderAsync();
    await writeAsync("@al");
    await pressAsync("{Shift>}{Enter}{/Shift}");

    expect([field().value, host.mentioned, list()]).toEqual(["@al\n", [], null]);
  });

  it("closes on Escape, keeping the text and the key from the content around it, and passes Escape on once it is closed", async () => {
    await renderAsync();
    await writeAsync("@al");
    await pressAsync("{Escape}");
    const closed = [field().value, list(), host.keys.includes("Escape")];
    await pressAsync("{Escape}");
    const passed = host.keys.includes("Escape");
    await pressAsync("i");

    expect([closed, passed, names()]).toEqual([["@al", null, false], true, ["Alice"]]);
  });

  it("ignores a key while text is being composed or with Ctrl, Alt or the system key held", async () => {
    await renderAsync();
    await writeAsync("@al");
    const ignored: KeyboardEventInit[] = [{ key: "Enter", isComposing: true }, { key: "Enter", ctrlKey: true }, { key: "ArrowDown", altKey: true }, { key: "Tab", metaKey: true }];
    const handled = ignored.map(t => press(t));
    await fixture.whenStable();

    expect([handled, selected(), host.mentioned, field().value]).toEqual([[true, true, true, true], ["true", "false", "false"], [], "@al"]);
  });

  it("closes when the field loses the focus, when the content around it moves it, and when the field goes", async () => {
    await renderAsync();
    await writeAsync("@al");
    field().blur();
    await fixture.whenStable();
    const blurred = list();
    await writeAsync("@al");
    DomFixture.one(DomFixture.host(fixture), ".frame").style.top = "340px";
    fixture.nativeElement.dispatchEvent(new Event("scroll"));
    await fixture.whenStable();
    const moved = list();
    await writeAsync("@al");
    const reopened = names();
    fixture.destroy();

    expect([blurred, moved, reopened, list()]).toEqual([null, null, ["Alice", "Albert", "Alma"], null]);
  });

  it("keeps the keys it handles while the list is open from the field's own listeners and the content around it, and passes them on once it is closed", async () => {
    await renderAsync();
    await writeAsync("@al");
    await pressAsync("{ArrowDown}");
    await pressAsync("{ArrowUp}");
    await pressAsync("{Escape}");
    await pressAsync("{Enter}");
    await writeAsync("@al");
    await pressAsync("{Tab}");

    expect([host.own, host.keys, field().value, host.mentioned]).toEqual([["Enter"], ["Enter"], "@Alice ", [alice]]);
  });

  it("keeps the active option on its candidate while the candidates change, goes back to the first when it is gone, and says the number again only when it changes", async () => {
    await renderAsync();
    const announce = vi.spyOn(TestBed.inject(Announcer), "announce");
    await writeAsync("@al");
    await pressAsync("{ArrowDown}");
    host.candidates.set([alma, albert, alice, bob]);
    await fixture.whenStable();
    const reordered = [names(), selected()];
    host.candidates.set([alma, albert]);
    await fixture.whenStable();
    const fewer = [names(), selected(), field().getAttribute("aria-activedescendant") === options()[1]?.id];
    host.candidates.set([alma, alice]);
    await fixture.whenStable();
    const gone = [names(), selected()];
    await pressAsync("{Enter}");

    expect([reordered, fewer, gone]).toEqual([[["Alma", "Albert", "Alice"], ["false", "true", "false"]], [["Alma", "Albert"], ["false", "true"], true], [["Alma", "Alice"], ["true", "false"]]]);
    expect([field().value, announce.mock.calls.map(t => t[0])]).toEqual(["@Alma ", ["3 mentions", "2 mentions"]]);
  });

  it("keeps the active option when only Shift, Control, Alt or Meta is pressed or a click leaves the caret where it is, and keeps the list closed after Escape", async () => {
    await renderAsync();
    await writeAsync("@al");
    await pressAsync("{ArrowDown}");
    for (const key of ["{Shift}", "{Control}", "{Alt}", "{Meta}"])
      await pressAsync(key);
    field().dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await fixture.whenStable();
    const kept = selected();
    await pressAsync("{Escape}");
    await pressAsync("{Shift}");

    expect([kept, list()]).toEqual([["false", "true", "false"], null]);
  });

  it("keeps the focus in the field and the list open on a press anywhere on the list, a section label too", async () => {
    await renderAsync();
    await writeAsync("@al");
    await userEvent.click(DomFixture.one(document, ".cdk-overlay-container .nol-mention-section"));
    await fixture.whenStable();
    const pressed = list()?.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));

    expect([document.activeElement === field(), names(), pressed]).toEqual([true, ["Alice", "Albert", "Alma"], false]);
  });

  it("writes the name as one edit the field can undo, back to the word typed", async () => {
    await renderAsync();
    await writeAsync("Hi @al");
    await pressAsync("{Enter}");
    const written = field().value;
    document.execCommand("undo");
    await fixture.whenStable();

    expect([written, field().value]).toEqual(["Hi @Alice ", "Hi @al"]);
  });

  it("writes the name itself, puts the caret after it and dispatches an input event where the browser can't insert text as an edit", async () => {
    await renderAsync();
    await writeAsync("Hi @al there", 6);
    const insert = vi.spyOn(document, "execCommand").mockReturnValue(false);
    await pressAsync("{Enter}");
    insert.mockRestore();

    expect([field().value, field().selectionStart, host.values.slice(-1), host.mentioned, list()]).toEqual(["Hi @Alice  there", 10, ["Hi @Alice  there"], [alice], null]);
  });

  it("follows the text typed while composing, and leaves the key that ends the composition to it", async () => {
    await renderAsync();
    field().focus();
    field().dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
    field().value = "@al";
    field().setSelectionRange(3, 3);
    field().dispatchEvent(new InputEvent("input", { bubbles: true, isComposing: true, inputType: "insertCompositionText", data: "al" }));
    await fixture.whenStable();
    const composing = names();
    const handled = press({ key: "Enter", isComposing: true });

    expect([composing, handled, field().value, host.mentioned]).toEqual([["Alice", "Albert", "Alma"], true, "@al", []]);
  });

  it("names each option by its name, then whether it is unavailable, then its section where a section starts, and labels each section once", async () => {
    await renderAsync();
    host.label.set("Teammates");
    await writeAsync("@al");
    const sections = Array.from(document.querySelectorAll<HTMLElement>(".cdk-overlay-container .nol-mention-section"));

    expect(options().map(t => t.getAttribute("aria-label"))).toEqual(["Alice, People", "Albert, unavailable", "Alma, Agents"]);
    expect(sections.map(t => [t.innerText.trim(), t.getAttribute("aria-hidden")])).toEqual([["People", "true"], ["Agents", "true"]]);
    expect(options().map(t => getComputedStyle(t).opacity)).toEqual(["1", "0.5", "1"]);
    expect(list()?.getAttribute("aria-label")).toBe("Teammates");
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`shows a candidate's note after its name on the same line, and names the option by its name, then its note, in the ${theme.id} theme in ${mode} mode`,
        async () => {
          await renderAsync(theme, mode);
          host.candidates.set([away, held, alma]);
          await writeAsync("@al");

          expect(options().map(t => t.getAttribute("aria-label"))).toEqual(["Alice, away, People", "Albert, provider disabled, unavailable", "Alma, Agents"]);
          expect(options().map(t => t.querySelector(".nol-mention-note")?.textContent ?? null)).toEqual(["away", "provider disabled", null]);
          expect(options().map(t => getComputedStyle(t).opacity)).toEqual(["1", "0.5", "1"]);
          expectNotePlaced(options().slice(0, 2));
        });

  it("writes only a noted candidate's name, with Enter and with the pointer", async () => {
    await renderAsync();
    host.candidates.set([away, held]);
    await writeAsync("Hi @al");
    await pressAsync("{Enter}");
    await writeAsync("Hi @Alice and @al");
    await userEvent.click(options()[1] as HTMLElement);
    await fixture.whenStable();

    expect([field().value, host.mentioned]).toEqual(["Hi @Alice and @Albert ", [away, held]]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes) {
      it(`cuts a note too long for the option at the option's end, keeping its name whole, on one line, in the ${theme.id} theme in ${mode} mode`, async () => {
        await renderAsync(theme, mode);
        host.candidates.set([new MentionCandidate("person-9", "Alice", { note: Array.from({ length: 8 }, () => "provider disabled").join(" ") })]);
        await writeAsync("@al");
        const option = options()[0] as HTMLElement;
        const [name, note] = [part(option, "name"), part(option, "note")];

        AppearanceFixture.expectTruncates(note);
        expect(name.scrollWidth).toBeLessThanOrEqual(name.clientWidth);
        expectNotePlaced([option]);
        AppearanceFixture.expectPixels(note.getBoundingClientRect().right, option.getBoundingClientRect().right - AppearanceFixture.measureLook("space-2"));
        AppearanceFixture.expectPixels(option.getBoundingClientRect().height, RowFillFixture.heightOf("mention-row-height"));
      });

      it(`cuts a long name only once its note is gone, where it cuts a long name without a note, in the ${theme.id} theme in ${mode} mode`, async () => {
        await renderAsync(theme, mode);
        const long = `Al${" Longname".repeat(12)}`;
        host.candidates.set([new MentionCandidate("person-9", long, { note: "provider disabled", unavailable: true }), new MentionCandidate("person-10", `${long} Two`)]);
        await writeAsync("@al");
        const [noted, plain] = options() as [HTMLElement, HTMLElement];
        const [name, note] = [part(noted, "name"), part(noted, "note")];
        const end = (option: HTMLElement): number => option.getBoundingClientRect().right - AppearanceFixture.measureLook("space-2");

        AppearanceFixture.expectTruncates(name);
        AppearanceFixture.expectTruncates(note);
        AppearanceFixture.expectPixels(note.getBoundingClientRect().width, 0);
        AppearanceFixture.expectPixels(name.getBoundingClientRect().right, end(noted));
        AppearanceFixture.expectPixels(note.getBoundingClientRect().left, end(noted));
        AppearanceFixture.expectTruncates(part(plain, "name"));
        AppearanceFixture.expectPixels(part(plain, "name").getBoundingClientRect().right, end(plain));
        expect(plain.querySelector(".nol-mention-note")).toBeNull();
        AppearanceFixture.expectPixels(noted.getBoundingClientRect().height, RowFillFixture.heightOf("mention-row-height"));
      });
    }

  it("draws the active option's note in HighlightText under forced colors, and another option's note as its name, in its place", async () => {
    await ForcedColorsFixture.activateAsync();
    try {
      await renderAsync();
      host.candidates.set([away, held]);
      await writeAsync("@al");
      const colors = options().map(t => [getComputedStyle(part(t, "name")).color, getComputedStyle(part(t, "note")).color]);

      expect(colors).toEqual([[ForcedColorsFixture.resolve("HighlightText"), ForcedColorsFixture.resolve("HighlightText")],
        [ForcedColorsFixture.resolve("CanvasText"), ForcedColorsFixture.resolve("CanvasText")]]);
      expectNotePlaced(options());
    }
    finally {
      await ForcedColorsFixture.resetAsync();
    }
  });

  it("shows each option's avatar, small and hidden from assistive technology, with its candidate's initials and color, or a color its id picks", async () => {
    await renderAsync();
    await writeAsync("@al");
    const avatars = options().map(t => DomFixture.one(t, "nol-avatar"));

    expect(avatars.map(t => [t.innerText.trim(), t.getAttribute("aria-hidden"), t.classList.contains("nol-avatar-small"), t.style.getPropertyValue("--nol-avatar-fill")])).toEqual([
      ["A", "true", true, "var(--nol-avatar-green)"], ["A", "true", true, "var(--nol-avatar-purple)"], ["AM", "true", true, "var(--nol-avatar-red)"]
    ]);
  });

  it("says politely how many names it offers each time the word changes", async () => {
    await renderAsync();
    const announce = vi.spyOn(TestBed.inject(Announcer), "announce");
    await writeAsync("@al");
    await pressAsync("{ArrowDown}");
    await writeAsync("@ali");

    expect(announce.mock.calls).toEqual([["3 mentions", AnnouncementPoliteness.Polite], ["1 mention", AnnouncementPoliteness.Polite]]);
  });

  it("keeps the active option in view in a list taller than its room, which scrolls", async () => {
    await renderAsync();
    host.candidates.set(Array.from({ length: 12 }, (_, index) => new MentionCandidate(`agent-${index}`, `Agent${index}`)));
    await writeAsync("@ag");
    const shown = list() as HTMLElement;
    const box = shown.getBoundingClientRect();
    const height = box.height;
    await pressAsync("{ArrowUp}");
    const last = (options()[11] as HTMLElement).getBoundingClientRect().bottom;
    const end = shown.scrollTop;
    await pressAsync("{ArrowDown}");
    const start = shown.scrollTop;
    await pressAsync("{ArrowDown}");

    AppearanceFixture.expectPixels(height, AppearanceFixture.measureLook("mention-list-height"));
    expect(end).toBeGreaterThan(0);
    AppearanceFixture.expectPixels(last, box.bottom - shown.clientTop);
    AppearanceFixture.expectPixels(start, AppearanceFixture.measureLook("space-1"));
    expect(shown.scrollTop).toBe(start);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`takes its list's colors and geometry from the ${theme.id} theme in ${mode} mode`, async () => {
        await renderAsync(theme, mode);
        host.candidates.set([away, held, alma, bob]);
        await writeAsync("@al");
        const option = options()[1] as HTMLElement;
        option.setAttribute("data-nol-state", "Hover");
        const surface = getComputedStyle(list() as HTMLElement);
        const active = getComputedStyle(options()[0] as HTMLElement);
        const hovered = getComputedStyle(option);
        const section = getComputedStyle(DomFixture.one(document, ".cdk-overlay-container .nol-mention-section"));

        expect([surface.backgroundColor, surface.borderTopColor, surface.color]).toEqual([AppearanceFixture.readColor(theme, mode, "menu"),
          AppearanceFixture.readColor(theme, mode, "menu-border"), AppearanceFixture.readColor(theme, mode, "menu-text")]);
        AppearanceFixture.expectLook(surface.boxShadow, theme, "shadow-large", "box-shadow");
        AppearanceFixture.expectLook(surface.borderTopLeftRadius, theme, "radius-large", "border-top-left-radius", "border-radius");
        AppearanceFixture.expectLook(surface.maxHeight, theme, "mention-list-height", "max-height");
        AppearanceFixture.expectLook(surface.paddingTop, theme, "space-1", "padding-top", "padding");
        expect([RowFillFixture.colorOf(options()[0] as HTMLElement), active.color]).toEqual([AppearanceFixture.readColor(theme, mode, "selected"),
          AppearanceFixture.readColor(theme, mode, "menu-text")]);
        expect(RowFillFixture.colorOf(option)).toBe(AppearanceFixture.readColor(theme, mode, "hover"));
        expect([active.backgroundColor, hovered.backgroundColor]).toEqual(["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0)"]);
        AppearanceFixture.expectPixels(Number.parseFloat(active.minHeight), RowFillFixture.heightOf("mention-row-height"));
        RowFillFixture.expectApart(options()[0] as HTMLElement, option, "mention-row-height");
        AppearanceFixture.expectLook(getComputedStyle(DomFixture.one(option, "nol-avatar")).width, theme, "avatar-small", "width");
        AppearanceFixture.expectLook(active.columnGap, theme, "space-2", "column-gap");
        AppearanceFixture.expectPixels(option.getBoundingClientRect().height, RowFillFixture.heightOf("mention-row-height"));
        AppearanceFixture.expectLook(active.paddingLeft, theme, "space-2", "padding-left");
        AppearanceFixture.expectLook(getComputedStyle(options()[0] as HTMLElement, "::before").borderTopLeftRadius, theme, "radius-small", "border-top-left-radius", "border-radius");
        expect(section.color).toBe(AppearanceFixture.readColor(theme, mode, "text-muted"));
        expect([part(options()[0] as HTMLElement, "note"), part(option, "note")].map(t => getComputedStyle(t).color))
          .toEqual([AppearanceFixture.readColor(theme, mode, "menu-text"), AppearanceFixture.readColor(theme, mode, "text-muted")]);
        AppearanceFixture.expectLook(section.paddingTop, theme, "menu-label-padding", "padding-top", "padding");
      });
});
