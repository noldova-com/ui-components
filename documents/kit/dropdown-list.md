# Dropdown list

**Scope:** The kit's dropdown list: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

1.875rem minimum rows, each a 1.625rem fill inset by the tab's side inset, 0.125rem, above and below, so two filled options stand `--nol-row-gap`, 0.25rem, apart as two tabs' pills do, while the options themselves meet and the pointer never crosses space between them; 0.25rem inner padding; 0.5rem row side padding; small radius.

## Text role

Panel.

## Surface and behavior

Dropdown surface, 1px border and widget shadow; chosen/keyboard row uses active-list pair; no decorative check mark; the list never scrolls sideways, and an option too long for it ends with an ellipsis, keeping its full text as its name and, while cut short, its tooltip, below the list or, without room there, above it, so it covers no option, for the row the arrow keys or typing reach; the list opens with the chosen row in view, and while focused from the keyboard with no keyboard row it shows an inset accent focus outline, Highlight in forced colors; Escape first hides a shown row tooltip, keeping the list open, then closes the list.
