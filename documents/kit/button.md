# Button

**Scope:** The kit's button: its default geometry, the text role it uses, its surface and behavior, its danger look, its text variant and its overlay look, its outlined variant, its accent variant, and its compact size.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

1.625rem minimum high; 0.5rem side padding; small radius; never wider than its container.
A primary, secondary, danger, outlined or accent button keeps no minimum width: it is as wide as its label, its icon and its padding.
A primary or secondary button's 1px border sits outside its padding; a text button has none.
No margin of its own: its reset to none weighs nothing, so a rule that places it from outside, such as an actions column's 0.5rem between buttons, holds whatever order the page loaded the stylesheets in.

## Text role

Label.

## Surface and behavior

Primary, secondary or text button tokens; no ripple/state layer; adequate hit region without overlapping controls.
An icon sits before the label, outside it and 0.25rem from it, and never shrinks.
A label too long for the button starts after its start padding or icon and ends with an ellipsis, and the owner gives a button whose label may not fit a tooltip with the full label, shown while it is cut (`nolTooltip` with `nolTooltipTruncated`).
A link shown as a button, such as a download, has the same look without an underline.
A button marked aria-disabled, which stays focusable, looks disabled and shows no hover, as a disabled one does.
Under forced colors a disabled or aria-disabled button's border and label are `GrayText`, at full opacity in every variant, so the system's own disabled color is not faded.
Under forced colors hover is a 1px dashed `Highlight` outline drawn inside the border with one border width between them, so a hovered button never looks like a resting one.

## Danger look

`danger` on the primary button, for an action that destroys something, such as a confirm dialog's Delete; it is the icon button's danger look as a fill.

- It is filled with `error` under its label in `button-danger-text`, which falls back to `panel`: white in light mode and the dark panel color in dark, since a white label on the dark mode's lighter red falls under 4.5:1.
- It keeps the primary button's size, padding, border, radius and label.
- Under the pointer its fill is the error color with 10% of its label's color mixed in, the derived `--nol-button-danger-hover`.
- Its keyboard focus and its disabled or aria-disabled look are the primary button's.
- Its label keeps 4.5:1 on its fill and on its hover fill, and the fill 3:1 on the window, panel and dialog surfaces; the theme's contrast spec and the button's spec check them.
- Under forced colors it is drawn as the plain primary button at rest, on hover, on focus and while disabled or aria-disabled, at the same size; the button's spec checks it.
- Another variant ignores it and keeps its own look.

## Text variant

`ButtonVariant.Text`, a text button for a quiet action such as a terminal's Restart.

- At rest it has no fill and no border, and its label is in `text`.
- It is at least 4rem wide, an overlay pill too; a shorter label is centered, and a longer one starts 0.5rem from its edge.
- The minimum counts when a row sized to its content measures it, so the row grows to fit the button, which never overlaps or clips the control beside it.
- A container narrower than 4rem still caps it, and a parent that stretches its children, such as a column or a grid cell, still stretches it.
- Under the pointer, and while the pointer presses it, it is filled with `toolbar-hover`; it has no other pressed fill.
- Its keyboard focus is a 1px `accent` outline inside its edge, as the toolbar button's.
- Disabled, or marked aria-disabled, it is dimmed to 0.4 with the default cursor and no hover fill.
- Its label keeps 4.5:1, and its focus outline 3:1, on the window, panel, raised and dialog surfaces, at rest and under its hover fill; the theme's contrast spec checks them.

## Overlay look

`overlay` on the text variant, for a labeled action over an image or a dark backdrop, such as an image viewer's zoom percentage between its zoom icon buttons; it is the icon button's overlay look as a pill.

- A pill at the button's height, its radius half that height, filled with `--nol-overlay`, 70% black, inside a 1px transparent border, its label in `--nol-overlay-text`, white; both are theme looks, the same in light and dark, so the label keeps 4.5:1 over any image. It keeps the text variant's width, padding and label size.
- Under the pointer the toolbar hover lies over the fill.
- Its keyboard focus is the `accent` outline outside the pill, two border widths from it, as the icon button's overlay look.
- Disabled or aria-disabled, it is at half opacity, the same size, without the hover layer.
- Under forced colors it is a 1px `ButtonText` ring on `ButtonFace` around a `ButtonText` label, or `GrayText` while disabled or aria-disabled, at the same size, and its focus is the button's `Highlight` outline.
- Another variant ignores it and keeps its own look.
- In a row with overlay icon buttons, such as zoom out and zoom in on either side, they take `buttonHeight` so the three share one height and center line.
- With `backdrop`, on the overlay backdrop itself, such as an image viewer's zoom percentage, where the `overlay` fill would vanish, the pill is filled with `--nol-overlay-control`, white at 10%, a theme look the same in light and dark, and under the pointer `--nol-overlay-control-hover`, white at 8%, lies over it. Its label is `--nol-overlay-control-text`, #EEEEEE, and disabled it is at 35% opacity. Its size, label font and focus are the overlay look's, and forced colors keep the overlay look; its icon buttons in that row take `backdrop` too.

## Outlined variant

`ButtonVariant.Outlined`, a composer's compact setting beside its field, such as its access mode.

- At rest it has no fill, a 1px `border` border and the small radius, and its label and icon are in `text-muted`.
- It is compact: 0.25rem above and below its label, inside its border, and 0.5rem at its sides; its icon is 1rem.
- Under the pointer it keeps no fill.
- Its keyboard focus is the button's `accent` outline outside its edge.
- Disabled, or marked aria-disabled, it is dimmed as the button is.
- Under forced colors its border and text are `ButtonText`, or `GrayText` while disabled, at the same size.
- Its label keeps 4.5:1 on the window and panel surfaces; the theme's contrast spec checks them.

## Accent variant

`ButtonVariant.Accent`, the accent chip look, for an action on a card that names what is shown, such as a page card's Open while its page is open in a tab.

- At rest it has the `selected` fill, no visible border and the small radius, and its label and icon are in `text`, at the button's label size: the kit's text never goes under 12px (KIT.md, Typography).
- It is the chip's height and side padding: at least `chip` high, 1.25rem by default, its transparent 1px border inside that height, and `chip-padding`, 0.375rem, at its sides, inside its border.
- It keeps the chip's height in either size: compact leaves it as it is.
- Under the pointer `toolbar-hover` lies over its `selected` fill.
- Its keyboard focus is the button's `accent` outline outside its edge.
- Disabled, or marked aria-disabled, it is dimmed as the button is, keeping its `selected` fill without the hover.
- Under forced colors its border and text are `ButtonText`, or `GrayText` while disabled, at the same size, and its hover is the button's dashed `Highlight` outline with no hover fill.
- Its `text` label keeps 4.5:1 on the `selected` fill over the window, panel, raised and dialog surfaces, at rest and under its hover; the theme's contrast spec checks them.

## Compact size

`ButtonSize.Compact`, for a labeled action in a row of icon buttons, such as a working reply's Stop in its footer, where the normal button would make the row taller.

- It is at least `button-compact-height` high, its border inside that height; the token is the icon button's target, 1.5rem, by default, so the row keeps the icon buttons' height in every theme that leaves it so.
- It keeps its variant's colors, border, side padding, small radius, label, icon, hover, focus outline and disabled look; an outlined button drops its 0.25rem above and below its label, and an overlay pill takes half this height as its radius.
- Its label fits at every text size, from 12 to 18px: the label's line and the border stay within the height, and a theme with a smaller height grows the button rather than cutting the label.
- Under forced colors it keeps its size and its variant's forced colors.

## Busy

- With `busy`, while its work is under way, the kit's 1rem spinner, its ring 0.75rem, stands centered in the button in the button's text color, in place of its icon and label, which stay in the layout unseen and still give it its accessible name, so the button keeps its width and height to the pixel in every variant and size.
- It is marked `aria-busy` and ignores clicks, middle clicks, Enter and Space: neither its own handlers nor its parents hear them, and a busy link doesn't follow its `href`.
- Under forced colors the spinner keeps its own look, a 2px `Highlight` arc on a thinner, 1px `GrayText` track.
- Once it is no longer busy it looks and acts as before.
