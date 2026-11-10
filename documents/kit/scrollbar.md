# Scrollbar

**Scope:** The kit's scrollbar: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

0.375rem thick; round thumb; transparent track; no arrows.

## Text role

—.

## Surface and behavior

Every scrolling area, with no class to opt in, fades its thumb in while the pointer is over it and while it scrolls by any means (wheel, keyboard, script or a focus change), and fades it out once the pointer has left and 1s has passed since the last scroll, without the fade when reduced motion is preferred; an element given a transition of its own, outside any cascade layer or in a layer declared after the kit's stylesheet, such as the dialog's backdrop, keeps it in place of the thumb's fade, and that element's thumb then shows and hides at once; the thumb becomes more opaque while dragged; revealing it never shifts content or changes the area's text color.
A browser without WebKit's scrollbar styling, such as Firefox, shows its own thin scrollbar with the same thumb color and fade and a transparent track, and no change while dragged; forced colors keep the system's scrollbars.
