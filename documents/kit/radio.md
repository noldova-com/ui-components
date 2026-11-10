# Radio

**Scope:** The kit's radio and radio group: their default geometry, the text role they use, and their surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

1.125rem visual circle, the checkbox's size and border, centered on the label's first line however many lines the label wraps to; 0.5rem label gap; a filled dot half the circle's size, centered in it.
A group stacks its radios with 0.5rem between them, and its choice rows, which pad themselves, with none.

## Text role

Panel label.

## Surface and behavior

The browser's own radio, so its keyboard is the platform's: the radios of a group share one name, the checked radio, or the first when none is checked, is the group's one Tab stop, and the arrow keys move the choice and the focus together; while a radio of the group has focus, it is the group's one Tab stop, so Tab and Shift+Tab leave the group from it even when it is unchecked.
The group is a named `radiogroup` and holds the chosen value; a radio outside a group takes its own `checked`.
Label participates in the hit target; border and dot remain identifiable, and in forced colors the dot is the text color; disabled dims the circle, its dot and the label to half strength, as the kit's other disabled controls are dimmed, draws the circle's border, the dot and the label in `GrayText` under forced colors, and keeps the default cursor on the label; keyboard focus is the checkbox's outline.
A disabled radio is marked `aria-disabled="true"` rather than natively disabled, so it stays focusable, keeps focus when it turns disabled, and the arrow keys move the focus onto it without picking it; a click, Space or an arrow key never picks it, and focused it stays dimmed as a whole while its control draws the outline over it at full strength, as a disabled checkbox does.
