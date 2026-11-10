# Choice pills (toggle group)

**Scope:** The kit's choice pills: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

1.375rem minimum visual height; the pill padding on each side; 0.25rem gaps, wrapping onto further lines when they do not fit; small radius.

## Text role

Panel, the emphasis weight.

## Surface and behavior

A named radio group of radios: the checked pill, or the first when none is checked, is the one Tab stop, and the arrow keys, Home and End move the choice and the focus together, wrapping at the ends.
The checked pill takes the selected fill and a hovered one the toolbar hover fill, so it still shows on a row that is hovered itself; a long title wraps inside the pill, which never grows wider than its group; no border or check mark; keyboard focus is an outline inside the pill.
Under forced colors the checked pill is filled in `Highlight` with `HighlightText` text, a hovered one has a 1px dashed `Highlight` line inside it, and keyboard focus is a 2px `Highlight` outline 2px outside the pill, on any pill, so a `Canvas` gap parts it from the checked pill's fill.
