# Plan

**Scope:** The kit's plan checklist: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

Fills its container's width; padded 0.25rem by 0.75rem; each step's row at least 1.5rem high, with its text's first line centered in it; a 1rem marker, centered on the first line, 0.5rem from the text, which wraps; no height cap; medium radius; 1px border.
With `framed` off, for an app that sets the list in a frame of its own, such as a block framed like a code block, it has no border, radius or padding, so the first step starts at its top and start edges, and each row keeps its height and its marker's place.

## Text role

Panel, in the text color and at the same weight for every step, whatever its status.

## Surface and behavior

The kit's plan checklist for an agent's message, which places it at the message body's width: one card for every provider's plan, always open, listing every step in order, with no header and no numbers.
Each step shows its status by a marker and its accessible name, never by color alone: done, a filled check circle in the muted text color; in progress, the kit's spinner in the progress color, its ring as wide as the circles and on their center line, still under reduced motion; not started, a dashed circle in the muted text color.
A step in progress shows its active text, such as Running the tests, when the agent gives one, and its text otherwise.
Done text isn't struck through or muted.

The card is a list named Plan, N of M done, and each row a list item named by its shown text and its status, done, in progress or not started; the markers are hidden from screen readers.
Rows are kept by position, so a new plan the owner binds with the same steps updates the rows in place, and only a marker whose status changed is drawn again.
When the owner binds a new plan, the card announces it politely: each step whose status changed, as Step 2 of 5 done: Run the tests; the plan as its list is named, as Plan, 4 of 5 done, when more than two steps changed status at once, such as when the agent marks the rest done; or Plan updated, 5 steps when the steps themselves changed, in number or text.
The first plan a card shows, such as one from the history, is not announced.
Nothing in the card takes focus.

Under forced colors the markers are in `CanvasText`, and the spinner a 2px `Highlight` arc on a thinner, 1px `GrayText` track.
