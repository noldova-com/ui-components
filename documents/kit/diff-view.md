# Diff view

**Scope:** The kit's diff view: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

Fills its container's width; automatic height, 0.5rem between its toolbar and its files; each file a card with a medium radius and a 1px border; file and hunk headers at least 1.625rem high, with 0.5rem side padding and 0.5rem gaps; lines in a grid of a comment gutter 1.5rem and at least 24px wide, old number, new number, sign and text, or a gutter, number, sign and text for each side side by side, numbers end-aligned with 0.5rem before and 0.25rem after, the text with 0.75rem after it.

## Text role

Label in the headers, the hunk range in the code font, cut with an ellipsis; code for the lines; numbers muted.

## Surface and behavior

The kit's diff view: a named region with a toolbar named Diff view actions holding the Side by side and Word wrap toggles, then each file as a section named by its header's button, which collapses and expands it and holds a twistie, the path, or the old and new paths of a renamed file, the status and the added and removed count chips; then the file's review state, Open file, and Accept and Reject.
An owner that doesn't open files turns that off: Open file is gone, the line numbers are plain text, and Enter in a hunk's lines does nothing.
Each hunk is a group named "Change 2 of 5" on the code-header surface, with Show lines above, its range and section, its review state, and Accept and Reject, and the last hunk ends with Show lines below.
Lines sit on the code surface; added and removed lines take the added and removed backgrounds and a + or - sign in the added or removed color, and each line is named for screen readers, such as "Added line 12", so color is never the only cue.
In each removed and added line paired in place of each other, the words the two don't share take the stronger change tints, unless the pair is mostly different or a line is longer than 500 characters.
When the app provides code highlighting, code in a language the code block knows, by the file's language, is colored by the kind of each token with the code token colors, each side of a hunk read on its own, and nothing loads for any other language; without it, code is plain. As in the code block, a side longer than 1,000 characters is colored a task later, and a side shown again is colored at once from the tokens kept for it.
In forced colors the backgrounds give way to the signs, code takes the system's text color, and changed characters a solid 2px underline in the system's highlight color.
With wrap off, long lines scroll sideways inside their hunk; with wrap on, they wrap anywhere.
Side by side pairs each removed line with the line added in its place, the old line read before the new.
Each hunk's lines are one Tab stop that stays on the line last focused; Up, Down, Home and End move among them, Enter asks to open the file at the line and Shift+Enter asks to comment on it, and a comment button, a target at least 24px square centered on its line in the gutter, shows on the line under the pointer or focused.
Alt with Down or Up moves to the next or previous change and Alt+Shift with Down or Up to the next or previous file, unless the owner turns these keys off.
A file over the collapse limit, 2,000 changed lines or 1,000,000 characters of its lines' text, context lines' included, unless the owner sets another, shows a muted line and a secondary Load diff button in place of its hunks; a loading, binary or unreadable file shows a muted line in their place, and a view with no files a muted "No changes".
Review states show as muted text, a file's derived from its hunks, "Partly reviewed" when they differ; a state that changes after the person acts on the file in the view is announced politely, and other changes, such as an agent's edit, are not.
Accept and Reject only ask the owner, who sets the review states.
