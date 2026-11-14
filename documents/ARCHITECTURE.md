# UI Components architecture

**Scope:** The packages this repository builds, the parts of `@noldova/ui.components.angular`, the direction of the dependencies between them and the products that use them, and the code rules only this repository has.

## The packages

| Package | Folder | What it is |
|---|---|---|
| `@noldova/ui.components.angular` | `src/noldova.ui.components.angular` | The interface kit. |
| None, never published | `src/noldova.ui.components.angular.docs` | The docs site: a prerendered Angular app, built against the kit's source, with a page per component, its live examples and its API, as [DOCS-SITE.md](DOCS-SITE.md) says. |

## The parts of the kit

| Part | What it is |
|---|---|
| Design tokens | The named values interfaces use: colors, text roles, spacing, radii and component metrics. |
| Fonts | The typefaces the text roles name, kept in `assets/fonts` with their licenses. |
| Icons | The icon set the components and products draw from. |
| Components | The Angular components that products build their interfaces from. |
| Code highlighting | The highlighter and its grammars, which an app turns on with `provideCodeHighlighting()` from `@noldova/ui.components.angular/code-highlighting` and which then load lazily, or ahead while the page is idle for the languages it names in `preload`; with `provideCodeHighlightingWorker`, they load and tokenize in the app's worker, whose file calls `serveCodeHighlighting` from `@noldova/ui.components.angular/code-highlighting/worker` and holds every grammar, with no lazy import. The package declares no side effects, and the Kit bundles check keeps an app without the provider free of them. |
| Markdown | The parser of a message's text, `markdown-it`, which an app turns on with `provideMarkdown()` from `@noldova/ui.components.angular/markdown` and which then loads lazily; without it a message shows its text plain. The same entry point exports the markdown view, `MarkdownViewComponent`, for an app that lays out its own message. The Kit bundles check keeps an app without the provider free of it. |
| Testing helpers | The fixtures and providers of the kit's own tests, in `src/testing`, which products' tests import from `@noldova/ui.components.angular/testing`. The build keeps every other entry from reaching them or Vitest. |

## Dependencies

```text
products (desktop apps, websites)
        │  install a published version
        ▼
@noldova/ui.components.angular ──────────┐
        │                                │
        ▼                                ▼
@noldova/context.exceptions ──▶ @noldova/context.core
```

- Products depend on a published version of the packages.
- `@noldova/ui.components.angular` takes `@noldova/context.core` and `@noldova/context.exceptions`, the context repository's packages, published on npm, as peer dependencies, so an app holds one copy of each beside the kit.
  Each peer is a range from the version the kit builds and tests with to the next minor, `>=0.0.7 <0.1.0` today, so an app moves to a newer context release without waiting for the kit; from 1.0 it ends at the next major.
  The kit's own `package.json` and the docs site's install them from npm, `https://registry.npmjs.org`, at that lowest version, exactly.
- No package depends on a product.
- The rules for the public API, its versions, copying and outside material are in [AGENTS.md](../AGENTS.md#the-package).

## Code

The code rules only this repository has; [Noldova's standards](https://github.com/noldova-com/.github/blob/main/standards/AGENTS.md) hold the rest.

- **File names:** Angular's `component` and `directive` are final role words, so `MenuTriggerDirective` lives in `menu-trigger.directive.ts`.
- **Strings:** a class keeps the strings no other class uses in its own `<name>.resources.ts` beside it, one `<Name>Resources` class, which only that class and its specs import: a component, directive or service, and a model or another class too.
  `src/resources.ts` keeps every string that two classes use, or that a spec of another class reads.
  A template reaches its part's class through a `partResources` field, and the package's `Resources` through `resources`.
  A component's, directive's or service's file drops its kind word, `tab.resources.ts`, unless another class shares the name, in one folder or across the package; then it keeps it, as `plan-component.resources.ts` and `PlanComponentResources` beside the model's `plan.resources.ts`.
  So an app that imports one part ships no other class's strings, and the Kit bundles check's `bundle-button` keeps it so.
- **Exports:** a test that checks what a module leaves out of its exports imports the module as a namespace.
- **Imports:** a relative import in `src/noldova.ui.components.angular/src/` names its file with `.js`, as in `../app/components/button/button.component.js`, so Node.js and TypeScript's NodeNext resolution load the published package without a bundler.
  The Angular compiler writes some imports of its own, such as one for each host directive in another file, as `import * as i1 from "./reveal-delay.directive"`, and the kit's build adds `.js` to them.
  It then fails when a compiled file imports one of the package's own files without its extension, or one the package doesn't hold.
- **Test helpers:** a package's public test helpers live in `src/testing/`, a second source tree beside `src/app/` that uses the same concept categories.
  Only the package's testing entry, `src/api/testing.ts`, imports it, so an app's bundle never takes the helpers.
  The build refuses any other entry that reaches it or imports `vitest`.
  It compiles that entry on its own, with `tsconfig.testing.json`, which adds the Node.js types Vitest's declarations use, so the other entries' code never sees them.
- **Foundation value checks:** the kit's production code uses context.core's additions to the global `Object` and `String` constructors.
  The value checks are `Object.isUndefined`, `Object.isNull`, `Object.isNullOrUndefined`, `Object.isString`, `Object.isNumber`, `Object.isBigInt`, `Object.isBoolean`, `Object.isObject`, `Object.isFunction`, `String.isNullOrEmpty` and `String.isNullOrWhitespace`, and the empty string is `String.empty`.
  They replace comparisons with `undefined` and `null`, comparisons of a `typeof` result, and `""`.
  A file that uses them imports `@noldova/context.core`, usually as `import "@noldova/context.core";`, and never with `import type`.
  The Core implements them with the language's own operations, and their declarations keep TypeScript's narrowing.
  Each package's `scripts/` use the language's own checks, because they run before the packages are built.
- **Exceptions:** every exception the kit owns extends `UiComponentsException`, in `src/app/exceptions/`, which extends context's `Exception`, so an app catches the kit's failures, and only the kit's, as that one type.
  The kit's exceptions are `CodeHighlightingException`, exported from the `code-highlighting` entry, and `DiffException`, `LinkReferenceException`, `MarkdownException`, `ThemeException`, `TreeMoveException` and `VirtualListException`, exported with the base from the main entry; a new one extends the base too.
- **Comments:** only the license header is allowed in source, tests, scripts, styles, templates and workflows, with the API documentation in each entry's `src/api/<entry>.d.ts` and, in a workflow, the release version beside each action pinned to a commit SHA, which the security standard requires.
  The kit's build carries that documentation onto the declarations the Angular compiler writes for each entry, and fails when the two declare different exports or members; the root build compares the installed kit's declarations with them too.
- **License headers:** TypeScript, JavaScript, CSS, HTML and YAML files hold the header of the organization's code standard, and an HTML template's header takes exactly this form:

  ```html
  <!--
  @license
  Copyright (c) Noldova.

  This source code is licensed under the license found in the
  LICENSE file in the root directory of this source tree.
  -->
  ```
