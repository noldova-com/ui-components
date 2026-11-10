/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LiveAnnouncer } from "@angular/cdk/a11y";
import { Component, type WritableSignal, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { PlanComponent } from "../../../../src/app/components/plan/plan.component";
import { PlanStepStatus } from "../../../../src/app/enums/plan-step-status";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { Plan } from "../../../../src/app/models/plan";
import { PlanStep } from "../../../../src/app/models/plan-step";
import type { Theme } from "../../../../src/app/models/theme";
import { FixtureTheme } from "../../../../src/testing/models/fixture-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";
import { MotionFixture } from "../../../fixtures/motion.fixture";

function planOf(...statuses: PlanStepStatus[]): Plan {
  return new Plan(statuses.map((t, i) => new PlanStep(`Step ${i + 1}`, t, `Doing step ${i + 1}`)));
}

@Component({
  imports: [PlanComponent],
  template: "<div class=\"frame\" [style.width]=\"width()\"><nol-plan [plan]=\"plan()\" [framed]=\"framed()\" /></div>"
})
class PlanHostComponent {
  public readonly plan: WritableSignal<Plan> = signal(planOf(PlanStepStatus.Completed, PlanStepStatus.InProgress, PlanStepStatus.Pending));
  public readonly width: WritableSignal<string> = signal("30rem");
  public readonly framed: WritableSignal<boolean> = signal(true);
}

describe("PlanComponent", () => {
  let fixture: ComponentFixture<PlanHostComponent>;
  let host: PlanHostComponent;
  let announcements: string[];
  let politeness: string[];

  async function renderAsync(plan: Plan = planOf(PlanStepStatus.Completed, PlanStepStatus.InProgress, PlanStepStatus.Pending), width: string = "30rem", framed: boolean = true): Promise<void> {
    announcements = [];
    politeness = [];
    fixture = TestBed.createComponent(PlanHostComponent);
    host = fixture.componentInstance;
    host.plan.set(plan);
    host.width.set(width);
    host.framed.set(framed);
    vi.spyOn(TestBed.inject(LiveAnnouncer), "announce").mockImplementation((message, level) => {
      announcements.push(String(message));
      politeness.push(String(level));
      return Promise.resolve();
    });
    await fixture.whenStable();
  }

  async function bindAsync(plan: Plan): Promise<void> {
    host.plan.set(plan);
    await fixture.whenStable();
  }

  const find = (selector: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), selector);
  const findAll = (selector: string): HTMLElement[] => DomFixture.all(DomFixture.host(fixture), selector);
  const card = (): HTMLElement => find("nol-plan");
  const list = (): HTMLElement => find(".nol-plan-steps");
  const rows = (): HTMLElement[] => findAll(".nol-plan-step");
  const part = (row: HTMLElement | undefined, selector: string): HTMLElement => DomFixture.one(DomFixture.present(row), selector);
  const texts = (): (string | null)[] => findAll(".nol-plan-text").map(t => t.textContent);
  const box = (element: Element): DOMRect => element.getBoundingClientRect();
  const ring = (): HTMLElement => find(".nol-plan-step-in-progress .nol-spinner-ring");

  afterEach(async () => {
    vi.restoreAllMocks();
    AppearanceFixture.reset();
    await MotionFixture.resetAsync();
  });

  it("lists every step in order, in a list named by how many are done, each row named by its shown text and status, with nothing to focus", async () => {
    await renderAsync();

    expect([list().tagName, list().getAttribute("role"), list().getAttribute("aria-label")]).toEqual(["UL", "list", "Plan, 1 of 3 done"]);
    expect(rows().map(t => [t.tagName, t.getAttribute("aria-label")])).toEqual([["LI", "Step 1, done"], ["LI", "Doing step 2, in progress"], ["LI", "Step 3, not started"]]);
    expect(texts()).toEqual(["Step 1", "Doing step 2", "Step 3"]);
    expect(findAll(".nol-plan-marker").map(t => t.getAttribute("aria-hidden"))).toEqual(["true", "true", "true"]);
    expect(findAll("button, a, input, [tabindex]")).toEqual([]);
  });

  it("shows a step in progress by its text when the agent gives no active text, and only a step in progress by its active text", async () => {
    await renderAsync(new Plan([new PlanStep("Read", PlanStepStatus.Completed, "Reading"), new PlanStep("Run the tests", PlanStepStatus.InProgress),
      new PlanStep("Review", PlanStepStatus.Pending, "Reviewing")]));

    expect([texts(), rows().map(t => t.getAttribute("aria-label"))]).toEqual([["Read", "Run the tests", "Review"], ["Read, done", "Run the tests, in progress", "Review, not started"]]);
  });

  it("draws a done step as a circle with the check cut out, a step in progress as the kit's spinner and a step not started as a dashed circle", async () => {
    await renderAsync();
    const [done, working, waiting] = rows();
    const doneCircle = DomFixture.oneOf(DomFixture.present(done), ".nol-plan-mark circle", SVGElement);
    const mask = doneCircle.getAttribute("mask")?.match(/^url\(#(.+)\)$/)?.[1] ?? String.empty;
    const cut = document.getElementById(mask);
    const waitingCircle = getComputedStyle(DomFixture.oneOf(DomFixture.present(waiting), ".nol-plan-mark circle", SVGElement));

    expect([cut?.tagName, cut?.querySelector("path")?.getAttribute("stroke"), cut?.querySelector("circle")?.getAttribute("fill")]).toEqual(["mask", "black", "white"]);
    expect([DomFixture.maybe(DomFixture.present(working), "nol-spinner") !== null, DomFixture.maybe(DomFixture.present(working), ".nol-plan-mark"), DomFixture.maybe(DomFixture.present(done), "nol-spinner"), DomFixture.maybe(DomFixture.present(waiting), "nol-spinner")]).toEqual([true, null, null, null]);
    expect([waitingCircle.fill, waitingCircle.strokeDasharray === "none", waitingCircle.strokeWidth]).toEqual(["none", false, "1.5px"]);
  });

  it("gives each card its own cut-out, so two cards don't share one", async () => {
    await renderAsync();
    const other = TestBed.createComponent(PlanComponent);
    other.componentRef.setInput("plan", planOf(PlanStepStatus.Completed));
    await other.whenStable();
    const masks = [card(), DomFixture.host(other)].map(t => t.querySelector("mask")?.id);
    other.destroy();

    expect(masks[0] === masks[1]).toBe(false);
  });

  it("updates the same rows in place when the owner binds a new plan with the same steps, drawing again only the markers whose status changed, and keeps them when it adds a step", async () => {
    await renderAsync();
    const [before, markers] = [rows(), findAll(".nol-plan-marker")];
    const drawn = markers.map(t => t.firstElementChild);
    await bindAsync(planOf(PlanStepStatus.Completed, PlanStepStatus.Completed, PlanStepStatus.InProgress));

    expect(rows().every((t, i) => t === before[i])).toBe(true);
    expect(findAll(".nol-plan-marker").every((t, i) => t === markers[i])).toBe(true);
    expect(findAll(".nol-plan-marker").map((t, i) => t.firstElementChild === drawn[i])).toEqual([true, false, false]);
    expect([texts(), list().getAttribute("aria-label"), part(before[2], "nol-spinner") !== null]).toEqual([["Step 1", "Step 2", "Doing step 3"], "Plan, 2 of 3 done", true]);

    await bindAsync(planOf(PlanStepStatus.Completed, PlanStepStatus.Completed, PlanStepStatus.Completed, PlanStepStatus.InProgress));

    expect([rows().length, rows().slice(0, 3).every((t, i) => t === before[i]), list().getAttribute("aria-label")]).toEqual([4, true, "Plan, 3 of 4 done"]);
  });

  it("announces nothing for the first plan it shows, then politely each step whose status changed, and Plan updated when the steps themselves changed", async () => {
    await renderAsync();
    const first = [...announcements];
    await bindAsync(planOf(PlanStepStatus.Completed, PlanStepStatus.InProgress, PlanStepStatus.Pending));
    const same = [...announcements];
    await bindAsync(planOf(PlanStepStatus.Completed, PlanStepStatus.Completed, PlanStepStatus.InProgress));
    const moved = [...announcements];
    await bindAsync(planOf(PlanStepStatus.Completed, PlanStepStatus.Completed, PlanStepStatus.InProgress, PlanStepStatus.Pending));
    const added = announcements.slice(moved.length);
    await bindAsync(new Plan([new PlanStep("Step 1", PlanStepStatus.Completed), new PlanStep("Write the docs", PlanStepStatus.Pending), new PlanStep("Step 3", PlanStepStatus.Pending),
      new PlanStep("Step 4", PlanStepStatus.Pending)]));
    await bindAsync(planOf(PlanStepStatus.InProgress));

    expect([first, same, moved.at(-1)]).toEqual([[], [], "Step 2 of 3 done: Step 2. Step 3 of 3 in progress: Doing step 3"]);
    expect([added, announcements.slice(moved.length + 1)]).toEqual([["Plan updated, 4 steps"], ["Plan updated, 4 steps", "Plan updated, 1 step"]]);
    expect(new Set(politeness)).toEqual(new Set(["polite"]));
  });

  it("announces one summary of the plan, not each step, when more than two steps change status at once", async () => {
    await renderAsync(planOf(PlanStepStatus.InProgress, PlanStepStatus.Pending, PlanStepStatus.Pending, PlanStepStatus.Pending));
    await bindAsync(planOf(PlanStepStatus.Completed, PlanStepStatus.Completed, PlanStepStatus.Completed, PlanStepStatus.InProgress));
    const many = [...announcements];
    await bindAsync(planOf(PlanStepStatus.Completed, PlanStepStatus.Completed, PlanStepStatus.Completed, PlanStepStatus.Completed));

    expect([many, announcements.slice(many.length), [...new Set(politeness)]]).toEqual([["Plan, 3 of 4 done"], ["Step 4 of 4 done: Step 4"], ["polite"]]);
  });

  it("wraps a long step's text inside the card, with its marker on the first line", async () => {
    AppearanceFixture.apply();
    const text = "Rename every reminder setting in the notes module to match the settings page, then update the tests";
    await renderAsync(new Plan([new PlanStep(text, PlanStepStatus.Pending)]), "12rem");
    const [marker, shown] = [box(find(".nol-plan-marker")), find(".nol-plan-text")];
    const line = Number.parseFloat(getComputedStyle(shown).lineHeight);

    expect([shown.textContent, box(shown).height > line * 1.5]).toEqual([text, true]);
    expect([card().scrollWidth - card().clientWidth, Math.max(0, box(shown).right - box(card()).right)]).toEqual([0, 0]);
    AppearanceFixture.expectPixels(marker.top - box(shown).top, (line - marker.height) / 2);
  });

  it("turns the spinner of a step in progress still under reduced motion", async () => {
    await renderAsync();
    const moving = getComputedStyle(ring()).animationName;
    await MotionFixture.reduceAsync();

    expect([moving.endsWith("nol-spinner-turn"), getComputedStyle(ring()).animationName]).toEqual([true, "none"]);
  });

  const looks = [["the default theme", DefaultTheme.theme, ThemeMode.Light, false], ["dark mode", DefaultTheme.theme, ThemeMode.Dark, false],
    ["the fixture theme", FixtureTheme.theme, ThemeMode.Light, false], ["forced colors", DefaultTheme.theme, ThemeMode.Light, true]] as const;

  function colorsOf(theme: Theme, mode: ThemeMode, forced: boolean): readonly [string, string, string] {
    if (forced)
      return [ForcedColorsFixture.resolve("CanvasText"), ForcedColorsFixture.resolve("CanvasText"), ForcedColorsFixture.resolve("Highlight")];
    const progress = Object.isUndefined(theme.readColor(mode, "progress")) ? "accent" : "progress";
    return [AppearanceFixture.readColor(theme, mode, "text"), AppearanceFixture.readColor(theme, mode, "text-muted"), AppearanceFixture.readColor(theme, mode, progress)];
  }

  for (const [look, theme, mode, forced] of looks)
    it(`draws each marker 1rem wide, the spinner's ring as wide as the circles, 0.5rem from its text and centred on its line, in rows 1.5rem high inside a card padded 0.25rem by 0.75rem with a border of the border width, in ${look}`,
      async () => {
        AppearanceFixture.apply(theme, mode);
        if (forced)
          await ForcedColorsFixture.activateAsync();
        try {
          await renderAsync();
          const style = getComputedStyle(card());
          const border = Number.parseFloat(style.borderTopWidth);
          const [icon, gap, height, inline, block] = ["icon", "space-2", "space-6", "space-3", "space-1"].map(t => AppearanceFixture.measureLook(t)) as [number, number, number, number, number];
          const shown = rows().map(t => [box(t), box(part(t, ".nol-plan-marker")), box(part(t, ".nol-plan-text"))] as const);
          const spinner = box(find("nol-spinner"));

          expect(style.borderTopStyle).toBe("solid");
          AppearanceFixture.expectPixels(border, AppearanceFixture.measureLook("border-width"));
          AppearanceFixture.expectLook(style.borderTopLeftRadius, theme, "radius-medium", "border-top-left-radius", "border-radius");
          AppearanceFixture.expectPixels((shown[0]?.[0].top ?? 0) - box(card()).top, border + block);
          for (const [row, marker, text] of shown) {
            AppearanceFixture.expectPixels(row.height, height);
            AppearanceFixture.expectPixels(marker.width, icon);
            AppearanceFixture.expectPixels(marker.height, icon);
            AppearanceFixture.expectPixels(marker.left - box(card()).left, border + inline);
            AppearanceFixture.expectPixels(text.left - marker.right, gap);
            AppearanceFixture.expectPixels((marker.top + marker.bottom) / 2, (text.top + text.bottom) / 2);
          }
          AppearanceFixture.expectPixels(spinner.width, icon);
          AppearanceFixture.expectPixels(spinner.height, icon);
          AppearanceFixture.expectPixels(box(ring()).width, icon);
          AppearanceFixture.expectPixels(box(ring()).height, icon);
          AppearanceFixture.expectPixels(box(ring()).left + box(ring()).width / 2, spinner.left + spinner.width / 2);
          AppearanceFixture.expectPixels(box(ring()).top + box(ring()).height / 2, spinner.top + spinner.height / 2);
        }
        finally {
          if (forced)
            await ForcedColorsFixture.resetAsync();
        }
      });

  for (const [look, theme, mode, forced] of looks)
    it(`with framed off, draws no border, radius or padding, so the first row starts at the card's top and start edges and each row keeps its height and its marker's place, in ${look}`,
      async () => {
        AppearanceFixture.apply(theme, mode);
        if (forced)
          await ForcedColorsFixture.activateAsync();
        try {
          await renderAsync(undefined, "30rem", false);
          const style = getComputedStyle(card());
          const [icon, gap, height] = ["icon", "space-2", "space-6"].map(t => AppearanceFixture.measureLook(t)) as [number, number, number];
          const shown = rows().map(t => [box(t), box(part(t, ".nol-plan-marker")), box(part(t, ".nol-plan-text"))] as const);
          const outer = box(card());

          expect([style.borderTopStyle, style.borderInlineStartStyle, style.borderTopLeftRadius, style.paddingTop, style.paddingInlineStart, style.paddingBottom, style.paddingInlineEnd])
            .toEqual(["none", "none", "0px", "0px", "0px", "0px", "0px"]);
          AppearanceFixture.expectPixels(outer.width, box(find(".frame")).width);
          AppearanceFixture.expectPixels((shown[0]?.[0].top ?? 0) - outer.top, 0);
          AppearanceFixture.expectPixels(outer.bottom - (shown.at(-1)?.[0].bottom ?? 0), 0);
          for (const [row, marker, text] of shown) {
            AppearanceFixture.expectPixels(row.height, height);
            AppearanceFixture.expectPixels(row.left - outer.left, 0);
            AppearanceFixture.expectPixels(marker.width, icon);
            AppearanceFixture.expectPixels(marker.left - outer.left, 0);
            AppearanceFixture.expectPixels(text.left - marker.right, gap);
            AppearanceFixture.expectPixels((marker.top + marker.bottom) / 2, (text.top + text.bottom) / 2);
          }
        }
        finally {
          if (forced)
            await ForcedColorsFixture.resetAsync();
        }
      });

  it("goes back to its frame when the owner turns framed on again", async () => {
    AppearanceFixture.apply();
    await renderAsync(undefined, "30rem", false);
    const unframed = getComputedStyle(card()).borderTopStyle;
    host.framed.set(true);
    await fixture.whenStable();

    expect([unframed, getComputedStyle(card()).borderTopStyle, card().classList.contains("nol-plan-unframed")]).toEqual(["none", "solid", false]);
  });

  for (const [look, theme, mode, forced] of looks)
    it(`gives every step's text the same color and weight without strikethrough, the check and the dashed circle the muted color and the spinner the progress color, in ${look}`,
      async () => {
        AppearanceFixture.apply(theme, mode);
        if (forced)
          await ForcedColorsFixture.activateAsync();
        try {
          await renderAsync();
          const [text, muted, progress] = colorsOf(theme, mode, forced);
          const shown = findAll(".nol-plan-text").map(t => getComputedStyle(t)).map(t => [t.color, t.fontWeight, t.textDecorationLine]);
          const marks = DomFixture.allOf(DomFixture.host(fixture), ".nol-plan-mark circle", SVGElement).map(t => getComputedStyle(t)).map(t => t.fill === "none" ? t.stroke : t.fill);

          expect(shown).toEqual(Array.from({ length: 3 }, () => [text, "400", "none"]));
          expect([marks, getComputedStyle(ring()).borderTopColor]).toEqual([[muted, muted], progress]);
        }
        finally {
          if (forced)
            await ForcedColorsFixture.resetAsync();
        }
      });
});
