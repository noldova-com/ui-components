# Changelog

**Scope:** What each published version of this repository's packages holds, newest first.

Each version's section is written by the pull request that changes the version, from the pull requests merged since the previous version, as the [README](README.md#releases) says; other pull requests don't edit this file.

## 0.0.7

- `@noldova/ui.components.angular`: `ButtonVariant.Accent`, the accent chip look for `nol-button`, for an action on a card that names what is shown, such as a page card's Open while its page is open: the chip's height and side padding, the `selected` fill with a `text` label and no visible border, the toolbar hover over that fill under the pointer, the button's focus outline and disabled look, and under forced colors a `ButtonText` border and label, or `GrayText` while disabled. It keeps the chip's height at the compact size.
- `@noldova/ui.components.angular`: `ToolCall` takes an optional `note`, such as "waiting for your answer", which the card draws after the title inside the same truncating text: a ` · ` separator and the note in `text-muted` at the title's size, or `GrayText` under forced colors. The toggle's accessible name and the title's tooltip read the title and the note together.
- `@noldova/ui.components.angular`: a terminal can show the dark terminal look inside the light theme: the `nol-terminal-dark` class on an element around it maps every `--nol-terminal-*` token to a new `--nol-terminal-dark-*` twin, which the default theme gives its dark mode's terminal colors in both modes and a custom theme can set. Under forced colors the scope keeps the system's colors. `nol-terminal-output` follows the class when it's added or removed.
- `@noldova/ui.components.angular`: `isPressedWhileOpen` on a toolbar button with a menu draws the pressed fill while its menu is open, and its idle look once it closes; it is opt-in, so other toolbar buttons keep their look.
- `@noldova/ui.components.angular`: two new colors, `warning-background` and `error-background`, for a band under `warning` or `error` text, both `Canvas` under forced colors.
- `@noldova/ui.components.angular`: `uppercase` on `nol-menu-group` draws its label in capitals in the uppercase section header's look, at the kit's 12px small size; the group's accessible name stays the label as written.
- `@noldova/ui.components.angular`: a working tab's leading spinner takes the icon's 1rem box and its 0.25rem gap, so the label no longer moves left while the tab works; the ring stays 0.75rem, centred in the box.
- `@noldova/ui.components.angular`: a menu trigger, a context menu's host and a submenu's row name their menu in `aria-controls` only while it is open; before, they kept naming a menu that had closed and was no longer in the document.

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
