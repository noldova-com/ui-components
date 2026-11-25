# Choice pills (toggle group)

**Scope:** The kit's choice pills: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

1.375rem minimum visual height; the pill padding on each side; 0.25rem gaps, wrapping onto further lines when they do not fit; small radius.

## Text role

Panel, the emphasis weight.

## Surface and behavior

A named radio group of radios: the checked pill, or the first enabled one when none is checked, is the one Tab stop, and the arrow keys, Home and End move the choice and the focus together, wrapping at the ends; right to left, ArrowLeft moves to the next pill and ArrowRight to the one before, and a key held with Alt, Ctrl or Meta does nothing.
A disabled option's pill is marked `aria-disabled="true"`, at half opacity with the default cursor and no hover fill, `GrayText` at full opacity under forced colors, and filled in `GrayText` with `Canvas` text when it is the checked one; a click on it chooses nothing, and the arrow keys, Home and End pass over it to the next enabled pill.
The checked pill takes the selected fill and a hovered one the toolbar hover fill, so it still shows on a row that is hovered itself; a long title wraps inside the pill, which never grows wider than its group; no border or check mark; keyboard focus is an outline inside the pill.
Under forced colors the checked pill is filled in `Highlight` with `HighlightText` text, a hovered one has a 1px dashed `Highlight` line inside it, and keyboard focus is a 2px `Highlight` outline 2px outside the pill, on any pill, so a `Canvas` gap parts it from the checked pill's fill.

## Icon-only

Pills the owner makes icon-only draw each option's icon alone, such as the [site header's](site-header.md#theme-switch) theme switch.

- Each is a square at the pill's minimum height with no padding, its Material Symbols glyph centered at the `icon` size in `icon-color`.
- An owner that sets `--nol-choice-pill-target` larger than the pill gives each one a hit area of that size, drawn nowhere: the first reaches past its start, the last past its end, and those between by half the difference on each side, so the areas of up to three pills don't cover each other where the gap is at least half the difference.
- It is named and tooltipped by the option's title, and its glyph is hidden from screen readers.
- An option without an icon keeps its title pill.
- Under forced colors the glyph takes its pill's text color: `HighlightText` when checked, `GrayText` when disabled.
- Choice, focus, keyboard and hover are a title pill's.
