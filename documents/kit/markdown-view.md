# Markdown view

**Scope:** The kit's Markdown view: its default geometry, the text role it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

Fills its container's width and never widens it; automatic height; no padding, border or radius of its own; 0.5rem between its blocks, and between the blocks of a quote; a heading among the view's own blocks, unless it is the first, sits 0.75rem further from the block before it, and one in a quote or a list item keeps the usual gap.
A list is indented 1.5rem, with 0.25rem between its items and 0.5rem above each block after an item's first; a task item's mark, 1rem, sits in the marker space 0.25rem before the text and centred on its first line.
A quote has a 3px start border and 0.75rem between it and the text; a rule is a 1px line across the view.
A table is as wide as its columns, never wider than the view, scrolling sideways inside itself past it; its cells have 0.25rem by 0.5rem padding and a 1px border, collapsed between them.
A file link's badge, 1rem, sits 0.25rem before the link's text and centred on its first line.
An image the app draws sits in an inline block no wider than the block it sits in, whose children are no wider than the inline block.
Display math takes a line of its own, scrolling sideways when wider than the view, with 0.5rem above and below it inside a paragraph.
A code block is the kit's [code block](code-block.md) at its own geometry, with no maximum height of the view's own, so it grows with its code; in a [message](message.md) it takes the message's 32rem.

## Text role

Message, at the message line height, 1.6, in the text color; long words break anywhere rather than widen the view, except in a table's cells.
Headings at the text's size with a 1.25 line height, and headings, bold text and table headers at the emphasis weight in `text-strong`, which in a quote or a link keep the quote's or the link's color; quotes muted; code blocks in the code block's role, and inline code in the [inline code](inline-code.md)'s.

## Surface and behavior

The kit's `nol-markdown-view`, from `@noldova/ui.components.angular/markdown`, which draws the Markdown of its `text` as the [message](message.md) draws its text blocks, with no surface of its own.
It draws Markdown once the app adds `provideMarkdown()` from the same entry point, which loads `markdown-it` on first use; without it, and until the parser has loaded, the text shows as written, plain, keeping its line breaks and its Markdown marks, and a parser that fails to load is reported to the app's error handler and tried again when the text changes, with no new try for 10 seconds.
The text is parsed as CommonMark with tables, strikethrough, autolinks, task lists and math, and drawn from its tokens as elements, never as HTML: raw HTML stays text, and a single line break starts a new line as a hard break does.
Headings, paragraphs, quotes, bulleted and numbered lists, a numbered list keeping its start, horizontal rules, emphasis, bold, strikethrough and inline code are drawn as their elements; a table's header and body cells keep the alignment its delimiter row gives, and start-aligned otherwise, at the top of their row.
A list item that starts with `[ ]` or `[x]` is a task item, read-only, with the [plan](plan.md)'s marks in the muted text color (`CanvasText` under forced colors): a filled check circle when done and a dashed circle when not, named Done or Not done.
Code, indented or fenced, is a [code block](code-block.md) with the fence's first word as its language, colored as the code block colors it; with `shellRuns` on, a block tagged as a shell offers [Run](code-block.md#surface-and-behavior), which goes to `shellRun` with the block's index among the view's code blocks, from 0 in reading order, and the view takes each block's state from `shellRunStates` and draws the app's `ng-template nolShellRunOutput` under each block whose index `shellRunOutputs` holds, as a message does; Run stays hidden while the view streams, and never shows on a block whose fence never closed. A view inside a message counts, and takes its states and outputs from, the message's blocks.
Only http, https and mailto addresses, and those with a scheme the app names in `linkSchemes`, a `MarkdownLinkSchemes`, become links, in the link color (`LinkText` under forced colors), underlined 0.15em below the text; with `fileLinks` on, a link to a file's path, or to a `file:` URL with no host or `localhost`, is a file link that starts with the [file badge](file-badge.md), or the folder mark when `folderLinks` holds its path, and never wraps away from its text. Any other link shows its text plain.
The view never follows a link: a click, a middle click or Enter, with Ctrl or Cmd too, cancels the browser's default and goes to `linkActivate` with the address and to `linkOpen` with how it was opened, and a file link goes to `fileActivate` with its path instead; a right-click, or the menu key, on a link goes to `linkMenu`, whose default the app cancels when it shows its own menu, and a file link asks for none.
`filePathsChange` gives the paths of the file links it shows, each once and in reading order, whenever that list changes.
With a `references` reader, a link the reader knows shows as the [link reference chip](link-reference.md), and a link it turns out not to know is a plain link again.
Each `@name` of its `mentions`, outside code, is marked in the `mention` color at the emphasis weight, at half opacity when the candidate is unavailable, and a link to `mention:<id>` shows its text in that look when a candidate has the id, and plain otherwise; with `mentionNames` off, only those links are marked.
An image shows its alt text, or the content of the app's `ng-template nolMessageImage`, given `{ src, alt, title }`, in its place; a view with no template of its own uses the template of the message or view it sits in, and the kit never fetches an image's address.
Unless `math` is off, math between `\(` and `\)` or `$` and `$` is drawn in its line, and between `\[` and `\]` or `$$` and `$$` on a line of its own, by KaTeX in the text color, loaded on the first formula, or as soon as a formula opens while the text streams; a formula KaTeX can't read, and any formula before KaTeX has loaded, shows its source as written.
While `streaming` is on, the text reveals a little at a time, in bursts about 50 milliseconds apart, and every frame once it ends, holding back an unfinished end of up to 300 characters, such as an emphasis, code or link not yet closed, a line that is only a block's marker, a table's header until its delimiter row and a code fence's opening line; under reduced motion it shows as it arrives.
A view drawn while it streams shows the text it already has at once, unless `entering` is on, when it reveals that text from nothing; a view that has already drawn text never reveals from nothing, and text replaced rather than grown shows whole; with `paced` on, text still revealing when the stream ends goes on at the streaming pace.
While a selection reaches into a view that is revealing, it shows all that has arrived at once, so the selection draws and copies only text the reader sees.
Nesting deeper than 24 elements, 8 lists or 8 quotes is drawn at the deepest level, and text past 200,000 characters, from the line break before it, shows plain.
A heading is a paragraph with the heading role and its level, from 1 to 6; a task item's mark is an image named Done or Not done; every other element keeps its own role, and the view itself adds none and takes no focus, while its links and its code blocks' actions do.
