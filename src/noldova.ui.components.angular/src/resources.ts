/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { FocusOrigin, InputModality } from "@angular/cdk/a11y";

import "@noldova/context.core";

import { CopyState } from "./app/enums/copy-state.js";
import { DiffSide } from "./app/enums/diff-side.js";
import { MarkdownNodeKind } from "./app/enums/markdown-node-kind.js";
import { ColorToken } from "./app/models/color-token.js";

export class Resources {
  public static readonly colorTokens: readonly ColorToken[] = [
    new ColorToken("--nol-window", "window"),
    new ColorToken("--nol-panel", "panel"),
    new ColorToken("--nol-raised", "raised"),
    new ColorToken("--nol-code", "code", "window"),
    new ColorToken("--nol-code-header", "code-header", "raised"),
    new ColorToken("--nol-code-header-raised", "code-header-raised", "code-header"),
    new ColorToken("--nol-attachment", "attachment", "raised"),
    new ColorToken("--nol-code-comment", "code-comment"),
    new ColorToken("--nol-code-keyword", "code-keyword"),
    new ColorToken("--nol-code-control", "code-control"),
    new ColorToken("--nol-code-string", "code-string"),
    new ColorToken("--nol-code-number", "code-number"),
    new ColorToken("--nol-code-type", "code-type"),
    new ColorToken("--nol-code-function", "code-function"),
    new ColorToken("--nol-code-variable", "code-variable"),
    new ColorToken("--nol-code-regex", "code-regex"),
    new ColorToken("--nol-code-meta", "code-meta"),
    new ColorToken("--nol-text-selection", "text-selection"),
    new ColorToken("--nol-text-selection-foreground", "text-selection-foreground"),
    new ColorToken("--nol-terminal-background", "terminal-background", "panel"),
    new ColorToken("--nol-terminal-foreground", "terminal-foreground", "text"),
    new ColorToken("--nol-terminal-cursor", "terminal-cursor", "accent"),
    new ColorToken("--nol-terminal-selection", "terminal-selection", "selected"),
    new ColorToken("--nol-terminal-selection-foreground", "terminal-selection-foreground", "text"),
    new ColorToken("--nol-terminal-ansi-black", "terminal-ansi-black"),
    new ColorToken("--nol-terminal-ansi-red", "terminal-ansi-red"),
    new ColorToken("--nol-terminal-ansi-green", "terminal-ansi-green"),
    new ColorToken("--nol-terminal-ansi-yellow", "terminal-ansi-yellow"),
    new ColorToken("--nol-terminal-ansi-blue", "terminal-ansi-blue"),
    new ColorToken("--nol-terminal-ansi-magenta", "terminal-ansi-magenta"),
    new ColorToken("--nol-terminal-ansi-cyan", "terminal-ansi-cyan"),
    new ColorToken("--nol-terminal-ansi-white", "terminal-ansi-white"),
    new ColorToken("--nol-terminal-ansi-bright-black", "terminal-ansi-bright-black"),
    new ColorToken("--nol-terminal-ansi-bright-red", "terminal-ansi-bright-red"),
    new ColorToken("--nol-terminal-ansi-bright-green", "terminal-ansi-bright-green"),
    new ColorToken("--nol-terminal-ansi-bright-yellow", "terminal-ansi-bright-yellow"),
    new ColorToken("--nol-terminal-ansi-bright-blue", "terminal-ansi-bright-blue"),
    new ColorToken("--nol-terminal-ansi-bright-magenta", "terminal-ansi-bright-magenta"),
    new ColorToken("--nol-terminal-ansi-bright-cyan", "terminal-ansi-bright-cyan"),
    new ColorToken("--nol-terminal-ansi-bright-white", "terminal-ansi-bright-white"),
    new ColorToken("--nol-text", "text"),
    new ColorToken("--nol-text-strong", "text-strong", "text"),
    new ColorToken("--nol-text-muted", "text-muted"),
    new ColorToken("--nol-icon-color", "icon-color", "text"),
    new ColorToken("--nol-card-border", "card-border", "widget-border"),
    new ColorToken("--nol-border", "border"),
    new ColorToken("--nol-accent", "accent"),
    new ColorToken("--nol-sash-active", "sash-active", "accent"),
    new ColorToken("--nol-link", "link"),
    new ColorToken("--nol-mention", "mention", "accent"),
    new ColorToken("--nol-hover", "hover"),
    new ColorToken("--nol-selected", "selected", "list-active"),
    new ColorToken("--nol-toolbar-hover", "toolbar-hover"),
    new ColorToken("--nol-scrollbar", "scrollbar"),
    new ColorToken("--nol-scrollbar-active", "scrollbar-active", "scrollbar"),
    new ColorToken("--nol-title-bar", "title-bar"),
    new ColorToken("--nol-title-bar-text", "title-bar-text"),
    new ColorToken("--nol-input", "input"),
    new ColorToken("--nol-input-border", "input-border"),
    new ColorToken("--nol-input-text", "input-text"),
    new ColorToken("--nol-placeholder", "placeholder"),
    new ColorToken("--nol-button", "button"),
    new ColorToken("--nol-button-text", "button-text"),
    new ColorToken("--nol-button-hover", "button-hover"),
    new ColorToken("--nol-button-secondary", "button-secondary"),
    new ColorToken("--nol-button-secondary-text", "button-secondary-text"),
    new ColorToken("--nol-button-secondary-hover", "button-secondary-hover"),
    new ColorToken("--nol-button-danger-text", "button-danger-text", "panel"),
    new ColorToken("--nol-dropdown", "dropdown", "input"),
    new ColorToken("--nol-dropdown-border", "dropdown-border", "input-border"),
    new ColorToken("--nol-dropdown-list", "dropdown-list", "input"),
    new ColorToken("--nol-list-active", "list-active"),
    new ColorToken("--nol-list-active-text", "list-active-text"),
    new ColorToken("--nol-list-highlight", "list-highlight"),
    new ColorToken("--nol-button-border", "button-border"),
    new ColorToken("--nol-setting-title", "setting-title", "text"),
    new ColorToken("--nol-hover-widget", "hover-widget", "raised"),
    new ColorToken("--nol-hover-widget-border", "hover-widget-border", "widget-border"),
    new ColorToken("--nol-quick-input", "quick-input", "raised"),
    new ColorToken("--nol-quick-input-key-border", "quick-input-key-border", "widget-border"),
    new ColorToken("--nol-menu-separator", "menu-separator", "widget-border"),
    new ColorToken("--nol-widget-shadow", "widget-shadow"),
    new ColorToken("--nol-widget-border", "widget-border", "card-border"),
    new ColorToken("--nol-dialog", "dialog", "raised"),
    new ColorToken("--nol-menu", "menu"),
    new ColorToken("--nol-menu-text", "menu-text"),
    new ColorToken("--nol-menu-border", "menu-border"),
    new ColorToken("--nol-checkbox", "checkbox"),
    new ColorToken("--nol-checkbox-border", "checkbox-border"),
    new ColorToken("--nol-switch-knob", "switch-knob"),
    new ColorToken("--nol-badge", "badge"),
    new ColorToken("--nol-badge-text", "badge-text"),
    new ColorToken("--nol-progress", "progress", "accent"),
    new ColorToken("--nol-notification", "notification"),
    new ColorToken("--nol-notification-border", "notification-border"),
    new ColorToken("--nol-error", "error"),
    new ColorToken("--nol-removed", "removed", "error"),
    new ColorToken("--nol-added", "added"),
    new ColorToken("--nol-status-ok", "status-ok"),
    new ColorToken("--nol-status-failed", "status-failed"),
    new ColorToken("--nol-warning", "warning"),
    new ColorToken("--nol-docking-preview", "docking-preview", "selected"),
    new ColorToken("--nol-docking-preview-border", "docking-preview-border", "accent"),
    new ColorToken("--nol-author-1", "author-1", "accent"),
    new ColorToken("--nol-author-2", "author-2", "accent"),
    new ColorToken("--nol-author-3", "author-3", "accent"),
    new ColorToken("--nol-author-4", "author-4", "accent"),
    new ColorToken("--nol-author-5", "author-5", "accent"),
    new ColorToken("--nol-author-6", "author-6", "accent"),
    new ColorToken("--nol-author-7", "author-7", "accent"),
    new ColorToken("--nol-author-8", "author-8", "accent"),
    new ColorToken("--nol-avatar-default", "avatar-default", "selected"),
    new ColorToken("--nol-avatar-default-text", "avatar-default-text", "text"),
    new ColorToken("--nol-avatar-teal", "avatar-teal", "avatar-default"),
    new ColorToken("--nol-avatar-teal-text", "avatar-teal-text", "avatar-default-text"),
    new ColorToken("--nol-avatar-green", "avatar-green", "avatar-default"),
    new ColorToken("--nol-avatar-green-text", "avatar-green-text", "avatar-default-text"),
    new ColorToken("--nol-avatar-lime", "avatar-lime", "avatar-default"),
    new ColorToken("--nol-avatar-lime-text", "avatar-lime-text", "avatar-default-text"),
    new ColorToken("--nol-avatar-amber", "avatar-amber", "avatar-default"),
    new ColorToken("--nol-avatar-amber-text", "avatar-amber-text", "avatar-default-text"),
    new ColorToken("--nol-avatar-orange", "avatar-orange", "avatar-default"),
    new ColorToken("--nol-avatar-orange-text", "avatar-orange-text", "avatar-default-text"),
    new ColorToken("--nol-avatar-red", "avatar-red", "avatar-default"),
    new ColorToken("--nol-avatar-red-text", "avatar-red-text", "avatar-default-text"),
    new ColorToken("--nol-avatar-rose", "avatar-rose", "avatar-default"),
    new ColorToken("--nol-avatar-rose-text", "avatar-rose-text", "avatar-default-text"),
    new ColorToken("--nol-avatar-pink", "avatar-pink", "avatar-default"),
    new ColorToken("--nol-avatar-pink-text", "avatar-pink-text", "avatar-default-text"),
    new ColorToken("--nol-avatar-purple", "avatar-purple", "avatar-default"),
    new ColorToken("--nol-avatar-purple-text", "avatar-purple-text", "avatar-default-text"),
    new ColorToken("--nol-avatar-violet", "avatar-violet", "avatar-default"),
    new ColorToken("--nol-avatar-violet-text", "avatar-violet-text", "avatar-default-text"),
    new ColorToken("--nol-avatar-indigo", "avatar-indigo", "avatar-default"),
    new ColorToken("--nol-avatar-indigo-text", "avatar-indigo-text", "avatar-default-text"),
    new ColorToken("--nol-avatar-cyan", "avatar-cyan", "avatar-default"),
    new ColorToken("--nol-avatar-cyan-text", "avatar-cyan-text", "avatar-default-text")
  ];
  public static readonly lookTokens: readonly string[] = [
    "radius-hover",
    "radius-small",
    "radius-medium",
    "radius-large",
    "space-1",
    "space-2",
    "space-3",
    "space-4",
    "space-6",
    "pill-padding",
    "border-width",
    "shadow-large",
    "shadow-xlarge",
    "backdrop",
    "overlay",
    "overlay-text",
    "overlay-control",
    "overlay-control-hover",
    "overlay-control-text",
    "panel-card-gap",
    "panel-card-margin",
    "dock-left-width",
    "dock-right-width",
    "dock-bottom-height",
    "dock-min-size",
    "dock-strip-size",
    "document-min-size",
    "group-min-width",
    "group-min-height",
    "tab-height",
    "tab-pill",
    "tab-inset",
    "tab-max-width",
    "scrollbar-size",
    "tab-action-slot",
    "tab-close",
    "tab-image",
    "tab-image-radius",
    "tab-part-gap",
    "tab-spinner",
    "tab-spinner-stroke",
    "tab-underline",
    "icon",
    "icon-button",
    "sash",
    "sash-grip",
    "sash-grip-spacing",
    "docking-guide",
    "docking-guide-icon",
    "docking-plate-gap",
    "view-badge",
    "view-badge-dot",
    "view-badge-padding",
    "view-badge-text",
    "file-badge-text",
    "file-badge-glyph",
    "chip",
    "chip-padding",
    "chip-dot",
    "spinner",
    "spinner-ring",
    "spinner-stroke",
    "meter",
    "meter-height",
    "meter-gap",
    "avatar",
    "avatar-small",
    "avatar-byline",
    "choice-pill",
    "choice-pill-gap",
    "menu-padding",
    "menu-label-padding",
    "menu-item-height",
    "menu-item-inset",
    "menu-item-padding",
    "menu-trail-gap",
    "band-gap",
    "toolbar-button",
    "toolbar-gap",
    "toolbar-grip-gap",
    "menu-separator-spacing",
    "tooltip-width",
    "tooltip-padding",
    "tooltip-description-width",
    "tooltip-description-padding",
    "popover-width",
    "dialog-width",
    "dialog-title-padding",
    "dialog-body-padding",
    "dialog-actions-padding",
    "dialog-medium-width",
    "dialog-large-width",
    "dialog-large-height",
    "dialog-large-min-width",
    "dialog-large-min-height",
    "dialog-large-header-padding",
    "quick-input-width",
    "quick-input-margin",
    "quick-input-padding",
    "quick-input-gap",
    "quick-input-field-height",
    "quick-input-field-padding",
    "quick-input-glyph",
    "quick-input-row-height",
    "quick-input-row-padding",
    "quick-input-key-text",
    "quick-input-list-height",
    "quick-input-label-line",
    "mention-list-height",
    "mention-row-height",
    "field-height",
    "field-padding",
    "window-row-height",
    "message-collapsed-height",
    "message-picture-height",
    "status-bar-height",
    "status-bar-item-height",
    "status-bar-item-gap",
    "button-height",
    "button-compact-height",
    "button-padding",
    "checkbox-size",
    "switch-width",
    "switch-height",
    "switch-knob-size",
    "toast-width",
    "text-field-width",
    "select-width",
    "number-field-width",
    "setting-marker",
    "tree-row-height",
    "tree-indent",
    "row-gap",
    "section-header-height",
    "section-header-caret",
    "content-padding-inline",
    "document-padding-block",
    "view-padding-block",
    "settings-pages-width",
    "settings-content-width",
    "modules-list-width",
    "modules-detail-width",
    "dropdown-padding",
    "dropdown-row-height",
    "dropdown-row-padding",
    "settings-item-padding-inline",
    "settings-item-padding",
    "settings-item-description-gap",
    "settings-item-control-gap",
    "settings-heading-space",
    "settings-content-inset",
    "code-header-height",
    "reference-mark",
    "reference-mark-slot-radius",
    "reference-chip-max-width",
    "reference-card-width",
    "reference-card-radius",
    "reference-card-padding",
    "reference-card-top-gap",
    "reference-badge-height",
    "reference-item-gap",
    "reference-pill-height",
    "reference-pill-padding",
    "reference-dot",
    "reference-dot-gap"
  ];
  public static readonly defaultThemeId: string = "noldova.default";
  public static readonly lightScheme: string = "light";
  public static readonly darkScheme: string = "dark";
  public static readonly darkSchemeQuery: string = "(prefers-color-scheme: dark)";
  public static readonly changeEvent: "change" = "change";
  public static readonly defaultRootSize: number = 16;
  public static readonly defaultPanelSize: number = 13;
  public static readonly defaultMessageSize: number = 13;
  public static readonly defaultCodeSize: number = 12;
  public static readonly minimumTextSize: number = 12;
  public static readonly maximumTextSize: number = 18;
  public static readonly messageSizeVariable: string = "--nol-text-message";
  public static readonly codeSizeVariable: string = "--nol-text-code";
  public static readonly noldovaSansFonts: string = "\"Noldova Sans\", system-ui, \"Segoe UI\", Roboto, sans-serif";
  public static readonly noldovaMonoFonts: string = "\"Noldova Mono\", ui-monospace, \"Cascadia Mono\", Consolas, monospace";
  public static readonly closeGlyph: string = "close";
  public static readonly verticalOrientation: string = "vertical";
  public static readonly badgeLimit: number = 99;
  public static readonly badgeOverflow: string = "99+";
  public static readonly horizontalOrientation: string = "horizontal";
  public static readonly tooltipRestDelay: number = 500;
  public static readonly resizeEvent: string = "resize";
  public static readonly pointerLeaveEvent: "pointerleave" = "pointerleave";
  public static readonly scrollEvent: string = "scroll";
  public static readonly keyboardFocusOrigin: FocusOrigin = "keyboard";
  public static readonly mouseFocusOrigin: FocusOrigin = "mouse";
  public static readonly programFocusOrigin: FocusOrigin = "program";
  public static readonly keyboardModality: InputModality = "keyboard";
  public static readonly menuPaneClass: string = "nol-menu-pane";
  public static readonly ariaHiddenAttribute: string = "aria-hidden";
  public static readonly ariaIdSeparator: string = " ";
  public static readonly dropdownPaneClass: string = "nol-dropdown-pane";
  public static readonly nearestEdge: ScrollLogicalPosition = "nearest";
  public static readonly tabKey: string = "Tab";
  public static readonly spaceKey: string = " ";
  public static readonly twistieGlyph: string = "chevron_right";
  public static readonly trueValue: string = "true";
  public static readonly arrowDownKey: string = "ArrowDown";
  public static readonly arrowUpKey: string = "ArrowUp";
  public static readonly homeKey: string = "Home";
  public static readonly endKey: string = "End";
  public static readonly pageDownKey: string = "PageDown";
  public static readonly pageUpKey: string = "PageUp";
  public static readonly enterKey: string = "Enter";
  public static readonly escapeKey: string = "Escape";
  public static readonly keydownEvent: "keydown" = "keydown";
  public static readonly wordWrapGlyph: string = "wrap_text";
  public static readonly wordWrapLabel: string = "Word wrap";
  public static readonly codeBlockHeaderClass: string = "nol-code-block-header";
  public static readonly terminalOutputPaletteSize: number = 256;
  public static readonly terminalOutputAnsiTokens: readonly string[] = ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white", "bright-black", "bright-red",
    "bright-green", "bright-yellow", "bright-blue", "bright-magenta", "bright-cyan", "bright-white"].map(t => `var(--nol-terminal-ansi-${t})`);
  public static readonly terminalOutputForeground: string = "var(--nol-terminal-foreground)";
  public static readonly terminalOutputBackground: string = "var(--nol-terminal-background)";

  public static readonly copyGlyphs: Readonly<Record<CopyState, string>> = {
    [CopyState.Ready]: "content_copy",
    [CopyState.Copied]: "check",
    [CopyState.Failed]: "content_copy"
  };
  public static readonly copyLabels: Readonly<Record<CopyState, string>> = {
    [CopyState.Ready]: "Copy",
    [CopyState.Copied]: "Copied",
    [CopyState.Failed]: "Couldn't copy"
  };
  public static readonly copyFeedbackDuration: number = 1500;
  public static readonly codeThemeName: string = "noldova";
  public static readonly codeLoadFailureHold: number = 10_000;
  public static readonly linkReferenceSeparator: string = " · ";
  public static readonly linkReferenceCommentsGlyph: string = "chat_bubble";
  public static readonly linkReferenceActionGlyph: string = "open_in_new";
  public static readonly codeNoTokenizeTimeLimit: number = 0;
  public static readonly codeTokensKeySeparator: string = "\n";
  public static readonly codeLineBreak: string = "\n";
  public static readonly codeWorkerStartLimit: number = 10_000;
  public static readonly codeWorkerSilent: string = "it said nothing within 10 seconds of its start";
  public static readonly codeWorkerLoadFailure: string = "it did not load";
  public static readonly codeWorkerStartFailure: string = "it could not start";
  public static readonly codeWorkerUnreadAnswer: string = "the page could not read one of its answers";
  public static readonly codeLineClass: string = "nol-code-line";
  public static readonly markdownNestingLimit: number = 24;
  public static readonly markdownListDepthLimit: number = 8;
  public static readonly markdownQuoteDepthLimit: number = 8;
  public static readonly markdownRunLength: number = 100;
  public static readonly markdownOpenItems: number = 2;
  public static readonly markdownLoadFailureHold: number = 10_000;
  public static readonly markdownLinkProtocols: readonly string[] = ["http:", "https:", "mailto:"];
  public static readonly markdownNeverLinkProtocols: readonly string[] = ["file:", "javascript:", "data:", "vbscript:"];
  public static readonly markdownLineBreak: string = "\n";
  public static readonly markdownWhitespacePattern: RegExp = /\s/u;
  public static readonly markdownWordPattern: RegExp = /[\p{L}\p{N}]/u;
  public static readonly revealSkipAttribute: string = "data-nol-reveal-skip";
  public static readonly selectionChangeEvent: string = "selectionchange";
  public static readonly markdownTaskCheckIdPrefix: string = "nol-markdown-task-check-";
  public static readonly markdownBacktick: string = "`";
  public static readonly markdownInlineType: string = "inline";
  public static readonly markdownDefinitionType: string = "reference_definition";
  public static readonly markdownLinkSchemesKey: string = "linkSchemes";
  public static readonly markdownFileLinksKey: string = "fileLinks";
  public static readonly markdownTextReferencesKey: string = "textReferences";
  public static readonly markdownHrefAttribute: string = "href";
  public static readonly markdownMathKey: string = "math";
  public static readonly markdownFenceOpenKey: string = "open";
  public static readonly markdownTextType: string = "text";
  public static readonly markdownWordGap: string = " ";
  public static readonly markdownOpenKinds: ReadonlyMap<string, MarkdownNodeKind> = new Map([
    ["paragraph_open", MarkdownNodeKind.Paragraph],
    ["heading_open", MarkdownNodeKind.Heading],
    ["blockquote_open", MarkdownNodeKind.Quote],
    ["bullet_list_open", MarkdownNodeKind.BulletList],
    ["ordered_list_open", MarkdownNodeKind.OrderedList],
    ["list_item_open", MarkdownNodeKind.ListItem],
    ["table_open", MarkdownNodeKind.Table],
    ["thead_open", MarkdownNodeKind.TableHead],
    ["tbody_open", MarkdownNodeKind.TableBody],
    ["tr_open", MarkdownNodeKind.TableRow],
    ["th_open", MarkdownNodeKind.TableHeaderCell],
    ["td_open", MarkdownNodeKind.TableCell],
    ["em_open", MarkdownNodeKind.Emphasis],
    ["strong_open", MarkdownNodeKind.Strong],
    ["s_open", MarkdownNodeKind.Strikethrough],
    ["link_open", MarkdownNodeKind.Link]
  ]);
  public static readonly markdownPartKinds: ReadonlySet<MarkdownNodeKind> = new Set([MarkdownNodeKind.ListItem, MarkdownNodeKind.TableHead, MarkdownNodeKind.TableBody,
    MarkdownNodeKind.TableRow, MarkdownNodeKind.TableHeaderCell, MarkdownNodeKind.TableCell]);
  public static readonly markdownTextKinds: ReadonlySet<MarkdownNodeKind> = new Set([MarkdownNodeKind.Text, MarkdownNodeKind.Image]);
  public static readonly markdownInlineKinds: ReadonlySet<MarkdownNodeKind> = new Set([MarkdownNodeKind.Text, MarkdownNodeKind.SoftBreak, MarkdownNodeKind.HardBreak,
    MarkdownNodeKind.Emphasis, MarkdownNodeKind.Strong, MarkdownNodeKind.Strikethrough, MarkdownNodeKind.InlineCode, MarkdownNodeKind.Link, MarkdownNodeKind.Image,
    MarkdownNodeKind.Math, MarkdownNodeKind.MathDisplay]);
  public static readonly messageClockInterval: number = 30_000;
  public static readonly millisecondsPerSecond: number = 1000;
  public static readonly secondsPerMinute: number = 60;
  public static readonly secondsPerHour: number = 3600;
  public static readonly mentionMarker: string = "@";
  public static readonly mentionEscape: string = "\\";
  public static readonly mentionBacktick: string = "`";
  public static readonly mentionWordSeparator: string = " ";
  public static readonly mentionScheme: string = "mention:";
  public static readonly mentionIdParameter: string = "id";
  public static readonly authorColorCount: number = 8;
  public static readonly avatarColorParameter: string = "color";
  public static readonly messageCompleteText: string = "reply complete";
  public static readonly messageShowMoreLabel: string = "Show more";
  public static readonly messageShowLessLabel: string = "Show less";
  public static readonly contextMenuKey: string = "ContextMenu";
  public static readonly menuKey: string = "F10";
  public static readonly clickEvent: string = "click";
  public static readonly mousedownEvent: "mousedown" = "mousedown";
  public static readonly pointermoveEvent: "pointermove" = "pointermove";
  public static readonly secondaryButton: number = 2;
  public static readonly middleButton: number = 1;
  public static readonly primaryButton: number = 0;
  public static readonly blurEvent: "blur" = "blur";
  public static readonly treeZoomInterval: number = 16;
  public static readonly virtualListSlowRead: number = 250;
  public static readonly virtualListRowAttribute: string = "data-nol-row";
  public static readonly focusableSelector: string = "a[href], area[href], button, input, select, textarea, iframe, summary, [tabindex], [contenteditable=\"true\"]";
  public static readonly forcedColorsQuery: string = "(forced-colors: active)";
  public static readonly reducedMotionQuery: string = "(prefers-reduced-motion: reduce)";
  public static readonly rightToLeftSelector: string = ":dir(rtl)";
  public static readonly runningClockInterval: number = 1000;
  public static readonly toolCallLineBreak: string = "\n";
  public static readonly permissionAllowOnceId: string = "allow-once";
  public static readonly permissionAllowOnceLabel: string = "Allow once";
  public static readonly permissionAllowAlwaysId: string = "allow-always";
  public static readonly permissionDenyId: string = "deny";
  public static readonly permissionDenyLabel: string = "Deny";
  public static readonly permissionLineBreak: string = "\n";
  public static readonly rightToLeftDirection: "rtl" = "rtl";
  public static readonly leftToRightDirection: "ltr" = "ltr";
  public static readonly diffSideNames: Readonly<Record<DiffSide, string>> = {
    [DiffSide.Old]: "old",
    [DiffSide.New]: "new"
  };

  public static formatLookVariable(name: string): string {
    return `--nol-${name}`;
  }

  public static formatShapeAttribute(control: string): string {
    return `data-nol-${control}-shape`;
  }

  public static formatMissingThemeValue(themeId: string, name: string): string {
    return `The theme "${themeId}" has no value for "${name}".`;
  }

  public static formatTextSizeOutOfRange(parameterName: string, size: number): string {
    return `The ${parameterName} must be from ${Resources.minimumTextSize} to ${Resources.maximumTextSize} CSS pixels; ${size} is outside that range.`;
  }

  public static formatMentionOptionId(listId: string, index: number): string {
    return `${listId}-option-${index}`;
  }

  public static formatBadgeCount(count: number): string {
    return count > Resources.badgeLimit ? Resources.badgeOverflow : String(count);
  }

  public static formatCloseTab(label: string): string {
    return `Close ${label}`;
  }

  public static formatJoinedTooltip(text: string, detail: string | null): string {
    return String.isNullOrEmpty(detail) ? text : `${text}, ${detail}`;
  }

  public static formatAuthorColorOutOfRange(parameter: string, value: number): string {
    return `The ${parameter} must be a whole number from 1 to ${Resources.authorColorCount}, one of the author colors; ${value} is not.`;
  }

  public static formatDiffTextEmpty(subject: string): string {
    return `${subject} must not be empty.`;
  }

  public static formatDiffCountInvalid(subject: string, value: number): string {
    return `${subject} must be a whole number of 0 or more, not ${value}.`;
  }

  public static formatCodeWorkerFailure(reason: string): string {
    return `The code highlighting worker failed: ${reason}. Code is highlighted on the page from now on.`;
  }

  public static formatDiffLimitInvalid(subject: string, value: number): string {
    return `${subject} must be a whole number of 1 or more, not ${value}.`;
  }

  public static formatDiffHunkNumbering(id: string, side: string, start: number, length: number): string {
    return length === 0
      ? `The hunk "${id}" has no ${side} lines, so none of its lines may be numbered on the ${side} side.`
      : `The hunk "${id}" must number its ${side} lines ${start} to ${start + length - 1}, one each, in order.`;
  }

  public static formatDiffReviewOtherFile(requested: string, file: string): string {
    return `The review request is for the file "${requested}", not "${file}".`;
  }

  public static formatDiffReviewUnknownHunk(hunkId: string, fileId: string): string {
    return `The file "${fileId}" has no hunk "${hunkId}".`;
  }

  public static formatLightDark(light: string, dark: string): string {
    return `light-dark(${light}, ${dark})`;
  }

  public static formatLinkReferenceAdded(lines: number): string {
    return `+${lines}`;
  }

  public static formatLinkReferenceRemoved(lines: number): string {
    return `−${lines}`;
  }

  public static formatLinkReferenceFiles(files: number): string {
    return files === 1 ? "1 file" : `${files} files`;
  }

  public static formatLinkReferenceTextEmpty(subject: string): string {
    return `${subject} must not be empty.`;
  }

  public static formatLinkReferenceColorInvalid(subject: string, value: string): string {
    return `${subject} must be a color the browser accepts, not "${value}".`;
  }

  public static formatLinkReferenceDuration(seconds: number): string {
    const whole = Math.round(seconds);
    const hours = Math.floor(whole / Resources.secondsPerHour);
    const minutes = Math.floor(whole % Resources.secondsPerHour / Resources.secondsPerMinute);
    if (hours > 0)
      return `${hours}h ${minutes}m`;
    return minutes > 0 ? `${minutes}m ${whole % Resources.secondsPerMinute}s` : `${whole}s`;
  }
}
