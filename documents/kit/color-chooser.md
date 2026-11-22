# Color chooser

**Scope:** The kit's color chooser and its color picker: their default geometry, the text role they use, and their surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

Each item is a circle `--nol-color-swatch-size`, 1.5rem, across, with a 1px border, 0.5rem apart, wrapping onto further lines when they do not fit.
The picker is `--nol-color-picker-width`, 15rem, wide and never wider than its container, with 0.5rem between its parts: the saturation and brightness area `--nol-color-area-height`, 8rem, tall; the hue track `--nol-color-slider-height`, 0.75rem, tall, inset by half its height on each side so its thumb's center reaches both ends; and the hex row: the original color and the new one as a joined pair of swatch-size squares, the Hex label and the field.
Each thumb is a circle `--nol-color-slider-height` across, centered on its point.
The popover the chooser opens is as wide as the picker with its padding and border.

## Text role

Panel; the hex field is in the mono font.

## Surface and behavior

The chooser is a named radio group: None first when the owner allows it, the eight standard swatches, Blue, Teal, Green, Amber, Orange, Red, Magenta and Purple, then Custom.
Its value is a swatch's name, a custom color as `#RRGGBB`, or null for None.
Each swatch is filled with its `--nol-swatch-<name>` token, the same light and dark values as `author-1` to `author-8`, so a choice reads well in both modes, and keeps at least 3:1 on the window, panel, raised and card surfaces.
None shows a block glyph, and Custom a palette glyph until a custom color is chosen, then that color.
Each item names its color in its accessible name and tooltip, so color is never the only cue: "Blue", "None", "Custom color" or "Custom color #3A7D44".
The chosen item, or the first when none is chosen, is the one Tab stop, and the arrow keys, Home and End move the choice and the focus together, wrapping at the ends.
Arriving at Custom by keyboard chooses the last custom color, or, when there is none yet, the chosen swatch's color as painted where the chooser is, blue when nothing is chosen, without opening the picker; a click, Enter or Space on Custom chooses it and opens the picker in a popover.
The chosen item has a 2px ring in the panel color and a 1px ring in the strong text color outside it, and a swatch or custom color also a check mark in the panel color; a hovered item's border takes the strong text color; keyboard focus is a 1px accent outline outside the rings.
Disabled, the group and its items are marked `aria-disabled="true"`, at half opacity with the default cursor and no hover look; they stay focusable, choose nothing, and Custom opens no picker.
The chooser reports that it was touched when the focus leaves it and its picker, but not when it moves between the items or into the picker, so a signal forms field bound to it marks itself touched.

A custom color with under 3:1 contrast, the non-text minimum, with the theme's window, panel, raised or card surface in the light or the dark mode shows a warning [field message](field-message.md) below the group, which names the mode or modes, describes the group and never blocks the choice.
The chooser speaks the warning politely through the kit's announcer when it appears or its text changes, but not for a value it starts with, since the field message has no live role.
It checks the default theme unless the owner gives the chooser another one, as an app painted in its own theme does, since the chooser leaves the page's painting to its owner; a swatch shows none, since its own values keep the contrast.

The picker is a named group.
The area shows the hue at full saturation and brightness, white toward its left and black toward its bottom; the track shows the hues from 0 to 359 degrees; these draw the color space itself, so they are the one place the kit paints colors that are not theme tokens.
The area's thumb is one slider: the left and right arrows change the saturation by 1, the up and down arrows the brightness by 1, Page Up and Page Down the brightness by 10, and Home and End the saturation to 0 and 100; its value text names both.
The hue thumb is a slider from 0 to 359: the arrows change it by 1, Page Up and Page Down by 10, and Home and End go to its ends.
Shift multiplies an arrow's step by 10; a press on the area or the track moves its thumb to the pointer and focuses it, and a drag follows the pointer until it is released or Escape cancels it.
A thumb is filled with its color, with a 2px border in the panel color and a 1px ring in the strong text color, so it shows on any color; keyboard focus adds a 2px accent ring.
The hex field takes `#RGB` or `#RRGGBB`, with or without `#`, in either case, as it is typed, and shows the current color as `#RRGGBB` again once it loses the focus or on Enter.
The picker keeps its hue while the saturation or the brightness is 0, so the area doesn't jump.
The original swatch shows the color the picker opened with, beside the new one, so the two can be compared.
It is a button that chooses that color again, named and with a tooltip such as "Back to the original color, #3A7D44"; a hovered one's border takes the strong text color, and keyboard focus is a 1px accent outline.
A picker that opens with no color shows only the new one.

Under forced colors the swatches, the area, the track, the original and new swatches and the check mark keep their colors, the chosen item has a 2px `CanvasText` outline, keyboard focus is a 2px `Highlight` outline, and a disabled item's border is `GrayText`.
