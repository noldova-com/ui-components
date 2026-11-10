# Link reference chip and card

**Scope:** The kit's link reference chip, which draws a link to an item on a code host as the item, and the card it shows: their default geometry, the text roles they use, and their surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

The chip is an inline row on the text's baseline, 0.25rem, `space-1`, between its parts, and at most 27.5rem wide, `reference-chip-max-width`, or the line's width if that is less.
It starts with the code host's mark, 0.875rem square, `reference-mark`, when the app gives one, or, for a host whose mark can't be shown yet, the mark's place as a dashed square in 70% of the link color, 1px, rounded 0.1875rem, `reference-mark-slot-radius`; then the state's icon, 1rem, `icon`, both centred on the line, then the reference and the title, cut at the chip's end with an ellipsis.
A chip with no mark starts with the icon.
A workflow run or a job is a chip of the same shape: the run, then its outcome or the job's name, its icon in the outcome's color.

The card is 27.5rem wide, `reference-card-width`, or the window's width less 1rem; its padding is 1rem by 1.125rem, `reference-card-padding`, its corners 0.75rem, `reference-card-radius`, with 0.75rem, `space-3`, between its rows, and it opens below the chip, at its start.
Its top row has 0.625rem, `reference-card-top-gap`, between the state's badge, the item's place and its age, which keeps to the row's end; a place too long for the row wraps, and the badge and the age stay centred on it.
The badge is 1.625rem tall, `reference-badge-height`, with fully round ends, 0.75rem, `space-3`, inside each end and 0.375rem, `reference-item-gap`, between its icon and its label.
The foot row has 0.5rem, `space-2`, between the author's round 1.25rem face, `avatar-byline`, the author's name and the pills at the row's end; each pill is 1.75rem tall, `reference-pill-height`, with 0.625rem, `reference-pill-padding`, inside each end, the medium radius, and 0.375rem, `reference-item-gap`, between its parts.
A pull request's pills are the lines it adds and removes, then its files; an issue's, its comments; a workflow run's or a job's, how long it took, such as "9m 12s", then the app's action, such as "Open in Pipelines", after a 1rem glyph the app gives, `open_in_new` by default.
A duration is a finite number of seconds, 0 or more, and an action has a label, an address and a glyph that aren't empty; the constructors throw a `LinkReferenceException` for any other.
A card may also have the app's statuses, each a pill before the changes and comments, such as "Build succeeded" with a 1rem icon, `icon`, in the status's tone, or "1 of 2 approved" as text alone; a status's icon with no tone is the pill's muted text. A monochrome icon is drawn as one shape from its opaque parts, so a mark inside it, such as the check in a disc, must be see-through to show; an opaque white check fills in.
Under the title, the app's details are two columns 0.25rem, `space-1`, apart down and 0.75rem, `space-3`, across: a muted label, such as "Author" or "On", and its value in the text color, both a pixel under the message size, `text-message`, and never under 12px; a value wraps within the card.
A footnote, such as "Read from the local repository", takes the author's place at the foot's start in the muted text, and wraps within the card.
A work item's state is a round 0.4375rem dot, `reference-dot`, in the app's tone, 0.3rem, `reference-dot-gap`, before its label in the muted text: after the chip, a space apart, outside its link, and first in the card's foot, which then puts the author at the foot's end.
Merge requests, work items, commits and branches are chips of the same shape, with the kind, icon and state the app gives; a chip the app gives no card, `hasCard: false`, such as a branch or a server, shows none, and can't have the parts only a card shows.
Every part the app gives is checked when the reference is made: an empty status, detail, footnote or work item label, or, in a browser, a tone or state color it doesn't accept as a color, throws a `LinkReferenceException`.

## Text role

The chip takes the text it sits in.
The card is message text, `text-message`, so every text in it follows the person's chat text size, as the chip does, from 12 to 18px; its line is the panel line height, `--nol-line-panel`, or the message size plus 0.3125rem when that is taller, so the card grows with the text and clips none. Its title is the message size, `--nol-text-message`, read on the card itself so a chat size painted on part of the page moves it too, at the emphasis weight, `--nol-weight-emphasis`, 500, and `--nol-line-reference-title`, 1.45; the badge's label is `--nol-weight-emphasis`, 500.
The author's face and its letter keep the byline avatar's size, `avatar-byline` and `--nol-text-avatar-byline`, at every chat size: the letter is part of the picture, as the image it stands in for is.
`--nol-text-reference-title` is a public token, defined on `:root` as `var(--nol-text-message)`, for apps that read it; the card doesn't read it, since a token defined there keeps the root's size.

## Surface and behavior

The app gives the Markdown view, or the message, a reader of links, `references`; the view asks it once about each link's address and text, and draws a link it knows as the item's chip, which activates as any link does.
While the app reads the item, the chip shows its reference beside its kind's icon in the muted text color, and has no card; once read, it shows the item's title and its icon in the state's color; a link the app turns out not to know is a plain link again.
The chip keeps the link's color and underline, the underline at 45% of the link color and 0.2em below the text.
The app gives each state's colors, its icon's and its badge's, in light and dark, so each code host keeps its own; the kit has no state colors of its own.
A monochrome image, the app's icon or mark, is drawn as a shape: the icon in the state's color and the mark in `--nol-text-strong`; any other image is drawn as it is.
Resting the pointer on the chip for the tooltip's delay, or focusing it from the keyboard, shows the card; Escape, a press, or leaving the chip and the card hides it, and the pointer may cross from the chip to the card.
The card is the raised surface, `--nol-raised`, inside a 1px `--nol-hover-widget-border` border, with the extra-large shadow; its top and foot are muted text, its title the strong text color, the badge the state's color on its fill, and the pills `--nol-hover`, with the lines a change adds and removes in the added and removed colors.
The age, such as "2h ago", is kept current, and its tooltip gives the full time.
The action is a link in the pill's muted text, with no underline, that activates its address as a link in the reply does: the Markdown view emits it from `linkActivate`, and from `linkOpen` with how it was opened, and the card hides; a right-click on it, a part's link or the chip goes to `linkMenu`, and the card stays.
The parts the app gives an address are links the same way, each a real link that shows its address on hover and activates it on a click, a middle click or Enter: `itemHref` for the title, the state badge and the number in the place, such as `#12`; `locationHref` for the place's name; `authorHref` for the author's face and name, one link; `diffHref` for both change pills; and `commentsHref` for the comments pill.
The place's last word is its number when it is `#` or `!` and digits, as in "example/app #12" or "group/app !7"; otherwise, as in "Team #frontend", the whole place is its name.
A link keeps its part's color, size and place, and the title, the place and the author's name underline while the pointer is on them; a part with no address is plain text.
While the card shows, Tab from the chip moves focus to the card's first link and on through its links in order, Shift+Tab from the first comes back to the chip, and Tab from the last goes on to what follows the chip and hides the card; the card stays while focus is in it, wherever the pointer goes, and while the window loses focus.
However the card closes with focus in it, by Escape, a link, something scrolling the chip away, or the item turning back to being read, focus goes back to the chip without scrolling the page to it, and the card doesn't show again.
Under forced colors the chip's icon, mark, mark's dashed place and underline are the link color, the card, its badge and its pills keep a border in the text color, and their text is the text color, or the link color for a part that is a link; an image that isn't monochrome is drawn as it is.
Under forced colors a work item's dot is the text color.
