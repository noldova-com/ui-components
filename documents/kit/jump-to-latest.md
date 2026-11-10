# Jump to latest

**Scope:** The kit's jump to latest: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

A circle the button's height across, 1.625rem, with the 1rem glyph centered in it, in a target at least the icon button's; 0.75rem above the list's bottom edge and centered along it; for a feed whose latest end is its start, 0.75rem below the list's top edge instead.

## Text role

Accessible name Jump to latest; a down-arrow glyph, or an up-arrow glyph for a feed whose latest end is its start.

## Surface and behavior

Raised fill and a 1px border in the border color on the circle, without a shadow, and the hover fill in its place under the pointer; shows while a feed that follows its latest end has stopped following, in the Tab order after the feed, and hides once it follows again; choosing it scrolls to that end and follows again; it fades in and out in 150ms, without the fade when reduced motion is preferred.
