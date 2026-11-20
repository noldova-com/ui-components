# Canvas

**Scope:** The kit's pan-and-zoom canvas and its overview map: their default geometry, the text role they use, and their surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

The owner sizes the canvas; it is at least 12rem high, with a 1px `--nol-card-border` border and a large radius, and clips its content.
Its content sits on one plane, laid out at 100%, which the canvas moves and scales from its top-left corner.
The toolbar stands `space-2`, 0.5rem, inside the canvas's top-left corner: a panel with a 1px card border, a medium radius and `space-1` padding and gaps, holding zoom out, the zoom as a percentage at least 3rem wide, zoom in, Fit, 100% and the map's toggle.
The overview map stands `space-2` inside the canvas's bottom-right corner: its drawing 7rem high and at most 14rem wide, never stretched, in the proportions of the content and the visible area together, inside a 1px card border and a medium radius.
Fit leaves the toolbar's band at the top and, while the map shows, everything from the map's top down clear, and `space-2` at each side, so no item stands under either.

## Text role

Panel, for the zoom percentage, in tabular figures; the buttons take their own.

## Surface and behavior

The canvas is the window surface with a dot grid in the border color every 1.5rem; the toolbar and the map are the panel surface.
On the map, each item marked with `nolCanvasItem` is a box in the badge color, and the visible area a 1px rectangle in the accent color.
Under forced colors, the borders are `CanvasText`, the grid goes, the map's boxes are `GrayText` and its rectangle a 2px `Highlight` line on `Canvas`.

The zoom runs from 25% to 200%.
The wheel and a trackpad's scroll pan; Shift with the wheel pans sideways where the system hasn't turned it already; Ctrl or Cmd with the wheel, and a trackpad's pinch, which arrives as such a wheel, zoom around the pointer, doubling every 500px of wheel and by at most twice or half per event.
A wheel that counts lines moves 16px a line, and one that counts pages the canvas's height.
Dragging the background pans once the pointer has moved 4px, with the pointer captured; a press on a button, a link, a field, a label, editable text, the toolbar, the map or an element marked `data-nol-canvas-no-pan` never starts one, nor does any button but the primary.
Two pointers zoom around their middle by the change in their distance.
With the focus on the canvas itself, not on a control inside it, the arrow keys pan by 3rem, plus and minus zoom by 25% around the middle, and 0 fits.
The toolbar's zoom buttons zoom by 25% around the middle, 100% returns to actual size around the middle, and Fit shows the whole content, centred, never above 100%; content too large even at 25% starts at the area's top-left.
The canvas fits its content once the content first has a size, and keeps its view through later resizes.
A press on the map outside its rectangle centres that spot; dragging on the map then moves the view with the pointer.
The map's toggle shows or hides the map, pressed while it shows.

The canvas is a focusable region named by its owner's label, described as a canvas, with its keys as its keyboard shortcuts and a focus ring inside its border.
The toolbar is a toolbar named Canvas view, with one Tab stop and arrow keys between its controls, and the zoom percentage a polite live region.
The map is an image named Overview map, its drawing hidden from assistive technology.
