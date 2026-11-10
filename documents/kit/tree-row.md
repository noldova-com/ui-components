# Tree row

**Scope:** The kit's tree row: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

1.625rem minimum high; 0.5rem text inset; 1rem icon; 0.5rem icon gap; small radius; rows `--nol-row-gap` apart, 0.25rem, twice the tab's side inset, so a hovered row and a current row beside it stand apart as two tabs' pills do; child indentation 1.75rem.

## Text role

Panel.

## Surface and behavior

The kit's tree, a named tree of rows that wrap long labels.
Hover surface, and the selected fill on the current row, which is marked selected; a twistie, rotated while open, only when the tree has branches, its chevron's ink starting at the row's text inset, folded and open; a click anywhere on a row chooses it and toggles a branch's children.
One Tab stop, which returns to the row last focused, or lands on the current row, or on the first row when none is current or focused; Up and Down move, Right opens a branch or enters it, Left closes it or goes to its parent, Home and End jump, typing finds a row by its label, Enter or Space chooses a row and toggles a branch.
A movable tree (the owner applies the move it reports) moves rows by pointer or keyboard through one path: a drag starts once the pointer is 4px from where it went down, the kit's one drag threshold; the row under the pointer takes a drop line before or after it, drawn in the middle of the gap between rows, or the accent outline to drop into a branch (the middle half of a branch's row); the bottom of an open branch's row takes the line above its first child, at the child's indent, where the row lands; a row can't go onto itself or its own descendants, which show neither line nor outline, and releasing there changes nothing; a closed branch the pointer rests on opens after 0.5s, and a tree in a scrolling area scrolls it while the pointer is within a row's height of its top or bottom; Escape, lost window focus, a cancelled pointer, a lost capture, a move with the button no longer pressed, the pointer leaving the viewport, or a release outside the rows ends the drag; the click that ends a drag chooses nothing.
Alt with Up or Down moves the focused row among its siblings, Alt with Right moves it into the branch before it as that branch's last child, opening that branch if it is closed, and Alt with Left moves it out to just after its parent (Right and Left swap in a right-to-left layout); a move that can't happen does nothing and is not announced, and other modifiers leave the key to the tree and the page.
A row dropped into a closed branch opens it too.
The focus stays on the moved row, by keyboard or pointer, and the move is announced politely as "Moved Notes to position 2 of 3" or "Moved Notes into Project, position 3 of 3".

## While dragged

### Default geometry

Tree-row geometry; small radius.

### Text role

Panel.

### Surface and behavior

Shell-color ghost, border and large shadow, at the pointer's inline end side, so the drop line stays visible; the row being moved dims to half; the rows a move displaced slide from their old places in 150ms, with no animation when reduced motion is preferred.
