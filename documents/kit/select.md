# Select

**Scope:** The kit's select: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

1.625rem minimum high; preferred width 20rem; small radius.
An option's tag, such as Recommended, is a status chip 0.5rem after its title, centered on the title's line, and keeps the option's height.
A group's label has the menu's section-label padding, 0.5rem above and 0.25rem below, with its text starting where its options' titles start, 0.5rem inside the row.

## Text role

Panel.

## Surface and behavior

Field geometry with the dropdown tokens; arrow in readable foreground; shrinks to its container.
A value that matches no option shows as itself, and its list opens with no option marked.
An option's tag is read with its title, type-ahead matches the title alone, and the button, which shows only the title, adds the chosen option's tag to its name; a title too long for the list is cut before the tag, which never wraps, and the tag takes the chosen option's text color while its option is chosen or active.
Options can be given in labeled groups, a `SelectGroup` each, in their place among the rest: a group shows its label above its options, muted, in the style of a [menu](menu.md)'s group label, and names the group for screen readers; the label takes no focus, and the arrow keys and type-ahead move across the groups' options as across any.
A disabled option is drawn as a disabled menu item is, its title and tag at half opacity with no hover fill, in GrayText in forced colors; it is read as unavailable, a press on it does nothing, and the arrow keys, Home, End and type-ahead pass over it.
A disabled option that is the value still shows on the button, and the list opens marking it and with it active, so the next arrow key leaves it for the nearest option that can be chosen; in forced colors it is GrayText on Canvas rather than in the system highlight, ringed in Highlight at twice the border width while it is the active option, as a focused disabled menu item is, and outlined in GrayText once the keys leave it.
The list opens below the field, or above it when it fits only there, never beside it, lined up with the field's start; it is at most 10.5 rows high, each row with its share of the row gap, and no taller than the larger room below or above the field in the window, scrolling the rest with the chosen option in view.
