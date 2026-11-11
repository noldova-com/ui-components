# Dialog

**Scope:** The kit's dialog: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

Preferred width 27.5rem; large radius; title padding 1.375rem 2rem 0.75rem 1.25rem, all but its end, since Close follows the title 0.5rem after it: an icon button with a tooltip, centered on the title's first line; the title, body, actions and the end of Close's × share one content edge 1.25rem from both sides, the body's, while Close's hover box and hit area reach past it: body 0 1.25rem; actions 1.25rem 1.25rem 0.5rem with 0.5rem gaps.
Medium: preferred width 40rem, and otherwise the default geometry; on a window narrower than that and the overlay bounds' gaps, it shrinks to the overlay bounds' width, as the default size does.
Large: 80% of the viewport each way, at least 30rem by 20rem unless the overlay bounds are smaller; a title bar padded 0.5rem 1.25rem with a bottom border, so the title starts and Close's × ends 1.25rem from the dialog's edges, the title on one truncated line, then the owner's controls, then the dialog's own controls, Maximize and Close, icon buttons with tooltips, Maximize a single square and Restore two overlapping squares; maximized, the whole overlay bounds until Restore, for as long as the dialog is open; a body without padding; no actions.

## Text role

Panel; title at the emphasis weight, in `text-strong`.

## Surface and behavior

Dialog surface, 1px border, extra-large shadow and modal backdrop, which fades in with the overlay library's own transition, 400ms, and fades out with it when the dialog closes, however it closes, from the opacity it got to, taking no pointer meanwhile and under any dialog opened before it ends, and leaves the window as its `opacity` `transitionend` or `transitioncancel` is sent, which a listener on the document still hears, after the backdrop has left, as it hears any backdrop's fade end, or goes by the library's 500ms limit if the fade hasn't ended, as in a hidden window, while the focus, `closed` and the window behind it come back at once; both happen at once when reduced motion is preferred, and the fade-out does when a dialog opened after this one is still open, so that dialog never shows under it; centered within the overlay bounds each time it opens; content/actions reflow; the body scrolls under the thin scrollbar within the overlay bounds, while a large dialog's content lays itself out.
Escape asks its owner to dismiss it unless a control inside already handled it, as does Close at every size, and a click on the backdrop does nothing, and the focus stays where it was; the control the dialog first focuses, Close unless its owner names another, shows its focus ring only when a key opened the dialog; at the default size Close is the first stop of the tab order, and at the large size the owner's controls and Maximize come before it.
The title names the dialog, and an element the app marks `nolDialogDescription`, such as the line that says what an answer does, describes it for as long as it is there, set before the dialog's first focus so a screen reader reads it with the title when the dialog opens, and several marked elements describe it together; a dialog without one has no description.
Dragging the title bar with the primary pointer button moves the dialog, though not from the bar's buttons, and never past the overlay bounds, the whole dialog inside them while it is dragged and as the window resizes; Escape during the drag puts it back where the drag began, while a drag the window ends, past its edge or as it loses focus, leaves it where it was dragged; a maximized dialog doesn't move, and Restore puts it back where it was moved.
