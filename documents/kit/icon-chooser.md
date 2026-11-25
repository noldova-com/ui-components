# Icon chooser

**Scope:** The kit's icon chooser: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

A search field over a grid 12rem high, `icon-chooser-height`, `space-2` below the field.
Each cell is a 2rem square, `icon-chooser-cell`, with its glyph at 1.25rem, `icon-chooser-glyph`, centered; the cells fill whole columns from the grid's inline start, as many as fit its width.
The grid has the border width's line in the border color and the small radius; a cell has the small radius.

## Text role

Panel for the field, the "No icon matches." note and the count below the grid.

## Surface and behavior

The icon set is the kit's Material Symbols, `IconNames.all`, generated from the pinned `material-symbols` package by `npm run icons` in the kit's folder, with the `IconName` type that the chooser's `value` and `names` take; the Icon names check fails when the list, the type or the type's declaration and the installed package differ.
An app may offer fewer names through `names`.
"No icon", whose value is null, comes first unless `allowNone` is false; its glyph is the muted `block` symbol.
The search keeps the names that hold every word typed, in any case, words parted by spaces, underscores or hyphens; "No icon" stays first while searching, and "No icon matches." shows when no name does.
A live status below the grid says how many icons are offered.

The grid is a named listbox whose options are its cells, each named by its icon's words, with `aria-setsize` and `aria-posinset` for its place in the whole list; the grid keeps the focus and names the active cell through `aria-activedescendant`.
The arrow keys move the active cell by one cell or one row, Page Up and Page Down by the rows in view, Home and End to the row's ends, and Control with Home or End to the first or last cell; Enter or Space chooses the active cell, and a click chooses its cell.
A letter typed in the grid moves the focus to the search field and types it there; Arrow Down in the search field moves the focus back to the grid.
The grid renders only the rows in view and two more above and below, so the whole set stays fast, and always renders the active cell, so `aria-activedescendant` names an option in the document.
The chooser starts with its chosen cell in view, the active cell scrolls into view as it moves, and it scrolls into view when the keyboard brings the focus into the grid, by Tab or by Arrow Down from the field; a pointer press scrolls nothing, so the pressed cell stays under the pointer.

The chosen cell takes the selected fill, a hovered one the toolbar hover fill unless the chooser is disabled, and the active cell, while the grid has keyboard focus, an outline inside it; the grid shows its own keyboard focus as an outline inside its border.
A disabled chooser marks the grid and its cells `aria-disabled="true"`, dims the cells to half opacity, takes no hover fill and makes the field read-only; the grid stays focusable, a letter typed in it stays out of the field, and a click, Enter or Space chooses nothing.
Under forced colors the chosen cell is filled in `Highlight` with `HighlightText`, a hovered one has a 1px dashed `Highlight` line inside it, keyboard focus is a 2px `Highlight` outline, and a disabled cell is `GrayText` at full opacity.
The chooser reports that it was touched when the focus leaves it, but not when it moves between the field and the grid, so a signal forms field bound to it marks itself touched.
