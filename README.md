# UI Components for Angular

[![Build and test](https://github.com/noldova-com/ui-components/actions/workflows/build-and-test.yml/badge.svg?branch=main)](https://github.com/noldova-com/ui-components/actions/workflows/build-and-test.yml)
[![npm](https://badgen.net/npm/v/@noldova/ui.components.angular)](https://www.npmjs.com/package/@noldova/ui.components.angular)
[![License: MIT](https://badgen.net/static/license/MIT/blue)](LICENSE)

**Noldova's interface kit for Angular: design tokens, fonts, icons and components.**

It holds the design tokens (colors, text roles, spacing, radii and component metrics), the fonts and icons, and the Angular components that Noldova's products build their interfaces from.
The package is at `0.0.x` for now, and its API may change from one version to the next.

## Getting started

```bash
npm install @noldova/ui.components.angular
```

The kit's peers, Angular and RxJS, install at the exact versions it names, and its two CONTEXT packages within the range it names, from the version it builds and tests with to the next minor, as [the package's README](src/noldova.ui.components.angular/README.md) says.
[The package's README](src/noldova.ui.components.angular/README.md) says what an app needs and how to use code highlighting, Markdown, time formats, themes and the testing helpers; its type declarations document every export.

To report a bug or ask for a change, open an issue in this repository, as the organization's [contributing guide](https://github.com/noldova-com/.github/blob/main/CONTRIBUTING.md) says.
Report a security problem privately, as its [security policy](https://github.com/noldova-com/.github/blob/main/SECURITY.md) says.

## How it's built

- **Every file fully covered.** A full test run fails unless the kit's production code is fully covered, as [Coverage](#coverage) says.
- **Six targets.** Each change is built and tested on Linux, Windows and macOS, on x64 and arm64.
- **Reproducible.** A second build of the same commit packs a byte-identical archive.
- **Published from `main`** by the release workflow, with npm provenance, so each version names the commit it was built from.
- **Documented.** The kit's declarations document its whole public API.

## Build and test

The toolchain is Node.js 24.21.0 with npm 11.19.0, as `package.json` pins them.
The repository is one npm workspace: the root's `package.json` names the packages in `src/` as its workspaces and holds only TypeScript, the version Angular supports, which compiles the kit and checks each package's `scripts/`, and Node.js's types; each package's own `package.json` names what it uses, and the root's one `package-lock.json` holds every package the repository installs.
Each Angular package is its own Angular workspace: the kit's `src/noldova.ui.components.angular/` holds its `angular.json`, `tsconfig.json`, `tsconfig.spec.json` and `vitest.config.mts`, and the docs site's `src/noldova.ui.components.angular.docs/` its `angular.json` and `tsconfig.json`, which extends the kit's and runs its tests with the kit's `vitest.config.mts`; the kit's `tsconfig.json` and `scripts/tsconfig.json` extend the root's `tsconfig-base.json`; everything the kit's tests use is in its `tests/`, with the coverage plugin in `tests/coverage/` and the build's fixtures in `tests/fixtures/kit-bundles/` and `tests/fixtures/node-load/`, which the specs' compile leaves out.

```bash
npm run build:components
```

```bash
npm run build:docs
```

```bash
npm test
```

`npm run build:components` builds every components package, the kit today, `npm run build:docs` builds every docs site, the kit's docs site today, and `npm run build` builds everything, running `npm run build:components` then `npm run build:docs`.
`npm run build` passes what follows `--` to `npm run build:components` alone, and with anything after `--` it runs no `npm run build:docs`, since each option the kit's build takes builds nothing; so `npm run build --silent -- --list-copies` prints the kit's list below.
`npm run build:docs` builds no kit: a docs site builds from the kit `npm run build:components` installs at the root, and fails with a line saying to run `npm run build:components` first when it isn't built.
The kit's build builds it each time: it compiles it, packs it into `_packages/` as `noldova-ui.components.angular-<version>.tgz`, at the version `version.json` holds, and installs the archive at the root without saving it.
It installs the npm packages first when `node_modules` is missing, and the browser for the Angular tests.
Each archive's `package.json` records the commit it was built from as `gitHead` when the clone has no changed tracked files and no untracked files that Git doesn't ignore, and leaves it out otherwise.
The kit's build also refuses an entry other than the testing entry that reaches `src/testing/` or Vitest.
`npm run docs:build -w src/noldova.ui.components.angular.docs` builds the docs site into `_build/docs` from the kit's source, `npm run docs:test -w src/noldova.ui.components.angular.docs` runs its tests, and `npm run docs:api -w src/noldova.ui.components.angular.docs` writes only its API reference; all three need `npm run build:components` first, as [the docs site](documents/DOCS-SITE.md) says.
At the root, `npm run test:docs` runs the docs site's tests as `npm run docs:test` does, on any platform, after `npm run build`.
`npm run build:components --silent -- --list-copies`, or `npm run build --silent -- --list-copies`, builds nothing and prints each file the build copies into the kit from outside its package, one per line, with tabs between its source, the package's name and its path inside the package, and then `end of copies`.
`npm run build:components --silent -- --inputs` builds nothing and prints each folder outside the package that the kit's stylesheets load files from, one per line.
Before it builds, the build checks the kit's `package.json`: its name, the version `__VERSION__`, its dependencies, development dependencies and peers as objects, every dependency pinned, any CONTEXT dependency at an exact version, and each CONTEXT peer at `>=<its exact development dependency> <the next minor>`, or the next major from 1.0, such as `>=0.0.2 <0.1.0`.

The build loads the installed kit in Node.js without a bundler, after `@angular/compiler`, which partially compiled components need when they load unbuilt, and type-checks it with NodeNext resolution and `skipLibCheck` off, from `src/noldova.ui.components.angular/tests/fixtures/node-load/`.
It loads every entry but the testing entry, which imports Vitest and so loads only inside its test runner; that entry's declarations are type-checked.
The build also resolves two fresh installs of the packed kit, each in an empty project: one with only the peers the kit names at their versions, each CONTEXT range at its lowest, and one of the kit alone, which leaves npm to pick its peers.
Each fails when npm can't resolve it or finds any peer conflict, since it resolves with `--strict-peer-deps`.
A release's build, which the shared release workflow runs with `RELEASE_ADDONS` set, then adds Angular's build tools, `@angular/build`, at the kit's Angular version to the one alone, as a new app does after it installs the kit, and fails when npm can't resolve that; any other build, such as a pull request's or main's, skips that step and says so.
That step resolves as an app's own install does, without `--strict-peer-deps`, since the build tools' own optional packages conflict under strict peers: `@angular/build` 22.2.5's `@oxc-parser/binding-wasm32-wasi` 0.150.0 pins `@emnapi/core` 2.0.0-alpha.3, which its `@napi-rs/wasm-runtime` doesn't accept as a peer.
The step catches Angular's newest patch running ahead of the kit's: `@angular/build`'s optional peers, such as `@angular/service-worker`, `@angular/platform-server` and `@angular/ssr`, resolve to their newest, which need that newer `@angular/core`, so even the build tools at the kit's version stop with `ERESOLVE`, as they did with the kit at 22.2.1 once Angular's newest was 22.2.5.
Each Angular patch then stops a release at this step, before its approval, until a kit version moves the kit's Angular to it; pull requests and main don't run it, so it blocks no other merge.
A new release of a package the kit's peers pull in can turn these steps red with no change here; the fix is a peer, a dependency or a pin in the kit's `package.json`, not a rerun.
It then compares the installed kit's declarations and API documentation with its source, and checks the types of each package's `scripts/`.
Those comparisons, and the kit's own build, which carries the documentation onto the declarations the Angular compiler writes, read the kit's source through TypeScript's compiler API in the same process, from `src/noldova.ui.components.angular/scripts/api/`.

`npm test` runs every test past the others' failures: the nativeElement assertions check, the OnPush strategies check, on Linux x64 only the Kit bundles, the Kit copies and the Kit manifest, and the kit's Angular specs, which must each report a result, with no test identity, the spec file and the titles of its suites and test, repeated, then, on Linux only, builds the docs site and tests it, as `npm run docs:build` and `npm run docs:test` do, so the CI run, which calls `npm test`, checks the docs site on its Linux targets, as the static site it serves is the same on every platform.
`npm test -- <filter>...` runs only the spec files whose path from the repository root holds a filter, without the coverage gates, the nativeElement assertions check, the OnPush strategies check, the Kit bundles, the Kit copies, the Kit manifest and the docs site, and fails when nothing matches.
The root's `npm run build:components` and `npm test` run each workspace's own `build` and `test`, and `npm run build:docs` each workspace's own `docs:build`, passing on what follows `--`; each package's scripts run from its own folder, with paths relative to it, and write to the root's `_build/` and `_packages/`.
The kit's entry points are `src/noldova.ui.components.angular/scripts/build.ts` and `src/noldova.ui.components.angular/scripts/test.ts`, and the docs site's are in `src/noldova.ui.components.angular.docs/scripts/`.
The CI run passes two options, which the organization's shared workflow gives every repository:

```bash
npm test -- --skip-test-details --skip-coverage-details
```

The kit's test script accepts both without changing its output, and refuses every other option.

## Checks

Every pull request into `main` must pass both checks before it merges.
A pull request adds no lines to [CHANGELOG.md](CHANGELOG.md), since each version's section is written when the version is released, as [Releases](#releases) says.

| Check | What it verifies |
|---|---|
| Check / Linked issue | `.github/workflows/require-linked-issue.yml`, the "PR" workflow: the PR description has a standalone `Issue: #N`, `Issue #N` or closing reference, such as `Closes #N`, that names an issue in this repository. |
| Check / Runner / Versions | The shared check's own call of the shared settings, which name the runner "Check / Linked issue" uses. |
| Build and test / Versions / Versions | The organization's shared settings, `.github`'s `versions.yml`, name the Node.js and npm versions and the runner for each target that "Build and test" uses. |
| Build and test / Linux x64, Linux arm64, Windows x64, Windows arm64, macOS x64, macOS arm64 | One job per target of `.github`'s shared `build-and-test.yml`, each on the GitHub-hosted runner the shared settings name for it: `npm run build` builds, packs and installs the kit, then builds the docs site; the toolchain is the Node.js and npm versions the shared settings name, Node.js 24.21.0 with npm 11.19.0 today; `.gitattributes` holds `* text=auto eol=lf`, and every tracked text file uses LF line endings and ends with exactly one newline; `npm test` runs the whole suite, and the build and the tests leave every tracked file unchanged; a second build of the commit, in another folder, packs a byte-identical archive; and the archive passes the release's own check at the version `version.json` holds. |
| Build and test / All targets | All six targets' jobs passed, and the shared settings named the versions and a runner for each target; it reports even when a job before it failed or was skipped, so `main` can require it. |

### Coverage

`npm test` measures the kit's coverage and `npm run docs:test` the docs site's, and each fails below this requirement.
After every unfiltered run whose specs all pass, it names each function, statement and branch the specs never reached, by file, line and column, from the per-file report `_build/angular-coverage/coverage-final.json`, so a run that misses the requirement says what it missed; a spec that fails leaves no report, and a report it can't read is named in one line, with the result left to the thresholds.
The repository's automation, in each package's `scripts/`, has no coverage requirement: the build and the test run prove it, as the organization's testing standard says.

| Scope | Requirement |
|---|---|
| `src/noldova.ui.components.angular` | 100% of executable production code, measured by the component and service specs through the Angular unit-test builder, without the enum files and class-metadata calls that the Angular standard leaves out; the coverage plugin under `src/noldova.ui.components.angular/tests/coverage` marks those calls and reports how many it skipped. |
| `src/noldova.ui.components.angular.docs` | 100% of executable production code, measured by the docs site's specs the same way, without its enum files and class-metadata calls and its entry points and server settings, `main.ts`, `main.server.ts`, `app.config.server.ts` and `app.routes.server.ts`, which run only in the browser's start and the prerender; the built-site check in `npm run docs:test` opens every page they produce. |

### OnPush strategies

Since Angular 22, a component without a `changeDetection` uses the OnPush strategy, so a component, an example or a spec here never writes `changeDetection: ChangeDetectionStrategy.OnPush`; it writes a strategy only to choose `Eager`, with the reason.
The OnPush strategies check, `src/noldova.ui.components.angular/scripts/checks/on-push-check.ts`, reads every TypeScript file, `.ts` and `.mts`, that git tracks under `src`, and fails on each `changeDetection` key whose value isn't `ChangeDetectionStrategy.Eager`, however its line is split, naming the file and line.

### nativeElement assertions

A component fixture's `nativeElement` is typed `any`, so a spec reads its host through `DomFixture.host(fixture)`, in `src/noldova.ui.components.angular/tests/fixtures/dom.fixture.ts`, which narrows it with `instanceof HTMLElement` and throws when the host is anything else.
The nativeElement assertions check, `src/noldova.ui.components.angular/scripts/checks/native-element-assertion-check.ts`, reads every TypeScript file under `src/noldova.ui.components.angular/tests` and fails on each line that takes `nativeElement` as a type unchecked, naming the file and line.
It refuses an assertion, `… .nativeElement as HTMLElement` or `<HTMLElement>….nativeElement`, and an expression that ends in `.nativeElement`, through members, calls and indexes such as `fixture.debugElement.query(By.css("button")).nativeElement` or `children[0].nativeElement`, when it is read into a declaration, a parameter's default or a typed arrow that names a type other than `unknown`, returned, or assigned to a variable or property declared before.
It refuses as well an assertion of a query's result, `….querySelector(…) as HTMLElement` on any root, after a non-null `!`, and in a spread or an array too, such as `[...row.querySelectorAll(…)] as HTMLElement[]`, a tuple or `[row.querySelector(…), other] as HTMLElement[]`, though not when an item after the query holds brackets, as `[row.querySelector(…), items[0]]` does, and a query under `nativeElement`, such as `fixture.nativeElement.querySelector(…)` or `[...fixture.nativeElement.querySelectorAll(…)]`, read into a typed declaration or arrow or returned, and an angle-bracket assertion of a query on any root, `(<HTMLElement>row.querySelector(…))`.
The typed generic, `querySelector<HTMLElement>(…)`, stays allowed.
A spec reads such an element through the same fixture instead: `DomFixture.one(root, selector)` and `DomFixture.oneOf(root, selector, HTMLInputElement)` return the first match checked with `instanceof` and throw when nothing matches or the match is of another class, `DomFixture.maybe` returns `null` where nothing matches for a spec that expects the element absent, `DomFixture.all` and `allOf` check every match, and `DomFixture.present` checks that an element a spec found in a list is there.
It reads one line at a time: it refuses an assertion that a line break splits from its expression, a line that starts with `as HTMLElement`, `] as HTMLElement[]` or `as [HTMLElement, HTMLElement]`, or a code line that ends in `as`, but a read that a line break splits after its `=` passes, as does an untyped `nativeElement` passed to a typed parameter.

### Kit bundles

The Kit bundles check builds eight small apps against the packed kit, with production settings, and reads which modules each chunk of the build holds.
It runs on Linux x64 only, as the Kit copies and the Kit manifest checks do, since the release builds, packs and publishes the kit on Linux x64 (`.github`'s shared `release-npm.yml`), and the other targets' CI jobs are the longer ones; elsewhere `npm test` says it skipped all three.
The apps are in `src/noldova.ui.components.angular/tests/fixtures/kit-bundles/`, each with its own TypeScript configuration there and its project in the kit's `angular.json`, and they resolve `@noldova/ui.components.angular` to the installed package instead of its source.

| App | What its build must show |
|---|---|
| `bundle-typography`, which takes only the typography | No initial chunk holds the code highlighter, and no chunk holds its library or a grammar. |
| `bundle-code-block`, which shows a code block without highlighting | The same. |
| `bundle-highlighted-code-block`, which adds `provideCodeHighlighting()` | No initial chunk holds the highlighter's library, and the grammars come in lazy chunks. |
| `bundle-highlighting-worker`, which adds `provideCodeHighlightingWorker` with a worker file that calls `serveCodeHighlighting` | The same, and a chunk built from the worker file holds every grammar the page's lazy chunks hold and imports no other chunk, since Angular's build leaves out the chunks a worker's lazy imports share. |
| `bundle-message`, which shows a message and adds `provideMarkdown()` | `markdown-it` comes in a lazy chunk; no chunk of the other seven apps holds it. |
| `bundle-progress`, which binds `isDelayed` on a spinner and a progress bar | It builds, as an app that binds an input of a host directive needs that directive exported from the entry point, and no chunk holds the code highlighter, a grammar or `markdown-it`. |
| `bundle-menu`, which binds `disabled` and `triggered` on a menu group action | The same as `bundle-progress`. |
| `bundle-button`, which imports `ButtonComponent` alone | The same as `bundle-progress`. Of the kit's strings files, named `resources.js`, its chunks hold only the shared `resources.js` and those of the classes the button reaches: the spinner's delay, `reveal-delay.resources.js`, the busy guard's, `busy-guard.resources.js`, and the clock's, `clock-tokens.resources.js` and `system-time-source.resources.js`. Its initial chunks hold at most 21,200 bytes of them, about a tenth above the 19,250 they held when the cap was set; the check writes the bytes on every run. |

### Kit copies

The Kit copies check, `src/noldova.ui.components.angular/scripts/checks/kit-copies-check.ts`, reads the list of files the build copies into the kit from outside its package, `npm run build --silent -- --list-copies` in the kit's folder, after `npm run build:components`, since it reads the packed kit.
The list must be exactly `LICENSE`, the kit's `README.md` and every file of the kit's inputs, which `npm run build --silent -- --inputs` names in the kit's folder, then the line `end of copies`, and the packed kit must hold each one byte for byte.
The root's `npm run build --silent -- --list-copies`, which the release's archive check runs, must print the same list.
Both options must refuse another argument, exiting with 1, printing nothing on standard output and saying the option takes no other value.
In a temporary folder that holds only `LICENSE` and the kit's `package.json`, the list must name `LICENSE` alone, then `LICENSE` and the README once the README is there; the repository's own files are never moved.
Like the Kit bundles check, it runs on Linux x64 only.

### Kit manifest

The Kit manifest check, `src/noldova.ui.components.angular/scripts/checks/kit-manifest-check.ts`, runs the build's check of the kit's `package.json` on the kit's own, which must pass.
In a temporary folder, it names `@noldova/context.core` as a peer at `0.0.2`, `^0.0.2`, `>=0.0.2 <0.0.3`, `>=0.0.1 <0.1.0` and `>=0.0.2 <1.0.0` in turn, and the build's check must refuse each, naming the package.
It also takes the package out of the development dependencies, and pins it there at `^0.0.2` and at `>=0.0.2 <0.1.0`, and the build's check must refuse each, naming the package, and it gives the development dependencies as `"0.0.2"` and as `null`, which the build's check must refuse as not an object.
It also checks the range the build expects from a lowest version, `>=0.3.1 <0.4.0` from 0.3.1 and `>=1.2.3 <2.0.0` from 1.2.3, and the lowest version it reads back from each range, which the build's fresh install with the kit's peers installs.
Like the Kit bundles and the Kit copies checks, it runs on Linux x64 only.

### Time per file

The organization's testing standard has each spec file finish in under 1 second; one file has its own limit, by the maintainer's decision.
A file's time is the one CI reports in its run of the whole suite, or one a machine reports when it runs the spec files one at a time, with Vitest's `fileParallelism` off; a whole-suite run on a busy machine measures its load rather than the file.
`src/noldova.ui.components.angular/tests/app/models/markdown.reader.spec.ts` may take about 3 seconds.
Its streaming specs read the whole text after every length they stream, through the reader's real paragraph step and margin, `markdownParagraphStep` and `markdownParagraphMargin`, 1000 and 500 characters, which stay as they are.

### Fixed pauses

Angular specs poll with Vitest's `vi.waitFor`, and pause for no fixed time but the two waits below.

- The one real deadline a spec waits out is 20 ms: `src/noldova.ui.components.angular/tests/fixtures/live-region.fixture.spec.ts` checks that `LiveRegionFixture.spokenAsync` fails, naming its limit, when the region speaks nothing within it.
- `LayoutTraceFixture.startAsync`, in `src/noldova.ui.components.angular/tests/fixtures/layout-trace.fixture.ts`, tries again every 50 ms, for up to 10 seconds, while the browser refuses its trace because a spec file in another tab is tracing. The browser tells only the tab that started a trace when it ends, so there is no event to wait for. A spec waits only while another trace runs.

A hovered tooltip opens after a 500 ms rest, so a spec that hovers an anchor to check what its tooltip shows provides `TooltipFixture.atOnce`, from the testing entry, `src/noldova.ui.components.angular/src/testing/models/tooltip-fixture.ts`, which opens it, and a hovered link reference chip's card, at once; the rest itself is checked on a test time source, in the tooltip's own spec.

### The Angular tests' ports

The kit's `vitest.config.mts`, which the docs site's tests also use, sets `test.api.port` to 24315, below the dynamic range, because Vitest's browser server otherwise takes 63315, which Windows can reserve.
A reserved port is refused, not in use, so listening fails with `EACCES` and Vite doesn't move on to the next port.
Vitest ignores port 0, so it can't ask the system for a free port.

- Angular's test builder gives the setting to its root server and to its browser project, so during a run 24315 and 24316 both listen: the root takes 24315 and the browser project, finding it in use, moves on to 24316, where the test page loads from.
- A machine whose reserved ranges, or whose lowered dynamic range, cover 24315 or 24316 still fails with `EACCES`.

### Tests that run alone

The Angular specs run with Vitest's `isolate: false`, the Angular test builder's default, so the spec files in one browser page share its globals.
After each spec test, `src/noldova.ui.components.angular/tests/shared-page.setup.ts` fails the test if it left a timer global replaced, such as `setInterval` or `Date`, names it, and puts the page's own back.
It then moves the pointer just outside the page, so the next test starts with no element under it and no spec file resets the pointer itself.
Before each spec file, it also sets the emulated media to no reduced motion and no forced colors, so no file sees what the machine prefers or what an earlier file left emulated.
Specs emulate media only through `src/noldova.ui.components.angular/tests/fixtures/emulated-media.fixture.ts`, which the motion and forced-colors fixtures use: each emulation call replaces the whole emulated set, so the fixture sends every feature each time.
A spy's own `mockRestore()` leaves its restore in Vitest's registry, where a later spec file's `vi.restoreAllMocks()` runs it again, so a test that spies on a faked timer global restores it with `vi.restoreAllMocks()`.
One spec fakes a timer global in the shared page, by the maintainer's decision: `src/noldova.ui.components.angular/tests/testing/services/kit-stylesheet-fixture.spec.ts` fakes `setTimeout` to reach `KitStylesheetFixture`'s 30 s load deadline and the 5 s limit on its diagnostic fetch of a font that failed.
No event can stand in for a load or an answer that never comes, and the fixture is a public helper with no injected time source; the spec restores the timers in its `afterEach`.
No test needs a resource that the operating system can't isolate per process, so none runs alone.

### Newest context

The "Newest context" workflow, `.github/workflows/newest-context.yml`, runs each night on Linux x64, and on demand.
`npm run newest-context`, `src/noldova.ui.components.angular/scripts/newest-context.ts`, moves each CONTEXT peer of the kit to the newest version npm publishes inside its range: the kit's development pin and the docs site's pin become that version, the range starts there, and the lockfile follows; nothing is committed.
The workflow then runs `npm run build` and `npm test`, so the kit is built and tested with the CONTEXT release an app would take, as [Noldova's TypeScript standard](https://github.com/noldova-com/.github/blob/main/standards/stacks/TYPESCRIPT.md#dependencies) requires.
When a step fails, it opens an issue titled "The kit fails its build or tests with the newest context in its peer range", or comments on the open one with the run's link.

### Flake proof

The "Flake proof" workflow, `.github/workflows/flake-proof.yml`, runs the organization's shared flake proof, which [the `.github` repository's README](https://github.com/noldova-com/.github#proving-flakes) describes under "Proving flakes".

## Releases

The kit is published to npm as `@noldova/ui.components.angular` from `main` by the release workflow, `.github/workflows/release-npm.yml`, with provenance and without a stored token.
A maintainer starts it with the version and the commit: `gh workflow run release-npm.yml -f version=<version> -f commit=<commit>`.
Its version is `version.json`'s at the released commit, such as `{ "version": "0.0.1" }`; the pull request that changes it writes that version's section in [CHANGELOG.md](CHANGELOG.md).
The release tags the commit `v<version>` first, before it builds or publishes; a version whose build or publish then fails keeps its tag, so releasing other changes needs a new version.
A release's build also adds Angular's build tools to a fresh install of the kit, as the checks above say, so a release whose Angular is behind Angular's newest patch stops there; the version pull request that moves the kit's Angular comes first.
After a release, the workflow proposes the version to each public repository that pins the kit, in one pull request each, through a GitHub App whose key the `version-updates` environment holds.

## License

The kit is licensed under the [MIT License](LICENSE).

It includes and depends on third-party material under its own licenses:

| What | Where | License | Obligations |
|---|---|---|---|
| Noldova Sans, derived from Inter by The Inter Project Authors | `assets/fonts/noldova-sans*.woff2`, packed as `fonts/` | SIL Open Font License 1.1, in `INTER-OFL.txt` beside the fonts | Every copy carries the copyright notice and the license, a modified version is released only under the same license, the font is never sold by itself, and the authors' names are never used to promote a derived work. The license reserves no font name. |
| Noldova Mono, derived from Inconsolata by The Inconsolata Project Authors | `assets/fonts/noldova-mono*.woff2`, packed as `fonts/` | SIL Open Font License 1.1, in `INCONSOLATA-OFL.txt` beside the fonts | The same as Noldova Sans. |
| Material Symbols | the `material-symbols` package, a dependency | Apache License 2.0, in the package's own `LICENSE` | The kit imports the package's stylesheet and copies none of its files, so products receive the license with the package. The package has no NOTICE file. |
| markdown-it 15.0.2, which parses the Markdown view's text | the `markdown-it` package, a dependency, pinned exactly | MIT License, in the package's own `LICENSE` | Every copy keeps the copyright notice and the license. Only an app that adds `provideMarkdown()` loads it, on first use, and the kit copies none of its files, so products receive the license with the package; a product that bundles it keeps the notice in its bundle's third-party licenses. |
| linkify-it 6.1.0, mdurl 2.1.0, punycode.js 2.3.1 and uc.micro 3.0.0, which markdown-it uses | their packages, installed with `markdown-it` | MIT License, each in its package's own `LICENSE` | The same as markdown-it. |
| entities 8.1.0, which markdown-it uses | the `entities` package, installed with `markdown-it` | BSD 2-Clause License, in the package's own `LICENSE` | A copy in source or bundled form keeps the copyright notice, the conditions and the disclaimer. |
| argparse 3.0.2, which markdown-it's command-line tool uses | the `argparse` package, installed with `markdown-it` | Python Software Foundation License 2.0, in the package's own `LICENSE` | The kit never loads it, so no bundle holds it; a copy keeps the license and its copyright notice. |
| KaTeX 0.19.0, which draws the Markdown view's formulas | the `katex` package, a dependency, pinned exactly | MIT License, in the package's own `LICENSE` | Every copy keeps the copyright notice and the license. The Markdown view loads it on the first formula it shows, and the kit copies none of its files, so products receive the license with the package; a product that bundles it keeps the notice in its bundle's third-party licenses. |
| The KaTeX fonts, which draw the formulas' symbols | `dist/fonts/` in the `katex` package; the kit's `kit.css` imports `katex/dist/katex.css`, whose fonts a product's build copies | SIL Open Font License 1.1; each font file's metadata holds the copyright notices of Design Science and Khan Academy, names the license and links its text | Every copy carries the copyright notice and the license, which the files' metadata holds, a modified version is released only under the same license, and the fonts are never sold by themselves. The metadata reserves no font name. |
| commander 15.0.0, which KaTeX's command-line tool uses | the `commander` package, installed with `katex` | MIT License, in the package's own `LICENSE` | The kit never loads it, so no bundle holds it; a copy keeps the license and its copyright notice. |

## Trademarks

The code is under the MIT License, while the name "Noldova" and its logos are not: the MIT License grants no right to them.
They are the Noldova wordmark, `src/noldova.ui.components.angular.docs/public/assets/noldova-wordmark.svg`, and the Noldova "N" favicons beside it, `favicon.svg`, `favicon-32.png` and `apple-touch-icon.png`, which the docs site shows.
A build from this code that is published by anyone but Noldova uses another name and its own logos.
