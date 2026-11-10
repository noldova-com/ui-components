/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { EnvironmentProviders, InputSignal, OutputEmitterRef } from "@angular/core";
import type { ILinkReferenceSource, LinkMenuEvent, LinkOpenEvent, MarkdownLinkSchemes, MentionCandidate, ShellRun, ShellRunState } from "@noldova/ui.components.angular";

/**
 * Turns on Markdown in the kit's message, `MessageComponent` from
 * `@noldova/ui.components.angular`: an app that shows messages adds these providers
 * once, to its application's providers. Without them a message shows each
 * text block as it was written, plain, with its Markdown marks, and the
 * app's build takes no Markdown parser.
 *
 * With them, text is parsed as CommonMark with tables, strikethrough,
 * autolinks, read-only task lists and math, and drawn as elements, never as
 * HTML. The parser, `markdown-it`, loads on first use, from its own lazy
 * chunk of the app's build; until it has loaded, text shows plain. KaTeX,
 * which draws math, loads in the same way on the first formula a view shows,
 * and its styles and fonts come with the kit's stylesheet.
 *
 * @returns The providers of the kit's Markdown parser, for
 * `bootstrapApplication` or another environment injector; not for a
 * component's own providers.
 * @example
 * ```ts
 * import { type ApplicationConfig } from "@angular/core";
 * import { provideMarkdown } from "@noldova/ui.components.angular/markdown";
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [provideMarkdown()]
 * };
 * ```
 */
export declare function provideMarkdown(): EnvironmentProviders;

/**
 * A text's Markdown, `nol-markdown-view`, drawn as the kit's message draws
 * its text blocks, for an app that lays out its own message from the kit's
 * parts. The app adds {@link provideMarkdown} once; without it, and until the
 * parser has loaded, the text shows as it was written, plain, with its
 * Markdown marks.
 *
 * The text is parsed as CommonMark with tables, strikethrough, autolinks and
 * read-only task lists, with raw HTML left as text, and drawn as elements,
 * never as HTML: an image is drawn by the app's template, or else shows its
 * alt text, and only http, https and mailto addresses and those with a
 * scheme the app names in {@link MarkdownViewComponent.linkSchemes} become
 * links, which a click, a middle click or Enter hands to the app through
 * {@link MarkdownViewComponent.linkActivate} and never follow; a link to a
 * file's path is a link only when the app turns on
 * {@link MarkdownViewComponent.fileLinks}, and shows its text plain
 * otherwise, and a link to a `file:` URL on this machine is a link to its
 * path only then, and shows as written otherwise.
 * Nesting deeper than 24 elements, 8 lists or 8 quotes is drawn at the
 * deepest level, and text past 200,000 characters is shown plain. Code, a
 * code block or fenced in the text, shows in the kit's code block at its whole
 * height on its own; inside the kit's message it shows up to 32rem high, then
 * scrolls inside. The view takes the message text size, the text
 * color and the message line height, 1.6, on its own as inside the kit's
 * message.
 *
 * Unless {@link MarkdownViewComponent.math} is off, math between `\(` and
 * `\)` or `$` and `$` is drawn in its line, and between `\[` and `\]` or
 * `$$` and `$$` centered on a line of its own, scrolling sideways when wider
 * than the view, by KaTeX in the text color.
 * A single `$` opens only before a character that isn't a space and closes
 * only after one, never before a digit, so a price such as `$5 and $10`
 * stays text; math in inline code or a code block stays text. A formula
 * KaTeX can't read, one still being written while the text streams, and
 * every formula until KaTeX has loaded show their source as written,
 * delimiters included. KaTeX takes no command that links, loads or sets
 * attributes, and bounds the size and macro expansion a formula asks for.
 *
 * An `ng-template nolMessageImage`, `MessageImageDirective` from
 * `@noldova/ui.components.angular`, inside the view draws each image in its
 * text, with the context `{ src, alt, title }` (`IMessageImageContext`;
 * `title` is null when the image has none). The template's content sits
 * where the image was, inline in a paragraph, list item, table cell or quote,
 * in an inline block no wider than the block it sits in, whose children are
 * no wider than the inline block. A view with no template of its own uses
 * the template of the message or view it sits in.
 * Without a template an image shows its alt text. The kit draws nothing for
 * an image and never fetches its `src`, which is any address the text wrote,
 * percent-encoded, for the app to check. A streamed text keeps the content
 * the template drew while it grows, and an image in inline code or a code
 * block stays text.
 *
 * @example
 * ```ts
 * import { Component, input } from "@angular/core";
 * import { MessageImageDirective } from "@noldova/ui.components.angular";
 * import { MarkdownViewComponent } from "@noldova/ui.components.angular/markdown";
 *
 * @Component({
 *   selector: "app-reply-text",
 *   imports: [MarkdownViewComponent, MessageImageDirective],
 *   template: "<nol-markdown-view [text]=\"text()\" [streaming]=\"streaming()\" (linkActivate)=\"open($event)\"><ng-template nolMessageImage let-alt=\"alt\"><em>{{ alt }}</em></ng-template></nol-markdown-view>"
 * })
 * export class ReplyTextComponent {
 *   public readonly text = input.required<string>();
 *   public readonly streaming = input<boolean>(false);
 *
 *   protected open(address: string): void {
 *     window.open(address, "_blank", "noopener");
 *   }
 * }
 * ```
 */
export declare class MarkdownViewComponent {
  /**
   * Creates the view, which Angular does for each `nol-markdown-view`
   * element; after a load of the parser that failed, it loads it again when
   * its text changes.
   *
   * @example
   * ```ts
   * import { Component } from "@angular/core";
   * import { MarkdownViewComponent } from "@noldova/ui.components.angular/markdown";
   *
   * @Component({
   *   selector: "app-note",
   *   imports: [MarkdownViewComponent],
   *   template: "<nol-markdown-view text=\"Some **bold** text.\" />"
   * })
   * export class NoteComponent {}
   * ```
   */
  public constructor();

  /**
   * The Markdown text to draw.
   */
  public readonly text: InputSignal<string>;

  /**
   * Whether the text is still streaming in; false when not bound. While it
   * streams, the text that arrives shows a little at a time, by whole
   * characters, in bursts about 50 milliseconds apart, every third frame at
   * 60 Hz, closing the gap with what has arrived by about two thirds
   * every quarter of a second and by at least 40 characters a second. Once it
   * ends, the rest shows every frame, closing the gap the same way every 60
   * milliseconds. Under
   * reduced motion the text shows as it arrives, and a view drawn while its
   * text streams shows the text it already has at once, unless it is
   * {@link MarkdownViewComponent.entering}. Held back meanwhile
   * are an emphasis, code, link or autolink that isn't closed yet at the end
   * of the last line, a line that is only a block's marker and a table's
   * header until its delimiter row, each at most 300 characters, and a code
   * fence's opening line until it ends. The parts already shown keep their
   * elements.
   */
  public readonly streaming: InputSignal<boolean>;

  /**
   * Whether the view is new in a reply that is streaming, such as a reply's
   * first text or the text after a tool call; false when not bound. A view
   * drawn streaming and entering reveals the text it starts with from
   * nothing, a little at a time, rather than showing it at once. A message
   * sets it for each text block that arrives after the message is first drawn.
   */
  public readonly entering: InputSignal<boolean>;

  /**
   * Whether text still being revealed when `streaming` ends keeps revealing
   * at the streaming pace until it has caught up, rather than catching up
   * within a few frames; false when not bound. A message sets it while it
   * streams, so a text block that a later step makes interim partway through
   * its reveal goes on at the same pace. Text drawn without `streaming`
   * shows whole either way.
   */
  public readonly paced: InputSignal<boolean>;

  /**
   * The people and agents whose mentions the view marks, the mention field's
   * candidates; none when not bound. Each `@name` of a candidate in the text,
   * its name compared without case after NFC normalization, shows in the
   * `mention` color at the emphasis weight, at half opacity when the
   * candidate is unavailable, and in `CanvasText` under forced colors. A name in inline
   * code or a code block, one that goes on from a word, an address or
   * another name, as in user-1@host-1.example, or one that a `/` or a `.` and a
   * word follows, as in @ada/notes or @ada.md, is never marked, and the text
   * stays as written. The longest name that fits is marked, so "@Chat Bot"
   * marks a candidate named "Chat Bot" over one named "Chat".
   *
   * A link to `mention:<id>`, as a mention field's value writes a chip,
   * shows its text as written in the same look when a candidate has that
   * id, decoded, and as plain text otherwise; it is never a link.
   */
  public readonly mentions: InputSignal<readonly MentionCandidate[]>;

  /**
   * Whether the view marks each `@name` of a candidate in the text; true
   * when not bound. When false, it marks only the links to `mention:<id>`
   * of the {@link MarkdownViewComponent.mentions} input, each as that input
   * says, unavailable at half opacity too, and a candidate's name anywhere
   * else shows as written, so an app marks only the places it names, as
   * `[@Ada](mention:ada)`.
   */
  public readonly mentionNames: InputSignal<boolean>;

  /**
   * Emits the address of the link the person chooses; the app decides what
   * opens.
   */
  public readonly linkActivate: OutputEmitterRef<string>;

  /**
   * Emits each link the person opens, a link in the text, a reference's
   * chip or a link in its card, beside the address `linkActivate` gives:
   * its address, how it was opened, a click or Enter plain, with Ctrl or
   * Cmd modified, or a middle click, and the event. The view has already
   * cancelled the browser's default. A link to a file goes to
   * `fileActivate` alone.
   */
  public readonly linkOpen: OutputEmitterRef<LinkOpenEvent>;

  /**
   * Emits each link the person asks the menu of, by a right-click or the
   * menu key, with its address and the event, whose default the view leaves
   * to the app: one that shows its own menu cancels it in its handler,
   * before it returns. A link to a file emits none.
   */
  public readonly linkMenu: OutputEmitterRef<LinkMenuEvent>;

  /**
   * Whether a link to a file's path is a link; false when not bound, and
   * then such a link shows its text plain. A file link starts with the
   * file badge for its path, without a `#` or `?` part after it, so
   * `a.ts#L3` has the mark of `a.ts`; in a path that part starts in the
   * last segment, written as is, so `c#/a.ts` and `a%23b.ts` keep theirs,
   * and in a `file:` URL it is the URL's own. The badge is decorative and
   * never wrapped away from the text, and the link keeps its text as its
   * name. A path is relative, as
   * `images/1.jpg`, `./a` or `../b`, rooted, as `/a/b`, or on a Windows
   * drive, as `C:\a` or `C:/a`, judged as the app gets it once decoded, so an
   * escape changes nothing. A `file:` URL with no host or `localhost` is a
   * file link to the path it names, judged as a path is, as
   * `file:///C:/a/b.txt` or `file://localhost/srv/a/b.txt`; with
   * `fileLinks` off it shows as written. Any other target without an http,
   * https or mailto scheme, or one the app names in
   * {@link MarkdownViewComponent.linkSchemes}, shows as written: one with
   * another scheme, or a `file:` URL that names another host, such as
   * `file://server/share/a` or `file:////server/share/a`, or
   * `a.ts:42`, which reads as one (`./a.ts:42` is a path), two separators at
   * the start in any mix, such as `//host/a`, `\\host\a` or `%2F%2Fhost/a`,
   * `#part` or `?q`, a space at the start, a control character anywhere, or
   * a target that doesn't decode. Nothing is ever fetched. A view whose
   * `fileLinks` changes reads its text again.
   */
  public readonly fileLinks: InputSignal<boolean>;

  /**
   * The link schemes of the app's own that the view makes links of;
   * {@link MarkdownLinkSchemes.none} when not bound. A link whose address
   * has one of them, as `[the chat](example:chat/12)` or
   * `<example:chat/12>`, draws as a link like an https one and goes to
   * {@link MarkdownViewComponent.linkActivate} as written, never followed.
   * Text that only reads as such an address, as `example:chat/12` alone,
   * stays text, as does any address in code, and a link with a scheme the
   * app doesn't name shows as written. A view given other schemes reads its
   * text again.
   */
  public readonly linkSchemes: InputSignal<MarkdownLinkSchemes>;

  /**
   * Emits the target of the file link the person chooses with a click, a
   * middle click or Enter, while {@link MarkdownViewComponent.fileLinks} is
   * on; the view never follows it, and the app resolves it, such as against
   * its project's folder. The target is the path itself, decoded, as
   * {@link MarkdownViewComponent.fileLinks} judged it: the link's destination
   * with Markdown's backslash escapes and entities resolved and its percent
   * escapes decoded, so `[a](<C:\a b.txt>)` and `[a](C:%5Ca%20b.txt)` both
   * arrive as `C:\a b.txt`. The app uses it as it is and never decodes it
   * again: `%252F` arrives as `%2F`, a name's own characters. A `#` or `?`
   * part after the path stays in it. A `file:` URL's target is the path it
   * names, decoded once, with no slash before a Windows drive letter and its
   * query and fragment kept, decoded where they decode and as written where
   * they don't: `file:///C:/a%20b.txt` arrives as `C:/a b.txt`,
   * `file:///srv/a/b.txt` as `/srv/a/b.txt` and `file:///C:/a.ts#L3` as
   * `C:/a.ts#L3`. A drive written `C|`, `C%3A` or straight after the host's
   * slashes, as `file://C:/a.txt`, arrives as `C:`.
   */
  public readonly fileActivate: OutputEmitterRef<string>;

  /**
   * The paths of the view's file links that are folders, in the form
   * {@link MarkdownViewComponent.fileActivate} emits them; empty when not
   * bound. A file link whose path is in the set shows the folder mark in
   * place of its file badge, at the same size and place, and every other
   * file link keeps its badge. The app finds out which paths are folders,
   * such as from {@link MarkdownViewComponent.filePathsChange}, since a link
   * to a folder is often written without a slash at its end, as
   * `[icon-preview](icon-preview)`.
   */
  public readonly folderLinks: InputSignal<ReadonlySet<string>>;

  /**
   * The app's reader of links to items on code hosts; null, the default,
   * keeps every link plain. The view asks it about each link once, by its
   * address and text, and draws a link it knows as the item's chip, a
   * `LinkReference` from `@noldova/ui.components.angular`: muted while the app
   * reads it, then in its state's color, with its card on hover and on
   * keyboard focus. A link it turns out not to know is a plain link again.
   * A chip activates as any link does, through
   * {@link MarkdownViewComponent.linkActivate}. A reader with `findText`
   * also finds references the text writes outside code, links and HTML, such as
   * `owner/repo#12`, which the view makes links and asks about in turn;
   * the view reads its text again when it is given another reader.
   */
  public readonly references: InputSignal<ILinkReferenceSource | null>;

  /**
   * Emits the paths of the file links the view shows, in the form
   * {@link MarkdownViewComponent.fileActivate} emits them, each once, in the
   * order of the text, whenever that list changes, including while the text
   * streams. Nothing is emitted while the list stays empty, and the list is
   * empty while {@link MarkdownViewComponent.fileLinks} is off; a link to a
   * mention is never a file link.
   */
  public readonly filePathsChange: OutputEmitterRef<readonly string[]>;

  /**
   * Whether the view's code blocks tagged as a shell, as the code block's
   * `runnable` input from `@noldova/ui.components.angular` says, offer Run just
   * before Copy; false when not bound, and then no block has Run. Run stays
   * hidden while {@link MarkdownViewComponent.streaming} is on, so code still
   * being written is never run, and shows once the reply ends. It never shows
   * on a block whose fence never closed, as a reply cut off mid-block leaves
   * it.
   */
  public readonly shellRuns: InputSignal<boolean>;

  /**
   * Emits the code, language and index of the block whose Run the person
   * chooses while {@link MarkdownViewComponent.shellRuns} is on, at any depth,
   * such as in a list or a quote; the view never runs it, and the app decides
   * what running means. Inside a message, the index counts the message's
   * blocks.
   */
  public readonly shellRun: OutputEmitterRef<ShellRun>;

  /**
   * What became of each shell block's latest Run, keyed by its index, as
   * `MessageComponent.shellRunStates` says, for a view outside a message; a
   * view inside one shows the message's. Empty when not bound.
   */
  public readonly shellRunStates: InputSignal<ReadonlyMap<number, ShellRunState>>;

  /**
   * The code blocks, by index, under which the view draws the app's
   * `ShellRunOutputDirective` template, spanning the view's width, as
   * `MessageComponent.shellRunOutputs` says, for a view outside a message; a
   * view inside one draws the message's. Empty when not bound.
   */
  public readonly shellRunOutputs: InputSignal<ReadonlySet<number>>;

  /**
   * Whether the view draws math; true when not bound. When it's off, `$`,
   * `$$`, `\(`, `\)`, `\[` and `\]` are read as the rest of the text is, so
   * a shell command such as `kill $$ && echo $$` shows as written, and
   * nothing is loaded for math: KaTeX loads for none of its formulas, not
   * even while the text streams. A backslash before a bracket is then
   * Markdown's escape, as in any text, so `\(x\)` shows as `(x)`. A view
   * whose `math` changes reads its text again.
   */
  public readonly math: InputSignal<boolean>;
}
