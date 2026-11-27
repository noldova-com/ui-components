# Site header

**Scope:** The kit's website header: its default geometry, the text roles it uses, its surface and behavior, its theme switch, and its phone menu.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

A website's start imports the header from the site entry, `@noldova/ui.components.angular/site`, or from its own, `@noldova/ui.components.angular/site/header`, never from the main entry, which doesn't export it; a start that never imports the main entry keeps the parts only a lazy page uses, such as the code block, out of it, and one that imports only the header's and footer's entries keeps out the site's hero, sections, cards and closing too, when the lazy pages import them from their own entries, as the kit's README, [Lazy pages](../../src/noldova.ui.components.angular/README.md#lazy-pages), says.

## Default geometry

Every site's header has one look, TeamRun's.
5.125rem high (`--nol-site-header-height`), its content 1rem from the top and bottom; the content keeps to 75rem (`--nol-site-content-width`), or 108rem on a documentation site (`--nol-site-content-width-wide`), centered, with 2.5rem insets outside it (`--nol-site-padding-inline`).
From the start: the lockup; the links' text centred between it and the actions, 2rem apart (`--nol-site-nav-gap`); then at the end the search, 16rem wide (`--nol-site-search-width`), the theme switch, the social links and the Download button, each 1.25rem from the part before (`--nol-site-actions-gap`).
When the header is at most 62.5rem wide, as on a tablet, the links are 1.125rem apart (`--nol-site-nav-gap-tablet`), the actions 0.75rem (`--nol-site-actions-gap-tablet`), and the social links leave the bar.
The lockup's wordmark is 0.8125rem high (`--nol-site-wordmark`) in the wordmark's proportions, its width reserved before the file loads from `wordmarkRatio`, the Noldova wordmark's by default and the file's own when a site passes its own, with the product's name 0.5rem after it and a version 0.375rem after that.
A site that passes its product's `icon` gets it before the wordmark, drawn in its own colors, 1.75rem square (`--nol-site-icon`) and 0.75rem from the wordmark, its box held before the file loads; with an `iconDark` too, dark mode draws that one in its place. The icon is decorative, so the link's name stays the product's home. The lockup never narrows below its icon and its wordmark, so a tight bar takes the space from the product's name; only on a phone, where a long wordmark doesn't fit beside the bar's controls, the wordmark narrows in its proportions, so the gap before the bar's next part holds.
A site that passes its product's own wordmark, such as TeamRun's or Commitline's, sets `wordmarkSize` to `SiteWordmarkSize.Large`: the wordmark is then as high as TeamRun's own header draws its wordmark, 9.125rem wide in its file's proportions (about 1.376rem high), 8.25rem in a header at most 47.5rem wide (about 1.244rem) and 7rem in one at most 22.5rem wide (about 1.056rem), and its box is that height in the proportions of `wordmarkRatio` wide, so TeamRun's comes out at exactly those widths.
Each link, and the version's, is at least the pointer target high, with no insets; each social link is a 2rem square (`--nol-site-theme-pill`) with a 1.125rem mark (`--nol-site-header-icon`).
The Download button is the kit's [button](button.md) with its edge, 2rem high (`--nol-site-download-height`), 0.875rem insets (`--nol-site-download-padding-inline`), its label 0.875rem on a 1.25rem line (`--nol-site-download-text`, `--nol-site-download-line`) at the emphasis weight, and its icon 0.5rem after the label, 1.25 times the label's size.

## Text roles

The product's name: 1rem on a 1.25rem line (`--nol-site-name-text`, `--nol-site-name-line`), at the emphasis weight, in `text-strong`.
Links: 8/7 of the message size (`--nol-site-nav-text`) on a line 1.6 times that (`--nol-site-line-height`), in `text`, the current page's in `text-strong` at the emphasis weight.
The social links: `text-strong`, their marks in `--nol-brand-mark`, pure black in light mode and pure white in dark, as GitHub's and X's terms allow their marks, hovered and focused too.
The version: small, in `text-muted`.

## Surface and behavior

The page's `banner` landmark, on the window color, with no border or line; it stays at the top of the page as it scrolls.
Once the page scrolls under it, the window color turns 92% opaque over a `saturate(180%) blur(1.25rem)` backdrop, so the page shows through, blurred, and every text, icon and focus ring on it keeps its contrast over black or white content in both modes; back at the top it is opaque again.
It stays opaque with its phone menu or search open, when the visitor asks for reduced transparency, and where the browser can't blur what is behind it.
It reads the page's own scroll, the document's.
It takes its width from the block it is in, such as the page's body, and lays itself out by that width, never by its content's.
The lockup is one link home named for the product's home, such as `TeamRun home`, or `Noldova home` without a product's name, or by the site's `homeLabel`, such as `UI Components docs home`; a site whose wordmark or icon already shows the product's name passes no `name`, so it isn't drawn twice, and names the link with `homeLabel`; the site passes the wordmark's file, which is drawn as a mask in `setting-title`, so the package ships no wordmark.
The current page's link is marked `aria-current="page"`; a hovered link is underlined in `text-strong`, with no fill, and keyboard focus is an accent outline just outside it.
Each social link is named by its label, which is also its native `title`, so the header loads no tooltip, and the site passes its icon's file, drawn as a mask, so the package ships no third-party logo.
With the content's id, a skip link to it comes first, shown at the header's start only while it has the focus.
Under forced colors the wordmark, the product's name and the social icons are `LinkText`, the current link is underlined, and keyboard focus is a 2px `Highlight` outline.

## Theme switch

Icon-only [choice pills](choice-pills.md) named Theme, offering Light, Dark and System in that order, on the raised color with the large radius and 0.1875rem padding (`--nol-site-theme-switch-padding`).
Each pill is 2rem square (`--nol-site-theme-pill`), with the medium radius and a 1.125rem glyph (`--nol-site-header-icon`) in `text-muted`; the chosen one sits on the panel color with a `0 1px 3px` widget shadow, its glyph in the accent color.
Where the pointer target is larger than the pill, each pill's box is the target, its face centred in it, so the boxes are the hit areas and never cover each other.
The switch is centred on the social links and the Download button, and stays in the bar on a phone.
A choice sets `data-nol-theme-mode` to `Light` or `Dark` on the root element, or removes it for System, and is saved in `localStorage` under `noldova-theme` as `light`, `dark` or `system`; with nothing saved, or a value it doesn't know, it follows the system.
It applies the saved choice once it renders, and a choice the browser refuses to save still applies to the page.
The component doesn't ship a head script: each site sets `data-nol-theme-mode` from `noldova-theme` the same way in a script in its own head, which runs before the page renders, so the page never shows the other theme first.
Prerendered, the switch checks no pill, since it can't read the saved choice; until the page hydrates it draws as chosen, with the chosen pill's own look, the pill `data-nol-theme-mode` names, or System when it names none.

## Phone menu

When the header is at most 47.5rem wide, as on a phone, it is 4.25rem high (`--nol-site-header-height-phone`), its content 0.75rem from the top and bottom, with 1.25rem insets (`--nol-site-padding-inline-phone`); the bar keeps the lockup, the theme switch, the Download button, a search button when the site gives a search, and a menu button at the end, 0.375rem apart (`--nol-site-actions-gap-phone`); on a documentation site the Download button moves into the menu.
There the Download button, the search button and the menu button each take taps at least a menu row tall and wide, drawn nowhere.
When the header is at most 30rem wide, the bar shows no Download button, and the open menu shows it under the social links, as on a documentation site.
So that the lockup keeps a product's whole name, as long as Commitline's with a version, the bar shows no theme switch when the header is at most 30rem wide, or under 37.5rem wide with the Download button in the bar, and the open menu shows it under the links instead.
The search button is 2.375rem square (`--nol-site-menu-button`) with the medium radius and a 1rem glyph (`--nol-site-menu-glyph`), named Search; it says whether the search is open and which element it controls, and shows the selected fill while it is open.
The menu button is 2.375rem square with the medium radius and a 1rem glyph (`--nol-site-menu-glyph`) in the `text` color, at the content's end; it is named Menu and says whether the menu is open and which element it controls, and while the menu is open it shows a close glyph on the selected fill.
The open menu shows, under the bar and across its width, ending 1.5rem above the header's bottom: the links as rows 2.75rem high (`--nol-site-menu-row`), in 1rem text (`--nol-site-menu-text`) and `text`, the current page's in `text-strong`; then, where the bar has no theme switch, 0.75rem under those, the theme switch at the content's start, its pills 2.75rem square and its glyphs 1.25rem (`--nol-site-menu-icon`); then the social links as rows of the same height, each its 1.25rem mark (`--nol-site-menu-icon`) and its label 0.5rem after it, in `text`; and, where the bar has no Download button, 0.75rem under those, the Download button across the width, its label 0.875rem (`--nol-site-menu-download-text`) and its icon 1.125rem (`--nol-site-download-glyph-phone`).
Opening the menu moves the focus to its first link, so Tab goes on through the menu in the order it is drawn; Escape closes the menu and returns the focus to its button; following a link in it closes it.
The search button opens the search under the bar, across its width and ending 1.5rem above the header's bottom, and moves the focus to its field; the button again or Escape closes it and returns the focus to the button, and a tap outside the search closes it and leaves the focus where the tap put it, such as in a form field.
Opening the menu closes the search, and opening the search closes the menu.
A search the site opens itself stays open on a tap outside it, until the button or Escape closes it, even after the button opened an earlier one.
On a desktop window Tab follows the bar as it is drawn: the lockup, the links, the search, the theme switch, the social links, then Download.

## Search

A search field the site marks `nolSiteSearch` is drawn after the links and before the theme switch, or across the open phone search's width; without one, the actions keep to the end and a phone shows no search button.
