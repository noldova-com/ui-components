# Site footer

**Scope:** The kit's website footer: its default geometry, the text roles it uses, and its surface and behavior.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

The content keeps to the [site header's](site-header.md) width and insets, 3rem below the footer's top (`--nol-site-footer-padding-top`).
The lockup, with an optional line 0.5rem under it, takes the row's start, and the link groups follow it in a row, 2.5rem apart (`--nol-site-footer-bottom-gap`), the last at the content's end; each group's links are 0.25rem apart under its title, 0.5rem below it, and each is at least the pointer target high.
The bottom row is 2.5rem under the groups and 3rem high (`--nol-site-footer-notice-height`), with the notice at its start and any content the site projects at its end.
Under 48rem the content takes the phone insets, the lockup takes its own row, and the groups fall into two columns 1rem apart, 1.5rem under it.

## Text roles

The product's name: title, at the emphasis weight, in `text-strong`.
The line and the links: panel, in `text-muted`.
Group titles: label, at the emphasis weight, in `text-strong`.
The notice: small, in `text-muted`.

## Surface and behavior

The page's `contentinfo` landmark, on the panel color, with no border or line.
The lockup is the site header's: one link home named `Noldova` and the product's name, its wordmark the file the site passes, drawn as a mask.
Each group is a navigation landmark named by its title; the current page's link is marked `aria-current="page"`.
A hovered link is underlined in `text-strong`, and keyboard focus is an accent outline outside it.
The notice is `© <year> Noldova` unless the site gives its own.
Under forced colors the wordmark and the product's name are `LinkText`, and keyboard focus is a 2px `Highlight` outline.
