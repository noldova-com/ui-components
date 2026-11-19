/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { InputSignal, ModelSignal, OutputEmitterRef, Signal, TemplateRef } from "@angular/core";
import type { ClipboardWriter, IconButtonComponent, MessageComponent } from "@noldova/ui.components.angular";

/**
 * What became of a shell code block's latest Run, which an app gives a
 * {@link MessageComponent}, a `MarkdownViewComponent` from `@noldova/ui.components.angular/markdown` or a
 * {@link CodeBlockComponent} for the block; the kit only shows it.
 */
export declare enum ShellRunState {
  /**
   * Not run, or nothing to show: Run is today's button, named Run and the
   * language, as Run bash command.
   */
  Idle = "Idle",

  /**
   * The Run's commands are running: Run has the busy look of an
   * {@link IconButtonComponent}, the spinner centered in place of its glyph
   * at the same size, yet still takes presses, which reach the app, and is
   * named as Run bash command (running).
   */
  Running = "Running",

  /**
   * The Run's commands ended: Run has today's look, named as Run bash
   * command again.
   */
  Ended = "Ended"
}

/**
 * What a {@link ShellRunOutputDirective} template receives for the shell code
 * block it is drawn under.
 *
 * @example
 * ```ts
 * import type { IShellRunOutputContext } from "@noldova/ui.components.angular";
 *
 * export function isFirstBlock(context: IShellRunOutputContext): boolean {
 *   return context.block === 0;
 * }
 * ```
 */
export interface IShellRunOutputContext {
  /**
   * The block's index, as {@link ShellRun.block} gives it, which `let-block`
   * without a name gives too.
   */
  readonly $implicit: number;

  /**
   * The block's index, as {@link ShellRun.block} gives it, which
   * `let-block="block"` names.
   */
  readonly block: number;
}

/**
 * A block of code, `nol-code-block`: a header with the code's language and a
 * toolbar named Code block actions, then the code in the code text role.
 * The code stays plain unless the app adds `provideCodeHighlighting()` from
 * `@noldova/ui.components.angular/code-highlighting` to its providers. With it, code in a
 * language the kit knows, by its name or an alias, such as `TypeScript`, `ts`
 * or `bash`, is colored by the kind of each token in the theme's code token
 * colors once its grammar has loaded; other code stays plain. Once the grammar
 * has loaded, code up to 1,000 characters is colored in its first render and
 * longer code a task later, and code shown again in the same language is
 * colored at once from the tokens kept for it.
 *
 * Long lines scroll sideways inside the block and never widen its container,
 * until the toolbar's Word wrap button, a toggle that starts off, wraps them
 * or the owner binds {@link CodeBlockComponent.wrapped}.
 * Copy writes the code, exactly as bound, through the {@link ClipboardWriter}
 * the window provides. For 1.5 seconds it then shows a check glyph and is
 * named Copied, or, when the clipboard refused the text, is named Couldn't
 * copy; either is announced politely. The block is as tall as its code,
 * or its code scrolls inside a {@link CodeBlockComponent.maxHeight}.
 * A block the app makes {@link CodeBlockComponent.runnable}, tagged as a
 * shell, also offers Run, just before Copy, which goes to
 * {@link CodeBlockComponent.run}.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { CodeBlockComponent } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-install-step",
 *   imports: [CodeBlockComponent],
 *   template: "<nol-code-block language=\"bash\" code=\"npm install --save-exact @noldova/ui.components.angular\" />"
 * })
 * export class InstallStepComponent {
 * }
 * ```
 */
export declare class CodeBlockComponent {
  /**
   * Creates the block, which Angular does for each `nol-code-block` element.
   *
   * @example
   * ```ts
   * import { Component } from "@angular/core";
   * import { CodeBlockComponent } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-config-example",
   *   imports: [CodeBlockComponent],
   *   template: "<nol-code-block language=\"JSON\" [code]=\"example\" [wrapped]=\"true\" />"
   * })
   * export class ConfigExampleComponent {
   *   protected readonly example: string = "{ \"desktop.theme\": \"noldova.default\" }";
   * }
   * ```
   */
  public constructor();

  /**
   * The code the block shows and copies, with its own line breaks.
   */
  public readonly code: InputSignal<string>;

  /**
   * The language named at the start of the header, such as `TypeScript`, or
   * null for none, which is the default.
   */
  public readonly language: InputSignal<string | null>;

  /**
   * Whether long lines wrap, which the Word wrap button toggles; false, so
   * code keeps its own shape, until it is pressed or bound.
   */
  public readonly wrapped: ModelSignal<boolean>;

  /**
   * The height in rem past which the code scrolls inside the block, below
   * its header, or null, the default, for a block as tall as its code.
   */
  public readonly maxHeight: InputSignal<number | null>;

  /**
   * Whether the code is still arriving, as a reply streams in; false when
   * not bound. While true, a block that scrolls inside itself keeps its
   * newest line in view, until the reader scrolls up inside it, by any
   * amount, and again once they scroll down to within 16px of its end. When
   * it turns false the block stays where it is, and its colored tokens settle
   * into spans, so a finished block adds nothing to the cost of later changes
   * to the page; bind it to every block that streams, since one never marked
   * streaming builds its last line's spans again at each change.
   */
  public readonly streaming: InputSignal<boolean>;

  /**
   * Whether the block offers Run when its language is a shell: bash, sh,
   * shell, zsh, powershell, pwsh or cmd, in any case; false when not bound,
   * and then the block has no Run. Run is an icon button like Copy, just
   * before it, named Run and the language, as Run bash command. The kit
   * shows no feedback and announces nothing when it is chosen.
   */
  public readonly runnable: InputSignal<boolean>;

  /**
   * What became of the block's latest Run, which Run shows as
   * {@link ShellRunState} says, for a block on its own; a block inside a
   * {@link MessageComponent} or a `MarkdownViewComponent` from `@noldova/ui.components.angular/markdown` shows the state
   * they give for its index instead. Idle when not bound.
   */
  public readonly runState: InputSignal<ShellRunState>;

  /**
   * Emits the block's code, language and index when a person chooses Run, by
   * click or by keyboard, whatever its state; the kit never runs it.
   */
  public readonly run: OutputEmitterRef<ShellRun>;

  /**
   * The block's index among its message's code blocks, as
   * {@link ShellRun.block} says, from once it shows; -1 before it shows
   * inside a message or a Markdown view, and 0 on its own.
   */
  public readonly block: Signal<number>;
}

/**
 * The shell code block a person chose to run, from a {@link CodeBlockComponent}
 * or a {@link MessageComponent} that offers Run: its code and the language its
 * fence or block named. The kit never runs it; the app decides what running
 * means, such as sending the code to a terminal.
 */
export declare class ShellRun {
  /**
   * The block's code, exactly as it shows, with its own line breaks.
   */
  public readonly code: string;

  /**
   * The shell the block was tagged with, as written, such as `bash` or
   * `PowerShell`: one of bash, sh, shell, zsh, powershell, pwsh or cmd,
   * matched in any case.
   */
  public readonly language: string;

  /**
   * The block's index among its message's code blocks, from 0 in reading
   * order, counting the fenced blocks of its texts, nested ones included, and
   * its code blocks alike; among a Markdown view's own outside
   * a message, and 0 for a {@link CodeBlockComponent} on its own. A reply that
   * streams only adds blocks after the others, so a block keeps its index
   * while it streams and after, and an app can key what it keeps for a block,
   * such as a Run's output, by it.
   */
  public readonly block: number;

  /**
   * Creates the run, which the kit does when a person chooses Run.
   *
   * @param code The block's code.
   * @param language The shell the block was tagged with.
   * @param block The block's index, 0 when left out.
   * @throws ArgumentException when the language is blank.
   * @throws ArgumentOutOfRangeException when the block isn't a whole number
   * from 0.
   * @example
   * ```ts
   * import { Component, type WritableSignal, signal } from "@angular/core";
   * import { CodeBlockComponent, type ShellRun } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-setup-step",
   *   imports: [CodeBlockComponent],
   *   template: "<nol-code-block language=\"bash\" code=\"npm ci\" [runnable]=\"true\" (run)=\"lastRun.set($event)\" />"
   * })
   * export class SetupStepComponent {
   *   protected readonly lastRun: WritableSignal<ShellRun | null> = signal(null);
   * }
   * ```
   */
  public constructor(code: string, language: string, block?: number);
}

/**
 * The template a {@link MessageComponent}, or a Markdown view outside one,
 * draws under each code block its `shellRunOutputs` names, given an
 * {@link IShellRunOutputContext}, written `<ng-template nolShellRunOutput
 * let-block>`. Only the first one directly in the message or view counts.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { MessageAuthor, MessageAuthorKind, type MessageBlock, MessageComponent, MessageText, ShellRunOutputDirective } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "app-reply",
 *   imports: [MessageComponent, ShellRunOutputDirective],
 *   template: "<nol-message [author]=\"author\" [time]=\"time\" [blocks]=\"blocks\" [shellRuns]=\"true\" [shellRunOutputs]=\"outputs\"><ng-template nolShellRunOutput let-block><p>Output of block {{ block }}</p></ng-template></nol-message>"
 * })
 * export class ReplyComponent {
 *   protected readonly author: MessageAuthor = new MessageAuthor("agent", "Agent", MessageAuthorKind.Agent);
 *   protected readonly time: Date = new Date();
 *   protected readonly blocks: readonly MessageBlock[] = [new MessageText("```bash\nnpm test\n```")];
 *   protected readonly outputs: ReadonlySet<number> = new Set([0]);
 * }
 * ```
 */
export declare class ShellRunOutputDirective {
  /**
   * The template drawn under a code block.
   */
  public readonly template: TemplateRef<IShellRunOutputContext>;

  /**
   * Tells Angular's template checker that the template's context is an
   * {@link IShellRunOutputContext}; Angular calls it, a module doesn't need to.
   *
   * @param _ The directive on the template.
   * @param _context The template's context.
   * @returns Always true.
   * @example
   * ```ts
   * import { ShellRunOutputDirective } from "@noldova/ui.components.angular";
   *
   * export function isOutputContext(directive: ShellRunOutputDirective, context: unknown): boolean {
   *   return ShellRunOutputDirective.ngTemplateContextGuard(directive, context);
   * }
   * ```
   */
  public static ngTemplateContextGuard(_: ShellRunOutputDirective, _context: unknown): _context is IShellRunOutputContext;
}
