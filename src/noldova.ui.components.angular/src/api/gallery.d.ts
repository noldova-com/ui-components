/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { InputSignal, Type } from "@angular/core";
import type { Theme, ThemeMode } from "@noldova/ui.components.angular";

/**
 * How wide a Gallery specimen's cells are laid out.
 */
export declare enum GallerySize {
  /**
   * Narrow cells, several to a row, for small controls such as buttons.
   */
  Regular = "Regular",

  /**
   * Wider cells, fewer to a row, for controls such as lists and toolbars.
   */
  Wide = "Wide",

  /**
   * One cell to a row, the scope's full width, for controls such as panes
   * and toolbars that span them.
   */
  Full = "Full"
}

/**
 * The state a Gallery mark shows without the pointer or the keyboard. The
 * mark sets it as the marked element's `data-nol-state` attribute, and the
 * element's own styles give it the look, as in
 * `:is(:hover, [data-nol-state="Hover"])` and
 * `:is(:focus-visible, [data-nol-state="Focus"])`. The kit's controls have
 * those styles; a consumer's own elements need them too, or the mark shows
 * no change.
 */
export declare enum GalleryState {
  /**
   * The look the element has while the pointer is over it.
   */
  Hover = "Hover",

  /**
   * The look the element has while it holds the keyboard focus.
   */
  Focus = "Focus"
}

/**
 * A Gallery cell, `nol-gallery-cell`: one state of a specimen's control,
 * under its caption, with any content. The static `long` attribute puts the
 * cell in its specimen's full-width rows, for text that wraps or truncates;
 * it is read once, when the cell is created, so it is never bound.
 */
export declare class GalleryCellComponent {
  /**
   * Whether the cell has the `long` attribute.
   */
  public readonly isLong: boolean;

  /**
   * The cell's caption, which names the state it shows and is its accessible
   * name.
   */
  public readonly caption: InputSignal<string>;
}

/**
 * The kit's Gallery, `nol-gallery`: a section for every control the kit
 * exports, showing its meaningful states, in every theme and mode it is
 * given, light and dark by default, each theme and mode in a scope of its
 * own.
 * The overlays a scope opens, such as menus, select lists and tooltips, open
 * inside that scope.
 * A consumer's own sections follow the kit's in every scope.
 * Its code blocks are colored, and its messages' Markdown drawn, without the
 * app adding `provideCodeHighlighting()` or `provideMarkdown()`.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { DefaultTheme, type Theme } from "@noldova/ui.components.angular";
 * import { GalleryComponent } from "@noldova/ui.components.angular/gallery";
 *
 * @Component({
 *   selector: "nol-gallery-page",
 *   imports: [GalleryComponent],
 *   template: "<nol-gallery [themes]=\"themes\" />"
 * })
 * export class GalleryPageComponent {
 *   protected readonly themes: readonly Theme[] = [DefaultTheme.theme];
 * }
 * ```
 */
export declare class GalleryComponent {
  /**
   * The themes to show, each in every one of `modes`; the default theme alone
   * when not bound. An empty list shows no scope. Give each theme once: a
   * theme given twice is shown twice under the same scope id, which Angular
   * reports as a duplicate key.
   */
  public readonly themes: InputSignal<readonly Theme[]>;

  /**
   * The modes to show each theme in, in the order given; light and dark when
   * not bound. A page that needs only some scopes, such as one that checks a
   * single theme in one mode, renders only those. An empty list shows no
   * scope. Give each mode once: a mode given twice is shown twice under the
   * same scope id, which Angular reports as a duplicate key.
   */
  public readonly modes: InputSignal<readonly ThemeMode[]>;

  /**
   * A consumer's own sections; none when not bound. Each is a standalone
   * component that lays out its specimens with `nol-gallery-specimen` and
   * `nol-gallery-cell`. Each is rendered once in every scope, after the kit's
   * own sections and in the order given, inside the scope's injector:
   * - The scope's theme and mode reach it only through the tokens painted on
   *   the scope. `AppearanceService` stays the app's, so it reports the app's
   *   theme and mode, not the scope's.
   * - The menus, select lists, quick inputs and tooltips it opens open inside
   *   the scope. A dialog opened through `DialogService` opens over the whole
   *   document.
   *
   * @example
   * ```ts
   * import { Component, type Type } from "@angular/core";
   * import { ButtonComponent } from "@noldova/ui.components.angular";
   * import { GalleryCellComponent, GalleryComponent, GallerySpecimenComponent, GalleryStateDirective } from "@noldova/ui.components.angular/gallery";
   *
   * @Component({
   *   selector: "app-gallery-export",
   *   imports: [ButtonComponent, GalleryCellComponent, GallerySpecimenComponent, GalleryStateDirective],
   *   template: "<nol-gallery-specimen name=\"Export\">"
   *     + "<nol-gallery-cell caption=\"Default\"><button type=\"button\" nol-button>Export</button></nol-gallery-cell>"
   *     + "<nol-gallery-cell caption=\"Hover\"><button type=\"button\" nol-button nolGalleryHover>Export</button></nol-gallery-cell>"
   *     + "</nol-gallery-specimen>"
   * })
   * export class ExportSectionComponent {
   * }
   *
   * @Component({
   *   selector: "app-gallery-page",
   *   imports: [GalleryComponent],
   *   template: "<nol-gallery [sections]=\"sections\" />"
   * })
   * export class GalleryPageComponent {
   *   protected readonly sections: readonly Type<unknown>[] = [ExportSectionComponent];
   * }
   * ```
   */
  public readonly sections: InputSignal<readonly Type<unknown>[]>;
}

/**
 * A Gallery specimen, `nol-gallery-specimen`: one control under its name,
 * with a `nol-gallery-cell` for each state it shows. Cells marked `long`
 * come after the others, each a full row. The static `noHover`, `noFocus` and
 * `noLongText` attributes say that the specimen shows no Hover cell, no Focus
 * cell or no long-text row, and the kit's own checks read them.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { ButtonComponent } from "@noldova/ui.components.angular";
 * import { GalleryCellComponent, GallerySize, GallerySpecimenComponent } from "@noldova/ui.components.angular/gallery";
 *
 * @Component({
 *   selector: "app-gallery-export",
 *   imports: [ButtonComponent, GalleryCellComponent, GallerySpecimenComponent],
 *   template: "<nol-gallery-specimen name=\"Export\" [size]=\"size\">"
 *     + "<nol-gallery-cell caption=\"Default\"><button type=\"button\" nol-button>Export</button></nol-gallery-cell>"
 *     + "<nol-gallery-cell long caption=\"Long text\"><button type=\"button\" nol-button>Export every report of the last quarter</button></nol-gallery-cell>"
 *     + "</nol-gallery-specimen>"
 * })
 * export class ExportSectionComponent {
 *   protected readonly size: GallerySize = GallerySize.Wide;
 * }
 * ```
 */
export declare class GallerySpecimenComponent {
  /**
   * The specimen's name, shown above its cells and its accessible name.
   */
  public readonly name: InputSignal<string>;

  /**
   * How wide its cells are; `GallerySize.Regular` when not bound.
   */
  public readonly size: InputSignal<GallerySize>;
}

/**
 * Marks an element in a Gallery cell as hovered, `nolGalleryHover`, or as
 * focused, `nolGalleryFocus`, so the cell shows that state's look without
 * the pointer or the keyboard. Without a value it marks its host; with a
 * selector it marks the first part of its host that matches. It marks after
 * the host first renders, and again after a render that changed which part
 * matches, such as a virtual list's row once its item loads, clearing the part
 * it marked before; the part must exist after every render, or it throws an
 * `ArgumentException`. The mark is the `data-nol-state` attribute that
 * `GalleryState` describes.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { ButtonComponent } from "@noldova/ui.components.angular";
 * import { GalleryCellComponent, GalleryStateDirective } from "@noldova/ui.components.angular/gallery";
 *
 * @Component({
 *   selector: "app-gallery-states",
 *   imports: [ButtonComponent, GalleryCellComponent, GalleryStateDirective],
 *   template: "<nol-gallery-cell caption=\"Hover\"><button type=\"button\" nol-button nolGalleryHover>Export</button></nol-gallery-cell>"
 *     + "<nol-gallery-cell caption=\"Focus\"><div nolGalleryFocus=\".export\"><button type=\"button\" nol-button class=\"export\">Export</button></div></nol-gallery-cell>"
 * })
 * export class GalleryStatesComponent {
 * }
 * ```
 */
export declare class GalleryStateDirective {
  /**
   * The part to show hovered, `nolGalleryHover`: empty for the host, a
   * selector for a part of it, or undefined for none.
   */
  public readonly hoverPart: InputSignal<string | undefined>;

  /**
   * The part to show focused, `nolGalleryFocus`: empty for the host, a
   * selector for a part of it, or undefined for none.
   */
  public readonly focusPart: InputSignal<string | undefined>;

  /**
   * Creates the mark, which Angular does for each element that has
   * `nolGalleryHover` or `nolGalleryFocus`. It marks its part after the host
   * first renders, and moves the mark whenever a render changed which part
   * matches.
   *
   * @example
   * ```ts
   * import { Component } from "@angular/core";
   * import { IconButtonComponent } from "@noldova/ui.components.angular";
   * import { GalleryCellComponent, GalleryStateDirective } from "@noldova/ui.components.angular/gallery";
   *
   * @Component({
   *   selector: "app-gallery-reload",
   *   imports: [GalleryCellComponent, GalleryStateDirective, IconButtonComponent],
   *   template: "<nol-gallery-cell caption=\"Focus\">"
   *     + "<button type=\"button\" nol-icon-button icon=\"refresh\" label=\"Reload\" nolGalleryFocus></button>"
   *     + "</nol-gallery-cell>"
   * })
   * export class GalleryReloadComponent {
   * }
   * ```
   */
  public constructor();
}
