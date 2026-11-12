# Completion list

**Scope:** The kit's completion list: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

The owner places and sizes the list: the kit sets no position, z-index or width on it, so an owner shows it in an overlay above or below its field, as wide as it chooses.
The menu's box: `menu-padding`, 0.25rem, above and below the rows, a 1px `--nol-menu-border` border and a large radius.
At most twelve rows high with that padding and border, or the owner's `maxHeight` in CSS pixels when that is less, such as the room between its field and the window's edge; more rows scroll inside the list.
Rows as the [menu item](menu-item.md)'s: 1.875rem minimum high, a 1.625rem fill inset 0.25rem from the list's sides and by the tab's side inset, 0.125rem, above and below, so two filled rows stand `--nol-row-gap`, 0.25rem, apart while the rows themselves meet; 0.5rem text padding; medium radius.
Each row is its label, then any note in a column at the row's end as wide as the widest note, 0.5rem after the label's column: the rows share their columns, so every note starts at the same edge.
A label too long for the row ends with an ellipsis, and its note stays whole.

## Text role

Panel; a note muted; the labels in the code font when the owner marks them as code, such as names in a code editor.

## Surface and behavior

Menu surface, border and text with the large shadow, as the [menu](menu.md)'s.
The active row and a hovered row take the hover fill, as a hovered menu item does; under forced colors a hovered row has a dashed 1px `Highlight` outline and the active row a solid 2px one.
The host is the listbox, named by the owner's label, with the owner's id, so the owner's field is a combobox that controls it; each choice is an option, whose name is its label, then a comma and its note when it has one, and the active one is marked selected; a note has no role of its own.
The owner keeps the focus in its field, filters the choices, moves the active one with its keys and points the field's `aria-activedescendant` at the active option's id, `<listId>-option-<index>`, which `CompletionListComponent.optionId` gives; the list keeps the active row in view by scrolling itself alone.
A click on a row reports its choice, the same instance the owner gave; a press anywhere on the list keeps the focus in the field.
