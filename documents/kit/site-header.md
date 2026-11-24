# Site header

**Scope:** The kit's website header: its default geometry, the text roles it uses, its surface and behavior, its theme switch, and its phone menu.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

3.5rem high (`--nol-site-header-height`); the content keeps to 75rem (`--nol-site-content-width`), or 108rem on a documentation site (`--nol-site-content-width-wide`), centered, with 1.5rem insets (`--nol-site-padding-inline`).
From the start: the lockup, the links 1.5rem (the space-6 step) after it, then at the end the search, 16rem wide (`--nol-site-search-width`), the social links and the theme switch, 0.5rem apart, and the Download button, each part 1.5rem from the next.
The lockup's wordmark is 0.8125rem high (`--nol-site-wordmark`) in the wordmark's proportions, with the product's name 0.5rem after it and a version 0.5rem after that.
Each link is at least the pointer target high, with 0.5rem insets and 0.25rem gaps; each social link is an icon button target square with an icon-sized glyph.

## Text roles

The product's name: title, at the emphasis weight, in `text-strong`.
Links: panel, in `text-muted`, the current page's in `text-strong` at the emphasis weight.
The version: small, in `text-muted`.

## Surface and behavior

The page's `banner` landmark, on the window color, with no border or line; it stays at the top of the page as it scrolls.
The lockup is one link home named `Noldova` and the product's name, such as `Noldova TeamRun`; the site passes the wordmark's file, which is drawn as a mask in the text color, so the package ships no wordmark.
The current page's link is marked `aria-current="page"`; a hovered link takes the toolbar hover fill and `text-strong`, and keyboard focus is an accent outline inside it.
Each social link is named and tooltipped by its label, and the site passes its icon's file, drawn as a mask, so the package ships no third-party logo.
With the content's id, a skip link to it comes first, shown at the header's start only while it has the focus.
Under forced colors the wordmark, the product's name and the social icons are `LinkText`, the current link is underlined, and keyboard focus is a 2px `Highlight` outline.

## Theme switch

Icon-only [choice pills](choice-pills.md) named Theme, offering Light, Dark and System in that order, on the window color with a 0.125rem inset and the medium radius.
A choice sets `data-nol-theme-mode` to `Light` or `Dark` on the root element, or removes it for System, and is saved in `localStorage` under `noldova-theme` as `light`, `dark` or `system`; with nothing saved, or a value it doesn't know, it follows the system.
It applies the saved choice once it renders, and a choice the browser refuses to save still applies to the page.
A prerendered site sets the same attribute from the same key in a script in its head, so the page never shows the other theme first.

## Phone menu

Under 48rem the content takes 1rem insets (`--nol-site-padding-inline-phone`) and the bar keeps the lockup, the Download button and a menu button at the end, 0.5rem apart; on a documentation site the Download button moves into the menu.
The menu button is named Menu and says whether the menu is open and which element it controls; it shows a close glyph while the menu is open.
The open menu shows, under the bar and across its width: the search, the links as rows 2.75rem high (`--nol-site-menu-row`), the social links with the theme switch at the end, and on a documentation site the Download button.
Escape closes the menu and returns the focus to its button; following a link in it closes it.

## Search

A search field the site marks `nolSiteSearch` is drawn before the social links, or across the open phone menu's width; without one, the tools keep to the end.
