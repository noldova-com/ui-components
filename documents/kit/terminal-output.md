# Terminal output

**Scope:** The kit's read-only terminal output view, `nol-terminal-output`: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

Full width; 0.375rem block and 0.5rem inline insets, the terminal pane's; no border or radius of its own, so its owner frames it.
It grows with its lines, up to the `maxHeight` its owner gives in rem, then scrolls inside, open at its end, and keeps its newest line in view as lines come while it is scrolled to its end, as a log does; a long line wraps at its width, anywhere when it has no break, so it never scrolls sideways.

## Text role

`--nol-font-mono` at `--nol-text-terminal`, 0.8125rem, the terminal's own font and size, in the terminal pane's rows: xterm's row, the font's ascent and descent measured as xterm measures them and rounded up to a device pixel, times `--nol-line-terminal`, 1.3, rounded down to one.
The view measures the row again as a font loads and as the device pixel ratio changes; until it has, the line height alone stands.

## Surface and behavior

The terminal's background and foreground tokens, with no cursor, input or scrollback of its own.
The app gives it lines, each with its text, whether it continues the line before, and its runs; a run has a length, a foreground and a background, and style flags: bold, dim, italic, underline, inverse, invisible, strikethrough and overline.
A color is the terminal's default, a palette index or an RGB color, the numbers a terminal stores: palette colors 0 to 15 are the kit's `--nol-terminal-ansi-*` tokens, 16 to 231 xterm's 6 × 6 × 6 cube, each channel 0 or 55 plus 40 a step, and 232 to 255 its grays, from 8 by 10.
Inverse swaps the colors, the defaults too; dim draws the foreground at half its alpha over its background; bold in palette colors 0 to 7 draws in their bright colors, 8 to 15, as xterm does; invisible draws the text transparent, yet it is still selected and copied.
Each run's text, dim and inverse included, is lifted to at least 4.5:1 against its background, as the terminal pane's minimum contrast ratio lifts it: each channel steps a tenth of the way toward black, or toward white, until the ratio holds.
The view resolves the theme's colors to lift them, again whenever the root's style or class changes or forced colors turn on or off.
Inside a `nol-terminal-dark` scope it draws the theme's dark terminal set in both modes, as [KIT.md](../KIT.md) says; the scope is set before the view starts, since a class on its container doesn't make it resolve its colors again.
A line the terminal wrapped joins the one before it, so it wraps again at the view's width.
The text is one text, each run only a span with no role, so a screen reader reads it whole and a selection copies it with its line breaks; selected text draws in the terminal's selection tokens.
Under forced colors it draws in CanvasText on Canvas, its runs too, and selection in Highlight, as `terminal.css` sets the terminal tokens.
