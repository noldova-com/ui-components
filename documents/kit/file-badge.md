# File badge

**Scope:** The kit's file badge: its default geometry, the text role it uses, its surface and behavior, and its table of marks.

The themes, the tokens and the rules every control shares are in [KIT.md](../KIT.md), whose [Controls](../KIT.md#controls) section says how this specification reads.

## Default geometry

A 1rem box, the `icon` token; a tinted square has 0.25rem corners, the `radius-small` token.
Letters are 0.5625rem, the `file-badge-text` token; a glyph on a square is 0.75rem, the `file-badge-glyph` token; a glyph alone fills the box.

## Text role

The mono font, at the emphasis weight, for letters; Material Symbols Rounded for glyphs.

## Surface and behavior

The kit's `nol-file-badge`, beside a file's name in a list of files, such as a reply's edited files, its attachments and its file mentions.
[`nol-message`](message.md) draws it itself on an attachment that has no preview and before a file link's path in its text.
It is decorative, hidden from assistive technology, since the name beside it is the text, and copies as nothing, not even a line break, so a line it sits in copies whole.
Its `fileName` is a name or a path; the badge drops the folders, then finds the mark by the whole name, then by the last extension, ignoring case, and draws the plain file for any other name.
A name's leading dot starts no extension, so `.ts` is a plain file, while a known whole name such as `.gitignore` has its own mark.
With `isFolder` on, the badge draws the folder mark whatever the name is, since only the app can tell that a path such as `icon-preview` is a folder.

Each type's color is one of the avatar pairs, `avatar-<color>` and `avatar-<color>-text`: on a square, the letters or the glyph are in the pair's letter color on its fill, at 4.5:1 or more; a glyph alone is in the letter color on the surface, at 3:1 or more; the plain file is in the muted text color.
In forced colors the system's colors replace them, and a square takes a 1px `CanvasText` border, so its shape stays.

## Marks

| Mark | Color | Names |
|---|---|---|
| TS | default | ts, tsx, mts, cts |
| JS | amber | js, jsx, mjs, cjs |
| PY | indigo | py, pyi |
| RS | orange | rs |
| GO | cyan | go |
| C# | purple | cs |
| JV | red | java |
| KT | violet | kt, kts |
| SW | rose | swift |
| C | teal | c, h |
| C+ | teal | cpp, cc, cxx, hpp, hh |
| RB | red | rb |
| PH | violet | php |
| SQ | lime | sql |
| HT | orange | html, htm |
| CS | cyan | css, scss, sass, less |
| PD | red | pdf |
| DC | indigo | doc, docx, odt, rtf |
| XL | green | xls, xlsx, ods, csv, tsv |
| AR | orange | zip, tar, gz, tgz, 7z, rar |
| `terminal` on a square | green | sh, bash, zsh, ps1 |
| `lock` | orange | lock; `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `bun.lockb`, `Cargo.lock`, `poetry.lock`, `Gemfile.lock`, `composer.lock` |
| `description` | default | md, mdx, txt |
| `account_tree` | rose | yaml, yml |
| `data_object` | amber | json, jsonc |
| `settings` | teal | toml, ini, env; `Dockerfile`, `.env`, `.gitignore`, `.gitattributes`, `.editorconfig`, `.npmrc` |
| `image` | purple | png, jpg, jpeg, gif, svg, webp |
| `draft`, the plain file | muted text | any other name |
| `folder`, a folder | muted text | `isFolder` on |
