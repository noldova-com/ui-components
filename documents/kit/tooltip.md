# Tooltip

**Scope:** The kit's tooltip: its default geometry, with and without a description, the text roles it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

Up to 43.75rem wide, clamped to the overlay bounds; 0.125rem vertical/0.5rem horizontal padding; hover radius; 0.5rem from its anchor.

With a description: up to 18rem wide, where the description wraps, clamped to the overlay bounds; 0.5rem vertical/0.75rem horizontal padding; the text as the title on its first line and the description on the lines below it, with no gap between them.
The width and padding are the theme's `--nol-tooltip-description-width` and `--nol-tooltip-description-padding`; a tooltip without a description, or with an empty one, keeps `--nol-tooltip-width` and `--nol-tooltip-padding`.

## Text role

Label, tooltip line height, in the text color; with a description, the title keeps that role and the description takes the label size and tooltip line height in the muted text color.

## Surface and behavior

Hover-widget surface, 1px border and large shadow; shows at once on keyboard focus, and on hover once the pointer has stayed 500ms on its anchor, so a pointer that only crosses the anchor on its way elsewhere opens nothing; while another tooltip shows, or up to 400ms after one closed, a hovered anchor's tooltip shows at once, so the pointer moving from control to control finds each one's tooltip without waiting again; it hides when the pointer leaves the anchor and the tooltip, though not while it crosses the space between them on its way from one to the other, and on a press, Escape or blur, and when a dialog opens, so the dialog's first Escape closes it, though a menu or popover that opens hides it only by the press or the focus change that opens it, marking the Escape that hides it handled as the document captures it, before any element or bubbling listener sees it; a truncation tooltip shows only while its text, or any of the parts its anchor marks as truncating, is cut short.
A tooltip that shows nothing as the pointer enters its anchor, such as a truncation tooltip whose text fits or a disabled one, leaves the waiting show of an anchor around it in place, so a menu row's tooltip still shows when the pointer goes on to its label; with no other show waiting, it waits as usual and shows if it can once its wait ends.
A tooltip describes its anchor for assistive technology, except a truncation tooltip and one whose text is the anchor's own accessible name, such as an icon button's label, so it isn't read twice.
A tooltip's description is read after its text, and also where the text isn't: on a truncation tooltip, and where the text is the anchor's name.
The text and the name compare without case and with runs of spaces as one, and the tooltip follows the name as it changes, from the anchor's `aria-label`, `aria-labelledby`, `aria-hidden` parts and text, and the text of the elements its `aria-labelledby` names; a labeling element added to the page after those ids are read is seen at the anchor's next change.
A page shows at most one tooltip: showing one hides any other at once, whichever control or overlay it belongs to, also while that one waits out its hide delay or the pointer's way to it, and cancels any anchor's tooltip still waiting for the pointer's rest, so a tooltip shown on keyboard focus isn't replaced by one hovered before it.
A tooltip removed from the page while it shows counts as closed, so the next anchor's tooltip within 400ms still shows at once, as when a streaming reply draws its anchor again.

## Testing

A test that hovers an anchor to check what its tooltip shows, rather than when, provides `TooltipFixture.atOnce` from `@noldova/ui.components.angular/testing`, which opens a hovered tooltip, and a hovered link reference chip's card, at once, without the 500ms rest.
