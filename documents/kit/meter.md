# Meter

**Scope:** The kit's meter: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

A 4rem by 0.25rem bar, `meter` by `meter-height`, fully rounded; its text 0.5rem after it, `meter-gap`, on one line, ending with an ellipsis when the meter's container is too narrow; without text, the bar alone.

## Text role

Panel, muted; in the warning tone, the warning color.

## Surface and behavior

For how much of a limit is used, such as an account's usage in a settings list, with text that says it, such as 42% · Nov 2.
The progress color fills the bar from its start to the fraction, over a track of the same color at 25%; the fill keeps the bar's rounded ends.
The warning tone, for use near the limit, draws the fill, the track and the text in the warning color.
A `meter` named by its label, with its fraction from 0 to 1 as its value and its text as the value's text, or, without text, the fraction as a percentage in the app's locale, so it is never read as a bare fraction; a value outside that range shows as the nearer end, and one that is not a number as 0.
Under forced colors the bar is outlined in `CanvasText` and filled in `CanvasText` over `Canvas`, in either tone, so the text says when it is near the limit.

## Variables

The code that uses a meter can set three variables on its element; unset, the meter looks as above.

- `--nol-meter-track`: the track's color, such as `var(--nol-selected)` under a muted fill; by default the fill's color at 25%. A track set this way keeps its color in the warning tone.
- `--nol-meter-text-size`: the text's size, such as `var(--nol-text-small)`; by default `--nol-text-panel`.
- `--nol-meter-grow`: `1` makes the meter as wide as its container and grows its bar from its start to the gap before its text, which keeps its own width; by default `0`, the bar `meter` wide. The bar never gets narrower than `meter`, so text too long for the rest of the row still ends with an ellipsis.
