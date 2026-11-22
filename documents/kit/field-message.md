# Field message

**Scope:** The kit's field message: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

0.25rem above it; as wide as the field's container.

## Text role

Panel.

## Surface and behavior

Below the field it explains, which the owner names it in with `aria-describedby`; wraps anywhere rather than widen its container.
An error, the default, for a message that appears in answer to the person, such as after they leave or submit the field: error foreground, an alert announced when it appears, and the owner marks the field invalid while it shows.
A note, `FieldMessageKind.Note`, for a hint that stays on screen with its field: muted foreground, with no live role, so it is read with the field and never interrupts, however often it renders.
A warning, `FieldMessageKind.Warning`, for a state the person may want to check, such as a chosen color with low contrast: warning foreground, with text that names the state and no live role, so it is read with its field, and it never blocks the field or marks it invalid.
Its owner speaks it politely through the kit's `Announcer` when it appears or its text changes, since a live region added with its text in place is often not read.
