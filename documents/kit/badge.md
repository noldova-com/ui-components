# Badge (counts, +1 −0), key and status chips

**Scope:** The kit's badge (counts, +1 −0), key and status chips: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

1.25rem visual height and at least as wide; 0.375rem side padding, 0.5rem on a status chip; small radius; 1px border.

## Text role

Panel, the emphasis weight; a key and a status normal.

## Surface and behavior

Count badges unfilled, a count up to 99, then 99+; diff counts unfilled in the added and removed text colors with + and − signs; a key chip has the same geometry on the raised surface; a status chip, `ChipKind.Status`, holds the app's short state, such as Reviewing, or a tag after a menu row's label or a select option's title, such as Recommended, unfilled and muted with its border in the border color, `ChipKind.Failed` the same in the error color, and `ChipKind.Warning` the same in the warning color, for a note to check, such as Same account as Agent 1, all keeping 4.5:1 on the window; `ChipKind.On` says what a setting is on for, such as a provider a server is on for, with the status chip's geometry, unfilled, its text in the text color and its border in `--nol-status-ok`, after a round `chip-dot` dot, 0.375rem, in the same color, centred on the text with `chip-dot` after it, which forced colors keep with the border.
A chip never grows wider than its container: a key too long for it starts after the start padding and ends with an ellipsis, keeping its full text as its name and in a tooltip shown only while it is cut, on hover and while the control holding it has keyboard focus.
