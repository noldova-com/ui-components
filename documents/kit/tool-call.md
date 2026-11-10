# Tool call

**Scope:** The kit's tool call: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

Fills its container's width; header at least 1.625rem high, growing while the call is open to show its whole title, wrapped, with the twistie, the kind's icon, the target, the state and Cancel kept on its first line, where they sit on a closed call; its toggle 0.25rem from the start and Cancel 0.75rem from the end, as Copy is in a code block; body padded 0.5rem 0.75rem 0.75rem, its parts 0.5rem apart; output padded 0.5rem by 0.75rem, at most 20 lines high once all its lines show; nested calls inside the body, so inset by its padding and border, down to depth 3, and deeper ones lined up with their parent; medium radius; 1px border and body divider.

## Text role

Panel; the status, the times and the section labels in the label role, muted; the target in the code font at the label size; input and output in the code body role.

## Surface and behavior

The kit's tool-call card for an agent's message, which places it at the message body's width.
A header row: a toggle named by the title, which exposes its expanded state, controls the body region and is described by the state; the kind's icon; the title, on one line cut with an ellipsis while cut, with its tooltip above the toggle by default, beside the header row or none as the owner asks, and while the call is open, whole and wrapped, keeping its line breaks, with no tooltip; the target, a link-colored button of its own named Open and the target, cut in the middle so the start of the text gives way and its last segment stays, with the full target as its tooltip while cut; then at the end the status icon, or the kit's spinner while running, with the status text, the time taken, "Depth N" past depth 3, and "N nested calls" while collapsed, each after a divider; and Cancel while a call that can be cancelled runs, its tooltip the word the owner binds, Cancel by default or Stop for a call that stops, and its name that word and the title.
The owner can give calls shown titles by id, which the card and its nested cards take, each call only its own id's: the title shows its call's shown title in place of the call's own and is measured as the title, and a call with none shows its own; the toggle's name is what the title shows, while the title's tooltip, Cancel's name, the nested calls' group name and the end's announcement keep the call's own title.
The header fits any panel at least `--nol-dock-min-size` wide, never scrolling it sideways. As the panel narrows, the target gives way first, then the title down to 3rem; then the time taken, Depth and the nested count, then the status text, then the kind's icon; then the title below 3rem, still cut with an ellipsis. The twistie, the status icon or spinner and Cancel always stay. Each step is decided from the width the parts need unfolded, so a resize crosses it once; a folded part stays in the state the toggle is described by.
A nested call is indented while its header, and the header of every call open under it, keep the room they need fully folded; past that it stops indenting and shows "Depth N", as a call nested deeper than three levels does, and so do the calls under it.
The theme's spacing is measured with the parts, except that a folded row whose short title isn't cut can stay folded with room to spare after the spacing shrinks, until the panel's width changes; it never overflows.
Status shows by a symbol and text, with the added color for Done and the error color for Failed, never by color alone; Denied, for a call the person refused to allow, has a symbol of its own, muted like Cancelled, so it reads apart from both Failed and Cancelled. Waiting for your answer, for a call that asked the person a question, has a symbol of its own beside Waiting for permission, and is muted like it.
While running, the time taken counts up each second from one clock the kit shares among every running card, in plain text that is never announced; once the call ends it shows the time it took, in the app's locale.
A failed call opens by default, with its error first.
A card asks its owner for output it doesn't hold when it first shows open and when the person opens it.
The body shows the input, as fields or as a code block, then the output, then the nested calls.
An open call with nothing to show yet keeps its body hidden.
A call whose owner says it has no output, with no input, error or nested calls, has nothing to show but its title. While its whole title fits, it draws no twistie, its title starting where a twistie-drawing call's title starts, and its header is a plain label described by the state that doesn't toggle, exposes no expanded state and asks for no output; Show more can still move focus to it. Once its title is cut, it draws its twistie and toggles, and opened, its header shows the whole title, wrapped, with nothing in its body; it switches as its width changes.
Output shows its first 10 lines, then a Show all N lines button, which moves focus to the output without scrolling, so a feed row that keeps its place doesn't move; it then scrolls inside the card, a named region in the Tab order, following its end while the call runs until the person scrolls up inside it, by any amount, and again once they scroll down to within 16px of its end, and Up, Down, Page Up and Page Down stay inside it.
Copy input and Copy output copy the full text, with the kit's Copy feedback.
An output still loading shows a spinner and Loading output; one that failed says "The output couldn't load.", with Retry.
Retry pressed while it has the focus moves the focus to the card's toggle before the button goes; when the output's loading then ends, the focus moves to Retry again if it failed again, or to the output if it scrolls, and stays on the toggle otherwise, unless the person has moved it meanwhile; a change to the call before its loading starts moves it no further.
The first 20 nested calls show, then Show N more, which moves focus to the first call it shows.
The end of a call the card saw running is announced once, politely, as "Title: Done"; Escape passes out of the card, unless a tooltip of the card shows, which it hides first.
