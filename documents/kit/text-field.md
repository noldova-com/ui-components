# Text field

**Scope:** The kit's text field, on one line (`input`) or several (`textarea`): its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

1.625rem minimum high; preferred width 12.5rem; 0.375rem side padding; small radius.
On several lines: the same, with 0.375rem padding on every side, as many lines high as its `rows`, and resized only up and down.
No margin of its own: its reset to none weighs nothing, so a rule that places it from outside holds whatever order the page loaded the stylesheets in.

## Text role

Panel.

## Surface and behavior

Input tokens; the owner labels it; focus border; an invalid entry (`aria-invalid`) takes the error border, focused or not, and under forced colors a dashed `CanvasText` border twice as wide, its text where a valid field's is, beside the focus outline when focused; a disabled field's border and text are `GrayText` under forced colors; the owner puts its validation text in a field message below it, never inside the input.

## A button inside the field

A one-line field can hold one icon button inside it, at its end, such as a folder field's Choose folder button: `nol-text-field-box` holds the `input[nol-text-field]` and then the `button[nol-icon-button]`.
The box takes the field's preferred width, and the input fills it with its own border, colors and every look above.
The button's target sits inside the input's border at its end, centered on its line and just far enough from the border that its hover fill is as far from the field's end as from its top, and the input's text stops the field padding before that target.
Under forced colors the invalid cue's wider border leaves the button where it is and shrinks its fill by the border's extra width on each side, and the text runs that much further toward it, so the fill keeps its gaps to the border and to the text.
The button comes after the input by keyboard; while it has keyboard focus, the field shows its focus border, or its focus outline under forced colors, and an invalid field keeps its error border.
The owner names the button and disables it along with the input, so the two dim alike, and are both `GrayText` under forced colors.
In a right-to-left layout the button is at the left.

## Muted text at the field's end

A one-line field can hold muted text inside it at its end instead of a button, such as a name field's `Shown as "Work · Agent"`: `nol-text-field-box` holds the `input[nol-text-field]` and then an element marked `nolTextFieldEnd`.
The text is muted, in the panel role like the field's own, centered on its line, and ends the field padding before the input's border; the input's text stops the `space-2` step (0.5rem by default) before it, its end padding growing by the text's measured width.
The text never takes the typed text's room below 4rem: past that it is cut with an ellipsis, and since it takes no pointer, no tooltip shows the rest; a sighted person sees only the cut text, so an owner whose end text can grow long keeps the full text visible elsewhere, such as in a field message below the field.
The owner gives the text an id and names it in the input's `aria-describedby`, so it is read as the field's description; the text takes no pointer, so a click on it reaches the input.
Under forced colors an invalid field's wider border takes from its padding, so the text and the typed text's end stay where they are; a disabled field's text dims with it, and is `GrayText` under forced colors.
In a right-to-left layout the text is at the left.

## A glyph at the field's start

A one-line field can show a decorative glyph inside it at its start, such as a search field's `search`: `nol-text-field-box` takes the glyph's Material Symbols name as its `icon`, and holds the `input[nol-text-field]`, and may hold a button or end text after it as above.
The glyph is 1rem, in the theme's muted text color, centred on the field's line, and starts the field padding inside the input's border; the input's text starts the `space-2` step (0.5rem by default) after it.
Without a button or end text, the text runs to the field padding at the field's end, with no room kept for a button.
The field keeps its height, border, focus look and width; a null or empty `icon` shows no glyph, and the text starts where a plain field's does.
With end text, the glyph's room counts too, so the typed text still keeps its 4rem and the end text is cut sooner.
The glyph is hidden from assistive technology, so the input keeps the name its owner gives it, and it takes no pointer, so a click on it reaches the input.
Under forced colors an invalid field's wider border takes from its padding, so the glyph and the start of the text stay where they are; a disabled field's glyph dims with it, and is `GrayText` under forced colors.
In a right-to-left layout the glyph is at the right.
