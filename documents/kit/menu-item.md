# Menu item

**Scope:** The kit's menu item: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

1.875rem minimum high: a 1.625rem fill inset 0.25rem from the menu's sides and by the tab's side inset, 0.125rem, above and below, so two filled rows stand `--nol-row-gap`, 0.25rem, apart as two tabs' pills do, while the rows themselves meet and the pointer never crosses space between them; 0.5rem text padding; 1rem icon; 0.5rem icon gap; a row without an icon keeps the icon's space, so every label lines up; medium radius; a submenu row ends with a 1rem chevron at the row's end, pointing toward the end side, where its submenu opens; 1px separator with 0.3125rem spacing.
A row with a description shows it as a second line under the label, at the label's start, and grows to fit both lines with 0.25rem above and below them inside its fill; rows without one keep their height.
A row's tag, such as Recommended, is a status chip 0.5rem after its label, centered on the label's line, and keeps the row's height.
A lead projected as `[nolMenuItemLead]`, such as a small avatar, takes the icon's place at its start edge, 0.5rem before the label, centered on the row, with at least 0.25rem above and below it inside its fill, the row growing to fit, so neighboring rows' avatars never touch; every label in the menu still lines up.
No margin of its own: its reset to none weighs nothing, so a rule that places it from outside holds whatever order the page loaded the stylesheets in.

## Text role

Panel.

## Surface and behavior

Hover, keyboard-active and open-submenu rows fill; the current row, which the owner marks with `aria-current="true"`, uses the selected fill; one of a set of choices is a radio row and an on/off setting a checkbox row, each ending with a 1rem check mark while checked and keeping its space while not, so the menu's width doesn't change with the choice; labels don't wrap; a row that runs a command with a key shows the key's label, muted, at the row's end, where every row's key, check mark and chevron end at one edge, at least 2rem after the row's own label, in every menu; disabled rows are dimmed, in `GrayText` under forced colors, focusable and inoperable.
Under forced colors the current row is `HighlightText` on `Highlight`, and a disabled current row is `GrayText` on `Canvas` inside a 1px `GrayText` outline, which its keyboard focus outline replaces.
A row's description is muted and read with its label.
A row's value, such as the chosen model on a submenu row, is muted, sits at the row's end before its key, check mark or chevron, is read with its label, and takes the row's text color while the row is current; a label too long for the menu is cut before the value.
A row's tag is read right after its label; type-ahead matches the label alone.
A label too long for its row is cut before the tag, and the tag, which never wraps, ends with an ellipsis only once the label is gone, so it stays clear of the row's trailing part.
A label or description too long for the menu ends with an ellipsis and shows its full text in a tooltip under the pointer, only while it is cut.
While the keys rest on a row whose label or description is cut, one tooltip beside the menu, level with the row, shows the label and the description, joined by a comma, so every cut text can be read without a pointer; it leaves the tag out, as a select's option tooltip does. The first Escape hides it and leaves the menu open, and the next closes the menu. It hides while a submenu of the row's menu is open, even one opened on hover. A focus from code, as when a menu the keys opened focuses its first row, counts as the keys' while the last input was a key, as for a dialog's focus; a click, or a focus from code after a pointer press, shows none.
