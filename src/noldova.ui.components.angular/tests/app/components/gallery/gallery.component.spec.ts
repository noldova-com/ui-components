/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, DebugElement, type Type, isSignal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { userEvent } from "vitest/browser";

import { GalleryCellComponent, GalleryComponent, GallerySpecimenComponent } from "../../../../src/api/gallery";
import * as kit from "../../../../src/api/index";
import { GalleryContentComponent } from "../../../../src/app/components/gallery/gallery-content.component";
import { GalleryFormsComponent } from "../../../../src/app/components/gallery/gallery-forms.component";
import { GalleryMessageComponent } from "../../../../src/app/components/gallery/gallery-message.component";
import { GalleryNavigationComponent } from "../../../../src/app/components/gallery/gallery-navigation.component";
import { GalleryOverlaysComponent } from "../../../../src/app/components/gallery/gallery-overlays.component";
import { GalleryResources } from "../../../../src/app/components/gallery/gallery-resources";
import { GalleryTokens } from "../../../../src/app/components/gallery/gallery-tokens";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { CodeHighlighterTokens } from "../../../../src/app/models/code-highlighter-tokens";
import { MarkdownViewTokens } from "../../../../src/app/models/markdown-view-tokens";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { GalleryFixture } from "../../../fixtures/gallery.fixture";

@Component({
  selector: "test-first-section",
  imports: [GalleryCellComponent, GallerySpecimenComponent, kit.SelectComponent],
  template: `
    <nol-gallery-specimen name="Consumer">
      <nol-gallery-cell caption="Default">
        <span class="test-probe" style="color: var(--nol-text)">Probe</span>
        <nol-select [options]="options" value="one" label="Choice" />
      </nol-gallery-cell>
    </nol-gallery-specimen>
  `
})
class FirstSectionComponent {
  protected readonly options: readonly kit.SelectOption[] = [new kit.SelectOption("one", "One"), new kit.SelectOption("two", "Two")];
}

@Component({
  selector: "test-overlay-section",
  imports: [kit.SelectComponent, kit.TooltipDirective],
  template: `
    <button type="button" nolTooltip="Saves the open file">Save</button>
    <nol-select [options]="options" value="one" label="Choice" />
  `
})
class OverlaySectionComponent {
  protected readonly options: readonly kit.SelectOption[] = [new kit.SelectOption("one", "One"), new kit.SelectOption("two", "Two")];
}

@Component({
  selector: "test-second-section",
  template: ""
})
class SecondSectionComponent {
}

const kitSectionControls: readonly { readonly section: Type<unknown>; readonly controls: readonly string[] }[] = [
  {
    section: GalleryFormsComponent,
    controls: ["ButtonComponent", "CheckboxComponent", "ChipComponent", "ChoicePillsComponent", "ChoiceRowComponent", "ConfigurationTableActionDirective",
      "ConfigurationTableComponent", "ConfigurationTableDirective", "ConfigurationTableFillDirective", "ConfigurationTableRowActionsDirective",
      "ConfigurationTableShareDirective", "FieldMessageComponent", "IconButtonComponent", "MenuTriggerDirective", "MeterComponent", "ProgressComponent",
      "RadioComponent", "RadioGroupComponent", "RevealDelayDirective", "SelectComponent", "SpinnerComponent", "SplitButtonComponent", "SwitchComponent", "TextFieldBoxComponent", "TextFieldComponent",
      "TextFieldEndDirective", "TooltipDirective"]
  },
  {
    section: GalleryNavigationComponent,
    controls: ["AvatarComponent", "CodeBlockComponent", "FileBadgeComponent", "GroupHeaderComponent", "InlineCodeComponent", "MessageActionDirective",
      "MessageComponent", "MessageFooterEndDirective", "MessageImageDirective", "MessageSlotDirective", "PanelCardComponent", "SashComponent",
      "SectionHeaderComponent", "TabComponent", "ToolbarButtonComponent", "ToolbarDirective", "ToolbarItemDirective", "TreeComponent", "ViewBadgeComponent",
      "VirtualListComponent", "VirtualRowDirective"]
  },
  {
    section: GalleryOverlaysComponent,
    controls: ["CompletionListComponent", "ContextMenuTriggerDirective", "DialogComponent", "DialogDescriptionDirective", "DockingGuideComponent", "DockingPlateComponent",
      "KeptOpenMenuItemDirective", "MentionFieldDirective", "MenuBarComponent", "MenuBarItemComponent", "MenuComponent", "MenuGroupActionDirective",
      "MenuGroupComponent", "MenuItemComponent", "MenuOpensOnDirective", "MenuSeparatorComponent", "PopoverDirective", "PopoverTriggerDirective",
      "QuickInputComponent", "TooltipComponent"]
  },
  {
    section: GalleryContentComponent,
    controls: ["CardComponent", "DiffViewComponent", "PermissionCardComponent", "PlanComponent", "ShellRunOutputDirective", "TerminalOutputComponent", "ToolCallComponent", "ToolCallOutputDirective"]
  }
];

describe("GalleryComponent", () => {
  let fixture: ComponentFixture<GalleryComponent>;

  afterEach(() => {
    AppearanceFixture.reset();
  });

  it("colors the code in its code blocks though the app provides no code highlighting", async () => {
    GalleryFixture.standInForTheKitSections(GalleryContentComponent);
    fixture = await GalleryFixture.showScopeAsync();
    await fixture.whenStable();
    const colored = DomFixture.host(fixture).querySelectorAll("nol-code-block .nol-code-line > span");

    expect(TestBed.inject(CodeHighlighterTokens.highlighter)).toBeNull();
    expect(colored.length).toBeGreaterThan(0);
  });

  it("draws the Markdown of its messages though the app provides no Markdown", async () => {
    TestBed.overrideProvider(GalleryTokens.kitSections, { useValue: [GalleryMessageComponent] });
    fixture = await GalleryFixture.showScopeAsync();
    await fixture.whenStable();

    expect([TestBed.inject(MarkdownViewTokens.parser), DomFixture.host(fixture).querySelectorAll("nol-message strong").length > 0]).toEqual([null, true]);
  });

  it("shows the controls once for each theme in light and in dark, each scope named for them", async () => {
    GalleryFixture.standInForTheKitSections();
    fixture = await GalleryFixture.showAsync();

    expect(GalleryFixture.frames(fixture).map(t => t.getAttribute("aria-label"))).toEqual(["Default, light mode", "Default, dark mode", "Fixture, light mode", "Fixture, dark mode"]);
    expect(GalleryFixture.frames(fixture).map(t => [t.dataset["theme"], t.dataset["mode"]])).toEqual([
      ["noldova.default", "Light"], ["noldova.default", "Dark"], ["fixture.contrast", "Light"], ["fixture.contrast", "Dark"]
    ]);
    expect(GalleryFixture.frames(fixture).every(t => t.querySelector("nol-gallery-forms") !== null && t.querySelector("nol-gallery-navigation") !== null && t.querySelector("nol-gallery-overlays") !== null && t.querySelector("nol-gallery-content") !== null)).toBe(true);
  });

  it("draws each scope's title and its sections' names in the scope's strong text color, and its other text in its text color", async () => {
    fixture = await showSectionsAsync();

    const colors = (frame: HTMLElement): string[] => [frame, ...frame.querySelectorAll(".nol-gallery-scope-title, .nol-gallery-specimen-name")].map(t => getComputedStyle(t).color);
    expect(GalleryFixture.frames(fixture).map(colors)).toEqual(GalleryFixture.frames(fixture).map(frame => {
      const [theme, mode] = [AppearanceFixture.themes.find(t => t.id === frame.dataset["theme"]) as kit.Theme, frame.dataset["mode"] as ThemeMode];
      return colors(frame).map((_, index) => AppearanceFixture.readColor(theme, mode, index === 0 ? "text" : "text-strong"));
    }));
    expect(GalleryFixture.frames(fixture).map(frame => frame.querySelectorAll(".nol-gallery-scope-title").length === 1 && frame.querySelectorAll(".nol-gallery-specimen-name").length === 1))
      .toEqual(GalleryFixture.frames(fixture).map(() => true));
  });

  it("draws every specimen's name in a kit section, the navigation's, in its scope's strong text color", async () => {
    const theme = AppearanceFixture.themes[0] as kit.Theme;
    GalleryFixture.standInForTheKitSections(GalleryNavigationComponent);
    fixture = await GalleryFixture.showAsync([theme], [ThemeMode.Dark]);
    const frame = GalleryFixture.frames(fixture)[0] as HTMLElement;
    const names = [...frame.querySelectorAll("nol-gallery-navigation .nol-gallery-specimen-name")].map(t => getComputedStyle(t).color);
    const [strong, text] = [AppearanceFixture.readColor(theme, ThemeMode.Dark, "text-strong"), AppearanceFixture.readColor(theme, ThemeMode.Dark, "text")];

    expect([names.length > 1, [...new Set(names)], strong === text]).toEqual([true, [strong], false]);
  });

  const modeScopes: readonly (readonly [readonly ThemeMode[], readonly string[]])[] = [
    [[ThemeMode.Dark], ["Default, dark mode", "Fixture, dark mode"]],
    [[ThemeMode.Dark, ThemeMode.Light], ["Default, dark mode", "Default, light mode", "Fixture, dark mode", "Fixture, light mode"]]
  ];

  for (const [modes, labels] of modeScopes)
    it(`shows each theme only in the modes it is given, ${modes.join(" then ")}, in that order`, async () => {
      GalleryFixture.standInForTheKitSections();
      fixture = await GalleryFixture.showAsync(AppearanceFixture.themes, modes);

      expect(GalleryFixture.frames(fixture).map(t => t.getAttribute("aria-label"))).toEqual(labels);
    });

  const showSectionsAsync = async (themes: readonly kit.Theme[] = AppearanceFixture.themes): Promise<ComponentFixture<GalleryComponent>> => {
    GalleryFixture.standInForTheKitSections();
    const shown = TestBed.createComponent(GalleryComponent);
    shown.componentRef.setInput("themes", themes);
    shown.componentRef.setInput("sections", [FirstSectionComponent, SecondSectionComponent]);
    shown.detectChanges();
    await shown.whenStable();
    return shown;
  };

  it("shows a consumer's sections once in every scope, after the kit's own and in the order given", async () => {
    fixture = await showSectionsAsync();

    expect(GalleryFixture.frames(fixture).map(t => [...t.querySelectorAll(":scope > :not(.cdk-overlay-container)")].slice(-3).map(child => child.localName))).toEqual(Array.from({ length: 4 }, () =>
      ["nol-gallery-content", "test-first-section", "test-second-section"]));
  });

  it("gives a consumer's section the theme and mode of each scope", async () => {
    fixture = await showSectionsAsync();
    const frames = GalleryFixture.frames(fixture);
    const probes = frames.map(t => DomFixture.one(t, ".test-probe"));

    expect(probes.map(t => getComputedStyle(t).color)).toEqual(frames.map((t, index) => GalleryFixture.colorOf(t, "color", ["#3B3B3B", "#BDBDBD", "#A00610", "#2006A0"][index] as string)));
    expect(probes.map(t => getComputedStyle(t).colorScheme)).toEqual(["light", "dark", "light", "dark"]);
  });

  it("opens a consumer section's overlays inside each scope", async () => {
    fixture = await showSectionsAsync([kit.DefaultTheme.theme]);

    for (const frame of GalleryFixture.frames(fixture)) {
      DomFixture.oneOf(frame, "test-first-section .nol-select-button", HTMLButtonElement).click();
      await fixture.whenStable();
      const option = DomFixture.maybe(frame, ".cdk-overlay-container .nol-select-option");

      expect(option?.textContent?.trim()).toBe("One");
      expect(getComputedStyle(option as HTMLElement).getPropertyValue("--nol-text")).toBe(getComputedStyle(frame).getPropertyValue("--nol-text"));
      await userEvent.keyboard("{Escape}");
      await fixture.whenStable();
    }
  });

  it("opens a kit section's tooltip and select list inside each scope, in its theme and mode", async () => {
    TestBed.overrideProvider(GalleryTokens.kitSections, { useValue: [OverlaySectionComponent] });
    fixture = await GalleryFixture.showAsync([kit.DefaultTheme.theme]);
    const tooltips = fixture.debugElement.queryAll(By.directive(kit.TooltipDirective)).map(t => t.injector.get(kit.TooltipDirective));
    const opened: unknown[] = [];
    const texts: string[] = [];

    for (const [index, frame] of GalleryFixture.frames(fixture).entries()) {
      DomFixture.at(tooltips, index).show();
      DomFixture.one(frame, ".nol-select-button").click();
      await fixture.whenStable();
      const textOf = (element: HTMLElement): string => getComputedStyle(element).getPropertyValue("--nol-text");
      const tooltip = DomFixture.one(frame, ".cdk-overlay-container nol-tooltip");
      const option = DomFixture.one(frame, ".cdk-overlay-container .nol-select-option");
      opened.push([frame.dataset["mode"], textOf(tooltip) === textOf(frame), textOf(option) === textOf(frame), option.textContent?.trim()]);
      texts.push(textOf(frame));
      DomFixture.at(tooltips, index).hide();
      await userEvent.keyboard("{Escape}");
      await fixture.whenStable();
    }

    expect(opened).toEqual([["Light", true, true, "One"], ["Dark", true, true, "One"]]);
    expect(new Set(texts).size).toBe(2);
  });

  it("shows the default theme alone when it is given no others", async () => {
    GalleryFixture.standInForTheKitSections();
    fixture = TestBed.createComponent(GalleryComponent);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(GalleryFixture.frames(fixture).map(t => t.getAttribute("aria-label"))).toEqual(["Default, light mode", "Default, dark mode"]);
  });

  it("lists every component and directive the kit exports once, under one of the kit's sections in a scope's order, so a new control fails until a section shows it", () => {
    const controls = Object.entries(kit).filter(([, value]) => typeof value === "function" && ("ɵcmp" in value || "ɵdir" in value)).map(([name]) => name);
    const listed = kitSectionControls.flatMap(t => t.controls);

    expect(controls.length).toBeGreaterThan(20);
    expect([...listed].sort()).toEqual([...controls].sort());
    expect(kitSectionControls.map(t => t.section)).toEqual(GalleryFixture.kitSections);
  });

  it.each(kitSectionControls.map(t => ({ name: t.section.name, ...t })))("shows every control listed under the kit's $name in a scope", async ({ section, controls }) => {
    GalleryFixture.standInForTheKitSections(section);
    GalleryFixture.standInForTheCodeHighlighter();
    fixture = await GalleryFixture.showScopeAsync();
    const nodes = fixture.debugElement.queryAllNodes(By.all());
    const placed = new Set<unknown>(nodes.flatMap(t => t.providerTokens));
    const owners = new Set<object>(nodes.filter(t => t instanceof DebugElement).flatMap(t => (t.componentInstance as object | null) ?? []));
    const held = [...owners].flatMap(t => Object.values(t)).filter(isSignal).map(t => t());
    const isShown = (type: Type<unknown>): boolean => placed.has(type) || held.some(t => t instanceof type);

    const missing = controls.filter(t => !isShown((kit as Record<string, unknown>)[t] as Type<unknown>));

    expect(controls.length).toBeGreaterThan(0);
    expect(missing).toEqual([]);
  });

  it.each(GalleryFixture.kitSections.map(t => ({ name: t.name, kitSection: t })))("gives every section in the kit's $name a long-text row, except a section marked noLongText, which has none", async ({ kitSection }) => {
    GalleryFixture.standInForTheCodeHighlighter();
    const root: HTMLElement = DomFixture.host(await GalleryFixture.showSectionAsync<unknown>(kitSection));
    const sections = [...root.querySelectorAll("nol-gallery-specimen")];
    const label = (section: Element): string => section.querySelector(".nol-gallery-specimen")?.getAttribute("aria-label") ?? "";
    const hasLongText = (section: Element): boolean => section.querySelector(".nol-gallery-specimen-long nol-gallery-cell[aria-label=\"Long text\"]") !== null;

    expect(sections.length).toBeGreaterThan(0);
    expect(sections.map(t => `${label(t)}: ${hasLongText(t)}`)).toEqual(sections.map(t => `${label(t)}: ${!t.hasAttribute(GalleryResources.noLongTextAttribute)}`));
  });

  it.each(GalleryFixture.kitSections.map(t => ({ name: t.name, kitSection: t })))("keeps each long-text specimen in the kit's $name at most 12rem wide and inside its cell, with nothing spilling out of it", async ({ kitSection }) => {
    const root: HTMLElement = DomFixture.host(await GalleryFixture.showSectionAsync<unknown>(kitSection));
    const limit = 12 * Number.parseFloat(getComputedStyle(document.documentElement).fontSize) + 0.5;
    const cells = [...root.querySelectorAll<HTMLElement>(".nol-gallery-specimen-long nol-gallery-cell")];
    const misfits = cells.flatMap(cell => {
      const name = cell.closest(".nol-gallery-specimen")?.getAttribute("aria-label") ?? "";
      const specimen = DomFixture.one(cell, ".nol-gallery-cell-specimen > *");
      const box = specimen.getBoundingClientRect();
      const edges = cell.getBoundingClientRect();
      const spills = getComputedStyle(specimen).overflowX === "visible" && specimen.scrollWidth > specimen.clientWidth;
      const fits = box.width <= limit && box.left >= edges.left - 0.5 && box.right <= edges.right + 0.5 && !spills;
      return fits ? [] : [name];
    });

    expect(cells.length).toBeGreaterThan(0);
    expect(misfits).toEqual([]);
  });

  it("shows its tool call with nothing to show whole on its line, with no twistie", async () => {
    GalleryFixture.standInForTheCodeHighlighter();
    const content = await GalleryFixture.showSectionAsync(GalleryContentComponent);
    await content.whenStable();
    const root: HTMLElement = DomFixture.host(content);
    const cell = root.querySelector<HTMLElement>(`nol-gallery-cell[aria-label="${GalleryResources.text.toolCallNothingCaption}"]`);
    const title = cell?.querySelector<HTMLElement>(".nol-tool-call-title");

    expect([cell?.querySelector("nol-tool-call")?.classList.contains("nol-tool-call-static"), title?.textContent, (title?.scrollWidth ?? 1) <= (title?.clientWidth ?? 0)])
      .toEqual([true, GalleryResources.text.toolCallNothingTitle, true]);
  });
});
