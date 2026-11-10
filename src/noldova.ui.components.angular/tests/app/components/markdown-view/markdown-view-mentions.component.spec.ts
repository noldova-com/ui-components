/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { MarkdownViewComponent } from "../../../../src/app/components/markdown-view/markdown-view.component";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { MentionCandidate } from "../../../../src/app/models/mention-candidate";
import { provideMarkdown } from "../../../../src/app/services/provide-markdown";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

@Component({
  imports: [MarkdownViewComponent],
  template: `<nol-markdown-view [text]="text()" [mentions]="mentions()" [mentionNames]="mentionNames()" />`
})
class MentionsHostComponent {
  public readonly text: WritableSignal<string> = signal(String.empty);
  public readonly mentions: WritableSignal<readonly MentionCandidate[]> = signal([]);
  public readonly mentionNames: WritableSignal<boolean> = signal(true);
}

@Component({
  imports: [MarkdownViewComponent],
  template: `<nol-markdown-view [text]="text" [mentions]="mentions" />`
})
class UnboundMentionNamesHostComponent {
  public readonly text: string = "Ask @Ada and [@Ada](mention:ada), then *@bob*.";
  public readonly mentions: readonly MentionCandidate[] = [new MentionCandidate("ada", "Ada"), new MentionCandidate("bob", "Bob", { unavailable: true })];
}

describe("MarkdownViewComponent's mentions", () => {
  const team: readonly MentionCandidate[] = [new MentionCandidate("ada", "Ada"), new MentionCandidate("bob", "Bob", { unavailable: true })];
  const text = ["Ask @Ada and @bob, not @Nobody or user-1@host-1.example, then **@ADA**.", "", "Code `@Ada` stays.", "", "```", "@Ada", "```"].join("\n");
  let fixture: ComponentFixture<MentionsHostComponent>;
  let host: MentionsHostComponent;

  const view = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), ".nol-markdown-view");
  const marks = (): HTMLElement[] => [...view().querySelectorAll<HTMLElement>(".nol-markdown-mention")];
  const paragraph = (): HTMLElement => DomFixture.one(view(), "p.nol-markdown-paragraph");

  async function renderAsync(mentions: readonly MentionCandidate[], theme = DefaultTheme.theme, mode = ThemeMode.Light): Promise<void> {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(MentionsHostComponent);
    host = fixture.componentInstance;
    host.text.set(text);
    host.mentions.set(mentions);
    await fixture.whenStable();
  }

  beforeEach(() => TestBed.configureTestingModule({ providers: [provideMarkdown()] }));

  afterEach(async () => {
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  it("marks each mention of a candidate, whatever its case, and nothing else, keeping the text as written", async () => {
    await renderAsync(team);

    expect([marks().map(t => [t.textContent, t.parentElement?.tagName, t.classList.contains("nol-markdown-mention-unavailable")]), paragraph().textContent])
      .toEqual([[["@Ada", "P", false], ["@bob", "P", true], ["@ADA", "STRONG", false]], "Ask @Ada and @bob, not @Nobody or user-1@host-1.example, then @ADA."]);
  });

  it("never marks a mention in inline code or a code block", async () => {
    await renderAsync(team);

    expect([view().querySelectorAll("code .nol-markdown-mention, nol-code-block .nol-markdown-mention").length, [...view().querySelectorAll("code")].map(t => t.textContent)])
      .toEqual([0, ["@Ada", "@Ada"]]);
  });

  it("never marks an escaped @, and marks a mention after an escaped backslash or backtick, as the text shows it", async () => {
    await renderAsync(team);
    host.text.set(["\\@Ada stays plain.", "", "\\\\@Ada is marked.", "", "\\` then @Ada is marked."].join("\n"));
    await fixture.whenStable();

    expect([marks().map(t => t.textContent), [...view().querySelectorAll("p.nol-markdown-paragraph")].map(t => t.textContent)])
      .toEqual([["@Ada", "@Ada"], ["@Ada stays plain.", "\\@Ada is marked.", "` then @Ada is marked."]]);
  });

  it("shows a link to a candidate's mention id as its mention, with the link's text as written and its formatting dropped, and one to an unknown id as plain text, never as a link", async () => {
    await renderAsync([...team, new MentionCandidate("agent 7", "Chat Bot")]);
    host.text.set("Ask [@Chat](mention:agent%207), [@Ghost](mention:gone) and [@Bob *Lee*](mention:bob) about **[@Ada](mention:ada)**.");
    await fixture.whenStable();

    expect([marks().map(t => [t.textContent, t.parentElement?.tagName, t.classList.contains("nol-markdown-mention-unavailable")]), view().querySelectorAll("a").length,
      paragraph().textContent]).toEqual([[["@Chat", "P", false], ["@Bob Lee", "P", true], ["@Ada", "STRONG", false]], 0, "Ask @Chat, @Ghost and @Bob Lee about @Ada."]);
  });

  it("marks the longest name of several words, and no name that a / or a . and a word follows", async () => {
    await renderAsync([new MentionCandidate("c", "Chat"), new MentionCandidate("cg", "Chat Bot"), ...team]);
    host.text.set("Ask @Chat Bot, then @chat, not @Ada/notes or @Ada.md, but @Ada.");
    await fixture.whenStable();

    expect(marks().map(t => t.textContent)).toEqual(["@Chat Bot", "@chat", "@Ada"]);
  });

  it("marks a candidate's name in a link's text as its mention, inside the link", async () => {
    await renderAsync(team);
    host.text.set("See [notes by @Ada](https://example.com/notes).");
    await fixture.whenStable();

    expect(marks().map(t => [t.textContent, t.parentElement?.tagName])).toEqual([["@Ada", "A"]]);
  });

  it("marks each mention of a candidate in its text, and its mention links, when mentionNames isn't bound", async () => {
    const unbound = TestBed.createComponent(UnboundMentionNamesHostComponent);
    await unbound.whenStable();

    expect([...DomFixture.host(unbound).querySelectorAll(".nol-markdown-mention")]
      .map(t => [t.textContent, t.parentElement?.tagName, t.classList.contains("nol-markdown-mention-unavailable")]))
      .toEqual([["@Ada", "P", false], ["@Ada", "P", false], ["@bob", "EM", true]]);
  });

  describe("with mentionNames off", () => {
    const named = ["\"@Bob hi\" was quoted, then [@Bob](mention:bob) please, with *@Ada* and *[@Ada](mention:ada)*, then **@Bob** and **[@Bob](mention:bob)**.", "",
      "See [notes by @Ada](https://example.com/notes)."].join("\n");

    async function renderNamedAsync(): Promise<void> {
      await renderAsync(team);
      host.mentionNames.set(false);
      host.text.set(named);
      await fixture.whenStable();
    }

    it("marks only the links to its candidates' mention ids, each with its candidate's unavailable state, and leaves the same name plain everywhere else", async () => {
      await renderNamedAsync();

      expect([marks().map(t => [t.textContent, t.parentElement?.tagName, t.classList.contains("nol-markdown-mention-unavailable")]), paragraph().textContent])
        .toEqual([[["@Bob", "P", true], ["@Ada", "EM", false], ["@Bob", "STRONG", true]], "\"@Bob hi\" was quoted, then @Bob please, with @Ada and @Ada, then @Bob and @Bob."]);
    });

    it("leaves a name in another link's text plain, inside the link", async () => {
      await renderNamedAsync();
      const link = DomFixture.one(view(), "a.nol-markdown-link");

      expect([link.textContent, link.querySelectorAll(".nol-markdown-mention").length]).toEqual(["notes by @Ada", 0]);
    });

    it("marks every name again once mentionNames is back on", async () => {
      await renderNamedAsync();
      const seen: unknown[] = [marks().length];
      host.mentionNames.set(true);
      await fixture.whenStable();
      seen.push(marks().map(t => t.textContent));

      expect(seen).toEqual([3, ["@Bob", "@Bob", "@Ada", "@Ada", "@Bob", "@Bob", "@Ada"]]);
    });
  });

  it("marks nothing without candidates, and follows a change of them", async () => {
    await renderAsync([]);
    const seen: unknown[] = [marks().length];
    host.mentions.set([team[1] as MentionCandidate]);
    await fixture.whenStable();
    seen.push(marks().map(t => t.textContent));
    host.mentions.set([]);
    await fixture.whenStable();
    seen.push(marks().length, paragraph().textContent);

    expect(seen).toEqual([0, ["@bob"], 0, "Ask @Ada and @bob, not @Nobody or user-1@host-1.example, then @ADA."]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`shows a mention in the mention color at weight 600, and an unavailable one at half opacity, in the ${theme.id} theme in ${mode} mode`, async () => {
        await renderAsync(team, theme, mode);
        const mention = AppearanceFixture.readColor(theme, mode, "mention");

        expect(marks().map(t => [getComputedStyle(t).color, getComputedStyle(t).fontWeight, getComputedStyle(t).opacity]))
          .toEqual([[mention, "500", "1"], [mention, "500", "0.5"], [mention, "500", "1"]]);
        expect(getComputedStyle(paragraph()).color).not.toBe(mention);
      });

  for (const mode of AppearanceFixture.modes)
    it(`shows a mention in CanvasText at weight 600 under forced colors, an unavailable one at half opacity, in ${mode} mode`, async () => {
      await renderAsync(team, DefaultTheme.theme, mode);
      await ForcedColorsFixture.activateAsync();
      const canvasText = ForcedColorsFixture.resolve("CanvasText");

      expect(marks().map(t => [getComputedStyle(t).color, getComputedStyle(t).fontWeight, getComputedStyle(t).opacity]))
        .toEqual([[canvasText, "500", "1"], [canvasText, "500", "0.5"], [canvasText, "500", "1"]]);
    });
});
