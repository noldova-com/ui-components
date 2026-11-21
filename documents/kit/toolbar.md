# Toolbar

**Scope:** The kit's toolbar: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

A horizontal or vertical strip; its items keep their own geometry.

## Text role

Accessible name, which the owner gives.

## Surface and behavior

No surface of its own; one tab stop, at the item the owner names or else the first until focus moves, with the arrow keys moving between its items, Left and Right following the toolbar's text direction as it is when the key is pressed, so in right-to-left text Left moves on to the next item; items added or removed while it shows join or leave it, and when the focused item goes, the new tab stop takes the focus, unless another element took it first, and with no item left the toolbar lets the focus go, so items added later don't take it; dragging belongs to the strip's owner.
