# Changelog

**Scope:** What each published version of this repository's packages holds, newest first.

Each version's section is written by the pull request that changes the version, from the pull requests merged since the previous version, as the [README](README.md#releases) says; other pull requests don't edit this file.

## 0.0.2

- `@noldova/ui.components.angular`: moves `markdown-it` to 15.0.3, which fixes a quadratic-time parse of an unterminated link reference definition that the Markdown view could reach (GHSA-gfr2-rv44-r23c), and a quadratic-time parse of inline HTML that the view, with HTML off, could not (GHSA-vfgh-jcmw-g37q).

## 0.0.1

- `@noldova/ui.components.angular`: the first public version of Noldova's interface kit, with its design tokens, fonts, icons and Angular components.
