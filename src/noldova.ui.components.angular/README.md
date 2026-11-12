# @noldova/ui.components.angular

Noldova's interface kit: the design tokens, the fonts and the Angular components that Noldova's products build their interfaces from.
Its public API is everything the package exports through its entries: `@noldova/ui.components.angular`, `@noldova/ui.components.angular/code-highlighting`, `@noldova/ui.components.angular/code-highlighting/worker`, `@noldova/ui.components.angular/gallery` and `@noldova/ui.components.angular/testing`.
Its type declarations carry the documentation of every export and public member, which editors show on hover and in completions.

## What an app needs

- A bundler that runs the Angular linker, such as the Angular CLI's application builder.
  The package holds partially compiled Angular code, and the linker finishes it in the app's build.
- TypeScript's `moduleResolution` set to `"bundler"`, `"node16"` or `"nodenext"` in the app's `tsconfig.json`.
  The kit's JavaScript and type declarations name each of the kit's own files with `.js`, such as `../resources.js`, so Node.js's own ES module resolution loads the kit too: code tested without a bundler, such as with `node --test`, imports it once it has imported `@angular/compiler`, which finishes the partially compiled components as they load.
- A browser no older than Chrome 112, Edge 112, Safari 16.5 or Firefox 117.
- Angular at the exact version the kit names: `@angular/core`, `@angular/common`, `@angular/forms` and `@angular/platform-browser`, which are its peer dependencies, and `@angular/cdk`, a dependency of the kit at the same version.
  The kit doesn't import forms or platform-browser itself, but `@angular/cdk` needs both, and each needs `@angular/common` at its own exact version.
  Without them among the kit's peers, npm picks their newest versions, which need a newer `@angular/common` than the kit's, and the install stops with `ERESOLVE`.
  `@angular/cdk` is a dependency rather than a peer for the same reason: as a peer, npm resolved its own peers before the kit's other peers, so installing the kit alone stopped with that `ERESOLVE`; as a dependency, it's resolved after them, and they satisfy its peers.
  An app that installs `@angular/cdk` itself names the kit's exact version, so npm keeps one copy.
  With any other version, npm nests a second copy under the kit, beside the app's, without a warning or an error, even when the kit names it as a peer as well.
  The kit's overlays, focus handling and other services from `@angular/cdk` then run from its copy, and the app's from the other: each copy has its own overlay container, so the app's overlays and the kit's can stack in the wrong order, and focus traps and keyboard handling between them can disagree.
  `npm ls @angular/cdk` lists one copy when the versions match; an app checks it in its build, failing when it lists more than one.
- Angular's build tools at the kit's Angular version too, such as `npm install --save-dev @angular/build@22.2.6 @angular/cli@22.2.6`.
  Until 1.0 the kit names exact versions, its Angular peers included, but for its context peers below, and a new kit version moves them to Angular's newest patch.
  When Angular's newest is ahead of the kit's, adding the build tools stops with `ERESOLVE`, even at the kit's version: their optional peers, such as `@angular/service-worker`, `@angular/platform-server` and `@angular/ssr`, resolve to Angular's newest, which needs a newer `@angular/core` than the kit's.
  An app then waits for the kit version that moves to Angular's newest patch.
  A kit version is released only while its Angular is Angular's newest patch: its release adds the build tools at the kit's version to a fresh install of the kit, and stops when they don't resolve.
- Exactly one copy each of `@noldova/context.core` and `@noldova/context.exceptions`, within the ranges the kit names, from npm, `https://registry.npmjs.org`.
  They are the kit's peer dependencies, which npm installs beside it.
  Each is a range from the version the kit builds and tests with to the next minor, `>=0.0.2 <0.1.0` today; from 1.0 it ends at the next major.
  So an app moves to a newer context release within the range without waiting for a kit release, while a release that may break the kit, the next minor below 1.0, stays outside it.
  Each night the repository builds and tests the kit with the newest context release inside the range.
  A second copy of the core fails when it loads, since both install the same members on `Object` and `String`, and a second copy of the exceptions splits `instanceof` checks between the two.
  Loading the core a second time in the same JavaScript realm fails the same way, so a test runner that evaluates installed packages again in one realm, such as Jest's `resetModules` or `isolateModules` over `node_modules`, fails on it.

## Code highlighting

The code block, `CodeBlockComponent`, shows its code plain unless the app turns on highlighting.
An app that shows colored code adds `provideCodeHighlighting()` from `@noldova/ui.components.angular/code-highlighting` to its application's providers once.
The highlighter and each language's grammar then load on first use, each from its own lazy chunk of the app's build.
An app that never adds it ships neither the highlighter nor any grammar, even when it uses the code block.
The Gallery, `GalleryComponent` from `@noldova/ui.components.angular/gallery`, colors its code blocks without it, so an app that shows the Gallery ships the highlighter.

```ts
import { type ApplicationConfig } from "@angular/core";
import { provideCodeHighlighting } from "@noldova/ui.components.angular/code-highlighting";

export const appConfig: ApplicationConfig = {
  providers: [provideCodeHighlighting()]
};
```

The first block of a language in a window can hold up one frame while its grammar loads and compiles, which shows in a streaming reply.
An app that streams code names its common languages in `preload`, as `provideCodeHighlighting({ preload: ["ts", "json", "bash"] })`.
Once the app's injector is created, the highlighter and then each of them load one by one, a step per idle callback of the browser, or every 100 milliseconds where there is none.
A step still runs on the main thread, so input that arrives during one waits for it; a language not named still loads on first use, as before.
The step that compiles a grammar, by tokenizing a short sample, still holds up one frame, since a grammar's first use costs far more than any later one: 150 milliseconds or more for TypeScript's, measured on Linux, of which the sample's first line alone takes 110 to 167, so no split of the sample brings each part under 34 milliseconds.
An app whose page must keep every frame short provides a highlighting worker, as below: `preload` then loads and compiles each grammar in the worker, and the page holds no frame for it while the worker runs.

An app can move the highlighting off the main thread into a worker of its own.
Its worker file calls `serveCodeHighlighting(self)` from `@noldova/ui.components.angular/code-highlighting/worker`, and the app adds `provideCodeHighlightingWorker` beside `provideCodeHighlighting()`, with a function that starts that file.
The `new Worker(new URL(...), { type: "module" })` call is in the app's own code, since Angular's application build bundles a worker only from there.

```ts
import { type ApplicationConfig } from "@angular/core";
import { provideCodeHighlighting, provideCodeHighlightingWorker } from "@noldova/ui.components.angular/code-highlighting";

export const appConfig: ApplicationConfig = {
  providers: [
    provideCodeHighlighting({ preload: ["ts", "json", "bash"] }),
    provideCodeHighlightingWorker(() => new Worker(new URL("./code-highlighting.worker", import.meta.url), { type: "module" }))
  ]
};
```

```ts
// code-highlighting.worker.ts
import { serveCodeHighlighting } from "@noldova/ui.components.angular/code-highlighting/worker";

serveCodeHighlighting(self);
```

The worker starts at the first code to color, or at the first idle callback for `preload`, and loads, compiles and tokenizes each grammar there; the page keeps the tokens and draws the colors.
Code that has no kept tokens shows plain until the worker answers, even in a language the worker has loaded, and code that grows, as a reply streams in, keeps the colors of the code it grew from until then.
The worker file holds every grammar the kit knows, about 1.8 MB before compression, because Angular's build leaves out the chunks a worker's lazy imports share; only the worker loads it.
A worker that can't start, fails, or says nothing within 10 seconds of its start is stopped and reported once to the app's `ErrorHandler` as a `CodeHighlightingException`, whose `cause` is the error the start threw, if it threw, and the page highlights from then on, as without one.
A grammar the worker fails to load is reported once, as a `CodeHighlightingException` whose `cause` is a clone of the worker's error, with its message and stack, and its code stays plain for 10 seconds, as on the page.

## Markdown

The message, `MessageComponent`, shows its text plain, as it was written, with its Markdown marks, unless the app turns on Markdown.
An app that shows messages adds `provideMarkdown()` from `@noldova/ui.components.angular/markdown` to its application's providers once.
The parser, `markdown-it`, then loads on first use, from its own lazy chunk of the app's build, and text shows plain until it has loaded.
An app that never adds it ships no Markdown parser, even when it uses the message.
An app that lays out its own message from the kit's parts draws its text with the markdown view, `MarkdownViewComponent` (`nol-markdown-view`) from the same entry point, which draws Markdown as the message does and takes the same provider.
The Gallery, `GalleryComponent` from `@noldova/ui.components.angular/gallery`, draws its messages' Markdown without it, so an app that shows the Gallery ships the parser.

```ts
import { type ApplicationConfig } from "@angular/core";
import { provideMarkdown } from "@noldova/ui.components.angular/markdown";

export const appConfig: ApplicationConfig = {
  providers: [provideMarkdown()]
};
```

## Time formats

The message, `MessageComponent`, and the permission card, `PermissionCardComponent`, write their times in the app's locale, and a message on a 24-hour clock with `twentyFourHour`.
An app that writes times in its own formats, such as a pattern its settings hold, gives the kit those formats with `provideTimeFormats` in its application's providers, so every message and card writes its times as the app's other panels do.
Its function runs once, in an injection context, and returns a signal of `TimeFormats`: `clock` writes the time of day, a message's time with the clock format and a card's decided time today, and `full` writes the date with the time of day, a message's tooltip and name and a card's decided time on an earlier day.
A new value redraws every message and card already shown.
Without the provider, or for a format that is null, the kit writes the time as it does without it; a message's relative time, such as 2 minutes ago, is always the kit's own.

```ts
import { type ApplicationConfig, Injectable, type Signal, computed, inject, signal } from "@angular/core";
import { TimeFormats, provideTimeFormats } from "@noldova/ui.components.angular";

@Injectable({ providedIn: "root" })
export class Settings {
  public readonly twentyFourHour = signal(true);
}

function formatsOf(isTwentyFourHour: boolean): TimeFormats {
  const clock = new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit", hour12: !isTwentyFourHour });
  const full = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", hour12: !isTwentyFourHour });
  return new TimeFormats(t => clock.format(t), t => full.format(t));
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideTimeFormats((): Signal<TimeFormats> => {
      const settings = inject(Settings);
      return computed(() => formatsOf(settings.twentyFourHour()));
    })
  ]
};
```

## Testing

`@noldova/ui.components.angular/testing` holds the helpers the kit's own tests use, for an app's tests that run in a browser through Vitest.
Only this entry uses Vitest, so an app's bundle never takes it.
A product that uses this entry brings its own Vitest, at the version the kit tests with, 5.0.5.
The kit doesn't list Vitest as a peer dependency, because GitHub's npm registry drops `peerDependenciesMeta`, so an optional peer would become a required one in each product's lockfile.
Each helper's type declarations document it.

- `kitTestProviders`: the providers a component test starts from, with an error handler that rethrows and a clipboard double.
- `AppearanceFixture`: paints the document with a theme, a mode and a panel text size, and measures and compares what the kit paints.
- `FixtureTheme`: a complete second theme whose every value differs from the default theme's.
- `BrowserMatchersFixture`: checks in a setup file that Vitest's browser matchers loaded, and says why when they didn't.
- `KitStylesheetFixture`: loads the kit's stylesheet into the test page in a setup file and waits for its fonts; a face that fails to load fails it with the face, its source URL and the server's answer.
- `MarkdownFixture`: loads the kit's Markdown parser into the test page in a setup file, so the first spec that shows Markdown doesn't wait for its import.
- `CodeHighlightingFixture`: for tests only, a provider, `sharedShiki`, that gives every `TestBed` of a test file one Shiki, so each grammar a code highlighter loads or preloads compiles once in the file, not in every test; and `isLanguageLoaded(injector, name)`, which tells whether the highlighter the injector's `provideCodeHighlighting` sets up has loaded a language, by any name or alias a code block takes, without loading anything, so a spec can check what it preloads.
- `PointerFixture`: hovers an element with the real pointer, finding it by a test id, which costs the same on a page of any size; hovering the element itself makes Vitest build a selector for it from the page around it, which takes seconds on a page as large as the Gallery.
- `ClipboardWriterFixture` and `ThrowingErrorHandler`: the clipboard double and the error handler that `kitTestProviders` provides.

## Themes

A theme gives the colors of its light and dark modes, its look values and the shapes of its controls, and the kit paints them as CSS custom properties.

- Every key is the name of the CSS custom property it paints without `--nol-`: the color key `panel` paints `--nol-panel`, and the look key `radius-small` paints `--nol-radius-small`.
- Keys have no other prefix and no aliases, and no key is both a color key and a look key.
- A color may fall back to one other color's key, read one level deep, when a theme leaves it out.
- A value the theme still lacks comes from the default theme.

## License

The kit is licensed under the MIT License; the fonts, icons and libraries it includes or depends on keep their own licenses, which [the repository's README](https://github.com/noldova-com/ui-components#license) lists.
