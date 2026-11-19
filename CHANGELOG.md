# Changelog

**Scope:** What each published version of this repository's packages holds, newest first.

Each version's section is written by the pull request that changes the version, from the pull requests merged since the previous version, as the [README](README.md#releases) says; other pull requests don't edit this file.

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
