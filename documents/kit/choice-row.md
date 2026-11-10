# Choice row

**Scope:** The kit's choice row: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

A full-width row of a [radio](radio.md) or a [checkbox](checkbox.md) with a label and an optional description under it; 0.5rem block and 0.75rem inline padding; the mark centered on the label's first line however many lines the label and description wrap to; 0.5rem gap between the mark and the text.

## Text role

Panel label for the label; the description in the muted text color under it.

## Surface and behavior

A plain row: no border and no selected fill, so its pick shows by the mark alone, as [KIT.md](../KIT.md) says; a hovered row takes the hover fill with the small radius, and in forced colors a dashed Highlight outline inside its edge; a disabled row takes no hover fill.
The whole row is the control's hit target, so a click anywhere on it picks the radio or toggles the checkbox.
A radio row goes in a [radio group](radio.md), which holds the chosen value, gives the group's keyboard and stacks its rows with no gap; a checkbox row takes its own `checked`, and the owner groups checkbox rows under a label.
A long label or description wraps anywhere inside the row, which never grows wider than its container; disabled dims the mark, the label and the description as the radio or checkbox does, under forced colors draws the mark, the label and the description in `GrayText`, and the row keeps the default cursor.
So a note on why a row is disabled goes outside the row, at full strength, never in its description.
A disabled row stays focusable, as its radio or checkbox does: rows that turn disabled while an answer is sent keep the person's place, the group's arrow keys still move over them, and nothing changes when one is activated.
