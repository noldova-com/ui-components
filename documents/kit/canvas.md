# Canvas

**Scope:** The kit's pan-and-zoom canvas and its overview map: their default geometry, the text role they use, and their surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

The owner sizes the canvas; it is at least 12rem high, with a 1px `--nol-card-border` border and a large radius, and clips its content.
Its content sits on one plane, laid out at 100% with 1rem padding, which the canvas moves and scales from its top-left corner.
The toolbar stands `space-2`, 0.5rem, inside the canvas's top-left corner: a panel with a 1px card border, a large radius and `space-1` padding and gaps, holding zoom out, the zoom as a percentage at least 3rem wide, zoom in, Fit with its icon, 100% and the map's toggle.
On a canvas too narrow for them in one row, the controls wrap onto further rows, in their order, so each stays inside the canvas, `space-2` from its sides, down to a canvas as wide as the widest control with the toolbar's `space-1` padding and border and that `space-2` inset on each side.
At its 12rem minimum height, the canvas keeps them all inside down to 13.75rem wide; narrower, each control takes a row of its own, and only a taller canvas holds them all.
Where the rows reach down to the map, they stand above it, so every control the canvas shows stays in reach.
The hint, "Drag to move · scroll to pan · pinch or Ctrl+scroll to zoom", follows it `space-1` away on the same kind of panel, with `space-1` by `space-2` padding, and wraps below it on a canvas too narrow for both; neither takes the pointer between them.
The overview map stands `space-2` inside the canvas's bottom-right corner: its drawing 7rem high, or 14rem wide and less high for wider content, never stretched, in the content's proportions, inside a 1px card border and a medium radius.
On a canvas too narrow for that, the map narrows, keeping its proportions, to stand `space-2` inside each side, or with `controlsPlacement` Floating, `space-3`; its boxes' and rectangle's radii narrow with it.
Fit leaves the band of the toolbar and the hint at the top and, while the map shows, the band of the map at its full 7rem height clear, whatever height the map has at that moment, and `space-2` at each side, so no item stands under either.
With `controlsPlacement` Floating, for a canvas that fills a whole pane, the controls float in its bottom-right corner instead: the toolbar `space-3`, 0.75rem, inside the corner, the map `space-3` above it at the same inset, and no hint; a toolbar that wraps keeps `space-3` from each side, its rows ending at its right. On a canvas too short for the map above the toolbar's rows, the map hides, rather than pass the canvas's top, until the canvas has room for it again; its button stays pressed and takes the focus the map held, and Fit treats the hidden map as absent. Fit then leaves `space-3` at the top and each side clear, and at the bottom the band of the toolbar and, while the map shows, of the map at its full 7rem height.
With `isFlush`, a canvas that fills a pane has no border or radius and stands on the panel surface rather than the window surface.

## Text role

Code, in the mono font, for the zoom percentage; small, in the muted text color, for the hint; the buttons take their own.

## Surface and behavior

The canvas is the window surface with a dot grid, which moves with a pan and keeps its size at every zoom: by default 1px dots in the menu border color every 1.5rem, which its owner can change with `dotSize`, `dotGap` and `dotColor`; the toolbar and the map are the panel surface.
On the map, each item is a box in the badge color with a 1px radius, and the visible area a 1px rectangle in the accent color with a 0.125rem radius. An item is an element marked with `nolCanvasItem` and declared inside the canvas, in its content or in a component the content renders, at any depth, while it renders inside the canvas; its box follows it as it is added, removed, resized or moved, measured at most once a frame however many changes the frame brings, and the map redraws only when a box changed.
Under forced colors, the borders are `CanvasText`, the grid goes, the map's boxes are `GrayText` and its rectangle a 2px `Highlight` line on `Canvas`.

The zoom runs from 25% to 200%.
The wheel and a trackpad's scroll pan; Shift with the wheel pans sideways where the system hasn't turned it already; Ctrl or Cmd with the wheel, and a trackpad's pinch, which arrives as such a wheel, zoom around the pointer by e^(−0.01 × the wheel's pixels), doubling about every 70px of wheel, and by at most twice or half per event.
Safari's trackpad pinch arrives as gesture events rather than a wheel, and the canvas doesn't handle them: in Safari, Ctrl or Cmd with the wheel zooms.
A wheel that counts lines moves 16px a line, and one that counts pages the canvas's height.
Dragging the background pans once the pointer has moved 4px, with the pointer captured; a press on a button, a link, a field, a label, editable text, the toolbar, the map or an element marked `data-nol-canvas-no-pan` never starts one, nor does any button but the primary.
Two pointers zoom around their middle by the change in their distance.
A drag or a pinch ends when its pointer is released, cancelled or loses its capture, when a move comes with no button down, and when the window loses the focus.
With the focus on the canvas itself, not on a control inside it, the arrow keys pan by 3rem, plus and minus zoom by 1.2 times around the middle, and 0 fits; with Ctrl, Alt or Cmd these keys are left to the page.
When the focus moves to an element on the plane outside the free area, the canvas pans just enough to show it there, ignoring less than half a pixel, or to its start when it is larger, from the view it is moving to rather than the one last drawn, and draws that pan at once, so the browser finds the element shown and scrolls nothing around it; the canvas itself never scrolls.
A press that focuses an element pans nothing, so the element stays under the pointer and the click activates it; only the keyboard or a program moving the focus pans.
A popover, tooltip, menu or other kit overlay anchored to an element on the plane follows it through every pan and zoom, the pan that shows a focused element included, and closes once its element has left the free area, as it closes when its element scrolls away; the canvas then takes the focus the overlay held, so the view stays where the pan left it.
The toolbar's zoom buttons zoom by 1.2 times around the middle, 100% returns to actual size around the middle, and Fit shows the whole content, centred across and, by `fitAlignment`, centred down or at the top of the free area, never above 100%; content too large even at 25% starts at the area's top-left.
The canvas fits its content once the content first has a size, and keeps its view through later resizes.
A press on the map outside its rectangle centres that spot, on the press rather than on a click, since a drag on the map starts with that same press; dragging on the map then moves the view with the pointer; the view's rectangle stops at the map's edge. Enter or Space on the map fits.
The map's toggle shows or hides the map, pressed while it shows.

The canvas is a focusable region named by its owner's label, described as a canvas, with its keys as its keyboard shortcuts and a focus ring inside its border.
The toolbar is a toolbar named Canvas view, with one Tab stop and arrow keys between its controls, and the zoom percentage a polite live region.
The map is a button named "Overview map: click a spot to move there", in the Tab order after the toolbar, its drawing hidden from assistive technology.
