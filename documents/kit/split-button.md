# Split button

**Scope:** The kit's split button: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

Two [icon buttons](icon-button.md) joined, the main action's and, after it, an arrow that opens a menu of choices for it, such as a terminal's New terminal and its Choose a shell.
Each half is at least the icon button's pointer target wide, 24px, and its pad fills its half, the icon button's 1.375rem high; the halves meet with no gap, so their pads' inner corners are square and their outer corners keep the small radius.
The arrow's glyph is the 1rem `expand_more` chevron.

## Text role

Accessible names: each half's own.

## Surface and behavior

- At rest it shows only its two glyphs, as icon buttons do.
- While either half is under the pointer or the menu is open, one 1px `widget-border` outline wraps both pads, outside them, and a 1px `widget-border` edge lies between the halves; the half under the pointer, or the arrow while its menu is open, fills with the toolbar hover inside it.
- Each half is a native button in the tab order with its own accessible name and tooltip, and shows the icon button's own `accent` focus outline, inside its pad.
- The main half's tooltip is its label unless the owner gives one, such as the label with its shortcut; the arrow's is its name. The owner sets the side both tooltips show on, above by default, and how the menu lines up with the arrow it opens below, at its start by default.
- The owner can mark the main half unavailable: it is aria-disabled, stays focusable, looks disabled and does nothing, while the arrow still opens the menu.
- Under forced colors the outline and the edge are `ButtonText`, a hovered half shows the icon button's dashed `Highlight` line, and the open arrow is `Highlight` with a `HighlightText` glyph.

## Busy

- With `busy`, the main half is a busy icon button, the kit's spinner centered in place of its glyph, and the split button keeps its size to the pixel.
- The whole control ignores clicks, middle clicks, Enter and Space, and the arrow's up and down arrows, so it emits nothing and the menu stays shut; once it is no longer busy it looks and acts as before.
