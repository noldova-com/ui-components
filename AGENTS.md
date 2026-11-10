# Agent instructions

Noldova owns this repository and makes the final decisions.

## Documents

Read the owner before you work on its subject, and change a rule there.

| When you… | Read |
|---|---|
| need what each part is for, or how to build and test it | [README.md](README.md) |
| write code, tests, documents or commits | [documents/ARCHITECTURE.md](documents/ARCHITECTURE.md), the code rules of this repository |
| need the organization's rules for code, tests, documents, Git and security | [Noldova's standards](https://github.com/noldova-com/.github/blob/main/standards/AGENTS.md) |
| change what the checks cover | [README.md, Checks](README.md#checks) |
| build or change a component, a token, a font or an icon | [documents/KIT.md](documents/KIT.md), then [Noldova's UI standard](https://github.com/noldova-com/.github/blob/main/standards/UI.md) |
| prepare or run a release | [README.md, Releases](README.md#releases) |

## Work

- Every pull request names the issue it resolves in this repository, such as `Closes #N`, and passes the checks [README.md](README.md) lists.

## The package

- This repository is the only source of `@noldova/ui.components.angular`.
  Noldova's products install a published version and ask for changes through an issue here; they never copy or override its files, tokens or styles.
- Its public API is everything the package exports.
  A change that breaks it gets a new major version, release notes and a migration path.
- Colors, fonts and icons are Noldova's own, or third-party material whose license was checked first.
  Never copy another product's palette, theme or icons.
  The current color values are the token table in [documents/KIT.md](documents/KIT.md), kept by the maintainer's decision.
  Every font or icon set that comes in records its license and any obligation, as [Noldova's code standard](https://github.com/noldova-com/.github/blob/main/standards/CODE.md) says.
