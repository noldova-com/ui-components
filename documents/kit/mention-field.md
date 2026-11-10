# Mention field

**Scope:** The kit's mention field: its default geometry, the text role it uses, its surface and behavior, its chips and its value.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

The field is the owner's `textarea`, styled as the owner styles its fields, except that its glyphs and its background are transparent, so the owner draws its fill on the box around it: the kit draws the text, its chips and its inline code in a copy just before the field, at its place, size, font, padding, text color and scroll position, so each character of the copy lies under the field's own; the field keeps its caret, in its text color, its selection, its text drawn by the field itself in `HighlightText` on a `Highlight` band, and its placeholder.
The copy is anchored to the field with CSS anchor positioning, so a move of anything around the field, or a scroll of a box it is in, takes the copy along in the same layout.
Layout also caps the copy at the field's inner box, so a field that shrinks, such as a composer emptied by a send, never leaves a larger copy behind until its resize is delivered: a stale copy could make a box around the field scroll, and the scrollbar would change the field's size again in the same frame, a ResizeObserver loop.
The field's parent must be positioned, for example `position: relative`: it is the copy's containing block, so every box that clips or scrolls the field clips the copy as it clips the field, whatever moves the field; in development, the console says so once for a parent that isn't positioned.
While the directive is on it, the field's own `anchor-name` holds the anchor's name.
A word that spell-check or grammar-check marks keeps its squiggle, and its glyphs stay transparent as the field's others do, so only the copy draws it, inside a chip or inline code too; under forced colors the field draws its own text, marked words with it.
A chip and inline code take no space of their own and never change their glyphs' widths, so the caret and the selection stay exactly on the text.
The field's selection is `--nol-text-selection` with its text in `--nol-text-selection-foreground`, so its contrast doesn't depend on the system's accent color; under forced colors it is `Highlight` with `HighlightText`.
The list stands right above the field, as wide as it and aligned with its start edge, at most `mention-list-height`, 16rem, high; 0.25rem inner padding; rows at least `mention-row-height`, 2.5rem, high, with 0.25rem by 0.5rem padding inside a fill of that height with a small radius, and the row gap: each row is 0.25rem taller, its fill inset by the tab's side inset, 0.125rem, above and below, so two filled rows stand `--nol-row-gap`, 0.25rem, apart as two tabs' pills do, while the rows themselves meet and the pointer never crosses space between them; each a small avatar, 1.5rem, the name 0.5rem after it and any note 0.5rem after the name, on the same line; a section label with the menu label's padding before each run of rows of one section; large radius.

## Text role

Panel; section labels in the label size, muted.

## Surface and behavior

Menu surface, border and text with the large shadow; the active row takes the selected fill with the list's text, as the quick input's does, Highlight in forced colors, and a hovered row the hover fill; an unavailable row is at half opacity; a note is muted, in the list's text on the active row and HighlightText in forced colors; a note too long for the row ends with an ellipsis at the row's end, and a name too long ends with one at the row's end, where a name without a note ends, cut only once its note is gone, so the name a person picks stays in view; the avatar shows the candidate's image, initials and `avatarColor`, or else the hue of its color, or else the hue its id picks, and is decorative, since the row names the candidate.
A mention is `@` and a name of words of letters, marks, digits, `_` and `-`, with one space between words in a candidate's name, where the text may hold a run of spaces that reads as one, both for the candidates offered while typing and for the name found, after a blank, an opening parenthesis or the start of the text, outside code and escapes, and not followed by `/` or by `.` and a word, as in a path or a file's name; the longest name that fits matches, in any letter case and Unicode form.
While the caret is in such a word, or in the words of a name of several, the field is a combobox over the listbox of the candidates whose names start with it, in the order given, the first one active, and each change of the word or of the number offered announces the number, politely.
Down and Up move the active row, wrapping at both ends, and it stays in view by scrolling the list alone; while the candidates change, the active row stays on its candidate, or goes back to the first when that candidate is gone; Enter, Tab or a click writes `@`, the name, never the note, and a space over the whole word as one edit the field can undo, puts the caret after it, dispatches an `input` event and reports the candidate; a press anywhere on the list keeps the focus in the field.
While the list is open, Down, Up, Enter, Tab and Escape, which closes it, go no further: neither the field's other listeners nor the content around it get them, so an owner's Enter to send or Escape to cancel waits for the list to close.
Shift+Enter and Shift+Tab, a key while text is being composed, and a key with Ctrl, Alt or Meta held go to the field, as does Escape with the list closed; the field follows the text typed while composing, as it follows any other.
The list closes when no name starts with the word, the caret leaves the word, the field loses focus, the content around the field moves it, or the field is hidden; a click or a key that moves the caret opens it again where a mention can go, never on a chip, a name already chosen.
The row's name is its candidate's name, then its note, then "unavailable" when it is, then its section where a section starts, so screen readers hear it; the section label itself is hidden from them.

## Chips

A chosen candidate becomes a chip tied to its id: its `@` and name in the `mention` color, as a message draws a mention, with a 0.03em stroke in that color standing in for the message's emphasis weight, which would widen the glyphs; under forced colors, the field's own text with a 1px `Highlight` outline.
The list never opens again for a chip.
The caret never stops inside a chip: Left and Right go past it, a click lands at its nearer end, and a selection's moving end goes past it the way it moves while its other end takes the chip whole.
Backspace right after a chip takes its last word, so "@Chat Bot" becomes "@Chat", and Delete right before a chip takes its first word after the `@`, so "@Chat Bot" becomes "@Bot" with the caret still before it; the rest stays tied to the same id, either key takes a chip of one word whole, and each is an edit the field can undo, and undo and redo bring back the chips the text had.
Any other edit inside a chip, such as pasting over part of it, leaves its text plain.
A read-only field changes nothing: its list doesn't open, a list that was open when the field turned read-only closes on the next key, click or pick, and Backspace, Delete, Enter and Tab do only what the field itself does.
A typed or pasted `@name` that was never chosen is plain text, even when it matches a candidate; the Markdown view still marks it by its name.
Paste inserts plain text.

Inline code, between backticks as Markdown reads it and outside fenced blocks, shows on the `inline-code` tint with a small radius, in the field's own font, its backticks hidden but keeping their space; under forced colors, a 1px dashed `CanvasText` outline.
The rest of the Markdown, such as lists and emphasis, stays plain text in the field.

## Value

`nolMentionValue` binds the field's value both ways: its text with each chip written as `[@Name](mention:<id>)`, the id percent-encoded, `!'()*` included, so the Markdown view shows the value with its chips.
A backslash before text that would read as a chip writes it as text, and backslashes right before a chip are doubled, as Markdown reads them.
Setting the value shows its text with its chips again, as for a draft or a rewind; an empty value before any edit leaves the text the app set on the field itself.
`MentionValue.parse` reads a value's text and its chips, each with its id and the text it shows, so an app reads the ids mentioned without the link's grammar.
