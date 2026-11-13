# Toolbar button

**Scope:** The kit's toolbar button: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

1.5rem square, as high as a tab's pill, or at least 1.5rem wide with the pill padding on each side when it shows a label; a 1rem glyph; small radius; a 1rem chevron 0.125rem after the label of a dropdown.

## Text role

Inherited.

## Surface and behavior

Toolbar hover; pressed fills as hover does and exposes its state; a disabled item stays focusable, dims its glyph and label but not its keyboard focus outline, draws them in `GrayText` under forced colors, keeps half its pressed fill, or under forced colors draws a pressed one on `Canvas` inside a 1px `GrayText` outline, which its keyboard focus outline replaces, shows no hover and marks itself aria-disabled; never wider than its toolbar; its glyph and chevron never shrink, and a label too long for its width ends with an ellipsis inside the button, and the owner gives it a tooltip with the full label, shown while it is cut.

## Pressed while its menu is open

With `isPressedWhileOpen` on a button that opens a menu, such as a document toolbar's More, the button draws its pressed look while its menu is open, which the menu trigger marks `aria-expanded="true"`: the toolbar hover fill, or under forced colors the pressed button's `Highlight` fill under `HighlightText`. It draws its idle look again once the menu closes, and it is never announced as pressed, since `aria-expanded` already tells assistive technology the menu is open. It needs no `hasMenu`, so an icon-only More, whose menu trigger already marks `aria-haspopup="menu"`, is pressed while open with no chevron and keeps its square. Without it, a button keeps its idle look while its menu is open.

## Busy

With `busy`, while its work is under way, the kit's 1rem spinner, its ring 0.75rem, stands centered in the button in its glyph's color, in place of its glyph, label and chevron, which stay in the layout unseen, so the button keeps its width and height to the pixel.
Under forced colors the spinner keeps its own look, a 2px `Highlight` arc on a thinner, 1px `GrayText` track, but on a pressed button's `Highlight` fill its arc and track are `HighlightText`, so they show; an unavailable pressed button's `Canvas` fill keeps the `Highlight` arc and `GrayText` track.
It is marked `aria-busy` and ignores clicks, middle clicks, Enter and Space, and, when it opens a menu, the up and down arrows, which neither its own handlers nor its parents hear; once it is no longer busy it looks and acts as before.
