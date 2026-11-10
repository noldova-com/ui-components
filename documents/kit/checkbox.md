# Checkbox

**Scope:** The kit's checkbox: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

1.125rem visual square, centered on the label's first line however many lines the label wraps to; 0.5rem label gap; hover radius; a drawn tick in a 1rem icon square, centered in the box.

## Text role

Panel label.

## Surface and behavior

Label participates in the hit target; border and check mark remain identifiable; disabled dims the box, its tick and the label to half strength, as the kit's other disabled controls are dimmed, draws the box's border, the tick and the label in `GrayText` under forced colors, and keeps the default cursor on the label.
A disabled box is marked `aria-disabled="true"` rather than natively disabled, so it stays in the Tab order and keeps focus when it turns disabled, and it refuses a click or Space; focused, it stays dimmed as a whole, as unfocused, and its control draws the focus outline over it at full strength.
