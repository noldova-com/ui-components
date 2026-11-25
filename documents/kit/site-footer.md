# Site footer

**Scope:** The kit's website footer: its default geometry, the text roles it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

A website's start imports the footer from its own entry, `@noldova/ui.components.angular/site`, and the main entry exports it too; a start that never imports the main entry keeps the parts only a lazy page uses, such as the code block, out of it, as the kit's README, [Lazy pages](../../src/noldova.ui.components.angular/README.md#lazy-pages), says.

## Default geometry

The content keeps to the [site header's](site-header.md) width and insets, 3rem from the footer's top and bottom (`--nol-site-footer-padding-block`).
The lockup, with an optional line 0.75rem under it and at most 18rem wide (`--nol-site-footer-line-width`), takes two fifths of the row, and the link groups share the other three fifths as equal columns; the parts are 2rem apart (`--nol-site-footer-gap`), the last column ending at the content's end.
Each group's links are 0.25rem apart and each is at least the pointer target high and wide, so a one-letter link such as X is a whole target, the first one's text 0.75rem under its title as on a 1.25rem line.
The bottom row is the same 2rem under the groups, with the notice at its start and any content the site projects at its end.
When the footer is narrower than 48rem, as on a phone, the content takes the phone insets and is 2rem from the top and bottom (`--nol-site-footer-padding-block-phone`); the lockup takes its own row, the groups fall into two columns 1rem apart, and the rows, the bottom row included, are 1.5rem apart (`--nol-site-footer-gap-phone`).
There each link is a row 2.75rem high (`--nol-site-menu-row`), with no space between, 0.25rem under its title.

## Text roles

The product's name: as in the [site header](site-header.md), 1rem on a 1.25rem line at the emphasis weight, in `text-strong`.
The line: panel, in `text-muted`.
The links: panel, in `text`.
Group titles: small, at the emphasis weight, in capitals spaced by `--nol-letter-spacing-caps`, in `text-muted`.
The notice: small, in `text-muted`.

## Surface and behavior

The page's `contentinfo` landmark, on the panel color, with no border or line.
It takes its width from the block it is in, such as the page's body, and lays itself out by that width, never by its content's.
The lockup is the site header's: one link home named for the product's home, such as `TeamRun home`, its wordmark the file the site passes, drawn as a mask.
Each group is a navigation landmark named by its title; the current page's link is marked `aria-current="page"`.
The notice is `© <year> Noldova`, with `Noldova` linking to https://noldova.com in the notice's color, unless the site gives its own as plain text; the link takes clicks and taps across at least the pointer target high, drawn nowhere, so the notice's line keeps its height.
A hovered link, the notice's included, is underlined in `text-strong`, and keyboard focus is an accent outline outside it.
Under forced colors the wordmark and the product's name are `LinkText`, and keyboard focus is a 2px `Highlight` outline.
