# Copy

**Scope:** The kit's copy: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

Icon-button geometry; 1rem copy glyph.

## Text role

Accessible name Copy.

## Surface and behavior

Copies the exact text through the clipboard writer the app provides.
The clipboard writer also takes an image file's bytes, `writeImageAsync`, for an app's own Copy Image: true means copied, and false means refused or not supported, which a writer that can't copy images answers by default without touching the clipboard.
For 1.5 seconds after, the check glyph in the added color, popping in over 200ms from 60% of its size and 40% opacity, at once when reduced motion is preferred, and the name Copied, or, when the clipboard refuses the text, the copy glyph and the name Couldn't copy; either is announced politely, and copying again within the 1.5 seconds starts them again.
