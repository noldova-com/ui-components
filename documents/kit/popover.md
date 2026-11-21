# Popover

**Scope:** The kit's popover: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

Preferred width 27.5rem, clamped to the overlay bounds; large radius; 1px border; 0.75rem padding; 0.5rem gaps.

## Text role

Panel.

## Surface and behavior

Menu surface, border and large shadow; the kit's popover surface, opened by the kit's popover trigger, which every popover uses and which exposes `aria-haspopup="dialog"` and its expanded state, above the control and end-aligned unless it asks otherwise; anchored to its control and kept within the overlay bounds, scrolling when its content is taller; non-modal: focus moves into it, Tab and Shift+Tab move among its controls, and Escape, a Tab past its last control or a Shift+Tab before its first, or a click outside closes it, as a menu does; scrolling around its control or its control stopping rendering closes it; on a canvas, it follows its control through every pan and zoom and closes once the control leaves the canvas's free area; and Escape and Tab return focus to the control. A Tab or an Escape that a control inside already handled, or that ends an input method's composition, closes nothing.

A trigger can open its popover on hover and focus instead of a click, for details shown as an item is pointed at or reached by the keyboard. The popover then opens once the pointer has rested on the control for the tooltip's delay, 500ms, or at once when the control takes the focus from the keyboard, and the focus stays where it is. Enter or Space on the control then opens it if needed and moves the focus into it, as a click does on a click trigger, so a keyboard user reaches its controls; on a link, Enter still follows the link, and only Space does this. The pointer can cross from the control into the popover and back, through the gap between them, without closing it. It closes after the tooltip's hide delay once the pointer has left both, or, when the focus opened it, once the focus has left both. Escape closes it and leaves the focus where it was, or returns it to the control from inside the popover. Touch has no hover, so a tap opens and closes it as a click does, and a mouse click on the control does nothing. The control keeps `aria-haspopup="dialog"` and its expanded state, and the popover's place and size are the same as on a click.

## Variables

The code that uses a popover can set four variables on its `nolPopover` element; unset, the popover looks as above.

- `--nol-popover-preferred-width`: its preferred width, still clamped to the overlay bounds, such as `18rem` for a hover card; by default the theme's `--nol-popover-width`.
- `--nol-popover-surface`, `--nol-popover-border` and `--nol-popover-text`: its surface, its border's color and its text's color; by default the menu's, `--nol-menu`, `--nol-menu-border` and `--nol-menu-text`.

The kit gives every popover the menu's look; a hover card, a popover that opens on hover with details about an item, sets these variables to the hover surface the tooltip and the link reference card use: `--nol-hover-widget`, `--nol-hover-widget-border` and `--nol-text`.
Under forced colors it takes the system's colors, as a popover on the menu's surface does.
