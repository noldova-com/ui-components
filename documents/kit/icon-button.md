# Icon button

**Scope:** The kit's icon button: its default geometry, the text role it uses, its surface and behavior, its tab action size, its danger look, its filled look and its overlay looks.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

1.375rem visual pad around a 1rem glyph; small radius.

## Text role

Accessible name.

## Surface and behavior

Toolbar hover; pointer hit region at least 24px.
An icon button marked aria-disabled, which stays focusable, looks disabled and shows no hover, as a disabled one does.
Under forced colors a pressed icon button's glyph is `HighlightText` on `Highlight`, and a disabled or aria-disabled one's is `GrayText`; pressed and disabled or aria-disabled, its glyph is `GrayText` on `Canvas` inside a 1px `GrayText` outline, which its keyboard focus outline replaces.

## Tab action size

`tabAction`, an Explorer row's actions: an action at a row's end that sits and highlights as a tab's close button does.

- Its hit region is the tab action's slot, `tab-action-slot`, 1.5rem, and at least 24px.
- Its hover fill is the tab close's, `tab-close`, 1.25rem, with the small radius, centered on its 1rem glyph.
- Its glyph, hover, focus, pressed, disabled and forced colors looks are the plain button's.
- Where it sits in its row, such as at the tab close's inset from the row's end, is its owner's.
- `filled` and `overlay` win when either is set.
- It wins over `buttonHeight`: a plain button with both keeps the tab action's size, while an overlay button with both is the overlay look at the button's height.

## Danger look

`danger`, a row's Delete or Remove: an action that destroys something.

- The plain icon button with its glyph in `error`, which in the default theme keeps 3:1 against the panel and the toolbar hover, in light and dark.
- Its hover, focus and disabled looks are the plain button's.
- Under forced colors it is the plain button's `ButtonText` glyph, and the pressed look's `HighlightText` glyph while pressed.
- `filled` and `overlay` win when either is set.

## Filled look

`filled`, such as a composer's Send: a field's main action.

- A circle the `button-height` across, filled with `button`, its 1rem glyph centered in `button-text`; its hit region is at least 24px and at least the circle.
- Under the pointer the circle keeps its fill.
- Its keyboard focus is the `accent` outline outside the circle, two border widths from it.
- Disabled or aria-disabled, the circle is filled with `widget-border` and its glyph is in `text-muted`, at full opacity and the same size.
- Under forced colors it is a 1px `ButtonText` ring around a `ButtonText` glyph, or `GrayText` while disabled or aria-disabled, at the same size.

## Overlay look

`overlay`, such as Remove over an image attachment: an action over an image.

- A circle the `icon-button` size across, filled with `--nol-overlay`, 70% black, its 1rem glyph centered in `--nol-overlay-text`, white; both are theme looks, the same in light and dark, so the glyph keeps 4.5:1 over any image. Its hit region is at least 24px.
- Under the pointer the toolbar hover lies over the fill.
- Its keyboard focus is the `accent` outline outside the circle, two border widths from it.
- Disabled or aria-disabled, it is at half opacity, the same size, without the hover layer.
- Under forced colors it is a 1px `ButtonText` ring around a `ButtonText` glyph, or `GrayText` while disabled or aria-disabled, at the same size.
- Pressed under forced colors, its glyph is `HighlightText` on `Highlight`, or `GrayText` on `Canvas` inside its `GrayText` ring while disabled or aria-disabled.
- Where it sits and when it shows, such as 2px in from the image's top-right corner and only while the attachment is hovered or holds focus, is its owner's.
- `filled` wins when both are set.
- With `buttonHeight`, for a row it shares with buttons, such as an image viewer's zoom out, percentage and zoom in, the circle is the button's height, 1.625rem, across, so it shares the overlay text button's height and center line; its glyph stays 1rem. Without it, the circle stays the `icon-button` size, as for the composer's Remove.
- With `backdrop`, for an action on the overlay backdrop itself, such as an image viewer's Close, where the `overlay` fill would vanish, the circle is filled with `--nol-overlay-control`, white at 10%, a theme look the same in light and dark, and under the pointer or while pressed `--nol-overlay-control-hover`, white at 8%, lies over it. Its glyph is `--nol-overlay-control-text`, #EEEEEE, and disabled it is at 35% opacity. Its size, glyph and focus are the overlay look's, and forced colors keep the overlay look. Over an image, without it, the circle stays 70% black.

## Busy

- With `busy`, while its work is under way, the kit's 1rem spinner, its ring 0.75rem, stands centered in place of the glyph, in the glyph's color, so the button keeps its size to the pixel in every look.
- Under forced colors the spinner keeps its own look, a 2px `Highlight` arc on a thinner, 1px `GrayText` track.
- It is marked `aria-busy` and ignores clicks, middle clicks, Enter and Space, which neither its own handlers nor its parents hear; once it is no longer busy it looks and acts as before.
- With `busyPressable` as well, as a code block's Run is while its command runs, it keeps the spinner, `aria-busy` and its size but takes clicks, middle clicks, Enter and Space as when not busy; every other busy button still ignores them.
