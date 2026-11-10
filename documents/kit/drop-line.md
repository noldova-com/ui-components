# Drop line

**Scope:** The kit's drop line: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

Twice the border width thick and 1.5rem long, the height of a toolbar button or a tab's pill, centered on the item and on its edge: across a row between items in a row, across a column between items in a column, at the item's inline start before it and its inline end after it in either writing direction.

## Text role

None.

## Surface and behavior

Accent; the kit's `nol-drop-line` styles draw it, which the owner places on its tabs, strips and toolbars, and the kit's tree on its rows (as wide as the row from its text inset to its end padding); shown while a dragged item would land there and ignoring the pointer.
