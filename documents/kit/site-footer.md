# Site footer

**Scope:** The kit's website footer: its default geometry, the text roles it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

A website's start imports the footer from the site entry, `@noldova/ui.components.angular/site`, or from its own, `@noldova/ui.components.angular/site/footer`, never from the main entry, which doesn't export it; a start that never imports the main entry keeps the parts only a lazy page uses, such as the code block, out of it, and one that imports only the header's and footer's entries keeps out the site's hero, sections, cards and closing too, when the lazy pages import them from their own entries, as the kit's README, [Lazy pages](../../src/noldova.ui.components.angular/README.md#lazy-pages), says.

## Default geometry

Every site's footer has one look.
The content keeps to the [site header's](site-header.md) width and insets, 3.875rem from the footer's top (`--nol-site-footer-padding-block`) and 3.4375rem from its bottom (`--nol-site-footer-padding-end`).
At the start, the lockup, with the site's `wordmarkSize`, then an optional line 1.125rem under it (`--nol-site-footer-line-gap`), then the notice 3.5rem under that (`--nol-site-footer-notice-gap`), both at most 18rem wide (`--nol-site-footer-line-width`), then any content the site projects.
At the end, the link groups, 3rem apart (`--nol-site-footer-group-gap`), the last one ending at the content's end; when the footer is too narrow for both, the groups wrap under the lockup, 2rem from it (`--nol-site-footer-gap`).
Each group's title is 0.5rem above its links, and the links are 0.625rem apart (`--nol-site-footer-link-gap`); each is at least the pointer target high and wide, so a one-letter link such as X is a whole target.
A link the site gives an `icon` draws it first, as a mask as high as its text, 0.5rem from its label, in `--nol-brand-mark` as the header's social marks are.
When the footer is at most 47.5rem wide, as on a phone, the content takes the phone insets, 2.75rem from the top (`--nol-site-footer-padding-block-phone`), and the groups are 2.5rem apart (`--nol-site-footer-group-gap-phone`). The theme still defines `--nol-site-footer-gap-phone` (1.5rem), the phone gap of the footer's former layout, but nothing in the kit reads it now.

## Text roles

The product's name: as in the [site header](site-header.md), 1rem on a 1.25rem line at the emphasis weight, in `text-strong`.
The line: message, on a line 1.7 times its size (`--nol-site-footer-line-height`), in `text-muted`; its line breaks are kept.
The links: message, on the site's line (`--nol-site-line-height`), in `text`.
Group titles: message, on a line 1.6 times its size (`--nol-site-line-height`), in the mono font and capitals, in `text-muted`.
The notice: as the line.

## Surface and behavior

The page's `contentinfo` landmark, on the window color, with no border or line.
It takes its width from the block it is in, such as the page's body, and lays itself out by that width, never by its content's.
The lockup is the site header's: one link home named for the product's home, such as `Example home`, or by the site's `homeLabel`, its wordmark the file the site passes, drawn as a mask; a site that shows its product's own wordmark passes no `name` and `SiteWordmarkSize.Large`.
Each group is a navigation landmark named by its title; the current page's link is marked `aria-current="page"`.
The notice is `© <year>` and Noldova's logo, unless the site gives its own as plain text.
The logo is the kit's `assets/brand/noldova-wordmark.svg`, the file noldova.com's own header draws, drawn in the notice's color as high as its capitals (`1cap`), on its baseline, in the file's proportions; it links to https://noldova.com at the page's stage (see `SiteStageService`), named Noldova; the link takes clicks and taps across at least the pointer target high, drawn nowhere, so the notice's line keeps its height.
A hovered link is underlined in `text-strong`, and the notice's logo turns `text-strong`, and keyboard focus is an accent outline outside it.
Under forced colors the wordmark, the product's name, the links' icons and the notice's logo are `LinkText`, and keyboard focus is a 2px `Highlight` outline.
