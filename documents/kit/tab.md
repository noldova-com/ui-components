# Tab

**Scope:** The kit's tab: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

Shape `pill`: 2rem minimum high; up to 16rem wide; 1.5rem pill; 0.125rem side inset; the pill padding on both sides of the pill; 1.5rem action slot reaching 0.25rem into the end padding, so the close glyph stands the pill padding from the end as the icon does from the start; 1.25rem close pad; small radius.

A tab may lead with more than its icon, in this order, each 0.375rem, `tab-part-gap`, before the next part, where the icon keeps its 0.25rem:
- a marker glyph, 0.875rem, `tab-image`;
- then one of: the leading spinner, 0.75rem, `tab-spinner`, with a 0.09375rem stroke, `tab-spinner-stroke`; a status glyph, 0.875rem; an image, 0.875rem square, rounded 0.1875rem, `tab-image-radius`, fitted whole, with its glyph, 0.875rem, in its place until it loads; or the icon.

An underlined tab carries a 0.125rem line, `tab-underline`, inside the pill's bottom edge.

## Text role

Panel.

## Surface and behavior

Selected/hover fill; selected text or opaque tab text; the icon never shrinks and a long label truncates, keeping its full title as its accessible name, which a view badge's description joins, and in a tooltip below the tab shown only while truncated; accessible close target fits the action slot.
While working, a spinner at the icon size stands in the action slot and the tab is busy; while waiting for the person, a raised hand (`pan_tool`) at the same place and size stands there instead, in the tab's text color, the tab is not busy, and the accessible name ends with "waiting for your answer".
Either way, the close button takes the slot on hover and keyboard focus; a tab that can't close keeps its spinner or hand there.
A working tab may instead show its spinner in the leading place, where it stands in for the image, status glyph or icon, and keep its close button at the end, as a tab not working does; the hand still wins.
The image shows once it has loaded; its glyph, or `public` when the app gives an image without one, stands in its place while there is no image, while it loads, after it fails, and in forced colors, in the icon color.
A status glyph is in its tone's status color, `--nol-status-ok` or `--nol-status-failed`, or the tab's text color, and its description joins the accessible name after the title.
The marker is in `--nol-accent`, with its own tooltip below it, whose text joins the accessible name after the status's description; the underline is `--nol-accent`, and its description joins the name after the marker's, before the badge's.
Under forced colors the marker and the status glyph take the tab's text color, and the underline is `Highlight`, or `HighlightText` on the selected tab.
A working tab's spinner, first or in the action slot, draws its arc in `Highlight` on a 1px `GrayText` ring, or both in `HighlightText` on the selected tab, so neither matches the fill and the spinner still reads as turning.
Under forced colors the selected tab is filled in `Highlight` with `HighlightText` text, a hovered one has a 1px dashed `Highlight` line inside its edge, and keyboard focus is a 2px `Highlight` outline 2px outside the fill, on any tab, so a `Canvas` gap parts it from the selected tab's fill; with the default shape the fill and the hover line reach over the tab's 0.125rem side inset, so the label keeps that room from the fill's edges, and the tab keeps its size and its label's place.
In editing mode the label becomes the kit's text field, named "Tab title", laid on the label's own box with no padding or border, so its text starts where the label's text started and the tab, its icon, badge and close button keep their size and place; a 1px `--nol-accent` outline, 2px `Highlight` under forced colors, lies outside that box.
The field starts with the title, focused and selected; Enter or leaving the field reports the trimmed text, possibly empty, and Escape cancels, once per editing, while the field's keys and clicks never activate or close the tab.
The app leaves the mode, which restores the label and, when the field had the focus, gives it back to the tab.
