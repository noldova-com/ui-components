# Sash

**Scope:** The kit's sash: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

0.25rem visual gap; three 0.125rem grip dots spaced 0.3125rem; an in-use bar as wide as the gap, centered and as long as the sash.

## Text role

Accessible resize label, which names the affected pane.

## Surface and behavior

Grip at 30% normal foreground.
In use, a bar in the sash-active color replaces the grip: after 300ms hover, at once while dragging and on keyboard focus.
It hides when the pointer leaves unless the sash is dragged, and when focus leaves; it fades in 150ms, without the fade when reduced motion is preferred.
Keyboard resize exposes the size the owner binds.
