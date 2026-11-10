# The kit

**Scope:** The kit's specification: its themes and how a page paints one, its tokens with the default theme's values, the rules every control shares and the list of each control's own specification, with how the fixture theme and the Gallery verify them.

[Noldova's UI standard](https://github.com/noldova-com/.github/blob/main/standards/UI.md) applies here in full, and this document specifies only what the kit itself is.
How the checks verify the kit is in the [README](../README.md#checks), and the code rules only this repository has are in [ARCHITECTURE.md](ARCHITECTURE.md#code).

## Themes

What a theme holds is in the kit's [README](../src/noldova.ui.components.angular/README.md#themes), and this section adds the kit's rules for shapes and for painting a theme.
A shape is a named form of a kit control, such as the tab's `pill`.
The kit implements every shape, and a theme only chooses among them.
A theme's look value may refer to other tokens.
A theme that changes a settings item's sides sets `settings-item-padding-inline` and builds `settings-item-padding` from it, as the default theme does with `var(--nol-settings-item-padding-inline)`, so the inline padding Desktop Core's Settings takes as its edge stays the item's.
The default theme defines the values in this document, and another theme gives its colors for both modes and the parts of the look it changes.

Painting a theme sets each control's shape as an attribute on the element it paints, such as `data-nol-tab-shape="pill"`.
A page that paints no theme by script, such as a prerendered web page, takes the default theme's colors and look from the kit's `styles/theme.css` with its `styles/kit.css`, which need no script.
It follows the operating system's mode, and the page chooses a mode by setting `data-nol-theme-mode` on its root to `Light` or `Dark`.
Such a page sets the shape attribute of each kit control it uses itself, such as `data-nol-tab-shape="pill"`.

## Tokens

Every color the kit paints comes from a theme token, and how each key names its token and falls back is in the kit's [README](../src/noldova.ui.components.angular/README.md#themes).
The table gives the default theme's light and dark values and what each token colors.
The default theme's grays for surfaces, borders, hover, selection and the focused list's selection carry no tint, so a selected item sits in the same gray family as the surface around it.

| Token | Theme key | Light | Dark | Use |
|---|---|---|---|---|
| `--nol-window` | `window` | #F8F8F8 | #181818 | Shell and dock surfaces |
| `--nol-panel` | `panel` | #FFFFFF | #1F1F1F | Document surface |
| `--nol-raised` | `raised` | #F8F8F8 | #2B2B2B | Raised cards |
| `--nol-code` | `code`, fallback `window` | #F8F8F8 | #181818 | Code body |
| `--nol-code-header` | `code-header`, fallback `raised` | #F2F2F2 | #2B2B2B | Code header |
| `--nol-code-header-raised` | `code-header-raised`, fallback `code-header` | #F2F2F2 | #343434 | A code header on a raised or selected row, one step apart from the row in dark; muted text keeps 4.5:1 on it |
| `--nol-attachment` | `attachment`, fallback `raised` | #F2F2F2 | #2B2B2B | A file attachment's surface; text, muted text and icons keep their contrast on it |
| `--nol-code-comment` | `code-comment` | #008000 | #6A9955 | Comments in code; at least 4.5:1 on the code surface |
| `--nol-code-keyword` | `code-keyword` | #0000FF | #569CD6 | Keywords, storage words and language constants in code; at least 4.5:1 on the code surface |
| `--nol-code-control` | `code-control` | #AF00DB | #C586C0 | Control keywords in code, such as `if`, `return` and `import`; at least 4.5:1 on the code surface |
| `--nol-code-string` | `code-string` | #A31515 | #CE9178 | Strings in code, and a diff's removed lines; at least 4.5:1 on the code surface |
| `--nol-code-number` | `code-number` | #098154 | #B5CEA8 | Numbers and units in code, and a diff's added lines; at least 4.5:1 on the code surface |
| `--nol-code-type` | `code-type` | #247A93 | #4EC9B0 | Types, classes and namespaces in code; at least 4.5:1 on the code surface |
| `--nol-code-function` | `code-function` | #795E26 | #DCDCAA | Functions in code; at least 4.5:1 on the code surface |
| `--nol-code-variable` | `code-variable` | #001080 | #9CDCFE | Variables, parameters, properties and attributes in code; at least 4.5:1 on the code surface |
| `--nol-code-regex` | `code-regex` | #811F3F | #D16969 | Regular expressions in code; at least 4.5:1 on the code surface |
| `--nol-code-meta` | `code-meta` | #800000 | #D7BA7D | Tags, decorators, preprocessor lines, headings and a diff's headers in code; at least 4.5:1 on the code surface |
| `--nol-text` | `text` | #3B3B3B | #BDBDBD | Ordinary text, selected-tab labels and text-button labels |
| `--nol-text-strong` | `text-strong`, fallback `text` | #3B3B3B | #CCCCCC | Names, bold text and headings: a message's author, a dialog's title, a section header, a group header's title, a configuration table's heading and header row, a permission card's heading and high risk, Markdown's headings, bold text and table headers outside a link or a quote, which keep the link's or the quote's color, and the Gallery's scope titles and section names |
| `--nol-text-muted` | `text-muted` | #616161 | #9D9D9D | Secondary text on normal surfaces |
| `--nol-icon-color` | `icon-color`, fallback `text` | #3B3B3B | #CCCCCC | Interface icons |
| `--nol-card-border` | `card-border`, fallback `widget-border` | #E5E5E5 | #252525 | Decorative panel border |
| `--nol-border` | `border` | #E5E5E5 | #2B2B2B | Dock strip separators and other functional borders |
| `--nol-accent` | `accent` | #005FB8 | #4DAAFC | Focus and active resize indicators |
| `--nol-sash-active` | `sash-active`, fallback `accent` | #005FB8 | #4DAAFC | Bar of a sash in use |
| `--nol-link` | `link` | #005FB8 | #4DAAFC | Links |
| `--nol-mention` | `mention`, fallback `accent` | #005FB8 | #4DAAFC | A mention in the markdown view, at the emphasis weight; at least 4.5:1 on the window, panel, dialog and raised surfaces |
| `--nol-hover` | `hover` | #F2F2F2 | #2C2C2C | Row, tab and menu-item hover |
| `--nol-selected` | `selected`, fallback `list-active` | #E6E6E6 | #383838 | Selected rows, tabs and choice pills, and the active row of the quick input and the mention list |
| `--nol-toolbar-hover` | `toolbar-hover` | #B8B8B850 | #5A5D5E50 | Icon-button, toolbar-button and text-button hover |
| `--nol-overlay-control` | `overlay-control` | #FFFFFF1A | #FFFFFF1A | An overlay icon button's or text button's fill on the overlay backdrop |
| `--nol-overlay-control-hover` | `overlay-control-hover` | #FFFFFF14 | #FFFFFF14 | Hover laid over that fill |
| `--nol-overlay-control-text` | `overlay-control-text` | #EEEEEE | #EEEEEE | The glyph and label of a button on that fill |
| `--nol-scrollbar` | `scrollbar` | #64646466 | #79797966 | Scrollbar thumb |
| `--nol-scrollbar-active` | `scrollbar-active`, fallback `scrollbar` | #646464B3 | #646464B3 | Scrollbar thumb while dragged |
| `--nol-title-bar` | `title-bar` | #F8F8F8 | #181818 | Native title-bar background |
| `--nol-title-bar-text` | `title-bar-text` | #1E1E1E | #CCCCCC | Native title-bar text |
| `--nol-input` | `input` | #FFFFFF | #313131 | Field background |
| `--nol-input-border` | `input-border` | #858585 | #858585 | Field border |
| `--nol-input-text` | `input-text` | #3B3B3B | #CCCCCC | Field text |
| `--nol-placeholder` | `placeholder` | #767676 | #9A9A9A | Field placeholder; a placeholder never replaces a label |
| `--nol-button` | `button` | #005FB8 | #0078D4 | Primary button and the chosen docking guide |
| `--nol-button-text` | `button-text` | #FFFFFF | #FFFFFF | Primary button text |
| `--nol-button-hover` | `button-hover` | #0258A8 | #026EC1 | Primary button hover |
| `--nol-button-secondary` | `button-secondary` | #E5E5E5 | #00000000 | Secondary button |
| `--nol-button-secondary-text` | `button-secondary-text` | #3B3B3B | #CCCCCC | Secondary button text |
| `--nol-button-secondary-hover` | `button-secondary-hover` | #CCCCCC | #2B2B2B | Secondary button hover |
| `--nol-button-danger-text` | `button-danger-text`, fallback `panel` | #FFFFFF | #1F1F1F | A danger button's label on its `error` fill; at least 4.5:1 on it and on its hover |
| `--nol-dropdown` | `dropdown`, fallback `input` | #FFFFFF | #313131 | Select |
| `--nol-dropdown-border` | `dropdown-border`, fallback `input-border` | #858585 | #858585 | Select border |
| `--nol-dropdown-list` | `dropdown-list`, fallback `input` | #FFFFFF | #1F1F1F | Options list |
| `--nol-list-active` | `list-active` | #D4D4D4 | #4A4A4A | Chosen or keyboard-active option |
| `--nol-list-active-text` | `list-active-text` | #000000 | #FFFFFF | Text of the chosen or keyboard-active option |
| `--nol-list-highlight` | `list-highlight` | #0066BF | #2AAAFF | Search matches, at the emphasis weight so color is not their only cue |
| `--nol-button-border` | `button-border` | #0000001A | #FFFFFF1A | Decorative edge where the button fill already identifies the control |
| `--nol-setting-title` | `setting-title`, fallback `text` | #1F1F1F | #FFFFFF | Settings titles |
| `--nol-hover-widget` | `hover-widget`, fallback `raised` | #F8F8F8 | #202020 | Tooltip surface |
| `--nol-hover-widget-border` | `hover-widget-border`, fallback `widget-border` | #3B3B3B33 | #CCCCCC33 | Tooltip border |
| `--nol-quick-input` | `quick-input`, fallback `raised` | #F8F8F8 | #222222 | Search surface |
| `--nol-quick-input-key-border` | `quick-input-key-border`, fallback `widget-border` | #CECECE | #454545 | Search key cap border |
| `--nol-menu-separator` | `menu-separator`, fallback `widget-border` | #3B3B3B33 | #454545 | Decorative menu separator |
| `--nol-widget-shadow` | `widget-shadow` | #00000029 | #0000005C | Select-list shadow |
| `--nol-widget-border` | `widget-border`, fallback `card-border` | #E5E5E5 | #313131 | Dialog outline |
| `--nol-dialog` | `dialog`, fallback `raised` | #F8F8F8 | #202020 | Dialog surface |
| `--nol-menu` | `menu` | #FFFFFF | #1F1F1F | Menu surface |
| `--nol-menu-text` | `menu-text` | #3B3B3B | #CCCCCC | Menu text |
| `--nol-menu-border` | `menu-border` | #CECECE | #454545 | Menu and quick input border |
| `--nol-checkbox` | `checkbox` | #F8F8F8 | #313131 | Checkbox surface |
| `--nol-checkbox-border` | `checkbox-border` | #858585 | #858585 | Checkbox boundary |
| `--nol-switch-knob` | `switch-knob` | #FFFFFF | #1F1F1F | Switch knob while on |
| `--nol-badge` | `badge` | #CCCCCC | #616161 | Filled badge |
| `--nol-badge-text` | `badge-text` | #3B3B3B | #F8F8F8 | Filled badge text |
| `--nol-progress` | `progress`, fallback `accent` | #005FB8 | #4DAAFC | Progress indicators |
| `--nol-notification` | `notification` | #FFFFFF | #1F1F1F | Notification surface |
| `--nol-notification-border` | `notification-border` | #E5E5E5 | #454545 | Notification border |
| `--nol-error` | `error` | #A1260D | #F48771 | Errors, with text or a symbol that names them, a danger icon button's glyph, a danger button's fill and a danger menu item's label and icon |
| `--nol-removed` | `removed`, fallback `error` | #A1260D | #F48771 | Removed lines and counts, with a sign that names them |
| `--nol-added` | `added` | #3F6212 | #B5CEA8 | Added lines and counts, the copy-success icon and a tool call's success icon |
| `--nol-status-ok` | `status-ok` | #1A7F37 | #3FB950 | An app's status dot for a positive state, such as Connected; `CanvasText` in forced colors |
| `--nol-status-failed` | `status-failed` | #CF222E | #F85149 | An app's status dot for a failed state, such as Sign-in required or Connection error; `CanvasText` in forced colors |
| `--nol-warning` | `warning` | #8A5800 | #E3A33B | Text and marks for a state near a limit or one to check, such as a Warning chip or a meter's warning tone, with text that names it; `CanvasText` in forced colors |
| `--nol-docking-preview` | `docking-preview`, fallback `selected` | #E6E6E6 | #383838 | The area a dragged tab will occupy |
| `--nol-docking-preview-border` | `docking-preview-border`, fallback `accent` | #005FB8 | #4DAAFC | The border of that area |
| `--nol-text-selection` | `text-selection` | #ADD6FF | #264F78 | Selected text's fill where the kit paints a selection itself, as in the mention field; the selection foreground stays at least 4.5:1 on it. Forced colors use `Highlight` |
| `--nol-text-selection-foreground` | `text-selection-foreground` | #3B3B3B | #CCCCCC | Selected text where the kit paints a selection itself; at least 4.5:1 on the text selection. Forced colors use `HighlightText` |
| `--nol-terminal-background` | `terminal-background`, fallback `panel` | #FFFFFF | #1F1F1F | The color a terminal draws on where nothing behind it paints: the panel color in both modes. A terminal draws on its host's background, the window color in the bottom panel and the panel color in the editor area or a chat, and every ratio this table gives on the terminal background holds on both |
| `--nol-terminal-foreground` | `terminal-foreground`, fallback `text` | #3B3B3B | #CCCCCC | Terminal text in its default color; at least 4.5:1 on the terminal background |
| `--nol-terminal-cursor` | `terminal-cursor`, fallback `accent` | #005FB8 | #CCCCCC | Terminal cursor; at least 3:1 on the terminal background |
| `--nol-terminal-selection` | `terminal-selection`, fallback `selected` | #ADD6FF | #264F78 | Selected terminal text's fill; the selection foreground stays at least 4.5:1 on it |
| `--nol-terminal-selection-foreground` | `terminal-selection-foreground`, fallback `text` | #3B3B3B | #CCCCCC | Selected terminal text; at least 4.5:1 on the terminal selection |
| `--nol-terminal-ansi-black` | `terminal-ansi-black` | #000000 | #000000 | The terminal's ANSI black; under 4.5:1 on the terminal background in dark mode, an exception stated below the table |
| `--nol-terminal-ansi-red` | `terminal-ansi-red` | #CD3131 | #CD3131 | The terminal's ANSI red; under 4.5:1 on the terminal background in dark mode, an exception stated below the table |
| `--nol-terminal-ansi-green` | `terminal-ansi-green` | #107C10 | #0DBC79 | The terminal's ANSI green; at least 4.5:1 on the terminal background |
| `--nol-terminal-ansi-yellow` | `terminal-ansi-yellow` | #949800 | #E5E510 | The terminal's ANSI yellow; under 4.5:1 on the terminal background in light mode, an exception stated below the table |
| `--nol-terminal-ansi-blue` | `terminal-ansi-blue` | #0451A5 | #2472C8 | The terminal's ANSI blue; under 4.5:1 on the terminal background in dark mode, an exception stated below the table |
| `--nol-terminal-ansi-magenta` | `terminal-ansi-magenta` | #BC05BC | #BC3FBC | The terminal's ANSI magenta; under 4.5:1 on the terminal background in dark mode, an exception stated below the table |
| `--nol-terminal-ansi-cyan` | `terminal-ansi-cyan` | #0598BC | #11A8CD | The terminal's ANSI cyan; under 4.5:1 on the terminal background in light mode, an exception stated below the table |
| `--nol-terminal-ansi-white` | `terminal-ansi-white` | #555555 | #E5E5E5 | The terminal's ANSI white; at least 4.5:1 on the terminal background |
| `--nol-terminal-ansi-bright-black` | `terminal-ansi-bright-black` | #666666 | #666666 | The terminal's ANSI bright black; under 4.5:1 on the terminal background in dark mode, an exception stated below the table |
| `--nol-terminal-ansi-bright-red` | `terminal-ansi-bright-red` | #F14C4C | #F14C4C | The terminal's ANSI bright red; under 4.5:1 on the terminal background in light mode, an exception stated below the table |
| `--nol-terminal-ansi-bright-green` | `terminal-ansi-bright-green` | #14CE14 | #23D18B | The terminal's ANSI bright green; under 4.5:1 on the terminal background in light mode, an exception stated below the table |
| `--nol-terminal-ansi-bright-yellow` | `terminal-ansi-bright-yellow` | #B5BA00 | #F5F543 | The terminal's ANSI bright yellow; under 4.5:1 on the terminal background in light mode, an exception stated below the table |
| `--nol-terminal-ansi-bright-blue` | `terminal-ansi-bright-blue` | #3B8EEA | #3B8EEA | The terminal's ANSI bright blue; under 4.5:1 on the terminal background in light mode, an exception stated below the table |
| `--nol-terminal-ansi-bright-magenta` | `terminal-ansi-bright-magenta` | #D670D6 | #D670D6 | The terminal's ANSI bright magenta; under 4.5:1 on the terminal background in light mode, an exception stated below the table |
| `--nol-terminal-ansi-bright-cyan` | `terminal-ansi-bright-cyan` | #29B8DB | #29B8DB | The terminal's ANSI bright cyan; under 4.5:1 on the terminal background in light mode, an exception stated below the table |
| `--nol-terminal-ansi-bright-white` | `terminal-ansi-bright-white` | #A5A5A5 | #E5E5E5 | The terminal's ANSI bright white; under 4.5:1 on the terminal background in light mode, an exception stated below the table |
| `--nol-author-1` | `author-1`, fallback `accent` | #2F78CA | #76A7DF | Blue, an author's color, which picks the hue of its message's avatar, as the [avatar](kit/avatar.md) says, and never paints its start bar, which only selection paints |
| `--nol-author-2` | `author-2`, fallback `accent` | #1F8582 | #2AB5B0 | Teal, an author's color, which picks the hue of its message's avatar, as the [avatar](kit/avatar.md) says, and never paints its start bar, which only selection paints |
| `--nol-author-3` | `author-3`, fallback `accent` | #20882E | #2CBB3F | Green, an author's color, which picks the hue of its message's avatar, as the [avatar](kit/avatar.md) says, and never paints its start bar, which only selection paints |
| `--nol-author-4` | `author-4`, fallback `accent` | #977023 | #CF9A30 | Amber, an author's color, which picks the hue of its message's avatar, as the [avatar](kit/avatar.md) says, and never paints its start bar, which only selection paints |
| `--nol-author-5` | `author-5`, fallback `accent` | #B75E2B | #DB9267 | Orange, an author's color, which picks the hue of its message's avatar, as the [avatar](kit/avatar.md) says, and never paints its start bar, which only selection paints |
| `--nol-author-6` | `author-6`, fallback `accent` | #D3424C | #E48A90 | Red, an author's color, which picks the hue of its message's avatar, as the [avatar](kit/avatar.md) says, and never paints its start bar, which only selection paints |
| `--nol-author-7` | `author-7`, fallback `accent` | #CF31A5 | #E283C9 | Magenta, an author's color, which picks the hue of its message's avatar, as the [avatar](kit/avatar.md) says, and never paints its start bar, which only selection paints |
| `--nol-author-8` | `author-8`, fallback `accent` | #9358D8 | #B992E5 | Purple, an author's color, which picks the hue of its message's avatar, as the [avatar](kit/avatar.md) says, and never paints its start bar, which only selection paints |
| `--nol-avatar-default` | `avatar-default`, fallback `selected` | #DBEAFE | #1E3A5F | The avatar's fill without a color |
| `--nol-avatar-default-text` | `avatar-default-text`, fallback `text` | #1E40AF | #BFDBFE | The avatar's letter without a color; at least 4.5:1 on its fill |
| `--nol-avatar-teal` | `avatar-teal`, fallback `avatar-default` | #CCFBF1 | #134E4A | Teal, a filled avatar's fill |
| `--nol-avatar-teal-text` | `avatar-teal-text`, fallback `avatar-default-text` | #115E59 | #99F6E4 | Teal, a filled avatar's letter; at least 4.5:1 on its fill |
| `--nol-avatar-green` | `avatar-green`, fallback `avatar-default` | #DCFCE7 | #14532D | Green, a filled avatar's fill |
| `--nol-avatar-green-text` | `avatar-green-text`, fallback `avatar-default-text` | #166534 | #BBF7D0 | Green, a filled avatar's letter; at least 4.5:1 on its fill |
| `--nol-avatar-lime` | `avatar-lime`, fallback `avatar-default` | #ECFCCB | #365314 | Lime, a filled avatar's fill |
| `--nol-avatar-lime-text` | `avatar-lime-text`, fallback `avatar-default-text` | #3F6212 | #D9F99D | Lime, a filled avatar's letter; at least 4.5:1 on its fill |
| `--nol-avatar-amber` | `avatar-amber`, fallback `avatar-default` | #FEF3C7 | #78350F | Amber, a filled avatar's fill |
| `--nol-avatar-amber-text` | `avatar-amber-text`, fallback `avatar-default-text` | #92400E | #FDE68A | Amber, a filled avatar's letter; at least 4.5:1 on its fill |
| `--nol-avatar-orange` | `avatar-orange`, fallback `avatar-default` | #FFEDD5 | #7C2D12 | Orange, a filled avatar's fill |
| `--nol-avatar-orange-text` | `avatar-orange-text`, fallback `avatar-default-text` | #9A3412 | #FED7AA | Orange, a filled avatar's letter; at least 4.5:1 on its fill |
| `--nol-avatar-red` | `avatar-red`, fallback `avatar-default` | #FEE2E2 | #7F1D1D | Red, a filled avatar's fill |
| `--nol-avatar-red-text` | `avatar-red-text`, fallback `avatar-default-text` | #991B1B | #FECACA | Red, a filled avatar's letter; at least 4.5:1 on its fill |
| `--nol-avatar-rose` | `avatar-rose`, fallback `avatar-default` | #FFE4E6 | #881337 | Rose, a filled avatar's fill |
| `--nol-avatar-rose-text` | `avatar-rose-text`, fallback `avatar-default-text` | #9F1239 | #FECDD3 | Rose, a filled avatar's letter; at least 4.5:1 on its fill |
| `--nol-avatar-pink` | `avatar-pink`, fallback `avatar-default` | #FCE7F3 | #831843 | Pink, a filled avatar's fill |
| `--nol-avatar-pink-text` | `avatar-pink-text`, fallback `avatar-default-text` | #9D174D | #FBCFE8 | Pink, a filled avatar's letter; at least 4.5:1 on its fill |
| `--nol-avatar-purple` | `avatar-purple`, fallback `avatar-default` | #F3E8FF | #581C87 | Purple, a filled avatar's fill |
| `--nol-avatar-purple-text` | `avatar-purple-text`, fallback `avatar-default-text` | #6B21A8 | #E9D5FF | Purple, a filled avatar's letter; at least 4.5:1 on its fill |
| `--nol-avatar-violet` | `avatar-violet`, fallback `avatar-default` | #EDE9FE | #4C1D95 | Violet, a filled avatar's fill |
| `--nol-avatar-violet-text` | `avatar-violet-text`, fallback `avatar-default-text` | #5B21B6 | #DDD6FE | Violet, a filled avatar's letter; at least 4.5:1 on its fill |
| `--nol-avatar-indigo` | `avatar-indigo`, fallback `avatar-default` | #E0E7FF | #312E81 | Indigo, a filled avatar's fill |
| `--nol-avatar-indigo-text` | `avatar-indigo-text`, fallback `avatar-default-text` | #3730A3 | #C7D2FE | Indigo, a filled avatar's letter; at least 4.5:1 on its fill |
| `--nol-avatar-cyan` | `avatar-cyan`, fallback `avatar-default` | #CFFAFE | #164E63 | Cyan, a filled avatar's fill |
| `--nol-avatar-cyan-text` | `avatar-cyan-text`, fallback `avatar-default-text` | #155E75 | #A5F3FC | Cyan, a filled avatar's letter; at least 4.5:1 on its fill |

These tokens derive from the theme's colors rather than having keys of their own.

| Token | Value | Use |
|---|---|---|
| `--nol-inline-code` | The text color at 12% over the surface below it | Inline-code background; its text stays fully opaque |
| `--nol-text-tab` | The muted text color | Unselected, operable tab labels |
| `--nol-text-placeholder` | The muted text color | Placeholder of a prose input |
| `--nol-added-background`, `--nol-removed-background` | The added or removed color at 10% over the surface below it | Diff backgrounds of changed lines; plain code text on them keeps 4.5:1 |
| `--nol-added-change`, `--nol-removed-change` | The added or removed color mixed into the code surface, 22% in light mode and 30% in dark | The characters a changed line changes; plain code text on them keeps 4.5:1 |
| `--nol-button-danger-hover` | The error color with 10% of `--nol-button-danger-text` mixed in | A danger button's hover fill |

The table gives normal-state colors.
The terminal's colors are the maintainer's decision, and its background is its host's background, the window or the panel color.
The stored ANSI colors listed above as under 4.5:1 on the terminal background, 9 in light mode and 5 in dark, the same on the window color as on the panel color, which the Gallery's terminal colors check, are an exception to the contrast the organization's UI standard sets, the maintainer's, as long as the app's terminal sets xterm's `minimumContrastRatio` to 4.5, so that every ANSI color it draws meets 4.5:1 on screen; the foreground, the selection's text and the cursor keep their ratios.
Another exception to that contrast, the maintainer's, is the diff view: code's token colors on its changed lines and changed characters may fall below 4.5:1, while plain code text keeps it.

A terminal draws its own text, which forced colors don't recolor, so in forced colors the terminal tokens take the system's colors over any painted theme: `Canvas` for the background, `Highlight` for the selection, `HighlightText` for the selected text, and `CanvasText` for the foreground, the cursor and every ANSI color, on the page and in every scope a theme is painted on.
These values are in `styles/terminal.css`, which `styles/kit.css` imports, so every page that loads the kit gets them, with or without `styles/theme.css`.
Since every ANSI color is then `CanvasText`, an app's terminal draws an ANSI cell background (SGR 40 to 47 and 100 to 107) as `--nol-terminal-background` in forced colors, so its text stays `CanvasText` on `Canvas`; the kit has no ANSI background tokens.
The status dot tokens, `--nol-status-ok` and `--nol-status-failed`, are their own colors, so a diff's added color and the error color don't change with them, and a status dot keeps 3:1 on the window, the panel, a hovered row and a selected row.
Forced colors have no green or red, so both become `CanvasText`, from `styles/status.css`, which `styles/kit.css` imports, on the page and in every scope a theme is painted on; a dot then stays visible, and the label beside it names the state, since `Highlight` would read as a selection.
A dot drawn as a background sets `forced-color-adjust: none`, as the Gallery's Status colors specimen does, since forced colors would otherwise paint its background as `Canvas`.

Muted text inside a selected surface takes that surface's normal text color, and every selected state sets the fill and that color together.
Selection, and a keyboard-active option, show by their fill alone, without a bar or other marker.
Rows, tabs and choice pills use the selected fill; a keyboard-active option in a select or dropdown list uses the active-list pair, and the quick input's active result and the mention list's active row, both over a typed filter, use the selected fill.
A choice row is the exception: it shows its pick by its radio's or checkbox's mark alone, with no selected fill, since the mark already says it and checkbox rows would otherwise fill several rows at once.
A choice row's description is part of its control's accessible name, after its label, as a menu row's description is, so it is read whenever the label is.
A disabled choice row, radio, checkbox or switch stays focusable, marked `aria-disabled="true"`, and refuses activation by pointer and keyboard, as the organization's UI standard asks of a composite control's disabled items.
Until the first public release has shipped, that fill is a stated exception of the organization's UI standard: it needs no 3:1 against its surface, since the part's semantics convey the state, and a second, subtle visual cue follows after the release.
The text on it keeps at least 4.5:1, and forced colors give it the Highlight fill.
Where muted text loses contrast on any other surface, that surface uses another token that keeps it.

A terminal's text is `--nol-text-terminal`, 0.8125rem, the panel size: like every rem size it follows the panel size setting, which sets the root's size, and the code size setting doesn't change it; code elsewhere is `--nol-text-code`, 0.75rem by default.
Its rows are xterm's at `--nol-line-terminal`, 1.3, the terminal's line height: the font's ascent and descent, rounded up to a device pixel, times 1.3, rounded down to one.

Text is Regular, 400, and emphasis, such as names, headings, titles, badges and matches, is `--nol-weight-emphasis`, Medium, 500; no control hard-codes an emphasis weight.
Text set in capitals, such as an uppercase section header, is `--nol-text-small`, 0.75rem and never under 12px, as the label size, with `--nol-letter-spacing-caps`, 0.05em, between its letters; no control hard-codes either.
The kit's fonts are Noldova Sans Regular, Italic, Medium, Medium Italic, Semibold and Semibold Italic, and Noldova Mono Regular, Medium and Semibold; Semibold, 600, `--nol-weight-strong`, stays for an app that asks for it and for the byline avatar's initial.

Shadows are shared tokens: `--nol-shadow-large` is 0 0 0.75rem at 14% black, `--nol-shadow-xlarge` is 0 0 1.25rem at 15% black, and `--nol-widget-shadow` colors the select list's shadow.
Overlays and drag ghosts take the shadow their row below gives them, and panel cards and cards take none.
A modal backdrop is `--nol-backdrop`, 50% black, and a non-modal overlay such as quick input dims nothing behind it.
An icon button or a text button over an image takes the overlay pair, theme looks the same in light and dark: `--nol-overlay`, 70% black, under `--nol-overlay-text`, white, which keeps 4.5:1 on it over any image.
On the overlay backdrop itself, such as an image viewer's, that fill would vanish, so a button there sets `backdrop` and takes `--nol-overlay-control`, white at 10%, with `--nol-overlay-control-hover`, white at 8%, laid over it under the pointer, under `--nol-overlay-control-text`, #EEEEEE, which keeps about 5.5:1 on it over the backdrop, on a white or a black page; disabled, such a button is at 35% opacity, and forced colors keep the overlay look.

An element that paints a theme of its own, such as each scope of the Gallery, takes the class `nol-theme-scope`.
It declares the derived tokens again, so they follow its own text and semantic colors.

## Controls

Each control's specification is a file of its own in [kit/](kit/), which gives its default geometry, the text role it uses, and its surface and behavior.
Widths are preferred maxima unless marked as minimums, and the text roles are the kit's text tokens, `--nol-text-<role>`.
Where a specification says the owner does something, the control leaves it to the code that uses it.
An overlay anchored to a control, such as a menu, a select list, a popover, a tooltip or a mention list, is placed for the size it has in the frame it first paints, and placed again before the next paint whenever a render changes its size.
A list that fills a row while it is hovered, active, chosen or current keeps two neighboring fills `--nol-row-gap` apart, twice the tab's side inset `--nol-tab-inset`, so 0.25rem, as two tabs' pills stand: the tree's rows and a virtual list's options have the gap between rows, and menu items and select, quick input and mention options are each that much taller, with their fill inset by the tab's side inset above and below, so the rows meet.

- [Avatar](kit/avatar.md)
- [Badge (counts, +1 −0), key and status chips](kit/badge.md)
- [Button](kit/button.md)
- [Card](kit/card.md)
- [Checkbox](kit/checkbox.md)
- [Choice pills (toggle group)](kit/choice-pills.md)
- [Choice row](kit/choice-row.md)
- [Code block](kit/code-block.md)
- [Configuration table](kit/configuration-table.md)
- [Copy](kit/copy.md)
- [Dialog](kit/dialog.md)
- [Diff view](kit/diff-view.md)
- [Docking guide](kit/docking-guide.md)
- [Drop line](kit/drop-line.md)
- [Dropdown list](kit/dropdown-list.md)
- [Field message](kit/field-message.md)
- [File badge](kit/file-badge.md)
- [Group header](kit/group-header.md)
- [Icon button](kit/icon-button.md)
- [Inline code](kit/inline-code.md)
- [Jump to latest](kit/jump-to-latest.md)
- [Link reference chip and card](kit/link-reference.md)
- [Markdown view](kit/markdown-view.md)
- [Mention field](kit/mention-field.md)
- [Menu bar](kit/menu-bar.md)
- [Menu item](kit/menu-item.md)
- [Menu-bar item](kit/menu-bar-item.md)
- [Menu](kit/menu.md)
- [Message](kit/message.md)
- [Meter](kit/meter.md)
- [Panel card](kit/panel-card.md)
- [Permission card](kit/permission-card.md)
- [Plan](kit/plan.md)
- [Popover](kit/popover.md)
- [Progress](kit/progress.md)
- [Quick input (search)](kit/quick-input.md)
- [Radio and radio group](kit/radio.md)
- [Sash](kit/sash.md)
- [Scrollbar](kit/scrollbar.md)
- [Section header](kit/section-header.md)
- [Select](kit/select.md)
- [Split button](kit/split-button.md)
- [Switch](kit/switch.md)
- [Tab](kit/tab.md)
- [Terminal output](kit/terminal-output.md)
- [Text field](kit/text-field.md)
- [Tool call](kit/tool-call.md)
- [Toolbar button](kit/toolbar-button.md)
- [Toolbar](kit/toolbar.md)
- [Tooltip](kit/tooltip.md)
- [Tree row](kit/tree-row.md)
- [View badge](kit/view-badge.md)
- [Virtual list](kit/virtual-list.md)
- [Word wrap](kit/word-wrap.md)

An app's own scrolling area that grows over time, such as a log or a list of tasks, follows its end as a streaming code block does with `ScrollEndFollower`, created with the distance from the end that turns following back on, 16px in the code block and the tool call.
The area calls its `see` on each of its scroll events, and its `follow` after each change to its content and from a `ResizeObserver` on the area, so an area at its end, such as a list in a dock, holds its end when it is resized, as the chat does: `follow` scrolls the area to its end while it follows, a scroll toward the start by any amount that leaves the end stops it, and a scroll toward the end that comes within the distance, or reaches the end, starts it again; a view the browser pulls back to its end as the area grows keeps following.
It follows from the start, so an area that calls `follow` once it first has content opens at its end.

## Fixture theme, new controls and the Gallery

Each control's tests run in the default theme and in the fixture theme, so they show the control takes its colors and geometry from the theme.
The fixture theme gives every color key a value that differs from the default theme's, except `scrollbar-active`, which it leaves out, so that token falls back to the fixture's own `scrollbar`.
Its every geometry value differs from the default theme's too, and it keeps the tab's `pill` shape, the only shape a kit control has.
A new kit control adds its own file to [kit/](kit/), and its link to the Controls list, when its contract differs from the controls there.

The kit's [Gallery](../src/noldova.ui.components.angular/src/app/components/gallery/) shows each reusable control's meaningful states in every theme and both modes, each theme and mode in a scope of its own.
Its `themes` and `modes` inputs choose which, the default theme in light and dark when not bound, with each theme's scopes in the order of `modes`; a page that needs only some scopes, such as a check of one theme in one mode, binds those and renders only them.
Each input names a theme or mode once, since one named twice repeats its scope under the same id, and an empty list shows no scope.
Every control has a section of one layout, with the space-6 step, 1.5rem, between sections.
A section has a heading with the control's name, then a grid of cells, one per state, each with a short muted caption above its specimen, in the order the default, the control's own states, disabled, focus and error.
Every section has a Hover cell, where the control shows its hover look, and a Focus cell, where it shows its focus, each marked with the Gallery's hover or focus mark.
A section without one of them says so with the static `noHover` or `noFocus` attribute on its specimen, and the Gallery's state spec finds every section the Gallery renders and checks that each has the cells its attributes don't rule out, and none that they do.
Below the grid, every section has a full-width row for long text, whose specimen is at most 12rem wide so truncation and wrapping show, and stays inside its cell with nothing spilling out of it.
A section whose control shows no text of its own, such as an icon button or a spinner, whose label is for screen readers only, or whose text can't grow, such as the view badge's count, which never passes 99+, says so with the static `noLongText` attribute on its specimen, and a Gallery spec checks that each section has a long-text row unless it has that attribute, and none if it does.
A cell is 12.5rem wide, two cells and their gap for a wide control such as a select or a menu, or the whole row for a control such as a dialog, a popover or quick input.
Cells are the space-4 step, 1rem, apart, and wrap onto further rows, keeping their order; a cell narrows only when its container is narrower than it.
Hover is shown statically: each kit rule for a hovered look matches `:is(:hover, [data-nol-state="Hover"])`, so that selector ships in the kit's styles, and only the Gallery sets the attribute.
The sash is the one exception: its bar shows only after the pointer rests on it for 300ms, so a pointer passing over it doesn't flash it, and the Gallery shows its in-use look in its Focus cell instead.
Focus is shown the same way: each kit rule for a focused look matches `:is(:focus-visible, [data-nol-state="Focus"])`, or `:is(:focus, [data-nol-state="Focus"])` for a text input, so a Focus cell shows the real focus ring without being focused.
A pressed cell appears only for a control with a pressed state.
The overlays a scope opens, such as menus, select lists and tooltips, open inside that scope, so they take its theme and mode.

A package that builds on the kit shows its own controls in the same Gallery through its `sections` input.
Each section follows the kit's own in every scope and lays out its specimens with the same specimen, cell, size and hover and focus marks, which `@noldova/ui.components.angular/gallery` exports.
The marks set `data-nol-state`, so the package's own elements need the same `:is(:hover, [data-nol-state="Hover"])` and `:is(:focus-visible, [data-nol-state="Focus"])` rules to show those states.
