# Menu bar

**Scope:** The kit's menu bar: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

A horizontal strip of menu-bar items; no surface of its own.

## Text role

Accessible name, which the owner gives.

## Surface and behavior

One tab stop, with the arrow keys moving between its items by the bar's own writing direction, so a `dir="rtl"` region inside a left-to-right page swaps Left and Right, in the bar and inside its open menus.
