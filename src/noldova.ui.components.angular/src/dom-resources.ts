/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { FocusOrigin } from "@angular/cdk/a11y";

import { ColorToken } from "./app/models/color-token.js";

export class DomResources {
  public static readonly rightToLeftDirection: "rtl" = "rtl";

  public static readonly leftToRightDirection: "ltr" = "ltr";

  public static readonly rightToLeftSelector: string = ":dir(rtl)";

  public static readonly ariaHiddenAttribute: string = "aria-hidden";

  public static readonly ariaIdSeparator: string = " ";

  public static readonly escapeKey: string = "Escape";

  public static readonly keyboardFocusOrigin: FocusOrigin = "keyboard";

  public static readonly keydownEvent: "keydown" = "keydown";

  public static readonly pointerLeaveEvent: "pointerleave" = "pointerleave";

  public static readonly pointermoveEvent: "pointermove" = "pointermove";

  public static readonly trueValue: string = "true";

  public static readonly contentMovedEvent: string = "nol-content-moved";

  public static readonly tooltipRestDelay: number = 500;

  public static readonly resizeEvent: string = "resize";

  public static readonly scrollEvent: string = "scroll";

  public static formatLookVariable(name: string): string {
    return `--nol-${name}`;
  }

  public static readonly colorTokens: readonly ColorToken[] = [
    DomResources.color("window"),
    DomResources.color("panel"),
    DomResources.color("raised"),
    DomResources.color("card", "raised"),
    DomResources.color("code", "window"),
    DomResources.color("code-header", "raised"),
    DomResources.color("code-header-raised", "code-header"),
    DomResources.color("attachment", "raised"),
    DomResources.color("code-comment"),
    DomResources.color("code-keyword"),
    DomResources.color("code-control"),
    DomResources.color("code-string"),
    DomResources.color("code-number"),
    DomResources.color("code-type"),
    DomResources.color("code-function"),
    DomResources.color("code-variable"),
    DomResources.color("code-regex"),
    DomResources.color("code-meta"),
    DomResources.color("text-selection"),
    DomResources.color("text-selection-foreground"),
    DomResources.color("terminal-background", "panel"),
    DomResources.color("terminal-foreground", "text"),
    DomResources.color("terminal-cursor", "accent"),
    DomResources.color("terminal-selection", "selected"),
    DomResources.color("terminal-selection-foreground", "text"),
    DomResources.color("terminal-ansi-black"),
    DomResources.color("terminal-ansi-red"),
    DomResources.color("terminal-ansi-green"),
    DomResources.color("terminal-ansi-yellow"),
    DomResources.color("terminal-ansi-blue"),
    DomResources.color("terminal-ansi-magenta"),
    DomResources.color("terminal-ansi-cyan"),
    DomResources.color("terminal-ansi-white"),
    DomResources.color("terminal-ansi-bright-black"),
    DomResources.color("terminal-ansi-bright-red"),
    DomResources.color("terminal-ansi-bright-green"),
    DomResources.color("terminal-ansi-bright-yellow"),
    DomResources.color("terminal-ansi-bright-blue"),
    DomResources.color("terminal-ansi-bright-magenta"),
    DomResources.color("terminal-ansi-bright-cyan"),
    DomResources.color("terminal-ansi-bright-white"),
    DomResources.color("terminal-dark-background"),
    DomResources.color("terminal-dark-foreground"),
    DomResources.color("terminal-dark-cursor"),
    DomResources.color("terminal-dark-selection"),
    DomResources.color("terminal-dark-selection-foreground"),
    DomResources.color("terminal-dark-ansi-black"),
    DomResources.color("terminal-dark-ansi-red"),
    DomResources.color("terminal-dark-ansi-green"),
    DomResources.color("terminal-dark-ansi-yellow"),
    DomResources.color("terminal-dark-ansi-blue"),
    DomResources.color("terminal-dark-ansi-magenta"),
    DomResources.color("terminal-dark-ansi-cyan"),
    DomResources.color("terminal-dark-ansi-white"),
    DomResources.color("terminal-dark-ansi-bright-black"),
    DomResources.color("terminal-dark-ansi-bright-red"),
    DomResources.color("terminal-dark-ansi-bright-green"),
    DomResources.color("terminal-dark-ansi-bright-yellow"),
    DomResources.color("terminal-dark-ansi-bright-blue"),
    DomResources.color("terminal-dark-ansi-bright-magenta"),
    DomResources.color("terminal-dark-ansi-bright-cyan"),
    DomResources.color("terminal-dark-ansi-bright-white"),
    DomResources.color("text"),
    DomResources.color("text-strong", "text"),
    DomResources.color("text-muted"),
    DomResources.color("icon-color", "text"),
    DomResources.color("card-border", "widget-border"),
    DomResources.color("border"),
    DomResources.color("accent"),
    DomResources.color("sash-active", "accent"),
    DomResources.color("link"),
    DomResources.color("mention", "accent"),
    DomResources.color("hover"),
    DomResources.color("selected", "list-active"),
    DomResources.color("toolbar-hover"),
    DomResources.color("scrollbar"),
    DomResources.color("scrollbar-active", "scrollbar"),
    DomResources.color("title-bar"),
    DomResources.color("title-bar-text"),
    DomResources.color("input"),
    DomResources.color("input-border"),
    DomResources.color("input-text"),
    DomResources.color("placeholder"),
    DomResources.color("button"),
    DomResources.color("button-text"),
    DomResources.color("button-hover"),
    DomResources.color("button-secondary"),
    DomResources.color("button-secondary-text"),
    DomResources.color("button-secondary-hover"),
    DomResources.color("button-danger-text", "panel"),
    DomResources.color("dropdown", "input"),
    DomResources.color("dropdown-border", "input-border"),
    DomResources.color("dropdown-list", "input"),
    DomResources.color("list-active"),
    DomResources.color("list-active-text"),
    DomResources.color("list-highlight"),
    DomResources.color("button-border"),
    DomResources.color("setting-title", "text"),
    DomResources.color("hover-widget", "raised"),
    DomResources.color("hover-widget-border", "widget-border"),
    DomResources.color("quick-input", "raised"),
    DomResources.color("quick-input-key-border", "widget-border"),
    DomResources.color("menu-separator", "widget-border"),
    DomResources.color("widget-shadow"),
    DomResources.color("widget-border", "card-border"),
    DomResources.color("dialog", "raised"),
    DomResources.color("menu"),
    DomResources.color("menu-text"),
    DomResources.color("menu-border"),
    DomResources.color("checkbox"),
    DomResources.color("checkbox-border"),
    DomResources.color("switch-knob"),
    DomResources.color("badge"),
    DomResources.color("badge-text"),
    DomResources.color("progress", "accent"),
    DomResources.color("notification"),
    DomResources.color("notification-border"),
    DomResources.color("error"),
    DomResources.color("removed", "error"),
    DomResources.color("added"),
    DomResources.color("status-ok"),
    DomResources.color("status-failed"),
    DomResources.color("warning"),
    DomResources.color("warning-background"),
    DomResources.color("error-background"),
    DomResources.color("docking-preview", "selected"),
    DomResources.color("docking-preview-border", "accent"),
    DomResources.color("author-1", "accent"),
    DomResources.color("author-2", "accent"),
    DomResources.color("author-3", "accent"),
    DomResources.color("author-4", "accent"),
    DomResources.color("author-5", "accent"),
    DomResources.color("author-6", "accent"),
    DomResources.color("author-7", "accent"),
    DomResources.color("author-8", "accent"),
    DomResources.color("swatch-blue", "author-1"),
    DomResources.color("swatch-teal", "author-2"),
    DomResources.color("swatch-green", "author-3"),
    DomResources.color("swatch-amber", "author-4"),
    DomResources.color("swatch-orange", "author-5"),
    DomResources.color("swatch-red", "author-6"),
    DomResources.color("swatch-magenta", "author-7"),
    DomResources.color("swatch-purple", "author-8"),
    DomResources.color("avatar-default", "selected"),
    DomResources.color("avatar-default-text", "text"),
    DomResources.color("avatar-teal", "avatar-default"),
    DomResources.color("avatar-teal-text", "avatar-default-text"),
    DomResources.color("avatar-green", "avatar-default"),
    DomResources.color("avatar-green-text", "avatar-default-text"),
    DomResources.color("avatar-lime", "avatar-default"),
    DomResources.color("avatar-lime-text", "avatar-default-text"),
    DomResources.color("avatar-amber", "avatar-default"),
    DomResources.color("avatar-amber-text", "avatar-default-text"),
    DomResources.color("avatar-orange", "avatar-default"),
    DomResources.color("avatar-orange-text", "avatar-default-text"),
    DomResources.color("avatar-red", "avatar-default"),
    DomResources.color("avatar-red-text", "avatar-default-text"),
    DomResources.color("avatar-rose", "avatar-default"),
    DomResources.color("avatar-rose-text", "avatar-default-text"),
    DomResources.color("avatar-pink", "avatar-default"),
    DomResources.color("avatar-pink-text", "avatar-default-text"),
    DomResources.color("avatar-purple", "avatar-default"),
    DomResources.color("avatar-purple-text", "avatar-default-text"),
    DomResources.color("avatar-violet", "avatar-default"),
    DomResources.color("avatar-violet-text", "avatar-default-text"),
    DomResources.color("avatar-indigo", "avatar-default"),
    DomResources.color("avatar-indigo-text", "avatar-default-text"),
    DomResources.color("avatar-cyan", "avatar-default"),
    DomResources.color("avatar-cyan-text", "avatar-default-text")
  ];

  private static color(key: string, fallbackKey: string | null = null): ColorToken {
    return new ColorToken(`--nol-${key}`, key, fallbackKey);
  }
}
