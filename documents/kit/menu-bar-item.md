# Menu-bar item

**Scope:** The kit's menu-bar item: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

24px high hit target; the pill padding on each side; 1.375rem high pill with a small radius.
No margin of its own: its reset to none weighs nothing, so a rule that places it from outside holds whatever order the page loaded the stylesheets in.

## Text role

Panel.

## Surface and behavior

Toolbar hover while hovered or while its menu is open; keyboard focus outline; a disabled item stays focusable and dims its label but not its focus outline, and under forced colors draws its label in `GrayText`; opens its menu below it, aligned with its start; shows no chevron.
