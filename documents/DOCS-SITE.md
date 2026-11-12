# The docs site

**Scope:** The docs site's commands, its generated sources, the rules its pages keep, its theme switch and what it leaves to hosting.

The docs site shows each component of `@noldova/ui.components.angular` with its description, live examples and their code, its states and its API.
It is an Angular app in `src/noldova.ui.components.angular.docs`, built against the kit's source, never published as a package, and drawn only with the kit's own components, tokens, fonts and icons, apart from the header's GitHub and X marks, the site's own drawing in its own `--nol-docs-brand-mark` color, #000000 in the Light mode and #FFFFFF in the Dark one.

## Commands

| Command | What it does |
|---|---|
| `npm run docs:api -w src/noldova.ui.components.angular.docs` | Writes the API reference alone. |
| `npm run docs:build -w src/noldova.ui.components.angular.docs` | Writes the generated sources, then prerenders every page into `_build/docs`. |
| `npm run docs:test -w src/noldova.ui.components.angular.docs` | Writes the generated sources, then runs the site's tests in Chromium, held to 100% coverage of `src/` without the files the README's coverage table names, and fails when a spec file reports no result or a function, statement or branch goes unreached. It then serves the site `npm run docs:build` wrote to `_build/docs/browser`, which must run first, opens each page the menu links in Chromium, and fails when a page or a favicon the page links isn't served, a favicon's type isn't an image, its one h1 isn't its menu title, a component page shows no example or an empty one, an example's code shows no highlighted token, a table, the docs' own or a Markdown one, breaks a word across lines or wraps a name, a key name or a type but before a `|`, at 1280 or 375px wide, or the browser logs an error, as a failed hydration does. |

Each needs `npm run build:components` first, since it builds with the kit that build installs at the root; the root's `npm run build:docs` runs only this package's `docs:build`, which fails with a line saying to run `npm run build:components` first when the kit isn't built, and the root's `npm run build` runs `npm run build:components` then `npm run build:docs`; the API reference is read from the kit's declarations, `src/noldova.ui.components.angular/src/api/*.d.ts`, and its source.
The docs package's own `test`, which an unfiltered `npm test` runs after the kit's, builds and tests the site on Linux, so the CI run, which calls it, checks the site on its Linux targets; on other platforms, and in a filtered run, it leaves them out.
The commands' scripts are in the package's `scripts/`, and its Angular workspace is its own `angular.json`.

## Generated sources

The folder `_build/docs-generated` is written by every docs command, emptied first so that a warm build writes what a clean one does, and is never edited by hand; nothing is written under the docs app's `src/`.
The docs app imports its modules by the path alias `@docs-generated/*`, which the docs package's `tsconfig.json` maps to that folder, and they sit outside the coverage the README's table measures, since only `src/` is counted.

| File | What writes it |
|---|---|
| `api-reference.ts` | `scripts/docs/docs-api-generator.ts`, in the docs package, through the TypeScript API server that the API checks use: for each component class each entry point declares, its selector and its inputs, model inputs and outputs, with their types, defaults, whether they are required and their JSDoc, in which a `{@link}` without its own text becomes the target's name as inline code. It adds the inputs and outputs that the component's `hostDirectives` expose from a directive the same entry point declares, under the names the component gives them and marked with that directive, unless the component has its own of that name; a directive from another package is not followed. |
| `examples/<example>.ts` | `scripts/docs/docs-source-generator.ts`, from each `src/app/components/*-example/` folder: the template, class and stylesheet the page shows under the example, without the license header. |
| `documents/<component>.ts` | The same, from `documents/kit/<component>.md`, without its title and with its relative links pointing at the repository. |
| `index-page.ts` | The same, from `src/index.html`, so that the tests check the page shell's mode script. |
| `kit-base-styles.ts` | The same, from the kit's `src/styles/base.css`, without its license header, so that the theme tokens page lists the tokens it declares. |

## Pages

- Every page's header shows the Noldova wordmark, drawn in the text's color and named "Noldova", then "UI Components", linking to the site's root; then the search, the theme switch and links to the kit's GitHub repository and to Noldova on X, which open in the same tab.
  Each of the two links shows only its brand's mark, black in the Light look and white in the Dark one, and the link color under forced colors; it is named "GitHub" or "X", with that name as its tooltip.
  The wordmark, `assets/noldova-wordmark.svg`, and the favicons, the Noldova "N" as `favicon.svg` with `favicon-32.png` and the 180px `apple-touch-icon.png`, are in `src/noldova.ui.components.angular.docs/public`, which the build copies to the site's root.
  The wordmark and the favicons are Noldova's trademarks, not under the MIT License, as the README's [Trademarks](../README.md#trademarks) says.
  The two marks are drawn inline by `src/app/components/docs-brand-mark`, their paths unchanged from their sources:
  - The GitHub mark is `icons/mark-github-16.svg` of Primer Octicons at `@primer/octicons@19.42.0` (commit `9a274e212ee25c400ff666ce25a57866b7eacc25`), https://github.com/primer/octicons, under the MIT license, whose text the site serves as `assets/licenses/OCTICONS-LICENSE.txt`; the source file's SHA-256 is `7421820090b50ac79d7c2bf7c951a433d7098a8a9c474809207bdd45f62d9d46`. GitHub is a trademark of GitHub, Inc.
  - The X logo is `logo.svg` from `x-logo.zip` on X's brand toolkit, https://about.x.com/en/who-we-are/brand-toolkit, used under X's Trademark Guidelines; its fill, white in the file, is black or white, the two colors the toolkit ships it in, and it links only to Noldova's X account; the source file's SHA-256 is `10133d36ecdb84d3cd6f36c6727e826340e3621cd8408503c710c5fab62defde`. X is a trademark of X Corp.
- The site's own text, its pages, menu, search and "On this page" list, is 14px: `src/styles.css` scales, on the shell's `nol-docs-root` class, the kit's text sizes, their line heights, its spaces and the heights of the fields, pills, section headers and code headers the site draws by 14 / 13, as a larger panel size would, from copies of the kit's values that it keeps on the root as `--nol-docs-kit-*`.
  An example's preview and a page's states keep the kit's own values, so they show the components as apps draw them.
- Below the header, the menu, the page and the "On this page" list together are at most 108rem wide, centered in the window, and from 75rem wide 3.5rem in from the window's sides; the page fills the space between the menu and the list.
- Getting started is the site's root, and the theme tokens page lives at `tokens/`; both stand in the menu ahead of the component groups.
- A component page lives at `components/<name>/`, and every address ends in `/`.
- The header stays at the top of the window while the page scrolls, at every width and in every look, in front of the page and filled, so nothing shows through it; the shell keeps `--nol-docs-header-height` at its height on the root, whose `scroll-padding-block-start` it sets, so a heading reached by a link or an address's anchor lands just below it.
- From 48rem wide the menu stands beside the page. Below that width it is closed behind a "Menu" button at the start of the header, which says with `aria-expanded` whether it is open, so the page's content comes first.
  Beside the page, and open on a phone wherever the page is scrolled, it stays right below the header while the page scrolls, in front of the page; either way, taller than the window, it scrolls on its own, its height the window's dynamic height (`dvh`) less the header's, so a mobile browser's toolbar never hides its end. The button opens and closes it, Escape closes it and puts the focus back on the button, and choosing a page closes it and moves the focus to that page's heading.
  The menu marks the current page's link with `aria-current="page"` and the selected fill; under forced colors that fill is `Highlight` with the link's text in `HighlightText`, kept on hover, and a focus ring on it is `HighlightText`, at every width, the phone menu too.
- An API, accessibility or tokens table whose columns, holding names that never break, are wider than its section stacks each row, as `src/app/components/docs-fit-table` measures again whenever the section changes size, so one page can show one table in columns and stack another: the name, the type and the default on one line, the type and default labelled, and the description below at the table's full width; the column headings stay for screen readers only.
- From 75rem wide, an "On this page" list stands to the right of every page, below the header while the page scrolls and scrolling on its own when taller than the window, a navigation landmark named by its label, and is hidden below that width, where the page keeps the whole width.
  It lists the page's own section, subsection and example titles in order, never the headings the kit's components render in an example, a Gallery specimen or a dialog, and gives each heading without an id one from its text.
  A link scrolls its heading to just below the header and puts its id in the address; an address with an id lands on that heading and holds it there while the page above it loads or changes size, until the reader scrolls, presses a key or touches the page.
  The list marks, with `aria-current="location"`, the last heading at or above the header's bottom, or at the page's end the last heading in view.
- Every component the package exports has a page or is listed in `DocsCatalog.excludedComponents`, and a test fails otherwise. That list holds the components the maintainers decided the site leaves out: the agent and editor views (tool call, permission card, diff view, docking, plan) and the Gallery, which is the kit's own look harness; a page for one of them comes only with a new decision, and takes it off the list.
- An example is a standalone component in its own `*-example` folder, so the code under it is the code that runs.
  An example that opens a component of its own, such as a dialog's content, keeps that component in a `*-example` folder too, and the page shows its code after the example's.
- Every component page is the one `ComponentPageComponent`, drawn from its content, a `DocsComponentPage` in `src/app/models/pages/<name>-page.ts` with its text in `<name>-page.resources.ts` beside it: its examples, the Gallery's section component that shows its states, its kit document, and the keys and roles its accessibility section names; a page with no keys says so in place of the keys table.
  Its route hands the content to the page as the `page` input, through the router's component input binding.
- A page's states are the Gallery's own specimen of the component, taken out of the Gallery's section into a section component of its own that the section renders in its place.
- The theme tokens page lists every token the kit defines, each once, in tables by group, with its CSS custom property and its value in the default theme's Light and Dark modes, and a swatch for each color; stacked, each value is labelled with its mode, or with both where the modes share it.
  It reads the values from the kit's sources, never a copy: the color tokens and the theme's look from `Resources.colorTokens`, `Resources.lookTokens` and `DefaultTheme`, and the text roles, fonts and tokens built from other tokens from the generated copy of `base.css`.
  Its spec compares the page with the tokens the loaded stylesheets declare on the root and with those sources.
- The site adds the kit's `provideCodeHighlighting()`, so every example's code is colored, shows the API's descriptions through the kit's Markdown view, so their inline code reads as code, and shows a component's selector and import in the kit's inline code.
- Every table, the API, accessibility and tokens tables alike, takes the kit's Markdown table look: lines around every cell, start-aligned cells, names, key names, code in a Markdown table and each part of a union type kept on one line, a type breaking only before a `|`, and columns as wide as their longest word, so a table too wide for the page would scroll sideways in its holder rather than break a word. No table on the site does: an API, accessibility or tokens table stacks where it doesn't fit, and a Markdown table keeps every column but the last on one line from 48rem wide, and on a phone lets its columns wrap between words.
- The page's spec says, for every component page, which specimen, controls, roles and attributes its examples render, which keys it names and which inputs and outputs its API lists, and fails for a page it says nothing of.

## Theme

The theme switch keeps the reader's choice, `Light` or `Dark`, under the browser storage key `nol-docs-theme`, and `System` removes it.
A script in the page shell's head sets `data-nol-theme-mode` from that key before the first paint.

## Hosting

The build writes static files only.
On each push to `main`, the "Docs" workflow, `.github/workflows/docs.yml`, calls the organization's shared docs image workflow, which the `.github` repository's README describes under "Building a docs image", pinned to a full commit SHA: it runs `npm ci` and `npm run build`, which builds the kit and then the docs site, on the organization's Linux runner, and pushes `_build/docs/browser` as the nginx image `ghcr.io/noldova-com/ui-components-angular-docs`, tagged with the commit's full hash, with its digest in the run's summary.
The same workflow then moves the image's `latest` label to it, and the "Deploy" workflow moves `staging` or `production`, as the [README](../README.md#deploying-the-docs-site) says; which label each environment serves is decided outside this repository.
No page carries a `robots` meta tag, so search engines may index the site wherever it is served.
