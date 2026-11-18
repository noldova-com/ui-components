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

The kit's peers, Angular and RxJS, install at the exact versions it names, and its two CONTEXT packages within the range it names, as [the package's README](src/noldova.ui.components.angular/README.md) says.
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

The toolchain is Node.js 26.13.1 with npm 11.20.0, as `package.json` pins them.
The repository is one npm workspace: the root's `package.json` names the packages in `src/` as its workspaces and holds only TypeScript, the version Angular supports, which compiles the kit and checks each package's `scripts/`, and Node.js's types; each package's own `package.json` names what it uses, and the root's one `package-lock.json` holds every package the repository installs.
Each Angular package is its own Angular workspace: the kit's `src/noldova.ui.components.angular/` holds its `angular.json`, `tsconfig.json`, `tsconfig.spec.json` and `vitest.config.mts`, and the docs site's `src/noldova.ui.components.angular.docs/` its `angular.json` and `tsconfig.json`, which extends the kit's and runs its tests with the kit's `vitest.config.mts`; the kit's `tsconfig.json` and `scripts/tsconfig.json` extend the root's `tsconfig-base.json`; everything the kit's tests use is in its `tests/`, with the coverage plugin in `tests/coverage/`, the failed module request recorder's Node side in `tests/network/`, the screenshot command's in `tests/screenshots/`, and the fixtures of the build and of the checks in `tests/fixtures/kit-bundles/`, `tests/fixtures/node-load/` and `tests/fixtures/failure-screenshot/`, which the specs' compile leaves out.

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
`npm run build:docs` builds no kit, and needs `npm run build:components` first, as [the docs site](documents/DOCS-SITE.md#commands) says.
The kit's build builds it each time: it compiles it, packs it into `_packages/` as `noldova-ui.components.angular-<version>.tgz`, at the version `version.json` holds, and installs the archive at the root without saving it.
It installs the npm packages first when `node_modules` is missing, and the browser for the Angular tests.
Each archive's `package.json` records the commit it was built from as `gitHead` when the clone has no changed tracked files and no untracked files that Git doesn't ignore, and leaves it out otherwise.
The kit's build also refuses an entry other than the testing entry that reaches `src/testing/` or Vitest.
`npm run docs:build -w src/noldova.ui.components.angular.docs` builds the docs site into `_build/docs` from the kit's source, `npm run docs:test -w src/noldova.ui.components.angular.docs` runs its tests, and `npm run docs:api -w src/noldova.ui.components.angular.docs` writes only its API reference; all three need `npm run build:components` first, as [the docs site](documents/DOCS-SITE.md) says.
At the root, `npm run test:docs` runs the docs site's tests as `npm run docs:test` does, on any platform, after `npm run build`.
`npm run build:components --silent -- --list-copies`, or `npm run build --silent -- --list-copies`, builds nothing and prints each file the build copies into the kit from outside its package, one per line, with tabs between its source, the package's name and its path inside the package, and then `end of copies`.
`npm run build:components --silent -- --inputs` builds nothing and prints each folder outside the package that the kit's stylesheets load files from, one per line.
Before it builds, the build checks the kit's `package.json`: its name, the version `__VERSION__`, its dependencies, development dependencies and peers as objects, every dependency pinned, any CONTEXT dependency at an exact version, and each CONTEXT peer at the range the kit's [README](src/noldova.ui.components.angular/README.md#what-an-app-needs) sets, from its exact development dependency.

The build loads the installed kit in Node.js without a bundler, after `@angular/compiler`, which partially compiled components need when they load unbuilt, and type-checks it with NodeNext resolution and `skipLibCheck` off, from `src/noldova.ui.components.angular/tests/fixtures/node-load/`.
It loads every entry but the testing entry, which imports Vitest and so loads only inside its test runner; that entry's declarations are type-checked.
The build also resolves two fresh installs of the packed kit, each in an empty project: one with only the peers the kit names at their versions, each CONTEXT range at its lowest, and one of the kit alone, which leaves npm to pick its peers.
Each fails when npm can't resolve it or finds any peer conflict, since it resolves with `--strict-peer-deps`.
A release's build, which the shared release workflow runs with `RELEASE_ADDONS` set, then adds Angular's build tools, `@angular/build`, at the kit's Angular version to the one alone, as a new app does after it installs the kit, and fails when npm can't resolve that; any other build, such as a pull request's or main's, skips that step and says so.
That step resolves as an app's own install does, without `--strict-peer-deps`, since the build tools' own optional packages conflict under strict peers: `@angular/build` 22.2.6's `@oxc-parser/binding-wasm32-wasi` 0.156.0 pins `@emnapi/core` 2.0.0-alpha.6, which its `@napi-rs/wasm-runtime` doesn't accept as a peer.
The step catches a newer Angular than the kit's, a patch or a minor in its major: `@angular/build`'s optional peers, such as `@angular/service-worker`, `@angular/platform-server` and `@angular/ssr`, resolve to their newest, which need that newer `@angular/core`, so even the build tools at the kit's version stop with `ERESOLVE`, as they did with the kit at 22.2.1 once Angular's newest was 22.2.5, and at 22.2.5 once it was 22.2.6.
Each newer Angular then stops a release at this step, before its approval, until a kit version moves the kit's Angular to it; pull requests and main don't run this step, but the Angular's newest check below fails them first, so a version isn't tagged before the kit is on Angular's newest.
A new release of a package the kit's peers pull in can turn these steps red with no change here; the fix is a peer, a dependency or a pin in the kit's `package.json`, not a rerun.
It then compares the installed kit's declarations and API documentation with its source, and checks the types of each package's `scripts/`.
Those comparisons, and the kit's own build, which carries the documentation onto the declarations the Angular compiler writes, read the kit's source through TypeScript's compiler API in the same process, from `src/noldova.ui.components.angular/scripts/api/`.

`npm test` runs every test past the others' failures: the nativeElement assertions check, the OnPush strategies check, the poll and test limits check, on Linux x64 only the Kit bundles, the Kit copies, the Kit manifest and Angular's newest, and the kit's Angular specs, which must each report a result, with no test identity, the spec file and the titles of its suites and test, repeated, then, on Linux only, builds the docs site and tests it, as `npm run docs:build` and `npm run docs:test` do, as the static site it serves is the same on every platform.
With `NOLDOVA_SEPARATE_TEST=docs`, as the CI targets' tests set it, `npm test` leaves the docs site out, and the CI run's "Separate test" job checks it once, with `npm run build` and `npm run test:docs`.
The kit's Angular specs run in two runs of Angular's test builder, each in a browser of its own: first every test but those in a `describe(LayoutTraceFixture.suite, ...)`, then, from the spec files that hold one, only those. A layout trace records every tab of its browser, so in the first browser, under the whole suite, one could take over 10 seconds to end and keep another spec's trace from starting ([#198](https://github.com/noldova-com/ui-components/issues/198)); in the second only the tracing tests run. Both runs use the Angular `part` configuration, and the script adds up their coverage as `npm run test:merge` does below, gating it on a whole run. The suite's title is in `src/noldova.ui.components.angular/tests/fixtures/layout-trace-suite.ts`, which the fixture and the script both read. After both runs, the script fails unless each test in either run's report passed or failed in exactly one of them, and the second run ran at least one test, so a traced test that both filters skip, or that both run, fails the run.
`npm test -- --shard=<part>/<parts>`, with 2 to 8 parts, runs only every `<parts>`-th spec file of the kit's sorted list, from the `<part>`-th, with the Angular `part` configuration, which keeps the coverage report in `_build/angular-coverage` without gating it, and runs the checks before the specs only in part 1.
`npm run test:merge -- <folder> <parts>`, with Node.js alone, first checks itself on small reports in a temporary folder, then adds up the coverage of the parts, each in a subfolder of `<folder>`, by where each function, statement and branch sits in its file, from only the parts that loaded the file, since a part that never loaded it maps it from its source and can map it otherwise, and fails as `npm test` does below the requirement in [Coverage](#coverage), naming what no part reached; it also fails when fewer subfolders than `<parts>` came, or when one holds no report or one that isn't JSON.
`npm test -- <filter>...` runs only the spec files whose path from the repository root holds a filter, without the coverage gates, the nativeElement assertions check, the OnPush strategies check, the poll and test limits check, the Kit bundles, the Kit copies, the Kit manifest, Angular's newest and the docs site, and fails when nothing matches.
`npm run test:timing`, after `npm test`, is the timing check that [Time per file](#time-per-file) describes; CI doesn't run it, since its pass condition is a time, and it belongs on a test machine.
The root's `npm run build:components` and `npm test` run each workspace's own `build` and `test`, and `npm run build:docs` each workspace's own `docs:build`, passing on what follows `--`; each package's scripts run from its own folder, with paths relative to it, and write to the root's `_build/` and `_packages/`.
The kit's entry points are `src/noldova.ui.components.angular/scripts/build.ts` and `src/noldova.ui.components.angular/scripts/test.ts`, and the docs site's are in `src/noldova.ui.components.angular.docs/scripts/`.
The CI run passes two options, which the organization's shared workflow gives every repository:

```bash
npm test -- --skip-test-details --skip-coverage-details
```

The kit's test script accepts both without changing its output; besides them it takes only one `--shard=<part>/<parts>` and filters, as above, and refuses any other option.

## Checks

Every pull request into `main` must pass both checks before it merges.
A pull request adds no lines to [CHANGELOG.md](CHANGELOG.md), since each version's section is written when the version is released, as [Releases](#releases) says.

| Check | What it verifies |
|---|---|
| Check / Linked issue | `.github/workflows/require-linked-issue.yml`, the "PR" workflow: the PR description has a standalone `Issue: #N`, `Issue #N` or closing reference, such as `Closes #N`, that names an issue in this repository. |
| Check / Runner / Versions | The shared check's own call of the shared settings, which name the runner "Check / Linked issue" uses. |
| Build and test / Versions / Versions | The organization's shared settings, `.github`'s `versions.yml`, name the Node.js and npm versions and the runner for each target that "Build and test" uses. |
| Build and test / Plan the parts | It checks the caller's `shards`, `shard-outputs` and `separate-test` and lists the jobs below. |
| Build and test / Linux x64, Linux arm64, Windows x64, Windows arm64, macOS x64 (1 of 2), macOS x64 (2 of 2), macOS arm64 (1 of 2), macOS arm64 (2 of 2) | One job per target of `.github`'s shared `build-and-test.yml`, and two on each macOS target, whose tests take the longest, each running its half of the kit's spec files with `npm test -- --shard=<part>/2`, each on the GitHub-hosted runner the shared settings name for it: `npm run build` builds, packs and installs the kit, then builds the docs site; the toolchain is the Node.js and npm versions the shared settings name, Node.js 26.13.1 with npm 11.20.0 today; `.gitattributes` holds `* text=auto eol=lf`, and every tracked text file uses LF line endings and ends with exactly one newline; `npm test` runs the whole suite but the docs site, and the build and the tests leave every tracked file unchanged; a second build of the commit, in another folder, packs a byte-identical archive; and the archive passes the release's own check at the version `version.json` holds, in part 1 of a split target. |
| Build and test / Merge the parts of macOS x64, Merge the parts of macOS arm64 | With the caller's `shard-outputs: _build/angular-coverage`, each part keeps its coverage report, and one Linux x64 job per split target, with nothing installed, runs `npm run test:merge` on that target's parts, so macOS meets the kit's coverage requirement as the unsplit targets do. |
| Build and test / Separate test | One Linux x64 job builds as the targets do, the docs site included, then runs the docs site's tests, with their coverage and the built-site check, as `npm run test:docs`. |
| Build and test / End-to-end test | The shared workflow's end-to-end job, which runs only for a caller that names an `end-to-end` test; this repository names none, so it's skipped. |
| Build and test / All targets | Every target's jobs, each part of a split one, the plan, the merges of the parts and the separate test passed, and the end-to-end test passed or was skipped, and the shared settings named the versions and a runner for each target; it reports even when a job before it failed or was skipped, so `main` can require it. |

### Coverage

`npm test` measures the kit's coverage and `npm run docs:test` the docs site's, and each fails below this requirement; on a split target, `npm run test:merge` measures the kit's from all its parts together.
After every unfiltered run whose specs all pass, it names each function, statement and branch the specs never reached, by file, line and column, from the per-file report `_build/angular-coverage/coverage-final.json`, so a run that misses the requirement says what it missed; a spec that fails leaves no report, and a report it can't read is named in one line, with the result left to the thresholds.
The repository's automation, in each package's `scripts/`, has no coverage requirement: the build and the test run prove it, as the organization's testing standard says.

| Scope | Requirement |
|---|---|
| `src/noldova.ui.components.angular` | 100% of executable production code, measured by the component and service specs through the Angular unit-test builder, without the enum files and class-metadata calls that the Angular standard leaves out; the coverage plugin under `src/noldova.ui.components.angular/tests/coverage` marks those calls and reports how many it skipped. |
| `src/noldova.ui.components.angular.docs` | 100% of executable production code, measured by the docs site's specs the same way, without its enum files and class-metadata calls and its entry points and server settings, `main.ts`, `main.server.ts`, `app.config.server.ts` and `app.routes.server.ts`, which run only in the browser's start and the prerender; the built-site check in `npm run docs:test` opens every page they produce. |

### OnPush strategies

A component, an example or a spec here writes a change detection strategy only as [Noldova's Angular standard](https://github.com/noldova-com/.github/blob/main/standards/stacks/ANGULAR.md) says, and the check below holds the code to it.
The OnPush strategies check, `src/noldova.ui.components.angular/scripts/checks/on-push-check.ts`, reads every TypeScript file, `.ts` and `.mts`, that git tracks under `src`, and fails on each `changeDetection` key, bare or quoted, whose value isn't `ChangeDetectionStrategy.Eager`, however its line is split, and on a shorthand `{ changeDetection }`, naming the file and line.
It first tests its own pattern on `ChangeDetectionStrategy.Eager` with and without spaces, which it accepts, and on other values, a quoted key and a shorthand, which it refuses, and fails when that test does.

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
It runs on Linux x64 only, as the Kit copies and the Kit manifest checks do, since the release builds, packs and publishes the kit on Linux x64 (`.github`'s shared `release-npm.yml`), and the other targets' CI jobs are the longer ones; elsewhere `npm test` says it skipped them and Angular's newest.
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

### Angular's newest

The Angular's newest check, `src/noldova.ui.components.angular/scripts/checks/angular-newest-check.ts`, asks npm for the newest version, in the kit's major and not deprecated, of each `@angular/*` package the kit's `package.json` names, and of each `@angular/*` package that `@angular/build` at the kit's version takes as a peer, such as `@angular/service-worker`, `@angular/platform-server` and `@angular/ssr`.
It fails when any is ahead of the kit, naming each package with both versions: a package the kit names against the version the kit names, `@angular/ssr`, which follows the build tools' versions and gets patches of its own, against the kit's `@angular/build`, and any other against the kit's `@angular/core`.
An app's install of the kit with the build tools at the kit's version takes those peers at their newest, which need the newer `@angular/core`, so it stops with `ERESOLVE`, as a release's build does; this check says so on every pull request and in the nightly run, before a release tags a version.
A newer Angular can so turn every pull request red with no change here; the failure names each package ahead and its newest version, and the fix is a version pull request that moves the kit's `@angular/*` pins to Angular's newest and relocks, as [Releases](#releases) says.
When npm can't answer, as when the registry can't be reached or doesn't answer, the check fails with npm's own error rather than as a package ahead, and the specs after it still run: each `npm view` gives up after a 20 s fetch timeout and one retry, inside the check's 60 s limit for it.
The repository's automation has no spec runner of its own, as [Coverage](#coverage) says, so the check tests itself as it runs, as the Kit manifest check does: through a stand-in for npm, `scripts/checks/stood-in-npm.ts`, it passes with the kit at Angular's newest and with an `@angular/ssr` patch at the kit's build tools, and fails, as it must, on a peer ahead of the kit's `@angular/core`, naming that peer alone, while a deprecated newer version doesn't count; and it fails with the reason, and not as a package ahead, on each failure of npm: an error, an answer that isn't JSON, no answer in time, an error reading the build tools' peers, `npm_execpath` unset, and a kit that doesn't name `@angular/build`.
Like the Kit bundles, the Kit copies and the Kit manifest checks, it runs on Linux x64 only, and the nightly "Newest context" run, whose `npm test` runs it too, opens or comments on its issue when it fails.

### Hang limit

The kit's and the docs site's specs have one hang limit, 30 seconds for each test and each hook, set in `src/noldova.ui.components.angular/vitest.config.mts`; no spec sets its own, and `src/noldova.ui.components.angular/tests/hang-limit.spec.ts` checks that the run uses it.
The limit is at least three times the slowest test in main's runs: over the "Build and test" runs of 1d54803, 2f26351, b2316e9, e86e8b0 and 8af4e86, the slowest took 8.1 seconds, on Windows arm64, so 30 seconds is 3.7 times it.
A test's time there includes its `beforeEach` and `afterEach` hooks, so the figure covers them too.
The one `beforeAll` is the media reset in `src/noldova.ui.components.angular/tests/shared-page.setup.ts`, which runs once in every kit spec file under the same limit and is outside the figure; no spec has an `afterAll`.
Every poll is bounded at half the limit, 15 seconds, as [Fixed pauses](#fixed-pauses) says, so a poll that never passes fails first, with what it waited for, and stops; the hang-limit spec shows a hung `vi.waitFor`, a hung `expect.poll`, a hung `ChangeSignalFixture.untilAsync`, which every wait on a change runs on, and a layout that never settles failing on their bound with their own message.
A test that reaches either limit is a bug to fix, never a reason to raise it; Vitest names the test, and for a test that reaches the hang limit, the limit and the command it was waiting on.

### Poll and test limits

The poll and test limits check, `src/noldova.ui.components.angular/scripts/checks/poll-bound-check.ts`, reads every TypeScript file under the kit's `tests` and `src/testing` and the docs site's `tests`, with strings and comments read as blanks, and fails, naming the file and line, on a `vi.waitFor` or `vi.waitUntil` call that doesn't pass `HangLimitFixture.wait`, on a `DomChangeFixture.untilAsync` call given a limit after its check or a `ChangeSignalFixture.untilAsync` call given one after how it listens or a `LayoutSettleFixture.settledAsync` call given one after its pass, on a `timeout` key, such as a poll's or a test's own limit, on `vi.setConfig`, and on a test or suite given a third argument, or a hook a second, which can only be a limit or options of its own.
The hang-limit spec alone is left out, since it shows a hung poll with a short bound of its own.
It first tests itself on small sources, the shared bound passed, missing, in a string or overridden, for `vi.waitFor` and `vi.waitUntil`, a wait on the page's changes, on a change signal or for a layout to settle with and without a limit, a poll's and a test's own limits, as a number, a name or an expression after an inline or a named callback, a regular expression and a comment, and fails when that test does.

### Time per file

The organization's testing standard has a component spec file's median test finish in under 100 ms, measured on a test machine, and README list each component test over 1 second with its time and cause.
Every spec here, the kit's and the docs site's, is a component spec, since each runs in the browser through Angular's test builder.

`npm run test:timing` is the timing check, apart from `npm test` since its pass condition is a time.
It runs the kit's specs three times without coverage, and on Linux the docs site's too, as their tests run only there.
Each of the kit's runs is two runs of Angular's test builder, as `npm test`'s are, so the tests in a `describe(LayoutTraceFixture.suite, ...)` trace in a browser of their own; in one browser under the whole suite, a trace could hold it past the next trace's wait ([#198](https://github.com/noldova-com/ui-components/issues/198)).
A run fails, and the check times nothing, unless each test in the two reports passed or failed in exactly one of them and the second ran at least one test.
It takes each test's median over the runs, with `TestTimingCheck.median` from `@noldova/context.testing`, so one slow run decides nothing, and fails a spec file whose tests' median is over 100 ms plus a margin of 20%.
It also prints each test whose median is over 1 second, which the list below holds.
Its code is `src/noldova.ui.components.angular/scripts/angular/angular-test-timing.ts`, run by `scripts/angular/angular-timing-script.ts`, which each package's `scripts/test-timing.ts` or `scripts/test-docs-timing.ts` starts.
Before the runs, it checks itself on small reports in a temporary folder: a file within the budget, over it and inside its margin, a test's median over runs, a test over 1 second, a failed test, a file missing from a run and a run with no report, and a run's two parts where each test ran once, where one ran in both, where one ran in neither, and where the second ran none; it fails when that check does.

45 spec files are over the budget today on a Linux, a Windows or a macOS test machine, 42 of the kit's and 3 of the docs site's, so the timing check fails until they fit; [#148](https://github.com/noldova-com/ui-components/issues/148) brought them down from 76.
Each is listed below by kind with its median test on one test machine of each system, a cell within the budget saying so, and the docs site's tests running only on Linux.
The times are from one run of `npm run test:timing` on each system at 9bb5b36, while [#178](https://github.com/noldova-com/ui-components/issues/178) is open.
A file near the line may fall either side on another run: against a run on each of the same machines at 9265927, 4 files left the list and 5 joined it, besides the spinner's, which #178 changed between them.
A cause is measured where its kind says so; where it says not measured, it names only what the tests do.

The Gallery's Focus and Hover cell specs render each specimen on its own, one test each, then give each Focus cell the real keyboard focus, or move a real pointer onto each Hover cell, and read the cell's computed styles until they match.
One test in each renders its whole section and checks which specimens hold a cell of the state, so a specimen added to the section is checked too.
Measured on a Linux test machine with one spec file running, a test's setup takes about 50 ms: parking the pointer 15 ms, rendering 5 to 10 ms, settling 5 to 12 ms, the Shift key a Focus test presses 8 ms and reducing motion and resetting it 2 to 13 ms; then each pointer move takes about 16 ms, a frame.
Each of these is a frame or a round trip to the browser that the check needs, so none was cut.
Under the whole suite their files' medians are those in the table below.
The slowest are the feed's tests, 600 to 700 ms on Linux, rendering its virtual feed and its messages; the diff view's Focus test, about 280 ms; the button's Hover test, about 300 ms for its seven pointer moves; and each file's section test, which renders its whole section.

| File | Linux | Windows | macOS |
|---|---|---|---|
| `gallery-state-focus-content.spec.ts` | 196 ms | 262 ms | within |
| `gallery-state-focus-forms.spec.ts` | 150 ms | 172 ms | within |
| `gallery-state-focus-navigation.spec.ts` | 169 ms | 195 ms | within |
| `gallery-state-focus-overlays.spec.ts` | 125 ms | 182 ms | within |
| `gallery-state-hover-content.spec.ts` | 194 ms | 258 ms | within |
| `gallery-state-hover-forms.spec.ts` | 148 ms | 232 ms | within |
| `gallery-state-hover-navigation.spec.ts` | 164 ms | 227 ms | within |
| `gallery-state-hover-overlays.spec.ts` | 133 ms | 178 ms | within |

The Gallery's section specs render a whole section, or the whole Gallery, and read its specimens.
Rendering the navigation and content sections is measured above; the other sections' share is not measured.

| File | Linux | Windows | macOS |
|---|---|---|---|
| `gallery-feed.component.spec.ts` | 994 ms | 1097 ms | 138 ms |
| `gallery-message.component.spec.ts` | 357 ms | 374 ms | within |
| `gallery-overlays.component.spec.ts` | within | 165 ms | within |
| `gallery-virtual-feed.component.spec.ts` | 667 ms | 713 ms | 177 ms |
| `gallery.component.spec.ts` | 158 ms | within | within |

The feed's, the virtual feed's and the messages' specs wait for what they read to settle through `LayoutSettleFixture.settledAsync`, a pass of it a stable fixture and two frames.
With three such rounds to a pass, in 285 settles over five runs on one test machine of each system, what they read never changed again after a round that left it unchanged, so [#176](https://github.com/noldova-com/ui-components/issues/176) made a pass one round, with the same check.
What stays is rendering their messages, measured in two of those runs on each system.
The message states' 25 messages with Markdown and code take 200 to 690 ms to render at once on Linux, 190 to 820 ms on Windows and 60 to 120 ms on macOS.
The virtual feed's five lists then take 400 to 1,080 ms, 420 to 1,500 ms and 120 to 260 ms of frames as they lay out their rows.
[#211](https://github.com/noldova-com/ui-components/issues/211) measures that cost of the product's.
These three files' rows are from one run of `npm run test:timing` on each system with that change, under more load than the 9bb5b36 rows beside them: on Linux and Windows the check found 82 and 88 files over the budget in those runs.
A run of main without the change on the same machines, which found 75 and 71, gave the feed's 1,186, 1,088 and 283 ms, the messages' 508, 529 and 217 ms and the virtual feed's 877, 929 and 433 ms, on Linux, Windows and macOS.

The code block's specs render a block and wait for its layout to settle over animation frames.
Measured on a macOS test machine in the code-size specs: the waits for the layout to settle and for frames were the largest phases.
Measured on a Linux test machine for [#174](https://github.com/noldova-com/ui-components/issues/174), what stays:

- A pixel read, in the `settled-pixels`, `forced-highlights`, `forced-spans` and `lines` specs, costs 71 to 80 ms whatever its size, an 8 by 8 pixel read as much as a whole block, so reading less doesn't help; each read covers every pixel its check compares.
- The streaming specs follow each scroll and each change of the code with two fixed frames, about 17 ms each, which a check that nothing moved needs, since no event signals it; a check that the block followed its end waits out the same two frames, checking after each, and fails if the block hasn't reached its end by the second or leaves it once there, through `CodeBlockHarness.followedAsync`.
- The scrollbar and settled-layout specs wait for their layout to settle, through `CodeBlockHarness.settledAsync`: at least two passes of two frames and a stable fixture.
- The Run specs, `run`, `run-keys` and `run-state`, and the `lines` spec press real keys and click with a real pointer: a click costs 60 to 155 ms and a key 10 to 30 ms.
- `code-block-code-size-dark` and `code-block-wrap` are over on Windows alone, by 0.6 and 17.4 ms past the margin; not measured.
- `code-block-highlighting-start.component.spec.ts` checks a page's first TypeScript highlight, which takes 335 to 705 ms; [#184](https://github.com/noldova-com/ui-components/issues/184) keeps that cost of the product's in view.

`src/noldova.ui.components.angular/tests/typescript-grammar.setup.ts` highlights a TypeScript sample once a page, through the highlighter's own tokenizer, before each spec file's first test, so that cost doesn't fall on whichever test renders the page's first block: with it, a page's first code block render took 124 to 149 ms instead of 335 to 705 ms.
The code highlighter's specs and `code-block-highlighting-start.component.spec.ts` skip it, since they check that first load; they pay for it unless an earlier spec file on their page has already warmed it, as they did before when an earlier file showed a code block.

| File | Linux | Windows | macOS |
|---|---|---|---|
| `code-block-code-size-dark.component.spec.ts` | within | 121 ms | within |
| `code-block-forced-highlights.component.spec.ts` | 335 ms | 397 ms | 222 ms |
| `code-block-forced-spans.component.spec.ts` | 399 ms | 446 ms | 232 ms |
| `code-block-lines.component.spec.ts` | 136 ms | 137 ms | within |
| `code-block-run-keys.component.spec.ts` | 145 ms | 192 ms | within |
| `code-block-run-state.component.spec.ts` | 230 ms | 249 ms | within |
| `code-block-run.component.spec.ts` | 169 ms | 176 ms | within |
| `code-block-scrollbar.component.spec.ts` | 153 ms | 163 ms | 147 ms |
| `code-block-settled-layout.component.spec.ts` | 230 ms | 286 ms | 183 ms |
| `code-block-settled-pixels.component.spec.ts` | 360 ms | 408 ms | 301 ms |
| `code-block-streaming-end.component.spec.ts` | 127 ms | 164 ms | within |
| `code-block-streaming-return.component.spec.ts` | 186 ms | 184 ms | 164 ms |
| `code-block-streaming-scroll.component.spec.ts` | 378 ms | 428 ms | 362 ms |
| `code-block-wrap.component.spec.ts` | within | 137 ms | within |

The virtual list's specs step rendered frames, checking each frame of a scroll, a drag or a key press, so their time is bound by the frames their checks need and by the machine that runs them.
[#178](https://github.com/noldova-com/ui-components/issues/178) cut the focus ring's, kit rows' and spinner's settles to a pass of one rendered frame, and the spinner's file was within the budget on every system at 9bb5b36.
It then measured the rest on one test machine of each system, three runs each: in `virtual-list.component.spec.ts` the settles take about 22 seconds of a run, about 100 ms a test, at 276 places, and 103 of them never changed the list's rows or scroll.
Of those 103, the 4 after a step that gives the list nothing to lay out, its busy or a field's state outside it or a click on a control that resizes nothing, now wait for a stable fixture only; the rest follow a step that can move the list, so their frame is what the test checks.
On a Windows test machine with only their two files running, the focus ring's median test took about 71 ms and the kit rows' about 85 ms, settles being 65 to 80% of each test, against the table's 171 ms and 134 ms under the whole suite.

| File | Linux | Windows | macOS |
|---|---|---|---|
| `virtual-list-focus-ring.component.spec.ts` | 124 ms | 171 ms | within |
| `virtual-list-kit-rows.spec.ts` | within | 134 ms | within |
| `virtual-list.component.spec.ts` | 150 ms | 151 ms | 132 ms |

`message-popover.spec.ts` opens a popover from a message's actions or footer end with the keyboard, with the pointer away, and checks what the message shows meanwhile.
Four of its six tests wait out a fade of the message's actions twice, as the trigger takes the focus and once the popover has closed: the message's opacity transition of 120 ms.
Measured in three runs on one test machine of each system, each wait took 97 to 171 ms on Linux, 88 to 154 ms on Windows and 129 to 152 ms on macOS, and parking the pointer before it 80 to 604 ms, 125 to 730 ms and 42 to 69 ms, a park that now hovers at once, as the paragraph below says.
Each fade is what its test checks, so none was cut.
Its median test took 622 ms on Linux, 593 ms on Windows and 401 ms on macOS in the loaded runs of the Gallery's rows above, against 555, 563 and 402 ms in the runs of main before them; with the park at once, it took 432, 441 and 374 ms in the runs of the table below.

The pointer specs move the real pointer through Vitest's `userEvent.hover`, which first waits until Playwright finds the target visible, still over frames and able to take events.
Measured on one test machine of each system, a hover took about 120 ms on Linux and Windows and about 50 ms on macOS, most of it those waits.
A hover whose target is laid out and still now goes through `PointerFixture.hoverAsync` with `isForced`, which moves the real pointer at once, and the test still reads the look the pointer gives, so a hover that lands elsewhere still fails.
That is `AppearanceFixture.parkPointerAsync`, which parks the pointer on a fixed 4 px element of its own, the tab action's buttons and the docs site's search field; a hover after a scroll or an opening, such as the scroll reveal's on its area, keeps Playwright's waits.
The docs site's search spec types `zqzq` where it typed a 17-character query, for its check that nothing matches, since a key took about 90 ms on Linux; it still types key by key, as search as you type sees it.
The table gives each file's median test before and after that change, in three runs on one test machine of each system, each switching between the two, every test still followed by the pointer's move off the page that [#199](https://github.com/noldova-com/ui-components/issues/199) measured.

| File | Linux | Windows | macOS |
|---|---|---|---|
| `icon-button-tab-action.component.spec.ts` | 246 to 116 ms | 256 to 132 ms | 116 to 50 ms |
| `scroll-reveal.service.spec.ts` | 319 to 152 ms | 226 to 165 ms | 101 to 68 ms |
| `tab-leading.component.spec.ts` | 174 to 102 ms | 164 to 120 ms | 67 to 33 ms |
| `toolbar-button-open-pressed.component.spec.ts` | 215 to 138 ms | 202 to 182 ms | 100 to 67 ms |
| docs site, `docs-search.component.spec.ts` | 341 to 287 ms | not run | not run |

What stays in these files is the pointer moves, clicks and keys their checks make, and the move off the page.
Measured in the same way, some files are bound by a wait their checks need, so none was cut:

- `short-screenshot-names.spec.ts` takes a real screenshot in each test, 60 to 106 ms each on macOS; its tests took 169 to 403 ms on Linux and Windows.
- `hang-limit.spec.ts` waits out its 100 ms stand-in for the shared bound in three of its five tests, 104 to 114 ms a test on Linux and Windows.
- `gallery-overlays.component.spec.ts` renders its section, about 170 ms a test on Linux and Windows against 20 ms on macOS.
- The docs site's `tokens-page.component.spec.ts` renders the tokens page, 180 to 630 ms a test on Linux.
- The docs site's `docs-on-this-page.component.spec.ts` goes to every page of the catalog in one test, which took 8.3 seconds on Linux in the run that timed each test for #176, ui-components-20261118-063447-ea50, against the 3,300 ms the list of tests over 1 second below gives from the timing check at 60fda17; that run's probe timed every test as it ran, which adds its own time.

The rest are not measured; most drive real pointer moves, clicks or key presses.

| File | Linux | Windows | macOS |
|---|---|---|---|
| `configuration-table-row-hover.component.spec.ts` | within | 132 ms | within |
| `focus-start.fixture.spec.ts` | 127 ms | within | within |
| `gallery-overlay-container.spec.ts` | 146 ms | 136 ms | within |
| `message-shell-runs.component.spec.ts` | 138 ms | 170 ms | within |
| `pointer-rest.fixture.spec.ts` | within | 127 ms | within |

The tests over 1 second, waiting for the Owner's acceptance: every one the timing check printed at 60fda17 on one Linux, one Windows and one macOS test machine, each with its slowest median of three runs there, rounded up to 100 ms, and its cause, from what the test does, or the issue that measures it: The Gallery's Focus and Hover cell rows were printed for #173 on the same three systems, after their specs were split by specimen.

| Test | Time | Cause |
|---|---|---|
| `markdown-view.component.spec.ts`, while its text streams: lays out its text in one frame of every three while it streams, as each burst reveals more, and in every frame once the stream ends, until the text is whole | 9900 ms | It runs the browser's performance trace twice, over 30 and then 6 frames on the fake timers, and counts the layouts in it. |
| `tooltip.directive.spec.ts`: reads no layout when a change on the page covers its anchor and the pointer leaves for the cover, and hides once the pointer moves on away from both | 8300 ms | It runs the browser's performance trace around a pointer leave, then moves the real pointer away and waits for the tooltip to hide. |
| `markdown-view.component.spec.ts`, while its text streams: streams a 10,000-character reply in 100-character batches, parsing only the text not yet settled and changing a bounded number of nodes after each batch and in each frame, however long the reply has grown | 7200 ms | It sets 100 lengths of the reply, and after each steps 6 frames of 16 ms on the fake timers, 700 steps in all. |
| docs site, `docs-on-this-page.component.spec.ts`: lists exactly the sections of every page the menu links, with the Specification's second- and third-level headings nested under it | 3300 ms | It goes through the router to every page of the catalog and waits for each page's headings and outline. |
| `tool-call.component.spec.ts`: folds its words, then its status word, then its kind's icon as the panel narrows, and unfolds them in turn as it widens, each at one width and with one class change, and again when its spacing changes, in the fixture.contrast theme | 2800 ms | For each fold level it bisects the panel's width, about 9 resizes, each settling over frames, then measures the crossings again. |
| `gallery.component.spec.ts`: draws every specimen's name in a kit section, the navigation's, in its scope's strong text color | 2700 ms | Not measured; #176 takes its file. |
| `gallery.component.spec.ts`: colors the code in its code blocks though the app provides no code highlighting | 2600 ms | Not measured; #176 takes its file. |
| `virtual-list.component.spec.ts`: holds an element taller than the view where the view shows it, in every frame as the row grows and shrinks above it, and lets it go once the person scrolls | 2400 ms | Not measured alone; its file's tests spend about 80% of their time waiting for rendered frames at 60 Hz, as #178 measured. |
| `gallery.component.spec.ts`: shows every control listed under the kit's _GalleryNavigationComponent in a scope | 2400 ms | Not measured; #176 takes its file. |
| `virtual-list.component.spec.ts`: never moves a row it shows back when a smooth scroll near the start measures rows that grew by more than the space before them, which sets the scroll position at once | 2300 ms | It scrolls up from row 300, 90 px at a time, letting each step settle for up to 10 frames, then records a smooth scroll on every frame. |
| `gallery-state-focus-navigation.spec.ts`: shows in each of the Focus cells of nol-gallery-feed the look its control has when it really holds the keyboard focus | 2300 ms | It renders the feed on its own, with its virtual feed and its messages, gives each of its Focus cells the real keyboard focus and reads its computed styles. |
| `kit.spec.ts`, kit styles in forced colors: draws the sash's bar and the drop line in the highlight and grips in the text color, where they were drawn with fills alone | 2100 ms | It renders the whole Gallery navigation section under forced colors before reading computed colors. |
| `kit.spec.ts`, kit styles in forced colors: fills the navigation section's selected tab, current tree row, pressed… with the highlight, their text and icons in the highlighted text without the backplate the system draws behind text | 1800 ms | It renders the whole Gallery navigation section under forced colors before reading computed colors. |
| `virtual-list.component.spec.ts`, scrolled frame by frame through 10,000 rows: never shows the loading line on any frame of a scrollbar drag from the top to the end over rows of mixed heights from a source that answers within a frame, and fills the rows in view within three frames of each step | 1800 ms | It jumps the scroll position in 30 steps from top to end, with up to 3 frames each. |
| `gallery-state-hover-navigation.spec.ts`: shows in each of the Hover cells of nol-gallery-feed the look its control has when the pointer is really over it | 1800 ms | It renders the feed on its own, with its virtual feed and its messages, moves a real pointer onto each of its Hover cells and reads its computed styles until they match. |
| `kit.spec.ts`, kit styles in forced colors: outlines every hovered control of the content section with a dashed highlight, since the hover fill is forced away, and rings every focused one with the highlight at twice the border width, a field, a select, a checked pill and a selected tab included | 1700 ms | It renders the whole Gallery content section under forced colors before reading each Hover and Focus cell's outline. |
| `gallery-virtual-feed.component.spec.ts`: reads older messages at a local store's speed, and shows a slow source in a cell of its own, marked with a class of its own, whose loading line shows once a read has taken 250 ms | 1700 ms | It renders the virtual feed's five lists of messages with Markdown and code, whose cost #211 measures. |
| `gallery-state-focus-navigation.spec.ts`: finds a Focus cell in every specimen of the section but one marked noFocus, and only in the specimens above | 1700 ms | It renders the whole navigation section, with its feed, and reads which specimens hold a Focus cell. |
| `link-reference-chip.component.spec.ts`: gives the app each card link's address on a click, a middle click or Enter, as a link's, and hides the card | 1600 ms | It renders the chip 9 times, each with a real hover, a real click and a wait for the card to close. |
| `appearance-fixture.spec.ts`: waits out a scroll's reveal and the thumb's transitions before it reads the thumb hidden, and then shown on hover | 1500 ms | It waits out a scroll's reveal and the thumb's transitions, then hovers the area with the real pointer and waits out the transitions again. |
| `markdown-view.component.spec.ts`, while its text streams: keeps a streaming code's ended lines past the reveal as empty token spans, the text never past the reveal and never laid out more than a line below it in any frame, with forced colors | 1500 ms | It streams 40 code lines in 5 reveals, settling each until highlighted and stepping 10 frames, then up to 500 more frames. |
| `virtual-list.component.spec.ts`: holds an element from where a click above it puts it when its row starts inside the view, in every frame as the row then grows below and above it | 1500 ms | It steps 80 rendered frames, 20 for each of four reads. |
| `virtual-list.component.spec.ts`, scrolled frame by frame through 10,000 rows: holds the scroll height and writes no scrollTop through a thumb drag in rtl to both ends, its rows following one way, and moves nothing on release | 1500 ms | It drags the thumb in 24 steps, with up to 3 frames each and 3 more after the release. |
| `message.component.spec.ts`: streams Markdown 200 characters at a time to 5,000, then 5,000 at a time to 15,000, changing and moving no block above the one that grows | 1500 ms | It renders a reply at 27 lengths up to 15,000 characters of Markdown with code, lists and tables, and measures the blocks above the growing one after each. |
| `kit.spec.ts`, kit styles in forced colors: outlines every hovered control of the navigation section with a dashed highlight, since the hover fill is forced away, and rings every focused one with the highlight at twice the border width, a field, a select, a checked pill and a selected tab included | 1500 ms | It renders the whole Gallery navigation section under forced colors before reading each Hover and Focus cell's outline. |
| `virtual-list.component.spec.ts`, scrolled frame by frame through 10,000 rows: holds the scroll height and writes no scrollTop through a thumb drag in ltr to both ends, its rows following one way, and moves nothing on release | 1400 ms | It drags the thumb in 24 steps, with up to 3 frames each and 3 more after the release. |
| `gallery-virtual-feed.component.spec.ts`: shows a conversation of 10,000 messages at its end, each named by its author and time, with code among them | 1400 ms | It renders the virtual feed's five lists of messages with Markdown and code, whose cost #211 measures. |
| `markdown-view.component.spec.ts`, while its text streams: keeps a streaming code's ended lines past the reveal as empty token spans, the text never past the reveal and never laid out more than a line below it in any frame, with the fixture.contrast theme in Dark mode | 1400 ms | It streams 40 code lines in 5 reveals, settling each until highlighted and stepping 10 frames, then up to 500 more frames. |
| `gallery-state-hover-navigation.spec.ts`: finds a Hover cell in every specimen of the section but one marked noHover, and only in the specimens above | 1400 ms | It renders the whole navigation section, with its feed, and reads which specimens hold a Hover cell. |
| `gallery-state-hover-forms.spec.ts`: finds a Hover cell in every specimen of the section but one marked noHover, and only in the specimens above | 1400 ms | It renders the whole forms section and reads which specimens hold a Hover cell. |
| `gallery-virtual-feed.component.spec.ts`: streams a reply word by word at its end, which the feed follows and marks busy meanwhile, and the message announces its end politely | 1300 ms | It renders the virtual feed's five lists of messages with Markdown and code, whose cost #211 measures. |
| `diff-view.component.spec.ts`: heads each file with its path, status and counts, a rename with both paths, and its state below the header | 1300 ms | Not measured; #176 takes its file. |
| `gallery.component.spec.ts`: gives every section in the kit's _GalleryNavigationComponent a long-text row, except a section marked noLongText, which has none | 1300 ms | Not measured; #176 takes its file. |
| `virtual-list.component.spec.ts`, scrolled frame by frame through 10,000 rows: never shows the loading line or a blank row in view on any frame of a fast wheel, 800 px a frame, over rows of mixed heights from a source that answers two frames later, from row 500 past row 1000 | 1300 ms | Not measured alone; its file's tests spend about 80% of their time waiting for rendered frames at 60 Hz, as #178 measured. |
| `gallery-feed.component.spec.ts`: shows the messages, the reference chips and the virtual feed in turn, the feed's specimen right under the chips and filling its own component's box, and marks the chips' Focus cell's chip, drawn before any parser loads, keeping the gallery in place when it is clicked | 1300 ms | It renders the whole feed, 59 messages with Markdown and code, whose cost #211 measures. |
| `group-header.component.spec.ts`: starts its twistie's ink at the section text's start, folded and open, at rest and hovered, in both directions, with its hover fill on its own edges, in the fixture.contrast theme in Dark mode | 1300 ms | It takes 8 screenshots, one for each direction, fold and hover, to find where the twistie's ink starts. |
| `gallery.component.spec.ts`: keeps each long-text specimen in the kit's _GalleryNavigationComponent at most 12rem wide and inside its cell, with nothing spilling out of it | 1200 ms | Not measured; #176 takes its file. |
| `virtual-list.component.spec.ts`: keeps a focused article rendered, with the focus in it, while the keys scroll far from it | 1200 ms | It presses Page Up 20 times as real keys in a 1,000-row feed, letting each press settle for up to 10 frames. |
| `group-header.component.spec.ts`: starts its twistie's ink at the section text's start, folded and open, at rest and hovered, in both directions, with its hover fill on its own edges, in the noldova.default theme in Light mode | 1200 ms | It takes 8 screenshots, one for each direction, fold and hover, to find where the twistie's ink starts. |
| `gallery-virtual-feed.component.spec.ts`: fits each feed cell's feed, list and button in a cell narrower than the list's 30rem | 1200 ms | It renders the virtual feed's five lists of messages with Markdown and code, whose cost #211 measures. |
| `gallery-virtual-feed.component.spec.ts`: shows a newest-first feed at its top, where a row added at the top shows | 1200 ms | It renders the virtual feed's five lists of messages with Markdown and code, whose cost #211 measures. |
| `gallery-state-focus-content.spec.ts`: finds a Focus cell in every specimen of the section but one marked noFocus, and only in the specimens above | 1200 ms | It renders the whole content section and reads which specimens hold a Focus cell. |
| `tool-call.component.spec.ts`: folds its words, then its status word, then its kind's icon as the panel narrows, and unfolds them in turn as it widens, each at one width and with one class change, and again when its spacing changes, in the noldova.default theme | 1100 ms | For each fold level it bisects the panel's width, about 9 resizes, each settling over frames, then measures the crossings again. |
| `virtual-list-focus-ring.component.spec.ts`: shows no ring when a click between articles focuses the feed and the arrows, Page Up, Page Down, Home or End follow | 1100 ms | One real click and 6 real key presses, each settling over about 6 frames. |
| `virtual-list-focus-ring.component.spec.ts`: shows no ring when a click on an article is followed by the arrows, Page Up, Page Down, Home or End | 1100 ms | One real click and 6 real key presses, each settling over about 6 frames. |
| `virtual-list.component.spec.ts`, scrolled frame by frame through 10,000 rows: never shows the loading line or a blank row in view on any frame of a fast wheel, 800 px a frame, over rows of mixed heights from a source that answers two frames later, from row 0 past row 500 | 1100 ms | Not measured alone; its file's tests spend about 80% of their time waiting for rendered frames at 60 Hz, as #178 measured. |

`src/noldova.ui.components.angular/tests/app/models/markdown.reader.spec.ts` is the slowest file whose median test fits: its streaming specs read the whole text after every length they stream, through the reader's real paragraph step and margin, `markdownParagraphStep` and `markdownParagraphMargin`, 1000 and 500 characters, which stay as they are.
Two kinds of spec keep their time down by what they render.
The Gallery's Focus and Hover specs, `gallery-state-focus-sections.spec.ts` and `gallery-state-hover-sections.spec.ts`, render each of the kit's sections alone, with the others stood in for: the whole Gallery took about half of the 15-second limit a test then had to render on macOS x64.
The docs site's page specs check the desktop and phone widths; only the tables' fit, in `component-page.component.spec.ts` and `docs-shell.component.spec.ts`, runs at every width the site promises, on every page that holds a table or may gain one.

### Fixed pauses

Angular specs wait for what the page signals with `DomChangeFixture.untilAsync`, from `src/noldova.ui.components.angular/tests/fixtures/dom-change.fixture.ts`, which runs its check again on each change anywhere in the document, a move of focus or of the pointer, a scroll, an image's load or failure and a transition's run, start, end or cancel, and fails at the shared bound with the check's own failure.
What changes no part of the page, such as a frame request, a test double's state or code's CSS highlights, a spec waits for on a `ChangeSignalFixture`, from `src/noldova.ui.components.angular/tests/fixtures/change-signal.fixture.ts`, which the spec or its test double fires as the state changes, and on which `DomChangeFixture` is built: the test time source fires it on each timer, frame or idle callback it gains or loses, the code worker fixtures on each start and answer, the highlighter's worker bed on each error, and `CodeHighlightsFixture.watch()` on each highlight the page's `CodeHighlights` adds or takes back.
A resting opacity, such as a message footer's once its transition ends, a spec waits for with `RestingOpacityFixture.atAsync`, from `src/noldova.ui.components.angular/tests/fixtures/resting-opacity.fixture.ts`, built on `DomChangeFixture`, whose first read must already show the change, the value or a running animation, and which fails naming every read's value, running animations, time and frames.
Each wait's check runs at once and never gives a promise; a check that does fails the wait.
No spec pauses for a fixed time but the two waits below.
Every poll, and every wait on a change, has one bound, half the [hang limit](#hang-limit): `vitest.config.mts` gives it to `expect.poll`, and each `vi.waitFor` or `vi.waitUntil`, which take no bound from the config, passes `HangLimitFixture.wait`, from `src/noldova.ui.components.angular/tests/fixtures/hang-limit.fixture.ts`, which reads it from there, as `ChangeSignalFixture.untilAsync` does for every wait on a change; the [poll and test limits](#poll-and-test-limits) check holds every poll and wait to it.

- The one real deadline a spec waits out is 20 ms: `src/noldova.ui.components.angular/tests/fixtures/live-region.fixture.spec.ts` checks that `LiveRegionFixture.spokenAsync` fails, naming its limit, when the region speaks nothing within it.
- `LayoutTraceFixture.startAsync`, in `src/noldova.ui.components.angular/tests/fixtures/layout-trace.fixture.ts`, tries again every 50 ms, for up to 10 seconds, while the browser refuses its trace because a spec file in another tab is tracing. The browser tells only the tab that started a trace when it ends, so there is no event to wait for. A spec waits only while another trace runs. A trace records every tab, and under the whole suite one of a few milliseconds can hold tens of thousands of other tabs' events, so `LayoutTraceFixture.endAsync` has the browser hand the trace back as one stream and frees it for the next trace before reading that stream; sent event by event, such a trace held the browser for up to 20 seconds on macOS ([#198](https://github.com/noldova-com/ui-components/issues/198)).

Specs poll only where no signal serves:

- A grammar the code highlighter loads on the page is a promise it keeps to itself, and asking it for tokens would start the very load the spec counts, so these poll, every millisecond, for the load to end or the next idle callback to be asked for: `CodeHighlighterFixture.idleStepsAsync` in `src/noldova.ui.components.angular/tests/fixtures/code-highlighter.fixture.ts`, `code-block-highlighting-start.component.spec.ts`, `code-highlighter-worker-preload.spec.ts` and `src/noldova.ui.components.angular/tests/testing/models/code-highlighting-fixture.spec.ts`.
- A description the browser's accessibility tree gives a button is read through a server command, and the tree catches up with the page after its changes, so no page signal says when it is current, and a wait on a change takes no async check: `tooltip.directive.spec.ts` polls its ten reads of a description with `vi.waitFor` and the shared bound.
- A layout that has stopped moving fires no event, and the shape it settles into isn't known before, so `LayoutSettleFixture.settledAsync`, in `src/noldova.ui.components.angular/tests/fixtures/layout-settle.fixture.ts`, reads what a spec names of it once a pass of the spec's own, a frame and a stable fixture, until a pass leaves it as it was, and fails at the shared bound, naming what it waited on and its last shape: `configuration-table.directive.spec.ts`'s table and grid classes as a table fits its width, `tool-call.component.spec.ts`'s nested calls' classes; a tooltip's, card's or menu's place in the `tab`, `tooltip`, `tool-call`, `link-reference-chip`, `menu-item`, `menu-item-chevron`, `menu-trigger`, `context-menu-trigger`, `menu-group`, `menu-group-action` and `message` specs; the code block's advance, highlights, spans and lines, through `CodeBlockHarness.settledAsync` in `src/noldova.ui.components.angular/tests/fixtures/code-block-harness.fixture.ts`; the code blocks' and run outputs' places and scroll in the `message-run` and `message-shell-runs` specs; and a feed's rows and scroll in `diff-view.component.spec.ts`, `virtual-list-kit-rows.spec.ts`, `virtual-list.component.spec.ts`, `virtual-list-focus-ring.component.spec.ts`, `virtual-list-spinner.component.spec.ts`, `message.component.spec.ts` and the `gallery-feed`, `gallery-message` and `gallery-virtual-feed` specs.
- The hang-limit spec polls for a condition that never holds, to show the bound ending it.

Specs wait a fixed number of frames to show that something doesn't change or doesn't happen, which no event signals; to let the browser's next rendering step run, which paints and sends transition and animation events and which a DOM wait doesn't ask for, before they read pixels or what such an event does; or to make a step start in a frame of its own.
Each count covers the frames the code it checks runs in.
A spec that steps a test time source a frame at a time, to check each frame, waits for nothing: the code it checks runs on that clock.

- `dialog.component.spec.ts`: a press with a secondary button or from Close starts no drag, a pointer past the window's edge moves the dialog no further, and a drag doesn't move it while it is maximized.
- `select.component.spec.ts`: its value's option stays in view, and a press on a disabled option changes nothing.
- `mention-field-chips.spec.ts`: a full box's field getting shorter raises no resize loop error and changes no scroll or width.
- `tool-call.component.spec.ts`: a long title keeps its toggle a span, and a cut title with no tooltip side opens none.
- `quick-input.component.spec.ts`: Tab away and a blur show no tooltip.
- `diff-view.component.spec.ts`: the forced-color highlights and the selection are painted before the spec reads their pixels.
- `checkbox.component.spec.ts`, `choice-row.component.spec.ts`, `switch.component.spec.ts` and `radio.component.spec.ts`: a disabled control keeps focus, and a key or a click changes nothing.
- `message-column.component.spec.ts`: no tooltip opens without a description.
- `configuration-table.directive.spec.ts`: a short value stays wide and a table doesn't go on to its narrowest, a destroyed table changes no class, and a fitted table's layout doesn't flip again; two frames let pending fits drain before an observer starts.
- `menu-group.component.spec.ts`: two focus moves start in a frame of their own and keep the scroll the first made, and a settled box is the first one painted.
- `virtual-list.component.spec.ts`: a part's or a revealed row's top, the scroll, the view and a held jump stay the same in every sampled frame, and no loading line or blank row shows; its simulated drags, wheels and smooth scrolls step the test time source frame by frame.
- `anchored-overlay.spec.ts`: a settled box is the first one, and no reposition follows an open.
- `tree-drag-session-zoom.spec.ts`: a zoom change starts in a frame of its own, and leaves the drawn size unchanged until the drag's next tick.
- `tab.component.spec.ts`, `tooltip.directive.spec.ts`, `menu-item.component.spec.ts`, `menu-trigger.directive.spec.ts`, `context-menu-trigger.directive.spec.ts` and `menu-group-action.directive.spec.ts`: no tooltip, menu or submenu opens, an open one stays, and the focus stays where it is, where nothing should change; a tooltip stays shown while the pointer crosses the gap to it.
- `dialog.service.spec.ts`: a backdrop shows in the frame after it opens, its fade-in ends before the spec listens, an older backdrop is gone once a rendering step has sent its fade's end, while a newer one stays, or when its fade is cut short, and a dialog keeps its own focus when no control matches its first focus.
- `message.component.spec.ts` and `message-run.component.spec.ts`: no tooltip without tooltip text, and a short run adds no scroll space after its measure; their streaming specs step a test time source frame by frame.
- `virtual-list-focus-ring.component.spec.ts`: keys after a click keep the focus where it is and show no ring.
- The code block's specs: a write to a line the block no longer follows adds no highlight (`code-block-spans`), a hidden block keeps its advance (`code-block-settled-layout`), a short code doesn't scroll (`code-block-streaming`), and the inline lines' and a reveal's paint land before their pixels are read (`code-block-lines`, `code-block-settled-pixels`).

`AppearanceFixture.expectThumbRevealsOnHoverAsync`, from the testing entry, waits until the scroll area shows no scroll's reveal, which `[data-nol-scrolling]` keeps for a second after a scroll, and runs no transition, checking again as the attribute goes and as the transitions end; the testing entry can't read the specs' bound, so it fails at a limit of its own, the same 15 seconds, naming what still ran.

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
It then moves the pointer just outside the page, so the next test starts with no element under it and no spec file resets the pointer itself, but only when the real pointer came into the page during the test, so a test that never moves it pays no round trip to the browser for it; a page's first test moves it out whatever it did, since where the pointer rests when a page loads isn't known.
Every way a spec moves the real pointer, a user event, a locator's click or hover and the like, ends in the browser's own pointer events, which `src/noldova.ui.components.angular/tests/fixtures/pointer-rest.fixture.ts` listens for on the page's window and keeps there as `nolPointerRest`, the page's one watch of the pointer, since the files on one page share its window; the move's own pointerout outside the page clears the watch, so the browser's pointer events that land before it, such as its hover of what comes under the pointer when a teardown removes the element there, don't count.
Before each spec test, it leaves no element focused and starts keyboard navigation at the top of the page, through `src/noldova.ui.components.angular/tests/fixtures/focus-start.fixture.ts`, so a test's first Tab doesn't depend on what an earlier test focused or clicked.
Before each spec file, it also sets the emulated media to no reduced motion and no forced colors, so no file sees what the machine prefers or what an earlier file left emulated.
`src/noldova.ui.components.angular/tests/typescript-grammar.setup.ts` keeps one property of its own on the page's `window`, `nolTypeScriptWarming`, the page's one TypeScript warming, which Time per file explains: a setup file and the modules it imports load again for each spec file, while the files on one page share its window.
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

### Failed module requests

A spec file the browser can't import fails before its tests run with Vitest's "Failed to fetch dynamically imported module", which doesn't say why.
So the kit's first setup file, `src/noldova.ui.components.angular/tests/failed-module-requests.setup.ts`, has the run print each module request the browser fails, through a browser command in `vitest.config.mts` that listens on the test page once.
A request that ends in a network error prints "Failed module request" with the time, the error, such as `net::ERR_ABORTED` for a request the browser cancelled or `net::ERR_CONNECTION_RESET` for one the connection dropped, and the URL.
A request answered with an error status, or with a success whose type isn't JavaScript, prints "Failed module response" with the time, the status, the content type and the URL.
A response printed this way is printed once, though the browser also cancels its request.
Every run prints six such lines from `tests/failed-module-requests.setup.spec.ts`, which fails a module on purpose each way: four `net::ERR_UNSAFE_PORT` requests to port 1, one missing file's error status and one HTML page's `text/html`.
Playwright reports every request's end whether or not anything listens, so the cost is one command call per spec file; on a Windows test machine, passes with and without that call took the same time within their spread.

### Failure screenshots

When a spec test fails, Vitest saves a screenshot of the page under `.vitest/attachments/failure-screenshots/<spec file>/`, named after the test's full name.
A name past the 255 bytes a file name may take on macOS, Linux and Windows would fail with `ENAMETOOLONG` and lose the screenshot, so `vitest.config.mts` puts `src/noldova.ui.components.angular/tests/screenshots/short-screenshot-names.ts` in place of Vitest's own screenshot command, `__vitest_screenshot`.
It names such a file with the first 16 hexadecimal digits of the name's SHA-256 hash and the same extension, and prints `Screenshot of "<long file name>": <path>` in the run's output, so the test's full name stays beside the screenshot; a name that fits stays as it is.
The command keeps Vitest's own timing, right after the failed test and before its `afterEach` hooks clean the page up, and does what Vitest's does after the name: the Playwright provider's `__vitest_takeScreenshot` takes the screenshot.
Two checks guard it, since it leans on two of Vitest's internal command names:
- The "Failure screenshots" check in `npm test`, `src/noldova.ui.components.angular/scripts/checks/failure-screenshot-check.ts`, runs Vitest's browser mode on `src/noldova.ui.components.angular/tests/fixtures/failure-screenshot/`, whose one test fails with a title past 255 bytes. It fails unless the run saves one screenshot under the short name and prints the long name beside its path, so it catches a Vitest that no longer sends its failure screenshot through `__vitest_screenshot`.
- `src/noldova.ui.components.angular/tests/short-screenshot-names.spec.ts` fails if `__vitest_screenshot` or `__vitest_takeScreenshot` is renamed, or if `__vitest_takeScreenshot` stops giving back the image and its path.

Neither catches a change in what Vitest's own `__vitest_screenshot` does before or after calling the provider, such as a new option, so a Vitest update means comparing its `packages/browser/src/node/commands/screenshot.ts` with `short-screenshot-names.ts`.

### Flake proof

The "Flake proof" workflow, `.github/workflows/flake-proof.yml`, runs the organization's shared flake proof, which [the `.github` repository's README](https://github.com/noldova-com/.github#proving-flakes) describes under "Proving flakes".

## Releases

The kit is published to npm as `@noldova/ui.components.angular` from `main` by the release workflow, `.github/workflows/release-npm.yml`, with provenance and without a stored token.
A maintainer starts it with the version and the commit: `gh workflow run release-npm.yml -f version=<version> -f commit=<commit>`.
Its version is `version.json`'s at the released commit, such as `{ "version": "0.0.1" }`; the pull request that changes it writes that version's section in [CHANGELOG.md](CHANGELOG.md).
The release tags the commit `v<version>` first, before it builds or publishes; a version whose build or publish then fails keeps its tag, so releasing other changes needs a new version.
A release's build also adds Angular's build tools to a fresh install of the kit, as the checks above say, so a release whose Angular is behind Angular's newest stops there; the Angular's newest check fails pull requests and the nightly run first, and the next version pull request moves the kit's `@angular/*` pins to Angular's newest and relocks, as the 0.0.5 one did.
Once the version is published, the workflow deploys that tag's docs to staging and then, once staging's deploy succeeds, to production, as [Deploying the docs site](#deploying-the-docs-site) says; a failed build or publish deploys nothing.
The maintainer's approval of the release in the `release` environment covers both deploys, so they wait for no other approval.
After a release, the workflow proposes the version to each public repository that pins the kit, in one pull request each, through a GitHub App whose key the `version-updates` environment holds.

## Deploying the docs site

The docs image has three moving labels, one for each environment that serves it: `latest`, `staging` and `production`.
Each push to `main` moves `latest` to the image it built, so the sandbox follows `main` by itself.
Each release deploys its version to staging and then production, its own approval covering both, as [Releases](#releases) says; the image of its commit is built by that commit's push to `main`, so a release started before that build ends fails to deploy and is deployed by hand once the image is there.
Staging and production are also deployed by hand, on a version tag, to repair or roll back:

```bash
gh workflow run deploy.yml --ref v<version> -f environment=staging
```

The "Deploy" workflow, `.github/workflows/deploy.yml`, checks that the tag is a version tag that points at the commit to deploy, finds the image tagged with that commit and moves the environment's label to it, without building anything; if there is no such image, it fails and moves nothing.
Its summary records the tag, the commit, the digest, the environment and where the deploy was approved.
A run started by hand, once it has found the image, waits in the `deploy-staging` or `deploy-production` environment, and `deploy-production` needs a maintainer's approval; both accept version tags only, and a run started by hand has no way to skip them.
Only the release, which calls it with the tag and the commit it published, deploys without them: a run called with a commit fails unless its calling workflow is this repository's `release-npm.yml`, so no other workflow can skip them.
To undo a deploy, run the same command on an older tag.
A run uses the workflow file at its tag, so a tag from before this workflow, such as `v0.0.1`, can't be deployed.

## License

The kit is licensed under the [MIT License](LICENSE).

It includes and depends on third-party material under its own licenses:

| What | Where | License | Obligations |
|---|---|---|---|
| Noldova Sans, derived from Inter by The Inter Project Authors | `assets/fonts/noldova-sans*.woff2`, packed as `fonts/` | SIL Open Font License 1.1, in `INTER-OFL.txt` beside the fonts | Every copy carries the copyright notice and the license, a modified version is released only under the same license, the font is never sold by itself, and the authors' names are never used to promote a derived work. The license reserves no font name. |
| Noldova Mono, derived from Inconsolata by The Inconsolata Project Authors | `assets/fonts/noldova-mono*.woff2`, packed as `fonts/` | SIL Open Font License 1.1, in `INCONSOLATA-OFL.txt` beside the fonts | The same as Noldova Sans. |
| Material Symbols 0.47.5 | the `material-symbols` package, a dependency, pinned exactly | Apache License 2.0, in the package's own `LICENSE` | The kit imports the package's stylesheet and copies none of its files, so products receive the license with the package. The package has no NOTICE file. |
| markdown-it 15.0.3, which parses the Markdown view's text | the `markdown-it` package, a dependency, pinned exactly | MIT License, in the package's own `LICENSE` | Every copy keeps the copyright notice and the license. Only an app that adds `provideMarkdown()` loads it, on first use, and the kit copies none of its files, so products receive the license with the package; a product that bundles it keeps the notice in its bundle's third-party licenses. |
| linkify-it 6.1.0, mdurl 2.1.0, punycode.js 2.3.1 and uc.micro 3.0.0, which markdown-it uses | their packages, installed with `markdown-it` | MIT License, each in its package's own `LICENSE` | The same as markdown-it. |
| entities 8.1.0, which markdown-it uses, and entities 9.0.0, which parse5 uses | the `entities` package, installed with `markdown-it`, and a second copy installed with `parse5` | BSD 2-Clause License, in the package's own `LICENSE` | A copy in source or bundled form keeps the copyright notice, the conditions and the disclaimer. |
| argparse 3.0.4, which markdown-it's command-line tool uses | the `argparse` package, installed with `markdown-it` | Python Software Foundation License 2.0, in the package's own `LICENSE` | The kit never loads it, so no bundle holds it; a copy keeps the license and its copyright notice. |
| KaTeX 0.19.0, which draws the Markdown view's formulas | the `katex` package, a dependency, pinned exactly | MIT License, in the package's own `LICENSE` | Every copy keeps the copyright notice and the license. The Markdown view loads it on the first formula it shows, and the kit copies none of its files, so products receive the license with the package; a product that bundles it keeps the notice in its bundle's third-party licenses. |
| The KaTeX fonts, which draw the formulas' symbols | `dist/fonts/` in the `katex` package; the kit's `kit.css` imports `katex/dist/katex.css`, whose fonts a product's build copies | SIL Open Font License 1.1; each font file's metadata holds the copyright notices of Design Science and Khan Academy, names the license and links its text | Every copy carries the copyright notice and the license, which the files' metadata holds, a modified version is released only under the same license, and the fonts are never sold by themselves. The metadata reserves no font name. |
| commander 15.1.0, which KaTeX's command-line tool uses | the `commander` package, installed with `katex` | MIT License, in the package's own `LICENSE` | The kit never loads it, so no bundle holds it; a copy keeps the license and its copyright notice. |
| Angular's Component Dev Kit 22.2.7, which the kit's overlays, focus handling and keyboard handling use | the `@angular/cdk` package, a dependency, pinned exactly | MIT License, in the package's own `LICENSE` | Every copy keeps the copyright notice and the license. The kit copies none of its files, so products receive the license with the package; a product that bundles it keeps the notice in its bundle's third-party licenses. |
| parse5 8.1.1, which `@angular/cdk` uses | the `parse5` package, installed with `@angular/cdk` | MIT License, in the package's own `LICENSE` | The same as `@angular/cdk`. |
| tslib 2.8.1, which `@angular/cdk` uses | the `tslib` package, installed with `@angular/cdk` | BSD Zero Clause License, in the package's own `LICENSE.txt` | None: the license asks for no notice. |
| Shiki 4.5.0, which highlights code blocks: its JavaScript engine, its grammars and its highlighter | the `@shikijs/engine-javascript`, `@shikijs/langs` and `@shikijs/primitive` packages, dependencies, pinned exactly | MIT License, each in its package's own `LICENSE` | Every copy keeps the copyright notice and the license. The kit copies none of their files, so products receive the license with the packages; a product that bundles them keeps the notice in its bundle's third-party licenses. Each grammar in `@shikijs/langs` is converted from another project's grammar, under that project's license, which the package's files don't carry; [tm-grammars' list](https://github.com/shikijs/textmate-grammars-themes/tree/main/packages/tm-grammars#grammars) names each grammar's source and license. Of the 33 grammars the kit loads, in `code-language.ts`, toml and yaml are under TextMate's permission notice and the other 31 under the MIT License, so a product that bundles a grammar keeps its source's notice in its bundle's third-party licenses. |
| `@shikijs/types` 4.5.0 and `@shikijs/vscode-textmate` 10.1.0, which Shiki's packages use | their packages, installed with Shiki | MIT License, in `@shikijs/types`'s own `LICENSE` and `@shikijs/vscode-textmate`'s own `LICENSE.md` | The same as Shiki. |
| oniguruma-to-es 4.3.6, oniguruma-parser 0.12.2, regex 6.1.0, regex-recursion 6.0.2 and regex-utilities 2.3.0, which Shiki's JavaScript engine uses | their packages, installed with `@shikijs/engine-javascript` | MIT License, each in its package's own `LICENSE` | The same as Shiki. |
| `@types/hast` 3.0.5 and `@types/unist` 3.0.3, the type declarations Shiki's packages name | their packages, installed with Shiki | MIT License, each in its package's own `LICENSE` | Type declarations only: no bundle holds them; a copy keeps the license and its copyright notice. |

The docs site, which isn't published as a package, also shows two marks that aren't Noldova's, as [the docs site](documents/DOCS-SITE.md) records with their sources:

| What | Where | License | Obligations |
|---|---|---|---|
| The GitHub mark, `icons/mark-github-16.svg` of Primer Octicons 19.42.0 | drawn inline by the docs site's `docs-brand-mark` component | MIT License, which the site serves as `assets/licenses/OCTICONS-LICENSE.txt` | The site keeps the license text with the mark. GitHub is a trademark of GitHub, Inc. |
| The X logo, `logo.svg` from X's brand toolkit | drawn inline by the docs site's `docs-brand-mark` component | X's Trademark Guidelines | Its paths unchanged, in black or white, the two colors the toolkit ships it in, and linking only to Noldova's X account. X is a trademark of X Corp. |

## Trademarks

The code is under the MIT License, while the name "Noldova" and its logos are not: the MIT License grants no right to them.
They are the Noldova wordmark, `src/noldova.ui.components.angular.docs/public/assets/noldova-wordmark.svg`, and the Noldova "N" favicons beside it, `favicon.svg`, `favicon-32.png` and `apple-touch-icon.png`, which the docs site shows.
A build from this code that is published by anyone but Noldova uses another name and its own logos.
