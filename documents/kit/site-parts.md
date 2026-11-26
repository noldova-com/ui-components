# Site hero, sections, cards and closing

**Scope:** The kit's website page parts, the hero, the section, the cards and the closing call to action, with the type scale and spacing they share: their default geometry, the text roles they use, and their surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

A website imports the parts from its own entry, `@noldova/ui.components.angular/site`, as it does the [site header](site-header.md) and [footer](site-footer.md), and loads `styles/site.css` after the kit's own styles; `styles/kit.css` imports it too.

## Type scale and spacing

`styles/site.css` holds the parts' own properties, which the site's own pages use as well; they are not the kit's tokens and stay out of KIT.md's token table.
The parts lay themselves out by their own width, as the header and footer do: the hero and the section are each a container as wide as the block they are in, usually the page, and a card takes its spacing by the width of the section around it, so the widths below are the part's, not the window's. A page's own blocks take the phone values by the window's width. Sizes in `cqi` follow the nearest container, the window outside any.

| Property | Value | Below 47.5em |
|---|---|---|
| `--nol-site-text-small` | the message text | |
| `--nol-site-text` | the message text × 8 / 7 | |
| `--nol-site-text-large` | the message text × 9 / 7 | |
| `--nol-site-title-size` | clamp(2rem, 4cqi, 3.125rem), on a 1.12 line, spaced −0.045em | |
| `--nol-site-hero-title-size` | clamp(3rem, 5.7cqi, 4.9375rem), on a 1.06 line | clamp(2.4375rem, 9cqi, 3.75rem) |
| `--nol-site-card-title-size` | 1.5rem; 1.375rem below 68.75em | 1.6875rem |
| `--nol-site-section-space` | 6.875rem | 4.375rem |
| `--nol-site-shell-gutter` | 2.5rem | 1.25rem |
| `--nol-site-surface` | the panel color | |
| `--nol-site-radius` | 0.75rem | |

`.nol-site-shell` keeps a block to the site's content width, or to its container's width less a gutter at each side when that is narrower, centred; `.nol-site-eyebrow` is the small line above a headline, in the accent color, in the monospace font at `--nol-site-text-small`, in capitals spaced 0.075em.

## Hero

**Default geometry.** The hero keeps to the shell, 4.3125rem under its top and 2.8125rem over its end, with the optional line above and, 1.5625rem under it, the headline and the side text in two columns 3rem apart, the side text 18.75rem wide and at the columns' foot.
The actions are 1.9375rem under them, 1rem apart, each 2.5rem high with 1.25rem of padding at each side, its text 1rem on a 1.5rem line and its icon 1.25em after it, 0.5rem away.
The shot follows at the shell's width, its height its files' proportions.
Below 68.75em the side text is 15.3125rem wide and 1.5625rem from the headline, at the small size.
Below 47.5em the hero is 2.6875rem under its top and 1.9375rem over its end, the side text goes 1.4375rem under the headline, at most 25.625rem wide, without its closing words, and the actions are 1.5rem under it and 0.75rem apart; below 26.25em they stand one under another.

**Text roles.** The line above: as `.nol-site-eyebrow`. The headline: `--nol-site-hero-title-size` at the emphasis weight, balanced, in `setting-title`, its second line in `accent`. The side text: `--nol-site-text` on a 1.75 line in `text-muted`, its closing words in `text`.

**Surface and behavior.** The hero is a region named by its headline, the page's level-1 heading. Each action is a [button](button.md) link, primary or secondary, its icon hidden from assistive tech. The shot is framed by a 1px `border` line with the parts' radius on `--nol-site-surface`, its files listed for a sharper screen when the site gives them; it shows the light file unless the site marks the dark mode on the root with `data-nol-theme-mode`, or marks none and the system is dark.

## Section

**Default geometry.** A section keeps to the shell, `--nol-site-section-space` above and below, its title and its copy on one row, the copy at the row's end and 0.25rem over the title's foot, at least 1.875rem apart, and its content 2.625rem under them.
Below 47.5em the copy goes 1.4375rem under the title, its lines running on, and the content is 1.8125rem under it.

**Text roles.** The line above: as `.nol-site-eyebrow`, 1em over the title. The title: `--nol-site-title-size` at the emphasis weight, balanced, in `setting-title`. The copy: `--nol-site-text` on a 1.7 line in `text-muted`.

**Surface and behavior.** A region named by its title, a level-2 heading, with the id the site gives so a link can lead to it; a line break in the title starts a new line, and one in the copy does beside the title only.
A site that needs markup in the copy, such as a key name that differs by platform, leaves `copy` unset and projects an element with the `nolSiteSectionCopy` attribute, which the section draws in its copy's place and style, each of its elements with the `nol-site-section-copy-line` class a line of the copy; with neither, the section has no copy.

## Cards

**Default geometry.** A card grid sets as many columns of at least 18rem as fit, 1.25rem apart, the cards in a row as tall as each other, and one column when it is narrower. With `columns`, it sets that many on a screen 75rem and wider, two below that and one below 47.5rem, and the last card spans the columns its row leaves, so seven cards in four columns are set four and three with the last across two.
A card is 1.6875rem inside its border at the top and sides, with its icon, 1.4375rem, and its index on a row 2.125rem over its title, the title 0.875rem over its text, which takes at least 4.625rem.
Below 68.75em the sides are 1.25rem; below 47.5em the card is min(1.5625rem, 6vw) inside its border all round, the row 1.5rem over the title and the text as tall as it is.

**Text roles.** The icon in `accent`; the index at `--nol-site-text-small` in the monospace font in `text-muted`; the title at `--nol-site-card-title-size` on a 1.2 line, spaced −0.035em, at the emphasis weight, in `setting-title`; the text at `--nol-site-text-small` on a 1.8 line in `text-muted`.

**Surface and behavior.** Each card is an article on `--nol-site-surface` with a 1px `border` line and the parts' radius, clipping what the site projects after its text, such as a small picture of the feature.
A site that needs markup in the text, such as a key name that differs by platform, leaves `text` unset and projects an element with the `nolSiteCardText` attribute, which the card draws in its text's place and style; with neither, the card has no text.

## Closing

**Default geometry.** The closing keeps to the shell, 5.75rem under its top and 5.1875rem over its end, everything centred: the optional mark in a 4.1875rem square frame, its file 2.3125rem, 1.75rem over the optional line above; the title 1.3125rem under that line; the actions 1.9375rem under the title, 1rem apart; and the note 1.4375rem under them, its parts 0.375rem apart.
The button is 2.5rem high, as in the hero; the text link is at least the pointer target high, its icon 0.4375rem after its label.
Below 47.5em the closing is 4.125rem under its top and over its end, and a text link that wraps under the button is 0.3125rem further down.

**Text roles.** The line above: as `.nol-site-eyebrow`, centred. The title: clamp(2.4375rem, 5cqi, 3.8125rem) on a 1.1 line, spaced −0.05em, at the emphasis weight, balanced, in `setting-title`. The text link: `--nol-site-text-small` at the emphasis weight in `accent`, in `text` under the pointer. The note: `--nol-site-text-small` in `text-muted`.

**Surface and behavior.** A region named by its title, a level-2 heading; a line break in the title starts a new line. The mark's frame is on `raised` with a 1px `border` line and a 0.8125rem radius, and the mark is decorative; with a `markDark` too, dark mode draws that one in its place, as the lockup's `iconDark`. The button is a [button](button.md) link with its icon hidden from assistive tech; the text link's icon is hidden too, and its focus ring is 2px of `accent`, 5px out. The note is the content the site projects, such as a line and a wordmark, and takes no room when there is none. A site that needs markup in the title leaves `title` unset and projects an element with the `nolSiteClosingTitle` attribute, which fills the heading in its style.
