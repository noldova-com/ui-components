# Configuration table

**Scope:** The kit's configuration table: its default geometry, the text role it uses, its surface and behavior, and its compact density.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

Rows grow, their cells lined up on their first line's baseline, so text sits level with the labels of the row's buttons; 0.5rem cell padding, except on the outer side of each row's first and last cells, so the text and the actions sit on the ends of the lines; a hovered row's band 0.5rem past both ends of the table, from the row's top down to its line; the heading's row, the explanation and the table 0.75rem apart; the free-text column at least a text field wide, 12.5rem, unless the columns have shares; an actions column's buttons centered on the first line of the row's text, neighboring icon buttons touching with their full targets so their icons sit as one group, and other buttons 0.5rem apart.

## Text role

Panel; heading and the header row's cells at the emphasis weight, in `text-strong`.

## Surface and behavior

The kit's configuration table, for a list of items with actions: an optional heading, which names the table, with actions such as Add at the end of its row, then an explanation, or, without a heading, the explanation at the start of the actions' row, level with their labels, with the actions wrapping onto a line of their own, still at its end, before the explanation gets narrower than a text field; then the owner's table, with semantic column headers and actions named for their row, such as Remove Sample Author 1, and a line under the header and every row.
Every column keeps to one line except the free-text column the owner marks, which takes the rest of the width and wraps, at least as wide as its minimum: a text field's width, or the one the owner gives the column with `nolConfigurationTableFillMinWidth`, in rem and bound, as `[nolConfigurationTableFillMinWidth]="0"` gives a path that should wrap however narrow the table gets; an unbound attribute's text counts as no minimum.
While the table, every cell on one line, is wider than its container, as in a narrow window or at 200% zoom, every column but the actions column wraps at its words instead, and the free-text column gives up its rest of the width, keeping its minimum; only a free-text column with a minimum of 0, such as a path's, breaks a word too long for it, and only then, or in a table with no free-text column, while whole words still don't fit, do the other columns break their words too; a control in a cell, such as a switch or a status, keeps its own width. Once the table fits again on one line, it is as before.
The owner may give every column a share instead, so the columns spread over the table's width, each taking its share's part of the sum while every column's content fits it; a column whose content doesn't fit grows, and the others give up the room.
A shared free-text column takes its share, even one narrower than a text field, and still wraps.
An actions column, which the owner marks on its header and cells, shows no heading but keeps its name for screen readers, and holds each row's buttons on one line at the row's end, so the last buttons of every row share one end edge; the column is as wide as its buttons, each text button at its whole label and at least its 4rem minimum.
When the table can shrink no further even so, as with more controls than its width holds or a word longer than the free-text column's minimum, it keeps every cell on one line, as before it wrapped, and runs past its container's end, with room left at its edges for a focus outline and a hovered row's band, and the owner's area that holds it scrolls sideways; the table has no scrollbar of its own.
Once wrapping couldn't make the table fit in some room, it stays on one line, with the same content, until it has 1.5rem more room than that, or more by the room it lost since it last wrapped, if that is more, but only as far as the scrollbars around it grew since then, those of every area that scrolls up and down around it and the window's, as when the wrapped, taller table brings a scrollbar into the owner's area, an area around it or the page; room lost otherwise, as when a panel opens beside it, holds by 1.5rem; so the two layouts never take turns. A change of its content lets it try again at once.
A table with shares scrolls sideways inside the component instead, with the same room, while the heading's row and the explanation stay in place.
The row under the pointer shows a band in `hover` behind its cells, reaching past the table's ends while the text stays on the heading's line, so the owner leaves at least 0.5rem beside the component; under forced colors a 1px dashed `Highlight` line runs just inside the band's edges instead, 0.5rem past the table's ends so it stays clear of the text, with no fill. The header's row has no hover.

## Compact density

An owner that needs the table tighter, such as a settings form, gives the component `density` `Compact`: the heading's row, the explanation and the table 0.25rem apart; the explanation in `text-muted`; the header's cells padded 0.25rem above and below and 0.375rem at their sides, and the body's cells 0.375rem on every side, except on the outer side of each row's first and last cells; every cell at the top of its row, so a row's text and its buttons both start at the row's top, below its padding, rather than the text sitting level with the buttons' labels; the heading's row, when its actions wrap under the explanation, keeps them 0.25rem below it. The columns' widths, the hovered row's band, the actions' spacing and the lines stay the default geometry's, under forced colors too, where the explanation takes the system's text color.
