# Popover

**Scope:** The kit's popover: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

Preferred width 27.5rem, clamped to the overlay bounds; large radius; 1px border; 0.75rem padding; 0.5rem gaps.

## Text role

Panel.

## Surface and behavior

Menu surface, border and large shadow; the kit's popover surface, opened by the kit's popover trigger, which every popover uses and which exposes `aria-haspopup="dialog"` and its expanded state, above the control and end-aligned unless it asks otherwise; anchored to its control and kept within the overlay bounds, scrolling when its content is taller; non-modal: focus moves into it, Tab and Shift+Tab move among its controls, and Escape, a Tab past its last control or a Shift+Tab before its first, or a click outside closes it, as a menu does; scrolling around its control or its control stopping rendering closes it, and Escape and Tab return focus to the control. A Tab or an Escape that a control inside already handled closes nothing.
