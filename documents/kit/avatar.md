# Avatar

**Scope:** The kit's avatar: its default geometry, the text role it uses, its surface and behavior, and its colors.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

A rounded square with the large radius, `radius-large`, 0.5rem; 1.75rem, the `avatar` token, or 1.5rem small, the `avatar-small` token, 24px at the default text size, for rows and lists; no border.
At the icon button size, `AvatarSize.IconButton`, it is the `icon-button` token, 1.375rem, as large as an icon button's hover square, for a header that sets it level with icon buttons, such as a card's header beside its Copy button.
At the icon size, `AvatarSize.Icon`, it is the `icon` token, 1rem, for a header or a row that sets it beside icons, such as a card's header, with the small radius, `radius-small`, 0.25rem.
At the byline size, `AvatarSize.Byline`, it is the `avatar-byline` token, 1.25rem, and round, for a face beside a name in a line of text, such as the author on a [link reference](link-reference.md) card.

## Text role

Panel, 0.8125rem, 400; at the icon size, small, `text-small`, 0.75rem and never under 12px, 400; at the icon button size under forced colors also small; at the byline size, `--nol-text-avatar-byline`, 0.625rem, `--nol-weight-strong`, 600.

## Surface and behavior

The kit's `nol-avatar`, for a person or an agent: its image, cropped to cover the square and clipped to its corners, or else, with no image or one that fails to load or decode until it is given another address, its initials, or the first character of its name in upper case in the app's locale; at the icon size, only the first character of either. Initials wider than the room inside its edge, less 1px on each side, such as "MW", are scaled down to that room, at every size and in forced colors; initials that fit keep their size.
It is filled with its hue's fill, its initials in that hue's letter color.
Shown alone, it is an image named by its name, or by the label the owner gives; beside the name it stands for, the owner makes it decorative, hidden from assistive technology; with a blank name and no label it is hidden too.
An unavailable avatar is dimmed to half its opacity, and its name ends in "unavailable".
Under forced colors it keeps a 1px `CanvasText` edge, at the same size.
It has no hover or focus of its own; the control around it, such as a row, gives those.

## Colors

- Its hue is one of twelve, `AvatarColor`, each a fill and a letter color of its own in light and dark, `avatar-<color>` and `avatar-<color>-text`: Teal, Green, Lime, Amber, Orange, Red, Rose, Pink, Purple, Violet, Indigo and Cyan; or the default pair, `avatar-default`.
- Each letter color keeps 4.5:1 on its fill, in light and dark.
- Its hue is the one bound, `filledColor`.
- Or else the hue of its author color, by number, so an author's name and avatar stay one family: 1 the default pair, 2 Teal, 3 Green, 4 Amber, 5 Orange, 6 Red, 7 Pink and 8 Purple.
- Or else the hue of the author color its color key chooses, the key's 32-bit FNV-1a hash modulo eight, plus one, the same for the same key every time, so a person keyed by an id matches its messages, whose author color is chosen the same way.
- `AvatarColors.fromKey` chooses one of all twelve hues from a key, the same hash modulo twelve, for an owner that binds its result as `filledColor`.
- Or else the default pair.
- `filled` changes nothing, as every avatar is filled, so an owner may bind it or leave it out.
