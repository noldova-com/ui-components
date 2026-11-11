# Progress

**Scope:** The kit's progress: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

2px bar; a 1rem spinner whose ring is 0.75rem, centered, so it sits beside icons at their glyph size; a delayed one stays hidden for 300ms so brief work does not flash it.

## Text role

The bar is a progress bar named for its work, with its fraction only when known; the spinner is a status whose text names the work, shown only once the spinner is, so a delayed one is announced when it appears, and its ring is hidden from assistive technology.

## Surface and behavior

Progress token fill over a track of the same color at 25%, drawn by the kit's progress bar, never the native element; an unknown amount slides a bar across the track, standing still under reduced motion.
The spinner is a ring of the progress color over the same faint ring, turning, and a half ring standing still under reduced motion; a working tab shows this spinner, without a label; completion/error remain understandable without animation.
Under forced colors the bar's track is `Canvas` inside a 1px `CanvasText` outline, as the [meter](meter.md)'s is, and its fill is `Highlight`; the spinner is a 2px `Highlight` arc on a thinner, 1px `GrayText` ring, so the track shows in both.
A spinner on a `Highlight` fill draws its arc in `HighlightText` instead, so it shows on the fill: every part whose `Highlight` fill can hold a spinner sets `--nol-spinner-forced-arc` to `HighlightText`, which are the selected tab, the pressed toolbar and icon buttons, the selected virtual-list option and the current menu item; it goes back to `Highlight` where an unavailable state's fill returns to `Canvas`, as on an unavailable pressed button or current menu item.
Under reduced motion the still half ring's two arc sides both take that color.
