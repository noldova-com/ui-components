# Switch

**Scope:** The kit's switch: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

A 1.75rem × 1rem track, `switch-width` × `switch-height`, with fully round ends, centred on the label's first line however many lines the label wraps to, at the label's end, 0.5rem from it; a round 0.75rem knob, `switch-knob-size`, as far in from the track's start or end as from its top and bottom, 0.125rem, at the start while off and at the end while on, in either direction.

## Text role

Panel label.

## Surface and behavior

A native checkbox exposed as a switch, which reports whether it is on; the label participates in the hit target, and a switch with no visible label is named by the name its owner gives. It is controlled: a click or Space asks its owner for the other value, and it keeps showing the value its owner gives until the owner gives the new one, so a change the owner refuses never shows.
Off, the track is the checkbox's surface, `--nol-checkbox`, inside a 1px `--nol-checkbox-border` border, with the knob in `--nol-checkbox-border`; on, the track and its border are the accent, with the knob in `--nol-switch-knob`, white in the light theme and the panel color in the dark one; each meets 3:1 against what it sits on. Under forced colors the track keeps a border in the text color with the knob in the text color while off, and fills with the highlight color with the knob in the highlighted text color while on, so on reads apart from off.
A disabled switch is marked `aria-disabled="true"` rather than natively disabled, so it stays in the Tab order and keeps focus when it turns disabled, and it refuses a click or Space; it dims the track, the knob and the label to half strength, as the kit's other disabled controls are dimmed, draws them in `GrayText` under forced colors, keeps the default cursor on the label and, focused, its control draws the focus outline over it at full strength.
A disabled switch can say why it is disabled: its reason sits right under the label, as wide as the label's text, wrapping there rather than widening the switch, or as wide as its owner sets the switch when it has no visible label, in `--nol-text-muted` at the label text size and at full strength, `CanvasText` under forced colors, and it is the switch's accessible description; an enabled switch, or one with no reason, shows none.
