# Popover

**Scope:** The kit's popover: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

Preferred width 27.5rem, clamped to the overlay bounds; large radius; 1px border; 0.75rem padding; 0.5rem gaps.

## Text role

Panel.

## Surface and behavior

Menu surface, border and large shadow; the kit's popover surface, opened by the kit's popover trigger, which every popover uses and which exposes `aria-haspopup="dialog"` and its expanded state, above the control and end-aligned unless it asks otherwise; anchored to its control and kept within the overlay bounds, scrolling when its content is taller; non-modal: focus moves into it, Tab and Shift+Tab move among its controls, and Escape, a Tab past its last control or a Shift+Tab before its first, or a click outside closes it, as a menu does; scrolling around its control or its control stopping rendering closes it, and Escape and Tab return focus to the control. A Tab or an Escape that a control inside already handled closes nothing.

A trigger can open its popover on hover and focus instead of a click, for details shown as an item is pointed at or reached by the keyboard. The popover then opens once the pointer has rested on the control for the tooltip's delay, 500ms, or at once when the control takes the focus from the keyboard, and the focus stays where it is. Enter or Space on the control then opens it if needed and moves the focus into it, as a click does on a click trigger, so a keyboard user reaches its controls. The pointer can cross from the control into the popover and back, through the gap between them, without closing it. It closes after the tooltip's hide delay once the pointer has left both, or, when the focus opened it, once the focus has left both. Escape closes it and leaves the focus where it was, or returns it to the control from inside the popover. Touch has no hover, so a tap opens and closes it as a click does, and a mouse click on the control does nothing. The control keeps `aria-haspopup="dialog"` and its expanded state, and the popover's place and size are the same as on a click.
