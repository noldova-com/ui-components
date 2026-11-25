# Site header

**Scope:** The kit's website header: its default geometry, the text roles it uses, its surface and behavior, its theme switch, and its phone menu.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

A website's start imports the header from its own entry, `@noldova/ui.components.angular/site`, and the main entry exports it too; a start that never imports the main entry keeps the parts only a lazy page uses, such as the code block, out of it, as the kit's README, [Lazy pages](../../src/noldova.ui.components.angular/README.md#lazy-pages), says.

## Default geometry

3.5rem high (`--nol-site-header-height`); the content keeps to 75rem (`--nol-site-content-width`), or 108rem on a documentation site (`--nol-site-content-width-wide`), centered, with 1.5rem insets (`--nol-site-padding-inline`).
From the start: the lockup, the links' text 2rem after it and 1.5rem apart, then at the end the search, 16rem wide (`--nol-site-search-width`), the social links 0.5rem apart, the theme switch and the Download button, the search, the switch and the button each 1rem from the part before.
The lockup's wordmark is 0.8125rem high (`--nol-site-wordmark`) in the wordmark's proportions, its width reserved before the file loads from `wordmarkRatio`, the Noldova wordmark's by default and the file's own when a site passes its own, with the product's name 0.5rem after it and a version 0.375rem after that.
A site that passes its product's `icon` gets it before the wordmark, drawn in its own colors, 1.75rem square (`--nol-site-icon`) and 0.75rem from the wordmark, its box held before the file loads; with an `iconDark` too, dark mode draws that one in its place. The icon is decorative, so the link's name stays the product's home. The lockup never narrows below its icon and its wordmark, so a tight bar takes the space from the product's name.
Each link is at least the pointer target high, with 0.5rem insets, and so is the version's link; each social link is an icon button target square with an icon-sized glyph.
The Download button is the kit's [button](button.md) at its height with no edge, its label in panel text at the emphasis weight, and its icon 0.375rem from its start.

## Text roles

The product's name: 1rem on a 1.25rem line (`--nol-site-name-text`, `--nol-site-name-line`), at the emphasis weight, in `text-strong`.
Links: panel, in `text-muted`, the current page's in `text-strong` at the emphasis weight.
The social links: `text-strong`, their marks in `--nol-brand-mark`, pure black in light mode and pure white in dark, as GitHub's and X's terms allow their marks, hovered and focused too.
The version: small, in `text-muted`.

## Surface and behavior

The page's `banner` landmark, on the panel color, with no border or line; it stays at the top of the page as it scrolls.
It takes its width from the block it is in, such as the page's body, and lays itself out by that width, never by its content's.
The lockup is one link home named for the product's home, such as `TeamRun home`, or `Noldova home` without a product's name; the site passes the wordmark's file, which is drawn as a mask in the text color, so the package ships no wordmark.
The current page's link is marked `aria-current="page"`; a hovered link takes the toolbar hover fill and `text-strong`, and keyboard focus is an accent outline inside it.
Each social link is named and tooltipped by its label, and the site passes its icon's file, drawn as a mask, so the package ships no third-party logo.
With the content's id, a skip link to it comes first, shown at the header's start only while it has the focus.
Under forced colors the wordmark, the product's name and the social icons are `LinkText`, the current link is underlined, and keyboard focus is a 2px `Highlight` outline.

## Theme switch

Icon-only [choice pills](choice-pills.md) named Theme, offering Light, Dark and System in that order, on the window color with the medium radius.
Each pill's box is a pointer target square, 1.5rem, as WCAG 2.5.8 asks, and draws its 1.25rem face (`--nol-site-theme-pill`) centred in it, so the boxes touch, the faces sit 0.125rem from the switch's edge and 0.25rem apart, and the switch is 1.5rem tall, centred on the social links.
In the phone menu, where the faces are larger than the target, each box is its face, 0.125rem from the edge and apart.
A choice sets `data-nol-theme-mode` to `Light` or `Dark` on the root element, or removes it for System, and is saved in `localStorage` under `noldova-theme` as `light`, `dark` or `system`; with nothing saved, or a value it doesn't know, it follows the system.
It applies the saved choice once it renders, and a choice the browser refuses to save still applies to the page.
The component doesn't ship a head script: each site sets `data-nol-theme-mode` from `noldova-theme` the same way in a script in its own head, which runs before the page renders, so the page never shows the other theme first.

## Phone menu

When the header is narrower than 48rem, as on a phone, the content takes 1rem insets (`--nol-site-padding-inline-phone`) and the bar keeps the lockup, the Download button, a search button when the site gives a search, and a menu button at the end, 0.5rem apart; on a documentation site the Download button moves into the menu.
In the bar the Download button is a menu row high, 0.75rem insets, with a 1.125rem glyph (`--nol-site-download-glyph-phone`).
Narrower than 30rem, the bar shows no Download button, and the open menu shows it under the social links and the theme switch, as on a documentation site.
The search button is a menu row square with the medium radius and a 1.5rem glyph, named Search; it says whether the search is open and which element it controls, and shows the selected fill while it is open.
The menu button is a menu row square with the medium radius and a 1.5rem glyph (`--nol-site-menu-glyph`), the glyph's end at the content's end; it is named Menu and says whether the menu is open and which element it controls, and while the menu is open it shows a close glyph on the selected fill.
The open menu shows, under the bar and across its width, ending 1rem above the header's bottom: the links 0.25rem under the bar as rows 2.75rem high (`--nol-site-menu-row`), in 1rem text (`--nol-site-menu-text`) and `text`, the current page's in `text-strong`; 0.75rem under them the social links and the theme switch at the end, each a menu row square, 0.25rem apart, with 1.25rem glyphs (`--nol-site-menu-icon`); and on a documentation site, 0.75rem under those, the Download button across the width, a menu row high, its label 0.875rem (`--nol-site-menu-download-text`).
Opening the menu moves the focus to its first link, so Tab goes on through the menu in the order it is drawn; Escape closes the menu and returns the focus to its button; following a link in it closes it.
The search button opens the search under the bar, across its width and ending 1rem above the header's bottom, and moves the focus to its field; the button again or Escape closes it and returns the focus to the button, and a tap outside the search closes it and leaves the focus where the tap put it, such as in a form field.
Opening the menu closes the search, and opening the search closes the menu.
A search the site opens itself stays open on a tap outside it, until the button or Escape closes it, even after the button opened an earlier one.
On a desktop window Tab follows the bar as it is drawn: the lockup, the links, the search, the social links, the theme switch, then Download.

## Search

A search field the site marks `nolSiteSearch` is drawn before the social links, or across the open phone search's width; without one, the tools keep to the end and a phone shows no search button.
