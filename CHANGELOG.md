# Changelog

**Scope:** What each published version of this repository's packages holds, newest first.

Each version's section is written by the pull request that changes the version, from the pull requests merged since the previous version, as the [README](README.md#releases) says; other pull requests don't edit this file.

## 0.0.3

- `@noldova/ui.components.angular`: a `PermissionRequester` may have no kind, `new PermissionRequester(name)`, and its card then describes and announces it by its name alone. A card whose requester has a kind now announces the name and the kind, such as "Permission request from Build agent, Agent: …", where it announced the name alone. Breaking: `PermissionRequester.kind` is now `string | null`, so code that reads it as a `string` checks for `null` first, such as `requester.kind ?? ""`; code that only constructs requesters with a kind needs no change.
- `@noldova/ui.components.angular`: the permission card's `detailLines` input sets how many lines of details show before Show all, 3 by default, a whole number of at least 1; above 12, the expanded details scroll at that many lines.
- `@noldova/ui.components.angular`: a medium dialog size, `DialogSize.Medium`, 40rem wide by the `--nol-dialog-medium-width` token, between the default and the large size; on a narrower window it shrinks to fit, as the default size does.

## 0.0.2

- `@noldova/ui.components.angular`: moves `markdown-it` to 15.0.3, which fixes a quadratic-time parse of an unterminated link reference definition that the Markdown view could reach (GHSA-gfr2-rv44-r23c), and a quadratic-time parse of inline HTML that the view, with HTML off, could not (GHSA-vfgh-jcmw-g37q).

## 0.0.1

- `@noldova/ui.components.angular`: the first public version of Noldova's interface kit, with its design tokens, fonts, icons and Angular components.
