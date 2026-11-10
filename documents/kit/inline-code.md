# Inline code

**Scope:** The kit's inline code: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

The line box of the text around it, which it never makes taller; 0.25rem side padding; small radius.

## Text role

Code font at the code size, `--nol-text-code`, which follows the Code size setting, as code blocks are, whatever the size of the text around it.

## Surface and behavior

The kit's inline code: a background of the derived `--nol-inline-code`, the text color at 12% over the surface below, rather than a theme key; text fully opaque; a long name wraps anywhere, its side padding and rounded corners only at its start and end, so each wrapped piece stays inside the text around it.
