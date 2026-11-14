/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { FocusOrigin } from "@angular/cdk/a11y";
import type { DialogRef } from "@angular/cdk/dialog";
import { CdkMenuItem, CdkMenuTrigger, CdkMenuTriggerBase } from "@angular/cdk/menu";
import type { OverlayRef } from "@angular/cdk/overlay";
import type { ComponentPortal, ComponentType, TemplatePortal } from "@angular/cdk/portal";
import type { ComponentRef, EmbeddedViewRef, EnvironmentProviders, InjectionToken, Injector, InputSignal, InputSignalWithTransform, ModelSignal, OutputEmitterRef, OutputRef, Signal, TemplateRef } from "@angular/core";
import { Exception, type ExceptionOptions } from "@noldova/context.exceptions";
import type { Observable } from "rxjs";

/**
 * How urgently the {@link Announcer} asks assistive technology to speak a
 * message.
 */
export declare enum AnnouncementPoliteness {
  /**
   * Spoken once the person's current speech ends, for news that can wait,
   * such as a finished task.
   */
  Polite = "Polite",

  /**
   * Spoken at once, interrupting current speech, for news the person must
   * hear now, such as a failure or a request that waits for an answer.
   */
  Assertive = "Assertive"
}

/**
 * A color of an {@link AvatarComponent}'s filled look, with a fill and a
 * letter color of its own in light and dark: the theme's `avatar-<color>`
 * and `avatar-<color>-text`, its name in lower case.
 */
export declare enum AvatarColor {
  /**
   * #CCFBF1 with a #115E59 letter in light, #134E4A with #99F6E4 in dark.
   */
  Teal = "Teal",

  /**
   * #DCFCE7 with a #166534 letter in light, #14532D with #BBF7D0 in dark.
   */
  Green = "Green",

  /**
   * #ECFCCB with a #3F6212 letter in light, #365314 with #D9F99D in dark.
   */
  Lime = "Lime",

  /**
   * #FEF3C7 with a #92400E letter in light, #78350F with #FDE68A in dark.
   */
  Amber = "Amber",

  /**
   * #FFEDD5 with a #9A3412 letter in light, #7C2D12 with #FED7AA in dark.
   */
  Orange = "Orange",

  /**
   * #FEE2E2 with a #991B1B letter in light, #7F1D1D with #FECACA in dark.
   */
  Red = "Red",

  /**
   * #FFE4E6 with a #9F1239 letter in light, #881337 with #FECDD3 in dark.
   */
  Rose = "Rose",

  /**
   * #FCE7F3 with a #9D174D letter in light, #831843 with #FBCFE8 in dark.
   */
  Pink = "Pink",

  /**
   * #F3E8FF with a #6B21A8 letter in light, #581C87 with #E9D5FF in dark.
   */
  Purple = "Purple",

  /**
   * #EDE9FE with a #5B21B6 letter in light, #4C1D95 with #DDD6FE in dark.
   */
  Violet = "Violet",

  /**
   * #E0E7FF with a #3730A3 letter in light, #312E81 with #C7D2FE in dark.
   */
  Indigo = "Indigo",

  /**
   * #CFFAFE with a #155E75 letter in light, #164E63 with #A5F3FC in dark.
   */
  Cyan = "Cyan"
}

/**
 * The size of an {@link AvatarComponent}, from the theme's `avatar`,
 * `avatar-small` and `icon` look values.
 */
export declare enum AvatarSize {
  /**
   * The theme's `avatar` size, 1.75rem by default, as a message's avatar
   * has it; the default.
   */
  Normal = "Normal",

  /**
   * The theme's `avatar-small` size, 1.5rem by default, for rows and lists
   * such as a list of people or a mention's completions.
   */
  Small = "Small",

  /**
   * The theme's `icon` size, 1rem by default, for a header or a row that
   * sets it beside icons, such as a card's header; it shows only the
   * first character of its initials.
   */
  Icon = "Icon",

  /**
   * The theme's `icon-button` size, 1.375rem by default, as large as an icon
   * button's hover square, for a header that sets it level with icon
   * buttons, such as a card's header beside its Copy button.
   */
  IconButton = "IconButton",

  /**
   * The theme's `avatar-byline` size, 1.25rem by default, for a face
   * beside a name in a line of text, such as an author on a reference card.
   */
  Byline = "Byline"
}

/**
 * The height of a {@link ButtonComponent}, from the theme's `button-height`
 * and `button-compact-height` look values.
 */
export declare enum ButtonSize {
  /**
   * The theme's `button-height`, 1.625rem by default, at least; the
   * default.
   */
  Normal = "Normal",

  /**
   * The theme's `button-compact-height`, by default the icon button's
   * target, 1.5rem, at least, for a labeled action in a row of icon
   * buttons, such as a working reply's Stop in its footer, so the row keeps
   * the icon buttons' height. The label, icon, side padding, radius, focus
   * and colors are the variant's own; an outlined button drops the space
   * above and below its label, and an overlay pill takes half this height
   * as its radius.
   */
  Compact = "Compact"
}

/**
 * The look of a {@link ButtonComponent}: which of the theme's button colors
 * it is filled with, or none for a text or outlined button.
 */
export declare enum ButtonVariant {
  /**
   * The main action of its place, filled with the theme's button color; the
   * default.
   */
  Primary = "Primary",

  /**
   * Any other action, in the theme's secondary button colors.
   */
  Secondary = "Secondary",
  /**
   * A quiet action, such as a terminal's Restart: the theme's text color
   * with no fill and no border, the toolbar hover fill under the pointer, a
   * focus outline inside its edge, and dimmed further when disabled.
   */
  Text = "Text",

  /**
   * A compact setting beside a field, such as a composer's access mode: no
   * fill, a one-pixel border in the theme's border color, its label and icon
   * in the muted text color, and the space-1 step above and below its label;
   * it keeps no fill under the pointer. Under forced colors its border and
   * text are `ButtonText`, or `GrayText` while disabled.
   */
  Outlined = "Outlined",
  /**
   * The accent chip look, for an action that names what is shown, such as a
   * card's Open while its page is open: the chip's height and side padding,
   * the selected fill, the label in the text color at the button's label
   * size, and no visible border; under the pointer the toolbar hover fill
   * lies over the selected fill. It keeps the chip's height in either size.
   * Under forced colors its border and text are `ButtonText`, or `GrayText`
   * while disabled.
   */
  Accent = "Accent"
}

/**
 * What a {@link ChipComponent} shows and how it is colored. Content projected
 * into the chip replaces the text its kind makes from its count.
 */
export declare enum ChipKind {
  /**
   * A count, shown as `99+` above 99; the default.
   */
  Count = "Count",

  /**
   * A number of added items, shown as `+N` in the theme's added color.
   */
  Added = "Added",

  /**
   * A number of removed items, shown as `−N` in the theme's removed color.
   */
  Removed = "Removed",

  /**
   * A key of a keyboard shortcut, whose label is the chip's content, on the
   * raised background; the count is not shown.
   */
  Key = "Key",

  /**
   * A status, such as Cancelled, whose label is the chip's content: muted
   * text at the regular weight, 0.5rem side padding and a border in the
   * border color; the count is not shown.
   */
  Status = "Status",

  /**
   * A failed status, such as Failed, the `Status` look in the error color;
   * the count is not shown.
   */
  Failed = "Failed",

  /**
   * A note to check, such as Same account as Agent 1, the `Status` look in
   * the warning color; the count is not shown.
   */
  Warning = "Warning",

  /**
   * What a setting is on for, such as a provider a server is on for: the
   * `Status` geometry, unfilled, in the text color, with its border and a dot
   * before its text in the success color; the count is not shown.
   */
  On = "On"
}

/**
 * The size of a {@link DialogComponent}. Every size stays within the window,
 * below its top row and above its status bar.
 */
export declare enum DialogSize {
  /**
   * As wide as the theme's `dialog-width` and as tall as its content, with a
   * padded title, body and actions; the default.
   */
  Normal = "Normal",

  /**
   * As wide as the theme's `dialog-medium-width` and otherwise the default
   * size: as tall as its content, with a padded title, body and actions. A
   * short form with several fields or a short table fits it.
   */
  Medium = "Medium",

  /**
   * A fixed size from the theme's `dialog-large-width` and
   * `dialog-large-height`, never below their minimums, with a bordered
   * header and an unpadded body its content fills. The window shows a view
   * or document in a large dialog.
   */
  Large = "Large"
}

/**
 * Which way {@link DiffViewComponent} asks for more unchanged lines around a
 * hunk.
 */
export declare enum DiffExpandDirection {
  /**
   * The lines above the hunk.
   */
  Up = "Up",

  /**
   * The lines below the hunk.
   */
  Down = "Down"
}

/**
 * How a file changed, which {@link DiffViewComponent} names in the file's
 * header. What the view can show of the change is the file's
 * {@link DiffContent}, so a binary or unreadable file still has one of these.
 */
export declare enum DiffFileStatus {
  /**
   * The file is new.
   */
  Added = "Added",

  /**
   * The file's content changed.
   */
  Modified = "Modified",

  /**
   * The file was removed.
   */
  Deleted = "Deleted",

  /**
   * The file moved from its old path, with or without changes.
   */
  Renamed = "Renamed"
}

/**
 * How {@link DiffViewComponent} lays out a hunk's lines.
 */
export declare enum DiffLayout {
  /**
   * One column, each removed line before the lines added in its place; the
   * default.
   */
  Unified = "Unified",

  /**
   * The old lines on the start side and the new lines on the end side, each
   * row's old line read before its new line.
   */
  SideBySide = "SideBySide"
}

/**
 * What a {@link DiffLine} is: the class of the line names it.
 */
export declare enum DiffLineKind {
  /**
   * An unchanged line, on both sides.
   */
  Context = "Context",

  /**
   * A line only on the new side.
   */
  Added = "Added",

  /**
   * A line only on the old side.
   */
  Removed = "Removed"
}

/**
 * Where the person's review of a hunk, or of a file with no hunks, stands.
 */
export declare enum DiffReviewState {
  /**
   * Not decided yet; the default.
   */
  Undecided = "Undecided",

  /**
   * Kept.
   */
  Accepted = "Accepted",

  /**
   * Turned down.
   */
  Rejected = "Rejected"
}

/**
 * A side of a change: the file before it or after it.
 */
export declare enum DiffSide {
  /**
   * The file before the change.
   */
  Old = "Old",

  /**
   * The file after the change.
   */
  New = "New"
}

/**
 * Where a dragged tab lands relative to a tab group, which a docking guide
 * shows with its glyph and names for assistive technology.
 */
export declare enum DockingDirection {
  /**
   * Into the group, as one more of its tabs.
   */
  Center = "Center",

  /**
   * Into a new group on the group's left.
   */
  Left = "Left",

  /**
   * Into a new group on the group's right.
   */
  Right = "Right",

  /**
   * Into a new group above the group.
   */
  Top = "Top",

  /**
   * Into a new group below the group.
   */
  Bottom = "Bottom"
}

/**
 * What a {@link FieldMessageComponent} says, which sets its color and whether
 * a screen reader announces it.
 */
export declare enum FieldMessageKind {
  /**
   * An error that appears in answer to the person, such as after they leave
   * or submit the field: error-colored text, an alert announced when it
   * appears; the default.
   */
  Error = "Error",

  /**
   * A note or hint that stays on screen with its field, such as what the
   * field takes: muted text, with no live role, so it is read with the field
   * that names it in `aria-describedby` and never interrupts, however often
   * it renders.
   */
  Note = "Note"
}

/**
 * The fonts of a {@link Typography}, chosen separately for the interface and
 * for code.
 */
export declare enum FontChoice {
  /**
   * The Noldova fonts, Noldova Sans for the interface and Noldova Mono for
   * code, with the system's fonts as fallbacks.
   */
  Noldova = "Noldova",

  /**
   * The operating system's fonts, `system-ui` for the interface and
   * `ui-monospace` for code.
   */
  System = "System"
}

/**
 * How the person opened a link, which {@link LinkOpenEvent.gesture} gives,
 * so an app can open a plain one in its own browser and a modified or middle
 * one in the person's.
 */
export declare enum LinkGesture {
  /**
   * A click or Enter with neither Ctrl nor Cmd held; Shift and Alt don't
   * change it.
   */
  Plain = "Plain",

  /**
   * A click or Enter with Ctrl or Cmd held.
   */
  Modified = "Modified",

  /**
   * A click of the middle button, whatever keys are held.
   */
  Middle = "Middle"
}

/**
 * Who wrote a {@link MessageAuthor}'s messages.
 */
export declare enum MessageAuthorKind {
  /**
   * A person.
   */
  Person = "Person",

  /**
   * An agent.
   */
  Agent = "Agent",

  /**
   * The app itself, whose messages a {@link MessageComponent} shows in the
   * muted text color.
   */
  System = "System"
}

/**
 * The kind of a {@link MessageBlock}, which tells its subclasses apart.
 */
export declare enum MessageBlockKind {
  /**
   * Markdown text, a {@link MessageText}.
   */
  Text = "Text",

  /**
   * A block of code, a {@link MessageCode}.
   */
  Code = "Code",

  /**
   * A file, a {@link MessageAttachment}.
   */
  Attachment = "Attachment",

  /**
   * One of the app's templates, a {@link MessageSlot}.
   */
  Slot = "Slot"
}

/**
 * Where an item marked {@link MessageFooterEndDirective} sits in the rest of
 * its message's footer row, after the time.
 */
export declare enum MessageFooterPlacement {
  /**
   * Right after the time, 0.25rem from it, such as a button that shows the
   * reply's stats; the default.
   */
  AfterTime = "AfterTime",

  /**
   * At the footer's end edge, such as a running reply's Stop. A footer, or
   * the row layout's actions' box, that holds such an item shows without
   * hover or focus, its actions and time with it.
   */
  End = "End"
}

/**
 * How a {@link MessageComponent} lays out its message.
 */
export declare enum MessageLayout {
  /**
   * A row with the author's avatar and a header of their name and the time,
   * for every author; the default.
   */
  Row = "Row",

  /**
   * The person's own message: its content in a bubble at the end side, at
   * most 70% of the message's width, with no avatar or header, and its Copy
   * action and time under the bubble.
   */
  Bubble = "Bubble",

  /**
   * A column of messages with no padding or start border of their own, for
   * a conversation whose text lines up with the column's edge: 1.5rem above
   * each message, a muted header at the panel size of a small avatar, the
   * name and the parts the app projects with `nolMessageHeader`, then the
   * content at line height 1.6, and under it the app's actions, Copy and the
   * time at the panel size, shown on hover or focus. Every message has its
   * header, even a continuation; a message by a `System` author, the app
   * itself, has no avatar and keeps its text in the text color; a long one
   * shows whole, without Show more; and the message shows no status row of
   * its own, so the app shows its state in its header parts and slots.
   */
  Column = "Column"
}

/**
 * How a selected {@link MessageComponent} shows that it is selected. Either
 * way its name, through {@link MessageComponent.labelId}, ends with
 * "selected".
 */
export declare enum MessageSelectionLook {
  /**
   * The selection color behind the message and a 3px accent bar inside its
   * start edge; the default. Under forced colors the bar is `Highlight`, and
   * in a column the message is outlined in `Highlight` 2px inside its edges.
   */
  Bar = "Bar",

  /**
   * The raised background, `--nol-raised`, behind the message, with large
   * corners, `--nol-radius-large`, and no bar, for a list whose items sit on
   * the raised background when selected, such as a view of a chat's plans.
   * The message keeps its size and the place of its content. Under forced
   * colors it is outlined in `Highlight` 2px inside its edges, following its
   * corners.
   */
  Raised = "Raised"
}

/**
 * How a {@link MessageComponent} writes its time.
 */
export declare enum MessageTimeFormat {
  /**
   * How long ago, such as 2 minutes ago, moved on as time passes; the
   * default.
   */
  Relative = "Relative",

  /**
   * The time of day, the hour and minute, such as 14:05 or 2:05 PM by the
   * locale, or 24-hour whatever the locale with
   * {@link MessageComponent.twentyFourHour}.
   */
  Clock = "Clock"
}

/**
 * Where a {@link MessageComponent}'s message stands.
 */
export declare enum MessageStatus {
  /**
   * Its text still arrives.
   */
  Streaming = "Streaming",

  /**
   * It is whole; the default.
   */
  Complete = "Complete",

  /**
   * It failed, and can be tried again.
   */
  Error = "Error",

  /**
   * It was stopped before it was whole.
   */
  Cancelled = "Cancelled"
}

/**
 * The person's choice between light and dark, which
 * {@link AppearanceService.setModePreference} sets and resolves to a
 * {@link ThemeMode}.
 */
export declare enum ModePreference {
  /**
   * Always light.
   */
  Light = "Light",

  /**
   * Always dark.
   */
  Dark = "Dark",

  /**
   * Whatever the operating system prefers, following it when it changes.
   */
  System = "System"
}

/**
 * How an overlay lines up with its anchor across the side it opens on: along
 * the anchor's width when it opens above or below, and along its height when
 * it opens before or after. The overlay is then moved, if needed, to stay in
 * the window.
 */
export declare enum OverlayAlignment {
  /**
   * Centered on the anchor.
   */
  Center = "Center",

  /**
   * The overlay's start edge meets the anchor's: the left edge, or the right
   * one in a right-to-left layout, above or below the anchor, and the top edge
   * before or after it.
   */
  Start = "Start",

  /**
   * The overlay's end edge meets the anchor's: the right edge, or the left one
   * in a right-to-left layout, above or below the anchor, and the bottom edge
   * before or after it.
   */
  End = "End"
}

/**
 * The background of a {@link PanelCardComponent}, by where the card stands.
 */
export declare enum PanelSurface {
  /**
   * The window's background, for cards that stand on the shell, such as the
   * docks.
   */
  Shell = "Shell",

  /**
   * The panel background, for cards in the middle of the window, such as its
   * document groups; the default.
   */
  Panel = "Panel"
}

/**
 * What choosing a {@link PermissionOption} does to the request.
 */
export declare enum PermissionEffect {
  /**
   * Lets the agent act.
   */
  Allow = "Allow",

  /**
   * Stops the agent from acting.
   */
  Deny = "Deny"
}

/**
 * How risky the action a {@link PermissionRequest} asks for is, which its
 * card shows by an icon and text, never by color alone.
 */
export declare enum PermissionRisk {
  /**
   * Shown as Low risk.
   */
  Low = "Low",

  /**
   * Shown as Medium risk.
   */
  Medium = "Medium",

  /**
   * Shown as High risk. The card never focuses an allow first, and an
   * allow that may last, one that always allows or has no scope, asks the
   * person to confirm it.
   */
  High = "High"
}

/**
 * How long the answer a {@link PermissionOption} gives holds. An option
 * whose scope is `null` leaves it unknown.
 */
export declare enum PermissionScope {
  /**
   * For this request only.
   */
  Once = "Once",

  /**
   * For this request and every later one like it, which the app decides.
   */
  Always = "Always"
}

/**
 * Where a {@link PermissionRequest} stands. The card sets none of them; the
 * app binds a new request with the status it reached.
 */
export declare enum PermissionStatus {
  /**
   * Waiting for the person's answer; the card shows the options.
   */
  Pending = "Pending",

  /**
   * The answer is on its way; the card shows the options disabled, with the
   * kit's spinner and Sending your answer.
   */
  Sending = "Sending",

  /**
   * The answer couldn't be sent; the card says so, with a Retry button that
   * emits the same option's id again.
   */
  SendFailed = "SendFailed",

  /**
   * Answered; the card shows the outcome, such as Allowed once or Always
   * denied, with who decided and when, in place of the options.
   */
  Decided = "Decided",

  /**
   * Nobody answered in time; the card shows Expired in place of the
   * options.
   */
  Expired = "Expired",

  /**
   * The agent no longer asks; the card shows Withdrawn in place of the
   * options.
   */
  Withdrawn = "Withdrawn"
}

/**
 * Where a {@link PlanStep} stands, which a {@link PlanComponent} shows by
 * its marker.
 */
export declare enum PlanStepStatus {
  /**
   * Not started, shown with a dashed circle and named not started.
   */
  Pending = "Pending",

  /**
   * Under way, shown with the kit's spinner, by its active text when it has
   * one, and named in progress.
   */
  InProgress = "InProgress",

  /**
   * Done, shown with a filled check circle and named done.
   */
  Completed = "Completed"
}

/**
 * The direction of a {@link SashComponent}'s bar.
 */
export declare enum SashOrientation {
  /**
   * A vertical bar between panes side by side. Dragging it sideways, or
   * ArrowLeft and ArrowRight, resizes them.
   */
  Vertical = "Vertical",

  /**
   * A horizontal bar between panes one above the other. Dragging it up or
   * down, or ArrowUp and ArrowDown, resizes them.
   */
  Horizontal = "Horizontal"
}

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
 * The color of a {@link TabStatus}'s glyph, from the kit's status colors.
 */
export declare enum TabTone {
  /**
   * The tab's text color, such as for a page the network blocks.
   */
  Neutral = "Neutral",

  /**
   * `--nol-status-ok`.
   */
  Ok = "Ok",

  /**
   * `--nol-status-failed`, such as for a page that can't be reached.
   */
  Failed = "Failed"
}

/**
 * A {@link TerminalOutputRun}'s style flags, which add up, as
 * `TerminalOutputStyle.Bold | TerminalOutputStyle.Underline`. Their values
 * are a terminal's own SGR flags, so an app maps a terminal's style onto
 * them by dropping blink, `16`, which the view doesn't draw.
 */
export declare enum TerminalOutputStyle {
  /**
   * No style: the terminal's default look, `0`.
   */
  None = 0,

  /**
   * Bold text, `1`; a bold run in palette colors `0` to `7` draws in their
   * bright colors, `8` to `15`, as xterm draws bold text.
   */
  Bold = 1,

  /**
   * Dim text, `2`: its foreground at half its alpha over its background,
   * as xterm draws it, then lifted to the view's minimum contrast.
   */
  Dim = 2,

  /**
   * Italic text, `4`.
   */
  Italic = 4,

  /**
   * Underlined text, `8`.
   */
  Underline = 8,

  /**
   * Text with its foreground and background swapped, `32`; the default
   * colors swap too, so the text draws in the terminal's background on its
   * foreground.
   */
  Inverse = 32,

  /**
   * Hidden text, `64`: drawn transparent, yet still selected and copied.
   */
  Invisible = 64,

  /**
   * Struck-through text, `128`.
   */
  Strikethrough = 128,

  /**
   * Overlined text, `256`.
   */
  Overline = 256
}

/**
 * The mode a {@link Theme} is painted in, which
 * {@link AppearanceService.mode} resolves from the person's
 * {@link ModePreference}. It also sets the page's `color-scheme`.
 */
export declare enum ThemeMode {
  /**
   * The theme's light colors.
   */
  Light = "Light",

  /**
   * The theme's dark colors.
   */
  Dark = "Dark"
}

/**
 * The direction of a {@link ToolbarDirective}'s items, which decides the arrow
 * keys that move focus between them.
 */
export declare enum ToolbarOrientation {
  /**
   * Items in a row; ArrowLeft, ArrowRight, Home and End move focus.
   */
  Horizontal = "Horizontal",

  /**
   * Items in a column; ArrowUp, ArrowDown, Home and End move focus.
   */
  Vertical = "Vertical"
}

/**
 * What a {@link ToolCall} does, which picks the icon its card shows before
 * the title.
 */
export declare enum ToolCallKind {
  /**
   * Reads a file or another resource.
   */
  Read = "Read",

  /**
   * Changes a file.
   */
  Edit = "Edit",

  /**
   * Runs a command in a terminal.
   */
  RunCommand = "RunCommand",

  /**
   * Searches files, symbols or text.
   */
  Search = "Search",

  /**
   * Fetches a resource from the network.
   */
  Fetch = "Fetch",

  /**
   * Browses a web page.
   */
  Browse = "Browse",

  /**
   * Anything else, such as a module's own tool.
   */
  Other = "Other"
}

/**
 * Where a {@link ToolCall}'s output stands when the call doesn't hold it,
 * such as output the app loads only once the person opens the card.
 */
export declare enum ToolCallOutputState {
  /**
   * Nothing is loading; the default. A card whose call has no output in
   * this state emits {@link ToolCallComponent.outputRequest} when it first
   * shows open and when the person opens it.
   */
  Idle = "Idle",

  /**
   * The call has no output, so the card asks for none. A card whose call
   * in this state has no input, error or nested calls either has only its
   * title to show. While the whole title fits, it draws no twistie, keeping
   * its title where a call with one starts its title, and its header is a
   * plain label that doesn't toggle. Once the title is cut, it draws its
   * twistie and toggles, and opened, its header shows the whole title,
   * wrapped, with nothing in its body.
   */
  None = "None",

  /**
   * The app is loading the output; the card shows a spinner and Loading
   * output.
   */
  Loading = "Loading",

  /**
   * The output couldn't load; the card says so, with a Retry button that
   * emits {@link ToolCallComponent.outputRequest} again.
   */
  Failed = "Failed"
}

/**
 * Where a {@link ToolCall} stands, which its card shows by a symbol and text.
 */
export declare enum ToolCallStatus {
  /**
   * Waiting its turn, shown as Queued.
   */
  Pending = "Pending",

  /**
   * Waiting for the person to allow it, shown as Waiting for permission.
   */
  AwaitingPermission = "AwaitingPermission",

  /**
   * Waiting for the person to answer a question it asked, shown as Waiting
   * for your answer with a glyph of its own.
   */
  AwaitingAnswer = "AwaitingAnswer",

  /**
   * Under way, shown with the kit's spinner, as Running, and with the time
   * it has taken so far when it has a start time.
   */
  Running = "Running",

  /**
   * Ended well, shown as Done.
   */
  Succeeded = "Succeeded",

  /**
   * Ended with an error, shown as Failed; its card opens by default.
   */
  Failed = "Failed",

  /**
   * Stopped before it ended, shown as Cancelled.
   */
  Cancelled = "Cancelled",

  /**
   * Not run because the person denied it, shown as Denied with a glyph of
   * its own, apart from Failed and Cancelled.
   */
  Denied = "Denied"
}

/**
 * How {@link TypographyPainter.paint} writes sizes.
 */
export declare enum TypographySizing {
  /**
   * In CSS pixels: the root size, and the message and code sizes, are fixed
   * whatever the browser's font size setting. Any element can be painted.
   */
  Pixels = "Pixels",

  /**
   * Relative to the visitor's font size: the root size as a percentage of
   * the browser's font size setting, 100% at the default panel size, and the
   * message and code sizes in rem. At a browser font size of 16 pixels it
   * paints what {@link TypographySizing.Pixels} paints. Only the document's
   * root can be painted, which a website uses so that its text follows the
   * visitor's setting.
   */
  Relative = "Relative"
}

/**
 * Where {@link VirtualListComponent.reveal} puts a row in the list's view.
 */
export declare enum VirtualListAlign {
  /**
   * The row's top at the view's top.
   */
  Start = "Start",

  /**
   * The row's middle at the view's middle.
   */
  Center = "Center",

  /**
   * The row's bottom at the view's bottom.
   */
  End = "End",

  /**
   * The least scrolling that shows the row: none while it is in view, its
   * top at the view's top when it is above, and its bottom at the view's
   * bottom when it is below, or its top at the view's top when it is taller
   * than the view.
   */
  Nearest = "Nearest"
}

/**
 * Which end of a {@link VirtualListKind.Feed} holds its latest rows, which
 * it opens at, follows and jumps to.
 */
export declare enum VirtualListEdge {
  /**
   * The start, for a newest-first list such as an activity log: the feed
   * opens at its first row, a row added at the start shows while the view is
   * within 120px of the top, and rows added at the end, such as older pages,
   * never move the view.
   */
  Start = "Start",

  /**
   * The end, as a conversation has it; the default.
   */
  End = "End"
}

/**
 * The pattern a {@link VirtualListComponent} shows its rows in.
 */
export declare enum VirtualListKind {
  /**
   * A listbox of options with tree-row geometry, one of which can be
   * selected and chosen; the default.
   */
  Options = "Options",

  /**
   * A feed of articles, such as a conversation's messages, drawn by their
   * module. It opens at its latest end, or at a saved
   * {@link VirtualListComponent.position}, and follows that end while new
   * rows arrive.
   */
  Feed = "Feed"
}

/**
 * The options of one {@link Announcer.announce} call.
 */
export interface IAnnouncementOptions {
  /**
   * A key that no other message shares, such as a request's id; a message
   * whose key was already announced on the page is dropped, so a control
   * that a virtual list creates again, such as a row scrolled back into
   * view, is not announced twice. Not blank. The announcer remembers at
   * least the last 1000 keys; once 1000 more have come, it forgets the 1000
   * before them.
   */
  readonly key?: string;

  /**
   * The group of messages the message belongs to, such as the moves of one
   * control; a message replaces the message of its group that is still on
   * its way to assistive technology, so only the newest is spoken. Not
   * blank.
   */
  readonly group?: string;
}

/**
 * What a {@link MessageImageDirective} template receives for each image in a
 * text, written `![alt](src "title")`.
 *
 * @example
 * ```ts
 * import type { IMessageImageContext } from "@noldova/ui.components.angular";
 *
 * export function isDataImage(context: IMessageImageContext): boolean {
 *   return context.src.startsWith("data:image/");
 * }
 * ```
 */
export interface IMessageImageContext {
  /**
   * The image's address as the text wrote it, percent-encoded, which `let-src`
   * names: any address, never checked or fetched by the kit, so the app
   * decides what it may read and show.
   */
  readonly src: string;

  /**
   * The image's alt text, without its Markdown marks and with a space for
   * each line break, which `let-alt` names; empty when the text gave none.
   */
  readonly alt: string;

  /**
   * The image's title, which `let-title` names; null when it has none.
   */
  readonly title: string | null;
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
 * The optional parts of a {@link LinkReference}, which its constructor
 * takes; each part left out is null, or false for a flag. A reference with
 * no state is still being read.
 */
export interface ILinkReferenceOptions {
  /**
   * The code host's mark, drawn at the chip's start before the state's
   * icon; with none the chip has no mark and starts with the icon.
   */
  readonly mark?: LinkReferenceImage | null;

  /**
   * Whether the code host has a mark the app can't show yet, such as one
   * whose terms aren't accepted: with no mark the chip keeps the mark's
   * place as a dashed square.
   */
  readonly isMarkPending?: boolean;

  /**
   * Where the item stands, such as Open or Merged, which colors its icon
   * and its card's badge; with none the chip shows its icon muted and has no
   * card.
   */
  readonly state?: LinkReferenceState | null;

  /**
   * The item's title, which the chip shows after its reference, cut to the
   * chip's width, and the card shows whole.
   */
  readonly title?: string | null;

  /**
   * The card's line saying where the item is, after its badge, such as
   * "example/app #12" or "Code host · example/app !482".
   */
  readonly location?: string | null;

  /**
   * Who made the item, whom the card's foot shows with a round face.
   */
  readonly author?: LinkReferenceAuthor | null;

  /**
   * When the item last changed, which the card's corner shows as an age,
   * such as "2h ago", kept current, with the full time in a tooltip.
   */
  readonly time?: Date | null;

  /**
   * What a change adds and removes, which the card's foot shows in two
   * pills, such as "+106 −1" and "7 files".
   */
  readonly diff?: LinkReferenceDiff | null;

  /**
   * How many comments the item has, which the card's foot shows in a pill
   * with a comment icon, zero included.
   */
  readonly comments?: number | null;

  /**
   * How long a workflow run or a job took, in seconds, which the card's foot
   * shows in a pill, such as "9m 12s", "45s" or "1h 4m". A finite number,
   * 0 or more; the reference's constructor throws a
   * {@link LinkReferenceException} for any other.
   */
  readonly duration?: number | null;

  /**
   * What the card's foot offers to do with the item, such as "Open in
   * Pipelines": a link in a pill, last in the foot, that activates its
   * address through the Markdown view's `linkActivate`, as a link in the
   * reply does. From the chip, Tab moves focus to it while the card shows.
   */
  readonly action?: LinkReferenceAction | null;

  /**
   * What else the item's card says of it, each in a pill in the foot before
   * the changes and comments, such as "Build succeeded" with its icon in its
   * tone, or "1 of 2 approved"; none when left out.
   */
  readonly statuses?: readonly LinkReferenceStatus[];

  /**
   * A muted line at the start of the card's foot in place of the author,
   * such as "Read from the local repository"; it wraps within the card.
   */
  readonly footnote?: string | null;

  /**
   * Lines under the card's title, each a muted label and its value, such as
   * "Author" and who made a commit or "On" and its branches; a value wraps
   * within the card. None when left out.
   */
  readonly details?: readonly LinkReferenceDetail[];

  /**
   * A work item's state, such as Azure DevOps's "Active": a dot in its tone
   * and its label, after the chip and first in the card's foot, which then
   * puts the author at its end.
   */
  readonly workItemState?: LinkReferenceWorkItemState | null;

  /**
   * The item's own page, which the card's title, its state badge and the
   * number in its place, such as `#12`, open as links. Each of the card's
   * links opens through the Markdown view's `linkActivate`, as the chip
   * does; a part with no address is plain text.
   */
  readonly itemHref?: string | null;

  /**
   * The page of the item's repository or project, which the card opens from
   * the name in its place. The place's last word, when it is `#` or `!`
   * and digits, as in "example/app #12" or "group/app !7", is the item's
   * number, and the text before it the name; with no such word, as in
   * "Team #frontend", the whole place is the name.
   */
  readonly locationHref?: string | null;

  /**
   * The author's profile, which the card's author, the avatar and the name
   * as one link, opens.
   */
  readonly authorHref?: string | null;

  /**
   * The page of a change's files, which both of the card's change pills
   * open.
   */
  readonly diffHref?: string | null;

  /**
   * The page of the item's comments, which the card's comment pill opens.
   */
  readonly commentsHref?: string | null;

  /**
   * Whether the chip shows the item's card, true when left out; false for a
   * chip the design gives no card, such as a branch or a server. A
   * reference with no card can't have the parts only the card shows: a
   * place, an author, a time, changes, comments, a duration, an action,
   * statuses, a footnote, details or any of the card's addresses.
   */
  readonly hasCard?: boolean;
}

/**
 * The app's reader of links to items on code hosts, which the Markdown
 * view's and the message's `references` input takes.
 */
export interface ILinkReferenceSource {
  /**
   * What a link points at, for a link with this address and text. For a
   * link to an item it knows, it gives a signal of the item: a reference
   * with no state while it reads, then the item, or null when the link turns
   * out to be a plain one. For any other link it gives null, and the link
   * stays a plain link. The view asks once for each address and text.
   *
   * @param url The link's address, as the text writes it.
   * @param text The link's text.
   * @returns A signal of the item, or null for a link the reader doesn't
   * know.
   * @example
   * ```ts
   * import type { Signal } from "@angular/core";
   * import type { ILinkReferenceSource, LinkReference } from "@noldova/ui.components.angular";
   *
   * export class KnownReferences implements ILinkReferenceSource {
   *   private readonly items: ReadonlyMap<string, Signal<LinkReference | null>> = new Map();
   *
   *   public find(url: string): Signal<LinkReference | null> | null {
   *     return this.items.get(url) ?? null;
   *   }
   * }
   * ```
   */
  find(url: string, text: string): Signal<LinkReference | null> | null;

  /**
   * The references a run of plain text holds, as links to make of it, in the
   * order of the text and none overlapping; an app that gives none leaves
   * the text as it is. The view asks about the text a reply writes outside
   * code spans, code blocks, links, autolinks, escapes and HTML, run by run,
   * and again as a streaming reply's text grows. The view shows HTML as
   * text, but leaves out of what it asks about each tag, the text from an
   * open tag to its closing tag, and the lines of an HTML block, from the
   * line that starts it to its end; a tag with no closing tag is only
   * itself. Each part of a run between HTML is asked about on its own, so a
   * run may take several calls. It makes each match a
   * link to its `url`, with the matched text as its text, then asks
   * {@link ILinkReferenceSource.find} about that link as about any other,
   * which may draw it as a chip or leave it a plain link. A match that
   * overlaps one before it, or doesn't fit inside the text, is ignored. The
   * text a reply copies stays the Markdown as written. The view reads its
   * text again when it is given another source.
   *
   * @param text A run of plain text, as the reply writes it.
   * @returns The references in it, in the order of the text.
   * @example
   * ```ts
   * import type { Signal } from "@angular/core";
   * import { type ILinkReferenceSource, type LinkReference, LinkReferenceMatch } from "@noldova/ui.components.angular";
   *
   * export class IssueReferences implements ILinkReferenceSource {
   *   private readonly items: ReadonlyMap<string, Signal<LinkReference | null>> = new Map();
   *
   *   public find(url: string): Signal<LinkReference | null> | null {
   *     return this.items.get(url) ?? null;
   *   }
   *
   *   public findText(text: string): readonly LinkReferenceMatch[] {
   *     return [...text.matchAll(/\b([\w.-]+\/[\w.-]+)#(\d+)\b/gu)].map(t =>
   *       new LinkReferenceMatch(t.index, t[0].length, `https://github.com/${t[1]}/issues/${t[2]}`));
   *   }
   * }
   * ```
   */
  findText?(text: string): readonly LinkReferenceMatch[];
}

/**
 * The optional parts of a {@link MentionCandidate}, which its constructor
 * takes; each part left out takes the default its property gives.
 */
export interface IMentionCandidateOptions {
  /**
   * The address of the image the candidate's avatar shows.
   */
  readonly image?: string;

  /**
   * The initials the candidate's avatar shows without an image.
   */
  readonly initials?: string;

  /**
   * Which author color, from 1 to 8, the candidate's avatar is tinted with.
   */
  readonly color?: number;

  /**
   * The color of the candidate's avatar in the filled look, which it takes
   * when this is given.
   */
  readonly avatarColor?: AvatarColor;

  /**
   * The heading the list shows the candidate under.
   */
  readonly section?: string;

  /**
   * A short note the list shows after the candidate's name, such as why it
   * is unavailable. Not blank.
   */
  readonly note?: string;

  /**
   * Whether the candidate is unavailable now.
   */
  readonly unavailable?: boolean;
}

/**
 * The optional parts of a {@link PermissionRequest}, which its constructor
 * takes; each part left out takes the default its property gives.
 *
 * @example
 * ```ts
 * import { type IPermissionRequestOptions, PermissionDecision, PermissionStatus } from "@noldova/ui.components.angular";
 *
 * export const sending: IPermissionRequestOptions = {
 *   details: "rm -rf build/",
 *   status: PermissionStatus.Sending,
 *   decision: new PermissionDecision("allow-once", "You", new Date("2026-10-13T09:00:00Z"))
 * };
 * ```
 */
export interface IPermissionRequestOptions {
  /**
   * The requester's own name for the request, as it gave it, such as
   * `commandExecution` or a tool's name, which the card shows under the
   * heading. Not blank.
   */
  readonly kind?: string;

  /**
   * Why the agent asks, in a sentence or two. Not blank.
   */
  readonly description?: string;

  /**
   * The exact command, path, address or app the agent would act on, which
   * the card shows as code. Not blank.
   */
  readonly details?: string;

  /**
   * The answers the person can give, in order, each with its own id; Allow
   * once, Always allow and Deny, from {@link PermissionOption.defaults},
   * when left out.
   */
  readonly options?: readonly PermissionOption[];

  /**
   * The id of the option the card focuses first, which must be one of the
   * options. At high risk the card takes it only when it denies.
   */
  readonly defaultOptionId?: string;

  /**
   * Where the request stands; pending when left out.
   */
  readonly status?: PermissionStatus;

  /**
   * The answer the person gave, which a request that is sending, failed to
   * send or decided needs, and no other request takes. Its option must be
   * one of the options.
   */
  readonly decision?: PermissionDecision;

  /**
   * When the request expires; the card shows the minutes left while it is
   * pending. The app sets {@link PermissionStatus.Expired} itself.
   */
  readonly expiresAt?: Date;
}

/**
 * The optional parts of a {@link ToolCall}, which its constructor takes;
 * each part left out takes the default its property gives.
 *
 * @example
 * ```ts
 * import type { IToolCallOptions } from "@noldova/ui.components.angular";
 *
 * export const finished: IToolCallOptions = {
 *   target: "src/app/main.ts",
 *   startedAt: new Date("2026-10-13T09:00:00Z"),
 *   endedAt: new Date("2026-10-13T09:00:02Z"),
 *   output: "export const answer: number = 42;\n"
 * };
 * ```
 */
export interface IToolCallOptions {
  /**
   * The file, address or command the call acts on. Not blank.
   */
  readonly target?: string;

  /**
   * A short note after the title, which reads quieter than it, such as
   * "waiting for your answer". Not blank.
   */
  readonly note?: string;

  /**
   * When the call started.
   */
  readonly startedAt?: Date;

  /**
   * When the call ended, which needs a start time no later than it.
   */
  readonly endedAt?: Date;

  /**
   * What the call was given.
   */
  readonly input?: ToolCallInput;

  /**
   * What the call gave back so far, with its own line breaks.
   */
  readonly output?: string;

  /**
   * Where output the call doesn't hold stands.
   */
  readonly outputState?: ToolCallOutputState;

  /**
   * Whether the card shows the output with the owner's
   * {@link ToolCallOutputDirective} template instead of as text.
   */
  readonly hasOutputControl?: boolean;

  /**
   * The error a failed call reports, shown first in its body.
   */
  readonly error?: string;

  /**
   * Whether the person can cancel the call while it runs.
   */
  readonly canCancel?: boolean;

  /**
   * The calls this call made, in order.
   */
  readonly children?: readonly ToolCall[];
}

/**
 * What a {@link ToolCallOutputDirective} template receives.
 *
 * @example
 * ```ts
 * import type { IToolCallOutputContext } from "@noldova/ui.components.angular";
 *
 * export function outputOf(context: IToolCallOutputContext): string {
 *   return context.$implicit.output ?? "";
 * }
 * ```
 */
export interface IToolCallOutputContext {
  /**
   * The call whose output the template shows, which `let-call` in the
   * template names.
   */
  readonly $implicit: ToolCall;
}

/**
 * What a {@link VirtualListSource} tells the objects that observe it once its
 * items change. The kit's list observes its source itself; a module
 * implements this only to follow a source outside a list.
 */
export interface IVirtualListObserver {
  /**
   * Called once items were added, after the source's length grew.
   *
   * @param at The position of the first added item; the items that were at
   * that position or after it now sit `count` positions later.
   * @param count How many items were added, 1 or more.
   * @example
   * ```ts
   * import type { IVirtualListObserver } from "@noldova/ui.components.angular";
   *
   * export class LengthLog implements IVirtualListObserver {
   *   public readonly lines: string[] = [];
   *
   *   public onInserted(at: number, count: number): void {
   *     this.lines.push(`${count} added at ${at}`);
   *   }
   *
   *   public onRemoved(at: number, count: number): void {
   *     this.lines.push(`${count} removed at ${at}`);
   *   }
   *
   *   public onUpdated(at: number, count: number): void {
   *     this.lines.push(`${count} changed at ${at}`);
   *   }
   * }
   * ```
   */
  onInserted(at: number, count: number): void;

  /**
   * Called once items were removed, after the source's length shrank.
   *
   * @param at The position the first removed item had; the items after the
   * removed ones now sit `count` positions earlier.
   * @param count How many items were removed, 1 or more.
   * @example
   * ```ts
   * import type { IVirtualListObserver } from "@noldova/ui.components.angular";
   *
   * export class RemovalCounter implements IVirtualListObserver {
   *   public removed: number = 0;
   *
   *   public onInserted(): void {
   *   }
   *
   *   public onRemoved(_: number, count: number): void {
   *     this.removed += count;
   *   }
   *
   *   public onUpdated(): void {
   *   }
   * }
   * ```
   */
  onRemoved(at: number, count: number): void;

  /**
   * Called once items changed in place: their positions and the length stay,
   * and their content must be read again.
   *
   * @param at The position of the first changed item.
   * @param count How many items in a row changed, 1 or more.
   * @example
   * ```ts
   * import type { IVirtualListObserver } from "@noldova/ui.components.angular";
   *
   * export class StaleMarker implements IVirtualListObserver {
   *   public readonly stale: Set<number> = new Set();
   *
   *   public onInserted(): void {
   *     this.stale.clear();
   *   }
   *
   *   public onRemoved(): void {
   *     this.stale.clear();
   *   }
   *
   *   public onUpdated(at: number, count: number): void {
   *     for (let index = at; index < at + count; index++)
   *       this.stale.add(index);
   *   }
   * }
   * ```
   */
  onUpdated(at: number, count: number): void;
}

/**
 * What a row of the kit's list gives the template of a
 * {@link VirtualRowDirective}: the item, its position, the height the list
 * holds for its row and the ids that name and describe a feed's article.
 *
 * @typeParam T The type of the source's items.
 * @example
 * ```ts
 * import type { IVirtualRowContext } from "@noldova/ui.components.angular";
 *
 * export function describeRow(context: IVirtualRowContext<string>): string {
 *   return `${context.index + 1}: ${context.$implicit}`;
 * }
 * ```
 */
export interface IVirtualRowContext<T> {
  /**
   * The item the row shows, which `let-item` in the template names.
   */
  readonly $implicit: T;

  /**
   * The item's position in the whole list, from 0.
   */
  readonly index: number;

  /**
   * The height in CSS pixels the list holds for the row, the row's padding
   * included: its height when it was last measured, or its source's
   * estimate until then. While images in the row still load and decode, the
   * list keeps the row at least this tall, so the rows after it don't move.
   */
  readonly height: number;

  /**
   * The id the template gives the element that names the row, such as a
   * message's author and time. In a feed the row's article is labeled by
   * it (`aria-labelledby`), so the template must give some element this id;
   * an options list ignores it.
   */
  readonly labelId: string;

  /**
   * The id the template gives the element that describes the row, when its
   * {@link VirtualRowDirective.described} is true; a feed's article is then
   * described by it (`aria-describedby`).
   */
  readonly descriptionId: string;
}

/**
 * A floating pane, such as a menu, a popover, a tooltip or a dropdown, that
 * opens against an origin element and stays beside it. It places the pane on
 * the side the anchoring asks for when the pane fits there within the bounds
 * {@link OverlayBoundsService.boundsFor} gives, or else on another side, and
 * places it again when the window resizes or the pane's size changes. The
 * owner creates one per pane it shows, listens to its events, and disposes of
 * it when done.
 */
export declare class AnchoredOverlay {
  /**
   * Creates the overlay, closed, with an empty pane in the overlay container.
   *
   * @param injector The injector the overlay and the content it opens are
   * created with, usually the owner's own.
   * @param panelClass The CSS class of the pane, which the pane's styles
   * select, such as `nol-menu-pane`.
   * @example
   * ```ts
   * import { Injectable, Injector, inject } from "@angular/core";
   * import { AnchoredOverlay } from "@noldova/ui.components.angular";
   *
   * @Injectable({ providedIn: "root" })
   * export class PeekService {
   *   private readonly injector: Injector = inject(Injector);
   *
   *   public createOverlay(): AnchoredOverlay {
   *     const overlay = new AnchoredOverlay(this.injector, "nol-peek-pane");
   *     overlay.outsidePointerEvents.subscribe(() => overlay.dispose());
   *     overlay.originLost.subscribe(() => overlay.dispose());
   *     return overlay;
   *   }
   * }
   * ```
   */
  public constructor(injector: Injector, panelClass: string);

  /**
   * The CDK overlay underneath, for what this class does not cover, such as
   * attaching content before calling {@link AnchoredOverlay.follow}.
   */
  public get overlayRef(): OverlayRef;

  /**
   * The pane, which holds the content while it is open. It no longer exists
   * once the overlay is disposed of.
   */
  public get element(): HTMLElement;

  /**
   * Whether content is open in the pane.
   */
  public get isOpen(): boolean;

  /**
   * Where the pane was last placed, in viewport CSS pixels, with the side
   * chosen and the height the pane was limited to; null while the overlay
   * follows no origin, such as before it opens and after it closes.
   */
  public get placement(): OverlayPlacement | null;

  /**
   * The origin's box and the pane's, in viewport CSS pixels, as the last
   * placement measured them, so a caller can read them without laying the
   * page out; null while the overlay follows no origin. They are read-only
   * copies, and change only when the overlay is placed: when it opens or
   * follows, on {@link AnchoredOverlay.reposition}, on a window resize,
   * and when its own size changes. After a layout change that doesn't
   * place it again, such as the origin moving with no scroll, they may
   * differ from the page.
   */
  public get placedBoxes(): readonly [DOMRectReadOnly, DOMRectReadOnly] | null;

  /**
   * Emits each time the content leaves the pane, by
   * {@link AnchoredOverlay.close} or {@link AnchoredOverlay.dispose}.
   */
  public get detachments(): Observable<void>;

  /**
   * Emits each click outside the pane while content is open in it,
   * including clicks on the origin.
   */
  public get outsidePointerEvents(): Observable<MouseEvent>;

  /**
   * Emits each key pressed in the document while content is open and this
   * is the most recently opened overlay that listens for keys.
   */
  public get keydownEvents(): Observable<KeyboardEvent>;

  /**
   * Emits when the followed origin stops being visible, or a scroll outside
   * the pane moves it. The overlay stays open; its owner usually closes it.
   */
  public get originLost(): Observable<void>;

  /**
   * Opens a component in the pane and follows the origin, as
   * {@link AnchoredOverlay.follow} describes. The overlay must be closed.
   *
   * @param portal The component to open, with its injector.
   * @param origin The element the pane opens against.
   * @param anchoring The side and alignment the pane asks for, its gap from
   * the origin and its offset along that side.
   * @param area Returns the rectangle, in viewport CSS pixels, to place the
   * pane against instead of the origin's own, read again each time the pane
   * is placed; the origin's when left out or null.
   * @returns The opened component, which the caller sets inputs on; it is
   * destroyed when the overlay closes.
   * @example
   * ```ts
   * import { ComponentPortal } from "@angular/cdk/portal";
   * import type { ComponentRef } from "@angular/core";
   * import { type AnchoredOverlay, OverlayAlignment, OverlayAnchoring, OverlaySide, TooltipComponent } from "@noldova/ui.components.angular";
   *
   * export function showUnderRow(overlay: AnchoredOverlay, row: Element, text: string): ComponentRef<TooltipComponent> {
   *   const tooltip = overlay.openComponent(new ComponentPortal(TooltipComponent), row, new OverlayAnchoring(OverlaySide.below, OverlayAlignment.Center, 0), () => {
   *     const edges = row.getBoundingClientRect();
   *     return new DOMRect(0, edges.top, document.documentElement.clientWidth, edges.height);
   *   });
   *   tooltip.setInput("text", text);
   *   return tooltip;
   * }
   * ```
   */
  public openComponent<T>(portal: ComponentPortal<T>, origin: Element, anchoring: OverlayAnchoring, area?: (() => DOMRect) | null): ComponentRef<T>;

  /**
   * Opens a template in the pane and follows the origin, as
   * {@link AnchoredOverlay.follow} describes. The overlay must be closed.
   *
   * @param portal The template to open, with its view container and context.
   * @param origin The element the pane opens against.
   * @param anchoring The side and alignment the pane asks for, its gap from
   * the origin and its offset along that side.
   * @returns The template's view, which is destroyed when the overlay closes.
   * @example
   * ```ts
   * import { TemplatePortal } from "@angular/cdk/portal";
   * import type { EmbeddedViewRef, TemplateRef, ViewContainerRef } from "@angular/core";
   * import { type AnchoredOverlay, OverlayAlignment, OverlayAnchoring, type OverlayBoundsService, OverlaySide } from "@noldova/ui.components.angular";
   *
   * export function openAbove(overlay: AnchoredOverlay, details: TemplateRef<unknown>, container: ViewContainerRef, host: HTMLElement, bounds: OverlayBoundsService): EmbeddedViewRef<unknown> {
   *   return overlay.openTemplate(new TemplatePortal(details, container), host, new OverlayAnchoring(OverlaySide.above, OverlayAlignment.End, bounds.gap));
   * }
   * ```
   */
  public openTemplate<T>(portal: TemplatePortal<T>, origin: Element, anchoring: OverlayAnchoring): EmbeddedViewRef<T>;

  /**
   * Places the pane against an origin and keeps it there, after it stops
   * following the previous one: it places the pane again when the window
   * resizes or, in the next animation frame, when the pane's size changes,
   * and emits {@link AnchoredOverlay.originLost} when the origin hides or a
   * scroll moves it. It follows until the content closes. Opening calls it;
   * call it after attaching through {@link AnchoredOverlay.overlayRef}, or to
   * move open content to another origin or anchoring.
   *
   * @param origin The element the pane is placed against.
   * @param anchoring The side and alignment the pane asks for, its gap from
   * the origin and its offset along that side.
   * @param area Returns the rectangle, in viewport CSS pixels, to place the
   * pane against instead of the origin's own, read again each time the pane
   * is placed; the origin's when left out or null.
   * @example
   * ```ts
   * import { type AnchoredOverlay, OverlayAlignment, OverlayAnchoring, OverlaySide } from "@noldova/ui.components.angular";
   *
   * export function moveToPointer(overlay: AnchoredOverlay, host: Element, event: MouseEvent): void {
   *   const point = new DOMRect(event.clientX, event.clientY, 0, 0);
   *   overlay.follow(host, new OverlayAnchoring(OverlaySide.below, OverlayAlignment.Start, 0), () => point);
   * }
   * ```
   */
  public follow(origin: Element, anchoring: OverlayAnchoring, area?: (() => DOMRect) | null): void;

  /**
   * Places the pane again against the origin it follows, such as after its
   * content changed size, and gives the pane the origin's writing direction,
   * so its content and the overlays it opens follow it; nothing happens
   * while it follows no origin.
   *
   * @example
   * ```ts
   * import type { ComponentRef } from "@angular/core";
   * import type { AnchoredOverlay } from "@noldova/ui.components.angular";
   *
   * export function showText(overlay: AnchoredOverlay, tooltip: ComponentRef<unknown>, text: string): void {
   *   tooltip.setInput("text", text);
   *   tooltip.changeDetectorRef.detectChanges();
   *   overlay.reposition();
   * }
   * ```
   */
  public reposition(): void;

  /**
   * Closes the content and stops following its origin; the overlay can
   * open again. Nothing happens while it is closed.
   *
   * @example
   * ```ts
   * import type { AnchoredOverlay } from "@noldova/ui.components.angular";
   *
   * export function closeOnEscape(overlay: AnchoredOverlay): void {
   *   overlay.keydownEvents.subscribe(event => {
   *     if (event.key === "Escape")
   *       overlay.close();
   *   });
   * }
   * ```
   */
  public close(): void;

  /**
   * Closes the content and removes the pane for good, completing the
   * overlay's events except {@link AnchoredOverlay.originLost}; the overlay
   * cannot open again.
   *
   * @example
   * ```ts
   * import { DestroyRef, Directive, Injector, inject } from "@angular/core";
   * import { AnchoredOverlay } from "@noldova/ui.components.angular";
   *
   * @Directive({ selector: "[nolPeek]" })
   * export class PeekDirective {
   *   private readonly overlay: AnchoredOverlay = new AnchoredOverlay(inject(Injector), "nol-peek-pane");
   *
   *   public constructor() {
   *     inject(DestroyRef).onDestroy(() => this.overlay.dispose());
   *   }
   * }
   * ```
   */
  public dispose(): void;
}

/**
 * Announces messages to assistive technology through the page's one live
 * region, the CDK's `LiveAnnouncer`, which the kit's controls and the app
 * share. Every message reaches the region at once, and the region speaks
 * what it holds 100 ms after its last change. A message that arrives before
 * the region has spoken joins the ones still waiting, in the order they
 * arrived, so a message from one control never silently replaces another
 * control's; the joined messages are spoken assertively when any of them is.
 */
export declare class Announcer {
  /**
   * Announces a message. When the region has not yet spoken the messages
   * before it, the message joins them, or replaces the one of its
   * {@link IAnnouncementOptions.group}, and the region holds them all
   * again; a message whose {@link IAnnouncementOptions.key} was already
   * announced is dropped.
   *
   * @param message The text to speak, not blank. Messages are joined by a
   * space after one that ends a sentence, and by a period and a space
   * otherwise.
   * @param politeness How urgently to speak it.
   * @param options Its key and group; none when not given.
   * @throws ArgumentException synchronously when the message, the key or
   * the group is blank.
   * @example
   * ```ts
   * import { Component, inject } from "@angular/core";
   * import { AnnouncementPoliteness, Announcer } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-save-button",
   *   template: "<button type=\"button\" (click)=\"save()\">Save</button>"
   * })
   * export class SaveButtonComponent {
   *   private readonly announcer: Announcer = inject(Announcer);
   *
   *   protected save(): void {
   *     this.announcer.announce("Saved", AnnouncementPoliteness.Polite);
   *   }
   * }
   * ```
   * @example
   * ```ts
   * import { Injectable, inject } from "@angular/core";
   * import { AnnouncementPoliteness, Announcer } from "@noldova/ui.components.angular";
   *
   * @Injectable({ providedIn: "root" })
   * export class RequestAnnouncements {
   *   private readonly announcer: Announcer = inject(Announcer);
   *
   *   public announceRequest(id: string, requester: string): void {
   *     this.announcer.announce(`Permission request from ${requester}`, AnnouncementPoliteness.Assertive, { key: id });
   *   }
   *
   *   public announceProgress(percent: number): void {
   *     this.announcer.announce(`${percent}% copied`, AnnouncementPoliteness.Polite, { group: "copy-progress" });
   *   }
   * }
   * ```
   */
  public announce(message: string, politeness: AnnouncementPoliteness, options?: IAnnouncementOptions): void;
}

/**
 * The window's appearance: its theme, light or dark mode, and typography.
 * The one instance, in the root injector, paints them on the document's root
 * element as CSS custom properties, the `color-scheme`, shape attributes and
 * the root font size, and paints them again whenever they change.
 *
 * It also shows scroll area thumbs while they scroll. One passive listener on
 * the document catches every scroll and marks the element that scrolled, or
 * the root element when the document itself scrolls, with a
 * `data-nol-scrolling` attribute. The mark shows that element's thumb and
 * leaves it one second after the last scroll, when the thumb fades out, or
 * hides at once when reduced motion is preferred, unless the pointer rests on
 * the element. The listener and every mark go when the application ends.
 */
export declare class AppearanceService {
  /**
   * The theme in effect; {@link DefaultTheme.theme} until
   * {@link AppearanceService.setTheme} sets another.
   */
  public readonly theme: Signal<Theme>;

  /**
   * The person's choice of mode; System until
   * {@link AppearanceService.setModePreference} sets another.
   */
  public readonly modePreference: Signal<ModePreference>;

  /**
   * The text sizes and fonts in effect; the default {@link Typography} until
   * {@link AppearanceService.setTypography} sets another. Its `rootSize` is
   * the CSS pixels of 1rem, which converts rem lengths to pixels.
   */
  public readonly typography: Signal<Typography>;

  /**
   * The mode in effect: the preferred mode, or for System the operating
   * system's color scheme, which it follows as it changes. Outside a browser,
   * as when a page is prerendered, System is Light.
   */
  public readonly mode: Signal<ThemeMode>;

  /**
   * How many times the service has painted the document: 0 until its first
   * paint, then one more each time it paints the theme and mode or the
   * typography. Code that reads painted values, such as a look's size in
   * pixels, reads this signal so it runs again after each paint, and never
   * before the paint it depends on.
   */
  public readonly painted: Signal<number>;

  /**
   * Creates the service, which Angular does the first time it is injected.
   * It paints the appearance at once and erases it when the application is
   * destroyed; the window injects it as it starts.
   *
   * @example
   * ```ts
   * import { Component, inject } from "@angular/core";
   * import { AppearanceService } from "@noldova/ui.components.angular";
   *
   * @Component({ selector: "nol-mode-label", template: "<span>{{ appearance.mode() }}</span>" })
   * export class ModeLabelComponent {
   *   protected readonly appearance: AppearanceService = inject(AppearanceService);
   * }
   * ```
   */
  public constructor();

  /**
   * Changes the theme. A color, look or shape the theme lacks comes from
   * {@link DefaultTheme.theme}.
   *
   * @param theme The theme.
   * @example
   * ```ts
   * import { type AppearanceService, Theme } from "@noldova/ui.components.angular";
   *
   * export function useContrast(appearance: AppearanceService): void {
   *   appearance.setTheme(new Theme("contrast.high", "High contrast", new Map([["text", "#000000"]]), new Map([["text", "#FFFFFF"]]), new Map(), new Map()));
   * }
   * ```
   * @example
   * ```ts
   * import { type AppearanceService, DefaultTheme } from "@noldova/ui.components.angular";
   *
   * export function resetTheme(appearance: AppearanceService): void {
   *   // @ts-expect-error
   *   appearance.theme.set(DefaultTheme.theme);
   * }
   * ```
   */
  public setTheme(theme: Theme): void;

  /**
   * Changes the preferred mode, which decides {@link AppearanceService.mode}.
   *
   * @param preference Light, Dark, or System to follow the operating system.
   * @example
   * ```ts
   * import { type AppearanceService, ModePreference } from "@noldova/ui.components.angular";
   *
   * export function followSystem(appearance: AppearanceService): void {
   *   appearance.setModePreference(ModePreference.System);
   * }
   * ```
   */
  public setModePreference(preference: ModePreference): void;

  /**
   * Changes the text sizes and fonts.
   *
   * @param typography The typography.
   * @example
   * ```ts
   * import { type AppearanceService, FontChoice, Typography } from "@noldova/ui.components.angular";
   *
   * export function useLargerText(appearance: AppearanceService): void {
   *   appearance.setTypography(new Typography(15, 16, 15, FontChoice.Noldova, FontChoice.System));
   * }
   * ```
   */
  public setTypography(typography: Typography): void;
}

/**
 * A {@link VirtualListSource} over items held in memory, for short lists,
 * demonstrations and tests. It keeps its own copy of the items and reports
 * each change it makes to the objects that observe it.
 *
 * @typeParam T The type of the items.
 */
export declare class ArrayVirtualListSource<T> extends VirtualListSource<T> {
  /**
   * Creates the source with a copy of the items.
   *
   * @param items The items, first to last.
   * @param keyOf Gives an item's key, which stays the same while the item
   * exists and differs from every other item's.
   * @param estimate The height in CSS pixels a row takes until it is
   * measured, above 0; 120 when left out.
   * @throws VirtualListException synchronously when the estimate is not a
   * number above 0.
   * @example
   * ```ts
   * import { ArrayVirtualListSource } from "@noldova/ui.components.angular";
   *
   * export const files: ArrayVirtualListSource<string> = new ArrayVirtualListSource(["README.md", "package.json"], t => t, 26);
   * ```
   */
  public constructor(items: readonly T[], keyOf: (item: T) => string, estimate?: number);

  /**
   * Reads the items from one position up to another.
   *
   * @param start The position of the first item to read.
   * @param end The position after the last item to read.
   * @returns A promise of the items from `start` up to, but not including,
   * `end`, which the list does not change.
   * @example
   * ```ts
   * import { ArrayVirtualListSource } from "@noldova/ui.components.angular";
   *
   * export async function readFirstAsync(): Promise<readonly string[]> {
   *   const source = new ArrayVirtualListSource(["a", "b", "c"], t => t);
   *   return await source.readAsync(0, 2);
   * }
   * ```
   */
  public readAsync(start: number, end: number): Promise<readonly T[]>;

  /**
   * Gives an item's key through the function the source was created with.
   *
   * @param item One of the source's items.
   * @returns The item's key.
   * @example
   * ```ts
   * import { ArrayVirtualListSource } from "@noldova/ui.components.angular";
   *
   * export const key: string = new ArrayVirtualListSource([{ id: "m1", text: "Hello" }], t => t.id).keyOf({ id: "m1", text: "Hello" });
   * ```
   */
  public keyOf(item: T): string;

  /**
   * Adds items at a position and reports them as inserted.
   *
   * @param at The position of the first new item, from 0 to the length; the
   * items from there on move after the new ones.
   * @param items The items to add, at least one.
   * @throws VirtualListException synchronously when the position is outside
   * the list or there are no items; the source is then unchanged.
   * @throws Whatever an observer threw, synchronously, once every observer
   * was told; the change stays made, and the error is the first observer's
   * when several throw.
   * @example
   * ```ts
   * import { ArrayVirtualListSource } from "@noldova/ui.components.angular";
   *
   * export function appendReply(messages: ArrayVirtualListSource<string>, reply: string): void {
   *   messages.insert(messages.length(), [reply]);
   * }
   * ```
   */
  public insert(at: number, items: readonly T[]): void;

  /**
   * Removes items from a position and reports them as removed.
   *
   * @param at The position of the first item to remove.
   * @param count How many items to remove, 1 or more, all inside the list.
   * @throws VirtualListException synchronously when the items are not all
   * inside the list or the count is not 1 or more; the source is then
   * unchanged.
   * @throws Whatever an observer threw, synchronously, once every observer
   * was told; the change stays made, and the error is the first observer's
   * when several throw.
   * @example
   * ```ts
   * import { ArrayVirtualListSource } from "@noldova/ui.components.angular";
   *
   * export function dropOldest(messages: ArrayVirtualListSource<string>): void {
   *   messages.remove(0, 1);
   * }
   * ```
   */
  public remove(at: number, count: number): void;

  /**
   * Replaces items in place and reports them as updated.
   *
   * @param at The position of the first item to replace.
   * @param items The new items, at least one, which replace as many items
   * from `at` on, all inside the list.
   * @throws VirtualListException synchronously when the replaced items are
   * not all inside the list or there are no items; the source is then
   * unchanged.
   * @throws Whatever an observer threw, synchronously, once every observer
   * was told; the change stays made, and the error is the first observer's
   * when several throw.
   * @example
   * ```ts
   * import { ArrayVirtualListSource } from "@noldova/ui.components.angular";
   *
   * export function growLast(messages: ArrayVirtualListSource<string>, text: string): void {
   *   messages.replace(messages.length() - 1, [text]);
   * }
   * ```
   */
  public replace(at: number, items: readonly T[]): void;
}

/**
 * An avatar, `nol-avatar`, for a person or an agent: a circle at every
 * size, filled with its {@link AvatarColor}'s fill, showing its image
 * clipped to that circle, or else its initials in that color's letter
 * color, regular at the panel text size, at least 4.5:1 on the fill. Its
 * color is the one bound, or else the one of its author color's family, or
 * else the one its color key chooses, or else the default pair,
 * `avatar-default`. Under forced colors it keeps a 1px `CanvasText` edge.
 * Initials whose letters, as drawn, reach past the circle inside its edge,
 * less 1px all round, allowing for the line's snap to a whole pixel, are
 * scaled down until they fit it, at every size, but never below the small
 * text's 12px, at the icon size and, under forced colors, the icon button
 * size; initials that fit, such as "RV" and the icon size's one letter,
 * keep their size.
 * Shown alone, it is an image named by its name, or by
 * its label; beside the name it shows, it is decorative and hidden from
 * assistive technology, as it is when its name and label are both blank.
 * An unavailable avatar is dimmed, and its name says so.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { AvatarComponent, AvatarSize } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-reviewer-row",
 *   imports: [AvatarComponent],
 *   template: "<nol-avatar name=\"Reviewer\" initials=\"RV\" colorKey=\"agent-7\" [size]=\"small\" [decorative]=\"true\" /><span>Reviewer</span>"
 * })
 * export class ReviewerRowComponent {
 *   protected readonly small: AvatarSize = AvatarSize.Small;
 * }
 * ```
 */
export declare class AvatarComponent {
  /**
   * Creates the avatar, which Angular does for each `nol-avatar` element;
   * after each render, and whenever its box or its initials change size, it
   * scales initials too wide for the room inside its edge down to that room.
   *
   * @example
   * ```ts
   * import { Component } from "@angular/core";
   * import { AvatarComponent } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-wide-initials",
   *   imports: [AvatarComponent],
   *   template: "<nol-avatar name=\"Mia Wu\" initials=\"MW\" />"
   * })
   * export class WideInitialsComponent {}
   * ```
   */
  public constructor();

  /**
   * The name of whom the avatar shows, which names it for assistive
   * technology and gives its initial when it has no initials.
   */
  public readonly name: InputSignal<string>;

  /**
   * The address of the image the avatar shows in place of its initials; null
   * when not bound, which shows the initials. An image that fails to load or
   * decode shows the initials in its place, in the same box, until the
   * avatar is given another address.
   */
  public readonly image: InputSignal<string | null>;

  /**
   * The initials the avatar shows; null when not bound, which shows the
   * first character of the name in upper case, in the app's locale.
   */
  public readonly initials: InputSignal<string | null>;

  /**
   * Which of the theme's eight author colors, from 1 to 8, picks the
   * avatar's color when none is bound to {@link filledColor}: 1 the default
   * pair, 2 Teal, 3 Green, 4 Amber, 5 Orange, 6 Red, 7 Pink and 8 Purple, so
   * an author's name and avatar stay one family; null when not bound, which
   * takes the color its color key chooses, or the default pair without one.
   * Another number fails when the avatar renders, with an
   * `ArgumentOutOfRangeException`.
   */
  public readonly color: InputSignal<number | null>;

  /**
   * A key, such as the id the app knows the person or agent by, that
   * chooses one of the eight author colors' hues, by its 32-bit FNV-1a hash
   * modulo eight, when no color is bound, the same one for the same key every time; null when not
   * bound.
   */
  public readonly colorKey: InputSignal<string | null>;

  /**
   * The avatar's size; normal when not bound.
   */
  public readonly size: InputSignal<AvatarSize>;

  /**
   * The name assistive technology reads in place of the name, such as the
   * name and a role; empty when not bound, which reads the name.
   */
  public readonly label: InputSignal<string>;

  /**
   * Whether the avatar is hidden from assistive technology, because the name
   * it stands for is shown beside it; false when not bound.
   */
  public readonly decorative: InputSignal<boolean>;

  /**
   * Whether whom the avatar shows is unavailable, which dims it and adds
   * "unavailable" to its name; false when not bound.
   */
  public readonly unavailable: InputSignal<boolean>;

  /**
   * Changes nothing, as every avatar is filled, so an owner may bind it or
   * leave it out. False when not bound.
   */
  public readonly filled: InputSignal<boolean>;

  /**
   * The avatar's color; null when not bound, which takes the one its
   * {@link color} picks, or else the one its color key chooses, or else the
   * default pair, `avatar-default`.
   */
  public readonly filledColor: InputSignal<AvatarColor | null>;
}

/**
 * The kit's text button, `button[nol-button]`, applied to a native button,
 * which keeps its own `type`, `disabled` and events. Its content is the
 * label, which ends with an ellipsis when the button is too narrow for it;
 * an element marked `nolButtonIcon` is placed before the label as its icon.
 *
 * Applied to a native link, `a[nol-button]`, it gives the link the same
 * look, without an underline, while the link keeps its own `href`, `target`
 * and events. A link has no disabled state; leave out a link to somewhere
 * unavailable rather than showing it dimmed.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { ButtonComponent, ButtonVariant } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-export-actions",
 *   imports: [ButtonComponent],
 *   template: "<button type=\"button\" nol-button [disabled]=\"isExporting\" (click)=\"start()\">Export</button>"
 *     + "<button type=\"button\" nol-button [variant]=\"secondary\" [disabled]=\"!isExporting\" (click)=\"cancel()\">Cancel</button>"
 *     + "<a nol-button [variant]=\"secondary\" href=\"https://example.com/export\">Export guide</a>"
 * })
 * export class ExportActionsComponent {
 *   protected readonly secondary: ButtonVariant = ButtonVariant.Secondary;
 *   protected isExporting: boolean = false;
 *
 *   protected start(): void {
 *     this.isExporting = true;
 *   }
 *
 *   protected cancel(): void {
 *     this.isExporting = false;
 *   }
 * }
 * ```
 */
export declare class ButtonComponent {
  /**
   * Creates the button, which Angular does for each `nol-button` element,
   * and starts ignoring its clicks and activation keys while it is busy.
   *
   * @example
   * ```ts
   * import { Component, type WritableSignal, signal } from "@angular/core";
   * import { ButtonComponent } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-save-action",
   *   imports: [ButtonComponent],
   *   template: "<button type=\"button\" nol-button [busy]=\"isSaving()\" (click)=\"isSaving.set(true)\">Save</button>"
   * })
   * export class SaveActionComponent {
   *   protected readonly isSaving: WritableSignal<boolean> = signal(false);
   * }
   * ```
   */
  public constructor();

  /**
   * The button's look, primary for the main action of its place, secondary
   * for the others, and text for a quiet one; primary when not bound.
   */
  public readonly variant: InputSignal<ButtonVariant>;

  /**
   * Whether a text button takes the overlay look, for a labeled action over
   * an image or a dark backdrop, such as an image viewer's zoom percentage: a
   * pill in the theme's `overlay` fill with its label in `overlay-text`, the
   * same in light and dark, with the toolbar hover over the fill. Another
   * variant keeps its own look; false when not bound.
   */
  public readonly overlay: InputSignal<boolean>;

  /**
   * Whether an overlay text button sits on the overlay backdrop itself, such
   * as an image viewer's, where the `overlay` fill would vanish: its pill
   * takes the theme's `overlay-control` look, white at 10%, with its
   * `overlay-control-hover` look, white at 8%, over it under the pointer,
   * and its label the `overlay-control-text` look, #EEEEEE; disabled, it is
   * at 35% opacity. Forced colors keep the overlay look. Ignored without
   * `overlay`; false when not bound.
   */
  public readonly backdrop: InputSignal<boolean>;

  /**
   * Whether a primary button's action destroys something, such as a confirm
   * dialog's Delete: its fill takes the theme's `error` color under its label
   * in `button-danger-text`, and its hover mixes 10% of the label's color
   * into that fill, with the primary button's size, focus and disabled looks;
   * under forced colors it is the plain button's. Another variant keeps its
   * own look; false when not bound.
   */
  public readonly danger: InputSignal<boolean>;

  /**
   * The button's height, normal or compact, with any variant; normal when
   * not bound.
   */
  public readonly size: InputSignal<ButtonSize>;

  /**
   * Whether the button's work is under way: the kit's spinner, in the
   * button's text color, stands centered in place of its icon and label,
   * which stay in the layout unseen and still name it, so the button keeps
   * its width and height exactly; under forced colors the spinner keeps its
   * own look, a `Highlight` arc on a `Canvas` track. It is marked `aria-busy`, and ignores clicks,
   * middle clicks, Enter and Space, so neither its own handlers nor its
   * parents hear them and a link doesn't follow its `href`. False when not
   * bound.
   */
  public readonly busy: InputSignal<boolean>;
}

/**
 * A card, `nol-card`: content on the raised surface inside a 1px card border
 * with the medium radius and padding, in the message text, as tall as its
 * content. Long words wrap inside it rather than widen it.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { CardComponent } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-sync-paused-card",
 *   imports: [CardComponent],
 *   template: "<nol-card><strong>Sync is paused</strong><p>Changes stay on this computer until you resume.</p></nol-card>"
 * })
 * export class SyncPausedCardComponent {
 * }
 * ```
 */
export declare class CardComponent {
}

/**
 * The kit's checkbox, `nol-checkbox`, a native checkbox with a drawn tick
 * whose content is its label, which is part of its hit target. It does not
 * keep its own state: it reports each change through
 * {@link CheckboxComponent.checkedChange}, and its owner binds the new value
 * back to {@link CheckboxComponent.checked}.
 *
 * @example
 * ```ts
 * import { Component, type WritableSignal, signal } from "@angular/core";
 * import { CheckboxComponent } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-quiet-toggle",
 *   imports: [CheckboxComponent],
 *   template: "<nol-checkbox [checked]=\"isQuiet()\" (checkedChange)=\"isQuiet.set($event)\">Do not disturb</nol-checkbox>"
 * })
 * export class QuietToggleComponent {
 *   protected readonly isQuiet: WritableSignal<boolean> = signal(false);
 * }
 * ```
 */
export declare class CheckboxComponent {
  /**
   * Whether the box is checked; false when not bound.
   */
  public readonly checked: InputSignal<boolean>;

  /**
   * Whether the box is disabled, which dims it and its tick, and the person
   * cannot toggle it; false when not bound. A disabled box stays in the Tab
   * order and keeps focus when it turns disabled, is marked
   * `aria-disabled="true"`, and refuses a click or Space; focused, it keeps
   * its focus outline at full strength.
   */
  public readonly disabled: InputSignal<boolean>;

  /**
   * Emits whether the box is checked each time the person toggles it.
   */
  public readonly checkedChange: OutputEmitterRef<boolean>;
}

/**
 * The kit's switch, `nol-switch`, a native checkbox exposed as a switch, drawn
 * as a track with a knob, at the end of its label, which is its content and
 * part of its hit target. A switch with no visible label takes its name from
 * {@link SwitchComponent.label}. It is controlled: a click or Space only
 * reports the new value through {@link SwitchComponent.checkedChange}, and
 * the switch keeps showing {@link SwitchComponent.checked} until its owner
 * binds the new value, so an owner that refuses a change binds nothing.
 *
 * @example
 * ```ts
 * import { Component, type WritableSignal, signal } from "@angular/core";
 * import { SwitchComponent } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-servers-toggle",
 *   imports: [SwitchComponent],
 *   template: "<nol-switch [checked]=\"isOn()\" (checkedChange)=\"isOn.set($event)\">Own servers</nol-switch>"
 * })
 * export class ServersToggleComponent {
 *   protected readonly isOn: WritableSignal<boolean> = signal(true);
 * }
 * ```
 */
export declare class SwitchComponent {
  /**
   * Whether the switch is on, which fills its track with the accent and moves
   * its knob to the track's end; false when not bound. It is all the switch
   * shows.
   */
  public readonly checked: InputSignal<boolean>;

  /**
   * Whether the switch is disabled, which dims it and its label, and the
   * person cannot toggle it; false when not bound. A disabled switch stays in
   * the Tab order and keeps focus when it turns disabled, is marked
   * `aria-disabled="true"`, and refuses a click or Space; focused, it keeps
   * its focus outline at full strength.
   */
  public readonly disabled: InputSignal<boolean>;

  /**
   * Why the switch is disabled, which a disabled switch shows under its label
   * in muted text at the label text size, at full strength rather than dimmed,
   * and gives as its accessible description; nothing shows while the switch is
   * enabled, or when not bound, null or empty. It wraps within the label's
   * width and never widens the switch; a switch with no visible label shows it
   * as wide as its owner sets the switch.
   *
   * @example
   * ```ts
   * import { Component } from "@angular/core";
   * import { SwitchComponent } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-managed-updates",
   *   imports: [SwitchComponent],
   *   template: "<nol-switch [checked]=\"true\" [disabled]=\"true\" disabledReason=\"Your organization manages updates.\">Automatic updates</nol-switch>"
   * })
   * export class ManagedUpdatesComponent {}
   * ```
   */
  public readonly disabledReason: InputSignal<string | null>;

  /**
   * The switch's accessible name when it has no visible label, such as in a
   * row whose text names it elsewhere; none when not bound or null.
   */
  public readonly label: InputSignal<string | null>;

  /**
   * Emits the value the person asks for each time they toggle the switch,
   * which shows it only once its owner binds it to `checked`.
   */
  public readonly checkedChange: OutputEmitterRef<boolean>;
}

/**
 * The kit's radio, `nol-radio`, a native radio with a drawn dot whose content
 * is its label, which is part of its hit target. Inside a
 * {@link RadioGroupComponent} it is picked when the group's value is its
 * value, and picking it sets the group's value; the radios of one group share
 * a name, so the arrow keys move between them and pick, and only the picked
 * one, or the first when none is, or, while one has focus, that one, is in
 * the Tab order. A disabled radio stays in the arrow keys' path: they move
 * the focus onto it but do not pick it.
 * Outside a group it keeps no state of its own: its owner binds
 * {@link RadioComponent.checked}.
 *
 * @example
 * ```ts
 * import { Component, type WritableSignal, signal } from "@angular/core";
 * import { RadioComponent, RadioGroupComponent } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-branch-choice",
 *   imports: [RadioComponent, RadioGroupComponent],
 *   template: `
 *     <nol-radio-group label="Branch" [(value)]="branch">
 *       <nol-radio value="main">main</nol-radio>
 *       <nol-radio value="release">release</nol-radio>
 *     </nol-radio-group>
 *   `
 * })
 * export class BranchChoiceComponent {
 *   protected readonly branch: WritableSignal<string | null> = signal("main");
 * }
 * ```
 */
export declare class RadioComponent {
  /**
   * The value the radio stands for, which its group takes when the person
   * picks it.
   */
  public readonly value: InputSignal<string>;

  /**
   * Whether the radio is picked when it is not in a group; false when not
   * bound. Inside a group, the group's value decides.
   */
  public readonly checked: InputSignal<boolean>;

  /**
   * Whether the radio is disabled, which dims it and its dot, and the person
   * cannot pick it; false when not bound. A disabled radio stays focusable
   * and keeps focus when it turns disabled, is marked `aria-disabled="true"`,
   * and refuses a click, Space or an arrow key's pick; focused, it keeps its
   * focus outline at full strength.
   */
  public readonly disabled: InputSignal<boolean>;

  /**
   * Emits true each time the person picks the radio.
   */
  public readonly checkedChange: OutputEmitterRef<boolean>;
}

/**
 * Which control a {@link ChoiceRowComponent} holds.
 */
export declare enum ChoiceRowType {
  /**
   * A radio, for one choice among the rows of a {@link RadioGroupComponent}.
   */
  Radio = "Radio",

  /**
   * A checkbox, for any number of choices.
   */
  Checkbox = "Checkbox"
}

/**
 * A choice row, `nol-choice-row`: a radio or a checkbox with a label and an
 * optional muted description under it, the whole row being the control's
 * hit target. The mark stays centered on the label's first line however the
 * label wraps, and a long word breaks rather than widening the row. A radio
 * row inside a {@link RadioGroupComponent} takes part in the group as a
 * {@link RadioComponent} does.
 *
 * @example
 * ```ts
 * import { Component, type WritableSignal, signal } from "@angular/core";
 * import { ChoiceRowComponent, RadioGroupComponent } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-release-choice",
 *   imports: [ChoiceRowComponent, RadioGroupComponent],
 *   template: `
 *     <nol-radio-group label="Which branch should the release come from?" [(value)]="branch">
 *       <nol-choice-row value="main" label="main" description="The tested head, with every merged change" />
 *       <nol-choice-row value="release" label="release" description="The last release and its fixes" />
 *     </nol-radio-group>
 *   `
 * })
 * export class ReleaseChoiceComponent {
 *   protected readonly branch: WritableSignal<string | null> = signal(null);
 * }
 * ```
 */
export declare class ChoiceRowComponent {
  /**
   * The control the row holds; {@link ChoiceRowType.Radio} when not bound.
   */
  public readonly type: InputSignal<ChoiceRowType>;

  /**
   * The value a radio row stands for, which its group takes when the person
   * picks it; empty when not bound. A checkbox row ignores it.
   */
  public readonly value: InputSignal<string>;

  /**
   * The row's label, which names its control.
   */
  public readonly label: InputSignal<string>;

  /**
   * A second line under the label, in the muted text color, or null for
   * none; null when not bound.
   */
  public readonly description: InputSignal<string | null>;

  /**
   * Whether a checkbox row is checked, or a radio row outside a group is
   * picked; false when not bound.
   */
  public readonly checked: InputSignal<boolean>;

  /**
   * Whether the row is disabled, which dims its control, and the person
   * cannot change it; false when not bound. Its control stays focusable, as
   * a disabled {@link RadioComponent} or {@link CheckboxComponent} does, so a
   * person whose rows turn disabled while an answer is sent keeps their place.
   */
  public readonly disabled: InputSignal<boolean>;

  /**
   * Emits whether the control is checked each time the person changes it: a
   * checkbox each toggle, a radio true each time it is picked.
   */
  public readonly checkedChange: OutputEmitterRef<boolean>;
}

/**
 * A group of the kit's radios, `nol-radio-group`, with the role `radiogroup`
 * and its label as its accessible name. Its radios, stacked 0.5rem apart,
 * share a name of its own, and its value is the picked radio's value.
 */
export declare class RadioGroupComponent {
  /**
   * The name its radios share, unique to the group.
   */
  public readonly name: string;

  /**
   * The group's accessible name, such as the question it answers.
   */
  public readonly label: InputSignal<string>;

  /**
   * The picked radio's value, or null when none is picked; null when not
   * bound. It changes when the person picks a radio.
   */
  public readonly value: ModelSignal<string | null>;

  /**
   * The value of the radio that has focus, or null when none has it. While a
   * radio has focus it is the group's only tab stop, so Tab leaves the group
   * even from a disabled radio the arrow keys reached and left unchecked.
   */
  public readonly focused: Signal<string | null>;
}

/**
 * A small unfilled chip, `nol-chip`: a count, a count of added or removed
 * items in the added or removed text color, or a key. Content projected into
 * it replaces the text it composes, which is how a key chip shows its key.
 * It never grows wider than its container: text too long for it ends with an
 * ellipsis, and a tooltip shows the whole text while it is cut, on hover and
 * while the control holding the chip has keyboard focus.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { ChipComponent, ChipKind } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-change-summary",
 *   imports: [ChipComponent],
 *   template: "<nol-chip [kind]=\"added\" [count]=\"12\" /><nol-chip [kind]=\"removed\" [count]=\"4\" /><nol-chip [kind]=\"key\">Ctrl+S</nol-chip>"
 * })
 * export class ChangeSummaryComponent {
 *   protected readonly added: ChipKind = ChipKind.Added;
 *   protected readonly removed: ChipKind = ChipKind.Removed;
 *   protected readonly key: ChipKind = ChipKind.Key;
 * }
 * ```
 */
export declare class ChipComponent {
  /**
   * Creates the chip, which Angular does for each `nol-chip` element.
   *
   * @example
   * ```ts
   * import { Component } from "@angular/core";
   * import { ChipComponent, ChipKind } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-shortcut",
   *   imports: [ChipComponent],
   *   template: "<nol-chip [kind]=\"key\">Ctrl+Shift+P</nol-chip>"
   * })
   * export class ShortcutComponent {
   *   protected readonly key: ChipKind = ChipKind.Key;
   * }
   * ```
   */
  public constructor();

  /**
   * What the chip shows; a count when not bound.
   */
  public readonly kind: InputSignal<ChipKind>;

  /**
   * The number a count, added or removed chip shows; 0 when not bound. A key
   * chip ignores it.
   */
  public readonly count: InputSignal<number>;
}

/**
 * A named group of choice pills, `nol-choice-pills`, for choosing one of a
 * few options: a radio group in which the chosen pill, or the first when
 * none is, is the one Tab stop, and the arrow keys, Home and End move the
 * choice and the focus together, wrapping at the ends. It does not keep its
 * own choice: it reports each new one through
 * {@link ChoicePillsComponent.valueChange}, and its owner binds it back to
 * {@link ChoicePillsComponent.value}.
 *
 * @example
 * ```ts
 * import { Component, type WritableSignal, signal } from "@angular/core";
 * import { ChoicePillsComponent, SelectOption } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-line-endings",
 *   imports: [ChoicePillsComponent],
 *   template: "<nol-choice-pills label=\"Line endings\" [options]=\"endings\" [value]=\"ending()\" (valueChange)=\"ending.set($event)\" />"
 * })
 * export class LineEndingsComponent {
 *   protected readonly endings: readonly SelectOption[] = [new SelectOption("lf", "LF"), new SelectOption("crlf", "CRLF")];
 *   protected readonly ending: WritableSignal<string> = signal("lf");
 * }
 * ```
 */
export declare class ChoicePillsComponent {
  /**
   * The options, one pill each in this order, showing its title; their
   * values are distinct.
   */
  public readonly options: InputSignal<readonly SelectOption[]>;

  /**
   * The value of the chosen option; no pill is chosen when no option has
   * it.
   */
  public readonly value: InputSignal<string>;

  /**
   * The group's accessible name, such as the title of the setting it
   * changes.
   */
  public readonly label: InputSignal<string>;

  /**
   * The id, or space-separated ids, of the elements that describe the group,
   * such as a setting's description and its {@link FieldMessageComponent};
   * nothing describes it when null, the default.
   */
  public readonly describedBy: InputSignal<string | null>;

  /**
   * Emits the value of the option the person chooses, by pointer or by
   * keyboard, only when it differs from {@link ChoicePillsComponent.value}.
   */
  public readonly valueChange: OutputEmitterRef<string>;
}

/**
 * Writes text, and an image where the window supports it, to the system
 * clipboard for the kit's controls that copy, such as a
 * {@link CodeBlockComponent}. The window provides it through the main
 * process's clipboard; a test provides a double.
 */
export declare abstract class ClipboardWriter {
  /**
   * Replaces the clipboard's content with text.
   *
   * @param text The text to write, exactly as given.
   * @returns Whether the clipboard took the text.
   *
   * @example
   * ```ts
   * import { ClipboardWriter } from "@noldova/ui.components.angular";
   *
   * export class RecordingClipboard extends ClipboardWriter {
   *   public readonly texts: string[] = [];
   *
   *   public writeTextAsync(text: string): Promise<boolean> {
   *     this.texts.push(text);
   *     return Promise.resolve(true);
   *   }
   * }
   * ```
   */
  public abstract writeTextAsync(text: string): Promise<boolean>;

  /**
   * Replaces the clipboard's content with an image. A writer that can't copy
   * images, such as one in a window whose host has no image clipboard, keeps
   * this default, which resolves false without touching the clipboard.
   *
   * @param _bytes The bytes of an image file, such as a PNG or JPEG file.
   * @returns Whether the clipboard took the image: false when it refused the
   * image or the writer doesn't support images.
   *
   * @example
   * ```ts
   * import { ClipboardWriter } from "@noldova/ui.components.angular";
   *
   * export async function copyPictureAsync(clipboard: ClipboardWriter, picture: Blob): Promise<boolean> {
   *   return clipboard.writeImageAsync(new Uint8Array(await picture.arrayBuffer()));
   * }
   * ```
   */
  public writeImageAsync(_bytes: Uint8Array): Promise<boolean>;
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
 * A color the kit paints: a CSS custom property of the element a theme is
 * painted on, the document's root in the window, and the theme color key it
 * takes, with a key of the same theme to fall back to.
 *
 * The key is the property's name without `--nol-`, as {@link Theme} says, and
 * the fallback key is another token's key. The fallback is read one level
 * deep: a fallback key's own fallback is never read.
 */
export declare class ColorToken {
  /**
   * The CSS custom property it sets, such as `--nol-panel`.
   */
  public readonly variable: string;

  /**
   * The theme color key it reads first, such as `panel`.
   */
  public readonly key: string;

  /**
   * The key read from the same theme when the theme lacks
   * {@link ColorToken.key}, or null when there is none.
   */
  public readonly fallbackKey: string | null;

  /**
   * Creates the token.
   *
   * @param variable The CSS custom property it sets, `--nol-<name>`.
   * @param key The theme color key it reads first.
   * @param fallbackKey The key it reads when the theme lacks the first; none
   * when left out or null.
   * @example
   * ```ts
   * import { ColorToken } from "@noldova/ui.components.angular";
   *
   * export const dialog: ColorToken = new ColorToken("--nol-dialog", "dialog", "raised");
   * ```
   */
  public constructor(variable: string, key: string, fallbackKey?: string | null);

  /**
   * Reads the token's color from a theme in a mode: its key, or else its
   * fallback key.
   *
   * @param theme The theme to read.
   * @param mode The mode whose colors are read.
   * @returns The color as the theme holds it, such as `#FFFFFF`, or
   * undefined when the theme has neither key in that mode.
   * @example
   * ```ts
   * import { ColorToken, DefaultTheme, ThemeMode } from "@noldova/ui.components.angular";
   *
   * export const link: string | undefined = new ColorToken("--nol-link", "link").resolve(DefaultTheme.theme, ThemeMode.Dark);
   * ```
   */
  public resolve(theme: Theme, mode: ThemeMode): string | undefined;
}

/**
 * Marks content of a {@link ConfigurationTableComponent} that belongs at the
 * end of the heading's row, `nolConfigurationTableAction`, such as an Add
 * button.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { ButtonComponent, ConfigurationTableActionDirective, ConfigurationTableComponent, ConfigurationTableDirective } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-path-list",
 *   imports: [ButtonComponent, ConfigurationTableActionDirective, ConfigurationTableComponent, ConfigurationTableDirective],
 *   template: `
 *     <nol-configuration-table heading="Paths">
 *       <button type="button" nol-button nolConfigurationTableAction>Add</button>
 *       <table nolConfigurationTable>
 *         <thead><tr><th scope="col">Path</th></tr></thead>
 *         <tbody><tr><td>/usr/local/bin</td></tr></tbody>
 *       </table>
 *     </nol-configuration-table>`
 * })
 * export class PathListComponent {
 * }
 * ```
 */
export declare class ConfigurationTableActionDirective {
}

/**
 * A configuration table, `nol-configuration-table`: the kit's pattern for a
 * Settings page that lists items. An optional heading, which names the
 * table, sits above it, with any content marked
 * {@link ConfigurationTableActionDirective} at the end of the heading's row,
 * then an optional explanation, then the owner's own native table, marked
 * {@link ConfigurationTableDirective}, with its column headers and its row
 * actions. A table with actions but no heading puts its explanation at the
 * start of the actions' row instead: the explanation takes the rest of the
 * row and wraps, its first line level with the actions' labels, and the
 * actions wrap under it once it would be narrower than a text field. The
 * heading's row, the explanation and the table stand 0.75rem apart, and a
 * part that is missing leaves no gap. Cells line up on their
 * first line's baseline and have 0.5rem padding, except on the outer side of
 * each row's first and last cells, and a line runs under the header and
 * every row. Every column keeps to one line except the one marked with
 * {@link ConfigurationTableFillDirective}, which takes the rest of the width,
 * stays at least a text field wide and wraps. Columns marked with
 * {@link ConfigurationTableShareDirective} share the width instead, the
 * free-text column taking its share with no minimum, and a
 * column marked with {@link ConfigurationTableRowActionsDirective} holds each
 * row's buttons at its end. Once it can shrink no further, the table runs
 * past the component's end, keeping room at its edges for a focus outline and
 * a hovered row's band, and the area that holds it scrolls sideways; the
 * table has no scrollbar of its own. A table with shares scrolls sideways
 * inside the component instead, with the same room, while the heading's row
 * and the explanation stay in place. The row under the pointer shows a band
 * in the hover color behind its cells, reaching 0.5rem past both ends of the
 * table while the text stays on the heading's line, so the owner leaves at
 * least 0.5rem beside the component; under forced colors a dashed `Highlight`
 * line runs just inside the row's edges instead, with no band.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { ButtonComponent, ConfigurationTableActionDirective, ConfigurationTableComponent, ConfigurationTableDirective, ConfigurationTableFillDirective } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-environment-variables",
 *   imports: [ButtonComponent, ConfigurationTableActionDirective, ConfigurationTableComponent, ConfigurationTableDirective, ConfigurationTableFillDirective],
 *   template: `
 *     <nol-configuration-table heading="Environment variables" explanation="Every terminal and tool this project starts gets these.">
 *       <button type="button" nol-button nolConfigurationTableAction>Add</button>
 *       <table nolConfigurationTable>
 *         <thead><tr><th scope="col">Name</th><th scope="col" nolConfigurationTableFill>Value</th><th scope="col" aria-label="Actions"></th></tr></thead>
 *         <tbody><tr><td>EDITOR</td><td nolConfigurationTableFill>code</td><td><button type="button" nol-button aria-label="Remove EDITOR">Remove</button></td></tr></tbody>
 *       </table>
 *     </nol-configuration-table>`
 * })
 * export class EnvironmentVariablesComponent {
 * }
 * ```
 */
export declare class ConfigurationTableComponent {
  /**
   * The heading above the table, its `heading` input, which also names the
   * table; no heading when empty, the default.
   */
  public readonly heading: InputSignal<string>;

  /**
   * The table's accessible name when it has no heading, its `label` input;
   * empty by default.
   */
  public readonly label: InputSignal<string>;

  /**
   * The heading level screen readers announce, its `level` input; 3 when
   * not bound.
   */
  public readonly level: InputSignal<number>;

  /**
   * The text between the heading's row and the table, or at the start of
   * the actions' row when there is no heading, its `explanation` input;
   * none when empty, the default.
   */
  public readonly explanation: InputSignal<string>;
}

/**
 * Marks the owner's native table inside a
 * {@link ConfigurationTableComponent}, `table[nolConfigurationTable]`, giving
 * it the kit's cells, lines and alignment, and names it by the component's
 * heading, or else by its label.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { ConfigurationTableComponent, ConfigurationTableDirective } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-ignored-files",
 *   imports: [ConfigurationTableComponent, ConfigurationTableDirective],
 *   template: `
 *     <nol-configuration-table label="Ignored files">
 *       <table nolConfigurationTable>
 *         <thead><tr><th scope="col">Pattern</th></tr></thead>
 *         <tbody><tr><td>*.log</td></tr></tbody>
 *       </table>
 *     </nol-configuration-table>`
 * })
 * export class IgnoredFilesComponent {
 * }
 * ```
 */
export declare class ConfigurationTableDirective {
  /**
   * Creates the directive, which Angular does for each
   * `table[nolConfigurationTable]`. While the table, with every cell on one
   * line, is wider than its component, as in a narrow window or at 200%
   * zoom, it lets the cells' text wrap at words. A free-text column with a
   * minimum of 0 breaks its long words, and then, or in a table with no
   * free-text column, every column breaks its words while whole words still
   * don't fit. A table still too wide keeps every cell on one line and runs
   * past its component's end, and the owner's area scrolls sideways; it then
   * stays on one line, with the same content, until it has 1.5rem more room,
   * or more by the room it lost since it last wrapped, but only as far as
   * the scrollbars around it grew, those of every area that
   * scrolls up and down around it and the window's, so the two layouts never
   * take turns. Once it fits on one
   * line again, it keeps every cell on one line, as before. A table with
   * shares keeps its own sideways scrolling.
   *
   * @example
   * ```ts
   * import { Component } from "@angular/core";
   * import { ConfigurationTableComponent, ConfigurationTableDirective, ConfigurationTableFillDirective } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-environment-variables",
   *   imports: [ConfigurationTableComponent, ConfigurationTableDirective, ConfigurationTableFillDirective],
   *   template: `
   *     <nol-configuration-table heading="Environment variables" style="width: 20rem">
   *       <table nolConfigurationTable>
   *         <thead><tr><th scope="col">Name</th><th scope="col" nolConfigurationTableFill>Value</th></tr></thead>
   *         <tbody><tr><td>NOTES_HOME</td><td nolConfigurationTableFill>notes/archive/a-folder-name-too-long-for-one-line</td></tr></tbody>
   *       </table>
   *     </nol-configuration-table>`
   * })
   * export class EnvironmentVariablesComponent {
   * }
   * ```
   */
  public constructor();
}

/**
 * Marks the free-text column of a {@link ConfigurationTableDirective} table,
 * on its header and each of its cells, `nolConfigurationTableFill`: the one
 * column that takes the rest of the table's width, stays at least its
 * minimum width, a text field's by default, and wraps, while the others keep
 * to one line; while the table is too wide for its component, every column
 * wraps at its words and this one gives up its rest of the width but keeps
 * its minimum. A table still too wide, as when a word is longer than this
 * column's minimum, keeps every cell on one line, runs past its end, and the
 * owner's area scrolls sideways. A
 * column whose text should wrap however narrow the table gets, such as a
 * path, gives a minimum of 0: it then breaks a word too long for it, and the
 * other columns break theirs while whole words still don't fit.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { ConfigurationTableComponent, ConfigurationTableDirective, ConfigurationTableFillDirective } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-aliases",
 *   imports: [ConfigurationTableComponent, ConfigurationTableDirective, ConfigurationTableFillDirective],
 *   template: `
 *     <nol-configuration-table heading="Aliases">
 *       <table nolConfigurationTable>
 *         <thead><tr><th scope="col">Alias</th><th scope="col" nolConfigurationTableFill>Command</th></tr></thead>
 *         <tbody><tr><td>gs</td><td nolConfigurationTableFill>git status --short --branch</td></tr></tbody>
 *       </table>
 *     </nol-configuration-table>`
 * })
 * export class AliasesComponent {
 * }
 * ```
 */
export declare class ConfigurationTableFillDirective {
  /**
   * Creates the mark, which Angular does for each cell marked
   * `nolConfigurationTableFill`, and counts its minimum width in its table
   * until the cell goes away.
   *
   * @example
   * ```ts
   * import { Component } from "@angular/core";
   * import { ConfigurationTableComponent, ConfigurationTableDirective, ConfigurationTableFillDirective } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-paths",
   *   imports: [ConfigurationTableComponent, ConfigurationTableDirective, ConfigurationTableFillDirective],
   *   template: `
   *     <nol-configuration-table heading="Paths">
   *       <table nolConfigurationTable>
   *         <thead><tr><th scope="col">Name</th><th scope="col" nolConfigurationTableFill [nolConfigurationTableFillMinWidth]="0">Path</th></tr></thead>
   *         <tbody><tr><td>Notes</td><td nolConfigurationTableFill>notes/archive/2026</td></tr></tbody>
   *       </table>
   *     </nol-configuration-table>`
   * })
   * export class PathsComponent {
   * }
   * ```
   */
  public constructor();

  /**
   * The column's minimum width in rem, its `nolConfigurationTableFillMinWidth`
   * input, given on any of its cells, usually its header, and bound, as in
   * `[nolConfigurationTableFillMinWidth]="0"`, or null, the default, for a
   * text field's width. The column keeps the largest its cells give; a value
   * that isn't a number of 0 or more, such as the text of an unbound
   * attribute, counts as none.
   */
  public readonly minWidth: InputSignal<number | null>;
}

/**
 * Marks the actions column of a {@link ConfigurationTableDirective} table, on
 * its header and each of its cells, `nolConfigurationTableRowActions`. The
 * header shows no text and takes its accessible name from the directive's
 * value, such as Actions; each cell holds its row's buttons, such as
 * {@link IconButtonComponent}s, as its direct children, on one line at the
 * cell's end and centered on the first line of the row's text, so every row's
 * last button ends on the table's end. Neighboring icon buttons touch, their
 * full targets kept, so their icons sit as one group; other buttons stay
 * 0.5rem apart.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { ConfigurationTableComponent, ConfigurationTableDirective, ConfigurationTableRowActionsDirective, IconButtonComponent } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-bookmarks",
 *   imports: [ConfigurationTableComponent, ConfigurationTableDirective, ConfigurationTableRowActionsDirective, IconButtonComponent],
 *   template: `
 *     <nol-configuration-table heading="Bookmarks">
 *       <table nolConfigurationTable>
 *         <thead><tr><th scope="col">Name</th><th scope="col" nolConfigurationTableRowActions="Actions"></th></tr></thead>
 *         <tbody><tr><td>Docs</td><td nolConfigurationTableRowActions>
 *           <button type="button" nol-icon-button icon="edit" label="Edit Docs"></button>
 *           <button type="button" nol-icon-button icon="delete" label="Delete Docs" [danger]="true"></button>
 *         </td></tr></tbody>
 *       </table>
 *     </nol-configuration-table>`
 * })
 * export class BookmarksComponent {
 * }
 * ```
 */
export declare class ConfigurationTableRowActionsDirective {
  /**
   * The actions column's accessible name, set on its header, its
   * `nolConfigurationTableRowActions` input, such as Actions; none on the
   * cells, the default.
   */
  public readonly name: InputSignal<string>;
}

/**
 * Gives a column of a {@link ConfigurationTableDirective} table a share of
 * the table's width, on its header, `th[nolConfigurationTableShare]`. Each
 * shared column takes its share's part of the sum of the table's shares, so
 * a table that shares every column, its actions column included, spreads
 * them over its width while every column's content fits its part; a column
 * whose content doesn't fit grows, and the others give up the room. The
 * columns keep to one line, and a shared column marked with
 * {@link ConfigurationTableFillDirective} wraps and takes its share even when
 * that is narrower than a text field, so the shares hold on narrow pages.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { ConfigurationTableComponent, ConfigurationTableDirective, ConfigurationTableShareDirective } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-servers",
 *   imports: [ConfigurationTableComponent, ConfigurationTableDirective, ConfigurationTableShareDirective],
 *   template: `
 *     <nol-configuration-table heading="Servers">
 *       <table nolConfigurationTable>
 *         <thead><tr><th scope="col" [nolConfigurationTableShare]="1">Name</th><th scope="col" [nolConfigurationTableShare]="2">Address</th></tr></thead>
 *         <tbody><tr><td>Build</td><td>build.example.com</td></tr></tbody>
 *       </table>
 *     </nol-configuration-table>`
 * })
 * export class ServersComponent {
 * }
 * ```
 */
export declare class ConfigurationTableShareDirective {
  /**
   * Creates the share, which Angular does for each header marked
   * `nolConfigurationTableShare`, and counts it in its table's sum until
   * the header goes away.
   *
   * @example
   * ```ts
   * import { Component } from "@angular/core";
   * import { ConfigurationTableComponent, ConfigurationTableDirective, ConfigurationTableShareDirective } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-hosts",
   *   imports: [ConfigurationTableComponent, ConfigurationTableDirective, ConfigurationTableShareDirective],
   *   template: `
   *     <nol-configuration-table label="Hosts">
   *       <table nolConfigurationTable>
   *         <thead><tr><th scope="col" [nolConfigurationTableShare]="1">Name</th>@if (showsPort) {<th scope="col" [nolConfigurationTableShare]="1">Port</th>}</tr></thead>
   *       </table>
   *     </nol-configuration-table>`
   * })
   * export class HostsComponent {
   *   protected readonly showsPort: boolean = true;
   * }
   * ```
   */
  public constructor();

  /**
   * The column's share, its `nolConfigurationTableShare` input, a positive
   * number weighed against the other columns' shares. A share that isn't a
   * positive number counts as none, so its column takes no part of the width,
   * and a table whose shares are all none sets no widths and lays out as a
   * table without shares.
   */
  public readonly share: InputSignal<number>;
}

/**
 * Opens a menu as the context menu of its host element: at the pointer on a
 * right click, or at the host's bottom-left corner on the ContextMenu key or
 * Shift+F10. The menu is the template bound to `nolContextMenuTriggerFor`,
 * whose root is a {@link MenuComponent}; the directive's export name is also
 * `nolContextMenuTriggerFor`. Each trigger keeps its own menu stack, so its
 * menu and submenus close together: when a row is chosen, on Escape or Tab,
 * when focus leaves them, on a click outside them other than the one that
 * ends the press that opened the menu, and when the host is hidden or
 * scrolled away. Focus
 * returns to the host when a chosen row, Escape or Tab closes the last menu,
 * also when the host holds a {@link MenuTriggerDirective} of its own, such as
 * a row's More button.
 * One trigger can also serve as the context menu of other elements, such as
 * every text field under it, through
 * {@link ContextMenuTriggerDirective.openAtPointer} and
 * {@link ContextMenuTriggerDirective.openFromKeyboard} with a target, which
 * then takes the host's place. It extends the CDK's menu trigger base, from which it inherits
 * `menuTemplateRef`, `menuData`, `isOpen()`, `opened` and `closed`.
 */
export declare class ContextMenuTriggerDirective extends CdkMenuTriggerBase {
  /**
   * Creates the directive, which Angular does for each element that uses
   * `nolContextMenuTriggerFor`, or that has it as a host directive and sets
   * its `menuTemplateRef`.
   *
   * @example
   * ```ts
   * import { Component, type OutputEmitterRef, output } from "@angular/core";
   * import { ContextMenuTriggerDirective, MenuComponent, MenuItemComponent, MenuSeparatorComponent } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-file-row",
   *   imports: [ContextMenuTriggerDirective, MenuComponent, MenuItemComponent, MenuSeparatorComponent],
   *   template: `
   *     <div class="file" tabindex="0" [nolContextMenuTriggerFor]="actions">{{ name }}</div>
   *     <ng-template #actions>
   *       <nol-menu>
   *         <button nol-menu-item label="Rename" icon="edit" shortcut="F2" (triggered)="renamed.emit()"></button>
   *         <nol-menu-separator />
   *         <button nol-menu-item label="Delete" icon="delete" (triggered)="deleted.emit()"></button>
   *       </nol-menu>
   *     </ng-template>`
   * })
   * export class FileRowComponent {
   *   protected readonly name: string = "notes.md";
   *
   *   public readonly renamed: OutputEmitterRef<void> = output<void>();
   *   public readonly deleted: OutputEmitterRef<void> = output<void>();
   * }
   * ```
   */
  public constructor();

  /**
   * Opens the menu against a point and focuses its first row. Any other open
   * menu closes first. The menu opens below the point, starting at it, and
   * takes another side when there is no room there. Nothing happens while
   * no template is bound.
   *
   * @param point The area to open against, in viewport pixels; a point is a
   * rectangle of zero size, such as `new DOMRect(x, y, 0, 0)`.
   * @param origin The focus origin given to the first row, such as `"mouse"`
   * for a pointer or `"keyboard"` for a key.
   * @example
   * ```ts
   * import { Component, type Signal, viewChild } from "@angular/core";
   * import { ContextMenuTriggerDirective, MenuComponent, MenuItemComponent } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-note-row",
   *   imports: [ContextMenuTriggerDirective, MenuComponent, MenuItemComponent],
   *   template: `
   *     <div class="note" [nolContextMenuTriggerFor]="actions">
   *       Groceries
   *       <button #more type="button" aria-label="More actions" (click)="openBelow(more, $event)">more_horiz</button>
   *     </div>
   *     <ng-template #actions>
   *       <nol-menu>
   *         <button nol-menu-item label="Pin"></button>
   *         <button nol-menu-item label="Archive"></button>
   *       </nol-menu>
   *     </ng-template>`
   * })
   * export class NoteRowComponent {
   *   private readonly trigger: Signal<ContextMenuTriggerDirective> = viewChild.required(ContextMenuTriggerDirective);
   *
   *   protected openBelow(button: HTMLElement, event: MouseEvent): void {
   *     const bounds = button.getBoundingClientRect();
   *     this.trigger().open(new DOMRect(bounds.left, bounds.bottom, 0, 0), event.detail === 0 ? "keyboard" : "mouse");
   *   }
   * }
   * ```
   */
  public open(point: DOMRect, origin: FocusOrigin): void;

  /**
   * Opens the menu at a right click's pointer as the context menu of a
   * target, as the host's own right click does: the menu follows the target,
   * closes when it is hidden or scrolled away, and returns focus to it. The
   * event's default and propagation stop, and the click that ends the press
   * leaves the menu open. Nothing opens while no template is bound.
   *
   * @param event The `contextmenu` event; one from the keyboard, whose button
   * is not the secondary one, focuses the first row as a key does.
   * @param target The element the menu belongs to, the host by default.
   * @example
   * ```ts
   * import { Component, type Signal, viewChild } from "@angular/core";
   * import { ContextMenuTriggerDirective, MenuComponent, MenuItemComponent } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-field-actions",
   *   imports: [ContextMenuTriggerDirective, MenuComponent, MenuItemComponent],
   *   host: { "(document:contextmenu)": "openForField($event)" },
   *   template: `
   *     <span [nolContextMenuTriggerFor]="actions"></span>
   *     <ng-template #actions>
   *       <nol-menu>
   *         <button nol-menu-item label="Clear"></button>
   *       </nol-menu>
   *     </ng-template>`
   * })
   * export class FieldActionsComponent {
   *   private readonly trigger: Signal<ContextMenuTriggerDirective> = viewChild.required(ContextMenuTriggerDirective);
   *
   *   protected openForField(event: MouseEvent): void {
   *     if (event.target instanceof HTMLInputElement)
   *       this.trigger().openAtPointer(event, event.target);
   *   }
   * }
   * ```
   */
  public openAtPointer(event: MouseEvent, target?: HTMLElement): void;

  /**
   * Opens the menu below a target's start as its context menu when the key
   * is the ContextMenu key or Shift+F10, preventing the key's default, as
   * the host's own keys do; other keys do nothing. The menu follows the
   * target and returns focus to it, and its first row takes focus.
   *
   * @param event The `keydown` event.
   * @param target The element the menu belongs to, the host by default.
   * @example
   * ```ts
   * import { Component, type Signal, viewChild } from "@angular/core";
   * import { ContextMenuTriggerDirective, MenuComponent, MenuItemComponent } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-field-keys",
   *   imports: [ContextMenuTriggerDirective, MenuComponent, MenuItemComponent],
   *   host: { "(document:keydown)": "openForField($event)" },
   *   template: `
   *     <span [nolContextMenuTriggerFor]="actions"></span>
   *     <ng-template #actions>
   *       <nol-menu>
   *         <button nol-menu-item label="Clear"></button>
   *       </nol-menu>
   *     </ng-template>`
   * })
   * export class FieldKeysComponent {
   *   private readonly trigger: Signal<ContextMenuTriggerDirective> = viewChild.required(ContextMenuTriggerDirective);
   *
   *   protected openForField(event: KeyboardEvent): void {
   *     if (event.target instanceof HTMLInputElement)
   *       this.trigger().openFromKeyboard(event, event.target);
   *   }
   * }
   * ```
   */
  public openFromKeyboard(event: KeyboardEvent, target?: HTMLElement): void;

  /**
   * Closes the menu and its submenus. Nothing happens while it is closed.
   *
   * @example
   * ```ts
   * import { Component, type Signal, viewChild } from "@angular/core";
   * import { ContextMenuTriggerDirective, MenuComponent, MenuItemComponent } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-card",
   *   imports: [ContextMenuTriggerDirective, MenuComponent, MenuItemComponent],
   *   template: `
   *     <div class="card" draggable="true" [nolContextMenuTriggerFor]="actions" (dragstart)="closeMenu()">Groceries</div>
   *     <ng-template #actions>
   *       <nol-menu>
   *         <button nol-menu-item label="Duplicate"></button>
   *       </nol-menu>
   *     </ng-template>`
   * })
   * export class CardComponent {
   *   private readonly trigger: Signal<ContextMenuTriggerDirective> = viewChild.required(ContextMenuTriggerDirective);
   *
   *   protected closeMenu(): void {
   *     this.trigger().close();
   *   }
   * }
   * ```
   */
  public close(): void;
}

/**
 * The colors of an {@link AvatarComponent}'s filled look, and how a key
 * chooses one, so an owner can give a person or agent the same color
 * wherever it shows them, such as on a message's author.
 *
 * @example
 * ```ts
 * import { type AvatarColor, AvatarColors } from "@noldova/ui.components.angular";
 *
 * const color: AvatarColor = AvatarColors.fromKey("agent-7");
 * ```
 */
export declare class AvatarColors {
  /**
   * The twelve colors, in the order a key chooses among them: Teal, Green,
   * Lime, Amber, Orange, Red, Rose, Pink, Purple, Violet, Indigo and Cyan.
   */
  public static readonly all: readonly AvatarColor[];

  /**
   * The color a key chooses, the same one for the same key every time: its
   * 32-bit FNV-1a hash over its UTF-16 code units, modulo twelve.
   *
   * @param key The key, such as the id the app knows the person or agent by.
   * @returns The color, one of `AvatarColors.all`.
   */
  public static fromKey(key: string): AvatarColor;

  /**
   * The key's 32-bit FNV-1a hash over its UTF-16 code units, from the offset
   * 2166136261 with the prime 16777619, which chooses its colors.
   *
   * @param key The key.
   * @returns The hash, an unsigned 32-bit integer.
   */
  public static hashOf(key: string): number;
}

/**
 * The shell's own theme.
 */
export declare class DefaultTheme {
  /**
   * The default theme, `noldova.default`, named Default: light and dark
   * colors, every look and the pill tab shape. It has a value for everything
   * the kit paints, so it completes other themes.
   */
  public static readonly theme: Theme;
}

/**
 * The kit's modal dialog, `nol-dialog`: a title that ends with a Close
 * button at the top right, a body of the content projected into it, and a
 * row of the elements marked `nolDialogAction`, left out when there are
 * none. A large dialog's title bar ends with the elements marked
 * `nolDialogControl`, then Maximize, which toggles it between its large size
 * and the whole window for as long as it is open and reads Restore while it
 * is maximized, and then Close. It is the root of a
 * component opened with {@link DialogService.open}, which names the dialog
 * by its title and supplies {@link DialogTokens.titleId}; created anywhere
 * else it fails for want of that token. It never closes itself: Escape,
 * unless a control inside already handled it, and the Close button ask its
 * owner through {@link DialogComponent.dismissed}, and a click on the
 * backdrop does nothing. It opens centered in the overlay bounds each time,
 * and the primary pointer button moves it by its title bar, away from the
 * bar's buttons, within those bounds, where it stays as the window resizes;
 * Escape during the drag puts it back where the drag began. A maximized
 * dialog doesn't move, and Restore puts it back where it was moved.
 *
 * @example
 * ```ts
 * import { Component, type OutputEmitterRef, output } from "@angular/core";
 * import { ButtonComponent, ButtonVariant, DialogComponent, DialogService } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-discard-dialog",
 *   imports: [ButtonComponent, DialogComponent],
 *   template: "<nol-dialog [title]=\"title\" (dismissed)=\"answered.emit(false)\">"
 *     + "<p>Your changes to this note will be lost.</p>"
 *     + "<button nol-button nolDialogAction type=\"button\" (click)=\"answered.emit(true)\">Discard</button>"
 *     + "<button nol-button nolDialogAction type=\"button\" class=\"nol-discard-cancel\" [variant]=\"secondary\" (click)=\"answered.emit(false)\">Cancel</button>"
 *     + "</nol-dialog>"
 * })
 * export class DiscardDialogComponent {
 *   protected readonly title: string = "Discard changes?";
 *   protected readonly secondary: ButtonVariant = ButtonVariant.Secondary;
 *
 *   public readonly answered: OutputEmitterRef<boolean> = output<boolean>();
 * }
 *
 * export function askToDiscard(dialogs: DialogService, discard: () => void): void {
 *   const dialog = dialogs.open(DiscardDialogComponent, ".nol-discard-cancel");
 *   dialog.componentInstance?.answered.subscribe(isDiscarded => {
 *     dialog.close();
 *     if (isDiscarded)
 *       discard();
 *   });
 * }
 * ```
 */
export declare class DialogComponent {
  /**
   * Creates the dialog, which Angular does for the `nol-dialog` element at
   * the root of a component {@link DialogService.open} opens.
   *
   * @example
   * ```ts
   * import { Component } from "@angular/core";
   * import { DialogComponent } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-about-dialog",
   *   imports: [DialogComponent],
   *   template: "<nol-dialog title=\"About\"><p>Noldova Desktop</p></nol-dialog>"
   * })
   * export class AboutDialogComponent {
   * }
   * ```
   */
  public constructor();

  /**
   * The dialog's title, which is also its accessible name. A normal
   * dialog's title wraps; a large dialog's stays on one line and ends with
   * an ellipsis when it does not fit.
   */
  public readonly title: InputSignal<string>;

  /**
   * The dialog's size; normal when not bound. A normal dialog takes its
   * preferred width within the window and scrolls its body; a medium one is
   * the same at the theme's wider medium width; a large one takes most of
   * the window, with a title bar that ends with its controls, Maximize and
   * Close, and a body without padding that lays itself out.
   */
  public readonly size: InputSignal<DialogSize>;

  /**
   * Emits when the person asks to dismiss the dialog, by Escape or by its
   * Close button. The owner closes the dialog, or keeps it open.
   */
  public readonly dismissed: OutputEmitterRef<void>;
}

/**
 * Marks the element that describes a dialog, `nolDialogDescription`, such as
 * the line under a question that says what an answer does. The dialog then
 * names it as its description, so a screen reader reads it with the title
 * when the dialog opens, before the focused control. Each marked element
 * takes an id of its own made from {@link DialogTokens.titleId}, several
 * describe the dialog together in the order they render, and each
 * describes it for as long as it is there; a dialog without one has no
 * description. It works in
 * any component {@link DialogService.open} opens, in a
 * {@link DialogComponent} or a dialog that draws its own title.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { ButtonComponent, DialogComponent, DialogDescriptionDirective } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-remove-teammate-dialog",
 *   imports: [ButtonComponent, DialogComponent, DialogDescriptionDirective],
 *   template: "<nol-dialog title=\"Remove this teammate?\">"
 *     + "<p nolDialogDescription>Their tasks and history are removed with them.</p>"
 *     + "<button nol-button nolDialogAction type=\"button\">Remove</button>"
 *     + "</nol-dialog>"
 * })
 * export class RemoveTeammateDialogComponent {
 * }
 * ```
 */
export declare class DialogDescriptionDirective {
  /**
   * Creates the description, which Angular does for each element marked
   * `nolDialogDescription`.
   *
   * @example
   * ```ts
   * import { Component } from "@angular/core";
   * import { DialogComponent, DialogDescriptionDirective } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-sign-out-dialog",
   *   imports: [DialogComponent, DialogDescriptionDirective],
   *   template: "<nol-dialog title=\"Sign out?\"><p nolDialogDescription>Running tasks stop.</p></nol-dialog>"
   * })
   * export class SignOutDialogComponent {
   * }
   * ```
   */
  public constructor();
}

/**
 * Opens modal dialogs. A dialog shows a component over a backdrop; the
 * component shows a {@link DialogComponent}, whose title names the dialog
 * through {@link DialogTokens.titleId}, and an element marked
 * {@link DialogDescriptionDirective} can describe it.
 */
export declare class DialogService {
  /**
   * Whether any dialog is open.
   */
  public get isOpen(): boolean;

  /**
   * Tells whether a dialog is the most recently opened of those open.
   *
   * @param dialog The dialog's reference, from {@link DialogService.open}.
   * @returns True when the dialog is open and was opened last; false when
   * another opened after it or it has closed.
   * @example
   * ```ts
   * import type { DialogRef } from "@angular/cdk/dialog";
   * import type { DialogService } from "@noldova/ui.components.angular";
   *
   * export function receivesKeys(dialogs: DialogService, dialog: DialogRef<unknown, unknown>): boolean {
   *   return dialogs.isTopmost(dialog);
   * }
   * ```
   */
  public isTopmost<T>(dialog: DialogRef<unknown, T>): boolean;

  /**
   * Opens a component in a modal dialog. Neither Escape nor a click on the
   * backdrop closes it, and the backdrop leaves focus where it is; the
   * opener closes it through its reference, usually when the
   * {@link DialogComponent} emits `dismissed`. While dialogs are open,
   * everything beside them is inert, except live regions, popovers and what
   * was inert already. When it closes, focus returns to the element focused
   * when it opened, unless something else has taken focus. Its backdrop then
   * fades out with the overlay library's transition, from the opacity it
   * got to, taking no pointer meanwhile, and goes by the library's 500ms
   * limit; it goes at once when reduced motion is preferred, or when a
   * dialog opened after it is still open.
   *
   * @param component The component the dialog shows.
   * @param initialFocus A CSS selector of the element in the dialog that
   * takes focus when it opens, and nothing does when none matches; the
   * dialog's close button when left out. It shows its focus ring only when a
   * key opened the dialog, not after a click or with no input of its own.
   * @returns The dialog's reference, which closes it and tells when it has
   * closed.
   * @example
   * ```ts
   * import { Component, Injectable, inject } from "@angular/core";
   * import { ButtonComponent, DialogComponent, DialogService } from "@noldova/ui.components.angular";
   *
   * @Injectable({ providedIn: "root" })
   * export class DiscardService {
   *   private readonly dialogs: DialogService = inject(DialogService);
   *   private close: (() => void) | null = null;
   *
   *   public ask(): void {
   *     if (this.dialogs.isOpen)
   *       return;
   *     const dialog = this.dialogs.open(DiscardDialogComponent, ".nol-discard-cancel");
   *     this.close = () => dialog.close();
   *   }
   *
   *   public answer(): void {
   *     this.close?.();
   *     this.close = null;
   *   }
   * }
   *
   * @Component({
   *   selector: "nol-discard-dialog",
   *   imports: [ButtonComponent, DialogComponent],
   *   template: "<nol-dialog title=\"Discard changes?\" (dismissed)=\"discard.answer()\">The note's changes will be lost.<button nol-button nolDialogAction type=\"button\" class=\"nol-discard-cancel\" (click)=\"discard.answer()\">Cancel</button></nol-dialog>"
   * })
   * export class DiscardDialogComponent {
   *   protected readonly discard: DiscardService = inject(DiscardService);
   * }
   * ```
   */
  public open<T>(component: ComponentType<T>, initialFocus?: string): DialogRef<unknown, T>;
}

/**
 * The injection tokens of the kit's dialogs.
 */
export declare class DialogTokens {
  /**
   * The id of the dialog's title element, unique in the window, which
   * {@link DialogService.open} provides to the component it opens and names
   * as the dialog's accessible name. A {@link DialogComponent} gives its
   * title this id; a component that draws its own title gives it the id
   * instead.
   *
   * @example
   * ```ts
   * import { Component, inject } from "@angular/core";
   * import { DialogTokens } from "@noldova/ui.components.angular";
   *
   * @Component({ selector: "nol-about-panel", template: "<h2 [id]=\"titleId\">About Noldova Desktop</h2><p>Version 1.0</p>" })
   * export class AboutPanelComponent {
   *   protected readonly titleId: string = inject(DialogTokens.titleId);
   * }
   * ```
   */
  public static readonly titleId: InjectionToken<string>;
}

/**
 * A line only on the new side of a hunk.
 */
export declare class DiffAddedLine extends DiffLine {
  /**
   * Creates the line.
   *
   * @param newNumber Its number in the new file, from 1.
   * @param text Its text, without its line break.
   * @throws DiffException synchronously when the number is not a whole
   * number of 1 or more.
   * @example
   * ```ts
   * import { DiffAddedLine } from "@noldova/ui.components.angular";
   *
   * export const added: DiffAddedLine = new DiffAddedLine(12, "const limit = 10;");
   * ```
   */
  public constructor(newNumber: number, text: string);

  /**
   * {@link DiffLineKind.Added}.
   */
  public get kind(): DiffLineKind;

  /**
   * {@link DiffSide.New}.
   */
  public get side(): DiffSide;
}

/**
 * The content of a binary file: no hunks, and a line saying its changes
 * aren't shown.
 */
export declare class DiffBinary extends DiffContent {
  /**
   * Creates the content.
   *
   * @example
   * ```ts
   * import { DiffBinary } from "@noldova/ui.components.angular";
   *
   * export const image: DiffBinary = new DiffBinary();
   * ```
   */
  public constructor();
}

/**
 * When {@link DiffViewComponent} holds a file's changes behind Load diff:
 * when they have more changed lines, or more characters, than it allows.
 */
export declare class DiffCollapseLimit {
  /**
   * The limit a view takes when it isn't given one: 2,000 changed lines or
   * 1,000,000 characters.
   */
  public static readonly standard: DiffCollapseLimit;

  /**
   * The most changed lines shown without Load diff.
   */
  public readonly changedLines: number;

  /**
   * The most characters, counting every line's text, shown without Load
   * diff.
   */
  public readonly characters: number;

  /**
   * Creates the limit.
   *
   * @param changedLines The most changed lines shown at once, a whole
   * number of 1 or more.
   * @param characters The most characters shown at once, a whole number of
   * 1 or more.
   * @throws DiffException synchronously when either is not a whole number
   * of 1 or more.
   * @example
   * ```ts
   * import { DiffCollapseLimit } from "@noldova/ui.components.angular";
   *
   * export const strict: DiffCollapseLimit = new DiffCollapseLimit(500, 200000);
   * ```
   */
  public constructor(changedLines: number, characters: number);

  /**
   * Tells whether a file's content is over the limit.
   *
   * @param content The file's content.
   * @returns True when it has more changed lines or more characters than
   * the limit allows.
   * @example
   * ```ts
   * import { DiffCollapseLimit, DiffPending } from "@noldova/ui.components.angular";
   *
   * export const isHeld: boolean = DiffCollapseLimit.standard.isExceededBy(new DiffPending());
   * ```
   */
  public isExceededBy(content: DiffContent): boolean;
}

/**
 * What {@link DiffViewComponent} can show of a file's change: its hunks, or a
 * state in their place. Each kind is its own class: {@link DiffHunks},
 * {@link DiffPending}, {@link DiffBinary} and {@link DiffReadFailure}.
 */
export declare abstract class DiffContent {
  /**
   * The hunks shown, in order; none for every kind but {@link DiffHunks}.
   */
  public readonly hunks: readonly DiffHunk[];

  /**
   * The line shown in the file's body to say what it holds, or null for
   * none.
   */
  public readonly stateText: string | null;

  /**
   * Whether the changes are still to load.
   */
  public readonly isPending: boolean;

  /**
   * How many lines its hunks add or remove.
   */
  public readonly changedLineCount: number;

  /**
   * How many characters its hunks' lines hold.
   */
  public readonly characterCount: number;

  /**
   * Creates the content, which a subclass does with its kind's hunks and
   * state line; the counts are summed from the hunks.
   *
   * @param hunks The hunks shown, in order.
   * @param stateText The line shown in the file's body, or null for none.
   * @param isPending Whether the changes are still to load; false when left
   * out.
   * @example
   * ```ts
   * import { DiffContent } from "@noldova/ui.components.angular";
   *
   * export class DiffSummaryOnly extends DiffContent {
   *   public constructor() {
   *     super([], "This file's changes are summarized above.");
   *   }
   * }
   * ```
   */
  protected constructor(hunks: readonly DiffHunk[], stateText: string | null, isPending?: boolean);
}

/**
 * An unchanged line of a hunk, on both sides.
 */
export declare class DiffContextLine extends DiffLine {
  /**
   * Creates the line.
   *
   * @param oldNumber Its number in the old file, from 1.
   * @param newNumber Its number in the new file, from 1.
   * @param text Its text, without its line break.
   * @throws DiffException synchronously when either number is not a whole
   * number of 1 or more.
   * @example
   * ```ts
   * import { DiffContextLine } from "@noldova/ui.components.angular";
   *
   * export const unchanged: DiffContextLine = new DiffContextLine(10, 11, "return total;");
   * ```
   */
  public constructor(oldNumber: number, newNumber: number, text: string);

  /**
   * {@link DiffLineKind.Context}.
   */
  public get kind(): DiffLineKind;

  /**
   * {@link DiffSide.New}, the side a unified view numbers it by.
   */
  public get side(): DiffSide;
}

/**
 * The person's request for more unchanged lines above or below a hunk,
 * which {@link DiffViewComponent} emits; the owner answers with the file's
 * hunks widened.
 */
export declare class DiffContextRequest {
  /**
   * The file's id.
   */
  public readonly fileId: string;

  /**
   * The hunk's id.
   */
  public readonly hunkId: string;

  /**
   * Which way to widen it.
   */
  public readonly direction: DiffExpandDirection;

  /**
   * Creates the request.
   *
   * @param fileId The file's id.
   * @param hunkId The hunk's id.
   * @param direction Which way to widen it.
   * @example
   * ```ts
   * import { DiffContextRequest, DiffExpandDirection } from "@noldova/ui.components.angular";
   *
   * export const above: DiffContextRequest = new DiffContextRequest("src/app.ts", "h1", DiffExpandDirection.Up);
   * ```
   */
  public constructor(fileId: string, hunkId: string, direction: DiffExpandDirection);
}

/**
 * The exception thrown when a diff's data is not valid, such as a hunk whose
 * lines don't match its ranges or a renamed file with no old path.
 */
export declare class DiffException extends UiComponentsException {
  /**
   * The exception's name, `"DiffException"`, which the class sets itself so
   * that a minified build keeps it.
   */
  public override readonly name: string;

  /**
   * Creates the exception.
   *
   * @param message A sentence naming the value and why it is not valid.
   * @example
   * ```ts
   * import { DiffException } from "@noldova/ui.components.angular";
   *
   * export const refused: DiffException = new DiffException("A file's path must not be empty.");
   * ```
   */
  public constructor(message: string);
}

/**
 * The exception thrown when a reference's data is not valid, such as a
 * negative or non-finite duration, an action with an empty label, address
 * or glyph, or a reference with no card given a part only its card shows.
 */
export declare class LinkReferenceException extends UiComponentsException {
  /**
   * The exception's name, `"LinkReferenceException"`, which the class sets
   * itself so that a minified build keeps it.
   */
  public override readonly name: string;

  /**
   * Creates the exception.
   *
   * @param message A sentence naming the value and why it is not valid.
   * @example
   * ```ts
   * import { LinkReferenceException } from "@noldova/ui.components.angular";
   *
   * export const refused: LinkReferenceException = new LinkReferenceException("An action's label must not be empty.");
   * ```
   */
  public constructor(message: string);
}

/**
 * A changed file in {@link DiffViewComponent}. Its id is stable while the
 * file changes again, and the view keys everything on it: its state, its
 * events and the owner's review maps. Its paths are only shown.
 */
export declare class DiffFile {
  /**
   * The file's stable id, never shown.
   */
  public readonly id: string;

  /**
   * The file's path, shown in its header.
   */
  public readonly path: string;

  /**
   * The path it was renamed from, or null.
   */
  public readonly oldPath: string | null;

  /**
   * How it changed.
   */
  public readonly status: DiffFileStatus;

  /**
   * How many lines it adds.
   */
  public readonly additions: number;

  /**
   * How many lines it removes.
   */
  public readonly deletions: number;

  /**
   * Its language, such as `TypeScript`, or null when unknown. The diff view
   * colors the code of a language the code block knows, by its name or an
   * alias, and loads nothing for any other.
   */
  public readonly language: string | null;

  /**
   * What the view shows of the change.
   */
  public readonly content: DiffContent;

  /**
   * Creates the file.
   *
   * @param id Its stable id, which must not be empty.
   * @param path Its path, which must not be empty.
   * @param oldPath The path it came from, required for
   * {@link DiffFileStatus.Renamed} and null for every other status.
   * @param status How it changed.
   * @param additions How many lines it adds, a whole number of 0 or more.
   * @param deletions How many lines it removes, a whole number of 0 or more.
   * @param language Its language, or null.
   * @param content What the view shows of the change.
   * @throws DiffException synchronously when the id, the path or a given old
   * path is empty, the old path is missing or not expected for the status,
   * or a count is not a whole number of 0 or more.
   * @example
   * ```ts
   * import { DiffAddedLine, DiffFile, DiffFileStatus, DiffHunk, DiffHunks } from "@noldova/ui.components.angular";
   *
   * export const readme: DiffFile = new DiffFile("README.md", "README.md", null, DiffFileStatus.Added, 1, 0, "Markdown",
   *   new DiffHunks([new DiffHunk("h1", 0, 0, 1, 1, [new DiffAddedLine(1, "# Notes")])]));
   * ```
   */
  public constructor(id: string, path: string, oldPath: string | null, status: DiffFileStatus, additions: number, deletions: number, language: string | null,
    content: DiffContent);
}

/**
 * Where the person's review of one file stands, which the owner of
 * {@link DiffViewComponent} keeps by file id: each hunk's state by hunk id,
 * and the file's own state for a file with no hunks, such as a binary file.
 * The view derives a file's shown state from its hunks.
 */
export declare class DiffFileReview {
  /**
   * A review with every hunk undecided, which a file has when the owner's
   * map has no review for it.
   */
  public static readonly undecided: DiffFileReview;

  /**
   * Each hunk's state by its id; a hunk it doesn't name is undecided.
   */
  public readonly hunkStates: ReadonlyMap<string, DiffReviewState>;

  /**
   * The file's state when it has no hunks.
   */
  public readonly state: DiffReviewState;

  /**
   * Creates the review.
   *
   * @param hunkStates Each hunk's state by its id; none when left out.
   * @param state The file's state when it has no hunks; undecided when left
   * out.
   * @example
   * ```ts
   * import { DiffFileReview, DiffReviewState } from "@noldova/ui.components.angular";
   *
   * export const firstKept: DiffFileReview = new DiffFileReview(new Map([["h1", DiffReviewState.Accepted]]));
   * ```
   */
  public constructor(hunkStates?: ReadonlyMap<string, DiffReviewState>, state?: DiffReviewState);

  /**
   * Gives a hunk's state.
   *
   * @param hunkId The hunk's id.
   * @returns Its state, or undecided when the review doesn't name it.
   * @example
   * ```ts
   * import { DiffFileReview, type DiffReviewState } from "@noldova/ui.components.angular";
   *
   * export const first: DiffReviewState = DiffFileReview.undecided.hunkState("h1");
   * ```
   */
  public hunkState(hunkId: string): DiffReviewState;

  /**
   * Derives the file's state from its hunks.
   *
   * @param hunkIds The ids of the file's hunks.
   * @returns Their state when they all have the same one, null when they
   * differ, which the view shows as Partly reviewed, or the file's own state
   * when there are none.
   * @example
   * ```ts
   * import { DiffFileReview, type DiffReviewState } from "@noldova/ui.components.angular";
   *
   * export const file: DiffReviewState | null = DiffFileReview.undecided.stateOf(["h1", "h2"]);
   * ```
   */
  public stateOf(hunkIds: readonly string[]): DiffReviewState | null;

  /**
   * Applies the person's review request to this review of its file. A
   * request for the whole file sets every hunk and the file's own state; a
   * request for one hunk sets that hunk only.
   *
   * @param request The request {@link DiffViewComponent.reviewRequested}
   * emitted.
   * @param file The file the request is for, whose hunks a request for the
   * whole file sets.
   * @returns The new review; this one stays unchanged.
   * @throws DiffException synchronously when the request is for another
   * file, or for a hunk the file doesn't have.
   * @example
   * ```ts
   * import { DiffAddedLine, DiffFile, DiffFileReview, DiffFileStatus, DiffHunk, DiffHunks, DiffReviewRequest, DiffReviewState } from "@noldova/ui.components.angular";
   *
   * const notes: DiffFile = new DiffFile("notes", "notes.md", null, DiffFileStatus.Added, 1, 0, null,
   *   new DiffHunks([new DiffHunk("h1", 0, 0, 1, 1, [new DiffAddedLine(1, "# Notes")])]));
   *
   * export const kept: DiffFileReview = DiffFileReview.undecided.applied(new DiffReviewRequest("notes", null, DiffReviewState.Accepted), notes);
   * ```
   */
  public applied(request: DiffReviewRequest, file: DiffFile): DiffFileReview;
}

/**
 * A hunk: a run of a file's lines around one change, with its ranges on
 * each side. Its id is stable while the file changes again.
 */
export declare class DiffHunk {
  /**
   * The hunk's stable id, unique in its file and never shown.
   */
  public readonly id: string;

  /**
   * The first old line's number, or the line before the hunk when it has
   * no old lines.
   */
  public readonly oldStart: number;

  /**
   * How many old lines it has.
   */
  public readonly oldLength: number;

  /**
   * The first new line's number, or the line before the hunk when it has
   * no new lines.
   */
  public readonly newStart: number;

  /**
   * How many new lines it has.
   */
  public readonly newLength: number;

  /**
   * Its lines, in order.
   */
  public readonly lines: readonly DiffLine[];

  /**
   * The heading of the code it is in, such as a function's first line, or
   * null.
   */
  public readonly section: string | null;

  /**
   * How many of its lines are added or removed.
   */
  public readonly changedLineCount: number;

  /**
   * How many characters its lines hold.
   */
  public readonly characterCount: number;

  /**
   * Creates the hunk.
   *
   * @param id Its stable id, which must not be empty.
   * @param oldStart The first old line's number, a whole number of 0 or more.
   * @param oldLength How many old lines it has, a whole number of 0 or more.
   * @param newStart The first new line's number, a whole number of 0 or more.
   * @param newLength How many new lines it has, a whole number of 0 or more.
   * @param lines Its lines, whose old numbers run from the old start for
   * the old length, one each, in order, and whose new numbers do the same.
   * @param section The heading of the code it is in; none when left out or
   * null.
   * @throws DiffException synchronously when the id is empty, a start or a
   * length is not a whole number of 0 or more, or the lines' numbers don't
   * match the ranges.
   * @example
   * ```ts
   * import { DiffAddedLine, DiffContextLine, DiffHunk, DiffRemovedLine } from "@noldova/ui.components.angular";
   *
   * export const hunk: DiffHunk = new DiffHunk("h1", 4, 2, 4, 2, [
   *   new DiffContextLine(4, 4, "let total = 0;"),
   *   new DiffRemovedLine(5, "total += 1;"),
   *   new DiffAddedLine(5, "total += step;")
   * ], "function count()");
   * ```
   */
  public constructor(id: string, oldStart: number, oldLength: number, newStart: number, newLength: number, lines: readonly DiffLine[], section?: string | null);
}

/**
 * The content of a file whose changes are shown as hunks.
 */
export declare class DiffHunks extends DiffContent {
  /**
   * Creates the content.
   *
   * @param hunks The hunks, in order, each with an id unique among them.
   * @throws DiffException synchronously when two hunks have the same id.
   * @example
   * ```ts
   * import { DiffAddedLine, DiffHunk, DiffHunks } from "@noldova/ui.components.angular";
   *
   * export const added: DiffHunks = new DiffHunks([new DiffHunk("h1", 0, 0, 1, 1, [new DiffAddedLine(1, "first")])]);
   * ```
   */
  public constructor(hunks: readonly DiffHunk[]);
}

/**
 * A line of a hunk. Its class is its kind: {@link DiffContextLine},
 * {@link DiffAddedLine} or {@link DiffRemovedLine}.
 */
export declare abstract class DiffLine {
  /**
   * Its text, without its line break.
   */
  public readonly text: string;

  /**
   * Its number in the old file, or null when it is only on the new side.
   */
  public readonly oldNumber: number | null;

  /**
   * Its number in the new file, or null when it is only on the old side.
   */
  public readonly newNumber: number | null;

  /**
   * Creates the line, which a subclass does with the numbers its kind has.
   *
   * @param text Its text, without its line break.
   * @param oldNumber Its number in the old file, or null.
   * @param newNumber Its number in the new file, or null.
   * @throws DiffException synchronously when a given number is not a whole
   * number of 1 or more.
   * @example
   * ```ts
   * import { DiffLine, DiffLineKind, DiffSide } from "@noldova/ui.components.angular";
   *
   * export class DiffMovedLine extends DiffLine {
   *   public constructor(newNumber: number, text: string) {
   *     super(text, null, newNumber);
   *   }
   *
   *   public get kind(): DiffLineKind {
   *     return DiffLineKind.Added;
   *   }
   *
   *   public get side(): DiffSide {
   *     return DiffSide.New;
   *   }
   * }
   * ```
   */
  protected constructor(text: string, oldNumber: number | null, newNumber: number | null);

  /**
   * What it is.
   */
  public abstract get kind(): DiffLineKind;

  /**
   * The side a unified view numbers it by: old for a removed line, new for
   * the others.
   */
  public abstract get side(): DiffSide;

  /**
   * Tells whether it has a number on a side.
   *
   * @param side The side.
   * @returns True when it is on that side.
   * @example
   * ```ts
   * import { DiffAddedLine, DiffSide } from "@noldova/ui.components.angular";
   *
   * export const isOld: boolean = new DiffAddedLine(3, "x").hasNumberOn(DiffSide.Old);
   * ```
   */
  public hasNumberOn(side: DiffSide): boolean;

  /**
   * Gives its number on a side.
   *
   * @param side The side, which it must be on.
   * @returns Its number there.
   * @throws DiffException synchronously when it is not on that side.
   * @example
   * ```ts
   * import { DiffContextLine, DiffSide } from "@noldova/ui.components.angular";
   *
   * export const old: number = new DiffContextLine(3, 4, "x").numberOn(DiffSide.Old);
   * ```
   */
  public numberOn(side: DiffSide): number;
}

/**
 * A line of a file on one side, which {@link DiffViewComponent} emits when
 * the person opens the file there or asks to comment on the line.
 */
export declare class DiffLineReference {
  /**
   * The file's id.
   */
  public readonly fileId: string;

  /**
   * The line's number on its side.
   */
  public readonly line: number;

  /**
   * The side the number is on.
   */
  public readonly side: DiffSide;

  /**
   * Creates the reference.
   *
   * @param fileId The file's id.
   * @param line The line's number on its side.
   * @param side The side.
   * @example
   * ```ts
   * import { DiffLineReference, DiffSide } from "@noldova/ui.components.angular";
   *
   * export const line: DiffLineReference = new DiffLineReference("src/app.ts", 12, DiffSide.New);
   * ```
   */
  public constructor(fileId: string, line: number, side: DiffSide);
}

/**
 * The content of a file whose changes are still to load. The view asks for
 * them through its `fileExpanded` output when the file is expanded.
 */
export declare class DiffPending extends DiffContent {
  /**
   * Creates the content.
   *
   * @example
   * ```ts
   * import { DiffPending } from "@noldova/ui.components.angular";
   *
   * export const loading: DiffPending = new DiffPending();
   * ```
   */
  public constructor();
}

/**
 * The content of a file that couldn't be read: no hunks, and the reason.
 */
export declare class DiffReadFailure extends DiffContent {
  /**
   * The reason, shown in the file's body.
   */
  public readonly message: string;

  /**
   * Creates the content.
   *
   * @param message The reason, which must not be empty.
   * @throws DiffException synchronously when the message is empty.
   * @example
   * ```ts
   * import { DiffReadFailure } from "@noldova/ui.components.angular";
   *
   * export const unreadable: DiffReadFailure = new DiffReadFailure("The file couldn't be read.");
   * ```
   */
  public constructor(message: string);
}

/**
 * A line only on the old side of a hunk.
 */
export declare class DiffRemovedLine extends DiffLine {
  /**
   * Creates the line.
   *
   * @param oldNumber Its number in the old file, from 1.
   * @param text Its text, without its line break.
   * @throws DiffException synchronously when the number is not a whole
   * number of 1 or more.
   * @example
   * ```ts
   * import { DiffRemovedLine } from "@noldova/ui.components.angular";
   *
   * export const removed: DiffRemovedLine = new DiffRemovedLine(12, "const limit = 5;");
   * ```
   */
  public constructor(oldNumber: number, text: string);

  /**
   * {@link DiffLineKind.Removed}.
   */
  public get kind(): DiffLineKind;

  /**
   * {@link DiffSide.Old}.
   */
  public get side(): DiffSide;
}

/**
 * The person's request to accept or reject a file, or one of its hunks,
 * which {@link DiffViewComponent} emits by ids so that it stays right while
 * the files change.
 */
export declare class DiffReviewRequest {
  /**
   * The file's id.
   */
  public readonly fileId: string;

  /**
   * The hunk's id, or null when the request is for the whole file.
   */
  public readonly hunkId: string | null;

  /**
   * The state asked for: {@link DiffReviewState.Accepted} or
   * {@link DiffReviewState.Rejected}.
   */
  public readonly state: DiffReviewState;

  /**
   * Creates the request.
   *
   * @param fileId The file's id.
   * @param hunkId The hunk's id, or null for the whole file.
   * @param state The state asked for.
   * @example
   * ```ts
   * import { DiffReviewRequest, DiffReviewState } from "@noldova/ui.components.angular";
   *
   * export const acceptFile: DiffReviewRequest = new DiffReviewRequest("src/app.ts", null, DiffReviewState.Accepted);
   * ```
   */
  public constructor(fileId: string, hunkId: string | null, state: DiffReviewState);
}

/**
 * A keyboard shortcut of {@link DiffViewComponent}, for an app's list of
 * shortcuts.
 */
export declare class DiffShortcut {
  /**
   * The keys, in the form of `aria-keyshortcuts`, such as `Alt+ArrowDown`.
   */
  public readonly keys: string;

  /**
   * What they do, such as "Next change".
   */
  public readonly label: string;

  /**
   * Creates the shortcut.
   *
   * @param keys The keys.
   * @param label What they do.
   * @example
   * ```ts
   * import { DiffShortcut } from "@noldova/ui.components.angular";
   *
   * export const next: DiffShortcut = new DiffShortcut("Alt+ArrowDown", "Next change");
   * ```
   */
  public constructor(keys: string, label: string);
}

/**
 * A reviewable diff, `nol-diff-view`: a region with a toolbar for its
 * layout and word wrap, then each file as a section headed by a button that
 * collapses and expands it, its path, status, counts and review state, Open
 * file, and Accept and Reject. Each hunk is a group named "Change 2 of 5",
 * with its range, its review state, and Accept and Reject, then its lines:
 * each marked by a sign and named for screen readers, such as "Added line
 * 12", never by color alone. A side-by-side row reads its old line before
 * its new line.
 *
 * A changed line is tinted lightly in the added or removed color, and the
 * characters it changes from the line it is paired with more strongly, by the
 * words the two lines don't share; a pair that is mostly different, or a line
 * longer than 500 characters, takes no stronger tint. Code in a language the
 * view knows, by the file's {@link DiffFile.language}, is colored by the kind
 * of each token once its grammar has loaded, each side of a hunk read on its
 * own; other code stays plain. In forced colors the code stays in the system's
 * text color and the changed characters are underlined.
 *
 * Everything is keyed by the files' and hunks' stable ids, so while the
 * owner replaces the files as an agent keeps editing, the scroll position,
 * the review states and what is collapsed stay. Every map and set the view
 * takes is replaced, never changed in place: the owner binds a new one, and
 * the view emits a new one through `collapsed` and `revealed`, so change
 * detection sees it. Entries whose file or hunk id no longer exists are
 * kept and ignored, so they apply again when the file comes back.
 *
 * Each hunk's lines are one Tab stop, which stays on the line last focused;
 * Up and Down, Home and End move among them, Enter asks to open the file at
 * the line, unless the owner doesn't open files, and Shift+Enter asks to
 * comment on it. Alt with Down or Up moves
 * to the next or previous change, and Alt+Shift with Down or Up to the next
 * or previous file; {@link DiffViewComponent.shortcuts} lists them for an
 * app's list of shortcuts. A file over the view's collapse limit waits
 * behind Load diff. A review state that changes after the person acts on a
 * file in the view is announced politely: the file's when its own state
 * changes, otherwise each hunk's. A change the person didn't make here, such
 * as an agent's edit, is not announced.
 *
 * @example
 * ```ts
 * import { Component, type WritableSignal, signal } from "@angular/core";
 * import { DiffAddedLine, DiffFile, DiffFileReview, DiffFileStatus, DiffHunk, DiffHunks, type DiffReviewRequest, DiffViewComponent } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-change-review",
 *   imports: [DiffViewComponent],
 *   template: "<nol-diff-view label=\"Changes\" [files]=\"files\" [reviews]=\"reviews()\" (reviewRequested)=\"review($event)\" />"
 * })
 * export class ChangeReviewComponent {
 *   protected readonly files: readonly DiffFile[] = [new DiffFile("notes", "notes.md", null, DiffFileStatus.Added, 1, 0, "Markdown",
 *     new DiffHunks([new DiffHunk("h1", 0, 0, 1, 1, [new DiffAddedLine(1, "# Notes")])]))];
 *   protected readonly reviews: WritableSignal<ReadonlyMap<string, DiffFileReview>> = signal(new Map());
 *
 *   protected review(request: DiffReviewRequest): void {
 *     const file = this.files.find(t => t.id === request.fileId);
 *     if (file !== undefined)
 *       this.reviews.update(t => new Map([...t, [file.id, (t.get(file.id) ?? DiffFileReview.undecided).applied(request, file)]]));
 *   }
 * }
 * ```
 */
export declare class DiffViewComponent {
  /**
   * The view's keyboard shortcuts: Alt+ArrowDown and Alt+ArrowUp for the
   * next and previous change, Alt+Shift+ArrowDown and Alt+Shift+ArrowUp for
   * the next and previous file.
   */
  public static readonly shortcuts: readonly DiffShortcut[];

  /**
   * The files, in order, each with a unique id.
   */
  public readonly files: InputSignal<readonly DiffFile[]>;

  /**
   * The view's accessible name.
   */
  public readonly label: InputSignal<string>;

  /**
   * How hunks are laid out, which the toolbar's Side by side button toggles;
   * unified until it is pressed or bound.
   */
  public readonly layout: ModelSignal<DiffLayout>;

  /**
   * Whether long lines wrap, which the toolbar's Word wrap button toggles;
   * false, so they scroll sideways, until it is pressed or bound.
   */
  public readonly wrapped: ModelSignal<boolean>;

  /**
   * Whether the view hides the Accept and Reject buttons of its files and
   * hunks; false when not bound. Review states still show.
   */
  public readonly readOnly: InputSignal<boolean>;

  /**
   * Whether the owner opens files, so the view offers to; true when not
   * bound. While false, the view shows no Open file, its line numbers are
   * plain text, and Enter in a hunk's lines does nothing, so the lines'
   * shortcuts leave it out.
   */
  public readonly canOpenFiles: InputSignal<boolean>;

  /**
   * Each file's review by its id; a file it doesn't name is undecided. Empty
   * when not bound.
   */
  public readonly reviews: InputSignal<ReadonlyMap<string, DiffFileReview>>;

  /**
   * The ids of the collapsed files, which each file's header toggles; empty,
   * so every file is expanded, until one is collapsed or it is bound.
   */
  public readonly collapsed: ModelSignal<ReadonlySet<string>>;

  /**
   * The ids of the files whose changes the person loaded with Load diff;
   * empty until one is loaded or it is bound.
   */
  public readonly revealed: ModelSignal<ReadonlySet<string>>;

  /**
   * When a file's changes wait behind Load diff;
   * {@link DiffCollapseLimit.standard} when not bound.
   */
  public readonly collapseLimit: InputSignal<DiffCollapseLimit>;

  /**
   * Whether the view's Alt shortcuts work; true when not bound. Its
   * methods work either way, so an app can bind its own keys to them.
   */
  public readonly hasShortcuts: InputSignal<boolean>;

  /**
   * Emits the review the person asked for, Accept or Reject, on a file or a
   * hunk. The view doesn't change its review states itself: the owner
   * applies the request to the `reviews` it binds.
   */
  public readonly reviewRequested: OutputEmitterRef<DiffReviewRequest>;

  /**
   * Emits where the person asked to open a file: from Open file, at its
   * first line shown, or line 1 when it has none; from a line number; or
   * from a line with Enter. It never emits while
   * {@link DiffViewComponent.canOpenFiles} is false.
   */
  public readonly fileOpenRequested: OutputEmitterRef<DiffLineReference>;

  /**
   * Emits the person's request for more unchanged lines around a hunk.
   */
  public readonly contextRequested: OutputEmitterRef<DiffContextRequest>;

  /**
   * Emits the id of a file whose content is {@link DiffPending} once it is
   * shown expanded, when it first appears or when the person expands it, so
   * the owner loads its changes. It emits again for the file only after the
   * file has had other content.
   */
  public readonly fileExpanded: OutputEmitterRef<string>;

  /**
   * Emits the line the person asked to comment on, with the button shown on
   * a line under the pointer or with Shift+Enter.
   */
  public readonly lineCommentRequested: OutputEmitterRef<DiffLineReference>;

  /**
   * Creates the component, which Angular does for each `nol-diff-view`
   * element.
   *
   * @example
   * ```ts
   * import { Component, type WritableSignal, signal } from "@angular/core";
   * import { DiffFile, DiffFileStatus, DiffLayout, DiffPending, DiffViewComponent } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-lazy-diff",
   *   imports: [DiffViewComponent],
   *   template: "<nol-diff-view label=\"Changes\" [files]=\"files()\" [(layout)]=\"layout\" [(collapsed)]=\"collapsed\" [readOnly]=\"true\" (fileExpanded)=\"load($event)\" />"
   * })
   * export class LazyDiffComponent {
   *   protected readonly files: WritableSignal<readonly DiffFile[]> = signal([new DiffFile("app", "src/app.ts", null, DiffFileStatus.Modified, 4, 1, "TypeScript", new DiffPending())]);
   *   protected readonly layout: WritableSignal<DiffLayout> = signal(DiffLayout.SideBySide);
   *   protected readonly collapsed: WritableSignal<ReadonlySet<string>> = signal(new Set(["app"]));
   *   public readonly requested: string[] = [];
   *
   *   protected load(fileId: string): void {
   *     this.requested.push(fileId);
   *   }
   * }
   * ```
   */
  public constructor();

  /**
   * Moves focus to the first changed line of the next hunk shown after the
   * focus, or of the first hunk when the focus is outside the view; nothing
   * happens after the last one.
   *
   * @example
   * ```ts
   * import { Component, type Signal, viewChild } from "@angular/core";
   * import { type DiffFile, DiffViewComponent } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-review-pane",
   *   imports: [DiffViewComponent],
   *   template: "<button type=\"button\" (click)=\"next()\">Next change</button><nol-diff-view label=\"Changes\" [files]=\"files\" />"
   * })
   * export class ReviewPaneComponent {
   *   private readonly view: Signal<DiffViewComponent> = viewChild.required(DiffViewComponent);
   *
   *   protected readonly files: readonly DiffFile[] = [];
   *
   *   protected next(): void {
   *     this.view().nextChange();
   *   }
   * }
   * ```
   */
  public nextChange(): void;

  /**
   * Moves focus to the first changed line of the previous hunk shown before
   * the focus, or of the last hunk when the focus is outside the view;
   * nothing happens before the first one.
   *
   * @example
   * ```ts
   * import { Component, type Signal, viewChild } from "@angular/core";
   * import { type DiffFile, DiffViewComponent } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-review-back",
   *   imports: [DiffViewComponent],
   *   template: "<button type=\"button\" (click)=\"back()\">Previous change</button><nol-diff-view label=\"Changes\" [files]=\"files\" />"
   * })
   * export class ReviewBackComponent {
   *   private readonly view: Signal<DiffViewComponent> = viewChild.required(DiffViewComponent);
   *
   *   protected readonly files: readonly DiffFile[] = [];
   *
   *   protected back(): void {
   *     this.view().previousChange();
   *   }
   * }
   * ```
   */
  public previousChange(): void;

  /**
   * Moves focus to the header of the next file after the focus, or of the
   * first file when the focus is outside the view; nothing happens after
   * the last one.
   *
   * @example
   * ```ts
   * import { Component, type Signal, viewChild } from "@angular/core";
   * import { type DiffFile, DiffViewComponent } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-review-files",
   *   imports: [DiffViewComponent],
   *   template: "<button type=\"button\" (click)=\"next()\">Next file</button><nol-diff-view label=\"Changes\" [files]=\"files\" />"
   * })
   * export class ReviewFilesComponent {
   *   private readonly view: Signal<DiffViewComponent> = viewChild.required(DiffViewComponent);
   *
   *   protected readonly files: readonly DiffFile[] = [];
   *
   *   protected next(): void {
   *     this.view().nextFile();
   *   }
   * }
   * ```
   */
  public nextFile(): void;

  /**
   * Moves focus to the header of the previous file before the focus, or of
   * the last file when the focus is outside the view; nothing happens
   * before the first one.
   *
   * @example
   * ```ts
   * import { Component, type Signal, viewChild } from "@angular/core";
   * import { type DiffFile, DiffViewComponent } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-review-files-back",
   *   imports: [DiffViewComponent],
   *   template: "<button type=\"button\" (click)=\"back()\">Previous file</button><nol-diff-view label=\"Changes\" [files]=\"files\" />"
   * })
   * export class ReviewFilesBackComponent {
   *   private readonly view: Signal<DiffViewComponent> = viewChild.required(DiffViewComponent);
   *
   *   protected readonly files: readonly DiffFile[] = [];
   *
   *   protected back(): void {
   *     this.view().previousFile();
   *   }
   * }
   * ```
   */
  public previousFile(): void;
}

/**
 * One docking target, `nol-docking-guide`, shown while a view's tab is
 * dragged: a glyph pointing where the view would land, named for the action
 * it takes, with the chosen look while the pointer is over it.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { DockingDirection, DockingGuideComponent } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-left-drop-target",
 *   imports: [DockingGuideComponent],
 *   template: "<nol-docking-guide [direction]=\"left\" [chosen]=\"isOver\" (pointerenter)=\"isOver = true\" (pointerleave)=\"isOver = false\" />"
 * })
 * export class LeftDropTargetComponent {
 *   protected readonly left: DockingDirection = DockingDirection.Left;
 *   protected isOver: boolean = false;
 * }
 * ```
 */
export declare class DockingGuideComponent {
  /**
   * Where the view would land: in the group itself, or on one of its sides.
   */
  public readonly direction: InputSignal<DockingDirection>;

  /**
   * Whether this is the target the view lands on if dropped now; false when
   * not bound.
   */
  public readonly chosen: InputSignal<boolean>;
}

/**
 * The docking targets of one tab group, `nol-docking-plate`: a plate with a
 * guide for the center and one for each side, top, left, right and bottom,
 * shown while a view's tab is dragged over the group.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { DockingDirection, DockingPlateComponent } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-group-drop-targets",
 *   imports: [DockingPlateComponent],
 *   template: "<nol-docking-plate [chosen]=\"chosen\" />"
 * })
 * export class GroupDropTargetsComponent {
 *   protected readonly chosen: DockingDirection | null = DockingDirection.Center;
 * }
 * ```
 */
export declare class DockingPlateComponent {
  /**
   * The direction of the guide the view lands on if dropped now, or null
   * while the pointer is over none of them; null when not bound.
   */
  public readonly chosen: InputSignal<DockingDirection | null>;
}

/**
 * The rule that tells a click from a drag: a press becomes a drag once the
 * pointer moves far enough from where it went down. The kit's tree and the
 * window's tab and toolbar drags all use it, so every drag starts at the same
 * distance.
 */
export declare class DragGesture {
  /**
   * The distance, in CSS pixels, the pointer moves before a press becomes a
   * drag: 4.
   */
  public static readonly threshold: number;

  /**
   * Tells whether a press has become a drag. It remembers nothing; the
   * caller keeps a drag going once it has started.
   *
   * @param startX Where the pointer went down, as `clientX`, in CSS pixels.
   * @param startY Where the pointer went down, as `clientY`, in CSS pixels.
   * @param x Where the pointer is now, as `clientX`.
   * @param y Where the pointer is now, as `clientY`.
   * @returns True when the pointer is at least {@link DragGesture.threshold}
   * pixels from where it went down, in a straight line.
   * @example
   * ```ts
   * import { DragGesture } from "@noldova/ui.components.angular";
   *
   * export function isDrag(down: PointerEvent, move: PointerEvent): boolean {
   *   return DragGesture.hasStarted(down.clientX, down.clientY, move.clientX, move.clientY);
   * }
   * ```
   */
  public static hasStarted(startX: number, startY: number, x: number, y: number): boolean;
}

/**
 * Follows one pointer from its press until the drag ends, wherever the
 * pointer goes. Releasing the button ends the drag; a cancelled pointer, a
 * lost pointer capture, the window losing focus, a move with the primary
 * button no longer pressed, a move outside the window, and Escape once the
 * drag has started cancel it. So a release over the title bar or outside the
 * window, which the page may never see, never leaves a drag running. The
 * kit's sash and tree and the window's tab and toolbar drags all use it.
 */
export declare class PointerDrag {
  /**
   * Starts following the pointer of a press. It listens on the element's
   * document and window until {@link PointerDrag.stop}, and ignores the
   * events of other pointers.
   *
   * @param element The element that captures the pointer once the drag
   * starts; the document's root element for a drag that moves over the whole
   * window.
   * @param press The `pointerdown` that began the press.
   * @param move Receives each move while the primary button stays pressed.
   * @param end Runs when the button is released; it calls
   * {@link PointerDrag.stop}.
   * @param cancel Runs when the drag is cancelled; it calls
   * {@link PointerDrag.stop}.
   * @param escape Runs instead of `cancel` when Escape cancels the drag, for
   * a drag that goes back where it began only then; `cancel` when not given.
   * It calls {@link PointerDrag.stop}.
   * @example
   * ```ts
   * import { PointerDrag } from "@noldova/ui.components.angular";
   *
   * export function follow(element: HTMLElement, press: PointerEvent, onMove: (x: number) => void): PointerDrag {
   *   const drag: PointerDrag = new PointerDrag(element, press, t => onMove(t.clientX), () => drag.stop(), () => drag.stop());
   *   drag.start();
   *   return drag;
   * }
   * ```
   */
  public constructor(element: HTMLElement, press: PointerEvent, move: (event: PointerEvent) => void, end: () => void, cancel: () => void, escape?: () => void);

  /**
   * Marks the press as a drag: the element captures the pointer, so every
   * move and the release reach the document, and Escape now cancels.
   *
   * @example
   * ```ts
   * import { DragGesture, type PointerDrag } from "@noldova/ui.components.angular";
   *
   * export function startOnceFar(drag: PointerDrag, press: PointerEvent, move: PointerEvent): void {
   *   if (DragGesture.hasStarted(press.clientX, press.clientY, move.clientX, move.clientY))
   *     drag.start();
   * }
   * ```
   */
  public start(): void;

  /**
   * Stops following the pointer: removes every listener and releases the
   * capture the element still holds. Calling it again does nothing.
   *
   * @example
   * ```ts
   * import type { PointerDrag } from "@noldova/ui.components.angular";
   *
   * export function stopAll(drags: readonly PointerDrag[]): void {
   *   for (const drag of drags)
   *     drag.stop();
   * }
   * ```
   */
  public stop(): void;
}

/**
 * A message below a field, `nol-field-message`, text that wraps anywhere
 * rather than widen its row: by default a validation error, error-colored
 * and an alert that is announced when it appears, or with its `kind` a note
 * or hint, muted and never announced. The field names it in
 * `aria-describedby`, and takes `aria-invalid="true"` while an error shows.
 *
 * @example
 * ```ts
 * import { Component, type WritableSignal, signal } from "@angular/core";
 * import { FieldMessageComponent, FieldMessageKind, TextFieldComponent } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-port-field",
 *   imports: [FieldMessageComponent, TextFieldComponent],
 *   template: `
 *     <input nol-text-field type="number" aria-label="Port" [attr.aria-invalid]="error() ? true : null" [attr.aria-describedby]="error() ? 'port-note port-error' : 'port-note'" />
 *     <nol-field-message id="port-note" [kind]="note">From 1024 to 65535.</nol-field-message>
 *     @if (error(); as message) {
 *       <nol-field-message id="port-error">{{ message }}</nol-field-message>
 *     }
 *   `
 * })
 * export class PortFieldComponent {
 *   protected readonly note: FieldMessageKind = FieldMessageKind.Note;
 *   protected readonly error: WritableSignal<string | null> = signal(null);
 * }
 * ```
 */
export declare class FieldMessageComponent {
  /**
   * What the message says, its `kind` input: an error unless bound. A note
   * that is always on screen takes {@link FieldMessageKind.Note}, so a screen
   * reader doesn't interrupt with it each time it renders.
   */
  public readonly kind: InputSignal<FieldMessageKind>;
}

/**
 * The mark of a file's type, `nol-file-badge`, a 1rem box beside the file's
 * name: letters on a tinted rounded square for code, PDFs, documents,
 * spreadsheets and tables of data, and archives, a glyph on a tinted
 * square for scripts, a glyph alone in the type's color for other kinds,
 * and a plain file for a name the kit doesn't know; a folder, when the app
 * says the path is one, has a folder glyph in the plain file's color. The type is found by the
 * whole name, such as `Dockerfile` or `.gitignore`, then by the last
 * extension, ignoring case and any folders. It is hidden from assistive
 * technology, since the name beside it is the text, and copies as nothing,
 * not even a line break, so a line it sits in copies whole.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { FileBadgeComponent } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-edited-file",
 *   imports: [FileBadgeComponent],
 *   template: "<nol-file-badge [fileName]=\"path\" /><span>{{ path }}</span>"
 * })
 * export class EditedFileComponent {
 *   protected readonly path: string = "src/app/main.ts";
 * }
 * ```
 */
export declare class FileBadgeComponent {
  /**
   * The file's name or path, whose type the badge marks.
   */
  public readonly fileName: InputSignal<string>;

  /**
   * Whether the path is a folder, which shows the folder mark whatever
   * {@link FileBadgeComponent.fileName} is; false when not bound. The app
   * says so, since a folder's name, as `icon-preview`, doesn't tell it
   * apart from a file's.
   */
  public readonly isFolder: InputSignal<boolean>;
}

/**
 * A text counted in graphemes, the characters a reader sees, so an emoji
 * with its skin tone or a letter with its accent marks counts as one and a
 * prefix never cuts one in two. A {@link TextReveal} counts what it shows
 * in them, as the kit's streamed Markdown does.
 */
export declare class GraphemeText {
  /**
   * The text, as given.
   */
  public readonly text: string;

  /**
   * Creates the counted text.
   *
   * @param text The text, split into graphemes in the browser's locale.
   * @example
   * ```ts
   * import { GraphemeText } from "@noldova/ui.components.angular";
   *
   * export const thought: GraphemeText = new GraphemeText("Reading the files 👍🏽");
   * ```
   */
  public constructor(text: string);

  /**
   * How many graphemes the text has: 0 for an empty text.
   */
  public get count(): number;

  /**
   * The text's first graphemes.
   *
   * @param count How many graphemes to take.
   * @returns The text up to the end of that many graphemes: an empty string
   * for 0 or less, and the whole text for its count or more.
   * @example
   * ```ts
   * import { GraphemeText } from "@noldova/ui.components.angular";
   *
   * export const shown: string = new GraphemeText("Reading the files 👍🏽").prefix(18);
   * ```
   */
  public prefix(count: number): string;
}

/**
 * A foldable group header, `nol-group-header`: the label of a group of rows
 * that the person can fold, as a section header is for a group that always
 * shows. One button holds the twistie, the title, cut with an ellipsis and
 * shown whole in a tooltip while cut, and the count as muted text after it;
 * it exposes whether the group is open and the region it controls, and sits
 * in an element with the heading role. Content projected into it, such as
 * icon buttons, follows the button at the end of the row, outside it, as
 * its own Tab stops. The row takes the hover fill a tree row does.
 *
 * @example
 * ```ts
 * import { Component, type WritableSignal, signal } from "@angular/core";
 * import { GroupHeaderComponent, IconButtonComponent } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-session-group",
 *   imports: [GroupHeaderComponent, IconButtonComponent],
 *   template: `
 *     <nol-group-header label="Running" [count]="2" countLabel="2 sessions" controls="running-rows" [(expanded)]="isOpen">
 *       <button type="button" nol-icon-button icon="add" label="New session"></button>
 *     </nol-group-header>
 *     @if (isOpen()) {
 *       <ul id="running-rows"><li>Build</li><li>Review</li></ul>
 *     }
 *   `
 * })
 * export class SessionGroupComponent {
 *   protected readonly isOpen: WritableSignal<boolean> = signal(true);
 * }
 * ```
 */
export declare class GroupHeaderComponent {
  /**
   * The group's title, its required `label` input.
   */
  public readonly label: InputSignal<string>;

  /**
   * How many rows the group holds, shown after the title, its `count`
   * input; none shows when not bound or null. With a count, the button is
   * named by the title, a comma, and the count's words, so a screen reader
   * reads them as their own phrase, such as `Running, 2 sessions`.
   */
  public readonly count: InputSignal<number | null>;

  /**
   * The words a screen reader reads for the count, its `countLabel` input,
   * such as `2 sessions`, which say what the number counts; the shown number
   * stays as it is. The button is named by these words, not by the number,
   * so they hold the shown number and change whenever it changes. The number
   * alone when not bound or null, and unused without a count.
   */
  public readonly countLabel: InputSignal<string | null>;

  /**
   * The heading level screen readers announce, its `level` input; 3 when
   * not bound.
   */
  public readonly level: InputSignal<number>;

  /**
   * The id of the element holding the group's rows, which the button
   * controls, its `controls` input; none when not bound.
   */
  public readonly controls: InputSignal<string | null>;

  /**
   * Whether the group is open, its two-way `expanded` model; true when not
   * bound. Pressing the button, or Enter or Space on it, flips it.
   */
  public readonly expanded: ModelSignal<boolean>;
}

/**
 * The kit's icon-only button, `button[nol-icon-button]`, applied to a native
 * button, which keeps its own `type`, `disabled` and events. It shows a
 * glyph and is named by its label; content projected into it follows the
 * glyph, such as a {@link ViewBadgeComponent}. Marked aria-disabled, it
 * stays focusable and looks disabled, without a hover fill, as a disabled
 * one does.
 *
 * @example
 * ```ts
 * import { Component, type WritableSignal, signal } from "@angular/core";
 * import { IconButtonComponent } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-wrap-toggle",
 *   imports: [IconButtonComponent],
 *   template: "<button type=\"button\" nol-icon-button icon=\"wrap_text\" label=\"Wrap lines\" [pressed]=\"isWrapped()\" (click)=\"isWrapped.set(!isWrapped())\"></button>"
 * })
 * export class WrapToggleComponent {
 *   protected readonly isWrapped: WritableSignal<boolean> = signal(false);
 * }
 * ```
 */
export declare class IconButtonComponent {
  /**
   * Creates the button, which Angular does for each `nol-icon-button` element,
   * and starts ignoring its clicks and activation keys while it is busy.
   *
   * @example
   * ```ts
   * import { Component, type WritableSignal, signal } from "@angular/core";
   * import { IconButtonComponent } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-refresh-action",
   *   imports: [IconButtonComponent],
   *   template: "<button type=\"button\" nol-icon-button icon=\"refresh\" label=\"Refresh\" [busy]=\"isSaving()\"></button>"
   * })
   * export class RefreshActionComponent {
   *   protected readonly isSaving: WritableSignal<boolean> = signal(false);
   * }
   * ```
   */
  public constructor();

  /**
   * The Material Symbols name of the glyph, such as `close`.
   */
  public readonly icon: InputSignal<string>;

  /**
   * The button's accessible name, naming its action.
   */
  public readonly label: InputSignal<string>;

  /**
   * Whether a toggle button is pressed, or undefined when the button is no
   * toggle, which is the default.
   */
  public readonly pressed: InputSignal<boolean | undefined>;

  /**
   * Whether the button is a filled circle, for the main action of a field
   * such as a composer's Send: the theme's button color, kept under the
   * pointer, its glyph in the button text color, the `button-height` across,
   * and its focus outline outside the circle. A disabled or aria-disabled
   * filled button keeps its circle in the widget border color, its glyph in
   * the muted text color.
   * Under forced colors it is a `ButtonText` ring around a `ButtonText`
   * glyph, or `GrayText` while disabled or aria-disabled. False by default.
   */
  public readonly filled: InputSignal<boolean>;

  /**
   * Whether the button is a round overlay, for an action over an image such
   * as an attachment's Remove: a circle the icon button's size across in
   * the theme's `overlay` look, 70% black, its glyph in its `overlay-text`
   * look, white, the same in light and dark, so the glyph keeps 4.5:1 over
   * any image.
   * Under the pointer the toolbar hover lies over the fill; its focus outline
   * is outside the circle, and disabled or aria-disabled it is at half
   * opacity. Under forced colors it is a `ButtonText` ring around a
   * `ButtonText` glyph, or `GrayText` while disabled or aria-disabled. Where
   * it shows, such as only while its image is hovered or holds focus, is its
   * owner's. `filled` wins when both are set. False by default.
   */
  public readonly overlay: InputSignal<boolean>;

  /**
   * Whether an overlay icon button sits on the overlay backdrop itself, such
   * as an image viewer's Close, where the `overlay` fill would vanish: its
   * circle takes the theme's `overlay-control` look, white at 10%, with its
   * `overlay-control-hover` look, white at 8%, over it under the pointer and
   * while pressed, and its glyph the `overlay-control-text` look, #EEEEEE;
   * disabled, it is at 35% opacity. Forced colors keep the overlay look.
   * Ignored without `overlay`, and `filled` wins; false when not bound.
   */
  public readonly backdrop: InputSignal<boolean>;

  /**
   * Whether the icon button takes the button's height, 1.625rem, in place of
   * its own, for a row it shares with buttons, such as an image viewer's
   * zoom out, percentage and zoom in, so they share one height and center
   * line. Its glyph keeps the icon size. Ignored while `filled`, which is
   * already that size; false when not bound.
   */
  public readonly buttonHeight: InputSignal<boolean>;

  /**
   * Whether the button's action destroys something, such as Delete or
   * Remove: its glyph takes the theme's `error` color, with the same hover,
   * focus and disabled looks as the plain button; under forced colors it is
   * the plain button's `ButtonText`. Ignored while `filled` or `overlay`;
   * false when not bound.
   */
  public readonly danger: InputSignal<boolean>;

  /**
   * Whether the button has a tab action's size, for an action at the end of
   * a row that should sit and highlight as a tab's close button does, such
   * as an Explorer row's actions: its hit region is the tab action's slot,
   * `tab-action-slot`, at least 24px, and its hover fill is the tab close's,
   * `tab-close`, with the small radius. Its glyph and looks are otherwise the
   * plain button's. `filled` and `overlay` win when either is set; it wins
   * over `buttonHeight` on a plain button, which keeps the tab action's
   * size. False by default.
   */
  public readonly tabAction: InputSignal<boolean>;

  /**
   * Whether the button's work is under way: the kit's spinner, in the
   * glyph's color, stands centered in place of the glyph, so the button keeps
   * its size exactly; under forced colors the spinner keeps its own look, a
   * `Highlight` arc on a `Canvas` track. It is marked `aria-busy`, and ignores clicks, middle clicks,
   * Enter and Space, so neither its own handlers nor its parents hear them,
   * unless {@link IconButtonComponent.busyPressable} is on.
   * False when not bound.
   */
  public readonly busy: InputSignal<boolean>;

  /**
   * Whether a busy button still takes clicks, middle clicks, Enter and Space,
   * as when a press while the work runs is the app's to answer, such as a
   * shell block's Run while its commands run; it keeps the busy look and
   * `aria-busy`. False when not bound, so a busy button ignores presses.
   */
  public readonly busyPressable: InputSignal<boolean>;
}

/**
 * Code inside running text, `code[nol-inline-code]`: the code font on the
 * inline-code background with the small radius, at the code size,
 * `--nol-text-code`, which follows the Code size setting, whatever the size
 * of the text around it. It has no line height of its own, so it never makes
 * a line taller. Its text stays
 * fully opaque, and a long name wraps anywhere rather than widen its line.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { InlineCodeComponent } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-editor-hint",
 *   imports: [InlineCodeComponent],
 *   template: "<p>Set <code nol-inline-code>EDITOR</code> to choose the editor.</p>"
 * })
 * export class EditorHintComponent {
 * }
 * ```
 */
export declare class InlineCodeComponent {
}

/**
 * A CDK menu item, `[nolKeptOpenMenuItem]`, that leaves its menu open when
 * it is triggered: the host directive of {@link MenuGroupActionDirective},
 * which passes on its `disabled` input and `triggered` output under those
 * names. An app puts the menu group action on its icon button, not this
 * directive; the directive is exported so that an app's template that binds
 * `disabled` or `triggered` on the action compiles. It extends the CDK's
 * menu item, from which it inherits that input and output.
 */
export declare class KeptOpenMenuItemDirective extends CdkMenuItem {
  /**
   * Emits `triggered` unless the item is disabled, as the CDK's menu item
   * does, but leaves the menu open instead of closing it and its parents.
   *
   * @example
   * ```ts
   * import { Component, type Signal, viewChild } from "@angular/core";
   * import { IconButtonComponent, KeptOpenMenuItemDirective, MenuComponent, MenuGroupActionDirective, MenuGroupComponent } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-refresh-menu",
   *   imports: [IconButtonComponent, MenuComponent, MenuGroupActionDirective, MenuGroupComponent],
   *   template: `
   *     <nol-menu>
   *       <nol-menu-group label="Model">
   *         <button type="button" nol-icon-button nolMenuGroupAction icon="refresh" label="Refresh models"></button>
   *       </nol-menu-group>
   *     </nol-menu>`
   * })
   * export class RefreshMenuComponent {
   *   private readonly action: Signal<KeptOpenMenuItemDirective> = viewChild.required(KeptOpenMenuItemDirective);
   *
   *   protected refresh(): void {
   *     this.action().trigger();
   *   }
   * }
   * ```
   */
  public override trigger(): void;
}

/**
 * The exception thrown when an app names a link scheme a Markdown view
 * can't take, such as `https` or `javascript`.
 */
export declare class MarkdownException extends UiComponentsException {
  /**
   * The exception's name, `"MarkdownException"`, which the class sets itself
   * so that a minified build keeps it.
   */
  public override readonly name: string;

  /**
   * Creates the exception.
   *
   * @param message A sentence naming the value and why it is not valid.
   * @example
   * ```ts
   * import { MarkdownException } from "@noldova/ui.components.angular";
   *
   * export const refused: MarkdownException = new MarkdownException("The link scheme \"https\" is one the Markdown view handles itself, so an app can't name it.");
   * ```
   */
  public constructor(message: string);
}

/**
 * A link the person opens in a Markdown view or a {@link MessageComponent}:
 * a link in the text, a reference's chip, or a link in its card. The view
 * emits it from `linkOpen` beside the address it gives `linkActivate`, never
 * for a link to a file, which goes to `fileActivate`. The kit has already
 * cancelled the browser's default, a middle click's too, so the browser
 * never follows the link.
 */
export declare class LinkOpenEvent {
  /**
   * The link's address, as written, as `linkActivate` gives it.
   */
  public readonly url: string;

  /**
   * How the person opened it, read from {@link LinkOpenEvent.event}.
   */
  public readonly gesture: LinkGesture;

  /**
   * The click, middle click or Enter that opened it.
   */
  public readonly event: MouseEvent | KeyboardEvent;

  /**
   * Creates the event, reading its gesture from the event: middle for the
   * middle button, modified with Ctrl or Cmd held, plain otherwise.
   *
   * @param url The link's address.
   * @param event The click, middle click or Enter that opened it.
   * @example
   * ```ts
   * import { LinkGesture, LinkOpenEvent } from "@noldova/ui.components.angular";
   *
   * export const opened: LinkOpenEvent = new LinkOpenEvent("https://example.com/", new MouseEvent("click", { ctrlKey: true }));
   * export const isElsewhere: boolean = opened.gesture !== LinkGesture.Plain;
   * ```
   */
  public constructor(url: string, event: MouseEvent | KeyboardEvent);
}

/**
 * A link whose menu the person asks for, by a right-click or the menu key,
 * on a link in a Markdown view's text, a reference's chip or a link in its
 * card; the view emits it from `linkMenu`, never for a link to a file. The
 * kit leaves the browser's default alone: an app that shows its own menu
 * cancels it in its handler, before the handler returns, and a
 * {@link MessageComponent} then asks for no menu of its own.
 */
export declare class LinkMenuEvent {
  /**
   * The link's address, as written.
   */
  public readonly url: string;

  /**
   * The right-click, or the menu key's event, whose default the app cancels
   * in its handler, before it returns, when it shows its own menu.
   */
  public readonly event: MouseEvent;

  /**
   * Creates the event.
   *
   * @param url The link's address.
   * @param event The right-click or the menu key's event.
   * @example
   * ```ts
   * import { LinkMenuEvent } from "@noldova/ui.components.angular";
   *
   * export const asked: LinkMenuEvent = new LinkMenuEvent("https://example.com/", new MouseEvent("contextmenu"));
   * ```
   */
  public constructor(url: string, event: MouseEvent);
}

/**
 * An item on a code host that a link points at, such as a pull request or
 * an issue, which a Markdown view draws as a chip in place of the link: the
 * host's mark, the state's icon, and the reference and title, cut to
 * 27.5rem. Resting the pointer on the chip, or focusing it from the keyboard,
 * shows the item's card below it; Escape, or leaving the chip and the card,
 * hides it.
 */
export declare class LinkReference {
  /**
   * The item's short reference, which the chip starts with, such as
   * "example/app#12" or "#31".
   */
  public readonly reference: string;

  /**
   * What the item is, such as "Pull request" or "Issue".
   */
  public readonly kind: string;

  /**
   * The icon of the item's kind in its state, which the chip and the card's
   * badge show; a monochrome one takes the state's color.
   */
  public readonly icon: LinkReferenceImage;

  /**
   * The code host's mark, or null for none; see
   * {@link ILinkReferenceOptions.mark}.
   */
  public readonly mark: LinkReferenceImage | null;

  /**
   * Whether the code host's mark can't be shown yet; see
   * {@link ILinkReferenceOptions.isMarkPending}.
   */
  public readonly isMarkPending: boolean;

  /**
   * Where the item stands, or null while it is read; see
   * {@link ILinkReferenceOptions.state}.
   */
  public readonly state: LinkReferenceState | null;

  /**
   * The item's title, or null; see {@link ILinkReferenceOptions.title}.
   */
  public readonly title: string | null;

  /**
   * The card's line saying where the item is, or null; see
   * {@link ILinkReferenceOptions.location}.
   */
  public readonly location: string | null;

  /**
   * Who made the item, or null; see {@link ILinkReferenceOptions.author}.
   */
  public readonly author: LinkReferenceAuthor | null;

  /**
   * When the item last changed, or null; see
   * {@link ILinkReferenceOptions.time}.
   */
  public readonly time: Date | null;

  /**
   * What a change adds and removes, or null; see
   * {@link ILinkReferenceOptions.diff}.
   */
  public readonly diff: LinkReferenceDiff | null;

  /**
   * How many comments the item has, or null; see
   * {@link ILinkReferenceOptions.comments}.
   */
  public readonly comments: number | null;

  /**
   * How long a run or a job took, in seconds, or null; see
   * {@link ILinkReferenceOptions.duration}.
   */
  public readonly duration: number | null;

  /**
   * What the card's foot offers to do with the item, or null; see
   * {@link ILinkReferenceOptions.action}.
   */
  public readonly action: LinkReferenceAction | null;

  /**
   * What else the card says of the item; see
   * {@link ILinkReferenceOptions.statuses}.
   */
  public readonly statuses: readonly LinkReferenceStatus[];

  /**
   * The card's footnote, or null; see {@link ILinkReferenceOptions.footnote}.
   */
  public readonly footnote: string | null;

  /**
   * The lines under the card's title; see
   * {@link ILinkReferenceOptions.details}.
   */
  public readonly details: readonly LinkReferenceDetail[];

  /**
   * A work item's state, or null; see
   * {@link ILinkReferenceOptions.workItemState}.
   */
  public readonly workItemState: LinkReferenceWorkItemState | null;

  /**
   * The item's own page, or null; see {@link ILinkReferenceOptions.itemHref}.
   */
  public readonly itemHref: string | null;

  /**
   * The page of the item's repository or project, or null; see
   * {@link ILinkReferenceOptions.locationHref}.
   */
  public readonly locationHref: string | null;

  /**
   * The author's profile, or null; see
   * {@link ILinkReferenceOptions.authorHref}.
   */
  public readonly authorHref: string | null;

  /**
   * The page of a change's files, or null; see
   * {@link ILinkReferenceOptions.diffHref}.
   */
  public readonly diffHref: string | null;

  /**
   * The page of the item's comments, or null; see
   * {@link ILinkReferenceOptions.commentsHref}.
   */
  public readonly commentsHref: string | null;

  /**
   * Whether the chip shows the item's card; see
   * {@link ILinkReferenceOptions.hasCard}.
   */
  public readonly hasCard: boolean;

  /**
   * Creates the reference.
   *
   * @param reference The item's short reference, which the chip starts with.
   * @param kind What the item is, such as "Pull request".
   * @param icon The icon of the item's kind in its state.
   * @param options Its mark, state, title, place, author, time, changes, comments, duration, action, statuses,
   * footnote, details, work item state, the addresses of the card's parts and whether it has a card; none, so still
   * being read, when left out.
   * @throws LinkReferenceException synchronously when the duration is
   * negative or not finite, the footnote or an address is empty, or a
   * reference with no card has a part only the card shows.
   * @example
   * ```ts
   * import { LinkReference, LinkReferenceImage } from "@noldova/ui.components.angular";
   *
   * export const reading: LinkReference = new LinkReference("example/app#12", "Issue", new LinkReferenceImage("data:image/svg+xml,..."));
   * ```
   */
  public constructor(reference: string, kind: string, icon: LinkReferenceImage, options?: ILinkReferenceOptions);
}

/**
 * What a reference card offers to do with its item: the pill's label, the
 * address it activates and the glyph before its label.
 */
export declare class LinkReferenceAction {
  /**
   * The pill's text and the link's name, such as "Open in Pipelines".
   */
  public readonly label: string;

  /**
   * The address the action activates, which the Markdown view's
   * `linkActivate` emits, as it does a link's in the reply.
   */
  public readonly href: string;

  /**
   * The Material Symbols glyph drawn before the label, hidden from assistive
   * technology, such as `open_in_new`.
   */
  public readonly glyph: string;

  /**
   * Creates the action.
   *
   * @param label The pill's text.
   * @param href The address it activates.
   * @param glyph The glyph before the label, `open_in_new` when left out.
   * @throws LinkReferenceException synchronously when the label, the address
   * or the glyph is empty or only white space.
   * @example
   * ```ts
   * import { LinkReferenceAction } from "@noldova/ui.components.angular";
   *
   * export const openRun: LinkReferenceAction = new LinkReferenceAction("Open in Pipelines", "https://code.example/app/runs/4217");
   * ```
   */
  public constructor(label: string, href: string, glyph?: string);
}

/**
 * Who made an item on a code host.
 */
export declare class LinkReferenceAuthor {
  /**
   * The name the card shows.
   */
  public readonly name: string;

  /**
   * The address of the author's picture, or null to show the name's
   * initial.
   */
  public readonly image: string | null;

  /**
   * Creates the author.
   *
   * @param name The name the card shows.
   * @param image The address of the author's picture; null, the name's initial, when
   * left out.
   * @example
   * ```ts
   * import { LinkReferenceAuthor } from "@noldova/ui.components.angular";
   *
   * export const author: LinkReferenceAuthor = new LinkReferenceAuthor("ada");
   * ```
   */
  public constructor(name: string, image?: string | null);
}

/**
 * A state's colors in one mode, as CSS colors.
 */
export declare class LinkReferenceColor {
  /**
   * The color of the state's icon and its badge's label.
   */
  public readonly color: string;

  /**
   * The fill behind the card's badge, such as the color mixed with 14%
   * transparency.
   */
  public readonly background: string;

  /**
   * Creates the colors.
   *
   * @param color The color of the state's icon and its badge's label.
   * @param background The fill behind the card's badge.
   * @throws LinkReferenceException synchronously, in a browser, when either is
   * not a color it accepts, such as an empty text or a misspelled name.
   * @example
   * ```ts
   * import { LinkReferenceColor } from "@noldova/ui.components.angular";
   *
   * export const mergedLight: LinkReferenceColor = new LinkReferenceColor("#8250DF", "color-mix(in srgb, #8250DF 14%, transparent)");
   * ```
   */
  public constructor(color: string, background: string);
}

/**
 * What a change adds and removes, in lines, and how many files it touches.
 */
export declare class LinkReferenceDiff {
  /**
   * The lines the change adds, which the card shows after a plus sign in the
   * added color.
   */
  public readonly added: number;

  /**
   * The lines the change removes, which the card shows after a minus sign in
   * the removed color.
   */
  public readonly removed: number;

  /**
   * The files the change touches, which the card shows as "7 files".
   */
  public readonly files: number;

  /**
   * Creates the change's counts.
   *
   * @param added The lines the change adds.
   * @param removed The lines the change removes.
   * @param files The files the change touches.
   * @example
   * ```ts
   * import { LinkReferenceDiff } from "@noldova/ui.components.angular";
   *
   * export const diff: LinkReferenceDiff = new LinkReferenceDiff(106, 1, 7);
   * ```
   */
  public constructor(added: number, removed: number, files: number);
}

/**
 * An image the app gives by its address, a data: URL included. A
 * monochrome image is drawn as a shape in the color around it, so it
 * follows the mode and forced colors; any other is drawn as it is. A
 * monochrome image's opaque parts make one shape, so a mark inside it,
 * such as the check in a disc, shows only where the image is see-through.
 */
export declare class LinkReferenceImage {
  /**
   * The image's address, a data: URL included.
   */
  public readonly url: string;

  /**
   * Whether it is drawn as a shape in the color around it, rather than as
   * the image it is.
   */
  public readonly isMonochrome: boolean;

  /**
   * Creates the image.
   *
   * @param url The image's address, a data: URL included.
   * @param isMonochrome Whether it is drawn as a shape; true when left out.
   * @example
   * ```ts
   * import { LinkReferenceImage } from "@noldova/ui.components.angular";
   *
   * export const mark: LinkReferenceImage = new LinkReferenceImage("data:image/svg+xml,...");
   * ```
   */
  public constructor(url: string, isMonochrome?: boolean);
}

/**
 * Where an item stands, such as Open or Merged: the label its card's badge
 * shows, and its colors in light and dark, which the app gives, so each
 * code host keeps its own.
 */
export declare class LinkReferenceState {
  /**
   * The state's name, which the card's badge shows, such as "Merged".
   */
  public readonly label: string;

  /**
   * Its colors in the light mode.
   */
  public readonly light: LinkReferenceColor;

  /**
   * Its colors in the dark mode.
   */
  public readonly dark: LinkReferenceColor;

  /**
   * Creates the state.
   *
   * @param label The state's name, which the card's badge shows.
   * @param light Its colors in the light mode.
   * @param dark Its colors in the dark mode.
   * @example
   * ```ts
   * import { LinkReferenceColor, LinkReferenceState } from "@noldova/ui.components.angular";
   *
   * export const merged: LinkReferenceState = new LinkReferenceState("Merged",
   *   new LinkReferenceColor("#8250DF", "color-mix(in srgb, #8250DF 14%, transparent)"),
   *   new LinkReferenceColor("#A371F7", "color-mix(in srgb, #A371F7 18%, transparent)"));
   * ```
   */
  public constructor(label: string, light: LinkReferenceColor, dark: LinkReferenceColor);
}

/**
 * A status a reference card's foot shows in a pill, such as "Build
 * succeeded" or "1 of 2 approved", with an optional icon in its tone.
 */
export declare class LinkReferenceStatus {
  /**
   * The pill's text.
   */
  public readonly text: string;

  /**
   * The icon before the text, or null for none; a monochrome one takes the
   * tone, and a mark inside it, such as a check in a disc, must be
   * see-through to show.
   */
  public readonly icon: LinkReferenceImage | null;

  /**
   * The icon's color in each mode, or null for the pill's muted text color.
   */
  public readonly tone: LinkReferenceTone | null;

  /**
   * Creates the status.
   *
   * @param text The pill's text.
   * @param icon The icon before the text, none when left out.
   * @param tone The icon's color in each mode, the muted text color when left
   * out.
   * @throws LinkReferenceException synchronously when the text is empty or
   * only white space.
   * @example
   * ```ts
   * import { LinkReferenceImage, LinkReferenceStatus, LinkReferenceTone } from "@noldova/ui.components.angular";
   *
   * export const passed: LinkReferenceStatus = new LinkReferenceStatus("Passed", new LinkReferenceImage("data:image/svg+xml,..."), new LinkReferenceTone("#1A7F37", "#3FB950"));
   * ```
   */
  public constructor(text: string, icon?: LinkReferenceImage | null, tone?: LinkReferenceTone | null);
}

/**
 * A color the app gives a part of a reference, one for each mode.
 */
export declare class LinkReferenceTone {
  /**
   * The color in the light mode.
   */
  public readonly light: string;

  /**
   * The color in the dark mode.
   */
  public readonly dark: string;

  /**
   * Creates the tone.
   *
   * @param light The color in the light mode.
   * @param dark The color in the dark mode.
   * @throws LinkReferenceException synchronously, in a browser, when either is
   * not a color it accepts, such as an empty text or a misspelled name.
   * @example
   * ```ts
   * import { LinkReferenceTone } from "@noldova/ui.components.angular";
   *
   * export const active: LinkReferenceTone = new LinkReferenceTone("#007ACC", "#007ACC");
   * ```
   */
  public constructor(light: string, dark: string);
}

/**
 * A reference that a run of plain text holds, such as `owner/repo#12`,
 * which {@link ILinkReferenceSource.findText} gives and the Markdown view
 * makes a link to its address.
 */
export declare class LinkReferenceMatch {
  /**
   * The index of the match's first UTF-16 code unit in the text.
   */
  public readonly start: number;

  /**
   * The match's length, in UTF-16 code units.
   */
  public readonly length: number;

  /**
   * The address of the link the view makes of it, such as
   * `https://github.com/owner/repo/issues/12`.
   */
  public readonly url: string;

  /**
   * Creates the match.
   *
   * @param start The index of its first UTF-16 code unit in the text.
   * @param length Its length, in UTF-16 code units.
   * @param url The address of the link the view makes of it.
   * @example
   * ```ts
   * import { LinkReferenceMatch } from "@noldova/ui.components.angular";
   *
   * export const issue: LinkReferenceMatch = new LinkReferenceMatch(4, 14, "https://code.example/app/issues/12");
   * ```
   */
  public constructor(start: number, length: number, url: string);
}

/**
 * A line under a reference card's title: a muted label and its value.
 */
export declare class LinkReferenceDetail {
  /**
   * The line's label, such as "Author".
   */
  public readonly label: string;

  /**
   * The line's value, which wraps within the card.
   */
  public readonly value: string;

  /**
   * Creates the line.
   *
   * @param label The line's label.
   * @param value The line's value.
   * @throws LinkReferenceException synchronously when the label or the value
   * is empty or only white space.
   * @example
   * ```ts
   * import { LinkReferenceDetail } from "@noldova/ui.components.angular";
   *
   * export const branches: LinkReferenceDetail = new LinkReferenceDetail("On", "notes-sync, nas/notes-sync");
   * ```
   */
  public constructor(label: string, value: string);
}

/**
 * A work item's state, such as "Active": a round dot in its tone before its
 * label, in the muted text, after the chip and first in the card's foot.
 */
export declare class LinkReferenceWorkItemState {
  /**
   * The state's name.
   */
  public readonly label: string;

  /**
   * The dot's color in each mode; under forced colors it is the text color.
   */
  public readonly tone: LinkReferenceTone;

  /**
   * Creates the state.
   *
   * @param label The state's name.
   * @param tone The dot's color in each mode.
   * @throws LinkReferenceException synchronously when the label is empty or
   * only white space.
   * @example
   * ```ts
   * import { LinkReferenceTone, LinkReferenceWorkItemState } from "@noldova/ui.components.angular";
   *
   * export const active: LinkReferenceWorkItemState = new LinkReferenceWorkItemState("Active", new LinkReferenceTone("#007ACC", "#007ACC"));
   * ```
   */
  public constructor(label: string, tone: LinkReferenceTone);
}

/**
 * The link schemes of an app's own that a Markdown view makes links of, on
 * top of the http, https and mailto addresses it always does, such as an app
 * scheme that opens another chat. A link whose address has one of them, as
 * `[the chat](example:chat/12)` or `<example:chat/12>`, draws as a link and
 * goes to the view's `linkActivate` output, as written, like any other link;
 * the view never follows it. Text that only reads as such an address, such
 * as `example:chat/12` alone, stays text, as does any address in code, and a
 * link with any other scheme the app doesn't name shows as written.
 */
export declare class MarkdownLinkSchemes {
  /**
   * No schemes of the app's own: the view makes links of only the addresses
   * it always does. A view takes it when it isn't given any.
   */
  public static readonly none: MarkdownLinkSchemes;

  /**
   * The schemes' names, in lower case, in the order given.
   */
  public readonly names: readonly string[];

  /**
   * Creates the schemes.
   *
   * @param names The schemes' names, each without its colon, as `example`,
   * matched without regard to case.
   * @throws MarkdownException synchronously when a name is not a scheme's
   * name, a letter and then letters, digits, `+`, `-` and `.`; when it is
   * one the view handles itself, `http`, `https`, `mailto` or the mention
   * field's `mention`; or when it is one the view never makes links of,
   * since it can carry a file, content or script: `file`, `javascript`,
   * `data` or `vbscript`.
   * @example
   * ```ts
   * import { MarkdownLinkSchemes } from "@noldova/ui.components.angular";
   *
   * export const chatLinks: MarkdownLinkSchemes = new MarkdownLinkSchemes(["example"]);
   * ```
   */
  public constructor(names: readonly string[]);

  /**
   * Whether an address has one of the schemes, compared without regard to
   * case.
   *
   * @param url The address, as a link writes it.
   * @returns True when the address parses as a URL whose scheme is one of
   * the names.
   * @example
   * ```ts
   * import { MarkdownLinkSchemes } from "@noldova/ui.components.angular";
   *
   * export const isChat: boolean = new MarkdownLinkSchemes(["example"]).has("Example:chat/12");
   * ```
   */
  public has(url: string): boolean;
}

/**
 * Whom a {@link MentionFieldDirective} offers to mention: an id and the
 * name the mention writes after its `@`, with how its avatar looks, the
 * section the list shows it under and whether it is available now.
 */
export declare class MentionCandidate {
  /**
   * The id the app knows it by.
   */
  public readonly id: string;

  /**
   * The name a mention writes after its `@`: words of letters, marks,
   * digits, `_` and `-`, with one space between words, such as "Chat Bot".
   * The field matches it in any letter case and Unicode form, and with a
   * run of spaces between its words in the text, such as "@Chat  Bot".
   */
  public readonly name: string;

  /**
   * The address of the image its avatar shows, or null to show initials.
   */
  public readonly image: string | null;

  /**
   * The initials its avatar shows without an image, or null for the first
   * letter of the name.
   */
  public readonly initials: string | null;

  /**
   * Which of the theme's eight author colors, from 1 to 8, its avatar is
   * tinted and bordered with, or null for the color its id picks.
   */
  public readonly color: number | null;

  /**
   * The color of its avatar in the filled look, or null for the tinted,
   * bordered look.
   */
  public readonly avatarColor: AvatarColor | null;

  /**
   * The heading the list shows above it where a run of candidates of one
   * section starts, or null for none.
   */
  public readonly section: string | null;

  /**
   * The note the list shows after its name, muted and on the same line, and
   * reads after the name, or null for none. A choice inserts only the name.
   */
  public readonly note: string | null;

  /**
   * Whether it is unavailable now; the list shows it faded and says so, and
   * it can still be mentioned.
   */
  public readonly unavailable: boolean;

  /**
   * Creates the candidate.
   *
   * @param id The id the app knows it by. Not blank.
   * @param name The name a mention writes after its `@`.
   * @param options Its avatar's image, initials and color, its section, its
   * note and whether it is unavailable; none and available when left out.
   * @throws ArgumentException synchronously when the id is blank, the note
   * is given and blank, or the
   * name is not words of letters, marks, digits, `_` and `-` with one space
   * between words.
   * @throws ArgumentOutOfRangeException synchronously when the color is
   * given and is not a whole number from 1 to 8.
   * @example
   * ```ts
   * import { MentionCandidate } from "@noldova/ui.components.angular";
   *
   * export const reviewer: MentionCandidate = new MentionCandidate("agent-1", "Reviewer", { section: "Agents" });
   * ```
   */
  public constructor(id: string, name: string, options?: IMentionCandidateOptions);
}

/**
 * A chip of a {@link MentionValue}: a chosen candidate's id and the text its
 * chip shows, `@` and a name, where it lies in the value's text.
 */
export declare class MentionChip {
  /**
   * The id of the candidate chosen, as {@link MentionCandidate.id} gave it.
   */
  public readonly id: string;

  /**
   * The text the chip shows, such as "@Chat Bot", or "@Chat" after
   * Backspace took its last word.
   */
  public readonly text: string;

  /**
   * Where the chip starts in the value's text, in UTF-16 code units.
   */
  public readonly start: number;

  /**
   * Where the chip ends in the value's text, after its last character.
   */
  public readonly end: number;

  /**
   * Creates the chip.
   *
   * @param id The candidate's id. Not blank.
   * @param text The text the chip shows: `@` and words of letters, marks,
   * digits, `_` and `-`, with one space between words.
   * @param start Where it starts in the value's text, a whole number from 0.
   * @throws ArgumentException synchronously when the id is blank or the text
   * is not `@` and such words.
   * @throws ArgumentOutOfRangeException synchronously when the start is not
   * a whole number from 0.
   * @example
   * ```ts
   * import { MentionChip, MentionValue } from "@noldova/ui.components.angular";
   *
   * export const draft: string = MentionValue.of("Ask @Ada", [new MentionChip("p-1", "@Ada", 4)]).value;
   * ```
   */
  public constructor(id: string, text: string, start: number);
}

/**
 * Completes `@mentions` in its host, a `textarea` given its candidates as
 * `nolMentionField`, which the app styles as it styles its other fields.
 * While the caret is in a word that starts with `@` after a blank, an
 * opening parenthesis or the start of the text, and is not in code, the
 * field is a combobox with a listbox above it, as wide as the field, of the
 * candidates whose names start with that word, or those words for a name
 * of several, in the order given, each with its small
 * {@link AvatarComponent}, decorative beside its name; each change of that
 * word or of how many it offers announces the number. Down and Up move the
 * active option, wrapping at both ends, and it stays on its candidate while
 * the candidates change; Enter, Tab or a press on an option writes `@` and
 * its name, then a space, over the whole word as an edit the field can
 * undo, puts the caret after it and dispatches an `input` event; Escape
 * closes the list. While the list is open, those keys go no further:
 * neither the field's other listeners nor the content around it get them.
 * The list closes when no name starts with the word, the caret leaves it,
 * the field loses focus, or the content around it moves it.
 *
 * A chosen candidate becomes a chip tied to its id: `@` and its name in the
 * `mention` color, stroked to read as a message's mention without widening
 * its glyphs, which the list never offers again. The
 * caret and a selection never stop inside a chip: the arrow keys go past
 * it, a click lands at its nearer end, and a selection takes it whole.
 * Backspace right after a chip takes its last word ("@Chat Bot" becomes
 * "@Chat"), and Delete right before a chip its first word after the `@`
 * ("@Chat Bot" becomes "@Bot", the caret still before it), the rest tied to
 * the same id; either takes a chip of one word whole. An edit
 * inside a chip in any other way, such as pasting over part of it, leaves
 * its text plain. Undo and redo bring back the chips the text had. A
 * read-only field changes nothing: its list doesn't open, a list open when
 * it turns read-only closes on the next key, click or pick, and Backspace,
 * Delete, Enter and Tab do only what the field itself does. A typed or pasted `@name` that was never chosen stays plain text, even when
 * it matches a candidate. Inline code, between backticks as Markdown reads
 * it, shows on the inline code tint with its backticks hidden; the rest of
 * the text stays plain.
 *
 * The field's own glyphs are transparent, over a copy of its text the
 * directive draws just before the field, at the field's place, size, font,
 * text color and scroll position, so each character of the copy lies under
 * the field's own and the field keeps its caret, selection, undo, spellcheck
 * and input methods. The field paints its selected text itself, in
 * `HighlightText` on a `Highlight` band, as a selection in plain text is
 * painted. The copy is anchored to the field with CSS anchor
 * positioning, so a move of anything around the field, or a scroll of a box
 * it is in, takes the copy along. The field's parent must be positioned, for
 * example `position: relative`: it holds the copy, so every box that clips
 * or scrolls the field clips the copy as it clips the field, wherever the
 * field moves; in development, the console says so once for a parent that
 * isn't positioned. The field's own `anchor-name` holds the anchor's name while
 * the directive is on it. The field's background is transparent, so the app
 * draws its fill on the box around it.
 */
export declare class MentionFieldDirective {
  /**
   * The candidates it offers, `nolMentionField`, in the order the list
   * shows them.
   */
  public readonly candidates: InputSignal<readonly MentionCandidate[]>;

  /**
   * The list's accessible name, `nolMentionFieldLabel`; "Mentions" when not
   * bound.
   */
  public readonly label: InputSignal<string>;

  /**
   * Reports each candidate chosen, `nolMentioned`, after its mention is
   * written into the field.
   */
  public readonly mentioned: OutputEmitterRef<MentionCandidate>;

  /**
   * The field's value with its chips, `nolMentionValue`, for two-way binding:
   * its text with each chip written as `[@Name](mention:<id>)`, the id
   * percent-encoded, as {@link MentionValue} reads and writes it. It changes
   * with each edit, and setting it shows its text with its chips again, as
   * for a draft. Empty until the first edit when not bound, which leaves the
   * field's text as the app sets it.
   */
  public readonly value: ModelSignal<string>;

  /**
   * Creates the directive, which Angular does for each `textarea` that uses
   * `nolMentionField`.
   *
   * @example
   * ```ts
   * import { Component, type WritableSignal, signal } from "@angular/core";
   * import { MentionCandidate, MentionFieldDirective } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-note-reply",
   *   imports: [MentionFieldDirective],
   *   // The field's parent is positioned, so a box that scrolls the field clips the copy of its text too.
   *   host: { style: "display: block; position: relative" },
   *   template: "<textarea aria-label=\"Reply\" [nolMentionField]=\"people\" nolMentionFieldLabel=\"People\" [(nolMentionValue)]=\"reply\" (nolMentioned)=\"notified.set($event.id)\"></textarea>"
   * })
   * export class NoteReplyComponent {
   *   protected readonly people: readonly MentionCandidate[] = [new MentionCandidate("p-1", "Ada Lovelace"), new MentionCandidate("p-2", "Grace", { unavailable: true })];
   *   protected readonly reply: WritableSignal<string> = signal("Thanks, [@Ada Lovelace](mention:p-1)");
   *   protected readonly notified: WritableSignal<string | null> = signal(null);
   * }
   * ```
   */
  public constructor();
}

/**
 * A {@link MentionFieldDirective}'s value read as its text and its chips.
 * The value is the text with each chip written as a Markdown link,
 * `[@Name](mention:<id>)`, with the id percent-encoded, `!'()*` included, so
 * `nol-markdown-view` shows it with its chips. A backslash before such a
 * link writes it as text, and backslashes right before a chip are doubled,
 * as Markdown reads them.
 */
export declare class MentionValue {
  /**
   * The text the field shows, each chip as its text, such as "@Ada".
   */
  public readonly text: string;

  /**
   * The chips, in the order of the text, each with its id decoded.
   */
  public readonly chips: readonly MentionChip[];

  /**
   * The value, the text with its chips written as links.
   */
  public readonly value: string;

  /**
   * Only {@link MentionValue.parse} and {@link MentionValue.of} create
   * values.
   *
   * @example
   * ```ts
   * import { MentionValue } from "@noldova/ui.components.angular";
   *
   * export const empty: MentionValue = MentionValue.parse("");
   *
   * // @ts-expect-error
   * export const madeUp: MentionValue = new MentionValue();
   * ```
   */
  private constructor();

  /**
   * Reads a value. A link whose text is not `@` and a name, or whose id is
   * blank or not percent-encoded, stays text.
   *
   * @param value The value, as the field's `nolMentionValue` gives it.
   * @returns Its text and chips.
   * @example
   * ```ts
   * import { MentionValue } from "@noldova/ui.components.angular";
   *
   * export function mentionedIds(value: string): readonly string[] {
   *   return MentionValue.parse(value).chips.map(t => t.id);
   * }
   * ```
   */
  public static parse(value: string): MentionValue;

  /**
   * Writes the value of a text and its chips.
   *
   * @param text The text, each chip as its text.
   * @param chips The chips, in the order of the text.
   * @returns The text, its chips and its value.
   * @throws ArgumentException synchronously when a chip's text is not the
   * text at its place, or a chip starts before the one ahead of it ends.
   * @example
   * ```ts
   * import { MentionChip, MentionValue } from "@noldova/ui.components.angular";
   *
   * export const greeting: string = MentionValue.of("Hi @Grace", [new MentionChip("p-2", "@Grace", 3)]).value;
   * ```
   */
  public static of(text: string, chips: readonly MentionChip[]): MentionValue;
}

/**
 * A horizontal menu bar, `nol-menu-bar`, holding {@link MenuBarItemComponent}
 * buttons. The arrow keys move between its items, and while one of its menus
 * is open, pointing at another item opens that item's menu instead.
 */
export declare class MenuBarComponent {
  /**
   * The bar's accessible name, or null, the default, for none.
   *
   * @example
   * ```ts
   * import { Component } from "@angular/core";
   * import { MenuBarComponent, MenuBarItemComponent, MenuComponent, MenuItemComponent, MenuTriggerDirective } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-editor-menus",
   *   imports: [MenuBarComponent, MenuBarItemComponent, MenuComponent, MenuItemComponent, MenuTriggerDirective],
   *   template: `
   *     <nol-menu-bar [label]="label">
   *       <button type="button" nol-menu-bar-item label="View" [nolMenuTriggerFor]="view"></button>
   *     </nol-menu-bar>
   *     <ng-template #view>
   *       <nol-menu>
   *         <button nol-menu-item label="Zoom in" shortcut="Ctrl+="></button>
   *       </nol-menu>
   *     </ng-template>`
   * })
   * export class EditorMenusComponent {
   *   protected readonly label: string = "Editor menu";
   * }
   * ```
   */
  public readonly label: InputSignal<string | null>;
}

/**
 * A top-level button of a {@link MenuBarComponent}, `button[nol-menu-bar-item]`,
 * which shows its label and opens its menu through
 * {@link MenuTriggerDirective}. Its CDK menu item's `disabled` input and
 * `triggered` output keep those names on it. Focusing it, such as from a key
 * that moves focus into the bar, makes it the bar's active item, so the
 * arrow keys continue from it.
 */
export declare class MenuBarItemComponent {
  /**
   * The item's text, which type-ahead in the bar also matches.
   */
  public readonly label: InputSignal<string>;

  /**
   * Creates the item, which Angular does for each `button[nol-menu-bar-item]`
   * element.
   *
   * @example
   * ```ts
   * import { Component, type OutputEmitterRef, output } from "@angular/core";
   * import { MenuBarComponent, MenuBarItemComponent, MenuComponent, MenuItemComponent, MenuTriggerDirective } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-app-menus",
   *   imports: [MenuBarComponent, MenuBarItemComponent, MenuComponent, MenuItemComponent, MenuTriggerDirective],
   *   template: `
   *     <nol-menu-bar label="Application menu">
   *       <button type="button" nol-menu-bar-item label="File" [nolMenuTriggerFor]="file"></button>
   *       <button type="button" nol-menu-bar-item label="Edit" [nolMenuTriggerFor]="edit"></button>
   *     </nol-menu-bar>
   *     <ng-template #file>
   *       <nol-menu>
   *         <button nol-menu-item label="New note" shortcut="Ctrl+N" (triggered)="created.emit()"></button>
   *       </nol-menu>
   *     </ng-template>
   *     <ng-template #edit>
   *       <nol-menu>
   *         <button nol-menu-item label="Undo" shortcut="Ctrl+Z" [disabled]="true"></button>
   *       </nol-menu>
   *     </ng-template>`
   * })
   * export class AppMenusComponent {
   *   public readonly created: OutputEmitterRef<void> = output<void>();
   * }
   * ```
   */
  public constructor();
}

/**
 * A menu panel, `nol-menu`: the root element of a template that
 * {@link MenuTriggerDirective} or {@link ContextMenuTriggerDirective} opens.
 * It gives its {@link MenuItemComponent} rows the menu role, arrow-key and
 * type-ahead navigation, and keeps a submenu open while the pointer moves
 * toward it. Until the pointer first moves, a pointer resting over the menu
 * highlights no row, so a menu that opens under a still pointer starts
 * unhighlighted; the first move highlights the row under the pointer. A menu
 * taller than the room beside its trigger scrolls. An Escape already marked
 * handled, as a tooltip marks the one that hides it, closes nothing.
 */
export declare class MenuComponent {
  /**
   * The width in rem below which the menu never narrows, such as 18 for a
   * settings menu, kept within the overlay bounds' width less 1rem; or null,
   * the default, for a menu sized to its rows.
   */
  public readonly minWidth: InputSignal<number | null>;

  /**
   * Creates the menu, which Angular does for each `nol-menu` element.
   *
   * @example
   * ```ts
   * import { Component } from "@angular/core";
   * import { MenuComponent, MenuItemComponent, MenuTriggerDirective } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-new-button",
   *   imports: [MenuComponent, MenuItemComponent, MenuTriggerDirective],
   *   template: `
   *     <button type="button" [nolMenuTriggerFor]="kinds">New</button>
   *     <ng-template #kinds>
   *       <nol-menu>
   *         <button nol-menu-item label="Note" icon="description" (triggered)="create('note')"></button>
   *         <button nol-menu-item label="Folder" icon="folder" (triggered)="create('folder')"></button>
   *       </nol-menu>
   *     </ng-template>`
   * })
   * export class NewButtonComponent {
   *   public lastKind: string | null = null;
   *
   *   protected create(kind: string): void {
   *     this.lastKind = kind;
   *   }
   * }
   * ```
   */
  public constructor();
}

/**
 * A labeled group of a {@link MenuComponent}'s rows, `nol-menu-group`: a
 * group named by its label, which shows above its rows in the menu's
 * section-label style, muted. The label takes no focus, the arrow keys
 * move across the groups' rows as across any of the menu's rows, and a
 * radio row keeps its own checked state. A {@link MenuGroupActionDirective}
 * inside the group shows at the end of its label. A group given `maxRows`
 * scrolls its rows past that many, under its label, while the menu's other
 * rows stay in view.
 *
 * @example
 * ```ts
 * import { Component, type WritableSignal, signal } from "@angular/core";
 * import { MenuComponent, MenuGroupComponent, MenuItemComponent, MenuTriggerDirective } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-view-options",
 *   imports: [MenuComponent, MenuGroupComponent, MenuItemComponent, MenuTriggerDirective],
 *   template: `
 *     <button type="button" aria-label="View options" [nolMenuTriggerFor]="options">tune</button>
 *     <ng-template #options>
 *       <nol-menu>
 *         <nol-menu-group label="Sort by">
 *           <button nol-menu-item label="Name" [checked]="sort() === 'name'" (triggered)="sort.set('name')"></button>
 *           <button nol-menu-item label="Date" [checked]="sort() === 'date'" (triggered)="sort.set('date')"></button>
 *         </nol-menu-group>
 *         <nol-menu-group label="Show">
 *           <button nol-menu-item label="Hidden files" [checkbox]="true" [checked]="hidden()" (triggered)="hidden.set(!hidden())"></button>
 *         </nol-menu-group>
 *       </nol-menu>
 *     </ng-template>`
 * })
 * export class ViewOptionsComponent {
 *   protected readonly sort: WritableSignal<string> = signal("name");
 *   protected readonly hidden: WritableSignal<boolean> = signal(false);
 * }
 * ```
 */
export declare class MenuGroupComponent {
  /**
   * Creates the group, which Angular does for each `nol-menu-group` element;
   * after each render it fits the group's rows to `maxRows`.
   *
   * @example
   * ```ts
   * import { Component } from "@angular/core";
   * import { MenuComponent, MenuGroupComponent, MenuItemComponent } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-sort-menu",
   *   imports: [MenuComponent, MenuGroupComponent, MenuItemComponent],
   *   template: "<nol-menu><nol-menu-group label=\"Sort by\"><button nol-menu-item label=\"Name\"></button></nol-menu-group></nol-menu>"
   * })
   * export class SortMenuComponent {}
   * ```
   */
  public constructor();

  /**
   * The label shown above the group's rows, which names the group.
   */
  public readonly label: InputSignal<string>;

  /**
   * How many of the group's rows show before the rest scroll, a whole
   * number of 1 or more, or null, the default, to show every row. Past that
   * many rows, the group's rows scroll inside it at the height of the first
   * `maxRows` of them, which follows their height, a description line
   * included. The label stays above the rows, and a row the keyboard
   * focuses, with the arrow keys, Home or End, scrolls just into view.
   *
   * @example
   * ```ts
   * import { Component } from "@angular/core";
   * import { MenuComponent, MenuGroupComponent, MenuItemComponent } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-responder-menu",
   *   imports: [MenuComponent, MenuGroupComponent, MenuItemComponent],
   *   template: `
   *     <nol-menu>
   *       <nol-menu-group label="Responder" [maxRows]="8">
   *         @for (name of names; track name) {
   *           <button nol-menu-item [label]="name"></button>
   *         }
   *       </nol-menu-group>
   *       <button nol-menu-item label="Model" value="Default"></button>
   *     </nol-menu>`
   * })
   * export class ResponderMenuComponent {
   *   protected readonly names: readonly string[] = ["Astra", "Bram", "Cleo", "Dara", "Eli", "Faye", "Gus", "Hana", "Ivo", "Default"];
   * }
   * ```
   */
  public readonly maxRows: InputSignal<number | null>;

  /**
   * Whether the label shows in the uppercase heading look, as an uppercase
   * section header's: the small text size, the emphasis weight and the caps
   * letter spacing, in capitals, on the label's own line and in its muted
   * color; the group's accessible name stays the label as written. False
   * when not bound.
   */
  public readonly uppercase: InputSignal<boolean>;
}

/**
 * An action at the end of a {@link MenuGroupComponent}'s label,
 * `button[nol-icon-button][nolMenuGroupAction]`, such as Refresh models: an
 * icon button on the label's line, its pad's end on the rows' trailing edge,
 * which never closes the menu. It is one of the menu's `menuitem`s, named by
 * the icon button's label, which the arrow keys reach before the group's
 * rows and type-ahead finds by that label. Like a {@link MenuItemComponent},
 * it keeps the `disabled` input and `triggered` output of its CDK menu item,
 * {@link KeptOpenMenuItemDirective}, under those names. While `disabled` it
 * is aria-disabled: it looks disabled and
 * doesn't run, but keeps focus, and the arrow keys still reach it, as a
 * disabled row; so the menu stays open when it disables itself, such as
 * during the refresh it started.
 * `triggered` emits on a click, Enter or Space, leaving the menu open.
 */
export declare class MenuGroupActionDirective {
  /**
   * Creates the action, which Angular does for each
   * `button[nol-icon-button][nolMenuGroupAction]` element; type-ahead finds it
   * by the icon button's label.
   *
   * @example
   * ```ts
   * import { Component } from "@angular/core";
   * import { IconButtonComponent, MenuComponent, MenuGroupActionDirective, MenuGroupComponent, MenuItemComponent } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-model-menu",
   *   imports: [IconButtonComponent, MenuComponent, MenuGroupActionDirective, MenuGroupComponent, MenuItemComponent],
   *   template: `
   *     <nol-menu [minWidth]="18">
   *       <nol-menu-group label="Model">
   *         <button type="button" nol-icon-button nolMenuGroupAction icon="refresh" label="Refresh models" (triggered)="refreshes = refreshes + 1"></button>
   *         <button nol-menu-item label="Default model"></button>
   *       </nol-menu-group>
   *     </nol-menu>`
   * })
   * export class ModelMenuComponent {
   *   public refreshes: number = 0;
   * }
   * ```
   */
  public constructor();
}

/**
 * A menu row, `button[nol-menu-item]`, inside a {@link MenuComponent}: a label
 * with an optional icon, tag, description, value, shortcut and check mark. An
 * element marked `nolMenuItemLead`, such as a small {@link AvatarComponent},
 * takes the icon's place, at its start edge; give a row one or the other.
 * Rows with a lead, an icon or neither keep their labels aligned, and a row
 * with a lead keeps at least the `space-1` token above and below it, growing
 * to fit, so neighboring rows' avatars never touch. A label or
 * a description too long for the menu ends with an ellipsis and shows its
 * full text in a tooltip under the pointer; while the keys rest on the row,
 * one tooltip beside the menu, level with the row, shows the label and
 * description while either is cut, and hides while a submenu of the row's
 * menu is open. The first Escape hides it and leaves the menu open. A focus
 * from code counts as the keys' while the last input was a key, as when a
 * menu the keys opened focuses its first row.
 * Its CDK menu item's `disabled` input and `triggered` output keep those
 * names on it: choosing the row emits `triggered` and closes the whole menu.
 * A row that also uses
 * {@link MenuTriggerDirective} opens a submenu and shows a chevron instead,
 * and never emits `triggered`. Its role is `menuitem`, or `menuitemcheckbox`
 * or `menuitemradio` while `checked` is not null.
 */
export declare class MenuItemComponent {
  /**
   * The row's text, which type-ahead in the menu also matches.
   */
  public readonly label: InputSignal<string>;

  /**
   * The Material Symbols glyph before the label, or null, the default, for
   * none.
   */
  public readonly icon: InputSignal<string | null>;

  /**
   * Whether the row is checked, which shows a check mark, or null, the
   * default, for a row that cannot be checked.
   */
  public readonly checked: InputSignal<boolean | null>;

  /**
   * Whether a checkable row is a checkbox, which turns on and off by itself,
   * rather than a radio, one choice of a group; false, a radio, when not
   * bound. It matters only while `checked` is not null.
   */
  public readonly checkbox: InputSignal<boolean>;

  /**
   * The key shown at the row's end, such as `Ctrl+N`, or null, the default,
   * for none. It is only shown; the row's owner handles the key.
   */
  public readonly shortcut: InputSignal<string | null>;

  /**
   * A second line under the label, at the label's start, in the muted text,
   * such as the model and settings a person or a preset stands for, or null,
   * the default, for none. The row grows to fit it; rows without one keep
   * their height. Screen readers read it with the label.
   */
  public readonly description: InputSignal<string | null>;

  /**
   * The value chosen for the row, shown at its end before its shortcut, check
   * mark or chevron, in the muted text, such as the model chosen in a
   * submenu, or null, the default, for none. The label gives way to it,
   * ending with an ellipsis first. Screen readers read it with the label.
   */
  public readonly value: InputSignal<string | null>;

  /**
   * A short word shown in a small, muted, outlined chip right after the
   * label, on the label's line, such as `Recommended` on a provider's default
   * effort level, or null, the default, for none. A long label ends with an
   * ellipsis first, and the tag only once the label is gone; the tag never
   * wraps and stays clear of the row's end. Screen readers read it right
   * after the label; type-ahead matches the label alone.
   */
  public readonly tag: InputSignal<string | null>;

  /**
   * Whether the row's action destroys something, such as Remove… or
   * Delete: its label and icon take the theme's `error` color, over the
   * same hover, focus and selected fills as any row, while its description,
   * value and shortcut stay muted; under forced colors it is the plain row's
   * `CanvasText`, and `HighlightText` while selected. False when not bound.
   */
  public readonly danger: InputSignal<boolean>;

  /**
   * Whether a row that opens a submenu shows its chevron at its end, true,
   * the default; false leaves it out, so the row's value or shortcut ends at
   * the row's end padding, as a Zoom row showing the page's zoom does. The
   * row still opens its submenu with the pointer, Enter and the arrow key
   * toward its side, and screen readers still hear that it opens a menu. A
   * row without a submenu has no chevron either way.
   */
  public readonly isShowingChevron: InputSignal<boolean>;

  /**
   * Creates the row, which Angular does for each `button[nol-menu-item]`
   * element.
   *
   * @example
   * ```ts
   * import { Component, type WritableSignal, signal } from "@angular/core";
   * import { MenuComponent, MenuItemComponent, MenuSeparatorComponent, MenuTriggerDirective } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-view-menu",
   *   imports: [MenuComponent, MenuItemComponent, MenuSeparatorComponent, MenuTriggerDirective],
   *   template: `
   *     <button type="button" [nolMenuTriggerFor]="view">View</button>
   *     <ng-template #view>
   *       <nol-menu>
   *         <button nol-menu-item label="Word wrap" shortcut="Alt+Z" [checked]="isWrapped()" [checkbox]="true" (triggered)="isWrapped.set(!isWrapped())"></button>
   *         <nol-menu-separator />
   *         <button nol-menu-item label="Compact" [checked]="density() === 'compact'" (triggered)="density.set('compact')"></button>
   *         <button nol-menu-item label="Comfortable" [checked]="density() === 'comfortable'" (triggered)="density.set('comfortable')"></button>
   *       </nol-menu>
   *     </ng-template>`
   * })
   * export class ViewMenuComponent {
   *   protected readonly isWrapped: WritableSignal<boolean> = signal(false);
   *   protected readonly density: WritableSignal<string> = signal("compact");
   * }
   * ```
   */
  public constructor();
}

/**
 * Marks the item a {@link MenuComponent} opens on, `[nolMenuOpensOn]`, on a
 * {@link MenuItemComponent}, a {@link MenuGroupActionDirective} or another
 * item of the menu's own, not of a submenu. A menu opened from its trigger,
 * by the pointer, Enter, Space, Down, Up, a submenu's Right or
 * {@link MenuTriggerDirective.openFocusing}, takes the focus and the active
 * item on the first enabled item marked, in the order the template writes
 * them, over its checked row and, when Up opened it, its last, scrolled into
 * view in a group that scrolls, and the arrow keys, Home, End and type-ahead
 * go on from it. With no item marked, or the marked one disabled or gone, it
 * opens on its checked row, else its first row, or its last when Up opened
 * it, as without the directive. It is read each time the menu opens.
 *
 * @example
 * ```ts
 * import { Component, input } from "@angular/core";
 * import { IconButtonComponent, MenuComponent, MenuGroupActionDirective, MenuGroupComponent, MenuItemComponent, MenuOpensOnDirective, MenuTriggerDirective } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-model-picker",
 *   imports: [IconButtonComponent, MenuComponent, MenuGroupActionDirective, MenuGroupComponent, MenuItemComponent, MenuOpensOnDirective, MenuTriggerDirective],
 *   template: `
 *     <button type="button" [nolMenuTriggerFor]="models">Model</button>
 *     <ng-template #models>
 *       <nol-menu>
 *         <nol-menu-group label="Model">
 *           <button type="button" nol-icon-button nolMenuGroupAction icon="refresh" label="Refresh models" [nolMenuOpensOn]="isModelMissing()"></button>
 *           <button nol-menu-item label="Default model" [checked]="true"></button>
 *         </nol-menu-group>
 *       </nol-menu>
 *     </ng-template>`
 * })
 * export class ModelPickerComponent {
 *   public readonly isModelMissing = input<boolean>(false);
 * }
 * ```
 */
export declare class MenuOpensOnDirective {
  /**
   * Whether the menu opens on this item, its `nolMenuOpensOn` input, bound,
   * as in `[nolMenuOpensOn]="true"`; while false the item is not marked.
   */
  public readonly opensOn: InputSignal<boolean>;

  /**
   * The menu item the directive marks, its host's own `CdkMenuItem`, or
   * null when the host isn't a menu item, such as a span inside a row; a
   * mark without an item names nothing, and the menu goes on to the next
   * mark.
   */
  public readonly item: CdkMenuItem | null;
}

/**
 * A line between groups of rows in a {@link MenuComponent},
 * `nol-menu-separator`, with the separator role.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { MenuComponent, MenuItemComponent, MenuSeparatorComponent, MenuTriggerDirective } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-tab-actions",
 *   imports: [MenuComponent, MenuItemComponent, MenuSeparatorComponent, MenuTriggerDirective],
 *   template: `
 *     <button type="button" aria-label="Tab actions" [nolMenuTriggerFor]="actions">more_vert</button>
 *     <ng-template #actions>
 *       <nol-menu>
 *         <button nol-menu-item label="Close"></button>
 *         <button nol-menu-item label="Close others"></button>
 *         <nol-menu-separator />
 *         <button nol-menu-item label="Split right"></button>
 *       </nol-menu>
 *     </ng-template>`
 * })
 * export class TabActionsComponent {
 * }
 * ```
 */
export declare class MenuSeparatorComponent {
}

/**
 * Opens the menu template bound to `nolMenuTriggerFor`, whose root is a
 * {@link MenuComponent}, from its host; the directive's export name is also
 * `nolMenuTriggerFor`. On its own or on a {@link MenuBarItemComponent}, a
 * click or the keyboard opens and closes the menu, which opens below the
 * host, lined up by `nolMenuAlignment`. On a {@link MenuItemComponent} inside
 * a menu, it opens a submenu beside that menu, its first row level with the
 * host's row. The menus close when the host is hidden or scrolled away.
 * Inside a menu or a menu bar it shares their menu stack; anywhere else,
 * even inside a {@link ContextMenuTriggerDirective}'s host, it keeps its own,
 * so closing its menu returns focus to its host only, and closing the
 * context menu leaves it alone. It
 * extends the CDK's menu trigger, from which it inherits `menuTemplateRef`,
 * `menuData`, `isOpen()`, `close()`, `getMenu()`, `opened` and `closed`.
 */
export declare class MenuTriggerDirective extends CdkMenuTrigger {
  /**
   * How a top-level menu lines up with the host it opens below,
   * `nolMenuAlignment`; the start when not bound. A submenu ignores it. It is
   * read when the menu opens.
   */
  public readonly alignment: InputSignal<OverlayAlignment>;

  /**
   * Creates the directive, which Angular does for each element that uses
   * `nolMenuTriggerFor`.
   *
   * @example
   * ```ts
   * import { Component } from "@angular/core";
   * import { MenuComponent, MenuItemComponent, MenuTriggerDirective, OverlayAlignment } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-panel-actions",
   *   imports: [MenuComponent, MenuItemComponent, MenuTriggerDirective],
   *   template: `
   *     <button type="button" aria-label="Panel actions" [nolMenuTriggerFor]="actions" [nolMenuAlignment]="end">more_horiz</button>
   *     <ng-template #actions>
   *       <nol-menu>
   *         <button nol-menu-item label="Move to" [nolMenuTriggerFor]="sides"></button>
   *         <button nol-menu-item label="Close panel" icon="close"></button>
   *       </nol-menu>
   *     </ng-template>
   *     <ng-template #sides>
   *       <nol-menu>
   *         <button nol-menu-item label="Left dock"></button>
   *         <button nol-menu-item label="Right dock"></button>
   *       </nol-menu>
   *     </ng-template>`
   * })
   * export class PanelActionsComponent {
   *   protected readonly end: OverlayAlignment = OverlayAlignment.End;
   * }
   * ```
   */
  public constructor();

  /**
   * Opens the menu, or closes it while it is open. In a submenu it only
   * opens, so choosing the row again keeps the submenu open.
   *
   * @example
   * ```ts
   * import { Component, type Signal, viewChild } from "@angular/core";
   * import { MenuComponent, MenuItemComponent, MenuTriggerDirective } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-sort-control",
   *   imports: [MenuComponent, MenuItemComponent, MenuTriggerDirective],
   *   host: { "(keydown.alt.s)": "toggleMenu()" },
   *   template: `
   *     <button type="button" [nolMenuTriggerFor]="orders">Sort</button>
   *     <ng-template #orders>
   *       <nol-menu>
   *         <button nol-menu-item label="By name"></button>
   *         <button nol-menu-item label="By date"></button>
   *       </nol-menu>
   *     </ng-template>`
   * })
   * export class SortControlComponent {
   *   private readonly trigger: Signal<MenuTriggerDirective> = viewChild.required(MenuTriggerDirective);
   *
   *   protected toggleMenu(): void {
   *     this.trigger().toggle();
   *   }
   * }
   * ```
   */
  public override toggle(): void;

  /**
   * Opens the menu against the host and keeps it there while the host
   * moves. Nothing happens while it is open or no template is bound.
   *
   * @example
   * ```ts
   * import { Component, type Signal, viewChild } from "@angular/core";
   * import { MenuComponent, MenuItemComponent, MenuTriggerDirective } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-move-target",
   *   imports: [MenuComponent, MenuItemComponent, MenuTriggerDirective],
   *   template: `
   *     <button type="button" [nolMenuTriggerFor]="folders" (dragenter)="openFolders()">Move to</button>
   *     <ng-template #folders>
   *       <nol-menu>
   *         <button nol-menu-item label="Inbox"></button>
   *         <button nol-menu-item label="Archive"></button>
   *       </nol-menu>
   *     </ng-template>`
   * })
   * export class MoveTargetComponent {
   *   private readonly trigger: Signal<MenuTriggerDirective> = viewChild.required(MenuTriggerDirective);
   *
   *   protected openFolders(): void {
   *     this.trigger().open();
   *   }
   * }
   * ```
   */
  public override open(): void;

  /**
   * Opens the menu as {@link MenuTriggerDirective.open} does and focuses the
   * row it opens on, even when the menu was already open: the item marked
   * with {@link MenuOpensOnDirective}, else its checked row, else its first.
   *
   * @param origin The focus origin given to that row, such as
   * `"keyboard"` for a key or `"mouse"` for a pointer.
   * @example
   * ```ts
   * import { Component, type Signal, viewChild } from "@angular/core";
   * import { MenuComponent, MenuItemComponent, MenuTriggerDirective } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-format-bar",
   *   imports: [MenuComponent, MenuItemComponent, MenuTriggerDirective],
   *   host: { "(contextmenu)": "openOptions($event)" },
   *   template: `
   *     <button #grip type="button" aria-label="Toolbar options" [nolMenuTriggerFor]="options">drag_indicator</button>
   *     <ng-template #options>
   *       <nol-menu>
   *         <button nol-menu-item label="Hide toolbar"></button>
   *       </nol-menu>
   *     </ng-template>`
   * })
   * export class FormatBarComponent {
   *   private readonly grip: Signal<MenuTriggerDirective> = viewChild.required("grip", { read: MenuTriggerDirective });
   *
   *   protected openOptions(event: MouseEvent): void {
   *     event.preventDefault();
   *     this.grip().openFocusing("mouse");
   *   }
   * }
   * ```
   */
  public openFocusing(origin: FocusOrigin): void;
}

/**
 * A file a {@link MessageComponent} shows as a button with the file's name,
 * type and size, its preview image when it has one, or else the
 * {@link FileBadgeComponent} for its name, and its tooltip when it has one; choosing it emits {@link MessageComponent.attachmentOpen} with the
 * file's id.
 *
 * An attachment given a {@link MessageAttachmentPicture} shows as that picture
 * instead, without a caption: a button named by the file's name, with its
 * tooltip when it has one, as wide as the image but never wider than the
 * message's content nor taller than the `message-picture-height` look token,
 * 24rem by default, at the image's aspect ratio, which keeps its space before
 * the image loads, and at least 24px each way, where a small or thin image
 * shows scaled down and centered. It has a 1px border in the card border color
 * drawn over the image's edge, CanvasText under forced colors, medium
 * corners, the kit's focus ring and a zoom-in cursor, and choosing it emits
 * {@link MessageComponent.attachmentOpen} too.
 */
export declare class MessageAttachment extends MessageBlock {
  /**
   * {@link MessageBlockKind.Attachment}.
   */
  public readonly kind: MessageBlockKind.Attachment;

  /**
   * The id the app knows the file by.
   */
  public readonly id: string;

  /**
   * The file's name.
   */
  public readonly name: string;

  /**
   * The file's size in bytes, shown in the largest unit of 1000 below it,
   * such as 1.5 kB.
   */
  public readonly size: number;

  /**
   * What the file is, in words, such as `PNG image`.
   */
  public readonly type: string;

  /**
   * The address of a preview image, or null for none, which shows a file
   * glyph instead.
   */
  public readonly preview: string | null;

  /**
   * The text of the kit's tooltip on the attachment's button, such as the
   * file's full path, or null for no tooltip; an empty text shows none either.
   */
  public readonly tooltip: string | null;

  /**
   * The image the attachment shows as its picture, or null to show it as a
   * file's button.
   */
  public readonly picture: MessageAttachmentPicture | null;

  /**
   * The file's name, which copying the message takes.
   */
  public get text(): string;

  /**
   * Creates the attachment.
   *
   * @param id The id the app knows the file by.
   * @param name The file's name.
   * @param size The file's size in bytes.
   * @param type What the file is, in words.
   * @param preview The address of a preview image; null when not given.
   * @param tooltip The text of the button's tooltip; null when not given.
   * @param picture The image to show as the attachment's picture; null when
   * not given.
   * @example
   * ```ts
   * import { MessageAttachment, MessageAttachmentPicture } from "@noldova/ui.components.angular";
   *
   * export const report: MessageAttachment = new MessageAttachment("f-12", "report.pdf", 48_200, "PDF document");
   * export const screenshot: MessageAttachment = new MessageAttachment("f-13", "screenshot.png", 182_400, "PNG image", null, null,
   *   new MessageAttachmentPicture("blob:app/4f1c", 1280, 720));
   * ```
   */
  public constructor(id: string, name: string, size: number, type: string, preview?: string | null, tooltip?: string | null,
    picture?: MessageAttachmentPicture | null);
}

/**
 * The image a {@link MessageAttachment} shows as its picture: its address and
 * its own size in pixels, which keep the picture's space before it loads.
 */
export declare class MessageAttachmentPicture {
  /**
   * The image's address, such as a `blob:` or `data:` URL.
   */
  public readonly source: string;

  /**
   * The image's own width in pixels.
   */
  public readonly width: number;

  /**
   * The image's own height in pixels.
   */
  public readonly height: number;

  /**
   * The image's width divided by its height.
   */
  public get ratio(): number;

  /**
   * Creates the picture.
   *
   * @param source The image's address.
   * @param width The image's own width in pixels.
   * @param height The image's own height in pixels.
   * @throws ArgumentException synchronously when the source is empty or blank.
   * @throws ArgumentOutOfRangeException synchronously when the width or the
   * height isn't a whole number from 1.
   * @example
   * ```ts
   * import { MessageAttachmentPicture } from "@noldova/ui.components.angular";
   *
   * export const picture: MessageAttachmentPicture = new MessageAttachmentPicture("blob:app/4f1c", 1280, 720);
   * ```
   */
  public constructor(source: string, width: number, height: number);
}

/**
 * Who wrote a {@link MessageComponent}'s message: an id, the name it shows,
 * what kind of author it is, and how its avatar looks.
 */
export declare class MessageAuthor {
  /**
   * The id the app knows the author by.
   */
  public readonly id: string;

  /**
   * The name shown in the message's header.
   */
  public readonly name: string;

  /**
   * Whether a person, an agent or the app wrote it.
   */
  public readonly kind: MessageAuthorKind;

  /**
   * The address of the avatar image, or null to show initials.
   */
  public readonly avatar: string | null;

  /**
   * The initials the avatar shows without an image, or null for the first
   * letter of the name.
   */
  public readonly initials: string | null;

  /**
   * Which of the theme's eight author colors, `author-1` to `author-8`, the
   * avatar is tinted and bordered with, from 1 to 8, or null for the accent
   * color; its initials stay in the text color.
   */
  public readonly accent: number | null;

  /**
   * The filled avatar's color, as {@link AvatarComponent.filledColor} takes
   * it, or null for the tinted avatar.
   */
  public readonly avatarColor: AvatarColor | null;

  /**
   * Whether the author is unavailable: the avatar takes its unavailable look
   * and the name in the header shows at half opacity.
   */
  public readonly unavailable: boolean;

  /**
   * Creates the author.
   *
   * @param id The id the app knows the author by.
   * @param name The name the header shows.
   * @param kind Whether a person, an agent or the app wrote it.
   * @param avatar The address of the avatar image; null when not given.
   * @param initials The initials the avatar shows; null when not given.
   * @param accent Which author color, from 1 to 8, the avatar is tinted with; null when not given.
   * @param avatarColor The filled avatar's color; null, the tinted avatar, when not given.
   * @param unavailable Whether the author is unavailable; false when not given.
   * @throws ArgumentOutOfRangeException synchronously when the accent is not
   * null and not a whole number from 1 to 8.
   * @example
   * ```ts
   * import { MessageAuthor, MessageAuthorKind } from "@noldova/ui.components.angular";
   *
   * export const reviewer: MessageAuthor = new MessageAuthor("agent-1", "Reviewer", MessageAuthorKind.Agent, null, "RV", 3);
   * ```
   */
  public constructor(id: string, name: string, kind: MessageAuthorKind, avatar?: string | null, initials?: string | null, accent?: number | null,
    avatarColor?: AvatarColor | null, unavailable?: boolean);
}

/**
 * One block of a {@link MessageComponent}'s content: a {@link MessageText},
 * {@link MessageCode}, {@link MessageAttachment} or {@link MessageSlot}.
 */
export declare abstract class MessageBlock {
  /**
   * Which kind of block it is.
   */
  public abstract readonly kind: MessageBlockKind;

  /**
   * The block's text, which copying the message takes: Markdown, fenced
   * code, a file's name, or nothing for a slot.
   */
  public abstract readonly text: string;
}

/**
 * Code a {@link MessageComponent} shows in a {@link CodeBlockComponent}.
 */
export declare class MessageCode extends MessageBlock {
  /**
   * {@link MessageBlockKind.Code}.
   */
  public readonly kind: MessageBlockKind.Code;

  /**
   * The code, with its own line breaks.
   */
  public readonly code: string;

  /**
   * The code's language, such as `ts`, or null for none.
   */
  public readonly language: string | null;

  /**
   * The code as a fenced Markdown block, its fence longer than any run of
   * backticks in the code, which copying the message takes.
   */
  public get text(): string;

  /**
   * Creates the block.
   *
   * @param code The code.
   * @param language The code's language; null when not given.
   * @example
   * ```ts
   * import { MessageCode } from "@noldova/ui.components.angular";
   *
   * export const install: MessageCode = new MessageCode("npm install --save-exact @noldova/ui.components.angular", "bash");
   * ```
   */
  public constructor(code: string, language?: string | null);
}

/**
 * One message of a conversation, `nol-message`, for the rows of a
 * {@link VirtualListComponent} whose kind is {@link VirtualListKind.Feed},
 * where each row is an article. Its header shows the author's avatar, name
 * and how long ago it was written, such as 2 minutes ago, in the app's
 * `LOCALE_ID`, or the time of day, such as 14:05, with
 * {@link MessageTimeFormat.Clock}; the time shows the date and time of day on hover and on focus, and one clock moves every
 * message's time on each 30 seconds while any is shown. A hidden name of the
 * author, date and time has the {@link MessageComponent.labelId}, so the
 * feed's article is named by them. A message that continues the one before
 * it hides its header and avatar. The person's own message can take
 * {@link MessageLayout.Bubble}: its content in a bubble at the end side, at
 * most 70% of the message's width, on the `raised` color with the medium
 * radius, with no avatar or header, and under the bubble its Copy action
 * and then its time, shown as the Copy action is. A conversation whose
 * text lines up with its column takes {@link MessageLayout.Column}, whose
 * header holds the parts the app projects with `nolMessageHeader`, such as
 * a model name or a {@link ChipKind.Status} chip. In every layout the app
 * adds its own actions before Copy with {@link MessageActionDirective}.
 *
 * Its blocks follow in their order. Text is Markdown once the app adds
 * `provideMarkdown()` from `@noldova/ui.components.angular/markdown` to its providers;
 * without it, and until the parser has loaded, each text block shows as it
 * was written, plain, with its Markdown marks. Markdown text is parsed with
 * raw HTML left as text, and drawn as elements, never as HTML: an image is
 * drawn by the app's {@link MessageImageDirective} template, or else shows
 * its alt text, and only http, https and mailto addresses and those with a
 * scheme the app names in {@link MessageComponent.linkSchemes} become links,
 * which a click, a middle click or Enter hands to the app through
 * {@link MessageComponent.linkActivate} and never follow; a link to a
 * file's path, or to a `file:` URL on this machine, is a link only when
 * {@link MessageComponent.fileLinks} is on, and goes to
 * {@link MessageComponent.fileActivate}. Nesting deeper
 * than 24 elements, 8 lists or 8 quotes is drawn at the deepest level, and
 * text past 200,000 characters is shown plain. While the message streams,
 * each of its text blocks that is not interim reveals a little at a time,
 * in bursts about 50 ms apart and every frame once the message ends, as a
 * Markdown view's `streaming` input says, holding back an unfinished
 * end of at most 300 characters, and the parts already shown keep their
 * elements, also when a slot comes before them, such as an activity row. A
 * text block past the text blocks the message is first drawn with reveals
 * from nothing; those it is drawn with show what they have at once. The
 * part not yet shown is cut from the text, in every look, so a block such
 * as a code block, or an inline code's chip, is laid out at the size of
 * what it shows and grows with the reveal, and a screen reader and Copy
 * see the text shown so far. While a selection reaches into a revealing
 * text, all that has arrived shows at once. A list item that starts with
 * a box, `[ ]` or `[x]`, is a task that shows a box, empty or checked,
 * which can't be changed.
 * Code, a code block or fenced in the text, shows in a
 * {@link CodeBlockComponent} up to 32rem high, then scrolls inside;
 * attachments show as buttons; slots show the app's templates marked with
 * {@link MessageSlotDirective}.
 *
 * Its status shows in words beside an icon or a spinner: Writing, Cancelled,
 * or the error's text with a Retry button. A message that streamed announces
 * politely, with its author, that the reply is complete, or that it failed
 * and its error, never its text; one shown already complete, or cancelled,
 * doesn't, and one given a {@link MessageComponent.key} announces each end
 * once however many of its rows see it. Each run of text and code taller
 * than the `message-collapsed-height` look token, 24rem by default, or than
 * {@link MessageComponent.collapsedHeight}, in a message that didn't stream
 * in view, is collapsed with its own Show more button that expands it and
 * then collapses it again; attachments and slots never collapse. While a
 * reply streams, the app marks its feed
 * {@link VirtualListComponent.busy}. Its Copy action, shown on hover and while the message or its
 * article has focus, writes the blocks' text as Markdown through the
 * {@link ClipboardWriter} and says Copied or Couldn't copy for 1.5 seconds.
 * Escape from a control inside it returns the focus to its article, or to the
 * feed when the article is a feed's, unless the control used Escape. A right click, the ContextMenu key or Shift+F10
 * asks the app for its context menu through
 * {@link MessageComponent.contextMenuRequest}, unless the app shows a
 * link's own menu through {@link MessageComponent.linkMenu}. Its text stays selectable.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { MessageAuthor, MessageAuthorKind, type MessageBlock, MessageComponent, MessageText } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-welcome-message",
 *   imports: [MessageComponent],
 *   template: "<nol-message [author]=\"author\" [time]=\"time\" [blocks]=\"blocks\" labelId=\"welcome\" />"
 * })
 * export class WelcomeMessageComponent {
 *   protected readonly author: MessageAuthor = new MessageAuthor("guide", "Guide", MessageAuthorKind.Agent);
 *   protected readonly time: Date = new Date();
 *   protected readonly blocks: readonly MessageBlock[] = [new MessageText("Welcome. Ask me about **your notes**.")];
 * }
 * ```
 */
export declare class MessageComponent {
  /**
   * Creates the message, which Angular does for each `nol-message` element.
   *
   * @example
   * ```ts
   * import { Component, type WritableSignal, signal } from "@angular/core";
   * import { MessageAuthor, MessageAuthorKind, type MessageBlock, MessageComponent, MessageStatus, MessageText } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-reply-message",
   *   imports: [MessageComponent],
   *   template: "<nol-message [author]=\"author\" [time]=\"time\" [blocks]=\"blocks()\" [status]=\"status()\" (retry)=\"status.set(statuses.Streaming)\" />"
   * })
   * export class ReplyMessageComponent {
   *   protected readonly statuses: typeof MessageStatus = MessageStatus;
   *   protected readonly author: MessageAuthor = new MessageAuthor("agent", "Agent", MessageAuthorKind.Agent);
   *   protected readonly time: Date = new Date();
   *   protected readonly blocks: WritableSignal<readonly MessageBlock[]> = signal([new MessageText("Looking")]);
   *   protected readonly status: WritableSignal<MessageStatus> = signal(MessageStatus.Error);
   * }
   * ```
   */
  public constructor();

  /**
   * Who wrote the message.
   */
  public readonly author: InputSignal<MessageAuthor>;

  /**
   * A short description of the author, such as an agent's model, or null,
   * the default, for none. Given one, the author's name and avatar show a
   * {@link TooltipDirective} on hover, the name as its title and this
   * description below it, and the name takes a focus stop that shows it
   * too; the avatar stays out of the tab order. An empty description counts
   * as none.
   */
  public readonly authorDescription: InputSignal<string | null>;

  /**
   * When the message was written.
   */
  public readonly time: InputSignal<Date>;

  /**
   * The message's content, in its order; a list without blocks, or with
   * blank text only, shows "No text" once the message is no longer
   * streaming.
   */
  public readonly blocks: InputSignal<readonly MessageBlock[]>;

  /**
   * Where the message stands; {@link MessageStatus.Complete} when not bound.
   */
  public readonly status: InputSignal<MessageStatus>;

  /**
   * The text shown for a failed message, or null, the default, for "The
   * message couldn't be completed."
   */
  public readonly error: InputSignal<string | null>;

  /**
   * The identity of the message's reply, such as its id and attempt, so its
   * completion or failure is announced once even when its row is drawn
   * again, or null, the default, to announce each end the message sees.
   * A reply tried again takes a new key, or an end it repeats is not
   * announced.
   */
  public readonly key: InputSignal<string | null>;

  /**
   * Whether the message continues one by the same author, which hides its
   * header and avatar; false when not bound.
   */
  public readonly continuation: InputSignal<boolean>;

  /**
   * Whether the message is selected, which
   * {@link MessageComponent.selectionLook} shows, and its name, through
   * {@link MessageComponent.labelId}, ends with "selected"; false when not
   * bound.
   */
  public readonly selected: InputSignal<boolean>;

  /**
   * How the message shows that it is selected: a bar at its start and the
   * selection color, or the raised background with large corners;
   * {@link MessageSelectionLook.Bar} when not bound. It changes nothing
   * while the message isn't selected.
   */
  public readonly selectionLook: InputSignal<MessageSelectionLook>;

  /**
   * Whether a message in the column layout shows its header row: its
   * avatar, its author's name, the parts the app projects with
   * `nolMessageHeader` and, without its footer, its actions; true when not
   * bound. Off, the column message draws no header, so it starts at its
   * content, for an app that shows the author inside the content, such as a
   * plan card's own header; with its footer off too, its actions show at its
   * top end, as the row layout's do, over the content's first line, so
   * the app keeps that corner of its content clear. A person's message in
   * a column has no header either way. The row and bubble layouts always
   * show theirs.
   */
  public readonly header: InputSignal<boolean>;

  /**
   * Whether a message in the column layout shows its footer row: its
   * actions, such as Copy, its time and any {@link MessageFooterEndDirective}
   * content; true when not bound. Off, the column message draws no footer,
   * so it ends at its content, for a list such as a view of a chat's plans,
   * and shows its actions in its header instead, after the app's header
   * content, when they show in the footer, on the header's line without
   * making it taller, or on a row of their own under the header's content,
   * which the header grows by, when that line has no room left for them. A
   * person's message in a column, which has no header,
   * shows no actions with it off. The row and bubble layouts always show it.
   */
  public readonly footer: InputSignal<boolean>;

  /**
   * How far below the message's top edge its top actions stand, as a CSS
   * length, such as `calc(var(--nol-space-2) + 0.25rem)`, or null, the
   * default, for 0.25rem. The top actions are the row layout's and those of a
   * column message with both its header and its footer off, so an app that
   * shows its author inside the content, such as a plan card's own header,
   * can center them on that header's line. Actions in a header or a footer
   * row keep their place.
   */
  public readonly actionsTop: InputSignal<string | null>;

  /**
   * How far from the message's end edge its top actions stand, as a CSS
   * length, such as `calc(var(--nol-space-2) + 0.5rem)`, or null, the
   * default, for 0.5rem. It moves the same actions as `actionsTop`, so an app
   * that shows its author inside the content, such as a plan card's own
   * header, can set the actions' gap to that header's end. Actions in a
   * header or a footer row keep their place.
   */
  public readonly actionsEnd: InputSignal<string | null>;

  /**
   * When the message's flash started, such as when the app took the person
   * to it, or null, the default, for no flash. From that time the message
   * fades an accent tint from its bubble, from a box with a bubble's corners
   * and padding around a column message's header and content, or from its
   * row or its selected Raised fill, once over 1.6 seconds, a `Highlight` outline under forced colors.
   * The app keeps the time, so a message drawn again, such as a recycled
   * row, or shown again goes on with the flash where it was; null stops the
   * flash, and a new time plays it again from that time. Its label stays the
   * same.
   */
  public readonly flashStart: InputSignal<Date | null>;

  /**
   * The id of the element that names the message with its author and time,
   * such as a feed row's `labelId`, or null, the default, for none.
   */
  public readonly labelId: InputSignal<string | null>;

  /**
   * The height in rem past which each run of text and code collapses, or
   * null, the default, for the theme's `message-collapsed-height`.
   */
  public readonly collapsedHeight: InputSignal<number | null>;

  /**
   * How the message lays out, a row with its avatar and header or the
   * person's bubble; {@link MessageLayout.Row} when not bound. A bubble's
   * {@link MessageComponent.continuation} only drops its top padding.
   */
  public readonly layout: InputSignal<MessageLayout>;

  /**
   * How the message writes its time, how long ago or the time of day, in
   * the app's `LOCALE_ID`; {@link MessageTimeFormat.Relative} when not
   * bound. Either way the time's tooltip and name give the date and time of
   * day. {@link provideTimeFormats} gives the time of day, and the date and
   * time, in the app's own formats.
   */
  public readonly timeFormat: InputSignal<MessageTimeFormat>;

  /**
   * Whether the message writes the time of day on a 24-hour clock, such as
   * 09:05 and 16:01, whatever the locale's own clock, in its time and in the
   * date and time of its tooltip and name; false when not bound, which
   * follows the locale. An app that writes its own times as `HH:mm` turns it
   * on, so a message shows the same time as the app's panels. A format from
   * {@link provideTimeFormats} takes its place for the time it writes.
   */
  public readonly twentyFourHour: InputSignal<boolean>;

  /**
   * The people and agents whose mentions the message's text marks, as the
   * mention field's candidates; none when not bound. Each `@name` of one
   * shows as the markdown view's `mentions` input says.
   */
  public readonly mentions: InputSignal<readonly MentionCandidate[]>;

  /**
   * Whether the message's text marks each `@name` of one of its
   * {@link MessageComponent.mentions}; true when not bound. When false, it
   * marks only the links to `mention:<id>`, as the markdown view's
   * `mentionNames` input says.
   */
  public readonly mentionNames: InputSignal<boolean>;

  /**
   * The text the Copy action writes, or null, when not bound, for the
   * message's text blocks, joined by blank lines, interim answers left out.
   * An app that draws part of the message itself, such as an error in a
   * slot or the text between a reply's steps, gives the whole text here.
   */
  public readonly copyText: InputSignal<string | null>;

  /**
   * Emits the text the Copy action, named "Copy message", wrote to the
   * clipboard.
   */
  public readonly copied: OutputEmitterRef<string>;

  /**
   * Emits when the person asks to try a failed message again. A message in
   * the error status shows its Retry button only while something listens to
   * this output, such as a `(retry)` binding or a subscription, and Retry
   * comes and goes with the listeners; a host that cannot retry binds
   * nothing and shows the error alone.
   */
  public readonly retry: OutputRef<void>;

  /**
   * Emits the id of the attachment the person chooses.
   */
  public readonly attachmentOpen: OutputEmitterRef<string>;

  /**
   * Emits the address of the link the person chooses; the app decides what
   * opens.
   */
  public readonly linkActivate: OutputEmitterRef<string>;

  /**
   * Emits each link the person opens in the message's text, beside the
   * address {@link MessageComponent.linkActivate} gives: its address, how it
   * was opened and the event, as the Markdown view's `linkOpen` says.
   */
  public readonly linkOpen: OutputEmitterRef<LinkOpenEvent>;

  /**
   * Emits each link in the message's text the person asks the menu of, by a
   * right-click, the ContextMenu key or Shift+F10, as the Markdown view's
   * `linkMenu` says; when the app cancels the event's default in its
   * handler, before it returns, to show its own menu, the message asks for
   * none through {@link MessageComponent.contextMenuRequest}, so each press
   * gives one menu.
   */
  public readonly linkMenu: OutputEmitterRef<LinkMenuEvent>;

  /**
   * Whether a link to a file's path in the message's text, or to a `file:`
   * URL on this machine, is a link, which starts with the
   * {@link FileBadgeComponent} for its path, without a `#` or `?` part after
   * it, as the Markdown view's `fileLinks` input says; false when not bound,
   * and then
   * a link to a path shows its text plain and one to a `file:` URL shows as
   * written. It means what
   * the Markdown view's `fileLinks` input from
   * `@noldova/ui.components.angular/markdown` means.
   */
  public readonly fileLinks: InputSignal<boolean>;

  /**
   * The link schemes of the app's own that the message's text makes links
   * of, which go to {@link MessageComponent.linkActivate};
   * {@link MarkdownLinkSchemes.none} when not bound. It means what the
   * Markdown view's `linkSchemes` input from
   * `@noldova/ui.components.angular/markdown` means.
   */
  public readonly linkSchemes: InputSignal<MarkdownLinkSchemes>;

  /**
   * Emits the target of the file link the person chooses while
   * {@link MessageComponent.fileLinks} is on, in the form the Markdown
   * view's `fileActivate` output from `@noldova/ui.components.angular/markdown`
   * gives it: the path itself, decoded, which the app uses as it is and
   * resolves.
   */
  public readonly fileActivate: OutputEmitterRef<string>;

  /**
   * The paths of the message's file links that are folders, in the form
   * {@link MessageComponent.fileActivate} emits them; a file link whose path
   * is in the set shows the folder mark in place of its file badge. Empty
   * when not bound. It means what the Markdown view's `folderLinks` input
   * from `@noldova/ui.components.angular/markdown` means.
   */
  public readonly folderLinks: InputSignal<ReadonlySet<string>>;

  /**
   * The app's reader of links to items on code hosts, which draws each link
   * it knows in the message's text as a {@link LinkReference} chip, and
   * with {@link ILinkReferenceSource.findText} each reference it finds
   * written in the text; null, the default, keeps every link plain. It means what the Markdown view's
   * `references` input from `@noldova/ui.components.angular/markdown` means.
   */
  public readonly references: InputSignal<ILinkReferenceSource | null>;

  /**
   * Emits the paths of the file links the message's text shows, in the form
   * {@link MessageComponent.fileActivate} emits them, each once, in the
   * order of the text, whenever that list changes, including while a reply
   * streams, so the app learns which of them are folders without reading the
   * Markdown itself. Nothing is emitted while the list stays empty, and the
   * list is empty while {@link MessageComponent.fileLinks} is off. A
   * Markdown view the app puts in a slot adds none of its paths.
   */
  public readonly filePathsChange: OutputEmitterRef<readonly string[]>;

  /**
   * Whether the message's shell code blocks, in its text and its own code
   * blocks, offer Run before Copy once the message has stopped streaming;
   * false when not bound, and then they have no Run. It means what
   * {@link CodeBlockComponent.runnable} means, and Run stays hidden while
   * {@link MessageComponent.status} is {@link MessageStatus.Streaming}, so code
   * still being written is never run. In its text, Run never shows on a block
   * whose fence never closed, as a reply cut off mid-block leaves it.
   */
  public readonly shellRuns: InputSignal<boolean>;

  /**
   * Emits the code, language and index of the shell block whose Run the
   * person chooses while {@link MessageComponent.shellRuns} is on, whatever
   * its state; the kit never runs it, and the app decides what running means.
   */
  public readonly shellRun: OutputEmitterRef<ShellRun>;

  /**
   * What became of each shell block's latest Run, keyed by
   * {@link ShellRun.block}, which its Run shows as {@link ShellRunState}
   * says; a block it doesn't name is Idle. Empty when not bound.
   */
  public readonly shellRunStates: InputSignal<ReadonlyMap<number, ShellRunState>>;

  /**
   * The code blocks, by {@link ShellRun.block}, under which the message draws
   * the app's {@link ShellRunOutputDirective} template, such as a terminal the
   * block's Run opened. The template's content spans the message's text
   * column, from its start to its end, whatever the block's own indent in a
   * list or a quote, and follows the block, as far below it as the text's
   * blocks are apart. Empty when not bound, or with no template, and then
   * nothing shows and the message's layout is today's.
   */
  public readonly shellRunOutputs: InputSignal<ReadonlySet<number>>;

  /**
   * Whether the message's text draws math; true when not bound. It means
   * what the Markdown view's `math` input from
   * `@noldova/ui.components.angular/markdown` means, so an app turns it off for a
   * person's own message, whose `$$` is often a shell's, and leaves it on for
   * a reply.
   */
  public readonly math: InputSignal<boolean>;

  /**
   * Emits where to open the app's context menu for the message: at the
   * pointer on a right click, or below the focused part on the ContextMenu
   * key or Shift+F10. The browser's own menu doesn't open over a message,
   * and the message stops each event it answers, so a context-menu trigger
   * around it, as in the example, opens once, on the part that had the
   * focus, and gives the focus back to it.
   *
   * @example
   * ```ts
   * import { Component, type Signal, viewChild } from "@angular/core";
   * import { ContextMenuTriggerDirective, MenuComponent, MenuItemComponent, MessageAuthor, MessageAuthorKind, type MessageBlock, MessageComponent,
   *   type MessageMenuRequest, MessageText } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-message-with-menu",
   *   imports: [ContextMenuTriggerDirective, MenuComponent, MenuItemComponent, MessageComponent],
   *   template: `
   *     <div [nolContextMenuTriggerFor]="actions">
   *       <nol-message [author]="author" [time]="time" [blocks]="blocks" (contextMenuRequest)="openMenu($event)" />
   *     </div>
   *     <ng-template #actions>
   *       <nol-menu>
   *         <button nol-menu-item label="Quote" icon="format_quote"></button>
   *       </nol-menu>
   *     </ng-template>`
   * })
   * export class MessageWithMenuComponent {
   *   private readonly menu: Signal<ContextMenuTriggerDirective> = viewChild.required(ContextMenuTriggerDirective);
   *
   *   protected readonly author: MessageAuthor = new MessageAuthor("guide", "Guide", MessageAuthorKind.Agent);
   *   protected readonly time: Date = new Date();
   *   protected readonly blocks: readonly MessageBlock[] = [new MessageText("Right-click me.")];
   *
   *   protected openMenu(request: MessageMenuRequest): void {
   *     if (request.event instanceof KeyboardEvent)
   *       this.menu().openFromKeyboard(request.event, request.target);
   *     else
   *       this.menu().openAtPointer(request.event, request.target);
   *   }
   * }
   * ```
   */
  public readonly contextMenuRequest: OutputEmitterRef<MessageMenuRequest>;
}

/**
 * Where and for which part a {@link MessageComponent} asks the app to open
 * its context menu, from {@link MessageComponent.contextMenuRequest}: a point
 * and an origin, the form {@link ContextMenuTriggerDirective.open} takes,
 * and the event and its target, the form
 * {@link ContextMenuTriggerDirective.openAtPointer} and
 * {@link ContextMenuTriggerDirective.openFromKeyboard} take.
 */
export declare class MessageMenuRequest {
  /**
   * The point to open the menu at, in viewport pixels, as a rectangle of
   * zero size: the pointer, or the bottom-left corner of the focused part.
   */
  public readonly point: DOMRect;

  /**
   * How the person asked: `"mouse"` for a right click, `"keyboard"` for a
   * key, which the menu's first row takes as its focus origin.
   */
  public readonly origin: FocusOrigin;

  /**
   * The part the menu is for, which takes the focus back when the menu
   * closes: the message's focused part, or else the row around it with the
   * `article` role, or else the message.
   */
  public readonly target: HTMLElement;

  /**
   * The right click or key press the message answered, whose default and
   * propagation it stopped.
   */
  public readonly event: MouseEvent | KeyboardEvent;

  /**
   * The id of the attachment the right click or key press was on, as its
   * picture or its button, so the app's menu can act on that file; null
   * elsewhere in the message.
   */
  public readonly attachmentId: string | null;

  /**
   * Creates the request, which a message does; an app makes one only in its
   * tests.
   *
   * @param point The point to open the menu at, in viewport pixels.
   * @param origin How the person asked.
   * @param target The part the menu is for.
   * @param event The right click or key press the message answered.
   * @param attachmentId The id of the attachment it was on; null when not
   * given.
   * @example
   * ```ts
   * import { MessageMenuRequest } from "@noldova/ui.components.angular";
   *
   * export const request: MessageMenuRequest = new MessageMenuRequest(new DOMRect(40, 120, 0, 0), "mouse", document.body,
   *   new MouseEvent("contextmenu", { button: 2, clientX: 40, clientY: 120 }));
   * ```
   */
  public constructor(point: DOMRect, origin: FocusOrigin, target: HTMLElement, event: MouseEvent | KeyboardEvent, attachmentId?: string | null);
}

/**
 * A place in a {@link MessageComponent}'s content for one of the app's
 * templates, such as a tool call's card or a diff, that a
 * {@link MessageSlotDirective} with the same id marks.
 */
export declare class MessageSlot extends MessageBlock {
  /**
   * {@link MessageBlockKind.Slot}.
   */
  public readonly kind: MessageBlockKind.Slot;

  /**
   * The id of the template it shows; an id no template has shows nothing.
   */
  public readonly id: string;

  /**
   * Nothing, since copying the message leaves the app's templates out.
   */
  public readonly text: string;

  /**
   * Creates the slot.
   *
   * @param id The id of the template it shows.
   * @example
   * ```ts
   * import { MessageSlot } from "@noldova/ui.components.angular";
   *
   * export const toolCall: MessageSlot = new MessageSlot("tool-call-3");
   * ```
   */
  public constructor(id: string);
}

/**
 * Marks an app's own action in a {@link MessageComponent}, such as Rewind to
 * here: a `nol-icon-button` placed directly inside the `nol-message`, which
 * the message shows in its action row before Copy, at Copy's size, 0.25rem
 * apart, shown and hidden with Copy, and as an item of the row's toolbar,
 * so the arrow keys move between it and Copy.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { IconButtonComponent, MessageActionDirective, MessageAuthor, MessageAuthorKind, type MessageBlock, MessageComponent, MessageLayout, MessageText }
 *   from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "app-own-message",
 *   imports: [IconButtonComponent, MessageActionDirective, MessageComponent],
 *   template: "<nol-message [author]=\"author\" [time]=\"time\" [blocks]=\"blocks\" [layout]=\"layout\"><button type=\"button\" nol-icon-button nolMessageAction icon=\"history\" label=\"Rewind to here\" (click)=\"rewind()\"></button></nol-message>"
 * })
 * export class OwnMessageComponent {
 *   protected readonly author: MessageAuthor = new MessageAuthor("person", "You", MessageAuthorKind.Person);
 *   protected readonly time: Date = new Date();
 *   protected readonly blocks: readonly MessageBlock[] = [new MessageText("Rename the notes folder.")];
 *   protected readonly layout: MessageLayout = MessageLayout.Bubble;
 *
 *   protected rewind(): void {
 *     // Go back to this message.
 *   }
 * }
 * ```
 */
export declare class MessageActionDirective {
  /**
   * The action's toolbar item, which the message's action row moves focus
   * through.
   */
  public readonly item: ToolbarItemDirective;
}

/**
 * Marks an app's own content after the time in a {@link MessageComponent}'s
 * footer, such as a button that shows a reply's stats or a running reply's
 * Stop: an element placed directly inside the `nol-message`, which the
 * message shows in every status, streaming included, shown and hidden with
 * its actions, except that one placed `End` keeps them shown. In the column
 * and bubble layouts it fills the rest of the footer's row after the time,
 * 0.25rem from it, on the time's line, and doesn't wrap before the time when
 * the row is narrow; in the row layout, whose time sits in the header, it
 * follows Copy in the actions' box at the message's top end, and the header
 * keeps clear of the box. Tab reaches a control in it after the time; it
 * isn't one of the actions toolbar's items, so the arrow keys don't. A
 * message without it keeps its footer as before.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { IconButtonComponent, MessageAuthor, MessageAuthorKind, type MessageBlock, MessageComponent, MessageFooterEndDirective, MessageFooterPlacement,
 *   MessageLayout, MessageStatus, MessageText } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "app-reply",
 *   imports: [IconButtonComponent, MessageComponent, MessageFooterEndDirective],
 *   template: "<nol-message [author]=\"author\" [time]=\"time\" [blocks]=\"blocks\" [layout]=\"layout\" [status]=\"status\">"
 *     + "<button type=\"button\" nol-icon-button nolMessageFooterEnd [nolMessageFooterEndPlacement]=\"end\" icon=\"stop\" label=\"Stop\" (click)=\"stop()\"></button>"
 *     + "</nol-message>"
 * })
 * export class ReplyComponent {
 *   protected readonly author: MessageAuthor = new MessageAuthor("agent", "Astra", MessageAuthorKind.Agent);
 *   protected readonly time: Date = new Date();
 *   protected readonly blocks: readonly MessageBlock[] = [new MessageText("Renaming the notes folder…")];
 *   protected readonly layout: MessageLayout = MessageLayout.Column;
 *   protected readonly status: MessageStatus = MessageStatus.Streaming;
 *   protected readonly end: MessageFooterPlacement = MessageFooterPlacement.End;
 *
 *   protected stop(): void {
 *     // Stop the reply.
 *   }
 * }
 * ```
 */
export declare class MessageFooterEndDirective {
  /**
   * Where the item sits after the time, as `nolMessageFooterEndPlacement`;
   * {@link MessageFooterPlacement.AfterTime} by default.
   */
  public readonly placement: InputSignal<MessageFooterPlacement>;
}

/**
 * Marks the `ng-template` that draws each image in a text's Markdown, as
 * `<ng-template nolMessageImage let-src="src" let-alt="alt" let-title="title">`
 * inside a {@link MessageComponent} or the markdown view,
 * `nol-markdown-view`; the template receives the image
 * ({@link IMessageImageContext}).
 *
 * Its content sits where the image was, inline in a paragraph, list item,
 * table cell or quote, in an inline block no wider than the block it sits in,
 * whose children are no wider than the inline block. A markdown view with no
 * template of its own uses the template of the message or view it sits in.
 * Without the template an image shows its alt text.
 * The kit draws nothing for an image and never fetches its address. A
 * streamed text keeps the content it drew while the text grows, and an image
 * in inline code or a code block stays text. An image written by reference,
 * `![alt][name]`, takes its address from a definition, which is checked as a
 * link's: only an address a link can have defines it, an http, https or
 * mailto one, a file's path, a `file:` URL on this machine while file
 * links are on, a mention or one with a scheme the app names.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { MessageAuthor, MessageAuthorKind, type MessageBlock, MessageComponent, MessageImageDirective, MessageText } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "app-reply",
 *   imports: [MessageComponent, MessageImageDirective],
 *   template: "<nol-message [author]=\"author\" [time]=\"time\" [blocks]=\"blocks\"><ng-template nolMessageImage let-src=\"src\" let-alt=\"alt\"><button type=\"button\" (click)=\"open(src)\">{{ alt }}</button></ng-template></nol-message>"
 * })
 * export class ReplyComponent {
 *   protected readonly author: MessageAuthor = new MessageAuthor("agent", "Agent", MessageAuthorKind.Agent);
 *   protected readonly time: Date = new Date();
 *   protected readonly blocks: readonly MessageBlock[] = [new MessageText("The chart: ![Sales by month](charts/sales.png)")];
 *
 *   protected readonly opened: string[] = [];
 *
 *   protected open(address: string): void {
 *     this.opened.push(address);
 *   }
 * }
 * ```
 */
export declare class MessageImageDirective {
  /**
   * The template a text's images are drawn with.
   */
  public readonly template: TemplateRef<IMessageImageContext>;

  /**
   * Tells Angular's template checker that the template's context is an
   * {@link IMessageImageContext}; Angular calls it, a module doesn't need to.
   *
   * @param _ The directive on the template.
   * @param _context The template's context.
   * @returns Always true.
   * @example
   * ```ts
   * import { MessageImageDirective } from "@noldova/ui.components.angular";
   *
   * export function isImageContext(directive: MessageImageDirective, context: unknown): boolean {
   *   return MessageImageDirective.ngTemplateContextGuard(directive, context);
   * }
   * ```
   */
  public static ngTemplateContextGuard(_: MessageImageDirective, _context: unknown): _context is IMessageImageContext;
}

/**
 * Marks a template inside a {@link MessageComponent} as the content of the
 * {@link MessageSlot} with the id bound to `nolMessageSlot`.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { MessageAuthor, MessageAuthorKind, type MessageBlock, MessageComponent, MessageSlot, MessageSlotDirective, MessageText } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-tool-message",
 *   imports: [MessageComponent, MessageSlotDirective],
 *   template: "<nol-message [author]=\"author\" [time]=\"time\" [blocks]=\"blocks\"><ng-template nolMessageSlot=\"search\"><p>Searched 12 notes.</p></ng-template></nol-message>"
 * })
 * export class ToolMessageComponent {
 *   protected readonly author: MessageAuthor = new MessageAuthor("agent", "Agent", MessageAuthorKind.Agent);
 *   protected readonly time: Date = new Date();
 *   protected readonly blocks: readonly MessageBlock[] = [new MessageText("Let me look."), new MessageSlot("search")];
 * }
 * ```
 */
export declare class MessageSlotDirective {
  /**
   * The template the slot shows.
   */
  public readonly template: TemplateRef<unknown>;

  /**
   * The id of the {@link MessageSlot} it fills, `nolMessageSlot`.
   */
  public readonly id: InputSignal<string>;

  /**
   * Whether the slot attaches to the part before it, `nolMessageSlotAttached`:
   * it is drawn `space-1` after that part, in place of the content's `space-2`
   * gap, and the part after it stays `space-2` after it. A slot that is the
   * message's first part is drawn as an unattached one. False when not bound.
   */
  public readonly isAttached: InputSignal<boolean>;
}

/**
 * Markdown text a {@link MessageComponent} shows, as its
 * {@link MessageComponent} description says.
 */
export declare class MessageText extends MessageBlock {
  /**
   * {@link MessageBlockKind.Text}.
   */
  public readonly kind: MessageBlockKind.Text;

  /**
   * The Markdown, which copying the message takes as it is.
   */
  public readonly text: string;

  /**
   * Whether the text is interim, such as an agent's note between its steps:
   * muted, 0.75rem in from a 2px start border in the border color, or in the
   * text color while its message is selected; the message's Copy leaves it out.
   */
  public readonly interim: boolean;

  /**
   * Creates the block.
   *
   * @param text The Markdown.
   * @param interim Whether the text is interim; false when not given.
   * @example
   * ```ts
   * import { MessageText } from "@noldova/ui.components.angular";
   *
   * export const answer: MessageText = new MessageText("The build **passed**. See [the log](https://example.com/log).");
   * ```
   */
  public constructor(text: string, interim?: boolean);
}

/**
 * Where an overlay, such as a menu, popover or tooltip, stands against the
 * element it opens from: the side it prefers, how it lines up along that
 * side, and how far it keeps from it.
 */
export declare class OverlayAnchoring {
  /**
   * The side the overlay prefers. {@link OverlayBounds.place} takes another
   * side only when the overlay does not fit on this one.
   */
  public readonly side: OverlaySide;

  /**
   * How the overlay lines up with the anchor along the side: their starts,
   * their centers or their ends. Above or below, start is the left edge, or
   * the right edge in a right-to-left layout; before or after, it is the top
   * edge.
   */
  public readonly alignment: OverlayAlignment;

  /**
   * The space between the anchor and the overlay, in CSS pixels; a negative
   * gap lays the overlay over its anchor by that much.
   */
  public readonly gap: number;

  /**
   * How far the overlay moves from its aligned edge into the anchor, in CSS
   * pixels; a negative value moves it outward. It has no effect when the
   * overlay is centered.
   */
  public readonly crossOffset: number;

  /**
   * Whether {@link OverlayBounds.place} may put the overlay on the two sides
   * across from its preferred side and its opposite when it fits on neither,
   * such as beside a field for a list that prefers to open below it. A
   * drop-down list that must stay below or above its field turns it off.
   */
  public readonly canCross: boolean;

  /**
   * Creates the anchoring.
   *
   * @param side The side the overlay prefers.
   * @param alignment How it lines up with the anchor along that side.
   * @param gap The space between the anchor and the overlay, in CSS pixels;
   * a negative gap lays the overlay over its anchor by that much.
   * @param crossOffset How far it moves from its aligned edge into the anchor,
   * in CSS pixels; 0 when left out.
   * @param canCross Whether it may take the sides across when it fits on
   * neither its side nor the opposite one; true when left out.
   * @example
   * ```ts
   * import { OverlayAlignment, OverlayAnchoring, OverlaySide } from "@noldova/ui.components.angular";
   *
   * export const dropDown: OverlayAnchoring = new OverlayAnchoring(OverlaySide.below, OverlayAlignment.Start, 0, 0, false);
   * ```
   * @example
   * ```ts
   * import { OverlayAlignment, OverlayAnchoring, OverlaySide } from "@noldova/ui.components.angular";
   *
   * export function besideRow(panelPadding: number): OverlayAnchoring {
   *   return new OverlayAnchoring(OverlaySide.end, OverlayAlignment.Start, 0, -panelPadding);
   * }
   * ```
   */
  public constructor(side: OverlaySide, alignment: OverlayAlignment, gap: number, crossOffset?: number, canCross?: boolean);
}

/**
 * The area an overlay must stay inside, by the coordinates of its four
 * edges in CSS pixels from the viewport's top left corner. In the window it
 * is the viewport less a gap at each side, and less the window's top row and
 * status bar unless the overlay opens from them.
 */
export declare class OverlayBounds {
  /**
   * The top edge's distance from the viewport's top.
   */
  public readonly top: number;

  /**
   * The right edge's distance from the viewport's left.
   */
  public readonly right: number;

  /**
   * The bottom edge's distance from the viewport's top.
   */
  public readonly bottom: number;

  /**
   * The left edge's distance from the viewport's left.
   */
  public readonly left: number;

  /**
   * Whether the overlays placed in the bounds open in a right-to-left
   * layout, where the start side and the start edge are on the right.
   */
  public readonly isRightToLeft: boolean;

  /**
   * Creates the bounds.
   *
   * @param top The top edge's distance from the viewport's top, in CSS
   * pixels.
   * @param right The right edge's distance from the viewport's left, in CSS
   * pixels; not less than `left`.
   * @param bottom The bottom edge's distance from the viewport's top, in CSS
   * pixels; not less than `top`.
   * @param left The left edge's distance from the viewport's left, in CSS
   * pixels.
   * @param isRightToLeft Whether the overlays open in a right-to-left
   * layout; false when omitted.
   * @example
   * ```ts
   * import { OverlayBounds } from "@noldova/ui.components.angular";
   *
   * export function viewportLess(margin: number): OverlayBounds {
   *   const view = document.documentElement;
   *   return new OverlayBounds(margin, view.clientWidth - margin, view.clientHeight - margin, margin);
   * }
   * ```
   */
  public constructor(top: number, right: number, bottom: number, left: number, isRightToLeft?: boolean);

  /**
   * Places an overlay against its anchor inside the bounds. It tries the
   * preferred side, then its opposite, then, unless the anchoring's
   * {@link OverlayAnchoring.canCross} is false, the two sides across: after
   * and before for a side above or below, below and above for a side before
   * or after. It takes the first on which the whole overlay fits. When it fits
   * on none, it takes whichever of the preferred side and its opposite has
   * more room, the preferred one on a tie, and caps the overlay's height to
   * that room above or below, or to the bounds' height before or after. The
   * overlay is then moved along the side to stay inside the bounds, its left
   * edge winning when it is wider than they are. With a negative gap, the
   * overlay covers its anchor, so on the side's axis it may reach as far
   * toward an edge as the anchor does, even past the bounds.
   *
   * @param anchor The anchor's rectangle in the viewport, such as an
   * element's `getBoundingClientRect()`.
   * @param width The overlay's width, in CSS pixels.
   * @param height The overlay's full height, in CSS pixels, measured without
   * a maximum height.
   * @param anchoring The preferred side, the alignment, the gap and the
   * cross offset.
   * @returns A new placement: the overlay's top left corner, the side taken,
   * and the height to cap it to, or null when it shows whole.
   * @example
   * ```ts
   * import { OverlayAlignment, OverlayAnchoring, type OverlayBounds, OverlaySide } from "@noldova/ui.components.angular";
   *
   * export function showBelow(bounds: OverlayBounds, anchor: Element, panel: HTMLElement): void {
   *   panel.style.maxHeight = "";
   *   const size = panel.getBoundingClientRect();
   *   const placement = bounds.place(anchor.getBoundingClientRect(), size.width, size.height, new OverlayAnchoring(OverlaySide.below, OverlayAlignment.Start, 4));
   *   panel.style.left = `${placement.left}px`;
   *   panel.style.top = `${placement.top}px`;
   *   panel.style.maxHeight = placement.maxHeight === null ? "" : `${placement.maxHeight}px`;
   * }
   * ```
   */
  public place(anchor: DOMRect, width: number, height: number, anchoring: OverlayAnchoring): OverlayPlacement;
}

/**
 * Measures where overlays may show in the window, from the theme painted on
 * the document's root. It measures each look once and keeps it until the
 * root's or the body's attributes, where the theme, its mode and the text size
 * are painted, or the window's size change, so overlays that open again and again, as
 * tooltips do while the page scrolls under the pointer, lay out nothing extra.
 * Started outside a browser, as when a page is prerendered, it places nothing
 * in the page and watches nothing, so a component that injects it, as the
 * tooltip does, renders there too.
 */
export declare class OverlayBoundsService {
  /**
   * The gap, in CSS pixels, between an overlay and its origin or the edges
   * it may not cross: the theme's `space-2` look, 8 at the default sizes.
   */
  public get gap(): number;

  /**
   * Gives the part of the viewport an overlay opened from an origin may
   * cover: between the window's top row and its status bar, by the theme's
   * heights for them, and within the window's sides, each a gap in. An
   * origin inside the top row or the status bar, which carry
   * `data-nol-chrome`, may also cover that bar, up to a gap from the window's
   * edge, and reach the panels' outer edges at the sides, the theme's
   * `panel-card-margin` look in, so the overlay can end where the bar's
   * outer controls end. The bounds are right-to-left when the origin is in a
   * right-to-left layout.
   *
   * @param origin The element the overlay opens against.
   * @returns The bounds, in viewport CSS pixels, from the viewport's size at
   * the call and the looks kept since they last changed.
   * @example
   * ```ts
   * import type { OverlayBoundsService } from "@noldova/ui.components.angular";
   *
   * export function fitsBelow(bounds: OverlayBoundsService, origin: Element, height: number): boolean {
   *   return origin.getBoundingClientRect().bottom + bounds.gap + height <= bounds.boundsFor(origin).bottom;
   * }
   * ```
   */
  public boundsFor(origin: Element): OverlayBounds;
}

/**
 * Where {@link OverlayBounds.place} puts an overlay: its top left corner,
 * the side of the anchor it took, and the height it is capped to.
 */
export declare class OverlayPlacement {
  /**
   * The overlay's left edge, in CSS pixels from the viewport's left.
   */
  public readonly left: number;

  /**
   * The overlay's top edge, in CSS pixels from the viewport's top.
   */
  public readonly top: number;

  /**
   * The side of the anchor the overlay stands on, which may differ from the
   * preferred one.
   */
  public readonly side: OverlaySide;

  /**
   * The height to cap the overlay to, in CSS pixels, so it scrolls; null
   * when it shows whole.
   */
  public readonly maxHeight: number | null;

  /**
   * Creates the placement. {@link OverlayBounds.place} creates it; a test
   * double creates its own.
   *
   * @param left The overlay's left edge, in CSS pixels from the viewport's
   * left.
   * @param top The overlay's top edge, in CSS pixels from the viewport's top.
   * @param side The side of the anchor it stands on.
   * @param maxHeight The height to cap it to, in CSS pixels, or null when it
   * shows whole.
   * @example
   * ```ts
   * import { OverlayPlacement, OverlaySide } from "@noldova/ui.components.angular";
   *
   * export const flipped: OverlayPlacement = new OverlayPlacement(120, 48, OverlaySide.above, 240);
   * ```
   */
  public constructor(left: number, top: number, side: OverlaySide, maxHeight: number | null);
}

/**
 * A side of the anchor an overlay stands on. The four static members are
 * the only instances, so sides compare by identity. Before and after are the
 * physical left and right.
 */
export declare class OverlaySide {
  /**
   * Above the anchor.
   */
  public static readonly above: OverlaySide;

  /**
   * Below the anchor.
   */
  public static readonly below: OverlaySide;

  /**
   * Before the anchor, on its left, or on its right in a right-to-left
   * layout.
   */
  public static readonly start: OverlaySide;

  /**
   * After the anchor, on its right, or on its left in a right-to-left
   * layout.
   */
  public static readonly end: OverlaySide;

  /**
   * Whether the side is above or below the anchor rather than before or
   * after it.
   */
  public readonly isVertical: boolean;

  /**
   * Whether the side lies toward larger coordinates: below or after.
   */
  public readonly isForward: boolean;

  /**
   * Only the kit creates sides; use the static members.
   *
   * @example
   * ```ts
   * import { OverlaySide } from "@noldova/ui.components.angular";
   *
   * export const tooltipSide: OverlaySide = OverlaySide.below;
   *
   * // @ts-expect-error
   * export const madeUp: OverlaySide = new OverlaySide();
   * ```
   */
  private constructor();

  /**
   * The side across the anchor: below for above, after for before, and the
   * reverse.
   */
  public get opposite(): OverlaySide;
}

/**
 * A panel card, `nol-panel-card`: a bordered card with large rounded corners
 * that clips its content to them, on the shell's surface or the panel's.
 * The window's tab groups are panel cards, on the shell surface in a dock
 * and on the panel surface in the middle.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { PanelCardComponent, PanelSurface } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-outline-card",
 *   imports: [PanelCardComponent],
 *   template: "<nol-panel-card [surface]=\"surface\"><p>No symbols in this file.</p></nol-panel-card>"
 * })
 * export class OutlineCardComponent {
 *   protected readonly surface: PanelSurface = PanelSurface.Shell;
 * }
 * ```
 */
export declare class PanelCardComponent {
  /**
   * The surface the card is filled with; the panel's when not bound.
   */
  public readonly surface: InputSignal<PanelSurface>;
}

/**
 * An agent's request for permission, `nol-permission-card`, which a chat
 * shows inline at the width of a message, never as a dialog, and keeps in
 * its history once answered. Its head shows the approval icon, the heading
 * with the request's kind under it, then the risk by an icon and text, or
 * none when the request leaves it unknown, and the minutes left before the
 * request expires, updated each minute and formatted for `LOCALE_ID`. The
 * description and the details follow, the details as plain code in the mono
 * font. Details longer than {@link PermissionCardComponent.detailLines},
 * 3 lines by default, show that many lines and a Show all button, and then
 * scroll inside the card; details as long or shorter show whole. The
 * requester's line, its name and kind, or its name alone when it has no
 * kind, isn't shown, since the card sits in the requester's message, but is
 * in the card's description.
 *
 * The options are equal secondary buttons at the end of the card, a kit
 * toolbar, one tab stop whose arrow keys move
 * between them; Enter, Space or a click chooses the focused one. The
 * default option is the toolbar's tab stop and the one
 * {@link PermissionCardComponent.focus} focuses, and it never allows at high
 * risk, so a high-risk card without a deny takes focus itself, where Enter
 * chooses nothing. At high risk, an allow that may last, and every option
 * when none denies, turns the row into Confirm and Cancel, with
 * Cancel focused when focus was in the card; Cancel brings the options
 * back. Confirm takes no second click of a double click, which can land on it
 * when the card grows upward, under the pressed option. So a high-risk
 * card never allows on a single Enter or a double click. A request whose
 * risk is unknown is guarded as at high risk. Escape decides
 * nothing and passes out of the card.
 *
 * The card answers once: after it emits a choice, the options are disabled
 * and choose nothing more until the owner binds the request in another
 * status, such as sending. While the request is sending, the options stay
 * in place but are disabled.
 * Once it fails to send, ends or is decided, the outcome replaces the
 * options, and focus that was on them moves to the card. When a pending
 * request first shows, the card announces it through the {@link Announcer},
 * as Permission request from, the requester's line and the heading: assertively
 * when no other card is pending, and politely when one is. Each card keeps
 * its own state, so several can be pending at once.
 */
export declare class PermissionCardComponent {
  /**
   * The request the card shows.
   */
  public readonly request: InputSignal<PermissionRequest>;

  /**
   * Whether long details show all their lines; the card updates it as the
   * person presses Show all and Show fewer lines, and the owner keeps it, so
   * a card drawn again, such as a row a virtual list scrolls back into view,
   * looks as it did. False when not bound.
   */
  public readonly detailsExpanded: ModelSignal<boolean>;

  /**
   * How many lines of details show before the Show all button; details with
   * that many lines or fewer show whole. Once Show all is pressed, the details
   * scroll inside a block as high as the larger of 12 lines and this count.
   * A value is rounded down to a whole number of at least 1, and one that
   * isn't a finite number counts as 3. 3 when not bound.
   */
  public readonly detailLines: InputSignalWithTransform<number, number>;

  /**
   * Emits the id of the option the person chose, once they confirmed it
   * when the card asks, and again when they press Retry; once for each
   * status the owner binds. The owner sends the answer, binding a request
   * that is sending, and then one that is decided or failed to send.
   */
  public readonly decide: OutputEmitterRef<string>;

  /**
   * Creates the card, which Angular does for each `nol-permission-card`
   * element.
   *
   * @example
   * ```ts
   * import { Component, type WritableSignal, signal } from "@angular/core";
   * import { type IPermissionRequestOptions, PermissionCardComponent, PermissionDecision, PermissionRequest, PermissionRequester, PermissionRisk,
   *   PermissionStatus } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-delete-request",
   *   imports: [PermissionCardComponent],
   *   template: "<nol-permission-card [request]=\"request()\" (decide)=\"answer($event)\" />"
   * })
   * export class DeleteRequestComponent {
   *   protected readonly request: WritableSignal<PermissionRequest> = signal(DeleteRequestComponent.requestOf({}));
   *
   *   protected answer(optionId: string): void {
   *     this.request.set(DeleteRequestComponent.requestOf({ status: PermissionStatus.Sending, decision: new PermissionDecision(optionId, "You", new Date()) }));
   *   }
   *
   *   private static requestOf(options: IPermissionRequestOptions): PermissionRequest {
   *     return new PermissionRequest("request-1", new PermissionRequester("Build agent", "Agent"), "Delete the build folder", PermissionRisk.High,
   *       { details: "rm -rf build/", ...options });
   *   }
   * }
   * ```
   */
  public constructor();

  /**
   * Moves focus to the default option of a pending request, or to the card
   * itself when there is none. The card takes focus only when the app calls
   * it, such as for a request the person is waiting on.
   *
   * @example
   * ```ts
   * import type { PermissionCardComponent } from "@noldova/ui.components.angular";
   *
   * export function focusNewest(cards: readonly PermissionCardComponent[]): void {
   *   cards.at(-1)?.focus();
   * }
   * ```
   */
  public focus(): void;
}

/**
 * The answer a person gave to a {@link PermissionRequest}.
 */
export declare class PermissionDecision {
  /**
   * The id of the option the person chose.
   */
  public readonly optionId: string;

  /**
   * Who decided, as the card shows it, such as You.
   */
  public readonly decidedBy: string;

  /**
   * When they decided, which the card shows as a short time formatted for
   * `LOCALE_ID`, with the date when it wasn't today, or in the app's own
   * formats from {@link provideTimeFormats}.
   */
  public readonly decidedAt: Date;

  /**
   * Creates the decision, keeping a copy of its date.
   *
   * @param optionId The id of the option chosen. Not blank.
   * @param decidedBy Who decided. Not blank.
   * @param decidedAt When.
   * @throws ArgumentException when the option's id or who decided is blank.
   * @example
   * ```ts
   * import { PermissionDecision } from "@noldova/ui.components.angular";
   *
   * export const denied: PermissionDecision = new PermissionDecision("deny", "You", new Date("2026-10-13T09:00:00Z"));
   * ```
   */
  public constructor(optionId: string, decidedBy: string, decidedAt: Date);
}

/**
 * One answer a person can give to a {@link PermissionRequest}. The card
 * reads its effect and scope, for the kit's options and the app's alike, to
 * keep an allow from being the default at high risk and to ask before an
 * allow that may last at high risk. A decided card words the outcome from
 * the chosen option's effect and scope, or shows the option's own label when
 * it has no scope.
 */
export declare class PermissionOption {
  /**
   * The kit's options, used when a request names none: Allow once,
   * `allow-once`; Always allow, `allow-always`; and Deny, `deny`.
   */
  public static readonly defaults: readonly PermissionOption[];

  /**
   * The option's id, unique among the request's options, which
   * {@link PermissionCardComponent.decide} emits.
   */
  public readonly id: string;

  /**
   * The button's text.
   */
  public readonly label: string;

  /**
   * Whether the option allows or denies.
   */
  public readonly effect: PermissionEffect;

  /**
   * Whether the answer holds once or always, or `null` when the option
   * doesn't say, such as an option that holds for a session or one whose
   * provider doesn't say how long it holds.
   */
  public readonly scope: PermissionScope | null;

  /**
   * Creates the option.
   *
   * @param id The option's id. Not blank.
   * @param label The button's text. Not blank.
   * @param effect Whether it allows or denies.
   * @param scope Whether it holds once or always, or `null` when the option
   * doesn't say.
   * @throws ArgumentException when the id or the label is blank.
   * @example
   * ```ts
   * import { PermissionEffect, PermissionOption, PermissionScope } from "@noldova/ui.components.angular";
   *
   * export const allowFolder: PermissionOption = new PermissionOption("allow-folder", "Allow in this folder", PermissionEffect.Allow, PermissionScope.Always);
   * export const allowSession: PermissionOption = new PermissionOption("allow-session", "Allow for this session", PermissionEffect.Allow, null);
   * ```
   */
  public constructor(id: string, label: string, effect: PermissionEffect, scope: PermissionScope | null);

  /**
   * Whether the option allows.
   */
  public get isAllow(): boolean;

  /**
   * Whether the option always allows, which at high risk asks the person to
   * confirm.
   */
  public get isAlwaysAllow(): boolean;

  /**
   * Whether the option allows for longer than this request, or may: it
   * always allows or has no scope. At high risk the card asks the person to
   * confirm it.
   */
  public get mayLast(): boolean;
}

/**
 * An agent's request to act, which a {@link PermissionCardComponent} shows.
 * Requests never change; a request that moves on, such as one the person
 * answered, is a new request of the same id.
 */
export declare class PermissionRequest {
  /**
   * The request's id, unique on the page; the card announces each id once.
   */
  public readonly id: string;

  /**
   * Who asks.
   */
  public readonly requester: PermissionRequester;

  /**
   * What the agent would do, in a few words, such as Delete the build
   * folder; the card is named by it.
   */
  public readonly heading: string;

  /**
   * The requester's own name for the request, as it gave it, or null for
   * none.
   */
  public readonly kind: string | null;

  /**
   * How risky the action is, or `null` when the app doesn't know. The card
   * then shows no risk, and guards the request's allows as at high risk.
   */
  public readonly risk: PermissionRisk | null;

  /**
   * Why the agent asks, or null for nothing more.
   */
  public readonly description: string | null;

  /**
   * The exact command, path, address or app, with its own line breaks, or
   * null for none.
   */
  public readonly details: string | null;

  /**
   * The answers the person can give, in order.
   */
  public readonly options: readonly PermissionOption[];

  /**
   * The option the card focuses first: the one the options named, or else
   * the first; at high or unknown risk the named one only when it denies, or
   * else the first that denies, or null when none does.
   */
  public readonly defaultOption: PermissionOption | null;

  /**
   * Where the request stands.
   */
  public readonly status: PermissionStatus;

  /**
   * The person's answer, or null while there is none.
   */
  public readonly decision: PermissionDecision | null;

  /**
   * The option the answer chose, or null while there is none.
   */
  public readonly chosenOption: PermissionOption | null;

  /**
   * When the request expires, or null when it doesn't.
   */
  public readonly expiresAt: Date | null;

  /**
   * Creates the request, keeping copies of its expiry and of its list of
   * options.
   *
   * @param id The request's id. Not blank.
   * @param requester Who asks.
   * @param heading What the agent would do, in a few words. Not blank.
   * @param risk How risky it is, or `null` when the app doesn't know.
   * @param options Its optional parts; none when left out.
   * @throws ArgumentException when the id, the heading or a given
   * description or details is blank, when the options are empty or two
   * share an id, when the default option or the decision names no option,
   * or when a decision is missing for a request that is sending, failed to
   * send or decided, or given for any other.
   * @example
   * ```ts
   * import { PermissionRequest, PermissionRequester, PermissionRisk } from "@noldova/ui.components.angular";
   *
   * export const request: PermissionRequest = new PermissionRequest("request-2", new PermissionRequester("Docs agent", "Agent"), "Open the docs site", PermissionRisk.Low, {
   *   details: "https://example.com/docs",
   *   expiresAt: new Date("2026-10-13T09:05:00Z")
   * });
   * ```
   */
  public constructor(id: string, requester: PermissionRequester, heading: string, risk: PermissionRisk | null, options?: IPermissionRequestOptions);

  /**
   * Whether the card guards the request's allows as at high risk, because
   * its risk is high or unknown: no allow is its default, and an allow that
   * may last, or any allow when no option denies, asks to be confirmed.
   */
  public get isGuarded(): boolean;
}

/**
 * Who asks for a {@link PermissionRequest}. Its card describes it as the
 * name and the kind, such as Build agent, Agent, or as the name alone when
 * there is no kind, so a requester whose name is already the whole line,
 * in the app's own words, gives no kind.
 */
export declare class PermissionRequester {
  /**
   * The requester's display name, such as Build agent.
   */
  public readonly name: string;

  /**
   * What kind of requester it is, in the app's own words, such as Agent or
   * Extension, or null for none.
   */
  public readonly kind: string | null;

  /**
   * Creates the requester.
   *
   * @param name The display name. Not blank.
   * @param kind What kind of requester it is, or null for none, the
   * default. Not blank.
   * @throws ArgumentException when the name, or a given kind, is blank.
   * @example
   * ```ts
   * import { PermissionRequester } from "@noldova/ui.components.angular";
   *
   * export const agent: PermissionRequester = new PermissionRequester("Build agent", "Agent");
   * export const module: PermissionRequester = new PermissionRequester("Files · Build agent · This computer");
   * ```
   */
  public constructor(name: string, kind?: string | null);
}

/**
 * An agent's plan: the steps it means to take, in order, which a
 * {@link PlanComponent} shows. Plans never change; a plan that moves on,
 * such as one whose step is done, is a new plan.
 */
export declare class Plan {
  /**
   * The steps, in order; at least one.
   */
  public readonly steps: readonly PlanStep[];

  /**
   * The step the agent is on: the first in progress, else the first not
   * started, or null when every step is done.
   */
  public readonly current: PlanStep | null;

  /**
   * How many steps are done.
   */
  public readonly completedCount: number;

  /**
   * Creates the plan, keeping a copy of its list of steps.
   *
   * @param steps The steps, in order.
   * @throws ArgumentException when there are no steps.
   * @example
   * ```ts
   * import { Plan, PlanStep, PlanStepStatus } from "@noldova/ui.components.angular";
   *
   * export const plan: Plan = new Plan([
   *   new PlanStep("Read the notes module", PlanStepStatus.Completed),
   *   new PlanStep("Add a weekly reminder", PlanStepStatus.InProgress, "Adding a weekly reminder"),
   *   new PlanStep("Run the tests", PlanStepStatus.Pending)
   * ]);
   * ```
   */
  public constructor(steps: readonly PlanStep[]);
}

/**
 * A plan's card, `nol-plan`, which an agent's message shows at the width of
 * its body: a bordered list of every step, unless
 * {@link PlanComponent.framed} is off, always open, each with its
 * marker and its text, which wraps. A done step has a filled check circle,
 * a step in progress the kit's spinner and its active text, and a step not
 * started a dashed circle; every step's text has the same color and weight.
 *
 * The list is named by how many steps are done, as Plan, 2 of 5 done, and
 * each step by its text and where it stands. Rows are kept by position, so a
 * new plan with the same steps updates the rows in place. When the owner
 * binds a new plan, the card announces it politely through the
 * {@link Announcer}: each step whose status changed, as Step 2 of 5 done:
 * Run the tests; the plan as its list is named, as Plan, 4 of 5 done, when
 * more than two steps changed status at once; or, when the steps themselves
 * changed, Plan updated, 5 steps. The first plan it shows, such as one from
 * the history, is not announced.
 */
export declare class PlanComponent {
  /**
   * The plan the card shows.
   */
  public readonly plan: InputSignal<Plan>;

  /**
   * Whether the card draws its own frame, a 1px border with medium corners
   * and 0.25rem by 0.75rem of padding; true when not bound. Off, the steps
   * sit flush with the card's edges, for an app that sets the list inside a
   * frame of its own, such as a block framed like a code block, and each
   * step keeps its row's height and its marker's place.
   */
  public readonly framed: InputSignal<boolean>;

  /**
   * Creates the card, which Angular does for each `nol-plan` element.
   *
   * @example
   * ```ts
   * import { Component } from "@angular/core";
   * import { Plan, PlanComponent, PlanStep, PlanStepStatus } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-reply-plan",
   *   imports: [PlanComponent],
   *   template: "<nol-plan [plan]=\"plan\" />"
   * })
   * export class ReplyPlanComponent {
   *   protected readonly plan: Plan = new Plan([new PlanStep("Run the tests", PlanStepStatus.InProgress, "Running the tests")]);
   * }
   * ```
   */
  public constructor();
}

/**
 * One step of a {@link Plan}.
 */
export declare class PlanStep {
  /**
   * What the step does, such as Run the tests.
   */
  public readonly text: string;

  /**
   * Where the step stands.
   */
  public readonly status: PlanStepStatus;

  /**
   * The step said as under way, such as Running the tests, which the card
   * shows in place of the text while the step is in progress; null when the
   * agent gives none.
   */
  public readonly activeText: string | null;

  /**
   * Creates the step.
   *
   * @param text What the step does. Not blank.
   * @param status Where it stands.
   * @param activeText The step said as under way, or null, the default,
   * for none. Not blank when given.
   * @throws ArgumentException when the text or a given active text is
   * blank.
   * @example
   * ```ts
   * import { PlanStep, PlanStepStatus } from "@noldova/ui.components.angular";
   *
   * export const step: PlanStep = new PlanStep("Run the tests", PlanStepStatus.InProgress, "Running the tests");
   * ```
   */
  public constructor(text: string, status: PlanStepStatus, activeText?: string | null);
}

/**
 * Marks the root element of a popover that {@link PopoverTriggerDirective}
 * opens, `nolPopover`: a non-modal dialog with the dialog role, which the
 * trigger focuses once it shows. It is usually a host directive of the
 * popover's component.
 */
export declare class PopoverDirective {
  /**
   * The popover's accessible name, its `label` input, which a component
   * that has the directive as a host directive passes on as its own.
   *
   * @example
   * ```ts
   * import { Component } from "@angular/core";
   * import { PopoverDirective } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-sync-details",
   *   hostDirectives: [{ directive: PopoverDirective, inputs: ["label"] }],
   *   template: "<p>All notes are synced.</p>"
   * })
   * export class SyncDetailsComponent {
   * }
   * ```
   */
  public readonly label: InputSignal<string>;
}

/**
 * Opens a popover, a non-modal dialog anchored to its host, when the host is
 * clicked, and closes it on the next click. The template bound to
 * `nolPopoverTrigger` holds the popover, whose root uses
 * {@link PopoverDirective}; the trigger focuses that root once it shows. The
 * popover closes on a press outside both it and the host, on Escape that
 * nothing inside handled, when the host is hidden or scrolled away, and when
 * the trigger is destroyed. Its export name is `nolPopoverTrigger`, and it
 * gives its host `aria-haspopup="dialog"` and `aria-expanded`.
 */
export declare class PopoverTriggerDirective {
  /**
   * The popover's template, `nolPopoverTrigger`, created afresh each time it
   * opens.
   */
  public readonly template: InputSignal<TemplateRef<unknown>>;

  /**
   * The side of the host the popover prefers, `nolPopoverSide`; above when
   * not bound. Without room there it takes the opposite side, then a side
   * across, or else whichever of the two has more room. It is read when the
   * popover opens.
   */
  public readonly side: InputSignal<OverlaySide>;

  /**
   * How the popover lines up with the host along that side,
   * `nolPopoverAlignment`; the end when not bound. It is read when the
   * popover opens.
   */
  public readonly alignment: InputSignal<OverlayAlignment>;

  /**
   * Emits, as `opened`, each time the popover opens.
   */
  public readonly opened: OutputEmitterRef<void>;

  /**
   * Whether the popover is open.
   */
  public readonly isOpen: Signal<boolean>;

  /**
   * Creates the directive, which Angular does for each element that uses
   * `nolPopoverTrigger`.
   *
   * @example
   * ```ts
   * import { Component, type OutputEmitterRef, output } from "@angular/core";
   * import { OverlayAlignment, OverlaySide, PopoverDirective, PopoverTriggerDirective } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-sync-details",
   *   hostDirectives: [{ directive: PopoverDirective, inputs: ["label"] }],
   *   template: "<p>All notes are synced.</p><button type=\"button\" (click)=\"done.emit()\">OK</button>"
   * })
   * export class SyncDetailsComponent {
   *   public readonly done: OutputEmitterRef<void> = output<void>();
   * }
   *
   * @Component({
   *   selector: "nol-sync-status",
   *   imports: [PopoverTriggerDirective, SyncDetailsComponent],
   *   template: `
   *     <button #trigger="nolPopoverTrigger" type="button" [nolPopoverTrigger]="details" [nolPopoverSide]="below" [nolPopoverAlignment]="start"
   *       (opened)="markSeen()">Synced</button>
   *     <ng-template #details>
   *       <nol-sync-details label="Sync status" (done)="trigger.close()" />
   *     </ng-template>`
   * })
   * export class SyncStatusComponent {
   *   protected readonly below: OverlaySide = OverlaySide.below;
   *   protected readonly start: OverlayAlignment = OverlayAlignment.Start;
   *
   *   public isSeen: boolean = false;
   *
   *   protected markSeen(): void {
   *     this.isSeen = true;
   *   }
   * }
   * ```
   */
  public constructor();

  /**
   * Opens the popover, or closes it while it is open, as a click on the host
   * does.
   *
   * @example
   * ```ts
   * import { Component, type Signal, viewChild } from "@angular/core";
   * import { PopoverDirective, PopoverTriggerDirective } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-help-button",
   *   imports: [PopoverDirective, PopoverTriggerDirective],
   *   host: { "(document:keydown.f1)": "toggleHelp()" },
   *   template: `
   *     <button type="button" [nolPopoverTrigger]="help">Help</button>
   *     <ng-template #help>
   *       <div class="nol-popover-body" nolPopover label="Help">Press Ctrl+K to search.</div>
   *     </ng-template>`
   * })
   * export class HelpButtonComponent {
   *   private readonly trigger: Signal<PopoverTriggerDirective> = viewChild.required(PopoverTriggerDirective);
   *
   *   protected toggleHelp(): void {
   *     this.trigger().toggle();
   *   }
   * }
   * ```
   */
  public toggle(): void;

  /**
   * Closes the popover; when focus was inside it, focus returns to the host.
   * Nothing happens while it is closed.
   *
   * @example
   * ```ts
   * import { Component, type Signal, viewChild } from "@angular/core";
   * import { PopoverDirective, PopoverTriggerDirective } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-rename-button",
   *   imports: [PopoverDirective, PopoverTriggerDirective],
   *   template: `
   *     <button type="button" [nolPopoverTrigger]="rename">Rename</button>
   *     <ng-template #rename>
   *       <div nolPopover label="Rename note">
   *         <input #name type="text" />
   *         <button type="button" (click)="apply(name.value)">Save</button>
   *       </div>
   *     </ng-template>`
   * })
   * export class RenameButtonComponent {
   *   private readonly trigger: Signal<PopoverTriggerDirective> = viewChild.required(PopoverTriggerDirective);
   *
   *   public title: string = "Groceries";
   *
   *   protected apply(title: string): void {
   *     this.title = title;
   *     this.trigger().close();
   *   }
   * }
   * ```
   */
  public close(): void;
}

/**
 * A short meter, `nol-meter`, for how much of a limit is used, such as an
 * account's usage in a settings list: a short rounded bar filled to its
 * fraction, with its content after it as muted text, such as `42% · Nov 2`.
 * Its warning tone turns the bar and the text to the theme's `warning` color,
 * for use near the limit. It is a `meter` named by its label, with its
 * fraction from 0 to 1 as its value and its text as the value's text, or,
 * without text, the fraction as a percentage in the app's locale, so it is
 * never read as a bare fraction; under forced colors the bar is outlined and filled in
 * `CanvasText`. The bar's width, height and the gap before the text are the
 * theme's `meter`, `meter-height` and `meter-gap` sizes.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { MeterComponent } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-account-usage",
 *   imports: [MeterComponent],
 *   template: "<nol-meter label=\"Weekly usage\" [value]=\"used\" [warning]=\"used >= 0.9\">{{ used * 100 }}% · Nov 2</nol-meter>"
 * })
 * export class AccountUsageComponent {
 *   protected readonly used: number = 0.42;
 * }
 * ```
 */
export declare class MeterComponent {
  /**
   * Creates the meter, which Angular does for each `nol-meter` element.
   *
   * @example
   * ```ts
   * import { Component } from "@angular/core";
   * import { MeterComponent } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-session-usage",
   *   imports: [MeterComponent],
   *   template: "<nol-meter label=\"Session usage\" [value]=\"0.3\">30%</nol-meter>"
   * })
   * export class SessionUsageComponent {}
   * ```
   */
  public constructor();

  /**
   * The meter's accessible name, naming what it measures, such as Weekly
   * usage.
   */
  public readonly label: InputSignal<string>;

  /**
   * The fraction used, from 0 to 1; a value outside that range shows as the
   * nearer end, and one that is not a number as 0. 0 when not bound.
   */
  public readonly value: InputSignal<number>;

  /**
   * Whether the meter shows its warning tone, the bar and its text in the
   * theme's `warning` color, such as near the limit; under forced colors it
   * looks the same, so the text says why. False when not bound.
   */
  public readonly warning: InputSignal<boolean>;
}

/**
 * A thin progress bar, `nol-progress`, named for its work: it fills to a
 * known fraction, or slides a bar across its track while the amount is
 * unknown, standing still under reduced motion. Binding its `isDelayed`
 * input, from its host directive {@link RevealDelayDirective}, to true keeps
 * it hidden for its first 300 ms, so brief work does not flash it.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { ProgressComponent } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-export-progress",
 *   imports: [ProgressComponent],
 *   template: "<nol-progress label=\"Exporting notes\" [value]=\"share\" />"
 * })
 * export class ExportProgressComponent {
 *   protected readonly share: number | null = 0.4;
 * }
 * ```
 */
export declare class ProgressComponent {
  /**
   * The bar's accessible name, naming the work.
   */
  public readonly label: InputSignal<string>;

  /**
   * The fraction of the work done, from 0 to 1, or null while the amount is
   * unknown; null when not bound.
   */
  public readonly value: InputSignal<number | null>;
}

/**
 * Finds what a person typed in a title, for searches that emphasize the
 * matched characters, such as a {@link QuickInputItem}'s matches.
 */
export declare class QueryMatcher {
  /**
   * Finds the first occurrence of a query in a text, ignoring case.
   *
   * @param query What the person typed. Leading and trailing white space is
   * ignored; every other character, including white space and
   * regular-expression characters, matches literally.
   * @param text The text to search, such as a command's title.
   * @returns The indexes of the matched characters in the text, in UTF-16
   * code units and ascending order; empty when the query is blank or does
   * not occur.
   * @example
   * ```ts
   * import { QueryMatcher } from "@noldova/ui.components.angular";
   *
   * export const matches: readonly number[] = QueryMatcher.find("new", "Create a New note");
   * ```
   * @example
   * ```ts
   * import { QueryMatcher, QuickInputItem } from "@noldova/ui.components.angular";
   *
   * export function toItem(query: string, id: string, title: string): QuickInputItem | null {
   *   const matches = QueryMatcher.find(query, title);
   *   return matches.length === 0 ? null : new QuickInputItem(id, title, null, null, null, matches);
   * }
   * ```
   */
  public static find(query: string, text: string): readonly number[];
}

/**
 * A completion list, `nol-completion-list`: the choices a field offers for
 * what the person is typing, such as commands after a slash or names in
 * code, each a label with an optional note at the row's end. The owner keeps
 * the focus in its field, filters the choices, moves the active one with the
 * keys and points the field's `aria-activedescendant` at
 * {@link CompletionListComponent.optionId}; the list shows the choices, marks
 * and scrolls to the active one and reports the one clicked. A press on the
 * list never takes the focus from the field.
 *
 * The host element is the listbox: it has the `listbox` role, its id is
 * {@link CompletionListComponent.listId} and its accessible name is
 * {@link CompletionListComponent.label}, so the field's `aria-controls`
 * names it. Each choice is an `option` whose accessible name is its label,
 * then a comma and its note when it has one; the note is plain text with no
 * role of its own.
 *
 * The host carries the menu's box, its border, corner, fill and shadow, and
 * the menu item's rows, with the active row filled as a hovered menu item
 * is. The kit sets no position, z-index or width: the owner places the list,
 * such as in an overlay above its field, and sizes it. Its height is at most
 * twelve rows, or {@link CompletionListComponent.maxHeight} when that is
 * less, and the rows scroll inside it.
 */
export declare class CompletionListComponent {
  /**
   * The choices in the order shown.
   */
  public readonly choices: InputSignal<readonly CompletionChoice[]>;

  /**
   * The index of the active choice, marked `aria-selected` and scrolled into
   * view, or -1, or any index past the end, for none.
   */
  public readonly active: InputSignal<number>;

  /**
   * The id of the host, unique in the page; each option's id is made from it
   * by {@link CompletionListComponent.optionId}.
   */
  public readonly listId: InputSignal<string>;

  /**
   * The list's accessible name.
   */
  public readonly label: InputSignal<string>;

  /**
   * Whether the labels are code, shown in the code font; false when not bound.
   */
  public readonly isCode: InputSignal<boolean>;

  /**
   * The most the list's height may be, in CSS pixels, such as the room
   * between its field and the window's edge, or null, the default, for twelve
   * rows. The list is never taller than twelve rows.
   */
  public readonly maxHeight: InputSignal<number | null>;

  /**
   * Emits the choice the person clicked, the same instance the owner gave in
   * {@link CompletionListComponent.choices}.
   */
  public readonly chosen: OutputEmitterRef<CompletionChoice>;

  /**
   * Creates the component, which Angular does for each `nol-completion-list`
   * element.
   *
   * @example
   * ```ts
   * import { Component, type Signal, type WritableSignal, computed, signal } from "@angular/core";
   * import { CompletionChoice, CompletionListComponent } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-command-field",
   *   imports: [CompletionListComponent],
   *   template: `
   *     <input aria-label="Command" role="combobox" aria-controls="nol-commands" [attr.aria-activedescendant]="activeId()"
   *       [value]="query()" (input)="query.set($any($event.target).value)" />
   *     <nol-completion-list listId="nol-commands" label="Commands" [choices]="choices()" [active]="0" (chosen)="query.set($event.label)" />
   *   `
   * })
   * export class CommandFieldComponent {
   *   private readonly all: readonly CompletionChoice[] = [new CompletionChoice("/review", "Review the changes"), new CompletionChoice("/clear")];
   *
   *   protected readonly query: WritableSignal<string> = signal("/");
   *   protected readonly choices: Signal<readonly CompletionChoice[]> = computed(() => this.all.filter(t => t.label.startsWith(this.query())));
   *   protected readonly activeId: Signal<string | null> = computed(() =>
   *     this.choices().length > 0 ? CompletionListComponent.optionId("nol-commands", 0) : null);
   * }
   * ```
   */
  public constructor();

  /**
   * The id of the option at an index in the list with an id, `<listId>-option-<index>`,
   * for the field's `aria-activedescendant`.
   *
   * @param listId The list's {@link CompletionListComponent.listId}.
   * @param index The option's index in {@link CompletionListComponent.choices}.
   * @returns The option's id.
   */
  public static optionId(listId: string, index: number): string;
}

/**
 * A row of {@link CompletionListComponent}: a label and an optional note,
 * such as a command and what it does, or a name and its kind.
 */
export declare class CompletionChoice {
  /**
   * The label, which the row shows first, truncated with an ellipsis when it
   * does not fit.
   */
  public readonly label: string;

  /**
   * The note shown muted at the row's end, or null when it has none.
   */
  public readonly note: string | null;

  /**
   * Creates a choice.
   *
   * @param label The label, not blank.
   * @param note The note, not blank when given; null, the default, for none.
   * @throws ArgumentException synchronously when the label is blank, or the
   * note is given and blank.
   */
  public constructor(label: string, note?: string | null);
}

/**
 * A search field over a list of results, the kind command search shows. The
 * owner filters and orders the items for the query; the component shows them,
 * keeps one active and reports the one chosen. The arrow keys, Home, End,
 * Page Up and Page Down move the active result, Enter chooses it, a click
 * chooses the result clicked, and Escape dismisses the search. Once the keys
 * move or filter the results, the active result shows its title and detail
 * in a tooltip while they are cut short, until the field loses focus; the
 * first Escape hides that tooltip instead, until the next move or filter.
 * The owner can give a filters row under the field, each element it marks
 * `nolQuickInputFilters`, and a footer under the results, each element it
 * marks `nolQuickInputFooter`; each row shows only when given.
 */
export declare class QuickInputComponent {
  /**
   * The results in the order shown. A result the person made active with the
   * keys stays active through a change while it is still listed, until the
   * query changes; otherwise a change makes the first one active. A result
   * with a section starts a group with that heading, a gap after the group
   * before it.
   */
  public readonly items: InputSignal<readonly QuickInputItem[]>;

  /**
   * The field's placeholder and the accessible name of the field and the
   * list.
   */
  public readonly label: InputSignal<string>;

  /**
   * The name of a glyph shown inside the field before the query, muted at the
   * `quick-input-glyph` size, such as `search` for a search palette, one field
   * padding inside the field, with the query one field padding after it. No
   * glyph when null, the default.
   */
  public readonly icon: InputSignal<string | null>;

  /**
   * The text shown in the results' place while there are no items, such as a
   * hint before the person types, a "Nothing found." or a failure. It is muted
   * in the panel's text role, starts at the query's start edge, and is
   * announced in place of the result count; while it shows, the field reports
   * its list closed. Nothing is shown when empty, the
   * default.
   */
  public readonly emptyText: InputSignal<string>;

  /**
   * Whether the empty text is announced as an alert, for a failure, rather
   * than politely; false when not bound.
   */
  public readonly isEmptyTextAlert: InputSignal<boolean>;

  /**
   * The text in the field, which the person's typing sets; bind it two ways
   * with `[(query)]` to filter the items. Empty when not bound.
   */
  public readonly query: ModelSignal<string>;

  /**
   * Whether the field takes focus after the component first renders; true
   * when not bound.
   */
  public readonly isFocusing: InputSignal<boolean>;

  /**
   * Emits the result the person chose with Enter or a click. When Enter
   * comes right after typing, it waits until the items for the new query
   * have rendered and chooses the active one of those. Nothing is emitted
   * while there are no results.
   */
  public readonly chosen: OutputEmitterRef<QuickInputItem>;

  /**
   * Emits when the person presses Escape; the owner closes the search.
   */
  public readonly dismissed: OutputEmitterRef<void>;

  /**
   * Emits Tab and Shift+Tab pressed in the field, with the key's event, such
   * as to move to the next filter. The owner that calls `preventDefault` on
   * the event keeps the focus in the field; otherwise the focus moves on.
   */
  public readonly tabKey: OutputEmitterRef<KeyboardEvent>;

  /**
   * Creates the component, which Angular does for each `nol-quick-input`
   * element.
   *
   * @example
   * ```ts
   * import { Component, type Signal, type WritableSignal, computed, signal } from "@angular/core";
   * import { QueryMatcher, QuickInputComponent, QuickInputItem } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-note-search",
   *   imports: [QuickInputComponent],
   *   template: "<nol-quick-input label=\"Search notes\" [items]=\"items()\" [(query)]=\"query\" (chosen)=\"open($event)\" (dismissed)=\"opened.set(null)\" />"
   * })
   * export class NoteSearchComponent {
   *   private readonly titles: readonly string[] = ["Groceries", "Reading list", "Trip plan"];
   *
   *   protected readonly query: WritableSignal<string> = signal("");
   *   protected readonly items: Signal<readonly QuickInputItem[]> = computed(() => this.titles
   *     .map(t => new QuickInputItem(t, t, "description", null, null, QueryMatcher.find(this.query(), t)))
   *     .filter(t => this.query().trim() === "" || t.matches.length > 0));
   *
   *   public readonly opened: WritableSignal<string | null> = signal(null);
   *
   *   protected open(item: QuickInputItem): void {
   *     this.opened.set(item.id);
   *   }
   * }
   * ```
   */
  public constructor();
}

/**
 * A row of {@link QuickInputComponent}: a title with an icon, a detail, a
 * key label and a section heading, and the characters of its title and
 * detail that match the query, which the row highlights.
 */
export declare class QuickInputItem {
  /**
   * The item's id, which no other item in the list has; the list tracks its
   * rows by it.
   */
  public readonly id: string;

  /**
   * The title.
   */
  public readonly title: string;

  /**
   * The glyph shown before the title, or null for an empty space that keeps
   * the titles lined up.
   */
  public readonly icon: string | null;

  /**
   * The detail shown after the title, such as where the item comes from, or
   * null when it has none.
   */
  public readonly detail: string | null;

  /**
   * The keys that run the item, shown at its end, or null when it has none.
   */
  public readonly keyLabel: string | null;

  /**
   * The indexes of the title's characters that match the query, a copy of
   * those given.
   */
  public readonly matches: readonly number[];

  /**
   * The indexes of the detail's characters that match the query, a copy of
   * those given.
   */
  public readonly detailMatches: readonly number[];

  /**
   * The heading of the group the item starts, shown on its own row above
   * the group's rows, which labels the group; null when it continues the
   * group before it.
   */
  public readonly section: string | null;

  /**
   * Creates the item.
   *
   * @param id The item's id, not blank and unique in its list.
   * @param title The title, not blank.
   * @param icon The glyph, or null for none.
   * @param detail The detail, or null for none.
   * @param keyLabel The keys that run it, such as `Ctrl+Alt+N`, or null for
   * none.
   * @param matches The indexes of the title's matching characters, each a
   * whole number below the title's length; none when left out.
   * @param detailMatches The indexes of the detail's matching characters,
   * each a whole number below the detail's length; none when left out, and
   * none allowed without a detail.
   * @param section The heading of the section it starts, not blank, or null
   * when left out.
   * @throws ArgumentException synchronously when the id or title is blank, a
   * match is not the index of a title character, a detail match is not the
   * index of a detail character, or the section is blank.
   * @example
   * ```ts
   * import { QuickInputItem } from "@noldova/ui.components.angular";
   *
   * export const newNote: QuickInputItem = new QuickInputItem("notes.new", "New note", "add", "Notes", "Ctrl+Alt+N");
   * ```
   * @example
   * ```ts
   * import { Component } from "@angular/core";
   * import { QueryMatcher, QuickInputComponent, QuickInputItem } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-note-picker",
   *   imports: [QuickInputComponent],
   *   template: "<nol-quick-input [items]=\"items\" label=\"Open note\" (chosen)=\"open($event)\" />"
   * })
   * export class NotePickerComponent {
   *   protected readonly items: readonly QuickInputItem[] = [
   *     new QuickInputItem("n1", "Groceries", "description", "Home", null, QueryMatcher.find("gro", "Groceries"), [], "Recently opened"),
   *     new QuickInputItem("n2", "Garden plan", "description", "Home", null, [], [], "Other notes")
   *   ];
   *   public openedId: string | null = null;
   *
   *   protected open(item: QuickInputItem): void {
   *     this.openedId = item.id;
   *   }
   * }
   * ```
   */
  public constructor(id: string, title: string, icon: string | null, detail: string | null, keyLabel: string | null, matches?: readonly number[],
    detailMatches?: readonly number[], section?: string | null);

  /**
   * The title in runs of matching and other characters, in order, which
   * the row shows with the matching runs highlighted.
   */
  public get segments(): readonly TitleSegment[];

  /**
   * The detail in runs of matching and other characters, in order; empty
   * when the item has no detail.
   */
  public get detailSegments(): readonly TitleSegment[];
}

/**
 * The delay before a busy indicator shows: the host directive of
 * {@link SpinnerComponent} and {@link ProgressComponent} that holds their
 * `isDelayed` input. While the input is true it keeps its host hidden for
 * the first 300 ms, so brief work does not flash it. An app imports the
 * spinner or the progress bar, not this directive; the directive is exported
 * so that an app's template that binds `isDelayed` on them compiles.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { ProgressComponent } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-copy-status",
 *   imports: [ProgressComponent],
 *   template: "<nol-progress label=\"Copying files\" [value]=\"copied\" [isDelayed]=\"true\" />"
 * })
 * export class CopyStatusComponent {
 *   protected readonly copied: number = 0.5;
 * }
 * ```
 */
export declare class RevealDelayDirective {
  /**
   * Creates the directive, which Angular does for each `nol-spinner` and
   * `nol-progress` element, as their host directive.
   *
   * @example
   * ```ts
   * import { Component } from "@angular/core";
   * import { SpinnerComponent } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-history-status",
   *   imports: [SpinnerComponent],
   *   template: "<nol-spinner label=\"Loading the history\" [isDelayed]=\"isLoading\" />"
   * })
   * export class HistoryStatusComponent {
   *   protected readonly isLoading: boolean = true;
   * }
   * ```
   */
  public constructor();

  /**
   * Whether the host stays hidden for its first 300 ms; false when not bound,
   * which shows it at once. Setting it back to true after false starts the
   * delay again.
   */
  public readonly isDelayed: InputSignal<boolean>;

  /**
   * Whether the delay is still running, so the host is hidden; it gives the
   * host the `nol-reveal-pending` class meanwhile.
   */
  public readonly isPending: Signal<boolean>;
}

/**
 * The handle between two panes that the person drags, or moves with the
 * arrow keys, to resize them. It reports how far it moved; the owner resizes
 * the panes, keeps them within their limits and positions the sash. It is a
 * focusable separator whose highlight shows after the pointer rests on it
 * for 300 milliseconds and while it is dragged.
 */
export declare class SashComponent {
  /**
   * Which way the sash runs: a vertical sash stands between panes side by
   * side and moves left and right, with the left and right arrow keys; a
   * horizontal sash lies between stacked panes and moves up and down, with
   * the up and down arrow keys.
   */
  public readonly orientation: InputSignal<SashOrientation>;

  /**
   * The accessible name, such as "Resize the sidebar".
   */
  public readonly label: InputSignal<string>;

  /**
   * The size of the pane the sash resizes, in pixels, which assistive
   * technology announces; none when not bound. The sash does not limit
   * itself by it.
   */
  public readonly value: InputSignal<number | undefined>;

  /**
   * The smallest size of {@link SashComponent.value}, in pixels, which
   * assistive technology announces; none when not bound.
   */
  public readonly minimum: InputSignal<number | undefined>;

  /**
   * The largest size of {@link SashComponent.value}, in pixels, which
   * assistive technology announces; none when not bound.
   */
  public readonly maximum: InputSignal<number | undefined>;

  /**
   * How far one arrow key moves the sash, in pixels; 8 when not bound.
   */
  public readonly step: InputSignal<number>;

  /**
   * Emits each move in pixels: positive toward the right for a vertical
   * sash and downward for a horizontal one, negative the other way. A drag
   * emits the distance the pointer moved since the last emission, never 0;
   * an arrow key emits plus or minus {@link SashComponent.step}.
   */
  public readonly resize: OutputEmitterRef<number>;

  /**
   * Creates the component, which Angular does for each `nol-sash` element.
   * Destroying it cancels a pending highlight.
   *
   * @example
   * ```ts
   * import { Component, type WritableSignal, signal } from "@angular/core";
   * import { SashComponent, SashOrientation } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-sidebar-layout",
   *   imports: [SashComponent],
   *   template: `<aside [style.width.px]="width()"></aside>
   *     <nol-sash label="Resize the sidebar" [orientation]="orientations.Vertical" [value]="width()" [minimum]="160" [maximum]="480" (resize)="resize($event)" />
   *     <main></main>`
   * })
   * export class SidebarLayoutComponent {
   *   protected readonly orientations: typeof SashOrientation = SashOrientation;
   *   protected readonly width: WritableSignal<number> = signal(240);
   *
   *   protected resize(delta: number): void {
   *     this.width.update(t => Math.min(480, Math.max(160, t + delta)));
   *   }
   * }
   * ```
   */
  public constructor();
}

/**
 * Keeps a scrolling area that grows over time at its end while the reader
 * leaves it there, as a streaming code block and a tool call's output do: a
 * scroll toward the start that leaves the end stops it, and a scroll toward the
 * end within its distance, or to the end, starts it again. It follows from the
 * start.
 */
export declare class ScrollEndFollower {
  /**
   * Creates the follower.
   *
   * @param distance How near the end, in CSS pixels, a scroll toward the end
   * turns following back on; the code block and the tool call use 16.
   * @example
   * ```ts
   * import { DestroyRef, Directive, ElementRef, inject } from "@angular/core";
   * import { ScrollEndFollower } from "@noldova/ui.components.angular";
   *
   * @Directive({ selector: "[appTaskLog]", host: { "(scroll)": "follower.see(area)" } })
   * export class TaskLogDirective {
   *   protected readonly area: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
   *   protected readonly follower: ScrollEndFollower = new ScrollEndFollower(16);
   *
   *   public constructor() {
   *     const sizes = new ResizeObserver(() => this.follower.follow(this.area));
   *     sizes.observe(this.area);
   *     inject(DestroyRef).onDestroy(() => sizes.disconnect());
   *   }
   *
   *   public added(): void {
   *     this.follower.follow(this.area);
   *   }
   * }
   * ```
   */
  public constructor(distance: number);

  /**
   * Notes where the reader left the area, called on each of its scroll events.
   *
   * @param area The scrolling area.
   */
  public see(area: HTMLElement): void;

  /**
   * Scrolls the area to its end while it follows, called after each change to
   * its content and from a `ResizeObserver` on the area, so an area at its end
   * holds its end when it is resized; it notes the area's place first, as {@link ScrollEndFollower.see}
   * does.
   *
   * @param area The scrolling area.
   */
  public follow(area: HTMLElement): void;
}

/**
 * A section header, `nol-section-header`: the label of a group of rows in a
 * list or tree, in the label size at the emphasis weight, with no fill or line.
 * Groups are separated by space: every header that is not the first
 * element in its container stands 0.75rem below what comes before it. It
 * has the heading role. A collapsible header holds one button, the whole
 * header, whose caret after the label points down while the group is open
 * and turns to the end while it is closed; the owner holds the open state
 * and shows or removes the rows.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { SectionHeaderComponent } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-project-list",
 *   imports: [SectionHeaderComponent],
 *   template: "<nol-section-header label=\"Recent\" /><p>Notes</p><nol-section-header label=\"Pinned\" [level]=\"4\" /><p>Ideas</p>"
 * })
 * export class ProjectListComponent {
 * }
 * ```
 */
export declare class SectionHeaderComponent {
  /**
   * The header's text, its required `label` input.
   */
  public readonly label: InputSignal<string>;

  /**
   * The heading level screen readers announce, its `level` input; 3 when
   * not bound.
   */
  public readonly level: InputSignal<number>;

  /**
   * The Material Symbols name of an icon shown before the label, such as
   * `chat` for a list of chats, its `icon` input: at the theme's icon size in
   * `icon-color`, where a top-level row's icon is in a tree without
   * branches, centered on the label's first line, with the label 0.5rem
   * after it and hidden from screen readers, so the label alone names the
   * heading. No icon when not bound, null or empty.
   */
  public readonly icon: InputSignal<string | null>;

  /**
   * Whether the person can fold the group, its `collapsible` input: the
   * header then holds one button, the whole header, with the icon and the
   * label where they are without it and a caret 0.25rem after the label at
   * the `section-header-caret` size, 0.875rem, in the header's text color,
   * centered on the label's first line and hidden from screen readers. The button takes the hover fill and exposes
   * the open state. False when not bound.
   */
  public readonly collapsible: InputSignal<boolean>;

  /**
   * Whether the label shows as an uppercase group heading, its `uppercase`
   * input: in capitals at `--nol-text-small`, the emphasis weight, the
   * `text` color rather than `text-strong`, and `--nol-letter-spacing-caps`,
   * with the icon as it is, the caret at its size in the label's color, and
   * the header's height unchanged. Screen readers still read the label as given. False when not
   * bound.
   */
  public readonly uppercase: InputSignal<boolean>;

  /**
   * The id of the element holding the group's rows, which a collapsible
   * header's button controls, its `controls` input; none when not bound.
   */
  public readonly controls: InputSignal<string | null>;

  /**
   * Whether a collapsible header's group is open, its two-way `expanded`
   * model; true when not bound. Pressing the button, or Enter or Space on
   * it, flips it; the caret points down while it is true and turns a quarter
   * to the end, right or in a right-to-left layout left, while it is false.
   */
  public readonly expanded: ModelSignal<boolean>;
}

/**
 * A button that shows the title of the chosen option and opens the options
 * in a list below it, or above it when the list fits only there, at least as
 * wide as the button and lined up with its start. The list is at most 10.5
 * rows high, and never taller than the larger room below or above the button
 * in the window; it scrolls the rest, with the chosen option in view, and it
 * never opens beside the button. The owner holds the
 * value: choosing an option emits its value, and the button shows the new
 * one once the owner binds it. Escape hides an option's tooltip while one
 * shows, and otherwise, like Tab, closes the list and returns focus to the
 * button, as does choosing; a click outside closes it.
 */
export declare class SelectComponent {
  /**
   * Whether the list of options is open.
   */
  public readonly isExpanded: Signal<boolean>;

  /**
   * The options in the order the list shows them, each with a distinct
   * value across the whole list, and the labeled groups, a
   * {@link SelectGroup} each, that hold some of them, in their place among
   * the rest. A group shows its label above its options, muted and starting
   * where their titles start, and screen readers read its options as a
   * group named by the label; the label takes no focus, and the arrow keys
   * and type-ahead move across the groups' options as across any. An option
   * that is disabled, {@link SelectOption.isDisabled}, shows but can't be
   * chosen.
   */
  public readonly options: InputSignal<readonly (SelectOption | SelectGroup)[]>;

  /**
   * The value of the chosen option. The button shows that option's title,
   * or the value itself when no option has it.
   */
  public readonly value: InputSignal<string>;

  /**
   * The accessible name of the button and the list; the button's name also
   * includes the title it shows, then the chosen option's tag, if it has one.
   */
  public readonly label: InputSignal<string>;

  /**
   * The id, or space-separated ids, of the elements that describe the button,
   * such as a setting's description and its {@link FieldMessageComponent};
   * nothing describes it when null, the default.
   */
  public readonly describedBy: InputSignal<string | null>;

  /**
   * Whether the button is disabled; false when not bound.
   */
  public readonly disabled: InputSignal<boolean>;

  /**
   * Emits the value of the option the person chose when it differs from
   * {@link SelectComponent.value}; choosing the current option only closes
   * the list.
   */
  public readonly valueChange: OutputEmitterRef<string>;

  /**
   * Creates the component, which Angular does for each `nol-select` element.
   * Destroying it closes its list.
   *
   * @example
   * ```ts
   * import { Component, type WritableSignal, signal } from "@angular/core";
   * import { SelectComponent, SelectOption } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-sort-order",
   *   imports: [SelectComponent],
   *   template: "<nol-select label=\"Sort by\" [options]=\"options\" [value]=\"order()\" (valueChange)=\"order.set($event)\" />"
   * })
   * export class SortOrderComponent {
   *   protected readonly options: readonly SelectOption[] = [new SelectOption("title", "Title"), new SelectOption("changed", "Last changed")];
   *   protected readonly order: WritableSignal<string> = signal("title");
   * }
   * ```
   */
  public constructor();

  /**
   * Moves focus to the button.
   *
   * @example
   * ```ts
   * import { Component, type Signal, viewChild } from "@angular/core";
   * import { SelectComponent, SelectOption } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-page-picker",
   *   imports: [SelectComponent],
   *   template: "<nol-select label=\"Page\" value=\"general\" [options]=\"pages\" /><button type=\"button\" (click)=\"pick()\">Choose a page</button>"
   * })
   * export class PagePickerComponent {
   *   private readonly select: Signal<SelectComponent> = viewChild.required(SelectComponent);
   *
   *   protected readonly pages: readonly SelectOption[] = [new SelectOption("general", "General"), new SelectOption("keys", "Keyboard")];
   *
   *   protected pick(): void {
   *     this.select().focus();
   *   }
   * }
   * ```
   */
  public focus(): void;
}

/**
 * A labeled group of options in a {@link SelectComponent}'s list, such as
 * the models in a person's plan and those outside it. The list shows the
 * label above the group's options, as a {@link MenuGroupComponent} does, and
 * screen readers read them as a group named by the label.
 *
 * @example
 * ```ts
 * import { Component, type WritableSignal, signal } from "@angular/core";
 * import { SelectComponent, SelectGroup, SelectOption } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-model-picker",
 *   imports: [SelectComponent],
 *   template: "<nol-select label=\"Model\" [options]=\"models\" [value]=\"model()\" (valueChange)=\"model.set($event)\" />"
 * })
 * export class ModelPickerComponent {
 *   protected readonly models: readonly SelectGroup[] = [
 *     new SelectGroup("In your plan", [new SelectOption("fast", "Fast"), new SelectOption("balanced", "Balanced")]),
 *     new SelectGroup("Upgrade to use", [new SelectOption("deep", "Deep", null, true)])
 *   ];
 *   protected readonly model: WritableSignal<string> = signal("fast");
 * }
 * ```
 */
export declare class SelectGroup {
  /**
   * The text shown above the group's options, which names the group for
   * screen readers.
   */
  public readonly label: string;

  /**
   * The group's options, in the order the list shows them.
   */
  public readonly options: readonly SelectOption[];

  /**
   * Creates the group.
   *
   * @param label The text shown above its options.
   * @param options Its options, in order.
   */
  public constructor(label: string, options: readonly SelectOption[]);
}

/**
 * One choice of a {@link SelectComponent} or {@link ChoicePillsComponent}: the
 * value it stands for, the title it shows and, in a select's list, an
 * optional tag after the title and whether it can be chosen.
 */
export declare class SelectOption {
  /**
   * The value the control holds, and reports through its `valueChange`
   * output, while the option is chosen.
   */
  public readonly value: string;

  /**
   * The text shown for the option, and on the select's button while it is
   * chosen.
   */
  public readonly title: string;

  /**
   * A short word a select's list shows in a small, muted, outlined chip
   * right after the title, such as `Recommended`, or null, the default, for
   * none. A long title ends with an ellipsis before it. Screen readers read
   * it with the title, and with the select's name while the option is
   * chosen; the button itself shows only the title. Type-ahead matches the
   * title alone. Choice pills don't show it.
   */
  public readonly tag: string | null;

  /**
   * Whether a select's list shows the option without letting it be chosen,
   * such as a model outside the person's plan; false, the default, lets it
   * be chosen. The list draws it dimmed, as a disabled menu item is, and
   * screen readers read it as unavailable. A press does nothing on it, and
   * the arrow keys, Home, End and type-ahead pass over it. While it is the
   * select's value, the button still shows its title, and the list still
   * marks it and opens on it. Choice pills ignore it.
   */
  public readonly isDisabled: boolean;

  /**
   * Creates the option.
   *
   * @param value The value it stands for.
   * @param title The text shown for it.
   * @param tag The tag shown after its title in a select's list; none when
   * left out or null.
   * @param isDisabled Whether a select's list shows it without letting it be
   * chosen; it can be chosen when left out or false.
   * @example
   * ```ts
   * import { Component, type WritableSignal, signal } from "@angular/core";
   * import { SelectComponent, SelectOption } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-notes-order",
   *   imports: [SelectComponent],
   *   template: "<nol-select label=\"Sort notes by\" [options]=\"options\" [value]=\"order()\" (valueChange)=\"order.set($event)\" />"
   * })
   * export class NotesOrderComponent {
   *   protected readonly options: readonly SelectOption[] = [new SelectOption("title", "Title"), new SelectOption("changed", "Last changed")];
   *   protected readonly order: WritableSignal<string> = signal("title");
   * }
   * ```
   */
  public constructor(value: string, title: string, tag?: string | null, isDisabled?: boolean);
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

/**
 * A turning ring for work in progress, `nol-spinner`, standing still under
 * reduced motion. The ring is drawn smaller than the spinner's box and
 * centered in it, so it matches an icon's glyph while the box keeps the
 * icon's place. With a label it is a status that announces the label,
 * which is hidden from sight, so text beside it names the work to the eye;
 * without one it is decorative. Binding its `isDelayed` input, from its
 * host directive {@link RevealDelayDirective}, to true keeps it hidden for
 * its first 300 ms, so brief work does not flash it, and its label is
 * announced only once it appears.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { SpinnerComponent } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-indexing-status",
 *   imports: [SpinnerComponent],
 *   template: "@if (isIndexing) { <nol-spinner label=\"Indexing notes\" [isDelayed]=\"true\" /> }"
 * })
 * export class IndexingStatusComponent {
 *   protected readonly isIndexing: boolean = true;
 * }
 * ```
 */
export declare class SpinnerComponent {
  /**
   * The text that names the work, announced and hidden from sight; empty
   * when not bound, which leaves the spinner decorative.
   */
  public readonly label: InputSignal<string>;
}

/**
 * A split button, `nol-split-button`: an icon button for an action and,
 * joined to its end, an arrow that opens a menu of choices for it, such as a
 * terminal's New terminal and its Choose a shell. Each half is a native
 * button in the tab order with its own accessible name and tooltip, the
 * icon button's size and looks, and no gap between them. While either half
 * is hovered or the menu is open, one outline in the widget border color
 * wraps both, with an edge of the same color between them, and the hovered
 * half or the open arrow shows the toolbar hover fill inside it; at rest it
 * shows only the two glyphs. Under forced colors the outline and the edge
 * are `ButtonText`, and the open arrow is `Highlight`.
 *
 * @example
 * ```ts
 * import { Component, type OutputEmitterRef, output } from "@angular/core";
 * import { MenuComponent, MenuItemComponent, OverlayAlignment, SplitButtonComponent } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-new-terminal",
 *   imports: [MenuComponent, MenuItemComponent, SplitButtonComponent],
 *   template: `
 *     <nol-split-button icon="add" label="New terminal" tooltip="New terminal (Ctrl+Shift+\`)" menuLabel="Choose a shell" [menu]="shells"
 *       [menuAlignment]="end" (triggered)="created.emit('default')" />
 *     <ng-template #shells>
 *       <nol-menu>
 *         <button nol-menu-item label="Bash" (triggered)="created.emit('bash')"></button>
 *         <button nol-menu-item label="PowerShell" (triggered)="created.emit('pwsh')"></button>
 *       </nol-menu>
 *     </ng-template>
 *   `
 * })
 * export class NewTerminalComponent {
 *   protected readonly end: OverlayAlignment = OverlayAlignment.End;
 *   public readonly created: OutputEmitterRef<string> = output<string>();
 * }
 * ```
 */
export declare class SplitButtonComponent {
  /**
   * Creates the split button, which Angular does for each `nol-split-button`
   * element, and starts ignoring its clicks and activation keys while it is
   * busy.
   *
   * @example
   * ```ts
   * import { Component, type WritableSignal, signal } from "@angular/core";
   * import { SplitButtonComponent } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-save-split",
   *   imports: [SplitButtonComponent],
   *   template: "<nol-split-button icon=\"save\" label=\"Save\" menuLabel=\"Save options\" [menu]=\"null\" [busy]=\"isSaving()\" />"
   * })
   * export class SaveSplitComponent {
   *   protected readonly isSaving: WritableSignal<boolean> = signal(false);
   * }
   * ```
   */
  public constructor();

  /**
   * The Material Symbols name of the main half's glyph, such as `add`.
   */
  public readonly icon: InputSignal<string>;

  /**
   * The main half's accessible name, naming its action.
   */
  public readonly label: InputSignal<string>;

  /**
   * The main half's tooltip, such as its label with its shortcut; its label
   * when null, which is the default.
   */
  public readonly tooltip: InputSignal<string | null>;

  /**
   * The arrow's accessible name and tooltip, naming the menu's choices.
   */
  public readonly menuLabel: InputSignal<string>;

  /**
   * The menu the arrow opens, a template holding a {@link MenuComponent}, as
   * `nolMenuTriggerFor` takes it; null opens none.
   */
  public readonly menu: InputSignal<TemplateRef<unknown> | null>;

  /**
   * How the menu lines up with the arrow it opens below, as
   * `nolMenuAlignment`; the start when not bound.
   */
  public readonly menuAlignment: InputSignal<OverlayAlignment>;

  /**
   * The side both halves show their tooltips on, as `nolTooltipSide`; above
   * when not bound.
   */
  public readonly tooltipSide: InputSignal<OverlaySide>;

  /**
   * Whether the main half is unavailable: it is marked aria-disabled, stays
   * focusable, looks disabled and emits nothing, while the arrow still opens
   * the menu. False by default.
   */
  public readonly disabled: InputSignal<boolean>;

  /**
   * Whether the main half's work is under way: the main half is a busy
   * {@link IconButtonComponent}, its spinner in place of its glyph, and the
   * whole split button keeps its size and ignores clicks, middle clicks,
   * Enter and Space, and the arrow's up and down arrows, so it emits nothing
   * and the menu stays shut. False by default.
   */
  public readonly busy: InputSignal<boolean>;

  /**
   * Emits when the main half is clicked, or pressed with Enter or Space,
   * unless it is disabled.
   */
  public readonly triggered: OutputEmitterRef<void>;
}

/**
 * A tab of a tab list: an optional icon, the title, an optional badge, and a
 * close button or a busy spinner. Its owner puts it in an element with the
 * `tablist` role and moves focus between tabs; only the selected tab is in
 * the tab order. A click, Enter or Space activates it; Delete, a middle
 * click or its close button closes it when it is closable. While its title
 * is cut, a tooltip below the tab shows the whole title on hover and on
 * keyboard focus; a tab whose title fits shows none. Escape on a focused tab
 * whose tooltip is shown only hides the tooltip, so in a dialog the first
 * Escape leaves the dialog open.
 */
export declare class TabComponent {
  /**
   * Creates the tab, which Angular does for each `nol-tab` element.
   *
   * @example
   * ```ts
   * import { Component } from "@angular/core";
   * import { TabComponent } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-readme-tab",
   *   imports: [TabComponent],
   *   template: "<nol-tab label=\"Readme\" icon=\"description\" [selected]=\"true\" />"
   * })
   * export class ReadmeTabComponent {}
   * ```
   */
  public constructor();

  /**
   * The title, which is also the start of the accessible name.
   *
   * @example
   * ```ts
   * import { Component } from "@angular/core";
   * import { TabComponent } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-note-tabs",
   *   imports: [TabComponent],
   *   template: `<div role="tablist" aria-label="Open notes">
   *     <nol-tab label="Groceries" icon="description" [selected]="active === 'groceries'" (activate)="active = 'groceries'" />
   *     <nol-tab label="Trip plan" icon="description" [selected]="active === 'trip'" [preview]="true" (activate)="active = 'trip'" (close)="closed = true" />
   *   </div>`
   * })
   * export class NoteTabsComponent {
   *   protected active: string = "groceries";
   *   protected closed: boolean = false;
   * }
   * ```
   */
  public readonly label: InputSignal<string>;

  /**
   * The glyph before the title; none when not bound.
   */
  public readonly icon: InputSignal<string | undefined>;

  /**
   * Whether the tab is the selected one, which is highlighted and in the
   * tab order; false when not bound.
   */
  public readonly selected: InputSignal<boolean>;

  /**
   * Whether the tab is a preview, which the next preview replaces; it shows
   * in italics and assistive technology describes it as a preview. False
   * when not bound.
   */
  public readonly preview: InputSignal<boolean>;

  /**
   * Whether the tab's content is busy, which shows a spinner where the
   * close button is, or before the title with
   * {@link TabComponent.leadingSpinner}, and marks the tab busy; false when
   * not bound.
   */
  public readonly working: InputSignal<boolean>;

  /**
   * Whether the tab waits for the person, for example for an approval,
   * which shows a raised hand in the spinner's place and at its size, and
   * adds "waiting for your answer" to the end of the accessible name.
   * It wins over {@link TabComponent.working}: the hand shows instead of
   * the spinner and the tab is not marked busy. As while working, the close
   * button takes the hand's place on hover and focus, and a tab that can't
   * close keeps the hand. False when not bound.
   */
  public readonly waiting: InputSignal<boolean>;

  /**
   * Whether the person can close the tab, which shows its close button;
   * true when not bound.
   */
  public readonly closable: InputSignal<boolean>;

  /**
   * What the badge means, which the accessible name includes after the
   * title and any status, marker and underline, or null for no badge; null
   * when not bound.
   */
  public readonly badge: InputSignal<string | null>;

  /**
   * The count the badge shows, or null for a dot; shown only with a
   * {@link TabComponent.badge}. Null when not bound.
   */
  public readonly badgeCount: InputSignal<number | null>;

  /**
   * The address of a small image before the title, such as a site's icon,
   * 0.875rem square with 0.1875rem corners and never stretched, in place of
   * {@link TabComponent.icon}; null when not bound. It shows once it has
   * loaded; {@link TabComponent.imageGlyph} stands in its place before then,
   * after it fails, and in forced colors.
   */
  public readonly image: InputSignal<string | null>;

  /**
   * The glyph in the image's place, such as `public`, while there is no
   * image, while it loads, after it fails to load, and in forced colors,
   * 0.875rem in the icon color; null when not bound, which shows `public`
   * for an image and nothing without one.
   */
  public readonly imageGlyph: InputSignal<string | null>;

  /**
   * A status glyph in the image's place, colored by its tone, whose
   * description the accessible name includes after the title; null when
   * not bound.
   */
  public readonly status: InputSignal<TabStatus | null>;

  /**
   * Whether a working tab shows its spinner before the title, a 0.75rem
   * ring with a 1.5px stroke centred in the icon's 1rem box, so the title
   * stays in place, in place of its image, status or icon, and keeps its
   * close button at the end, as it is when not working; false when not
   * bound, which keeps the spinner at the end. The waiting hand still wins.
   */
  public readonly leadingSpinner: InputSignal<boolean>;

  /**
   * A glyph before everything else, in the accent color, with its own
   * tooltip, whose label the accessible name includes after the status's
   * description; null
   * when not bound.
   */
  public readonly marker: InputSignal<TabMarker | null>;

  /**
   * What the accent underline means, such as "A teammate is using this
   * page": set, the tab draws a 2px accent line inside its bottom edge, in
   * the highlight color under forced colors, and the accessible name
   * includes it after the marker's label and before the badge; null when not
   * bound.
   */
  public readonly underline: InputSignal<string | null>;

  /**
   * Whether the title is being edited in place: set, the label becomes the
   * kit's text field, named "Tab title", on the label's own box, so its text
   * starts where the label's text started and the tab, its icon, badge and
   * close button keep their size and place. The field starts with the
   * current title, focused and selected; a title changed meanwhile never
   * overwrites what is typed, and the field's keys and clicks never
   * activate or close the tab. The owner sets it back to false when
   * {@link TabComponent.labelKept} or {@link TabComponent.labelCancelled}
   * emits, which restores the label and, when the field had the focus,
   * gives it back to the tab. False when not bound.
   */
  public readonly editing: InputSignal<boolean>;

  /**
   * Emits when the person activates the tab; the owner selects it.
   */
  public readonly activate: OutputEmitterRef<void>;

  /**
   * Emits when the person closes a closable tab; the owner removes it.
   */
  public readonly close: OutputEmitterRef<void>;

  /**
   * Emits the field's trimmed text, possibly empty, when the person presses
   * Enter or the field loses the focus while editing; the owner decides
   * what the text means and leaves the mode. Emits at most once per editing
   * session, and not for an Enter that ends a composition.
   *
   * @example
   * ```ts
   * import { Component, type WritableSignal, signal } from "@angular/core";
   * import { TabComponent } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-renaming-tab",
   *   imports: [TabComponent],
   *   template: `<nol-tab [label]="title()" [editing]="editing()" (dblclick)="editing.set(true)"
   *     (labelKept)="rename($event)" (labelCancelled)="editing.set(false)" />`
   * })
   * export class RenamingTabComponent {
   *   protected readonly title: WritableSignal<string> = signal("Groceries");
   *   protected readonly editing: WritableSignal<boolean> = signal(false);
   *
   *   protected rename(text: string): void {
   *     if (text !== "")
   *       this.title.set(text);
   *     this.editing.set(false);
   *   }
   * }
   * ```
   */
  public readonly labelKept: OutputEmitterRef<string>;

  /**
   * Emits when the person presses Escape while editing; the owner leaves
   * the mode and keeps the title. Emits at most once per editing session,
   * and never after {@link TabComponent.labelKept}.
   */
  public readonly labelCancelled: OutputEmitterRef<void>;
}

/**
 * A terminal's output, read-only, such as an earlier Run's frozen under its
 * block: its {@link TerminalOutputLine}s in the kit's terminal colors, the
 * terminal's monospace font and size, and the terminal pane's rows, on the
 * terminal's background, with no cursor, input or scrollback of its own. A
 * row is xterm's: the font's ascent and descent, rounded up to a device
 * pixel, times `--nol-line-terminal`, rounded down to one. Each run's text
 * is lifted to at least 4.5:1 against its background, as the terminal pane's
 * minimum contrast ratio lifts it, dim and inverse runs included; the view
 * follows the theme, the fonts and the device pixel ratio as they change. A
 * long line wraps at the view's width, and a line the terminal wrapped joins
 * the one before it and wraps again here. Past a
 * {@link TerminalOutputComponent.maxHeight}, it opens at its end and follows
 * new lines while it is there, as a log does. The text is one text, its runs
 * only spans, so a screen reader reads it whole and a selection copies it
 * with its line breaks. Under forced colors it draws in the system's
 * colors, as `terminal.css` sets the terminal tokens.
 */
export declare class TerminalOutputComponent {
  /**
   * Creates the view, which Angular does for each `nol-terminal-output`
   * element.
   *
   * @example
   * ```ts
   * import { Component } from "@angular/core";
   * import { TerminalOutputComponent, TerminalOutputLine, TerminalOutputRun } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-build-output",
   *   imports: [TerminalOutputComponent],
   *   template: "<nol-terminal-output [lines]=\"lines\" [maxHeight]=\"12\" />"
   * })
   * export class BuildOutputComponent {
   *   protected readonly lines: readonly TerminalOutputLine[] = [
   *     new TerminalOutputLine("$ npm ci"),
   *     new TerminalOutputLine("added 312 packages", false, [new TerminalOutputRun(5, 2)])
   *   ];
   * }
   * ```
   */
  public constructor();

  /**
   * The lines, in order; a line whose {@link TerminalOutputLine.wraps} is
   * true continues the one before it.
   */
  public readonly lines: InputSignal<readonly TerminalOutputLine[]>;

  /**
   * The tallest the view grows, in rem, past which it scrolls inside, open
   * at its end, and keeps its newest line in view as lines come while it is
   * scrolled to its end; null, when not bound, grows with its lines.
   */
  public readonly maxHeight: InputSignal<number | null>;
}

/**
 * The kit's text field, `input[nol-text-field]`, which styles a native input
 * and leaves its value, events and validation to it. The input needs an
 * accessible name, and `aria-invalid="true"` gives it the error border, a
 * dashed `CanvasText` border twice as wide under forced colors; a
 * {@link FieldMessageComponent} below it explains the error.
 *
 * `textarea[nol-text-field]` is the same field on several lines, such as a
 * teammate's role: the same border, corners, colors, text, focus, invalid
 * and disabled looks, the field padding on every side, at least the field
 * height, its `rows` setting how many lines it shows, and resized only up
 * and down.
 *
 * @example
 * ```ts
 * import { Component, type WritableSignal, signal } from "@angular/core";
 * import { TextFieldComponent } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-notes-search",
 *   imports: [TextFieldComponent],
 *   template: "<input nol-text-field type=\"search\" aria-label=\"Search notes\" placeholder=\"Search notes\" [value]=\"query()\" (input)=\"search($event)\" />"
 * })
 * export class NotesSearchComponent {
 *   protected readonly query: WritableSignal<string> = signal("");
 *
 *   protected search(event: Event): void {
 *     if (event.target instanceof HTMLInputElement)
 *       this.query.set(event.target.value);
 *   }
 * }
 * ```
 */
export declare class TextFieldComponent {
}

/**
 * A one-line text field with an {@link IconButtonComponent} inside it, at its
 * end, such as a folder field's Choose folder button: `nol-text-field-box`
 * holds an `input[nol-text-field]` and then the icon button, as its direct
 * children. The box takes the field's width, and the input fills it with its
 * own border, colors, focus, invalid and disabled looks; the button sits
 * inside the input's border at its end, centered on its line, its hover fill
 * as far from the field's end as from its top, and the input's text stops
 * the field padding before the button's target. The button comes
 * after the input by keyboard, and while it has keyboard focus the field
 * shows its focus border, or its focus outline under forced colors. The
 * owner names the button and disables it along with the input. In place of
 * the button, the box can hold muted text at its end, a
 * {@link TextFieldEndDirective}. With its `icon`, the box also shows a
 * decorative glyph inside the input's border at its start.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { IconButtonComponent, TextFieldBoxComponent, TextFieldComponent } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-profile-folder",
 *   imports: [IconButtonComponent, TextFieldBoxComponent, TextFieldComponent],
 *   template: `
 *     <nol-text-field-box>
 *       <input nol-text-field aria-label="Profile folder" />
 *       <button type="button" nol-icon-button icon="folder_open" label="Choose folder"></button>
 *     </nol-text-field-box>
 *   `
 * })
 * export class ProfileFolderComponent {}
 * ```
 */
export declare class TextFieldBoxComponent {
  /**
   * The Material Symbols name of a glyph the field shows inside its border at
   * its start, such as `search` for a search field; null when not bound, or
   * empty, which shows none. The glyph is 1rem, centred on the field's line
   * and the field padding from its border, in the theme's muted text color;
   * the input's text starts the theme's `space-2` step after it, and the
   * field keeps its height, border, focus look and width. Without a button or
   * end text, the text runs to the field padding at the field's end; with end
   * text, the typed text still keeps its 4rem. The glyph is decorative: it is
   * hidden from assistive technology, so the input keeps the name its owner
   * gives it, and it takes no pointer, so a click on it reaches the input.
   * It dims with a disabled input, and is `GrayText` under forced colors
   * then. In a right-to-left layout it is at the right.
   */
  public readonly icon: InputSignal<string | null>;

  /**
   * Creates the box, which Angular does for each `nol-text-field-box`
   * element; while the box holds a {@link TextFieldEndDirective} text, it
   * measures the text's width so the input's text stops before it.
   *
   * @example
   * ```ts
   * import { Component } from "@angular/core";
   * import { TextFieldBoxComponent, TextFieldComponent, TextFieldEndDirective } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-provider-name",
   *   imports: [TextFieldBoxComponent, TextFieldComponent, TextFieldEndDirective],
   *   template: `
   *     <nol-text-field-box>
   *       <input nol-text-field aria-label="Provider name" aria-describedby="provider-name-shown" />
   *       <span id="provider-name-shown" nolTextFieldEnd>Shown as Work</span>
   *     </nol-text-field-box>
   *   `
   * })
   * export class ProviderNameComponent {}
   * ```
   */
  public constructor();
}

/**
 * Muted text inside a one-line text field at its end, in place of a button,
 * such as a name field's `Shown as "Work · Agent"`: `nol-text-field-box`
 * holds an `input[nol-text-field]` and then the element marked
 * `nolTextFieldEnd`, as its direct children. The text ends the field padding
 * before the input's border, and the input's text stops the theme's
 * `space-2` step before it. Past the point where the typed text would have
 * less than 4rem, the text is
 * cut with an ellipsis, with no tooltip, so an owner whose end text can grow
 * long keeps the full text visible elsewhere. The owner gives the text an id
 * and names it in the input's `aria-describedby`, so it is read as the
 * field's description; the text takes no pointer, so a click reaches the
 * input.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { TextFieldBoxComponent, TextFieldComponent, TextFieldEndDirective } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-provider-name",
 *   imports: [TextFieldBoxComponent, TextFieldComponent, TextFieldEndDirective],
 *   template: `
 *     <nol-text-field-box>
 *       <input nol-text-field aria-label="Provider name" aria-describedby="provider-name-shown" />
 *       <span id="provider-name-shown" nolTextFieldEnd>Shown as "Work · Agent"</span>
 *     </nol-text-field-box>
 *   `
 * })
 * export class ProviderNameComponent {}
 * ```
 */
export declare class TextFieldEndDirective {
}

/**
 * A glyph a {@link TabComponent} shows first, before its image, in the
 * accent color, such as `subdirectory_arrow_right` for a page opened from
 * another, with its own tooltip.
 */
export declare class TabMarker {
  /**
   * The glyph's name in the kit's icon font.
   */
  public readonly glyph: string;

  /**
   * The tooltip, such as "Opened from Plans and pricing", which the tab's
   * accessible name includes after the status's description.
   */
  public readonly label: string;

  /**
   * Creates the marker.
   *
   * @param glyph The glyph's name.
   * @param label The tooltip and the accessible name's part.
   * @example
   * ```ts
   * import { TabMarker } from "@noldova/ui.components.angular";
   *
   * export const opened: TabMarker = new TabMarker("subdirectory_arrow_right", "Opened from Plans and pricing");
   * ```
   */
  public constructor(glyph: string, label: string);
}

/**
 * A glyph a {@link TabComponent} shows before its label in place of its
 * image, such as `error` for a page that can't be reached, and what it means.
 */
export declare class TabStatus {
  /**
   * The glyph's name in the kit's icon font.
   */
  public readonly glyph: string;

  /**
   * What the glyph means, such as "Can't reach this page", which the tab's
   * accessible name includes after the title.
   */
  public readonly description: string;

  /**
   * The glyph's color; the tab's text color in forced colors.
   */
  public readonly tone: TabTone;

  /**
   * Creates the status.
   *
   * @param glyph The glyph's name.
   * @param description What it means.
   * @param tone Its color; {@link TabTone.Neutral} when left out.
   * @example
   * ```ts
   * import { TabStatus, TabTone } from "@noldova/ui.components.angular";
   *
   * export const unreachable: TabStatus = new TabStatus("error", "Can't reach this page", TabTone.Failed);
   * ```
   */
  public constructor(glyph: string, description: string, tone?: TabTone);
}

/**
 * A line of a terminal's output for a {@link TerminalOutputComponent}: its
 * text, whether it continues the line before, and its runs. The kit defines
 * this model itself; an app maps its terminal's lines onto it.
 */
export declare class TerminalOutputLine {
  /**
   * The line's text, without a line break.
   */
  public readonly text: string;

  /**
   * Whether the line continues the one before it, as a line a terminal
   * wrapped at its width does: the view joins the two with no line break.
   */
  public readonly wraps: boolean;

  /**
   * The text's runs, from its start, each covering the next
   * {@link TerminalOutputRun.length} characters; text past the last run
   * draws in the terminal's default look.
   */
  public readonly runs: readonly TerminalOutputRun[];

  /**
   * Creates the line.
   *
   * @param text The line's text.
   * @param wraps Whether it continues the line before; false when left out.
   * @param runs Its runs, from the text's start; none when left out, so
   * the whole line draws in the default look.
   * @throws ArgumentOutOfRangeException when the runs cover more characters
   * than the text has.
   * @example
   * ```ts
   * import { TerminalOutputLine, TerminalOutputRun, TerminalOutputStyle } from "@noldova/ui.components.angular";
   *
   * export const failed: TerminalOutputLine = new TerminalOutputLine("FAIL  parser.spec.ts", false,
   *   [new TerminalOutputRun(4, 1, TerminalOutputRun.defaultColor, TerminalOutputStyle.Bold)]);
   * ```
   */
  public constructor(text: string, wraps?: boolean, runs?: readonly TerminalOutputRun[]);
}

/**
 * A run of a {@link TerminalOutputLine}'s text in one look: its length, its
 * foreground and background, and its {@link TerminalOutputStyle} flags. A
 * color is {@link TerminalOutputRun.defaultColor} for the terminal's
 * default; a palette index from `0` to `255`, where `0` to `15` are the
 * kit's ANSI tokens, `16` to `231` xterm's 6 × 6 × 6 color cube and `232`
 * to `255` its grays; or an RGB color from {@link TerminalOutputRun.rgb}.
 * These are a terminal's own numbers, so an app maps a terminal's colors
 * onto them as they are.
 */
export declare class TerminalOutputRun {
  /**
   * The color that stands for the terminal's default foreground or
   * background, `-1`.
   */
  public static readonly defaultColor: number;

  /**
   * The offset of an RGB color, `16777216` (`0x1000000`): the color
   * `rgbOffset + 0xRRGGBB` is that RGB color.
   */
  public static readonly rgbOffset: number;

  /**
   * The number of characters the run covers, from 1.
   */
  public readonly length: number;

  /**
   * The text's color.
   */
  public readonly foreground: number;

  /**
   * The color behind the text.
   */
  public readonly background: number;

  /**
   * The run's {@link TerminalOutputStyle} flags, added up; `0` for none.
   */
  public readonly style: number;

  /**
   * Creates the run.
   *
   * @param length The number of characters it covers, from 1.
   * @param foreground The text's color; the default when left out.
   * @param background The color behind the text; the default when left out.
   * @param style Its {@link TerminalOutputStyle} flags, added up; none when
   * left out.
   * @throws ArgumentOutOfRangeException when the length isn't a whole number
   * from 1, a color is neither the default, a palette index nor an RGB
   * color, or the style has a bit that is no flag.
   * @example
   * ```ts
   * import { TerminalOutputRun, TerminalOutputStyle } from "@noldova/ui.components.angular";
   *
   * export const warning: TerminalOutputRun = new TerminalOutputRun(7, 214, TerminalOutputRun.defaultColor, TerminalOutputStyle.Underline);
   * ```
   */
  public constructor(length: number, foreground?: number, background?: number, style?: number);

  /**
   * Gives the RGB color for a run.
   *
   * @param red The red channel, from 0 to 255.
   * @param green The green channel, from 0 to 255.
   * @param blue The blue channel, from 0 to 255.
   * @returns `rgbOffset + 0xRRGGBB`.
   * @throws ArgumentOutOfRangeException when a channel isn't a whole number
   * from 0 to 255.
   * @example
   * ```ts
   * import { TerminalOutputRun } from "@noldova/ui.components.angular";
   *
   * export const orange: TerminalOutputRun = new TerminalOutputRun(6, TerminalOutputRun.rgb(255, 136, 0));
   * ```
   */
  public static rgb(red: number, green: number, blue: number): number;
}

/**
 * Reveals a growing text a little at a time, as the kit's streamed
 * Markdown does, so an app's own streamed text, such as an agent's thought,
 * looks the same. It counts in whatever unit the app gives, graphemes from
 * a {@link GraphemeText} for text. It shows a share of what is still
 * hidden, so that it would catch up within about 250 ms while the text
 * grows and 60 ms once it has ended, and never fewer than 40 a second.
 * While the text grows, it shows that share in bursts at least 48 ms apart,
 * every third frame at 60 Hz, and the frames between change nothing, since
 * each change lays its text out again; once the text has ended, every
 * animation frame shows its share. It never shows more than has arrived,
 * and runs no frames once it has caught up.
 */
export declare class TextReveal {
  /**
   * Creates the reveal.
   *
   * @param initial How much it shows at first: 0 to reveal a text from
   * nothing, or the text's count to show what it has at once.
   * @param changed Called with the new {@link TextReveal.count} on each
   * frame that changes it.
   * @example
   * ```ts
   * import { type Signal, type WritableSignal, computed, signal } from "@angular/core";
   * import { GraphemeText, TextReveal } from "@noldova/ui.components.angular";
   *
   * export class ThoughtTitle {
   *   private readonly text: WritableSignal<GraphemeText> = signal(new GraphemeText(""));
   *   private readonly shownCount: WritableSignal<number> = signal(0);
   *   private readonly reveal: TextReveal = new TextReveal(0, t => this.shownCount.set(t));
   *   public readonly shown: Signal<string> = computed(() => this.text().prefix(this.shownCount()));
   *
   *   public grow(text: string, isEnded: boolean): void {
   *     this.text.set(new GraphemeText(text));
   *     this.reveal.follow(this.text().count, isEnded, true);
   *   }
   * }
   * ```
   */
  public constructor(initial: number, changed: (count: number) => void);

  /**
   * How much it shows now, a whole number.
   */
  public get count(): number;

  /**
   * Tells it how much has arrived, and starts its frames when there is more
   * to show.
   *
   * @param available How much has arrived. Less than it shows makes it show
   * that at once.
   * @param isEnded Whether the text has stopped growing, which makes it
   * catch up faster.
   * @param animate Whether to reveal a little at a time, in bursts about
   * 50 ms apart while the text grows and every frame once it has ended;
   * false shows what has arrived at once, such as when reduced motion is preferred.
   * @example
   * ```ts
   * import { TextReveal } from "@noldova/ui.components.angular";
   *
   * export function end(reveal: TextReveal, count: number): void {
   *   reveal.follow(count, true, !matchMedia("(prefers-reduced-motion: reduce)").matches);
   * }
   * ```
   */
  public follow(available: number, isEnded: boolean, animate: boolean): void;

  /**
   * Cancels its next frame, so it changes nothing more until it is told
   * again; then it goes on a little at a time from what it shows, in
   * bursts while the text grows and every frame once it has ended, however
   * long it was disposed.
   *
   * @example
   * ```ts
   * import { DestroyRef, inject } from "@angular/core";
   * import { TextReveal } from "@noldova/ui.components.angular";
   *
   * export function revealUntilDestroyed(changed: (count: number) => void): TextReveal {
   *   const reveal = new TextReveal(0, changed);
   *   inject(DestroyRef).onDestroy(() => reveal.dispose());
   *   return reveal;
   * }
   * ```
   */
  public dispose(): void;
}

/**
 * A theme: the colors of its light and dark modes, its look values and the
 * shapes of its controls, which {@link AppearanceService.setTheme} paints on
 * the document's root. A value the theme leaves out, and a shape the kit
 * does not offer, comes from {@link DefaultTheme}.
 *
 * Every key is the name of the CSS custom property it paints without
 * `--nol-`: the color key `panel` paints `--nol-panel`, and the look key
 * `radius-small` paints `--nol-radius-small`. Keys have no other prefix and
 * no aliases, and no key is both a color key and a look key.
 */
export declare class Theme {
  /**
   * The theme's id, such as `noldova.default`.
   */
  public readonly id: string;

  /**
   * The name shown to the person.
   */
  public readonly name: string;

  /**
   * Creates the theme. It keeps the maps it is given rather than copying
   * them.
   *
   * @param id The theme's id.
   * @param name The name shown to the person.
   * @param lightColors The light mode's colors by theme color key, such as
   * `panel` to `#FFFFFF`.
   * @param darkColors The dark mode's colors by theme color key.
   * @param lookValues The look values by name, such as `radius-small` to
   * `0.25rem`; each is painted as the CSS custom property `--nol-<name>`.
   * @param shapes The shape of each control that offers several, such as
   * `tab` to `pill`; each is set as the root's `data-nol-<control>-shape`
   * attribute.
   * @example
   * ```ts
   * import { Theme } from "@noldova/ui.components.angular";
   *
   * export const contrast: Theme = new Theme("notes.contrast", "High contrast",
   *   new Map([["panel", "#FFFFFF"], ["text", "#000000"]]),
   *   new Map([["panel", "#000000"], ["text", "#FFFFFF"]]),
   *   new Map([["radius-small", "0"], ["radius-large", "0"]]),
   *   new Map([["tab", "pill"]]));
   * ```
   */
  public constructor(
    id: string,
    name: string,
    lightColors: ReadonlyMap<string, string>,
    darkColors: ReadonlyMap<string, string>,
    lookValues: ReadonlyMap<string, string>,
    shapes: ReadonlyMap<string, string>);

  /**
   * Reads a color of one of the theme's modes.
   *
   * @param mode The mode whose colors are read.
   * @param key The theme color key, such as `panel`.
   * @returns The color, or undefined when the mode has none for the key.
   * @example
   * ```ts
   * import { DefaultTheme, ThemeMode } from "@noldova/ui.components.angular";
   *
   * export const background: string | undefined = DefaultTheme.theme.readColor(ThemeMode.Light, "panel");
   * ```
   */
  public readColor(mode: ThemeMode, key: string): string | undefined;

  /**
   * Reads one of the theme's look values.
   *
   * @param name The look value's name, such as `radius-small`.
   * @returns The CSS value, or undefined when the theme has none.
   * @example
   * ```ts
   * import { DefaultTheme } from "@noldova/ui.components.angular";
   *
   * export const radius: string | undefined = DefaultTheme.theme.readLook("radius-small");
   * ```
   */
  public readLook(name: string): string | undefined;

  /**
   * Reads the shape the theme gives a control.
   *
   * @param control The control, such as `tab`.
   * @returns The shape, or undefined when the theme gives none.
   * @example
   * ```ts
   * import { DefaultTheme } from "@noldova/ui.components.angular";
   *
   * export const tabShape: string | undefined = DefaultTheme.theme.readShape("tab");
   * ```
   */
  public readShape(control: string): string | undefined;
}

/**
 * The exception thrown when a theme cannot be painted because neither it nor
 * the painter's default theme has a value the kit paints: a color, a look
 * value or a shape. {@link ThemePainter.paint} throws it.
 */
export declare class ThemeException extends UiComponentsException {
  /**
   * The exception's name, `"ThemeException"`, which the class sets itself so
   * that a minified build keeps it.
   */
  public override readonly name: string;

  /**
   * Creates the exception.
   *
   * @param message A sentence naming the theme and the missing value.
   * @example
   * ```ts
   * import { ThemeException } from "@noldova/ui.components.angular";
   *
   * export function requireLook(theme: string, name: string, value: string | undefined): string {
   *   if (value === undefined)
   *     throw new ThemeException(`The theme "${theme}" has no value for "${name}".`);
   *   return value;
   * }
   * ```
   */
  public constructor(message: string);
}

/**
 * Paints a theme on an element as CSS custom properties, the
 * `color-scheme` and shape attributes, which the element's subtree
 * inherits. Values the theme lacks come from a default theme.
 */
export declare class ThemePainter {
  /**
   * Creates the painter.
   *
   * @param defaultTheme The theme that supplies the values a painted theme
   * lacks, usually {@link DefaultTheme.theme}, which has them all.
   * @example
   * ```ts
   * import { DefaultTheme, ThemePainter } from "@noldova/ui.components.angular";
   *
   * export const painter: ThemePainter = new ThemePainter(DefaultTheme.theme);
   * ```
   */
  public constructor(defaultTheme: Theme);

  /**
   * Paints a theme's colors for a mode, its looks and its shapes on an
   * element, replacing what was painted there before. A shape the kit does
   * not offer for its control counts as missing.
   *
   * @param element The element, such as the document's root or a preview.
   * @param theme The theme.
   * @param mode The mode whose colors are painted.
   * @throws ThemeException synchronously when neither the theme nor the
   * default theme has a value the kit paints; what was painted before it
   * stays.
   * @example
   * ```ts
   * import { DefaultTheme, type Theme, ThemeMode, ThemePainter } from "@noldova/ui.components.angular";
   *
   * const painter: ThemePainter = new ThemePainter(DefaultTheme.theme);
   *
   * export function paintPreview(element: HTMLElement, theme: Theme, isDark: boolean): void {
   *   painter.paint(element, theme, isDark ? ThemeMode.Dark : ThemeMode.Light);
   * }
   * ```
   */
  public paint(element: HTMLElement, theme: Theme, mode: ThemeMode): void;

  /**
   * Removes everything a painter paints from an element, so it inherits its
   * parent's theme again.
   *
   * @param element The element.
   * @example
   * ```ts
   * import { DestroyRef, Directive, ElementRef, effect, inject, input } from "@angular/core";
   * import { DefaultTheme, type Theme, ThemeMode, ThemePainter } from "@noldova/ui.components.angular";
   *
   * @Directive({ selector: "[nolThemePreview]" })
   * export class ThemePreviewDirective {
   *   private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
   *   private readonly painter: ThemePainter = new ThemePainter(DefaultTheme.theme);
   *
   *   public readonly theme = input.required<Theme>({ alias: "nolThemePreview" });
   *
   *   public constructor() {
   *     effect(() => this.painter.paint(this.host, this.theme(), ThemeMode.Dark));
   *     inject(DestroyRef).onDestroy(() => this.painter.erase(this.host));
   *   }
   * }
   * ```
   */
  public erase(element: HTMLElement): void;
}

/**
 * The app's own ways to write a time, which {@link provideTimeFormats} gives
 * the kit: a {@link MessageComponent}'s time of day and its tooltip, and a
 * {@link PermissionCardComponent}'s decided time. A null way leaves that time
 * as the kit writes it.
 */
export declare class TimeFormats {
  /**
   * The kit's own ways for every time, as when no formats are provided.
   */
  public static readonly none: TimeFormats;

  /**
   * Writes the time of day: a message's time with
   * {@link MessageTimeFormat.Clock}, and a permission card's decided time
   * when it was today. Null for the kit's own, in the app's `LOCALE_ID`,
   * and for a message's time on a 24-hour clock with
   * {@link MessageComponent.twentyFourHour}.
   */
  public readonly clock: ((time: Date) => string) | null;

  /**
   * Writes the date with the time of day: a message's time tooltip and the
   * name its feed article takes, and a permission card's decided time on an
   * earlier day. Null for the kit's own, in the app's `LOCALE_ID`, and for
   * a message's time on a 24-hour clock with
   * {@link MessageComponent.twentyFourHour}.
   */
  public readonly full: ((time: Date) => string) | null;

  /**
   * Creates the formats.
   *
   * @param clock Writes the time of day; null, when not given, for the
   * kit's own.
   * @param full Writes the date with the time of day; null, when not given,
   * for the kit's own.
   * @example
   * ```ts
   * import { TimeFormats } from "@noldova/ui.components.angular";
   *
   * const clock: Intl.DateTimeFormat = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });
   *
   * export const formats: TimeFormats = new TimeFormats(t => clock.format(t), t => `${t.toLocaleDateString("en-GB")}, ${clock.format(t)}`);
   * ```
   */
  public constructor(clock?: ((time: Date) => string) | null, full?: ((time: Date) => string) | null);
}

/**
 * Gives the kit the app's own ways to write a time, so every
 * {@link MessageComponent} and {@link PermissionCardComponent} writes its
 * times as the app's other panels do. The function runs once, in the
 * environment injector's injection context, and returns a signal of the
 * formats, such as one read from the app's settings: a new value redraws
 * every message and card already shown. Without these providers, or with a
 * null way in the formats, each time is written as the kit writes it, in
 * the app's `LOCALE_ID`, and a message's on a 24-hour clock with
 * {@link MessageComponent.twentyFourHour}. A message's relative time, such
 * as 2 minutes ago, is always the kit's own.
 *
 * @param formats Returns the signal of the app's formats, called in an
 * injection context.
 * @returns The providers of the app's time formats, for
 * `bootstrapApplication` or another environment injector.
 * @example
 * ```ts
 * import { type ApplicationConfig, Injectable, type Signal, computed, inject, signal } from "@angular/core";
 * import { TimeFormats, provideTimeFormats } from "@noldova/ui.components.angular";
 *
 * @Injectable({ providedIn: "root" })
 * export class Settings {
 *   public readonly twentyFourHour = signal(true);
 * }
 *
 * function formatsOf(isTwentyFourHour: boolean): TimeFormats {
 *   const clock = new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "2-digit", hour12: !isTwentyFourHour });
 *   const full = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", hour12: !isTwentyFourHour });
 *   return new TimeFormats(t => clock.format(t), t => full.format(t));
 * }
 *
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideTimeFormats((): Signal<TimeFormats> => {
 *       const settings = inject(Settings);
 *       return computed(() => formatsOf(settings.twentyFourHour()));
 *     })
 *   ]
 * };
 * ```
 */
export declare function provideTimeFormats(formats: () => Signal<TimeFormats>): EnvironmentProviders;

/**
 * A run of a quick-input row's text whose characters either all match the
 * query or all do not. {@link QuickInputItem.segments} and
 * {@link QuickInputItem.detailSegments} split a text into such runs, so the
 * matched ones can be emphasized.
 */
export declare class TitleSegment {
  /**
   * The run's text.
   */
  public readonly text: string;

  /**
   * Whether its characters match the query.
   */
  public readonly isMatch: boolean;

  /**
   * Creates the segment.
   *
   * @param text The run's text.
   * @param isMatch Whether its characters match the query.
   * @example
   * ```ts
   * import { TitleSegment } from "@noldova/ui.components.angular";
   *
   * export const segments: readonly TitleSegment[] = [new TitleSegment("New", true), new TitleSegment(" note", false)];
   * ```
   */
  public constructor(text: string, isMatch: boolean);
}

/**
 * A toolbar button, `button[nol-toolbar-button]`: a glyph, a label or both,
 * with an optional menu chevron. It sets the button's accessible name and
 * state; the owner adds `type`, `nolToolbarItem` and its click handler.
 */
export declare class ToolbarButtonComponent {
  /**
   * Creates the button, which Angular does for each `nol-toolbar-button` element,
   * and starts ignoring its clicks and activation keys while it is busy.
   *
   * @example
   * ```ts
   * import { Component, type WritableSignal, signal } from "@angular/core";
   * import { ToolbarButtonComponent } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-sync-action",
   *   imports: [ToolbarButtonComponent],
   *   template: "<button type=\"button\" nol-toolbar-button icon=\"sync\" label=\"Sync\" [busy]=\"isSaving()\"></button>"
   * })
   * export class SyncActionComponent {
   *   protected readonly isSaving: WritableSignal<boolean> = signal(false);
   * }
   * ```
   */
  public constructor();

  /**
   * The accessible name, which the button also shows as text when it has
   * no icon or shows its label.
   *
   * @example
   * ```ts
   * import { Component } from "@angular/core";
   * import { ToolbarButtonComponent, ToolbarDirective, ToolbarItemDirective } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-note-actions",
   *   imports: [ToolbarButtonComponent, ToolbarDirective, ToolbarItemDirective],
   *   template: `<div nolToolbar nolToolbarLabel="Note actions">
   *     <button type="button" nol-toolbar-button nolToolbarItem label="New note" icon="add" (click)="count = count + 1"></button>
   *     <button type="button" nol-toolbar-button nolToolbarItem label="Wrap lines" icon="wrap_text" [pressed]="isWrapped" (click)="isWrapped = !isWrapped"></button>
   *     <button type="button" nol-toolbar-button nolToolbarItem label="Share" icon="share" [isShowingLabel]="true" [isUnavailable]="count === 0"></button>
   *   </div>`
   * })
   * export class NoteActionsComponent {
   *   protected count: number = 0;
   *   protected isWrapped: boolean = false;
   * }
   * ```
   */
  public readonly label: InputSignal<string>;

  /**
   * The glyph, or null for a text button; null when not bound.
   */
  public readonly icon: InputSignal<string | null>;

  /**
   * Whether a button with an icon also shows its label; false when not
   * bound.
   */
  public readonly isShowingLabel: InputSignal<boolean>;

  /**
   * Whether a toggle button is pressed, or undefined for a button that is
   * no toggle; undefined when not bound.
   */
  public readonly pressed: InputSignal<boolean | undefined>;

  /**
   * Whether the button opens a menu, which shows a chevron and tells
   * assistive technology; false when not bound.
   */
  public readonly hasMenu: InputSignal<boolean>;

  /**
   * Whether the button is unavailable: it looks and is announced disabled
   * but stays focusable and still receives clicks, which its owner ignores.
   * False when not bound.
   */
  public readonly isUnavailable: InputSignal<boolean>;

  /**
   * Whether a button that opens a menu draws its pressed look, the toolbar
   * hover fill or under forced colors `Highlight`, while its menu is open,
   * which the menu trigger marks `aria-expanded`, and its idle look once the
   * menu closes; it isn't announced pressed. It needs no {@link hasMenu}, so
   * an icon-only button, such as a toolbar's More, is pressed while open
   * with no chevron, keeping its square. Without it, the button looks idle
   * while its menu is open. False when not bound.
   */
  public readonly isPressedWhileOpen: InputSignal<boolean>;

  /**
   * Whether the button's work is under way: the kit's spinner, in the
   * glyph's color, stands centered in place of its glyph, label and chevron,
   * which stay in the layout unseen, so the button keeps its width and
   * height exactly; under forced colors the spinner keeps its own look, a
   * `Highlight` arc on a `Canvas` track. It is marked `aria-busy`, and ignores clicks, middle clicks,
   * Enter and Space, and, when it opens a menu, the up and down arrows, so
   * neither its own handlers nor its parents hear them. False when not
   * bound.
   */
  public readonly busy: InputSignal<boolean>;
}

/**
 * Makes its element a toolbar, `nolToolbar`, whose {@link ToolbarItemDirective}
 * items form one tab stop. The arrow keys along its orientation, Home and
 * End move focus between the items, left to right in a horizontal toolbar;
 * the tab stop follows focus and starts at the item
 * {@link ToolbarDirective.start} names.
 */
export declare class ToolbarDirective {
  /**
   * The direction the items run, `nolToolbarOrientation`; horizontal when
   * not bound.
   */
  public readonly orientation: InputSignal<ToolbarOrientation>;

  /**
   * The accessible name, `nolToolbarLabel`, or null for none; null when not
   * bound.
   */
  public readonly label: InputSignal<string | null>;

  /**
   * Whether moving past the last item reaches the first and the other way
   * round, `nolToolbarWrap`; false when not bound.
   */
  public readonly isWrapping: InputSignal<boolean>;

  /**
   * The index of the item that is the tab stop until focus moves,
   * `nolToolbarStart`, such as an action's default choice; the first item
   * when not bound or when no item has the index.
   */
  public readonly start: InputSignal<number>;

  /**
   * Items the toolbar moves through before its own, `nolToolbarItems`, for
   * items declared outside the toolbar's template, such as an app's actions
   * that a component projects into its toolbar; none when not bound.
   */
  public readonly addedItems: InputSignal<readonly ToolbarItemDirective[]>;

  /**
   * Creates the directive, which Angular does for each element that uses
   * `nolToolbar`.
   *
   * @example
   * ```ts
   * import { Component } from "@angular/core";
   * import { IconButtonComponent, ToolbarDirective, ToolbarItemDirective, ToolbarOrientation } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-note-rail",
   *   imports: [IconButtonComponent, ToolbarDirective, ToolbarItemDirective],
   *   template: `<nav nolToolbar nolToolbarLabel="Note views" [nolToolbarOrientation]="orientations.Vertical" [nolToolbarWrap]="true">
   *     <button type="button" nol-icon-button nolToolbarItem icon="description" label="Notes"></button>
   *     <button type="button" nol-icon-button nolToolbarItem icon="label" label="Tags"></button>
   *   </nav>`
   * })
   * export class NoteRailComponent {
   *   protected readonly orientations: typeof ToolbarOrientation = ToolbarOrientation;
   * }
   * ```
   */
  public constructor();
}

/**
 * Marks an element as an item of the enclosing {@link ToolbarDirective},
 * `nolToolbarItem`, at any depth inside it. The toolbar makes one item the
 * tab stop and moves focus between items with the arrow keys.
 */
export declare class ToolbarItemDirective {
  /**
   * The element the directive is on.
   */
  public readonly element: HTMLElement;

  /**
   * Makes the item the tab stop or takes it out of the tab order. The
   * toolbar calls it whenever its items or its current item change.
   *
   * @param isTabStop True for the tab stop, whose `tabindex` becomes 0;
   * false for -1.
   * @example
   * ```ts
   * import type { ToolbarItemDirective } from "@noldova/ui.components.angular";
   *
   * export function makeTabStop(items: readonly ToolbarItemDirective[], stop: ToolbarItemDirective): void {
   *   for (const item of items)
   *     item.setTabStop(item === stop);
   * }
   * ```
   */
  public setTabStop(isTabStop: boolean): void;

  /**
   * Moves focus to the element.
   *
   * @example
   * ```ts
   * import type { ToolbarItemDirective } from "@noldova/ui.components.angular";
   *
   * export function focusFirst(items: readonly ToolbarItemDirective[]): void {
   *   items[0]?.focus();
   * }
   * ```
   */
  public focus(): void;
}

/**
 * One call an agent made to a tool, with the calls it made in turn, which a
 * {@link ToolCallComponent} shows. Calls never change; a call that moves on,
 * such as one that streams more output or ends, is a new call of the same id.
 */
export declare class ToolCall {
  /**
   * The call's id, unique among the calls of its tree; the card keeps its
   * views and its end announcement by it.
   */
  public readonly id: string;

  /**
   * What the call does, in a few words, such as Read main.ts; the card's
   * toggle is named by it.
   */
  public readonly title: string;

  /**
   * What kind of work the call does.
   */
  public readonly kind: ToolCallKind;

  /**
   * Where the call stands.
   */
  public readonly status: ToolCallStatus;

  /**
   * The file, address or command the call acts on, or null for none.
   */
  public readonly target: string | null;

  /**
   * The short note the card shows after the title, muted, or null for none.
   */
  public readonly note: string | null;

  /**
   * When the call started, or null when unknown.
   */
  public readonly startedAt: Date | null;

  /**
   * When the call ended, or null while it hasn't or when unknown.
   */
  public readonly endedAt: Date | null;

  /**
   * What the call was given, or null for nothing to show.
   */
  public readonly input: ToolCallInput | null;

  /**
   * What the call gave back so far, or null when the call doesn't hold it.
   */
  public readonly output: string | null;

  /**
   * Where output the call doesn't hold stands; Idle by default.
   */
  public readonly outputState: ToolCallOutputState;

  /**
   * Whether the card shows the output with the owner's
   * {@link ToolCallOutputDirective} template; false by default.
   */
  public readonly hasOutputControl: boolean;

  /**
   * The error a failed call reports, or null for none.
   */
  public readonly error: string | null;

  /**
   * Whether the person can cancel the call while it runs; false by default.
   */
  public readonly canCancel: boolean;

  /**
   * The calls this call made, in order.
   */
  public readonly children: readonly ToolCall[];

  /**
   * Creates the call, keeping copies of its dates and of its list of
   * children.
   *
   * @param id The call's id. Not blank.
   * @param title What the call does, in a few words. Not blank.
   * @param kind What kind of work it does.
   * @param status Where it stands.
   * @param options Its optional parts; none when left out.
   * @throws ArgumentException when the id, the title, a given target or a
   * given note is blank, when an end time is given without a start time or comes before
   * it, or when the call or any of its descendants shares an id with
   * another of them.
   * @example
   * ```ts
   * import { ToolCall, ToolCallInput, ToolCallKind, ToolCallStatus } from "@noldova/ui.components.angular";
   *
   * export const running: ToolCall = new ToolCall("call-7", "Run the tests", ToolCallKind.RunCommand, ToolCallStatus.Running, {
   *   input: ToolCallInput.fromCode("npm test", "bash"),
   *   startedAt: new Date(),
   *   output: "Running 42 tests\n",
   *   canCancel: true
   * });
   * ```
   */
  public constructor(id: string, title: string, kind: ToolCallKind, status: ToolCallStatus, options?: IToolCallOptions);

  /**
   * Whether the call ended: it succeeded, failed, was cancelled or was denied.
   */
  public get hasEnded(): boolean;

  /**
   * Whether the card shows Cancel: the call can be cancelled and is running.
   */
  public get isCancellable(): boolean;

  /**
   * The milliseconds from the start to the end, or null without both.
   */
  public get duration(): number | null;
}

/**
 * A tool call's card, `nol-tool-call`, which an agent's message shows at the
 * width of its body. The header's toggle, named by the call's title, opens
 * and closes the body; beside it are the kind's icon, the target, a button
 * of its own cut in the middle so the end of a path stays in view, then the
 * status, the time taken, which counts up each second while the call runs,
 * and, while closed, how many calls it made, then Cancel while the call can
 * be cancelled. A failed call opens by default. In a narrow panel, down to
 * `--nol-dock-min-size`, the header gives way rather than scroll: the
 * target, then the title down to 3rem, then the time taken and the other
 * counts, then the status text, then the kind's icon, then the rest of the
 * title; the twistie, the status icon and Cancel stay. A nested call that
 * would have too little room even then stops indenting and shows its depth.
 *
 * The body shows the error, the input, as fields or as a code block, the
 * output and the calls this call made. Output shows its first
 * {@link ToolCallComponent.outputLines} lines, then a Show all button, and
 * then scrolls inside the card, following its end while the call runs unless
 * the person scrolls up. Copy input and Copy output copy the full text
 * through the {@link ClipboardWriter} the window provides, with the kit's
 * Copy feedback. Nested calls are cards of their own, indented up to depth
 * 3 and labeled with their depth below it, shown
 * {@link ToolCallComponent.childrenStep} at a time.
 *
 * When a call the card saw unfinished ends, the card announces it once,
 * politely, through the {@link Announcer}, as the title and the status. Up,
 * Down, Page Up and Page Down stay inside the focused output, and Escape
 * passes out of the card.
 */
export declare class ToolCallComponent {
  /**
   * The call the card shows.
   */
  public readonly call: InputSignal<ToolCall>;

  /**
   * Which of the tree's calls are open, how many nested calls each shows and
   * whose output shows all its lines, for the card and every card nested in
   * it; the card updates it as the person opens, closes and shows more, and
   * the owner keeps it, so a card drawn again, such as a row a virtual list
   * scrolls back into view, looks as it did. Empty by default.
   */
  public readonly views: ModelSignal<ToolCallViews>;

  /**
   * How many lines of output show before the Show all button; 10 when not
   * bound.
   */
  public readonly outputLines: InputSignal<number>;

  /**
   * How many nested calls show at first and how many more each Show more
   * adds; 20 when not bound.
   */
  public readonly childrenStep: InputSignal<number>;

  /**
   * The side the title's tooltip prefers, for the card and every card nested
   * in it, or null to show no tooltip; above when not bound. The tooltip
   * shows the full title only while the title is cut. Above or below, it
   * stands a gap from the toggle, over or under the rows around the card;
   * at the start or the end, it stands beside the header's row, clear of its
   * edges, as for steps in a list whose rows it shouldn't cover. Without room
   * on the side asked, it takes the other side of the row; without room on
   * either, it stands a gap below the toggle, over the rows after it, or
   * else above it;
   * a caller whose rows must stay uncovered then binds null.
   */
  public readonly titleTooltip: InputSignal<OverlaySide | null>;

  /**
   * The word on Cancel, for the card and every card nested in it, such as
   * Stop for a call that stops rather than undoes; its tooltip, and with the
   * title after it, its accessible name; Cancel when not bound.
   */
  public readonly cancelLabel: InputSignal<string>;

  /**
   * By call id, the title a card's title shows in place of its call's own,
   * measured as the title; nested cards take the same map, and a call with no
   * entry shows its own title. The title's tooltip, Cancel's name, the nested
   * calls' group name and the end's announcement keep the call's own title.
   * Empty when not bound.
   */
  public readonly shownTitles: InputSignal<ReadonlyMap<string, string>>;

  /**
   * Emits the call, this card's or a nested one's, whose Cancel the person
   * pressed; the owner cancels it and binds the call that results.
   */
  public readonly cancel: OutputEmitterRef<ToolCall>;

  /**
   * Emits the call, this card's or a nested one's, whose target the person
   * chose to open.
   */
  public readonly openTarget: OutputEmitterRef<ToolCall>;

  /**
   * Emits the call, this card's or a nested one's, whose output the card
   * needs: when a card whose call has no output and an Idle output state
   * first shows open, by default as a failed call does or from the views it
   * is given, or when the person opens it; and when they press Retry after
   * the output failed to load. The owner loads it, binding a call that is
   * Loading, and then one with the output or a Failed state.
   */
  public readonly outputRequest: OutputEmitterRef<ToolCall>;

  /**
   * Creates the card, which Angular does for each `nol-tool-call` element.
   *
   * @example
   * ```ts
   * import { Component, type WritableSignal, signal } from "@angular/core";
   * import { ToolCall, ToolCallComponent, ToolCallKind, ToolCallStatus, ToolCallViews } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-read-step",
   *   imports: [ToolCallComponent],
   *   template: "<nol-tool-call [call]=\"call\" [(views)]=\"views\" (openTarget)=\"open($event)\" />"
   * })
   * export class ReadStepComponent {
   *   protected readonly call: ToolCall = new ToolCall("call-1", "Read main.ts", ToolCallKind.Read, ToolCallStatus.Succeeded, {
   *     target: "src/app/main.ts",
   *     output: "export const answer: number = 42;\n"
   *   });
   *   protected readonly views: WritableSignal<ToolCallViews> = signal(ToolCallViews.empty);
   *   protected readonly opened: WritableSignal<string | null> = signal(null);
   *
   *   protected open(call: ToolCall): void {
   *     this.opened.set(call.target);
   *   }
   * }
   * ```
   */
  public constructor();
}

/**
 * One named part of a {@link ToolCallInput}, such as a file's path.
 */
export declare class ToolCallField {
  /**
   * The part's name.
   */
  public readonly key: string;

  /**
   * The part's value, which may be empty.
   */
  public readonly value: string;

  /**
   * Creates the field.
   *
   * @param key The part's name. Not blank.
   * @param value Its value, which may be empty.
   * @throws ArgumentException when the key is blank.
   * @example
   * ```ts
   * import { ToolCallField } from "@noldova/ui.components.angular";
   *
   * export const path: ToolCallField = new ToolCallField("path", "src/app/main.ts");
   * ```
   */
  public constructor(key: string, value: string);
}

/**
 * What a {@link ToolCall} was given: named fields, which the card lists, or
 * code, which it shows in a code block.
 */
export declare class ToolCallInput {
  /**
   * The fields, in order; none for code.
   */
  public readonly fields: readonly ToolCallField[];

  /**
   * The code, or null for fields.
   */
  public readonly code: string | null;

  /**
   * The code's language, such as `bash`, or null for none.
   */
  public readonly language: string | null;

  /**
   * Only {@link ToolCallInput.fromFields} and {@link ToolCallInput.fromCode}
   * create inputs.
   *
   * @example
   * ```ts
   * import { ToolCallInput } from "@noldova/ui.components.angular";
   *
   * export const command: ToolCallInput = ToolCallInput.fromCode("ls");
   *
   * // @ts-expect-error
   * export const madeUp: ToolCallInput = new ToolCallInput();
   * ```
   */
  private constructor();

  /**
   * The text Copy input copies: the code, or each field as its key, a colon
   * and its value, one to a line.
   */
  public get text(): string;

  /**
   * Creates an input of named fields, keeping a copy of the list.
   *
   * @param fields The fields, in order; at least one.
   * @returns The input.
   * @throws ArgumentException when there are no fields.
   * @example
   * ```ts
   * import { ToolCallField, ToolCallInput } from "@noldova/ui.components.angular";
   *
   * export const search: ToolCallInput = ToolCallInput.fromFields([new ToolCallField("pattern", "TODO"), new ToolCallField("path", "src")]);
   * ```
   */
  public static fromFields(fields: readonly ToolCallField[]): ToolCallInput;

  /**
   * Creates an input of code.
   *
   * @param code The code, with its own line breaks.
   * @param language The code's language, which colors it as a code block
   * does; none when left out or null, otherwise not blank.
   * @returns The input.
   * @throws ArgumentException when the language is blank.
   * @example
   * ```ts
   * import { ToolCallInput } from "@noldova/ui.components.angular";
   *
   * export const command: ToolCallInput = ToolCallInput.fromCode("npm test", "bash");
   * ```
   */
  public static fromCode(code: string, language?: string | null): ToolCallInput;
}

/**
 * Marks the `ng-template` that shows the output of every call in a card's
 * tree whose {@link ToolCall.hasOutputControl} is true, as
 * `<ng-template nolToolCallOutput let-call>` inside the top
 * `nol-tool-call`; the template receives the call
 * ({@link IToolCallOutputContext}).
 */
export declare class ToolCallOutputDirective {
  /**
   * The template the card shows such output with.
   */
  public readonly template: TemplateRef<IToolCallOutputContext>;

  /**
   * Tells Angular's template checker that the template's context is an
   * {@link IToolCallOutputContext}; Angular calls it, a module doesn't need
   * to.
   *
   * @param _ The directive on the template.
   * @param _context The template's context.
   * @returns Always true.
   * @example
   * ```ts
   * import { ToolCallOutputDirective } from "@noldova/ui.components.angular";
   *
   * export function isOutputContext(directive: ToolCallOutputDirective, context: unknown): boolean {
   *   return ToolCallOutputDirective.ngTemplateContextGuard(directive, context);
   * }
   * ```
   */
  public static ngTemplateContextGuard(_: ToolCallOutputDirective, _context: unknown): _context is IToolCallOutputContext;
}

/**
 * How the person left a tree of tool-call cards: which calls are open, how
 * many nested calls each shows and whose output shows all its lines, by the
 * calls' ids. Views never change; each change gives new views.
 */
export declare class ToolCallViews {
  /**
   * Views of a tree no one has changed: failed calls open, the others
   * closed, the first step of nested calls shown, output cut.
   */
  public static readonly empty: ToolCallViews;

  /**
   * Only {@link ToolCallViews.empty} and the views' own changes create
   * views.
   *
   * @example
   * ```ts
   * import { ToolCallViews } from "@noldova/ui.components.angular";
   *
   * export const views: ToolCallViews = ToolCallViews.empty;
   *
   * // @ts-expect-error
   * export const madeUp: ToolCallViews = new ToolCallViews();
   * ```
   */
  private constructor();

  /**
   * Whether the call's card is open: as the person left it, or open when
   * the call failed and closed otherwise.
   *
   * @param call The call.
   * @returns Whether its card is open.
   * @example
   * ```ts
   * import type { ToolCall, ToolCallViews } from "@noldova/ui.components.angular";
   *
   * export function isClosed(views: ToolCallViews, call: ToolCall): boolean {
   *   return !views.isExpanded(call);
   * }
   * ```
   */
  public isExpanded(call: ToolCall): boolean;

  /**
   * How many of the call's nested calls show: as many as the person asked
   * for, or the step, and never more than it has.
   *
   * @param call The call.
   * @param step How many show before the person asks for more.
   * @returns The count.
   * @example
   * ```ts
   * import type { ToolCall, ToolCallViews } from "@noldova/ui.components.angular";
   *
   * export function hiddenChildren(views: ToolCallViews, call: ToolCall): number {
   *   return call.children.length - views.shownChildrenOf(call, 20);
   * }
   * ```
   */
  public shownChildrenOf(call: ToolCall, step: number): number;

  /**
   * Whether the call's output shows all its lines, in a scrolling area.
   *
   * @param call The call.
   * @returns Whether it does.
   * @example
   * ```ts
   * import type { ToolCall, ToolCallViews } from "@noldova/ui.components.angular";
   *
   * export function isOutputCut(views: ToolCallViews, call: ToolCall): boolean {
   *   return !views.showsAllLines(call);
   * }
   * ```
   */
  public showsAllLines(call: ToolCall): boolean;

  /**
   * Gives views with the call's card open or closed.
   *
   * @param call The call.
   * @param isExpanded Whether its card is open.
   * @returns The new views.
   * @example
   * ```ts
   * import type { ToolCall, ToolCallViews } from "@noldova/ui.components.angular";
   *
   * export function opened(views: ToolCallViews, call: ToolCall): ToolCallViews {
   *   return views.withExpanded(call, true);
   * }
   * ```
   */
  public withExpanded(call: ToolCall, isExpanded: boolean): ToolCallViews;

  /**
   * Gives views showing that many of the call's nested calls.
   *
   * @param call The call.
   * @param count How many show, a whole number of 0 or more.
   * @returns The new views.
   * @throws ArgumentException when the count is not a whole number of 0 or
   * more.
   * @example
   * ```ts
   * import type { ToolCall, ToolCallViews } from "@noldova/ui.components.angular";
   *
   * export function showingAll(views: ToolCallViews, call: ToolCall): ToolCallViews {
   *   return views.withShownChildren(call, call.children.length);
   * }
   * ```
   */
  public withShownChildren(call: ToolCall, count: number): ToolCallViews;

  /**
   * Gives views in which the call's output shows all its lines.
   *
   * @param call The call.
   * @returns The new views.
   * @example
   * ```ts
   * import type { ToolCall, ToolCallViews } from "@noldova/ui.components.angular";
   *
   * export function showingOutput(views: ToolCallViews, call: ToolCall): ToolCallViews {
   *   return views.withAllLines(call);
   * }
   * ```
   */
  public withAllLines(call: ToolCall): ToolCallViews;
}

/**
 * The bubble {@link TooltipDirective} shows, `nol-tooltip`, with the tooltip
 * role, which shows its text, and its description below it when one is set.
 * Code normally shows tooltips through the directive, which creates and
 * places the bubble.
 */
export declare class TooltipComponent {
  /**
   * The tooltip's text.
   *
   * @example
   * ```ts
   * import { Component } from "@angular/core";
   * import { TooltipComponent } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-search-hint",
   *   imports: [TooltipComponent],
   *   template: "<nol-tooltip text=\"Press Ctrl+K to search\" />"
   * })
   * export class SearchHintComponent {
   * }
   * ```
   */
  public readonly text: InputSignal<string>;

  /**
   * A short description shown below the text, or null, the default, for
   * the text alone. With a description the text is the bubble's title, the
   * description is in the muted text color on the lines below it, and the
   * bubble takes the theme's `--nol-tooltip-description-padding`, 0.5rem by
   * 0.75rem by default, and wraps at `--nol-tooltip-description-width`,
   * 18rem by default, where the text alone takes `--nol-tooltip-padding` and
   * `--nol-tooltip-width`. An empty description counts as none.
   */
  public readonly description: InputSignal<string | null>;
}

/**
 * Shows a tooltip for its host element, `nolTooltip`: when the pointer rests
 * on the host or the host gets focus from the keyboard. It hides when the
 * pointer leaves both the host and the tooltip, on a press on the host, on
 * Escape, when the host loses focus, when the host is hidden or scrolled
 * away, and when a dialog opens, so the dialog's first Escape is the
 * dialog's own; a menu or popover that opens hides it only by the press or
 * the focus change that opens it. An Escape that hides the tooltip is marked handled, with
 * `preventDefault`, as the document captures it, before it reaches any
 * element or a bubbling listener, so the page's listeners and a dialog
 * around it can leave it alone; on the host it also goes no further. An
 * Escape while no tooltip shows passes untouched.
 * A page shows at most one tooltip: showing one hides any other at once,
 * also while that one waits out its hide delay.
 * The tooltip stands on its preferred side, centered on the host.
 */
export declare class TooltipDirective {
  /**
   * The tooltip's text, `nolTooltip`. Unless `nolTooltipTruncated` is on, it
   * is also the host's accessible description, except where it is the host's
   * own accessible name, from its `aria-labelledby`, its `aria-label` or its
   * text, so a tooltip that repeats an icon button's label isn't read twice.
   * The two compare without case and with runs of spaces as one, and the
   * description follows the name as it changes, so a host whose label
   * changes under a fixed tooltip is still read once.
   */
  public readonly text: InputSignal<string>;

  /**
   * A short description the tooltip shows below its text,
   * `nolTooltipDescription`, or null, the default, for the text alone; see
   * {@link TooltipComponent.description} for how it looks. An empty
   * description counts as none. The description is also part of the host's
   * accessible description, after the text, in every case, so it is read
   * where the text is not: where the text is the host's own name, and on a
   * tooltip shown only while the host's text is cut off.
   */
  public readonly description: InputSignal<string | null>;

  /**
   * The side of the host the tooltip prefers, `nolTooltipSide`; above when
   * not bound. Without room there it takes the opposite side, then a side
   * across, or else whichever of the two has more room.
   */
  public readonly side: InputSignal<OverlaySide>;

  /**
   * Whether the tooltip is kept hidden, `nolTooltipDisabled`; false when not
   * bound. Turning it on hides a tooltip that shows.
   */
  public readonly isDisabled: InputSignal<boolean>;

  /**
   * Whether the tooltip shows only while the host's text is cut off,
   * `nolTooltipTruncated`; false when not bound. The texts checked are the
   * host's descendants marked `data-truncates`, any of which cut off shows
   * it, or else the host. Such a tooltip repeats visible text, so its text
   * is not the host's description, though its description is.
   */
  public readonly isTruncatedOnly: InputSignal<boolean>;

  /**
   * A CSS selector of an ancestor whose edges the tooltip clears,
   * `nolTooltipBeside`, or null, the default, to place it by the host alone.
   * The tooltip then stands beside the closest matching ancestor, or the
   * host when none matches, still centered on the host, as for an icon in a
   * strip of icons.
   */
  public readonly besideSelector: InputSignal<string | null>;

  /**
   * Creates the directive, which Angular does for each element that uses
   * `nolTooltip`.
   *
   * @example
   * ```ts
   * import { Component } from "@angular/core";
   * import { OverlaySide, TooltipDirective } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-branch-item",
   *   imports: [TooltipDirective],
   *   template: `
   *     <div class="status-bar">
   *       <span class="branch" role="status" [nolTooltip]="branch" [nolTooltipSide]="above" [nolTooltipTruncated]="true">
   *         <span data-truncates>{{ branch }}</span>
   *       </span>
   *       <button type="button" aria-label="Pull" [nolTooltip]="'Pull from the remote'" [nolTooltipSide]="above" [nolTooltipBeside]="'.status-bar'">download</button>
   *     </div>`
   * })
   * export class BranchItemComponent {
   *   protected readonly above: OverlaySide = OverlaySide.above;
   *   protected readonly branch: string = "feature/notes-sync";
   * }
   * ```
   */
  public constructor();

  /**
   * Whether the tooltip shows now.
   */
  public get isShown(): boolean;

  /**
   * Shows the tooltip at once and cancels a pending show or hide. Nothing
   * shows while it already shows, while it is disabled, or while it is
   * truncated-only and the host's text fits.
   *
   * @example
   * ```ts
   * import { Component, type Signal, type WritableSignal, signal, viewChild } from "@angular/core";
   * import { TooltipDirective } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-copy-link",
   *   imports: [TooltipDirective],
   *   template: "<button type=\"button\" [nolTooltip]=\"tip()\" (click)=\"copy()\">Copy link</button>"
   * })
   * export class CopyLinkComponent {
   *   private readonly tooltip: Signal<TooltipDirective> = viewChild.required(TooltipDirective);
   *
   *   protected readonly tip: WritableSignal<string> = signal("Copy the note's link");
   *
   *   protected copy(): void {
   *     this.tip.set("Copied");
   *     this.tooltip().show();
   *   }
   * }
   * ```
   */
  public show(): void;

  /**
   * Hides the tooltip at once and cancels a pending show or hide. Nothing
   * happens while it is hidden.
   *
   * @example
   * ```ts
   * import { Component, type OutputEmitterRef, type Signal, output, viewChild } from "@angular/core";
   * import { TooltipDirective } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-run-button",
   *   imports: [TooltipDirective],
   *   template: "<button type=\"button\" nolTooltip=\"Run the selected cell\" (keydown.enter)=\"run()\">Run</button>"
   * })
   * export class RunButtonComponent {
   *   private readonly tooltip: Signal<TooltipDirective> = viewChild.required(TooltipDirective);
   *
   *   public readonly ran: OutputEmitterRef<void> = output<void>();
   *
   *   protected run(): void {
   *     this.tooltip().hide();
   *     this.ran.emit();
   *   }
   * }
   * ```
   */
  public hide(): void;
}

/**
 * A tree of labeled nodes with optional glyphs, which the person browses
 * with the arrow keys and typing, and which can let them reorder its nodes.
 * Clicking a node, or pressing Enter or Space on it, activates it, and a
 * branch also opens or closes. When movable, dragging a node or pressing
 * Alt with an arrow key proposes a move, which assistive technology hears;
 * the owner applies it to its nodes, and the rows then glide to their new
 * places, unless reduced motion is preferred, with the moved node keeping
 * focus. A move replaces the announcement of an earlier move in the same
 * tree that assistive technology has not yet spoken, so a held key is heard
 * as its last move.
 */
export declare class TreeComponent {
  /**
   * The top-level nodes, each with its children. A branch that starts open
   * opens the first time it appears.
   */
  public readonly nodes: InputSignal<readonly TreeNode[]>;

  /**
   * The tree's accessible name.
   */
  public readonly label: InputSignal<string>;

  /**
   * The id of the current node, which is highlighted, selected for
   * assistive technology and the tree's tab stop, or null for none; null
   * when not bound.
   */
  public readonly current: InputSignal<string | null>;

  /**
   * Whether the person can move nodes, by dragging or with Alt and the
   * arrow keys; false when not bound.
   */
  public readonly movable: InputSignal<boolean>;

  /**
   * Emits the node the person activated; the owner usually makes it
   * {@link TreeComponent.current}.
   */
  public readonly activated: OutputEmitterRef<TreeNode>;

  /**
   * Emits a move the person made in a movable tree. The tree does not change
   * its nodes; the owner applies the move, usually with `TreeMove.apply`,
   * and binds the result.
   */
  public readonly moved: OutputEmitterRef<TreeMove>;

  /**
   * Creates the component, which Angular does for each `nol-tree` element.
   * Destroying it ends a drag under way.
   *
   * @example
   * ```ts
   * import { Component, type WritableSignal, signal } from "@angular/core";
   * import { TreeComponent, type TreeMove, TreeNode } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-note-folders",
   *   imports: [TreeComponent],
   *   template: "<nol-tree label=\"Folders\" [nodes]=\"nodes()\" [current]=\"current()\" [movable]=\"true\" (activated)=\"current.set($event.id)\" (moved)=\"apply($event)\" />"
   * })
   * export class NoteFoldersComponent {
   *   protected readonly nodes: WritableSignal<readonly TreeNode[]> = signal([
   *     TreeNode.open("work", "Work", "folder", [new TreeNode("plans", "Plans", "description"), new TreeNode("ideas", "Ideas", "description")]),
   *     new TreeNode("home", "Home", "folder")
   *   ]);
   *   protected readonly current: WritableSignal<string | null> = signal(null);
   *
   *   protected apply(move: TreeMove): void {
   *     this.nodes.update(t => move.apply(t));
   *   }
   * }
   * ```
   */
  public constructor();

  /**
   * Moves focus to the current node's row, or the first row when no row is
   * current; nothing happens while the tree has no rows.
   *
   * @example
   * ```ts
   * import { Component, type Signal, viewChild } from "@angular/core";
   * import { TreeComponent, TreeNode } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-settings-pages",
   *   imports: [TreeComponent],
   *   template: "<nol-tree label=\"Pages\" current=\"general\" [nodes]=\"pages\" /><button type=\"button\" (click)=\"showPages()\">Pages</button>"
   * })
   * export class SettingsPagesComponent {
   *   private readonly tree: Signal<TreeComponent> = viewChild.required(TreeComponent);
   *
   *   protected readonly pages: readonly TreeNode[] = [new TreeNode("general", "General"), new TreeNode("keys", "Keyboard")];
   *
   *   protected showPages(): void {
   *     this.tree().focus();
   *   }
   * }
   * ```
   */
  public focus(): void;
}

/**
 * A move of one row of {@link TreeComponent} to a new parent and position,
 * which the tree emits through its `moved` output for its owner to apply.
 */
export declare class TreeMove {
  /**
   * The id of the row that moves, with its descendants.
   */
  public readonly id: string;

  /**
   * The id of its new parent, or null for the top level.
   */
  public readonly parentId: string | null;

  /**
   * Its position among the new parent's children once it has left its old
   * place, from 0.
   */
  public readonly index: number;

  /**
   * Creates the move.
   *
   * @param id The id of the row that moves.
   * @param parentId The id of its new parent, or null for the top level.
   * @param index Its position among the new parent's children once it has
   * left its old place, from 0 to their count; beyond that it goes last.
   * @example
   * ```ts
   * import { TreeMove } from "@noldova/ui.components.angular";
   *
   * export const intoSource: TreeMove = new TreeMove("readme", "source", 0);
   * ```
   */
  public constructor(id: string, parentId: string | null, index: number);

  /**
   * Applies the move to a tree. Rows are found by id.
   *
   * @param nodes The tree's top-level rows, whose ids are unique in the
   * tree; it is left unchanged.
   * @returns The new tree's top-level rows, rebuilt with the row and its
   * descendants in their new place.
   * @throws TreeMoveException synchronously when the tree has no row of the
   * move's id, or the new parent is missing, is the row itself or is inside
   * it.
   * @example
   * ```ts
   * import { Component, type WritableSignal, signal } from "@angular/core";
   * import { TreeComponent, type TreeMove, TreeNode } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-notes-tree",
   *   imports: [TreeComponent],
   *   template: "<nol-tree [nodes]=\"nodes()\" label=\"Notes\" [movable]=\"true\" (moved)=\"move($event)\" />"
   * })
   * export class NotesTreeComponent {
   *   protected readonly nodes: WritableSignal<readonly TreeNode[]> = signal<readonly TreeNode[]>([
   *     TreeNode.open("home", "Home", "folder", [new TreeNode("groceries", "Groceries", "description")]),
   *     new TreeNode("work", "Work", "folder")
   *   ]);
   *
   *   protected move(move: TreeMove): void {
   *     this.nodes.update(t => move.apply(t));
   *   }
   * }
   * ```
   * @example
   * ```ts
   * import { type TreeMove, TreeMoveException, type TreeNode } from "@noldova/ui.components.angular";
   *
   * export function applyIfPossible(nodes: readonly TreeNode[], move: TreeMove): readonly TreeNode[] {
   *   try {
   *     return move.apply(nodes);
   *   } catch (error) {
   *     if (error instanceof TreeMoveException)
   *       return nodes;
   *     throw error;
   *   }
   * }
   * ```
   */
  public apply(nodes: readonly TreeNode[]): readonly TreeNode[];
}

/**
 * The exception thrown when a tree move cannot be applied:
 * {@link TreeMove.apply} throws it when the moved row is missing, or the new
 * parent is missing, is the row itself or lies inside it.
 */
export declare class TreeMoveException extends UiComponentsException {
  /**
   * The exception's name, `"TreeMoveException"`, which the class sets itself so
   * that a minified build keeps it.
   */
  public override readonly name: string;

  /**
   * Creates the exception.
   *
   * @param message A sentence naming the row and why it cannot move.
   * @example
   * ```ts
   * import { TreeMoveException } from "@noldova/ui.components.angular";
   *
   * export const refused: TreeMoveException = new TreeMoveException("The row \"src\" cannot move into \"src/app\".");
   * ```
   */
  public constructor(message: string);
}

/**
 * A row of {@link TreeComponent} with its descendants. Nodes never change;
 * a changed tree is built from new nodes.
 */
export declare class TreeNode {
  /**
   * The row's id, unique in its tree; the tree tracks, expands and moves
   * rows by it.
   */
  public readonly id: string;

  /**
   * The text the row shows, which type-ahead in the tree matches.
   */
  public readonly label: string;

  /**
   * The glyph shown before the label, or null when it has none.
   */
  public readonly icon: string | null;

  /**
   * The child rows, in order; the row is a branch when it has any.
   */
  public readonly children: readonly TreeNode[];

  /**
   * Whether the tree expands the branch the first time it shows a row of
   * this id; the person may collapse it afterwards.
   */
  public readonly startsOpen: boolean;

  /**
   * Creates the row.
   *
   * @param id The row's id, unique in its tree.
   * @param label The text it shows.
   * @param icon The glyph before the label; none when left out or null.
   * @param children The child rows, in order, which the row keeps without
   * copying; none when left out.
   * @param startsOpen Whether the tree first shows the branch expanded;
   * false when left out.
   * @example
   * ```ts
   * import { TreeNode } from "@noldova/ui.components.angular";
   *
   * export const pages: readonly TreeNode[] = [
   *   new TreeNode("general", "General"),
   *   new TreeNode("source", "Source", "folder", [new TreeNode("app", "App", "description")])
   * ];
   * ```
   */
  public constructor(id: string, label: string, icon?: string | null, children?: readonly TreeNode[], startsOpen?: boolean);

  /**
   * Creates a row whose branch the tree first shows expanded.
   *
   * @param id The row's id, unique in its tree.
   * @param label The text it shows.
   * @param icon The glyph before the label, or null for none.
   * @param children The child rows, in order, which the row keeps without
   * copying.
   * @returns A new row with {@link TreeNode.startsOpen} true.
   * @example
   * ```ts
   * import { TreeNode } from "@noldova/ui.components.angular";
   *
   * export const project: TreeNode = TreeNode.open("project", "Project", "folder", [new TreeNode("readme", "Readme", "description")]);
   * ```
   */
  public static open(id: string, label: string, icon: string | null, children: readonly TreeNode[]): TreeNode;

  /**
   * Creates a copy of the row with other children, keeping its id, label,
   * icon and whether it starts open.
   *
   * @param children The new child rows, in order.
   * @returns A new row; this one is left unchanged.
   * @example
   * ```ts
   * import type { TreeNode } from "@noldova/ui.components.angular";
   *
   * export function sortedByLabel(node: TreeNode): TreeNode {
   *   return node.withChildren([...node.children].sort((a, b) => a.label.localeCompare(b.label)));
   * }
   * ```
   */
  public withChildren(children: readonly TreeNode[]): TreeNode;

  /**
   * Tells whether a row is this one or one of its descendants.
   *
   * @param id The row's id.
   * @returns True when this row or a descendant has the id.
   * @example
   * ```ts
   * import type { TreeNode } from "@noldova/ui.components.angular";
   *
   * export function canHold(node: TreeNode, parentId: string): boolean {
   *   return !node.contains(parentId);
   * }
   * ```
   */
  public contains(id: string): boolean;

  /**
   * Whether the row has children, so the tree shows it as a branch that
   * expands and collapses.
   */
  public get isBranch(): boolean;

  /**
   * The branches in this row's subtree that start open, this row first and
   * then its descendants depth first; a row that starts open without
   * children is left out.
   */
  public get startOpenBranches(): readonly TreeNode[];
}

/**
 * The person's text sizes and fonts, which
 * {@link AppearanceService.setTypography} paints on the document's root.
 */
export declare class Typography {
  /**
   * The size of panel text in CSS pixels, from 12 to 18.
   */
  public readonly panelSize: number;

  /**
   * The size of message text in CSS pixels, from 12 to 18, painted as
   * `--nol-text-message`.
   */
  public readonly messageSize: number;

  /**
   * The size of code in CSS pixels, from 12 to 18, painted as
   * `--nol-text-code`.
   */
  public readonly codeSize: number;

  /**
   * The font of the interface, painted as `--nol-font-sans`.
   */
  public readonly interfaceFont: FontChoice;

  /**
   * The font of code, painted as `--nol-font-mono`.
   */
  public readonly codeFont: FontChoice;

  /**
   * Creates the typography.
   *
   * @param panelSize The size of panel text in CSS pixels, from 12 to 18;
   * 13 when left out.
   * @param messageSize The size of message text in CSS pixels, from 12 to
   * 18; 13 when left out.
   * @param codeSize The size of code in CSS pixels, from 12 to 18; 12 when
   * left out, one step below the message text, since the code font draws
   * wider glyphs.
   * @param interfaceFont The font of the interface; Noldova when left out.
   * @param codeFont The font of code; Noldova when left out.
   * @throws ArgumentOutOfRangeException synchronously when a size is not a
   * finite number from 12 to 18.
   * @example
   * ```ts
   * import { Typography } from "@noldova/ui.components.angular";
   *
   * export const standard: Typography = new Typography();
   * ```
   * @example
   * ```ts
   * import { Component, inject } from "@angular/core";
   * import { AppearanceService, FontChoice, Typography } from "@noldova/ui.components.angular";
   *
   * @Component({ selector: "nol-larger-text", template: "<button type=\"button\" (click)=\"enlarge()\">Larger text</button>" })
   * export class LargerTextComponent {
   *   private readonly appearance: AppearanceService = inject(AppearanceService);
   *
   *   protected enlarge(): void {
   *     this.appearance.setTypography(new Typography(15, 16, 16, FontChoice.Noldova, FontChoice.System));
   *   }
   * }
   * ```
   */
  public constructor(panelSize?: number, messageSize?: number, codeSize?: number, interfaceFont?: FontChoice, codeFont?: FontChoice);

  /**
   * The root font size in CSS pixels: 16 at the default panel size of 13,
   * and in proportion to the panel size otherwise, so every rem-based size
   * of the kit grows with it.
   */
  public get rootSize(): number;
}

/**
 * Paints typography on an element: its font size, and the CSS custom
 * properties of the message and code sizes and the interface and code
 * fonts. On the document's root, the font size sets the size of 1rem.
 * Without it, the kit's base stylesheet gives the default typography's
 * fonts and sizes, and leaves the root's font size to the browser.
 */
export declare class TypographyPainter {
  /**
   * Paints typography on an element, replacing what was painted there
   * before.
   *
   * @param element The element, usually the document's root.
   * @param typography The sizes and fonts.
   * @param sizing How sizes are written; in CSS pixels when not given.
   * @throws ArgumentException synchronously when the sizing is
   * {@link TypographySizing.Relative} and the element is not its
   * document's root.
   * @example
   * ```ts
   * import { Directive, ElementRef, inject } from "@angular/core";
   * import { Typography, TypographyPainter } from "@noldova/ui.components.angular";
   *
   * @Directive({ selector: "[nolLargeSample]" })
   * export class LargeSampleDirective {
   *   public constructor() {
   *     TypographyPainter.paint(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement, new Typography(16, 16, 15));
   *   }
   * }
   * ```
   * @example
   * ```ts
   * import { Typography, TypographyPainter, TypographySizing } from "@noldova/ui.components.angular";
   *
   * export function applyLargerText(): void {
   *   TypographyPainter.paint(document.documentElement, new Typography(15, 16, 16), TypographySizing.Relative);
   * }
   * ```
   */
  public static paint(element: HTMLElement, typography: Typography, sizing?: TypographySizing): void;

  /**
   * Removes everything {@link TypographyPainter.paint} paints from an
   * element, so it inherits its parent's typography again.
   *
   * @param element The element.
   * @example
   * ```ts
   * import { TypographyPainter } from "@noldova/ui.components.angular";
   *
   * export function resetSample(element: HTMLElement): void {
   *   TypographyPainter.erase(element);
   * }
   * ```
   */
  public static erase(element: HTMLElement): void;
}

/**
 * The base of every exception the kit throws or reports, the one type an app
 * catches to handle any of the kit's failures and only the kit's. It extends
 * context's `Exception`, and each of the kit's exceptions extends it:
 * {@link DiffException}, {@link LinkReferenceException},
 * {@link MarkdownException}, {@link ThemeException},
 * {@link TreeMoveException}, {@link VirtualListException}, and
 * `CodeHighlightingException` from
 * `@noldova/ui.components.angular/code-highlighting`.
 */
export declare class UiComponentsException extends Exception {
  /**
   * The exception's name, `"UiComponentsException"`, which the class sets
   * itself so that a minified build keeps it; each subclass sets its own.
   */
  public override readonly name: string;

  /**
   * Creates the exception.
   *
   * @param message A sentence naming what failed.
   * @param options The failure that caused it, as its `cause`, if one did.
   * @example
   * ```ts
   * import { ErrorHandler, Injectable } from "@angular/core";
   * import { UiComponentsException } from "@noldova/ui.components.angular";
   *
   * @Injectable()
   * export class KitErrorHandler implements ErrorHandler {
   *   public readonly kitFailures: UiComponentsException[] = [];
   *
   *   public handleError(error: unknown): void {
   *     if (!(error instanceof UiComponentsException))
   *       throw error;
   *     this.kitFailures.push(error);
   *   }
   * }
   * ```
   */
  public constructor(message: string, options?: ExceptionOptions);
}

/**
 * The badge on a view's icon or after its tab's title, `nol-view-badge`: a
 * small filled pill with a count, or a dot without one. It is hidden from
 * assistive technology, so its owner adds what it means to the accessible
 * name of the element it marks.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { IconButtonComponent, ViewBadgeComponent } from "@noldova/ui.components.angular";
 *
 * @Component({
 *   selector: "nol-inbox-button",
 *   imports: [IconButtonComponent, ViewBadgeComponent],
 *   template: "<button type=\"button\" nol-icon-button icon=\"inbox\" [label]=\"'Inbox, ' + unread + ' unread'\"><nol-view-badge [count]=\"unread\" /></button>"
 * })
 * export class InboxButtonComponent {
 *   protected readonly unread: number = 3;
 * }
 * ```
 */
export declare class ViewBadgeComponent {
  /**
   * The count the badge shows, up to 99 and then 99+, or null for a dot;
   * null when not bound.
   */
  public readonly count: InputSignal<number | null>;
}

/**
 * The row a person chose in a {@link VirtualListComponent}, which its
 * {@link VirtualListComponent.activated} emits.
 *
 * @typeParam T The type of the source's items.
 */
export declare class VirtualListChoice<T> {
  /**
   * The chosen row's position in the whole list, from 0.
   */
  public readonly index: number;

  /**
   * The chosen row's item, as the list loaded it.
   */
  public readonly item: T;

  /**
   * Creates a choice; the list makes one for each row a person chooses.
   *
   * @param index The chosen row's position in the whole list, from 0.
   * @param item The chosen row's item.
   * @example
   * ```ts
   * import { VirtualListChoice } from "@noldova/ui.components.angular";
   *
   * export const choice: VirtualListChoice<string> = new VirtualListChoice(2, "Sample Contact 3");
   * ```
   */
  public constructor(index: number, item: T);
}

/**
 * The person's "Jump to latest" in a feed, which its
 * {@link VirtualListComponent.jumped} emits before the feed scrolls.
 */
export declare class VirtualListJump {
  /**
   * Whether the owner held the jump for a new source.
   */
  public get isHeld(): boolean;

  /**
   * Holds the jump until the owner gives the feed a new
   * {@link VirtualListComponent.source}, such as the newest page it is
   * still loading: the feed keeps its view where it is and hides Jump to
   * latest, and the next source opens at its end and follows it. The owner
   * calls it while the feed's `jumped` handler runs; once the person moves
   * the view, the jump is over and the next source opens as any other does.
   */
  public holdForSource(): void;

  /**
   * Ends a held jump without a new source, such as when the newest page
   * failed to load or took longer than the owner waits: the feed scrolls to
   * the end of the rows it has and follows it, as a jump not held does.
   * Nothing happens once the hold has ended, by a new source, the person
   * moving the view or an earlier release.
   */
  public release(): void;

  /**
   * Creates a jump; the feed makes one each time the person chooses Jump to
   * latest.
   *
   * @param release What {@link VirtualListJump.release} does.
   * @example
   * ```ts
   * import { VirtualListJump } from "@noldova/ui.components.angular";
   *
   * export const jump: VirtualListJump = new VirtualListJump(() => undefined);
   * ```
   */
  public constructor(release: () => void);
}

/**
 * The kit's list for a long collection, `nol-virtual-list`: a named list that
 * renders only the rows in and just beyond its view, so the rows it renders
 * do not grow with the list's length. It reads its items from a
 * {@link VirtualListSource} a few pages at a time and draws each loaded one
 * with the template a {@link VirtualRowDirective} marks; a row not yet
 * loaded is blank space at its height. Each row takes its own height, which
 * the list measures; rows measured, loaded, unloaded, added or removed above
 * the first loaded row in view, or above the first row in view while none
 * in view has loaded, move nothing in view, and a row keeps its height while
 * its images load and decode. While a pointer drags the scrollbar's thumb,
 * until it is released or cancelled or the window loses the focus, the list
 * never sets the scroll position and keeps the scroll height it had when the
 * press began; the rows move with the thumb, reach both ends with it, and rows
 * measured, added or removed meanwhile move nothing in view, so rows that come
 * at the end a feed follows wait beyond it. One correction on release moves
 * nothing in view, except in a feed that follows its latest end: there it
 * shows the rows that came at that end during the drag, at the distance from
 * it the feed kept.
 *
 * Its {@link VirtualListComponent.kind} picks its pattern. An options list
 * is a listbox whose rows take the tree row's geometry: Up and Down move,
 * Page Up and Page Down move by a view, Home and End go to the first and
 * last row, and Enter or Space chooses. It is one Tab stop, which returns to
 * the row last focused, or lands on the selected row, or on the first.
 *
 * A feed is a feed of articles that its template draws whole. It opens at
 * its end and follows it until the person scrolls towards the start beyond
 * the last 120px. While it follows, a row changed anywhere, or added or
 * removed at its end, brings the view to its true end, as a conversation
 * does when a reply grows, once any scroll of the person's own has ended;
 * rows that grow by themselves, or come or go at its start, keep the
 * distance from the end the person scrolled to. Scrolling back within
 * 120px of the end, with the newest rows loaded, follows again, and a Jump
 * to latest button shows while it doesn't follow. With
 * {@link VirtualListComponent.latest} at
 * {@link VirtualListEdge.Start}, for a newest-first list, it does the same
 * at its start, never follows its end, and shows the button at its top.
 * The feed itself is its one Tab stop, and Tab goes on to the controls in
 * its articles; its articles take the focus from a click or from assistive
 * technology, not from Tab. Its keys scroll it as a scrolling area does, and
 * never move the focus between its articles: Down and Up by 40px, Page Down
 * and Page Up by seven eighths of its height, and Home and End to its start
 * and end. Page Down and Page Up do so from anywhere in it, unless a control
 * has handled them; the arrows, Home and End only while the feed or an
 * article itself has focus, so controls inside an article keep their keys.
 * Ctrl+Home and Ctrl+End move the focus to before and after the feed.
 *
 * Once a read of rows in view has taken 250 ms, either kind says so in a
 * status line, and announces it if the focused row is among them, so a
 * source that answers quickly never shows it; when a read fails, it says
 * and announces that the items couldn't load and offers Retry.
 *
 * A feed with the keyboard focus rings its view, inside its edges, in the
 * accent color, or `Highlight` under forced colors, and no article shows a
 * ring; a click into it shows none. `--nol-virtual-list-focus-width`, which
 * centered an article's ring at a narrower column's width, has no effect.
 *
 * The module sizes the list; it scrolls inside the height it is given.
 *
 * @typeParam T The type of the source's items.
 */
export declare class VirtualListComponent<T> {
  /**
   * The items the list shows. A new source starts the list again at its
   * first row.
   */
  public readonly source: InputSignal<VirtualListSource<T>>;

  /**
   * The list's accessible name.
   */
  public readonly label: InputSignal<string>;

  /**
   * The list's pattern, an options list or a feed;
   * {@link VirtualListKind.Options} when not bound. The list takes a change
   * at once, but a feed opens at its end or at its
   * {@link VirtualListComponent.position} only when it starts with a
   * source.
   */
  public readonly kind: InputSignal<VirtualListKind>;

  /**
   * The position of the selected row of an options list, from 0, which is
   * highlighted, selected for assistive technology and the list's Tab stop
   * until a row has been focused, whether its item has loaded or not, or
   * null for none; null when not bound. A position outside the list counts
   * as none. The owner moves it with the items it adds or removes before it.
   * A feed ignores it.
   */
  public readonly selected: InputSignal<number | null>;

  /**
   * Where a feed opens, as {@link VirtualListComponent.positionChange} last
   * gave it, or null to open at its end, as a position that follows its end
   * does; null when not bound. The feed
   * finds the row by its key among the rows it loads around the position,
   * so rows added or removed before it since don't move the reading
   * position, and falls back to the position's index. The list reads it
   * when it starts with a source, except a source given for the person's
   * "Jump to latest", which opens at its end (see
   * {@link VirtualListComponent.jumped}). An options list ignores it.
   */
  public readonly position: InputSignal<VirtualListPosition | null>;

  /**
   * Whether the owner is changing the rows, such as while a feed's newest
   * article streams in, so assistive technology waits to read them; false
   * when not bound. The list is busy while rows in view load as well.
   */
  public readonly busy: InputSignal<boolean>;

  /**
   * How far beyond the rows it renders the list reads ahead, in pixels, on
   * each side of its view, so rows a fast scroll reaches have loaded before
   * they show; 1600 when not bound. A negative distance counts as 0. A
   * source slower than a local store may want more, at the cost of reading
   * rows the person may never reach.
   */
  public readonly readAhead: InputSignal<number>;

  /**
   * Which end of a feed holds its latest rows: {@link VirtualListEdge.End},
   * the default, or {@link VirtualListEdge.Start} for a newest-first list.
   * The feed opens at it, follows it and jumps to it; a change while the
   * feed follows moves the view to the new end, and a change while it doesn't
   * makes it follow, without moving the view, when the view is already within
   * 120px of the new end with the rows there loaded. An options list ignores
   * it.
   */
  public readonly latest: InputSignal<VirtualListEdge>;

  /**
   * Emits the loaded row the person chose in an options list by a click,
   * Enter or Space, with its position and its item; the owner usually makes
   * the position {@link VirtualListComponent.selected}. A feed never emits
   * it.
   */
  public readonly activated: OutputEmitterRef<VirtualListChoice<T>>;

  /**
   * Emits where the person reads each time they scroll: the first loaded row
   * in view, or the row at the top of the view while none in view has
   * loaded, and how far into it the view starts. It emits too each time a
   * feed starts or stops following its end otherwise, such as by Jump to
   * latest or as its newest rows load near its end. A feed's module keeps the
   * last one and gives it back as {@link VirtualListComponent.position} to
   * open there again.
   */
  public readonly positionChange: OutputEmitterRef<VirtualListPosition>;

  /**
   * Emits when the person chooses a feed's "Jump to latest", by a pointer or
   * a key, before the feed scrolls, so an owner whose source holds only some
   * of its rows can put the newest ones in it first. Rows the owner adds,
   * removes or replaces in the source while it handles the jump are where
   * the feed scrolls to. An owner that loads the newest rows later calls
   * {@link VirtualListJump.holdForSource}: the feed then keeps its view and
   * waits for a new {@link VirtualListComponent.source}, never drawing the
   * old rows' end. A new source given while the owner handles the jump, or
   * the first one given after it held the jump, opens at its end and follows
   * it, whatever its {@link VirtualListComponent.position} says, and the
   * feed reports that it follows. An options list never emits it.
   */
  public readonly jumped: OutputEmitterRef<VirtualListJump>;

  /**
   * Emits why a read failed: what {@link VirtualListSource.readAsync}
   * threw or rejected with, or a {@link VirtualListException} when it
   * answered with the wrong number of items. The list itself tells the
   * person and offers Retry; the owner may log it.
   */
  public readonly failed: OutputEmitterRef<unknown>;

  /**
   * Creates the component, which Angular does for each `nol-virtual-list`
   * element. Destroying it stops its reads and its following of its source.
   *
   * @example
   * ```ts
   * import { Component } from "@angular/core";
   * import { ArrayVirtualListSource, VirtualListComponent, VirtualRowDirective } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-contact-list",
   *   imports: [VirtualListComponent, VirtualRowDirective],
   *   template: "<nol-virtual-list label=\"Contacts\" [source]=\"contacts\" [selected]=\"chosen\" (activated)=\"chosen = $event.index\"><ng-template [nolVirtualRow]=\"contacts\" let-name>{{ name }}</ng-template></nol-virtual-list>",
   *   styles: "nol-virtual-list { height: 20rem; }"
   * })
   * export class ContactListComponent {
   *   protected readonly contacts: ArrayVirtualListSource<string> = new ArrayVirtualListSource(["Sample Contact 1", "Sample Contact 2", "Sample Contact 3"], t => t, 30);
   *   protected chosen: number | null = null;
   * }
   * ```
   */
  public constructor();

  /**
   * Moves focus to the list's Tab stop. In an options list that is the row
   * last focused, or else the selected row, or the first row, which it
   * scrolls into view, and nothing happens while the list has no rows. A
   * feed takes the focus itself, where it is scrolled to.
   *
   * @example
   * ```ts
   * import { Component, type Signal, viewChild } from "@angular/core";
   * import { ArrayVirtualListSource, VirtualListComponent, VirtualRowDirective } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-log-lines",
   *   imports: [VirtualListComponent, VirtualRowDirective],
   *   template: "<nol-virtual-list label=\"Log\" [source]=\"lines\"><ng-template [nolVirtualRow]=\"lines\" let-line>{{ line }}</ng-template></nol-virtual-list><button type=\"button\" (click)=\"showLines()\">Log</button>"
   * })
   * export class LogLinesComponent {
   *   private readonly list: Signal<VirtualListComponent<string>> = viewChild.required<VirtualListComponent<string>>(VirtualListComponent);
   *
   *   protected readonly lines: ArrayVirtualListSource<string> = new ArrayVirtualListSource(["Started", "Ready"], t => t);
   *
   *   protected showLines(): void {
   *     this.list().focus();
   *   }
   * }
   * ```
   */
  public focus(): void;

  /**
   * Scrolls the list so the row at a position shows where the alignment
   * puts it, as far as the list can scroll, without moving focus; a
   * position beyond either end reveals the row at that end, and nothing
   * happens while the list has no rows.
   *
   * With a part, the alignment places that part of the row instead, and
   * the list holds it there as the row and the rows around it are
   * measured, until the person moves the view: a far row the list hasn't
   * rendered is placed by its estimate and rendered at once, so the part
   * comes into place as the row measures, and kept loaded meanwhile. A
   * rendered row is measured first, so a part can be revealed in the same
   * render that grows its row, with no wait for the row's size. An
   * element part follows the row's own growth above it; one outside the row
   * reveals the whole row. When the row is removed, the view rests at the
   * start of the row that takes its place. A part that puts the view at the
   * newest end of a feed holds nothing, since the view follows the newest
   * rows from there.
   *
   * @param index The row's position, from 0.
   * @param align Where in the view the row, or its part, goes.
   * @param part A part of the row: an offset into it, in pixels from its
   * top, or an element inside it.
   * @example
   * ```ts
   * import { Component, type Signal, viewChild } from "@angular/core";
   * import { ArrayVirtualListSource, VirtualListAlign, VirtualListComponent, VirtualRowDirective } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-history",
   *   imports: [VirtualListComponent, VirtualRowDirective],
   *   template: "<nol-virtual-list label=\"History\" [source]=\"entries\"><ng-template [nolVirtualRow]=\"entries\" let-entry>{{ entry }}</ng-template></nol-virtual-list><button type=\"button\" (click)=\"showLatest()\">Latest</button>"
   * })
   * export class HistoryComponent {
   *   private readonly list: Signal<VirtualListComponent<string>> = viewChild.required<VirtualListComponent<string>>(VirtualListComponent);
   *
   *   protected readonly entries: ArrayVirtualListSource<string> = new ArrayVirtualListSource(["Opened", "Edited", "Saved"], t => t);
   *
   *   protected showLatest(): void {
   *     this.list().reveal(this.entries.length() - 1, VirtualListAlign.End);
   *   }
   * }
   * ```
   */
  public reveal(index: number, align: VirtualListAlign, part?: number | Element | null): void;

  /**
   * Holds an element inside a row where the view shows it now, without
   * scrolling, as the row grows or shrinks above it, until the person moves
   * the view; an element taller than the view holds too. Call it before
   * changing the row: it reads the element's place from the current layout.
   * A feed that follows its newest end, or whose jump the owner holds, holds
   * nothing, and an element outside the row, or a list with no rows, changes
   * nothing. A click's keep of its row, and the stop it put on following,
   * stay as they are; after a click on a resizing control, the element is
   * held from where the click put it. A position beyond either end names the
   * row at that end.
   *
   * @param index The row's position, from 0.
   * @param part An element inside the row.
   * @example
   * ```ts
   * import { Component, type Signal, viewChild } from "@angular/core";
   * import { ArrayVirtualListSource, VirtualListComponent, VirtualRowDirective } from "@noldova/ui.components.angular";
   *
   * @Component({
   *   selector: "nol-reply",
   *   imports: [VirtualListComponent, VirtualRowDirective],
   *   template: "<nol-virtual-list label=\"Reply\" [source]=\"blocks\"><ng-template [nolVirtualRow]=\"blocks\" let-block let-index=\"index\"><p #paragraph (click)=\"holdReader(index, paragraph)\">{{ block }}</p></ng-template></nol-virtual-list>"
   * })
   * export class ReplyComponent {
   *   private readonly list: Signal<VirtualListComponent<string>> = viewChild.required<VirtualListComponent<string>>(VirtualListComponent);
   *
   *   protected readonly blocks: ArrayVirtualListSource<string> = new ArrayVirtualListSource(["Started", "Working"], t => t);
   *
   *   protected holdReader(index: number, paragraph: HTMLElement): void {
   *     this.list().hold(index, paragraph);
   *   }
   * }
   * ```
   */
  public hold(index: number, part: Element): void;
}

/**
 * The exception a {@link VirtualListSource} throws for a length, an estimate
 * or a change that does not fit the list, and that the kit's list reports
 * when a source answers a read with the wrong number of items.
 */
export declare class VirtualListException extends UiComponentsException {
  /**
   * The exception's name, `"VirtualListException"`, which the class sets
   * itself so that a minified build keeps it.
   */
  public override readonly name: string;

  /**
   * Creates the exception.
   *
   * @param message A sentence naming the values and why they don't fit.
   * @example
   * ```ts
   * import { VirtualListException } from "@noldova/ui.components.angular";
   *
   * export const refused: VirtualListException = new VirtualListException("2 items from 9 are not in a list of 10.");
   * ```
   */
  public constructor(message: string);
}

/**
 * Where the person reads in a {@link VirtualListComponent}: the first
 * loaded row in view, or the row at the top of the view while none in view
 * has loaded, by its position and its key, and how far into it the view
 * starts. A feed emits it as the person scrolls, and opens at it again
 * when given it as its {@link VirtualListComponent.position}.
 */
export declare class VirtualListPosition {
  /**
   * The row's position in the whole list, from 0.
   */
  public readonly index: number;

  /**
   * The row's key, as {@link VirtualListSource.keyOf} gives it, or null when
   * the row wasn't loaded.
   */
  public readonly key: string | null;

  /**
   * How far into the row the view starts, in CSS pixels; negative when the
   * row starts below the view's top.
   */
  public readonly distance: number;

  /**
   * Whether a feed follows its latest end there, so its owner keeps no
   * reading position and the feed opens at that end again; false in a list
   * that isn't a feed.
   */
  public readonly isFollowing: boolean;

  /**
   * Creates a position, usually from one the list emitted and the module
   * stored.
   *
   * @param index The row's position in the whole list, from 0.
   * @param key The row's key, or null.
   * @param distance How far into the row the view starts, in CSS pixels.
   * @param isFollowing Whether a feed follows its latest end there; false
   * when left out.
   * @example
   * ```ts
   * import { VirtualListPosition } from "@noldova/ui.components.angular";
   *
   * export function restorePosition(saved: { index: number; key: string | null; distance: number }): VirtualListPosition {
   *   return new VirtualListPosition(saved.index, saved.key, saved.distance);
   * }
   * ```
   */
  public constructor(index: number, key: string | null, distance: number, isFollowing?: boolean);
}

/**
 * The items of a long list, which a module supplies to the kit's list by
 * position, such as items 4,000 to 4,049, while it keeps them in its own
 * storage. The list reads only the items near its view, a few pages at a
 * time, and drops those it no longer shows; it keeps the height of every
 * item it measured but none of their content.
 *
 * A subclass answers {@link VirtualListSource.readAsync} and
 * {@link VirtualListSource.keyOf}, and reports every change to its items
 * with {@link VirtualListSource.reportInserted},
 * {@link VirtualListSource.reportRemoved} or
 * {@link VirtualListSource.reportUpdated} once it is made, so the list
 * reads them again. Positions run from 0 to the length less 1 and name
 * the same item until a change moves it.
 *
 * @typeParam T The type of the items.
 */
export declare abstract class VirtualListSource<T> {
  /**
   * How many items the list has, which grows and shrinks with the changes
   * the source reports.
   */
  public readonly length: Signal<number>;

  /**
   * The height in CSS pixels a row takes until it is measured.
   */
  public readonly estimate: number;

  /**
   * Creates the source with its length.
   *
   * @param length How many items the list has, a whole number of 0 or more.
   * @param estimate The height in CSS pixels a row takes until it is
   * measured, above 0; 120 when left out.
   * @throws VirtualListException synchronously when the length is not a
   * whole number of 0 or more, or the estimate is not a number above 0.
   * @example
   * ```ts
   * import { VirtualListSource } from "@noldova/ui.components.angular";
   *
   * export class LineSource extends VirtualListSource<string> {
   *   private readonly lines: readonly string[];
   *
   *   public constructor(lines: readonly string[]) {
   *     super(lines.length, 20);
   *     this.lines = lines;
   *   }
   *
   *   public readAsync(start: number, end: number): Promise<readonly string[]> {
   *     return Promise.resolve(this.lines.slice(start, end));
   *   }
   *
   *   public keyOf(item: string): string {
   *     return item;
   *   }
   * }
   * ```
   */
  public constructor(length: number, estimate?: number);

  /**
   * Reads the items from one position up to another. The list calls it for
   * a page at a time and never for a range outside the list.
   *
   * @param start The position of the first item to read.
   * @param end The position after the last item to read, above `start`.
   * @param abort Aborts once the list no longer needs the items, such as
   * when the person has scrolled away or the items changed; the source may
   * stop reading then, and the list ignores whatever it answers.
   * @returns A promise of exactly `end - start` items in order, which the
   * list keeps while it shows them and does not change. A rejection, or an
   * exception the call throws, shows the items as not loaded, with a way to
   * try again; an answer with another number of items is treated as a
   * {@link VirtualListException}.
   * @example
   * ```ts
   * import { VirtualListSource } from "@noldova/ui.components.angular";
   *
   * export interface IMessageStore {
   *   countMessages(): number;
   *   readMessagesAsync(start: number, end: number, abort: AbortSignal): Promise<readonly string[]>;
   * }
   *
   * export class MessageSource extends VirtualListSource<string> {
   *   private readonly store: IMessageStore;
   *
   *   public constructor(store: IMessageStore) {
   *     super(store.countMessages());
   *     this.store = store;
   *   }
   *
   *   public readAsync(start: number, end: number, abort: AbortSignal): Promise<readonly string[]> {
   *     return this.store.readMessagesAsync(start, end, abort);
   *   }
   *
   *   public keyOf(item: string): string {
   *     return item;
   *   }
   * }
   * ```
   */
  public abstract readAsync(start: number, end: number, abort: AbortSignal): Promise<readonly T[]>;

  /**
   * Gives an item's key, which stays the same while the item exists and
   * differs from every other item's, so a row keeps its state, such as its
   * focus, while the list moves it.
   *
   * @param item One of the items the source answered.
   * @returns The item's key.
   * @example
   * ```ts
   * import { VirtualListSource } from "@noldova/ui.components.angular";
   *
   * export class NoteSource extends VirtualListSource<{ readonly id: string; readonly text: string }> {
   *   public readAsync(): Promise<readonly { readonly id: string; readonly text: string }[]> {
   *     return Promise.resolve([]);
   *   }
   *
   *   public keyOf(item: { readonly id: string; readonly text: string }): string {
   *     return item.id;
   *   }
   * }
   * ```
   */
  public abstract keyOf(item: T): string;

  /**
   * Starts telling an observer about the changes the source reports, in the
   * order the observers started; observing twice is observing once.
   *
   * @param observer The observer, which the source keeps until it stops
   * observing.
   * @example
   * ```ts
   * import { ArrayVirtualListSource, type IVirtualListObserver } from "@noldova/ui.components.angular";
   *
   * export function follow(source: ArrayVirtualListSource<string>, observer: IVirtualListObserver): void {
   *   source.observe(observer);
   * }
   * ```
   */
  public observe(observer: IVirtualListObserver): void;

  /**
   * Stops telling an observer about changes and lets the source drop it;
   * an observer that wasn't observing is left alone.
   *
   * @param observer The observer.
   * @example
   * ```ts
   * import { ArrayVirtualListSource, type IVirtualListObserver } from "@noldova/ui.components.angular";
   *
   * export function stopFollowing(source: ArrayVirtualListSource<string>, observer: IVirtualListObserver): void {
   *   source.unobserve(observer);
   * }
   * ```
   */
  public unobserve(observer: IVirtualListObserver): void;

  /**
   * Reports items added to the source's storage: the length grows by the
   * count, then each observer is told.
   *
   * @param at The position of the first added item, from 0 to the length
   * before the change.
   * @param count How many items were added, a whole number of 1 or more.
   * @throws VirtualListException synchronously when the position is outside
   * the list or the count is not a whole number of 1 or more; nothing
   * changes then.
   * @throws Whatever an observer threw, synchronously, once every observer
   * was told; the change stays made, and the error is the first observer's
   * when several throw.
   * @example
   * ```ts
   * import type { VirtualListSource } from "@noldova/ui.components.angular";
   *
   * export function reportOlderHistory(source: VirtualListSource<string>, count: number): void {
   *   source.reportInserted(0, count);
   * }
   * ```
   */
  public reportInserted(at: number, count: number): void;

  /**
   * Reports items removed from the source's storage: the length shrinks by
   * the count, then each observer is told.
   *
   * @param at The position the first removed item had.
   * @param count How many items were removed, a whole number of 1 or more,
   * all of them inside the list before the change.
   * @throws VirtualListException synchronously when the items were not all
   * inside the list or the count is not a whole number of 1 or more;
   * nothing changes then.
   * @throws Whatever an observer threw, synchronously, once every observer
   * was told; the change stays made, and the error is the first observer's
   * when several throw.
   * @example
   * ```ts
   * import type { VirtualListSource } from "@noldova/ui.components.angular";
   *
   * export function reportRewound(source: VirtualListSource<string>, from: number): void {
   *   source.reportRemoved(from, source.length() - from);
   * }
   * ```
   */
  public reportRemoved(at: number, count: number): void;

  /**
   * Reports items changed in place, such as a message that grew while it
   * streamed: each observer is told, and the list reads them again, showing
   * the items it had until the new ones arrive.
   *
   * @param at The position of the first changed item.
   * @param count How many items in a row changed, a whole number of 1 or
   * more, all of them inside the list.
   * @throws VirtualListException synchronously when the items are not all
   * inside the list or the count is not a whole number of 1 or more.
   * @throws Whatever an observer threw, synchronously, once every observer
   * was told; the change stays made, and the error is the first observer's
   * when several throw.
   * @example
   * ```ts
   * import type { VirtualListSource } from "@noldova/ui.components.angular";
   *
   * export function reportStreamed(source: VirtualListSource<string>): void {
   *   source.reportUpdated(source.length() - 1, 1);
   * }
   * ```
   */
  public reportUpdated(at: number, count: number): void;
}

/**
 * Marks the `ng-template` that draws each loaded row of a
 * {@link VirtualListComponent}, as `<ng-template [nolVirtualRow]="source"
 * let-item>`. Binding the list's source lets the template checker type the
 * item; the template also receives the row's `index`, `height`, `labelId`
 * and `descriptionId` ({@link IVirtualRowContext}).
 *
 * @typeParam T The type of the source's items.
 */
export declare class VirtualRowDirective<T> {
  /**
   * The template the list draws each loaded row with.
   */
  public readonly template: TemplateRef<IVirtualRowContext<T>>;

  /**
   * The source of the list the template belongs to, which types its item.
   */
  public readonly nolVirtualRow: InputSignal<VirtualListSource<T>>;

  /**
   * Whether the template gives an element the row's `descriptionId`, as
   * `[nolVirtualRowDescribed]="true"`, so a feed's articles are described by
   * it; false when not bound.
   */
  public readonly described: InputSignal<boolean>;

  /**
   * Whether a feed hides a loaded row, as
   * `[nolVirtualRowHidden]="isSteered"`, from the row's item: the row draws
   * nothing, takes no space and is no article, while its place still counts;
   * no row is hidden when not bound, nor in an options list.
   */
  public readonly hidden: InputSignal<(item: T) => boolean>;

  /**
   * Tells Angular's template checker that the template's context is an
   * {@link IVirtualRowContext} of the source's items; Angular calls it, a
   * module doesn't need to.
   *
   * @param _ The directive on the template.
   * @param _context The template's context.
   * @returns Always true.
   * @example
   * ```ts
   * import { VirtualRowDirective } from "@noldova/ui.components.angular";
   *
   * export function isRowContext(directive: VirtualRowDirective<string>, context: unknown): boolean {
   *   return VirtualRowDirective.ngTemplateContextGuard(directive, context);
   * }
   * ```
   */
  public static ngTemplateContextGuard<T>(_: VirtualRowDirective<T>, _context: unknown): _context is IVirtualRowContext<T>;
}
