/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { onTestFinished } from "vitest";
import { userEvent } from "vitest/browser";

import { IconButtonComponent } from "../../../../src/app/components/icon-button/icon-button.component";
import { MenuItemComponent } from "../../../../src/app/components/menu/menu-item.component";
import { MenuComponent } from "../../../../src/app/components/menu/menu.component";
import { SplitButtonComponent } from "../../../../src/app/components/split-button/split-button.component";
import { TooltipDirective } from "../../../../src/app/components/tooltip/tooltip.directive";
import { OverlayAlignment } from "../../../../src/app/enums/overlay-alignment";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { OverlaySide } from "../../../../src/app/models/overlay-side";
import type { Theme } from "../../../../src/app/models/theme";
import { TooltipDefaults } from "../../../../src/app/models/tooltip-defaults";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

@Component({
  imports: [IconButtonComponent, MenuComponent, MenuItemComponent, SplitButtonComponent],
  template: `
    <div class="row" style="position: fixed; top: 100px; left: 200px; display: flex; align-items: center;" [attr.dir]="direction()">
      <nol-split-button icon="add" label="New terminal" [tooltip]="tooltip()" menuLabel="Choose a shell" [menu]="shells" [menuAlignment]="alignment()"
        [tooltipSide]="side()" [disabled]="disabled()" (triggered)="created = created + 1" />
      <button type="button" class="plain" nol-icon-button icon="close" label="Close"></button>
    </div>
    <ng-template #shells>
      <nol-menu class="shells">
        <button nol-menu-item class="bash" label="Bash"></button>
        <button nol-menu-item class="pwsh" label="PowerShell"></button>
      </nol-menu>
    </ng-template>
  `
})
class SplitButtonHostComponent {
  public readonly tooltip = signal<string | null>(null);
  public readonly alignment = signal(OverlayAlignment.Start);
  public readonly side = signal(OverlaySide.above);
  public readonly disabled = signal(false);
  public readonly direction = signal<string | null>(null);
  public created: number = 0;
}

describe("SplitButtonComponent", () => {
  let fixture: ComponentFixture<SplitButtonHostComponent>;

  async function renderAsync(theme = DefaultTheme.theme, mode = ThemeMode.Light): Promise<void> {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(SplitButtonHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  afterEach(async () => {
    fixture.destroy();
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  const host = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), "nol-split-button");
  const main = (): HTMLButtonElement => DomFixture.oneOf(DomFixture.host(fixture), ".nol-split-button-main", HTMLButtonElement);
  const arrow = (): HTMLButtonElement => DomFixture.oneOf(DomFixture.host(fixture), ".nol-split-button-arrow", HTMLButtonElement);
  const plain = (): HTMLButtonElement => DomFixture.oneOf(DomFixture.host(fixture), ".plain", HTMLButtonElement);
  const pad = (element: Element): CSSStyleDeclaration => getComputedStyle(element, "::before");
  const outline = (): CSSStyleDeclaration => getComputedStyle(host(), "::before");
  const edge = (): CSSStyleDeclaration => getComputedStyle(arrow(), "::after");
  const menu = (): HTMLElement | null => document.querySelector<HTMLElement>(".cdk-overlay-container nol-menu.shells");
  const tooltipOf = (selector: string): TooltipDirective => fixture.debugElement.query(By.css(selector)).injector.get(TooltipDirective);
  const expectCorners = (style: CSSStyleDeclaration, expected: readonly number[]): void => {
    const corners = [style.borderTopLeftRadius, style.borderBottomLeftRadius, style.borderTopRightRadius, style.borderBottomRightRadius];
    corners.forEach((t, index) => AppearanceFixture.expectPixels(Number.parseFloat(t), expected[index] ?? Number.NaN));
  };
  const resolveFill = (name: string): string => {
    const probe = fixture.nativeElement.appendChild(document.createElement("span")) as HTMLElement;
    probe.style.backgroundColor = `var(--nol-${name})`;
    const resolved = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return resolved;
  };

  function expectRestGeometry(theme: Theme): void {
    const [first, second, icon] = [main().getBoundingClientRect(), arrow().getBoundingClientRect(), plain().getBoundingClientRect()];
    const radius = AppearanceFixture.measureLook("radius-small");

    AppearanceFixture.expectPixels(second.left, first.right);
    AppearanceFixture.expectPixels(second.top, first.top);
    for (const half of [first, second]) {
      AppearanceFixture.expectPixels(half.height, icon.height);
      expect(half.width).toBeGreaterThanOrEqual(24);
    }
    for (const [element, box] of [[main(), first], [arrow(), second]] as const) {
      AppearanceFixture.expectLook(pad(element).height, theme, "icon-button", "height");
      AppearanceFixture.expectPixels(Number.parseFloat(pad(element).width), box.width);
      AppearanceFixture.expectPixels(Number.parseFloat(pad(element).height), Number.parseFloat(pad(plain()).height));
    }
    expectCorners(pad(main()), [radius, radius, 0, 0]);
    expectCorners(pad(arrow()), [0, 0, radius, radius]);
    expect([outline().outlineStyle, edge().visibility]).toEqual(["none", "hidden"]);
  }

  function expectHoverGeometry(theme: Theme): void {
    expect([Number.parseFloat(outline().outlineOffset), edge().justifySelf]).toEqual([0, "start"]);
    AppearanceFixture.expectLook(outline().outlineWidth, theme, "border-width", "outline-width");
    AppearanceFixture.expectPixels(Number.parseFloat(outline().width), host().getBoundingClientRect().width);
    AppearanceFixture.expectPixels(Number.parseFloat(outline().width), main().getBoundingClientRect().width + arrow().getBoundingClientRect().width);
    AppearanceFixture.expectLook(outline().height, theme, "icon-button", "height");
    AppearanceFixture.expectLook(outline().borderTopLeftRadius, theme, "radius-small", "border-top-left-radius");
    AppearanceFixture.expectLook(edge().width, theme, "border-width", "width");
    AppearanceFixture.expectLook(edge().height, theme, "icon-button", "height");
  }

  async function openAsync(): Promise<void> {
    arrow().click();
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it("is two native buttons in the tab order, each named, the main one emitting triggered and the arrow opening its menu", async () => {
    await renderAsync();
    main().focus();
    await userEvent.tab();
    const focused = document.activeElement;
    main().click();

    expect([main().tagName, main().type, main().getAttribute("aria-label"), main().querySelector(".nol-icon-button-glyph")?.textContent]).toEqual(["BUTTON", "button", "New terminal", "add"]);
    expect([arrow().tagName, arrow().type, arrow().getAttribute("aria-label"), arrow().querySelector(".nol-icon-button-glyph")?.textContent])
      .toEqual(["BUTTON", "button", "Choose a shell", "expand_more"]);
    expect([focused, fixture.componentInstance.created, menu()]).toEqual([arrow(), 1, null]);
    expect([arrow().getAttribute("aria-haspopup"), arrow().getAttribute("aria-expanded")]).toEqual(["menu", "false"]);

    await openAsync();

    expect([menu() !== null, arrow().getAttribute("aria-expanded"), fixture.componentInstance.created]).toEqual([true, "true", 1]);
  });

  it("gives the main half its label as its tooltip, or the tooltip it is given, and the arrow its name, both on the side it is given", async () => {
    await renderAsync();

    expect([tooltipOf(".nol-split-button-main").text(), tooltipOf(".nol-split-button-arrow").text()]).toEqual(["New terminal", "Choose a shell"]);
    expect([tooltipOf(".nol-split-button-main").side(), tooltipOf(".nol-split-button-arrow").side()]).toEqual([OverlaySide.above, OverlaySide.above]);

    fixture.componentInstance.tooltip.set("New terminal (Ctrl+Shift+5)");
    fixture.componentInstance.side.set(OverlaySide.below);
    fixture.detectChanges();

    expect([tooltipOf(".nol-split-button-main").text(), tooltipOf(".nol-split-button-arrow").text()]).toEqual(["New terminal (Ctrl+Shift+5)", "Choose a shell"]);
    expect([tooltipOf(".nol-split-button-main").side(), tooltipOf(".nol-split-button-arrow").side()]).toEqual([OverlaySide.below, OverlaySide.below]);
  });

  it("puts both tooltips on the tooltip's standard side when it is given no side", async () => {
    await renderAsync();
    const bare = TestBed.createComponent(SplitButtonComponent);
    onTestFinished(() => bare.destroy());
    for (const [name, value] of [["icon", "add"], ["label", "New terminal"], ["menuLabel", "Choose a shell"], ["menu", null]] as const)
      bare.componentRef.setInput(name, value);
    bare.detectChanges();

    expect(bare.debugElement.queryAll(By.directive(TooltipDirective)).map(t => t.injector.get(TooltipDirective).side()))
      .toEqual([TooltipDefaults.standard.side, TooltipDefaults.standard.side]);
  });

  it("marks only its main half unavailable when disabled: it stays focusable, looks disabled and emits nothing, while the arrow still opens the menu", async () => {
    await renderAsync();
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    main().focus();
    main().click();

    expect([main().getAttribute("aria-disabled"), document.activeElement, getComputedStyle(main()).opacity, fixture.componentInstance.created]).toEqual(["true", main(), "0.5", 0]);
    expect([arrow().hasAttribute("aria-disabled"), getComputedStyle(arrow()).opacity]).toEqual([false, "1"]);

    await openAsync();

    expect(menu()).not.toBeNull();
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`joins its halves with no gap, each an icon button high and its pad filling it, with square inner corners and no outline at rest, in the ${theme.id} theme in ${mode} mode`, async () => {
        await renderAsync(theme, mode);

        expectRestGeometry(theme);
      });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`wraps both pads in one widget-border outline with an edge between them, and fills only the hovered half, in the ${theme.id} theme in ${mode} mode`, async () => {
        await renderAsync(theme, mode);
        const border = AppearanceFixture.readColor(theme, mode, "widget-border");
        const fill = resolveFill("toolbar-hover");

        for (const [hovered, other] of [[main(), arrow()], [arrow(), main()]] as const) {
          await userEvent.hover(hovered);

          expect([outline().outlineStyle, outline().outlineColor, edge().visibility, edge().backgroundColor]).toEqual(["solid", border, "visible", border]);
          expectHoverGeometry(theme);
          expect([pad(hovered).backgroundColor, pad(other).backgroundColor]).toEqual([fill, "rgba(0, 0, 0, 0)"]);
        }
      });

  it("keeps the outline and fills the arrow while its menu is open, with the pointer away", async () => {
    await renderAsync();
    await openAsync();
    const park = await AppearanceFixture.parkPointerAsync();
    onTestFinished(() => park.remove());

    expect([outline().outlineStyle, edge().visibility, pad(arrow()).backgroundColor, pad(main()).backgroundColor])
      .toEqual(["solid", "visible", resolveFill("toolbar-hover"), "rgba(0, 0, 0, 0)"]);
  });

  for (const [alignment, name, edgeOf] of [[OverlayAlignment.Start, "start", (t: DOMRect) => t.left], [OverlayAlignment.End, "end", (t: DOMRect) => t.right]] as const)
    it(`opens the menu below the arrow, lined up with its ${name}`, async () => {
      await renderAsync();
      fixture.componentInstance.alignment.set(alignment);
      fixture.detectChanges();
      await openAsync();
      const [shown, anchor] = [(menu() as HTMLElement).getBoundingClientRect(), arrow().getBoundingClientRect()];

      expect(shown.top).toBeGreaterThanOrEqual(anchor.bottom - 1);
      expect(Math.abs(edgeOf(shown) - edgeOf(anchor))).toBeLessThanOrEqual(1);
    });

  it("puts the arrow before the main half right to left, with the main half's square corners on its left", async () => {
    await renderAsync();
    fixture.componentInstance.direction.set("rtl");
    fixture.detectChanges();
    const [first, second] = [main().getBoundingClientRect(), arrow().getBoundingClientRect()];
    const radius = AppearanceFixture.measureLook("radius-small");

    AppearanceFixture.expectPixels(second.right, first.left);
    expectCorners(pad(main()), [0, 0, radius, radius]);
    expectCorners(pad(arrow()), [radius, radius, 0, 0]);
  });

  for (const mode of AppearanceFixture.modes)
    it(`keeps its geometry and draws the outline and the edge in ButtonText and the open arrow in Highlight under forced colors in ${mode} mode`, async () => {
      await renderAsync(DefaultTheme.theme, mode);
      await ForcedColorsFixture.activateAsync();

      expectRestGeometry(DefaultTheme.theme);

      await userEvent.hover(main());
      const text = ForcedColorsFixture.resolve("ButtonText");

      expect([outline().outlineStyle, outline().outlineColor, edge().visibility, edge().backgroundColor]).toEqual(["solid", text, "visible", text]);
      expectHoverGeometry(DefaultTheme.theme);
      expect([pad(main()).outlineStyle, pad(main()).outlineColor]).toEqual(["dashed", ForcedColorsFixture.resolve("Highlight")]);

      await openAsync();
      const park = await AppearanceFixture.parkPointerAsync();
      onTestFinished(() => park.remove());

      expect([pad(arrow()).backgroundColor, getComputedStyle(arrow()).color, outline().outlineColor])
        .toEqual([ForcedColorsFixture.resolve("Highlight"), ForcedColorsFixture.resolve("HighlightText"), text]);
    });
});
