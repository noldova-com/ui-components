# Menu

**Scope:** The kit's menu: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

As wide as its widest row: every row shares one lead column, for icons and avatars, so every label starts at one edge, and then has its own label and trailing part, so a long label in one row and a long value in another never add up; or at least the minimum width its owner gives it in rem (`minWidth`, such as 18 for a settings menu), up to the overlay bounds' width less 1rem; large radius; 1px border; 0.25rem vertical padding; section-label padding 0.5rem 0.75rem 0.25rem.

## Text role

Panel; section labels muted.

## Surface and behavior

Menu surface and large shadow; opens below its trigger, aligned with its start or end, or at the pointer as a context menu, also from the menu key or Shift+F10; kept within the overlay bounds and scrolling under the thin scrollbar when bounded, never sideways.
A menu that opens under a resting pointer ignores it until the pointer moves, so it neither highlights a row nor opens a submenu by itself.
A submenu opens on hover or Right flush against its menu's end side, its first row level with its trigger row, and flips to the other side at the overlay bounds' edge.
A labeled group, `nol-menu-group`, shows its label above its rows in the section-label style and names the group for screen readers; the label takes no focus, and the arrow keys move across the groups' rows as across any rows.
A group's action, `button[nol-icon-button][nolMenuGroupAction]` such as Refresh models, sits at the end of its label, on the label's line, its pad's end on the rows' trailing edge, without making the label taller; it is one of the menu's items, which the arrow keys reach before the group's rows and type-ahead finds by its label, and a click, Enter or Space runs it and leaves the menu open.
A disabled group action is aria-disabled: it looks disabled and doesn't run, but keeps focus, and the arrow keys still reach it, as a disabled row; so a menu whose action disables itself while it works, such as a refresh, stays open.
A group with `maxRows` that has more rows shows only its first `maxRows` rows' height and scrolls the rest under its label, with its own scrollbar, while the menu's rows after it stay in view and keep the menu's lead column; a row the arrow keys, Home or End move to scrolls just into view, and a row outside the group leaves its scroll alone.
A group with `maxRows` opens scrolled so its focused row, or else its checked row, is in view, and fits its rows' height in the frame after they resize, never inside the resize callback.
Without `maxRows`, or with no more rows than it, the group shows every row.
A long menu scrolls by putting its rows in a group with `maxRows`.
A menu opened from its trigger takes the focus on its first checked row of its own, not of a submenu, even a disabled one, by any key or the pointer, as a select opens on its selected option; with no row checked, it takes it on its first row, or on its last row, never a group action, when Up opened it.
Its owner can name the item it opens on instead, with `[nolMenuOpensOn]` bound true on a row or a group action of its own, such as a model menu that opens on Refresh models when the chosen model is gone: the menu opens there by any key, the pointer or the trigger's `openFocusing`, scrolled into view in a group that scrolls, and the arrow keys, Home, End and type-ahead go on from it. A named item wins over the checked row and, when Up opened the menu, over the last row. With several named, the first enabled one in the order the template writes them wins. A mark on an element that isn't a row or a group action, such as a span inside a row, names nothing. The named item takes the focus at once, with no other row taking it first. While the named item is disabled or gone, or none is named, the menu opens as above; the gallery's "Trigger that opens on a row past the first group" opens on Large model under a checked Sort by row.
Arrow keys, Home, End and type-ahead move between rows and Enter runs one; Left or Escape closes a submenu back to its row (Right and Left swap by the writing direction of the element the menu opens from, so a `dir="rtl"` region inside a left-to-right page swaps them too), and Escape, Tab or a click outside closes the menu, returning focus to its trigger. An Escape already marked handled, as a tooltip marks the one that hides it, closes nothing, so the first Escape hides a row's tooltip and the next closes the menu.
A menu trigger inside a context menu's host, such as a row's More button beside the row's own context menu, keeps its own menu stack: closing either menu returns focus to its own trigger, the row or the button.
