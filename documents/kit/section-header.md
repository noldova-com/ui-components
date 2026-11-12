# Section header

**Scope:** The kit's section header: its default geometry, the text role it uses, its surface and behavior, its optional icon, and its collapsible form.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

1.75rem high for one line: the label's line with equal space above and below it, the same however many lines the label wraps to; text inset 0.5rem (the space-2 step), where a top-level row's icon starts in a tree without branches; 0.75rem (the space-3 step) above every header that is not the first element in its container.

## Text role

Label, at the emphasis weight, in `text-strong`.

## Uppercase

A header the owner marks uppercase reads as a group heading over rows whose own text is in the same case, such as an Explorer's Pinned, Projects and Chats.

- Its label is in capitals at `--nol-text-small`, 0.75rem and never under 12px, at the emphasis weight, in `text` rather than `text-strong`, with `--nol-letter-spacing-caps`, 0.05em, between its letters.
- Its icon keeps its glyph, size, color and place, and its caret its glyph, size and place in the label's `text` color, and its height and insets are a header's without it.
- The capitals are only its look: the label's text, and what a screen reader reads, are as the owner gives them.
- Under forced colors the label takes the system's text color, at the same size, case and spacing.
- Without it, the header is as above.

## Surface and behavior

No fill and no line.
Groups are separated by space, never by lines: the space above a header is more than twice the space below it, so the label belongs to its own rows.
A list keeps its headers and their rows as siblings in one container, and removes rather than hides an element before its first header.
A heading of level 3 unless the owner gives another; a long label wraps.

## Icon

An optional icon before the label, such as a chat icon above a list of chats.

- It is a Material Symbols glyph at the `icon` size in `icon-color`, starting 0.5rem from the header's edge, where a top-level row's icon starts in a tree without branches, and the label starts 0.5rem after it, where that row's label starts.
- It is centered on the label's first line, and a wrapped label's lines all start where the first one does; the header's height is what it is without an icon.
- In a right-to-left layout the icon starts 0.5rem from the header's right edge and the label follows it, mirrored as that tree row is.
- It is hidden from screen readers, so the label alone names the heading.
- Under forced colors the icon and the label take the system's text color, at the same size and place.
- Without an icon, the header is as above, with its label 0.5rem from its edge.

## Collapsible

A header the owner makes collapsible lets the person fold its group from the title, where a [group header](group-header.md) puts a twistie before the title and actions after it.

- The heading holds one button, the whole header, with the icon and the label where they are in a header that isn't collapsible, and the same height.
- A caret follows the label 0.25rem after it, a Material Symbols glyph at the `section-header-caret` size, 0.875rem, in the header's text color, centered on the label's first line and hidden from screen readers; it always shows.
- The caret points down while the group is open and turns a quarter to the end while it is closed: right, or left in a right-to-left layout.
- No fill and no line at rest; the tree row's hover fill on the whole header while the pointer is over it, with the small radius, and under forced colors the tree row's dashed Highlight outline inside its edge.
- The button exposes whether the group is open and, when the owner names it, the region it controls; a click, Enter or Space flips it.
- The owner holds the open state, keeps it if it should last, and shows or removes the rows.
