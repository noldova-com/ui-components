# Group header

**Scope:** The kit's group header: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

A [section header](section-header.md)'s: 1.75rem high, the label's line with equal space above and below it; a 1rem twistie whose chevron's ink starts 0.5rem in (the space-2 step), where a section header's text starts, folded and open, with the title 1.75rem in, 0.25rem after the twistie's room; the count 0.5rem after the title; actions at the end of the row, the last 0.25rem from its end; small radius; 0.75rem (the space-3 step) above every header that is not the first element in its container.

## Text role

Label: the title at the emphasis weight in `text-strong`, the count at 400 in `text-muted`.

## Surface and behavior

The header of a group of rows the person can fold, where a section header heads a group that always shows; groups are separated by space, as a section header's are.
No fill and no line at rest; the tree row's hover fill on the whole row while the pointer is over it, and under forced colors the tree row's dashed Highlight outline inside its edge.
An element of the heading role, level 3 unless the owner gives another, holding one button: the twistie, turned a quarter while open and pointing to the start while folded, the title, on one line cut with an ellipsis and shown whole in its tooltip while cut, and the count, when the owner gives one; with a count the button is named by the title, a comma and the count's words, such as Running, 2 sessions, from the owner's `countLabel`, which holds the shown number and changes with it, or the number alone without one, so the count is read as its own phrase while the shown number stays as it is; the button exposes whether the group is open and, when the owner names it, the region it controls, and a click, Enter or Space flips it.
The owner holds the open state and shows or removes the rows.
Actions the owner projects, such as icon buttons, follow the button at the end of the row, outside the button and the heading, each its own Tab stop.
When the row is too narrow for the whole heading beside the actions, with its title cut to 4rem, or shown whole when shorter, and its twistie, count, gaps and padding whole, the actions wrap onto a line of their own under the heading, at the row's end and inside it, and the heading takes the whole first line, its title cut only past the row's width; where those fit, the actions stay on the title's line.
