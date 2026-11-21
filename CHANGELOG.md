# Changelog

**Scope:** What each published version of this repository's packages holds, newest first.

Each version's section is written by the pull request that changes the version, from the pull requests merged since the previous version, as the [README](README.md#releases) says; other pull requests don't edit this file.

## 0.0.23

- `@noldova/ui.components.angular`: a new color, `card`, with `--nol-card`, for a card raised on the window's color: white, `#FFFFFF`, in the default theme's light mode and `#2B2B2B` in dark; a theme without it falls back to `raised`. `--nol-raised` and every component keep their colors.

## 0.0.22

- `@noldova/ui.components.angular`: a popover trigger can open its popover on hover and keyboard focus instead of a click, with `nolPopoverOpenOn` set to `PopoverOpening.Hover`, for details shown as an item is pointed at or reached by the keyboard. It opens once the pointer has rested on the control for the tooltip's delay, or at once when the keyboard moves the focus to the control, leaving the focus there; Enter or Space then moves the focus into it, and on a link only Space does, so Enter still follows the link. The pointer can cross between the control and the popover without closing it, which closes after the tooltip's hide delay once the pointer, or the focus that opened it, has left both. Touch opens and closes it with a tap.
- `@noldova/ui.components.angular`: a canvas finds its items, the elements marked `nolCanvasItem`, inside the components its content renders too, at any depth, and each one added, removed, resized or moved later, while it renders inside the canvas; an item declared inside a canvas within it belongs to that inner canvas's map. The canvas measures its items at most once a frame and at the zoom it draws, so streaming content neither slows it nor leaves its map's boxes off after a zoom. `CanvasBox.equals` compares two boxes.
- `@noldova/ui.components.angular`: its peers `@noldova/context.core` and `@noldova/context.exceptions` need 0.0.10 or later, below 0.1.0, instead of 0.0.9 or later.
- `@noldova/ui.components.angular`: the default theme's bottom dock opens 12.5rem high instead of 16.25rem, with `--nol-dock-bottom-height`.

## 0.0.21

- `@noldova/ui.components.angular`: a pan-and-zoom canvas, `nol-canvas` (`CanvasComponent`), for content larger than its area, such as a chart. It moves and scales one plane of the owner's content between 25% and 200%. The wheel and a trackpad pan; Ctrl or Cmd with the wheel, a trackpad's pinch and two pointers zoom; a drag on the background pans; and the arrow keys, plus, minus and 0 pan, zoom and fit while the canvas has the focus. Its toolbar holds the zoom buttons, the zoom as a percentage, Fit, 100% and the map's toggle. `fitAlignment` (`CanvasFitAlignment`) puts the fitted content in the middle or at the top of the free area, and `view` and `centreOn` let the owner read and move the view. An element marked `nolCanvasItem` (`CanvasItemDirective`) shows as a box on the overview map, `nol-canvas-map` (`CanvasMapComponent`), where a press centres that spot and a drag moves the view. A focused element outside the free area is panned into view. `CanvasView`, `CanvasBox` and `CanvasPoint` hold the view's arithmetic for an owner that draws its own canvas.

## 0.0.20

- `@noldova/ui.components.angular`: a tab's rename field no longer reports its text when the focus moves into a kit menu opened on it, such as its context menu: the field has the focus back when that menu closes and the rename goes on, and the text is reported once the focus goes from the menu anywhere else.
- `@noldova/ui.components.angular`: disabling a select closes its open list, returning the focus to the button when the list held it, so nothing can be chosen from it, also when the select is disabled through `setInput` before the next change detection. A disabled select's button is marked `aria-disabled` rather than `disabled`, as a disabled checkbox or choice row is, so it stays focusable and a select that turns disabled while it holds the focus keeps it; a click, Enter or Space on it opens nothing.
- `@noldova/ui.components.angular`: Retry chosen from the keyboard in a virtual list's failed read moves the focus into the list, to its tab stop row when that is in view, else to the first row in view without scrolling, or, in a feed, to the feed, so the focus no longer falls to the page; when the read fails again the focus goes back to Retry, never from a control outside the list that took it. A clicked Retry leaves the focus where the click put it.
- `@noldova/ui.components.angular`: when a toolbar's focused item leaves with no item left, the toolbar lets the focus go, so items added later no longer take the focus from the page.
- `@noldova/ui.components.angular`: its peers `@noldova/context.core` and `@noldova/context.exceptions` need 0.0.9 or later, below 0.1.0, instead of 0.0.8 or later.

## 0.0.19

- `@noldova/ui.components.angular`: a context-menu trigger leaves a right click, the ContextMenu key and Shift+F10 on an editable field under its host, a textarea, an `input` that takes text or editable content, to the field: it opens no menu and neither prevents nor stops the event, so the field keeps its own edit menu, such as a tab's rename field.
- `@noldova/ui.components.angular`: a quick input takes a new optional input, `itemsQuery`, the query its items answer. An owner that finds results asynchronously, such as a search over files, gives it, exactly as typed and for a failed or empty search too, and Enter then waits for the typed query's results before it chooses, until typing or Escape drops the wait. Without it Enter chooses after the next render, as before.
- `@noldova/ui.components.angular`: while a person composes text with an input method, such as Japanese, the quick input leaves Enter, the arrows and Escape to the field, and the quick input, the mention field and a tab's label field also leave to it the Enter that commits a conversion, which Safari sends just after the composition ends.
- `@noldova/ui.components.angular`: `MessageText` takes an optional `key`, a third constructor argument. A message keeps a keyed text in its element when blocks before it go, so an app that folds a reply's earlier paragraphs away keeps the reader's paragraph in place; texts with no key are drawn by their place, as before.
- `@noldova/ui.components.angular`: a menu reaches its items with the arrows, Home, End and type-ahead in the order they show, so a group action comes before its group's rows wherever the template writes it, and a menu with no row checked opens on its first row, never a group action.
- `@noldova/ui.components.angular`: four controls pass the focus on when the focused element goes, instead of leaving it to the page: the feed's viewport takes it when Jump to latest hides or the owner replaces the feed under a focused article, a toolbar's new tab stop when its focused item is removed, and a diff file's first line once the lines its focused Load diff button loads have rendered.
- `@noldova/ui.components.angular`: when the focused row leaves a tree that has the focus, the next row takes the focus, or the row before it when the row was the last, so the arrow keys go on from there; before, the focus fell to the page. It never takes the focus from another element that took it first.
- `@noldova/ui.components.angular`: Escape without a modifier asks the owner of a dialog opened through `DialogService` to dismiss it also when the dialog's container has the focus, as after a click on its text; before, Escape there did nothing.
- `@noldova/ui.components.angular`: an unavailable toolbar button ignores clicks, middle clicks, Enter, Space and, when it opens a menu, the up and down arrows, so neither its owner's handler nor its menu hears them; it stays focusable.
- `@noldova/ui.components.angular`: a tree in a right-to-left container on a left-to-right page swaps Left and Right, as it does on a right-to-left page.
- `@noldova/ui.components.angular`: in a browser without the CSS Highlight API, a code block's finished lines show their token colors; 0.0.18's rules dropped them there, so its finished lines showed plain.
- `@noldova/ui.components.angular/testing`: `KitStylesheetFixture`'s report of a font face that failed to load names the server's `Content-Length` and, after each source's answer, what the page's own load of it got: its status, its body's size and its time, or that it left no timing entry, so a short body tells a failed request from a font the browser couldn't decode.

## 0.0.18

- `@noldova/ui.components.angular`: a code block and a diff view no longer throw in a browser without the CSS Highlight API, such as Safari before 17.2 or Firefox before 140, where their code didn't show. There a code block's growing line shows plain until it ends and turns into spans of its colors, and a diff view's code is plain and its changed characters take no color or forced-colors underline of their own, while its lines keep their added and removed backgrounds and signs. A browser with the API draws both as before.
- `@noldova/ui.components.angular`: a dialog whose opener has left the page by the time it closes, such as a menu's row, a button in a popover that closed, or a control in a dialog that closed first, returns the focus to a fallback instead of the page: the menu's or popover's trigger, the dialog underneath, or a target its owner passes to `DialogService.open` as a new optional third argument, `returnFocus`. It skips a fallback that has left the page, is inert or can't take the focus, such as a disabled one, and leaves the focus where it is when none takes it.
- `@noldova/ui.components.angular`: the terminal output and the mention field follow every theme change: a switch through `data-nol-theme-mode` or the system's light or dark setting, and a subtree painted by `ThemePainter.paint(element)`. Before, the terminal's runs kept the old theme's colors after a mode switch or the system's switch, and the mention field's typed text kept the old color after the system's switch or a painted subtree.
- `@noldova/ui.components.angular/testing`: `AppearanceFixture.parkPointerAsync` moves the pointer off the page, just outside the window's top left corner, so nothing in the page is hovered, and still shows its small element in that corner for a later move away; it fails when something in the page is still hovered after the move.

## 0.0.17

- `@noldova/ui.components.angular`: a new look token, `--nol-section-header-space-above`, sets the space above every section header but the first in its container. It is `var(--nol-space-3)`, 0.75rem, by default, so every header looks as before; a view whose rows sit closer, such as a chat list at 0.25rem, sets it on its own element for the headers inside it, and a theme can set it like its other look keys.

## 0.0.16

- `@noldova/ui.components.angular`: Angular's build tools, `@angular/build` and `@angular/cli`, move from 22.2.8 to 22.3.0, their newest, at the kit's Angular version; an app that installs them at the kit's pin, as the kit's README says, moves them to 22.3.0 with it.
- `@noldova/ui.components.angular`: three new entry points, so the kit's parts that only a lazy page uses stay out of an app's start: `@noldova/ui.components.angular/button`, with `ButtonComponent`, `ButtonSize` and `ButtonVariant`, and `@noldova/ui.components.angular/typography`, with `Typography`, `TypographyPainter`, `TypographySizing` and `ThemeMode`, for the start, and `@noldova/ui.components.angular/code-block`, with `CodeBlockComponent`, `ShellRunOutputDirective`, `ShellRun`, `ShellRunState` and `IShellRunOutputContext`, for a lazy page. An app whose start imports anything from the main entry gets in its start every part of the kit any of its pages uses, so its start imports these instead, as the README's Lazy pages says. The main entry still exports the same classes, so nothing an app imports today moves.

## 0.0.15

0.0.14 was tagged but never published: its release stopped before the publish, since Angular 22.3.0 came out with no release of its build tools at that version, which the release's build asked for. This version holds what 0.0.14 would have, and the release's build now adds the build tools at the kit's own pin of them.

- `@noldova/ui.components.angular`: its Angular peers, `@angular/common`, `@angular/core`, `@angular/forms` and `@angular/platform-browser`, move from 22.2.6 to 22.3.0, Angular's newest. Since the kit names them exactly, an app moves its own Angular packages to 22.3.0 with it. Angular's build tools, `@angular/build` and `@angular/cli`, move from 22.2.7 to 22.2.8, their newest, which takes Angular 22.3.0, and the kit's `@angular/cdk` stays at 22.3.0.

## 0.0.13

- `@noldova/ui.components.angular`: its `@angular/cdk` dependency moves from 22.2.7 to 22.3.0, the CDK's newest, which it published apart from Angular's; its peers are unchanged, so the kit's Angular stays at 22.2.6. An app that installs `@angular/cdk` itself moves it to 22.3.0 with the kit.

## 0.0.12

- `@noldova/ui.components.angular`: twelve new size tokens, each the value a module window writes today as a literal, so nothing such a window draws moves when it takes them. Ten are look tokens, in `theme.css`, `DefaultTheme` and `Resources.lookTokens`: `--nol-space-half` (0.125rem), between a row's two lines of text; `--nol-count-gap` (0.25em), between an inline count's numbers; `--nol-view-padding-inline` (0.625rem), a card's, row's or panel's inline padding, the twin of `--nol-view-padding-block`; `--nol-view-gap` (0.625rem), between a panel's blocks; `--nol-nested-row-indent` (2.25rem), a nested list row's start; `--nol-empty-icon` (1.25rem), an empty state's icon; `--nol-text-area-min-height`, three lines of a text field with its padding and border, `calc(3 * var(--nol-line-panel) + 2 * var(--nol-field-padding) + 2 * var(--nol-border-width))`, 4.25rem at the default panel size; `--nol-list-max-height` (18rem), a menu-like list's scroll height; and `--nol-diff-view-max-height` (24rem) and `--nol-diff-view-padding-block` (0.375rem), an inline diff's scroll height and inset. Two are in `base.css`, beside the other text sizes: `--nol-text-display` (1.75rem) and `--nol-letter-spacing-display` (0.12em). A custom theme can set the look tokens as it sets the others.
- `@noldova/ui.components.angular`: a click on a resizing control in a feed, one marked `data-nol-resizes-row`, holds its row with no timer; before, the hold ended after a second of wall time, so a row whose growth came later than that, such as after a long task on the page, moved. The hold still ends when a measure changes that row or the reader moves the view; otherwise it ends once a frame is laid out after the one that drew the click's change, two frames after the click. A control whose row changes only once the app answers, such as a tool call's Retry or a diff's hunk expanders, is marked `data-nol-resizes-row="later"`, and its hold lasts until the row changes or the reader moves the view; an app marks its own such controls the same way.
- `@noldova/ui.components.angular`: the code highlighters on a page share one cache of a grammar's compiled patterns, so a later highlighter of a grammar the page already highlighted takes about 2 ms to warm instead of about 40. The page keeps every compiled pattern for its life. The first highlight is unchanged.
- `@noldova/ui.components.angular/testing`: `PointerFixture.hoverAsync` takes an optional `IPointerHoverOptions`, a new interface, whose `isForced`, false by default, moves the pointer at once without waiting for the target to be visible, still and enabled, for a target the test knows is laid out and still.
- `@noldova/ui.components.angular/testing`: `AppearanceFixture.expectThumbRevealsOnHoverAsync` no longer polls the thumb: before reading each state, once, it waits until the area shows no scroll's reveal and runs no transition, and it rejects, naming what still ran, when a wait runs past 15 seconds.
- `@noldova/ui.components.angular`: its peers `@noldova/context.core` and `@noldova/context.exceptions` need 0.0.8 or later, below 0.1.0, instead of 0.0.7 or later.

## 0.0.11

- `@noldova/ui.components.angular`: every `nol-avatar` is a circle, at the normal, small, icon button, icon and byline sizes; before, all but the byline size were rounded squares. Sizes and colors are unchanged. The image is clipped to the circle, the unavailable avatar's dimming covers it and the forced-colors edge runs round it, and initials are scaled so their letters fit inside the circle.
- `@noldova/ui.components.angular`: `nol-configuration-table` takes an opt-in `density` input, `ConfigurationTableDensity.Normal` by default or `ConfigurationTableDensity.Compact`, a new enum. Compact puts the heading's row, the explanation and the table `space-1` (0.25rem) apart, draws the explanation in `text-muted`, gives the cells 0.375rem padding (the header's cells `space-1` above and below), keeping no padding on each row's outer sides, and sets every cell at the top of its row. Without the input, or with `Normal`, the table draws as before.
- `@noldova/ui.components.angular`: `UiComponentsException`, new in the main entry, extends context's `Exception`, and the kit's seven exceptions (`CodeHighlightingException`, `DiffException`, `LinkReferenceException`, `MarkdownException`, `ThemeException`, `TreeMoveException`, `VirtualListException`) now extend it. Each is still an `Exception` with the same name, constructor and messages, so code that catches `Exception` or a specific exception behaves as before.
- `@noldova/ui.components.angular`: decoding a `MarkdownLink` or a `MentionValue` handles only a broken encoding, `URIError`, and math rendering only a formula KaTeX can't read, its `ParseError`; any other error is now rethrown instead of being taken as one of those. In the testing entry, `KitStylesheetFixture` likewise handles only the page's `SecurityError` when it reads a stylesheet's rules, and only a network `TypeError` or its own deadline's `AbortError` when it asks a source's server.
- `@noldova/ui.components.angular`: its peers `@noldova/context.core` and `@noldova/context.exceptions` need 0.0.7 or later, below 0.1.0, instead of 0.0.2 or later.
- `@noldova/ui.components.angular`: the package has a description, which npm shows.

## 0.0.10

- `@noldova/ui.components.angular`: `ng-template nolMessageSlot` takes `nolMessageSlotAttached`, false by default. An attached slot is drawn `space-1` (0.25rem) after the part before it instead of the `space-2` (0.5rem) gap between a message's parts, and the part after it stays `space-2` after it. A slot that is the message's first part, or that has only empty slots before it, is drawn as an unattached one. A slot's own roots keep `space-2` between them, and switching the input keeps the slot's view and the focus inside it. Each part of the message's content now has its own wrapper, spaced by a margin instead of the content's gap, and a slot that draws nothing, or has no template, still adds no gap.
- `@noldova/ui.components.angular`: `nol-toolbar-button`'s `isPressedWhileOpen` no longer needs `hasMenu`. An icon-only button that opens a menu, such as a toolbar's More, draws its pressed look while its menu is open with no chevron, keeping its square. Its menu trigger still marks `aria-haspopup` and `aria-expanded`.

## 0.0.9

- `@noldova/ui.components.angular`: a menu trigger no longer keeps `aria-controls` naming its menu once that menu has closed, as it did after a submenu's row closed the menus with no change detection while they were open, such as in a spec that clicks the trigger, the submenu's row and its row in turn. The trigger now forgets its menu whenever the menu's overlay closes.
- `@noldova/ui.components.angular`: `nol-completion-list`, `CompletionListComponent` with `CompletionChoice(label, note)`: a listbox of completion choices for a field that keeps the focus, such as commands after a slash or names in code. The host is the listbox with the owner's id and name, each option is `<listId>-option-<index>` (`CompletionListComponent.optionId`) named by its label and note, and the active one is marked selected and kept in view; a click emits the choice the owner gave, and a press never takes the focus from the field. It draws the menu's box and the menu item's rows, the active row in the hover fill, sets no position, z-index or width, and is at most twelve rows high, or `maxHeight` in CSS pixels when less; `isCode` shows the labels in the code font.

## 0.0.8

- `@noldova/ui.components.angular`: a menu trigger, a context menu's host and a submenu's row name their menu in `aria-controls` only while it is open; before, they kept naming a menu that had closed and was no longer in the document.

## 0.0.7

- `@noldova/ui.components.angular`: `ButtonVariant.Accent`, the accent chip look for `nol-button`, for an action on a card that names what is shown, such as a page card's Open while its page is open: the chip's height and side padding, the `selected` fill with a `text` label and no visible border, the toolbar hover over that fill under the pointer, the button's focus outline and disabled look, and under forced colors a `ButtonText` border and label, or `GrayText` while disabled. It keeps the chip's height at the compact size.
- `@noldova/ui.components.angular`: `ToolCall` takes an optional `note`, such as "waiting for your answer", which the card draws after the title inside the same truncating text: a ` · ` separator and the note in `text-muted` at the title's size, or `GrayText` under forced colors. The toggle's accessible name and the title's tooltip read the title and the note together.
- `@noldova/ui.components.angular`: a terminal can show the dark terminal look inside the light theme: the `nol-terminal-dark` class on an element around it maps every `--nol-terminal-*` token to a new `--nol-terminal-dark-*` twin, which the default theme gives its dark mode's terminal colors in both modes and a custom theme can set. Under forced colors the scope keeps the system's colors. `nol-terminal-output` follows the class when it's added or removed.
- `@noldova/ui.components.angular`: `isPressedWhileOpen` on a toolbar button with a menu draws the pressed fill while its menu is open, and its idle look once it closes; it is opt-in, so other toolbar buttons keep their look.
- `@noldova/ui.components.angular`: two new colors, `warning-background` and `error-background`, for a band under `warning` or `error` text, both `Canvas` under forced colors.
- `@noldova/ui.components.angular`: `uppercase` on `nol-menu-group` draws its label in capitals in the uppercase section header's look, at the kit's 12px small size; the group's accessible name stays the label as written.
- `@noldova/ui.components.angular`: a working tab's leading spinner takes the icon's 1rem box and its 0.25rem gap, so the label no longer moves left while the tab works; the ring stays 0.75rem, centred in the box.

## 0.0.6

- `@noldova/ui.components.angular`: `nol-menu-item` takes `isShowingChevron`, true by default; a row that opens a submenu with it false leaves out its chevron, so its value or shortcut ends at the row's end padding, as a Zoom row showing the page's zoom does. The row still opens its submenu by the pointer, Enter and the arrow key toward its side, and still tells screen readers it opens a menu.
- `@noldova/ui.components.angular`: a collapsible section header's caret is 0.875rem, by the new `--nol-section-header-caret` token, in the header's text color, `text-strong`, or `text` on an uppercase header, rather than 1rem in `icon-color`; under forced colors it takes the label's system color.
- `@noldova/ui.components.angular`: its development pins of Angular's build tools, `@angular/build` and `@angular/cli`, move from 22.2.6 to 22.2.7, their newest patch, which they published apart from Angular's; the kit's Angular stays at 22.2.6. An app can take the build tools at 22.2.7 with the kit, or keep them at 22.2.6.

## 0.0.5

0.0.4 was tagged but never published: its release stopped before the publish, since Angular's newest patch had moved past the kit's. This version holds what 0.0.4 would have, and moves the kit to that patch.

- `@noldova/ui.components.angular`: its Angular peers, `@angular/common`, `@angular/core`, `@angular/forms` and `@angular/platform-browser`, move from 22.2.5 to 22.2.6, Angular's newest patch, and its `@angular/cdk` from 22.2.5 to 22.2.7. Since the kit names them exactly, an app moves its own `@angular/*` packages to 22.2.6 with it, its build tools among them, and its `@angular/cdk` to 22.2.7 if it installs that itself.
- `@noldova/ui.components.angular`: under forced colors, a spinner on a `Highlight` fill shows its arc: a selected tab, a pressed toolbar or icon button, a selected virtual list option and the current menu row set the spinner's arc and ring to `HighlightText`, and an unavailable one, back on `Canvas`, keeps the `Highlight` arc over the `GrayText` ring. A part sets them by `--nol-spinner-forced-arc` and `--nol-spinner-forced-ring`, `Highlight` and `GrayText` when unset, so a spinner on its own looks as before.
- `@noldova/ui.components.angular`: under forced colors, a hovered button's and overlay icon button's dashes sit one border width off the border rather than on it, and a quick input result's matched letters are `CanvasText` unless the result is active, where they took `MarkText`, black on a dark `Canvas`.

## 0.0.3

- `@noldova/ui.components.angular`: a `PermissionRequester` may have no kind, `new PermissionRequester(name)`, and its card then describes and announces it by its name alone. A card whose requester has a kind now announces the name and the kind, such as "Permission request from Build agent, Agent: …", where it announced the name alone. Breaking: `PermissionRequester.kind` is now `string | null`, so code that reads it as a `string` checks for `null` first, such as `requester.kind ?? ""`; code that only constructs requesters with a kind needs no change.
- `@noldova/ui.components.angular`: the permission card's `detailLines` input sets how many lines of details show before Show all, 3 by default, a whole number of at least 1; above 12, the expanded details scroll at that many lines.
- `@noldova/ui.components.angular`: a medium dialog size, `DialogSize.Medium`, 40rem wide by the `--nol-dialog-medium-width` token, between the default and the large size; on a narrower window it shrinks to fit, as the default size does.

## 0.0.2

- `@noldova/ui.components.angular`: moves `markdown-it` to 15.0.3, which fixes a quadratic-time parse of an unterminated link reference definition that the Markdown view could reach (GHSA-gfr2-rv44-r23c), and a quadratic-time parse of inline HTML that the view, with HTML off, could not (GHSA-vfgh-jcmw-g37q).

## 0.0.1

- `@noldova/ui.components.angular`: the first public version of Noldova's interface kit, with its design tokens, fonts, icons and Angular components.
