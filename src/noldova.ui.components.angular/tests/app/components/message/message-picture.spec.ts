/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { userEvent } from "vitest/browser";

import { MessageComponent } from "../../../../src/app/components/message/message.component";
import { MessageAuthorKind } from "../../../../src/app/enums/message-author-kind";
import { MessageLayout } from "../../../../src/app/enums/message-layout";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { MessageAttachment } from "../../../../src/app/models/message-attachment";
import { MessageAttachmentPicture } from "../../../../src/app/models/message-attachment-picture";
import { MessageAuthor } from "../../../../src/app/models/message-author";
import type { MessageBlock } from "../../../../src/app/models/message-block";
import { MessageText } from "../../../../src/app/models/message-text";
import { provideMarkdown } from "../../../../src/app/services/provide-markdown";
import { FixtureTheme } from "../../../../src/testing/models/fixture-theme";
import { TooltipFixture } from "../../../../src/testing/models/tooltip-fixture";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { AccessibilityFixture } from "../../../fixtures/accessibility.fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

@Component({
  imports: [MessageComponent],
  template: `
    <div style="width: 30rem; padding-top: 10rem">
      <nol-message [author]="author()" [time]="time" [blocks]="blocks()" [layout]="layout()" (attachmentOpen)="opened.push($event)"
        (contextMenuRequest)="menus.push($event.attachmentId)" />
    </div>
  `
})
class PictureHostComponent {
  public readonly author: WritableSignal<MessageAuthor> = signal(new MessageAuthor("ada", "Ada", MessageAuthorKind.Agent));
  public readonly time: Date = new Date(Date.now() - 60_000);
  public readonly blocks: WritableSignal<readonly MessageBlock[]> = signal([]);
  public readonly layout: WritableSignal<MessageLayout> = signal(MessageLayout.Row);
  public readonly opened: string[] = [];
  public readonly menus: (string | null)[] = [];
}

describe("MessageComponent with a picture attachment", () => {
  let fixture: ComponentFixture<PictureHostComponent>;
  let host: PictureHostComponent;

  beforeEach(() => TestBed.configureTestingModule({ providers: [provideMarkdown(), TooltipFixture.atOnce] }));

  afterEach(async () => {
    await ForcedColorsFixture.resetAsync();
    AppearanceFixture.reset();
  });

  const sizes = [[2000, 500], [400, 1600], [120, 80], [16, 16], [600, 10], [10, 600]] as const;

  function pngOf(width: number, height: number): string {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (context === null)
      throw new Error("The canvas has no 2D context.");
    context.fillStyle = "#3080c0";
    context.fillRect(0, 0, width, height);
    return canvas.toDataURL("image/png");
  }

  function blocksOf(source: (width: number, height: number) => string): MessageBlock[] {
    return [new MessageText("Look at these."), ...sizes.map(([width, height]) =>
      new MessageAttachment(`p${width}`, `shot-${width}.png`, 1000, "PNG image", null, `C:/shots/shot-${width}.png`, new MessageAttachmentPicture(source(width, height), width, height))),
    new MessageAttachment("f1", "notes.txt", 12, "Text")];
  }

  async function renderAsync(layout: MessageLayout, blocks: readonly MessageBlock[]): Promise<void> {
    fixture = TestBed.createComponent(PictureHostComponent);
    host = fixture.componentInstance;
    host.layout.set(layout);
    host.author.set(new MessageAuthor("ada", "Ada", layout === MessageLayout.Bubble ? MessageAuthorKind.Person : MessageAuthorKind.Agent));
    host.blocks.set(blocks);
    await fixture.whenStable();
  }

  const all = (selector: string): HTMLElement[] => [...DomFixture.host(fixture).querySelectorAll<HTMLElement>(selector)];
  const find = (selector: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), selector);
  const images = (): HTMLImageElement[] => [...DomFixture.host(fixture).querySelectorAll<HTMLImageElement>(".nol-message-picture-image")];
  const loadAsync = (): Promise<void[]> => Promise.all(images().map(t => t.decode()));
  const boxesOf = (selector: string): number[][] => {
    const message = find("nol-message").getBoundingClientRect();
    return all(selector).map(t => {
      const box = t.getBoundingClientRect();
      return [box.left - message.left, box.top - message.top, box.width, box.height];
    });
  };

  const looks = [["the default theme", DefaultTheme.theme, ThemeMode.Light, false], ["dark mode", DefaultTheme.theme, ThemeMode.Dark, false],
    ["the fixture theme", FixtureTheme.theme, ThemeMode.Light, false], ["forced colors", DefaultTheme.theme, ThemeMode.Light, true]] as const;

  for (const [look, theme, mode, forced] of looks)
    for (const layout of [MessageLayout.Bubble, MessageLayout.Column, MessageLayout.Row])
      it(`shows a picture as wide as its image at its aspect ratio, never wider than the content nor taller than the picture height, in a 1px border with medium corners, in a ${layout} in ${look}`, async () => {
        AppearanceFixture.apply(theme, mode);
        if (forced)
          await ForcedColorsFixture.activateAsync();
        await renderAsync(layout, blocksOf(pngOf));
        await loadAsync();
        const content = find(".nol-message-content");
        const contentStyle = getComputedStyle(content);
        const inset = parseFloat(contentStyle.paddingLeft) + parseFloat(contentStyle.paddingRight) + parseFloat(contentStyle.borderLeftWidth) + parseFloat(contentStyle.borderRightWidth);
        const room = (layout === MessageLayout.Bubble ? find("nol-message").getBoundingClientRect().width * 0.7 : content.getBoundingClientRect().width) - inset;
        const height = AppearanceFixture.measureLook("message-picture-height");
        const target = AppearanceFixture.measureLook("pointer-target");
        const border = AppearanceFixture.measureLook("border-width");
        const pictures = all(".nol-message-picture");

        expect([pictures.length, all(".nol-message-attachment").length, images().map(t => t.naturalWidth)]).toEqual([sizes.length, 1, sizes.map(([width]) => width)]);
        sizes.forEach(([naturalWidth, naturalHeight], index) => {
          const button = DomFixture.at(pictures, index);
          const box = button.getBoundingClientRect();
          const image = DomFixture.one(button, "img").getBoundingClientRect();
          const ratio = naturalWidth / naturalHeight;
          const width = Math.min(Math.max(target, Math.min(naturalWidth, height * ratio)), room);
          const boxHeight = Math.min(Math.max(width / ratio, target), height);
          const scale = Math.min(1, width / naturalWidth, boxHeight / naturalHeight);

          AppearanceFixture.expectPixels(box.width, width);
          AppearanceFixture.expectPixels(box.height, boxHeight);
          AppearanceFixture.expectPixels(box.left, content.getBoundingClientRect().left + parseFloat(contentStyle.paddingLeft) + parseFloat(contentStyle.borderLeftWidth));
          expect([image.left, image.top, image.width, image.height]).toEqual([box.left, box.top, box.width, box.height]);
          if (index < 3) {
            AppearanceFixture.expectPixels(naturalWidth * scale, box.width);
            AppearanceFixture.expectPixels(naturalHeight * scale, box.height);
          }
        });
        expect([room < Math.min(2000, height * 4), height * 0.25 < Math.min(400, room), 120 < Math.min(height * 1.5, room), 16 < target, room / 60 < target,
          height / 60 < target]).toEqual([true, true, true, true, true, true]);

        const style = getComputedStyle(DomFixture.at(pictures, 0));
        const edge = getComputedStyle(DomFixture.at(pictures, 0), "::after");
        AppearanceFixture.expectPixels(parseFloat(edge.borderTopWidth), border);
        AppearanceFixture.expectLook(style.borderTopLeftRadius, theme, "radius-medium", "border-top-left-radius", "border-radius");
        expect([style.borderTopStyle, edge.position, [edge.top, edge.right, edge.bottom, edge.left].join(" "), edge.borderTopLeftRadius, edge.borderTopStyle, edge.borderTopColor, edge.pointerEvents, style.overflow, style.cursor])
          .toEqual(["none", "absolute", "0px 0px 0px 0px", style.borderTopLeftRadius, "solid", forced ? ForcedColorsFixture.resolve("CanvasText") : AppearanceFixture.readColor(theme, mode, "card-border"),
            "none", "hidden", "zoom-in"]);

        DomFixture.at(pictures, 0).setAttribute("data-nol-state", "Focus");
        const focused = getComputedStyle(DomFixture.at(pictures, 0));
        expect([focused.outlineStyle, focused.outlineWidth, focused.outlineColor]).toEqual(["solid", forced ? `${border * 2}px` : `${border}px`,
          forced ? ForcedColorsFixture.resolve("Highlight") : AppearanceFixture.readColor(theme, mode, "accent")]);

        DomFixture.at(pictures, 1).setAttribute("data-nol-state", "Hover");
        const hovered = getComputedStyle(DomFixture.at(pictures, 1));
        if (forced)
          expect([hovered.outlineStyle, hovered.outlineWidth, hovered.outlineOffset, hovered.outlineColor]).toEqual(["dashed", `${border}px`, `${-border}px`, ForcedColorsFixture.resolve("Highlight")]);
        else
          expect(hovered.outlineStyle).toBe("none");
      });

  for (const [look, theme, mode, forced] of looks)
    for (const layout of [MessageLayout.Bubble, MessageLayout.Column, MessageLayout.Row])
      it(`keeps a picture's room, and every block after it in place, before its image loads, in a ${layout} in ${look}`, async () => {
        AppearanceFixture.apply(theme, mode);
        if (forced)
          await ForcedColorsFixture.activateAsync();
        await renderAsync(layout, blocksOf(() => "data:image/png;base64,"));
        const pending = [images().map(t => t.naturalWidth), boxesOf(".nol-message-picture"), boxesOf(".nol-message-attachment"),
          boxesOf(".nol-message-footer, .nol-message-actions")];
        fixture.destroy();
        await renderAsync(layout, blocksOf(pngOf));
        await loadAsync();
        const loaded = [images().map(t => t.naturalWidth), boxesOf(".nol-message-picture"), boxesOf(".nol-message-attachment"),
          boxesOf(".nol-message-footer, .nol-message-actions")];

        expect([pending[0], loaded[0]]).toEqual([sizes.map(() => 0), sizes.map(([width]) => width)]);
        expect(pending.slice(1)).toEqual(loaded.slice(1));
      });

  it("names a picture by its file's name, shows its tooltip text, and hands the app its id on a click or Enter", async () => {
    AppearanceFixture.apply();
    await renderAsync(MessageLayout.Row, blocksOf(pngOf));
    const picture = DomFixture.at(all(".nol-message-picture"), 2);
    const named = (await AccessibilityFixture.namesAsync("button")).filter(t => t.includes("shot-"));

    await userEvent.hover(picture);
    const tooltip = await vi.waitFor(() => {
      expect(document.querySelector(".cdk-overlay-container nol-tooltip")?.textContent?.trim()).toBe("C:/shots/shot-120.png");
      return DomFixture.one(document, ".cdk-overlay-container nol-tooltip");
    });
    const described = document.getElementById(picture.getAttribute("aria-describedby") ?? String.empty)?.textContent;
    picture.click();
    picture.focus();
    await userEvent.keyboard("{Enter}");

    expect([named, DomFixture.one(picture, "img").getAttribute("alt"), tooltip.getAttribute("role"), described, host.opened])
      .toEqual([sizes.map(([width]) => `shot-${width}.png`), String.empty, "tooltip", "C:/shots/shot-120.png", ["p120", "p120"]]);
  });

  it("keeps the forced-colors hover outline off a focused picture or attachment, which shows its focus ring", async () => {
    AppearanceFixture.apply();
    await ForcedColorsFixture.activateAsync();
    await renderAsync(MessageLayout.Row, blocksOf(pngOf));
    const border = AppearanceFixture.measureLook("border-width");
    const outlineOf = (element: HTMLElement): string[] => {
      const style = getComputedStyle(element);
      return [style.outlineStyle, style.outlineWidth, style.outlineColor];
    };
    const highlight = ForcedColorsFixture.resolve("Highlight");
    const shown: unknown[] = [];
    for (const part of [DomFixture.at(all(".nol-message-picture"), 2), find(".nol-message-attachment")]) {
      await userEvent.hover(part);
      const hovered = outlineOf(part);
      part.setAttribute("data-nol-state", "Focus");
      shown.push([hovered, outlineOf(part), part.matches(":hover")]);
    }

    expect(shown).toEqual([[["dashed", `${border}px`, highlight], ["solid", `${border * 2}px`, highlight], true], [["dashed", `${border}px`, highlight], ["solid", `${border * 2}px`, highlight], true]]);
  });

  it("gives the app the id of the attachment a right click or the ContextMenu key was on, as its picture or its button, and none elsewhere", async () => {
    await renderAsync(MessageLayout.Row, blocksOf(pngOf));
    const picture = DomFixture.at(all(".nol-message-picture"), 2);
    const rightClick = (node: Node): void => {
      node.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true, button: 2, clientX: 1, clientY: 1 }));
    };

    rightClick(DomFixture.one(picture, "img"));
    rightClick(find(".nol-message-attachment-name"));
    rightClick(find("nol-markdown-view p"));
    rightClick(DomFixture.firstTextOf(find("nol-markdown-view p")));
    picture.focus();
    picture.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "ContextMenu" }));

    expect(host.menus).toEqual(["p120", "f1", null, null, "p120"]);
  });

  it("shows a picture where its block is, and an attachment without one as its row", async () => {
    await renderAsync(MessageLayout.Row, [new MessageAttachment("f1", "notes.txt", 12, "Text"), ...blocksOf(pngOf).slice(1, 2), new MessageText("After.")]);
    const order = all(".nol-message-content > .nol-message-part > *").map(t => t.localName === "button" ? t.className : t.localName);

    expect([order, find(".nol-message-attachment-name").textContent, all(".nol-message-attachment nol-file-badge").length])
      .toEqual([["nol-message-attachment", "nol-message-picture", "nol-message-run"], "notes.txt", 1]);
  });
});
