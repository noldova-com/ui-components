/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ApplicationRef } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideMarkdown } from "@noldova/ui.components.angular/markdown";
import { userEvent } from "vitest/browser";

import { ComponentPageComponent } from "../../../../src/app/components/component-page/component-page.component.js";
import { ApiReference } from "../../../../src/app/models/api-reference.js";
import { DocsCatalog } from "../../../../src/app/models/docs-catalog.js";
import type { DocsComponentPage } from "../../../../src/app/models/docs-component-page.js";
import { MessageResources } from "../../../../../noldova.ui.components.angular/src/app/components/message/message.resources.js";
import { VirtualListResources } from "../../../../../noldova.ui.components.angular/src/app/components/virtual-list/virtual-list.resources.js";
import { CopyState } from "../../../../../noldova.ui.components.angular/src/app/enums/copy-state.js";
import { DocsFixture } from "../../../fixtures/docs.fixture.js";

describe("ComponentPageComponent", () => {
  const roleOf = (element: Element): string | undefined => element.tagName === "TH"
    ? element.getAttribute("scope") === "row" ? "rowheader" : "columnheader"
    : new Map([["TABLE", "table"], ["THEAD", "rowgroup"], ["TBODY", "rowgroup"], ["TR", "row"], ["TD", "cell"]]).get(element.tagName);

  const expectations: Readonly<Record<string, {
    readonly specimen: string;
    readonly controls: string;
    readonly roles: readonly string[];
    readonly keys: readonly string[];
    readonly inputs: readonly string[];
    readonly outputs: readonly string[];
  }>> = {
    ButtonComponent: {
      specimen: "Button",
      controls: "button[nol-button], a[nol-button]",
      roles: ["button.nol-button", "a.nol-button[href]", "[nolButtonIcon][aria-hidden=\"true\"]"],
      keys: ["Tab", "Enter", "Space"],
      inputs: ["variant", "overlay", "backdrop", "danger", "size", "busy"],
      outputs: []
    },
    IconButtonComponent: {
      specimen: "Icon button",
      controls: "button.nol-icon-button",
      roles: ["button.nol-icon-button[aria-label=\"Refresh\"]", "button.nol-icon-button[aria-pressed=\"false\"]", "button.nol-icon-button[aria-busy=\"true\"]",
        ".nol-icon-button-glyph[aria-hidden=\"true\"]", "button.nol-icon-button[disabled]"],
      keys: ["Tab", "Enter", "Space"],
      inputs: ["icon", "label", "pressed", "filled", "overlay", "backdrop", "buttonHeight", "danger", "tabAction", "busy", "busyPressable"],
      outputs: []
    },
    SplitButtonComponent: {
      specimen: "Split button",
      controls: "nol-split-button",
      roles: ["button.nol-split-button-main[aria-label=\"New terminal\"]", "button.nol-split-button-arrow[aria-label=\"Choose a terminal\"][aria-haspopup=\"menu\"][aria-expanded=\"false\"]",
        "button.nol-split-button-main[aria-disabled=\"true\"]", "button.nol-split-button-main[aria-busy=\"true\"]"],
      keys: ["Tab", "Enter", "Space", "Arrow Down", "Arrow Up", "Escape"],
      inputs: ["icon", "label", "tooltip", "menuLabel", "menu", "menuAlignment", "tooltipSide", "disabled", "busy"],
      outputs: ["triggered"]
    },
    TextFieldComponent: {
      specimen: "Text field",
      controls: ".nol-text-field",
      roles: ["label > input.nol-text-field", "label > textarea.nol-text-field", "input.nol-text-field[disabled]", "input.nol-text-field[aria-invalid=\"true\"][aria-describedby]"],
      keys: ["Tab"],
      inputs: [],
      outputs: []
    },
    TextFieldBoxComponent: {
      specimen: "Text field",
      controls: "nol-text-field-box",
      roles: ["nol-text-field-box > input.nol-text-field[aria-label]", "nol-text-field-box > button.nol-icon-button[aria-label]", "nol-text-field-box > .nol-text-field-end[id]",
        "nol-text-field-box > input.nol-text-field[aria-describedby=\"nol-docs-text-field-box-unit\"]", "nol-text-field-box > .nol-text-field-start[aria-hidden=\"true\"]"],
      keys: ["Tab"],
      inputs: ["icon"],
      outputs: []
    },
    FieldMessageComponent: {
      specimen: "Text field",
      controls: "nol-field-message",
      roles: ["nol-field-message[role=\"alert\"]", "nol-field-message.nol-field-message-note:not([role])",
        "input.nol-text-field[aria-invalid=\"true\"][aria-describedby=\"nol-docs-field-message-error\"]"],
      keys: ["Tab"],
      inputs: ["kind"],
      outputs: []
    },
    CheckboxComponent: {
      specimen: "Checkbox",
      controls: "nol-checkbox",
      roles: ["label.nol-checkbox-label input[type=\"checkbox\"]", "input[type=\"checkbox\"].nol-checkbox-box[aria-disabled=\"true\"]", ".nol-checkbox-mark[aria-hidden=\"true\"]"],
      keys: ["Tab", "Space"],
      inputs: ["checked", "disabled"],
      outputs: ["checkedChange"]
    },
    SwitchComponent: {
      specimen: "Switch",
      controls: "nol-switch",
      roles: ["label.nol-switch-label input[type=\"checkbox\"][role=\"switch\"]", "input[role=\"switch\"][aria-label=\"Sounds\"]", "input[role=\"switch\"][aria-disabled=\"true\"][aria-describedby]",
        ".nol-switch-reason[id]", ".nol-switch-knob[aria-hidden=\"true\"]"],
      keys: ["Tab", "Space"],
      inputs: ["checked", "disabled", "disabledReason", "label"],
      outputs: ["checkedChange"]
    },
    RadioComponent: {
      specimen: "Radio",
      controls: "nol-radio",
      roles: ["nol-radio-group[role=\"radiogroup\"][aria-label=\"Line endings\"]", "label.nol-radio-label input[type=\"radio\"]", "nol-radio-group input[type=\"radio\"][name]",
        "input[type=\"radio\"][aria-disabled=\"true\"]", ".nol-radio-dot[aria-hidden=\"true\"]"],
      keys: ["Tab", "Arrow Down", "Arrow Up", "Space"],
      inputs: ["value", "checked", "disabled"],
      outputs: ["checkedChange"]
    },
    ChoiceRowComponent: {
      specimen: "Choice row",
      controls: "nol-choice-row",
      roles: ["nol-radio-group[role=\"radiogroup\"] nol-choice-row input[type=\"radio\"]", "[role=\"group\"][aria-labelledby] nol-choice-row input[type=\"checkbox\"]",
        "nol-choice-row.nol-choice-row-disabled input[aria-disabled=\"true\"]", "nol-choice-row label .nol-choice-row-description"],
      keys: ["Tab", "Arrow Down", "Arrow Up", "Space"],
      inputs: ["type", "value", "label", "description", "checked", "disabled"],
      outputs: ["checkedChange"]
    },
    RadioGroupComponent: {
      specimen: "Radio",
      controls: "nol-radio-group",
      roles: ["nol-radio-group[role=\"radiogroup\"][aria-label=\"Merge method\"]", "nol-radio-group[role=\"radiogroup\"][aria-label=\"Layout\"]", "nol-radio-group input[type=\"radio\"][name]"],
      keys: ["Tab", "Arrow Down", "Arrow Up", "Space"],
      inputs: ["label", "value"],
      outputs: []
    },
    ChoicePillsComponent: {
      specimen: "Choice pills",
      controls: "nol-choice-pills",
      roles: ["[role=\"radiogroup\"][aria-label=\"Effort\"]", "button.nol-choice-pill[role=\"radio\"][aria-checked=\"true\"][tabindex=\"0\"]",
        "button.nol-choice-pill[role=\"radio\"][aria-checked=\"false\"][tabindex=\"-1\"]", "[role=\"radiogroup\"][aria-describedby=\"nol-docs-choice-pills-note\"]"],
      keys: ["Tab", "Arrow Right", "Arrow Left", "Home", "End"],
      inputs: ["options", "value", "label", "describedBy"],
      outputs: ["valueChange"]
    },
    SelectComponent: {
      specimen: "Select",
      controls: "nol-select",
      roles: ["button.nol-select-button[aria-haspopup=\"listbox\"][aria-expanded=\"false\"]", "button.nol-select-button[aria-label=\"Pace, Balanced\"]",
        "button.nol-select-button[aria-describedby=\"nol-docs-select-note\"]", ".nol-select-arrow[aria-hidden=\"true\"]"],
      keys: ["Tab", "Enter", "Space", "Arrow Down", "Arrow Up", "Home", "End", "A letter", "Escape"],
      inputs: ["options", "value", "label", "describedBy", "disabled"],
      outputs: ["valueChange"]
    },
    MenuComponent: {
      specimen: "Menu",
      controls: "nol-menu, button[aria-haspopup=\"menu\"]",
      roles: ["button[nol-button][aria-haspopup=\"menu\"][aria-expanded=\"false\"]", "nol-menu[role=\"menu\"][aria-label=\"Panel\"]", "nol-menu-separator[role=\"separator\"]",
        "button[nol-menu-item][role=\"menuitemcheckbox\"][aria-checked=\"false\"]"],
      keys: ["Enter", "Space", "Arrow Down", "Arrow Up", "Home", "End", "A letter", "Escape", "Tab"],
      inputs: ["minWidth"],
      outputs: []
    },
    MenuItemComponent: {
      specimen: "Menu",
      controls: "button[nol-menu-item], button[aria-haspopup=\"menu\"]",
      roles: ["button[nol-menu-item][role=\"menuitem\"]", "button[nol-menu-item] .nol-menu-item-icon[aria-hidden=\"true\"]", "button[nol-menu-item].nol-menu-item-danger",
        "button[nol-button][aria-haspopup=\"menu\"][aria-expanded=\"false\"]"],
      keys: ["Enter", "Space", "Arrow Right", "Arrow Left", "Escape"],
      inputs: ["label", "icon", "checked", "checkbox", "shortcut", "description", "value", "tag", "danger"],
      outputs: []
    },
    MenuGroupComponent: {
      specimen: "Menu",
      controls: "nol-menu-group, button[aria-haspopup=\"menu\"]",
      roles: ["nol-menu-group[role=\"group\"][aria-labelledby]", "nol-menu-group .nol-menu-label[aria-hidden=\"true\"]", "button.nol-icon-button[aria-label=\"View options\"][aria-haspopup=\"menu\"]"],
      keys: ["Arrow Down", "Arrow Up", "Home", "End", "Escape"],
      inputs: ["label", "maxRows"],
      outputs: []
    },
    MenuSeparatorComponent: {
      specimen: "Menu",
      controls: "nol-menu-separator, button[aria-haspopup=\"menu\"]",
      roles: ["nol-menu-separator[role=\"separator\"]", "button.nol-icon-button[aria-label=\"Tab actions\"][aria-haspopup=\"menu\"]"],
      keys: ["Arrow Down", "Arrow Up"],
      inputs: [],
      outputs: []
    },
    MenuBarComponent: {
      specimen: "Menu",
      controls: "nol-menu-bar",
      roles: ["nol-menu-bar[role=\"menubar\"][aria-label=\"Application menu\"]", "nol-menu-bar[aria-orientation=\"horizontal\"]",
        "button[nol-menu-bar-item][role=\"menuitem\"][aria-haspopup=\"menu\"][aria-expanded=\"false\"]", "[dir=\"rtl\"] nol-menu-bar[role=\"menubar\"]"],
      keys: ["Tab", "Arrow Right", "Arrow Left", "Arrow Down", "Escape"],
      inputs: ["label"],
      outputs: []
    },
    MenuBarItemComponent: {
      specimen: "Menu",
      controls: "button[nol-menu-bar-item]",
      roles: ["button[nol-menu-bar-item][role=\"menuitem\"]", "button[nol-menu-bar-item][aria-haspopup=\"menu\"][aria-expanded=\"false\"]", "button[nol-menu-bar-item] .nol-menu-bar-item-label"],
      keys: ["Enter", "Space", "Arrow Down", "Arrow Up", "A letter", "Escape"],
      inputs: ["label"],
      outputs: []
    },
    DialogComponent: {
      specimen: "Dialog",
      controls: "button[aria-haspopup=\"dialog\"]",
      roles: ["button[nol-button][aria-haspopup=\"dialog\"]"],
      keys: ["Tab", "Shift+Tab", "Escape"],
      inputs: ["title", "size"],
      outputs: ["dismissed"]
    },
    TooltipComponent: {
      specimen: "Tooltip",
      controls: "[nolTooltip]",
      roles: ["button[nol-button][nolTooltip][aria-describedby]", "button.nol-icon-button[aria-label=\"Sync\"][aria-describedby]"],
      keys: ["Tab", "Escape"],
      inputs: ["text", "description"],
      outputs: []
    },
    QuickInputComponent: {
      specimen: "Quick input",
      controls: "nol-quick-input",
      roles: ["input.nol-quick-input-field[role=\"combobox\"][aria-label=\"Search notes\"][aria-expanded=\"true\"]",
        "[role=\"listbox\"][aria-label=\"Search notes\"] [role=\"option\"][aria-selected=\"true\"]", "[role=\"listbox\"][aria-label=\"Run a command\"] [role=\"group\"][aria-labelledby]",
        "nol-quick-input [role=\"status\"]"],
      keys: ["Arrow Down", "Arrow Up", "Home", "End", "Page Down", "Page Up", "Enter", "Escape", "Tab"],
      inputs: ["items", "label", "icon", "emptyText", "isEmptyTextAlert", "query", "isFocusing"],
      outputs: ["chosen", "dismissed", "tabKey"]
    },
    ToolbarButtonComponent: {
      specimen: "Toolbar button",
      controls: "button[nol-toolbar-button]",
      roles: ["[role=\"toolbar\"][aria-label=\"Note actions\"][aria-orientation=\"horizontal\"]", "button.nol-toolbar-button[aria-label=\"New note\"]",
        "button.nol-toolbar-button[aria-pressed=\"false\"]", "button.nol-toolbar-button[aria-disabled=\"true\"]", "button.nol-toolbar-button[aria-haspopup=\"menu\"][aria-expanded=\"false\"]",
        ".nol-toolbar-button-glyph[aria-hidden=\"true\"]"],
      keys: ["Tab", "Arrow Right", "Arrow Left", "Home", "End", "Enter", "Space"],
      inputs: ["label", "icon", "isShowingLabel", "pressed", "hasMenu", "isUnavailable", "busy"],
      outputs: []
    },
    AvatarComponent: {
      specimen: "Avatar",
      controls: "nol-avatar",
      roles: ["nol-avatar[role=\"img\"][aria-label=\"Ada Park\"]", "nol-avatar[role=\"img\"][aria-label=\"Mia Lund, unavailable\"]", "li > nol-avatar[aria-hidden=\"true\"]:not([role]) + span"],
      keys: [],
      inputs: ["name", "image", "initials", "color", "colorKey", "size", "label", "decorative", "unavailable", "filled", "filledColor"],
      outputs: []
    },
    CardComponent: {
      specimen: "Card",
      controls: "nol-card",
      roles: ["nol-card:not([role]) strong", "ul > li > nol-card:not([role]) h3"],
      keys: [],
      inputs: [],
      outputs: []
    },
    PanelCardComponent: {
      specimen: "Panel card",
      controls: "nol-panel-card",
      roles: ["nol-panel-card:not([role]):not(.nol-panel-card-shell) p", "nol-panel-card.nol-panel-card-shell:not([role]) p"],
      keys: [],
      inputs: ["surface"],
      outputs: []
    },
    InlineCodeComponent: {
      specimen: "Inline code",
      controls: "code[nol-inline-code]",
      roles: ["p > code[nol-inline-code]:not([role]):not([tabindex])"],
      keys: [],
      inputs: [],
      outputs: []
    },
    CodeBlockComponent: {
      specimen: "Code block",
      controls: "nol-code-block",
      roles: ["nol-code-block [role=\"toolbar\"][aria-label=\"Code block actions\"]", "button.nol-code-block-wrap[aria-label=\"Word wrap\"][aria-pressed=\"false\"]",
        "button.nol-code-block-run[aria-label=\"Run bash command\"]", "button.nol-code-block-copy[aria-label=\"Copy\"]", "nol-code-block pre > code"],
      keys: ["Tab", "Arrow Right", "Arrow Left", "Home", "End", "Enter", "Space"],
      inputs: ["code", "language", "wrapped", "maxHeight", "streaming", "runnable", "runState"],
      outputs: ["run"]
    },
    FileBadgeComponent: {
      specimen: "File badge",
      controls: "nol-file-badge",
      roles: ["li > nol-file-badge[aria-hidden=\"true\"] + span", "nol-file-badge.nol-file-badge-letters", "nol-file-badge[aria-hidden=\"true\"] .nol-file-badge-glyph"],
      keys: [],
      inputs: ["fileName", "isFolder"],
      outputs: []
    },
    SectionHeaderComponent: {
      specimen: "Section header",
      controls: "nol-section-header",
      roles: ["nol-section-header[role=\"heading\"][aria-level=\"3\"]", "nol-section-header .nol-section-header-icon[aria-hidden=\"true\"]",
        "nol-section-header[role=\"heading\"] > button.nol-section-header-toggle[aria-expanded=\"true\"][aria-controls=\"nol-docs-section-header-drafts\"]",
        "button.nol-section-header-toggle .nol-section-header-caret[aria-hidden=\"true\"]"],
      keys: ["Enter", "Space"],
      inputs: ["label", "level", "icon", "collapsible", "uppercase", "controls", "expanded"],
      outputs: []
    },
    GroupHeaderComponent: {
      specimen: "Group header",
      controls: "nol-group-header",
      roles: ["nol-group-header [role=\"heading\"][aria-level=\"3\"] > button.nol-group-header-toggle[aria-expanded=\"true\"][aria-label=\"Drafts, 2 notes\"][aria-controls=\"nol-docs-group-header-drafts\"]",
        "button.nol-group-header-toggle[aria-expanded=\"false\"][aria-label=\"Archived, 3\"]", "button.nol-group-header-toggle .nol-group-header-twistie[aria-hidden=\"true\"]",
        "nol-group-header > .nol-group-header-actions > button.nol-icon-button[aria-label=\"New draft\"]"],
      keys: ["Tab", "Enter", "Space"],
      inputs: ["label", "count", "countLabel", "level", "controls", "expanded"],
      outputs: []
    },
    ChipComponent: {
      specimen: "Badge and key chip",
      controls: "nol-chip",
      roles: ["nol-chip.nol-chip-count:not([role])", "nol-chip.nol-chip-removed", "nol-chip.nol-chip-on .nol-chip-dot[aria-hidden=\"true\"]", "nol-chip.nol-chip-key [data-truncates]"],
      keys: [],
      inputs: ["kind", "count"],
      outputs: []
    },
    ViewBadgeComponent: {
      specimen: "View badge",
      controls: "nol-view-badge",
      roles: ["nol-view-badge[aria-hidden=\"true\"]", "nol-view-badge.nol-view-badge-dot", "button[aria-label=\"Problems, 3 new\"] nol-view-badge[aria-hidden=\"true\"]"],
      keys: [],
      inputs: ["count"],
      outputs: []
    },
    MeterComponent: {
      specimen: "Meter",
      controls: "nol-meter",
      roles: ["nol-meter[role=\"meter\"][aria-label=\"Weekly usage\"][aria-valuemin=\"0\"][aria-valuemax=\"1\"][aria-valuenow=\"0.42\"]",
        "nol-meter[aria-label=\"Storage\"][aria-valuenow=\"0.3\"][aria-valuetext=\"30%\"]", "nol-meter[aria-label=\"Upload quota\"][aria-valuenow=\"1\"][aria-valuetext=\"100%\"]",
        "nol-meter.nol-meter-warning[aria-label=\"Monthly usage\"]"],
      keys: [],
      inputs: ["label", "value", "warning"],
      outputs: []
    },
    ProgressComponent: {
      specimen: "Progress",
      controls: "nol-progress",
      roles: ["nol-progress[role=\"progressbar\"][aria-label=\"Uploading the notes\"][aria-valuemin=\"0\"][aria-valuemax=\"1\"][aria-valuenow=\"0.6\"]",
        "nol-progress.nol-progress-indeterminate[role=\"progressbar\"][aria-label=\"Searching the notes\"]:not([aria-valuenow])"],
      keys: [],
      inputs: ["label", "value", "isDelayed"],
      outputs: []
    },
    SpinnerComponent: {
      specimen: "Spinner",
      controls: "nol-spinner",
      roles: ["nol-spinner[role=\"status\"] .nol-spinner-label", "nol-spinner:not([role]) .nol-spinner-ring[aria-hidden=\"true\"]"],
      keys: [],
      inputs: ["label", "isDelayed"],
      outputs: []
    },
    SashComponent: {
      specimen: "Sash",
      controls: "nol-sash",
      roles: ["nol-sash[role=\"separator\"][tabindex=\"0\"][aria-label=\"Resize the outline\"][aria-orientation=\"vertical\"]",
        "nol-sash[aria-label=\"Resize the outline\"][aria-valuenow=\"112\"][aria-valuemin=\"64\"][aria-valuemax=\"160\"]",
        "nol-sash[role=\"separator\"][aria-label=\"Resize the history\"][aria-orientation=\"horizontal\"]", "nol-sash .nol-sash-grip[aria-hidden=\"true\"]"],
      keys: ["Tab", "Arrow Left", "Arrow Right", "Arrow Up", "Arrow Down"],
      inputs: ["orientation", "label", "value", "minimum", "maximum", "step"],
      outputs: ["resize"]
    },
    TabComponent: {
      specimen: "Tab",
      controls: "nol-tab",
      roles: ["[role=\"tablist\"][aria-label=\"Open notes\"] > nol-tab[role=\"tab\"][aria-label=\"Notes\"][aria-selected=\"true\"][tabindex=\"0\"]",
        "[role=\"tablist\"][aria-label=\"Open notes\"] > nol-tab[role=\"tab\"][aria-selected=\"false\"][tabindex=\"-1\"]", "nol-tab button.nol-tab-close[tabindex=\"-1\"][aria-label=\"Close Notes\"]",
        "nol-tab[aria-label=\"Build\"][aria-busy=\"true\"]", "nol-tab[aria-label=\"Deploy, waiting for your answer\"]:not([aria-busy])", "nol-tab[aria-label=\"Inbox, 3 unread\"]",
        "nol-tab[aria-label=\"Draft\"][aria-description=\"Preview\"]", "nol-tab .nol-tab-icon[aria-hidden=\"true\"]"],
      keys: ["Tab", "Arrow Right", "Arrow Left", "Home", "End", "Enter", "Space", "Delete", "Escape"],
      inputs: ["label", "icon", "selected", "preview", "working", "waiting", "closable", "badge", "badgeCount", "image", "imageGlyph", "status", "leadingSpinner", "marker", "underline",
        "editing"],
      outputs: ["activate", "close", "labelKept", "labelCancelled"]
    },
    TreeComponent: {
      specimen: "Tree",
      controls: "nol-tree",
      roles: ["nol-tree [role=\"tree\"][aria-label=\"Project files\"]", "[aria-label=\"Project files\"] [role=\"treeitem\"][aria-level=\"1\"][aria-expanded=\"true\"]",
        "[aria-label=\"Project files\"] [role=\"treeitem\"][aria-level=\"2\"][aria-expanded=\"false\"]", "[aria-label=\"Project files\"] [role=\"treeitem\"][aria-selected=\"true\"]",
        "[role=\"treeitem\"] .nol-tree-twistie[aria-hidden=\"true\"]", "[role=\"treeitem\"] .nol-tree-icon[aria-hidden=\"true\"]",
        "nol-tree.nol-tree-movable [role=\"treeitem\"][aria-keyshortcuts=\"Alt+ArrowUp Alt+ArrowDown Alt+ArrowLeft Alt+ArrowRight\"]"],
      keys: ["Tab", "Arrow Down", "Arrow Up", "Arrow Right", "Arrow Left", "Home", "End", "A letter", "Enter", "Space", "Alt+Arrow Up", "Alt+Arrow Down", "Alt+Arrow Right", "Alt+Arrow Left"],
      inputs: ["nodes", "label", "current", "movable"],
      outputs: ["activated", "moved"]
    },
    VirtualListComponent: {
      specimen: "Virtual list",
      controls: "nol-virtual-list",
      roles: ["nol-virtual-list [role=\"listbox\"][aria-label=\"Notes\"]",
        "[role=\"listbox\"][aria-label=\"Notes\"] [role=\"option\"][aria-posinset=\"1\"][aria-setsize=\"1000\"][aria-selected=\"false\"][tabindex=\"0\"]",
        "[role=\"listbox\"][aria-label=\"Tasks\"] [role=\"option\"][aria-posinset=\"3\"][aria-setsize=\"500\"][aria-selected=\"true\"][tabindex=\"0\"]"],
      keys: ["Tab", "Arrow Down", "Arrow Up", "Page Down", "Page Up", "Home", "End", "Enter", "Space"],
      inputs: ["source", "label", "kind", "selected", "position", "busy", "readAhead", "latest"],
      outputs: ["activated", "positionChange", "jumped", "failed"]
    },
    TerminalOutputComponent: {
      specimen: "Terminal output",
      controls: "nol-terminal-output",
      roles: ["nol-terminal-output > pre.nol-terminal-output-body > span:not([role])", "nol-terminal-output > .nol-terminal-output-sample[aria-hidden=\"true\"]",
        "nol-terminal-output > pre.nol-terminal-output-body[style*=\"max-height\"]"],
      keys: [],
      inputs: ["lines", "maxHeight"],
      outputs: []
    },
    ConfigurationTableComponent: {
      specimen: "Configuration table",
      controls: "nol-configuration-table",
      roles: ["nol-configuration-table [role=\"heading\"][aria-level=\"3\"]", "table.nol-configuration-table-grid[aria-label=\"Note authors\"] th[scope=\"col\"]",
        "table[aria-label=\"Note authors\"] th.nol-configuration-table-row-actions[aria-label=\"Actions\"]",
        "td.nol-configuration-table-row-actions:not([aria-label]) button.nol-icon-button[aria-label=\"Remove Ada Park\"]", "table.nol-configuration-table-grid[aria-label=\"Shortcuts\"]"],
      keys: [],
      inputs: ["heading", "label", "level", "explanation"],
      outputs: []
    },
    MessageComponent: {
      specimen: "Message",
      controls: "nol-message",
      roles: ["nol-message .nol-message-actions[role=\"toolbar\"][aria-label=\"Message actions\"]", "nol-message button.nol-message-copy[aria-label=\"Copy message\"]",
        "[role=\"article\"][aria-labelledby=\"nol-docs-message-reply-label\"] nol-message #nol-docs-message-reply-label.nol-message-label[hidden]",
        "nol-message time.nol-message-time[tabindex=\"0\"][aria-label]", "nol-message.nol-message-bubble", "nol-message .nol-message-avatar[aria-hidden=\"true\"]",
        "nol-message button.nol-message-retry", "nol-message .nol-message-error .nol-message-status-glyph[aria-hidden=\"true\"]"],
      keys: ["Tab", "Arrow Right", "Arrow Left", "Home", "End", "Enter", "Space", "Escape", "Shift+F10", "Context Menu"],
      inputs: ["author", "authorDescription", "time", "blocks", "status", "error", "key", "continuation", "selected", "selectionLook", "header", "footer", "actionsTop",
        "actionsEnd", "flashStart", "labelId", "collapsedHeight", "layout", "timeFormat", "twentyFourHour", "mentions", "mentionNames", "copyText", "fileLinks", "linkSchemes",
        "folderLinks", "references", "shellRuns", "shellRunStates", "shellRunOutputs", "math"],
      outputs: ["copied", "retry", "attachmentOpen", "linkActivate", "linkOpen", "linkMenu", "fileActivate", "filePathsChange", "shellRun", "contextMenuRequest"]
    },
    MarkdownViewComponent: {
      specimen: "Markdown view",
      controls: "nol-markdown-view",
      roles: ["nol-markdown-view p.nol-markdown-heading[role=\"heading\"][aria-level=\"2\"]", "nol-markdown-view li.nol-markdown-task .nol-markdown-task-mark[role=\"img\"][aria-label=\"Done\"]",
        "nol-markdown-view li.nol-markdown-task .nol-markdown-task-mark[role=\"img\"][aria-label=\"Not done\"]", "nol-markdown-view .nol-markdown-table table th",
        "nol-markdown-view nol-code-block [role=\"toolbar\"][aria-label=\"Code block actions\"]", "nol-markdown-view a.nol-markdown-link[href=\"https://example.com/notes\"]",
        "nol-markdown-view .nol-markdown-mention"],
      keys: ["Tab", "Enter"],
      inputs: ["text", "streaming", "entering", "paced", "mentions", "mentionNames", "fileLinks", "linkSchemes", "folderLinks", "references", "shellRuns", "shellRunStates",
        "shellRunOutputs", "math"],
      outputs: ["linkActivate", "linkOpen", "linkMenu", "fileActivate", "filePathsChange", "shellRun"]
    }
  };

  const pages: readonly DocsComponentPage[] = DocsCatalog.writtenPages.flatMap(t => t.content === null ? [] : [t.content]);

  const expectation = (name: string): (typeof expectations)[string] => {
    const expected = expectations[name];
    if (expected === undefined)
      throw new TypeError(`The spec expects nothing of ${name}.`);
    return expected;
  };

  const expectPage = (name: string): DocsComponentPage => {
    const page = pages.find(t => t.componentName === name);
    if (page === undefined)
      throw new TypeError(`The catalog writes no page for ${name}.`);
    return page;
  };

  const renderAsync = async (content: DocsComponentPage): Promise<HTMLElement> => {
    TestBed.configureTestingModule({ providers: [provideMarkdown()] });
    const fixture = TestBed.createComponent(ComponentPageComponent);
    fixture.componentRef.setInput("page", content);
    await fixture.whenStable();
    const host = DocsFixture.host(fixture);
    await vi.waitFor(() => {
      expect(host.textContent).not.toContain("Loading…");
      expect(DocsFixture.all(host, "nol-docs-example-view").length).toBe(content.examples.length);
      expect(host.querySelector(".nol-gallery-specimen")).not.toBeNull();
      expect(DocsFixture.all(host, "nol-code-block pre code").every(t => (t.textContent ?? "").length > 0)).toBe(true);
    });
    return host;
  };

  const section = (host: HTMLElement, title: string): HTMLElement => {
    const heading = DocsFixture.byText(host, "h2", title);
    const owner = heading.closest("section");
    if (!(owner instanceof HTMLElement))
      throw new TypeError(`The ${title} heading has no section.`);
    return owner;
  };

  const brokenWords = (cell: HTMLElement): readonly string[] => {
    const broken: string[] = [];
    const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node !== null; node = walker.nextNode())
      for (const word of (node.textContent ?? "").matchAll(/[\p{L}\p{N}_]+/gu)) {
        const range = document.createRange();
        range.setStart(node, word.index);
        range.setEnd(node, word.index + word[0].length);
        if (new Set([...range.getClientRects()].filter(t => t.width > 0).map(t => Math.round(t.top))).size > 1)
          broken.push(word[0]);
      }
    return broken;
  };

  const previews = (host: HTMLElement): readonly HTMLElement[] => DocsFixture.all(section(host, "Examples"), ".nol-docs-example-preview");

  const outside = (host: HTMLElement, selector: string): readonly HTMLElement[] => DocsFixture.all(document, selector).filter(t => !host.contains(t));

  const isStacked = (element: Element): boolean => element.closest(".nol-docs-table")?.classList.contains("nol-docs-stacked") === true;

  const fittedAsync = async (host: HTMLElement): Promise<void> => {
    await vi.waitFor(() => expect(DocsFixture.all(host, ".nol-docs-stacked-table").filter(t => t.offsetWidth > (t.parentElement?.clientWidth ?? 0)).map(t => t.getAttribute("aria-label"))).toEqual([]));
  };

  const activeLabel = (): string | undefined => document.activeElement?.querySelector(".nol-menu-item-label")?.textContent?.trim();

  afterEach(() => DocsFixture.resetAsync());

  it("expects something of every component page the catalog writes", () => {
    expect(pages.map(t => t.componentName).sort()).toEqual(Object.keys(expectations).sort());
  });

  describe.each(pages.map((t): [string, DocsComponentPage] => [t.title, t]))("the %s page", (_title, content) => {
    it("renders every example live, with a visible control, above its own code and the code of what it opens", async () => {
      const host = await renderAsync(content);
      const expected = expectation(content.componentName);

      for (const [index, example] of DocsFixture.all(section(host, "Examples"), "nol-docs-example-view").entries()) {
        const preview = DocsFixture.one(example, ".nol-docs-example-preview");
        const controls = DocsFixture.all(preview, expected.controls);
        const blocks = DocsFixture.all(example, "nol-code-block").filter(t => !preview.contains(t));
        const codes = blocks.map(t => t.querySelector("pre code")?.textContent ?? "");
        expect(controls.length).toBeGreaterThan(0);
        expect(controls.every(t => t.getBoundingClientRect().width > 0 && t.getBoundingClientRect().height > 0)).toBe(true);
        expect(blocks.length).toBe(content.examples[index]?.files.length);
        expect(blocks.every(t => preview.getBoundingClientRect().bottom <= t.getBoundingClientRect().top)).toBe(true);
        expect(codes[0]).toContain("<");
        expect(codes[1]).toContain("@Component");
        expect(codes.some(t => t.includes("@license"))).toBe(false);
      }
    });

    it("shows the Gallery's specimen as its states", async () => {
      const host = await renderAsync(content);
      const states = section(host, "States");

      expect(DocsFixture.one(states, ".nol-gallery-specimen").getAttribute("aria-label")).toBe(expectation(content.componentName).specimen);
      expect(DocsFixture.all(states, "nol-gallery-cell").length).toBeGreaterThan(1);
    });

    it("lists the inputs and outputs its declarations give", async () => {
      const host = await renderAsync(content);
      const api = section(host, "API");
      const names = (table: string): readonly (string | undefined)[] => DocsFixture.all(api, `table[aria-label="${table}"] tbody th`).map(t => t.textContent?.trim());

      expect(names("Inputs")).toEqual(expectation(content.componentName).inputs);
      expect(names("Outputs")).toEqual(expectation(content.componentName).outputs);
      expect(DocsFixture.all(api, "tbody td:nth-child(2) > code").map(t => t.textContent)).toEqual([...ApiReference.find(content.componentName).inputs, ...ApiReference.find(content.componentName).outputs].map(t => t.type));
      expect(DocsFixture.all(api, "tbody td:last-child").every(t => (t.textContent ?? "").trim().length > 0)).toBe(true);
    });

    it("shows a type of 24 characters or fewer whole, and splits only a longer union, each later part starting at its |", async () => {
      const host = await renderAsync(content);
      const types = DocsFixture.all(section(host, "API"), "tbody td:nth-child(2) > code");
      const parts = (code: HTMLElement): readonly string[] => DocsFixture.all(code, ".nol-docs-type-part").map(t => t.textContent ?? "");
      const expected = (type: string): readonly string[] => type.length <= 24 ? [type] : type.split(" | ").map((t, index) => index === 0 ? t : ` | ${t}`);

      expect(types.map(parts)).toEqual(types.map(t => expected(t.textContent ?? "")));
    });

    it("names each two-way input's binding as inline code", async () => {
      const host = await renderAsync(content);
      const notes = DocsFixture.all(section(host, "API"), "table[aria-label=\"Inputs\"] tbody td:last-child p")
        .filter(t => t.textContent?.startsWith("Two-way:"));
      const models = ApiReference.find(content.componentName).inputs.filter(t => t.kind === "model").map(t => `Two-way: bind it as [(${t.name})].`);

      expect(notes.map(t => t.textContent?.trim())).toEqual(models);
      expect(notes.map(t => t.querySelector("code[nol-inline-code]")?.textContent)).toEqual(models.map(t => t.slice("Two-way: bind it as ".length, -1)));
    });

    it("shows its selector, its import and its API descriptions' inline code as the kit's inline code, with no Markdown marks", async () => {
      const host = await renderAsync(content);
      const article = DocsFixture.one(host, "article");
      const lead = DocsFixture.all(article, ":scope > nol-markdown-view");
      const api = ApiReference.find(content.componentName);

      expect(lead.length).toBe(api.description.length);
      expect([...lead, section(host, "API")].map(t => t.textContent ?? "").filter(t => t.includes("`"))).toEqual([]);
      expect(DocsFixture.all(section(host, "API"), "nol-docs-api-table > p > code[nol-inline-code]").map(t => t.textContent)).toEqual([api.selector, api.entry]);
    });

    it("names the keys it handles, and its examples render the roles and attributes it names", async () => {
      const host = await renderAsync(content);
      const expected = expectation(content.componentName);
      const accessibility = section(host, "Accessibility");
      const shown = previews(host);
      const references = shown.flatMap(t => DocsFixture.all(t, "[aria-describedby], [aria-labelledby]"))
        .flatMap(t => `${t.getAttribute("aria-describedby") ?? ""} ${t.getAttribute("aria-labelledby") ?? ""}`.split(" ").filter(u => u.length > 0));

      expect(DocsFixture.all(accessibility, "tbody th").map(t => t.textContent?.trim())).toEqual(expected.keys);
      expect(DocsFixture.all(accessibility, "table").length).toBe(expected.keys.length > 0 ? 1 : 0);
      expect(DocsFixture.all(accessibility, "p").some(t => t.textContent?.trim() === "It takes no keys of its own.")).toBe(expected.keys.length === 0);
      expect(DocsFixture.all(accessibility, "p").length).toBeGreaterThan(0);
      expect(expected.roles.filter(t => !shown.some(u => u.querySelector(t) !== null))).toEqual([]);
      expect(references.filter(t => document.getElementById(t) === null)).toEqual([]);
    });

    it("shows its specification from the kit's documents, without the document's title", async () => {
      const host = await renderAsync(content);
      const specification = section(host, "Specification");

      await vi.waitFor(() => expect(specification.textContent).toContain("Default geometry"));
      expect(DocsFixture.all(specification, "h1").length).toBe(0);
    });

    describe.each([
      ["Light", "light", DocsFixture.DESKTOP_WIDTH, DocsFixture.DESKTOP_HEIGHT],
      ["Dark", "dark", DocsFixture.DESKTOP_WIDTH, DocsFixture.DESKTOP_HEIGHT],
      ["Light", "light", 1024, 768],
      ["Dark", "dark", 1024, 768],
      ["Light", "light", 1920, 1080],
      ["Dark", "dark", 1920, 1080],
      ["Light", "light", 2000, 1125],
      ["Dark", "dark", 2000, 1125],
      ["Light", "light", DocsFixture.PHONE_WIDTH, DocsFixture.PHONE_HEIGHT],
      ["Dark", "dark", DocsFixture.PHONE_WIDTH, DocsFixture.PHONE_HEIGHT]
    ])("in the %s mode, a %s color scheme, at %ipx wide", (mode, scheme, width, height) => {
      it("draws its tables with row lines and start-aligned cells, and breaks no word, name or key name in them, nor a type but before a |", async () => {
        DocsFixture.setMode(mode);
        await DocsFixture.viewAsync(width, height);
        const host = await renderAsync(content);
        await vi.waitFor(() => expect(section(host, "Specification").textContent).toContain("Default geometry"));
        const cells = DocsFixture.all(host, ".nol-docs-table th, .nol-docs-table td");
        const markdownCells = DocsFixture.all(host, ".nol-markdown-table th, .nol-markdown-table td");
        const api = ApiReference.find(content.componentName);

        await fittedAsync(host);
        const lined = [...cells.filter(t => !isStacked(t)), ...DocsFixture.all(host, ".nol-docs-stacked-table tbody tr").filter(isStacked)];

        expect(DocsFixture.all(host, ".nol-docs-table").length).toBe([content.keys, api.inputs, api.outputs].filter(t => t.length > 0).length);
        expect(lined.filter(t => parseFloat(getComputedStyle(t).borderBlockEndWidth) === 0).map(t => t.textContent?.trim())).toEqual([]);
        expect(cells.filter(t => {
          const style = getComputedStyle(t);
          return !isStacked(t) && parseFloat(style.paddingInlineStart) === 0 || style.textAlign !== "start";
        }).map(t => t.textContent?.trim())).toEqual([]);
        expect([...cells, ...markdownCells].flatMap(t => brokenWords(t))).toEqual([]);
        expect(DocsFixture.all(host, ".nol-docs-table kbd, .nol-docs-table th[scope=row] code, .nol-docs-page .nol-markdown-table code, .nol-docs-type-part").filter(t => t.getClientRects().length > 1).map(t => t.textContent)).toEqual([]);
      });

      it("fits every table, the API and accessibility tables and the Markdown ones, inside its section, with no table scrolling sideways", async () => {
        DocsFixture.setMode(mode);
        await DocsFixture.viewAsync(width, height);
        const host = await renderAsync(content);
        await vi.waitFor(() => expect(section(host, "Specification").textContent).toContain("Default geometry"));
        await fittedAsync(host);
        const tables = DocsFixture.all(host, ".nol-docs-table, .nol-markdown-table table");

        expect(tables.filter(t => t.closest(".nol-docs-section") === null).length).toBe(0);
        expect(tables.flatMap(t => {
          const box = t.getBoundingClientRect();
          const owner = t.closest(".nol-docs-section")?.getBoundingClientRect() ?? box;
          const heading = t.closest(".nol-docs-section")?.querySelector("h2")?.textContent?.trim() ?? String();
          return box.left < owner.left - 0.5 || box.right > owner.right + 0.5 ? [`${heading}: ${Math.round(box.width)} > ${Math.round(owner.width)}`] : [];
        })).toEqual([]);
      });

      it("keeps every section inside the page's width", async () => {
        DocsFixture.setMode(mode);
        await DocsFixture.viewAsync(width, height);
        const host = await renderAsync(content);
        const edge = document.documentElement.clientWidth;

        expect(getComputedStyle(document.documentElement).colorScheme).toBe(scheme);
        expect(window.innerWidth).toBe(width);
        expect(DocsFixture.overflowWidth()).toBe(0);
        expect(DocsFixture.all(host, ".nol-docs-section").every(t => t.getBoundingClientRect().right <= edge)).toBe(true);
        expect(DocsFixture.all(host, ".nol-docs-example-preview, .nol-gallery-specimen").every(t => t.getBoundingClientRect().right <= edge)).toBe(true);
      });

      it("keeps each API and accessibility row a table row where its table's columns fit its section, and otherwise stacks it with its description below at full width, its table roles explicit", async () => {
        DocsFixture.setMode(mode);
        await DocsFixture.viewAsync(width, height);
        const host = await renderAsync(content);
        const rows = DocsFixture.all(host, ".nol-docs-stacked-table tbody tr");
        const misplaced: string[] = [];
        await fittedAsync(host);

        expect(rows.length).toBe(DocsFixture.all(host, ".nol-docs-table tbody tr").length);
        for (const row of rows) {
          const name = row.firstElementChild?.textContent?.trim() ?? String();
          const box = row.getBoundingClientRect();
          const section = row.closest(".nol-docs-section")?.getBoundingClientRect() ?? box;
          const cells = DocsFixture.all(row, ":scope > th, :scope > td").map(t => t.getBoundingClientRect());
          const description = cells.at(-1) ?? box;
          const top = cells.slice(0, -1);
          if (cells.some(t => t.left < section.left - 0.5 || t.right > section.right + 0.5))
            misplaced.push(`${name}: outside its section`);
          if (isStacked(row)) {
            if (top.some(t => t.bottom > description.top + 0.5))
              misplaced.push(`${name}: description not below`);
            if (Math.abs(description.width - box.width) > 0.5)
              misplaced.push(`${name}: description not at full width`);
          }
          else if (cells.some((t, index) => Math.abs(t.top - box.top) > 1.5 || index > 0 && t.left < (cells[index - 1]?.right ?? t.left) - 0.5))
            misplaced.push(`${name}: not one table row`);
        }

        expect(misplaced).toEqual([]);
        expect(DocsFixture.overflowWidth()).toBe(0);
        expect(DocsFixture.all(host, ".nol-docs-stacked-table").flatMap(t => [t, ...DocsFixture.all(t, ":scope > *, :scope > * > tr, :scope > * > tr > *")])
          .filter(t => t.getAttribute("role") !== roleOf(t)).map(t => t.outerHTML.slice(0, 80))).toEqual([]);
      });
    });
  });

  describe("the Button page", () => {
    it("gives the button's inputs their types and defaults", async () => {
      const host = await renderAsync(expectPage("ButtonComponent"));
      const rows = DocsFixture.all(section(host, "API"), "table[aria-label=\"Inputs\"] tbody tr").map(t => [...t.children].map(u => u.textContent?.trim()));

      expect(rows.find(t => t[0] === "variant")?.slice(1, 3)).toEqual(["ButtonVariant", "ButtonVariant.Primary"]);
      expect(rows.find(t => t[0] === "busy")?.slice(1, 3)).toEqual(["boolean", "false"]);
      expect(section(host, "API").textContent).toContain("button[nol-button], a[nol-button]");
    });
  });

  describe("the Progress page", () => {
    it("lists the input its host directive gives it, with that directive's type, default and description", async () => {
      const host = await renderAsync(expectPage("ProgressComponent"));
      const row = DocsFixture.all(section(host, "API"), "table[aria-label=\"Inputs\"] tbody tr").find(t => t.querySelector("th")?.textContent?.trim() === "isDelayed");
      const cells = [...(row?.children ?? [])].map(t => t.textContent?.trim());

      expect(cells.slice(1, 3)).toEqual(["boolean", "false"]);
      expect(cells[3]).toContain("Whether the host stays hidden for its first 300 ms");
      expect(cells[3]).toContain("From its host directive, RevealDelayDirective.");
    });
  });

  describe("the Radio page", () => {
    it("shows the inline code of an input's description as code", async () => {
      const host = await renderAsync(expectPage("RadioComponent"));
      const row = DocsFixture.all(section(host, "API"), "table[aria-label=\"Inputs\"] tbody tr").find(t => t.querySelector("th")?.textContent?.trim() === "disabled");

      const description = row?.querySelector("td:last-child");

      expect([...(description?.querySelectorAll("code") ?? [])].map(t => t.textContent)).toContain("aria-disabled=\"true\"");
    });
  });

  describe("the Split button page", () => {
    it("opens the arrow's menu from the keyboard, and gives the focus back to the arrow on Escape", async () => {
      const host = await renderAsync(expectPage("SplitButtonComponent"));
      const arrow = DocsFixture.one(section(host, "Examples"), "button.nol-split-button-arrow");

      arrow.focus();
      await userEvent.keyboard("{ArrowDown}");
      await vi.waitFor(() => expect(DocsFixture.all(document, "[role=\"menu\"] [role=\"menuitem\"]").length).toBe(2));
      await vi.waitFor(() => expect(document.activeElement?.getAttribute("role")).toBe("menuitem"));
      expect(arrow.getAttribute("aria-expanded")).toBe("true");

      await userEvent.keyboard("{Escape}");
      await vi.waitFor(() => expect(document.querySelector("[role=\"menu\"]")).toBeNull());
      expect(document.activeElement).toBe(arrow);
      expect(arrow.getAttribute("aria-expanded")).toBe("false");
    });
  });

  describe("the Field message page", () => {
    it("shows the error while the field is empty, and takes it away once the field has a name", async () => {
      const host = await renderAsync(expectPage("FieldMessageComponent"));
      const examples = section(host, "Examples");
      const field = DocsFixture.one(examples, "input[aria-invalid=\"true\"]");

      await userEvent.fill(field, "Reviewer");

      await vi.waitFor(() => expect(examples.querySelector("nol-field-message[role=\"alert\"]")).toBeNull());
      expect(field.getAttribute("aria-invalid")).toBeNull();
      expect(field.getAttribute("aria-describedby")).toBeNull();
    });
  });

  describe("the Switch page", () => {
    it("turns on once its owner binds the toggle it asked for, and a disabled switch refuses a click", async () => {
      const host = await renderAsync(expectPage("SwitchComponent"));
      const examples = section(host, "Examples");
      const sounds = DocsFixture.one(examples, "input[role=\"switch\"][aria-label=\"Sounds\"]");
      const disabled = DocsFixture.one(examples, "input[role=\"switch\"][aria-disabled=\"true\"]");

      await userEvent.click(sounds);
      await vi.waitFor(() => expect(sounds.matches(":checked")).toBe(true));

      await userEvent.click(DocsFixture.one(examples, "label:has(input[role=\"switch\"][aria-disabled=\"true\"])"), { force: true });
      expect(disabled.matches(":checked")).toBe(true);
    });
  });

  describe("the Radio group page", () => {
    it("updates its two-way value when a radio is picked", async () => {
      const host = await renderAsync(expectPage("RadioGroupComponent"));
      const examples = section(host, "Examples");
      const group = DocsFixture.one(examples, "nol-radio-group[aria-label=\"Merge method\"]");

      await userEvent.click(DocsFixture.byText(group, "label", "Rebase"));

      await vi.waitFor(() => expect(examples.textContent).toContain("Chosen: rebase"));
      expect(group.querySelector("input:checked")?.closest("label")?.textContent?.trim()).toBe("Rebase");
    });
  });

  describe("the Choice pills page", () => {
    it("picks the next pill and moves the focus and the Tab stop to it on Arrow Right", async () => {
      const host = await renderAsync(expectPage("ChoicePillsComponent"));
      const group = DocsFixture.one(section(host, "Examples"), "[role=\"radiogroup\"][aria-label=\"Effort\"]");

      DocsFixture.one(group, "[aria-checked=\"true\"]").focus();
      await userEvent.keyboard("{ArrowRight}");

      await vi.waitFor(() => expect(DocsFixture.one(group, "[aria-checked=\"true\"]").textContent?.trim()).toBe("High"));
      expect(document.activeElement?.textContent?.trim()).toBe("High");
      expect(DocsFixture.all(group, "[tabindex=\"0\"]").map(t => t.textContent?.trim())).toEqual(["High"]);
    });
  });

  describe("the Select page", () => {
    it("opens its listbox on a click, and gives the focus back to its button on Escape", async () => {
      const host = await renderAsync(expectPage("SelectComponent"));
      const button = DocsFixture.one(section(host, "Examples"), "button.nol-select-button[aria-label=\"Pace, Balanced\"]");

      await userEvent.click(button);
      await vi.waitFor(() => expect(DocsFixture.all(document, "[role=\"listbox\"] [role=\"option\"]").length).toBe(3));
      await vi.waitFor(() => expect(document.activeElement?.getAttribute("role")).toBe("listbox"));
      await vi.waitFor(() => expect(button.getAttribute("aria-expanded")).toBe("true"));

      await userEvent.keyboard("{Escape}");
      await vi.waitFor(() => expect(document.querySelector("[role=\"listbox\"]")).toBeNull());
      expect(document.activeElement).toBe(button);
      await vi.waitFor(() => expect(button.getAttribute("aria-expanded")).toBe("false"));
    });

    it("names its option groups and marks its disabled option", async () => {
      const host = await renderAsync(expectPage("SelectComponent"));
      const button = DocsFixture.one(section(host, "Examples"), "button.nol-select-button[aria-describedby=\"nol-docs-select-note\"]");

      await userEvent.click(button);
      await vi.waitFor(() => expect(DocsFixture.all(document, "[role=\"listbox\"] [role=\"group\"][aria-labelledby]").length).toBe(2));
      const labels = DocsFixture.all(document, "[role=\"listbox\"] [role=\"group\"]").map(t => document.getElementById(t.getAttribute("aria-labelledby") ?? "")?.textContent?.trim());

      expect(labels).toEqual(["Europe", "Americas"]);
      expect(DocsFixture.all(document, "[role=\"listbox\"] [role=\"option\"][aria-disabled=\"true\"]").map(t => t.textContent?.trim())).toEqual(["Northern Europe"]);

      await userEvent.keyboard("{Escape}");
      await vi.waitFor(() => expect(document.querySelector("[role=\"listbox\"]")).toBeNull());
    });
  });

  describe("the Menu page", () => {
    it("opens its menu from the keyboard on its first row, moves past the separator, and gives the focus back to its trigger on Escape", async () => {
      const host = await renderAsync(expectPage("MenuComponent"));
      const trigger = DocsFixture.one(section(host, "Examples"), "button[nol-button][aria-haspopup=\"menu\"]");

      trigger.focus();
      await userEvent.keyboard("{ArrowDown}");
      await vi.waitFor(() => expect(outside(host, "[role=\"menu\"][aria-label=\"Note actions\"] [role=\"menuitem\"]").length).toBe(3));
      await vi.waitFor(() => expect(activeLabel()).toBe("Rename"));
      expect(trigger.getAttribute("aria-expanded")).toBe("true");

      await userEvent.keyboard("{ArrowDown}{ArrowDown}");
      await vi.waitFor(() => expect(activeLabel()).toBe("Delete"));

      await userEvent.keyboard("{Escape}");
      await vi.waitFor(() => expect(outside(host, "[role=\"menu\"]")).toEqual([]));
      expect(document.activeElement).toBe(trigger);
      await vi.waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("false"));
    });

    it("gives the focus to the first row of the menu kept on the page, and runs its last row from the keyboard", async () => {
      const host = await renderAsync(expectPage("MenuComponent"));
      const menu = DocsFixture.one(section(host, "Examples"), "nol-menu[aria-label=\"Panel\"]");

      menu.focus();
      await vi.waitFor(() => expect(activeLabel()).toBe("Open to the side"));
      await userEvent.keyboard("{End}");
      await vi.waitFor(() => expect(activeLabel()).toBe("Show hidden files"));
      await userEvent.keyboard("{Enter}");

      await vi.waitFor(() => expect(DocsFixture.one(menu, "[role=\"menuitemcheckbox\"]").getAttribute("aria-checked")).toBe("true"));
    });
  });

  describe("the Menu item page", () => {
    it("opens on its checked row, opens a submenu with Arrow Right and closes it back to its row with Arrow Left", async () => {
      const host = await renderAsync(expectPage("MenuItemComponent"));
      const trigger = DocsFixture.one(section(host, "Examples"), "button[nol-button][aria-haspopup=\"menu\"]");

      trigger.focus();
      await userEvent.keyboard("{ArrowDown}");
      await vi.waitFor(() => expect(activeLabel()).toBe("Compact"));
      expect(outside(host, "[role=\"menu\"][aria-label=\"View\"] [role=\"menuitemcheckbox\"]").map(t => t.getAttribute("aria-checked"))).toEqual(["false"]);
      expect(outside(host, "[role=\"menu\"][aria-label=\"View\"] [role=\"menuitemradio\"]").map(t => t.getAttribute("aria-checked"))).toEqual(["true", "false"]);

      await userEvent.keyboard("{ArrowDown}{ArrowDown}");
      await vi.waitFor(() => expect(activeLabel()).toBe("Theme"));
      const row = DocsFixture.one(document, ".cdk-overlay-container [role=\"menuitem\"][aria-haspopup=\"menu\"]");
      await userEvent.keyboard("{ArrowRight}");
      await vi.waitFor(() => expect(outside(host, "[role=\"menu\"][aria-label=\"Theme\"]").length).toBe(1));
      await vi.waitFor(() => expect(activeLabel()).toBe("Dark"));
      expect(row.getAttribute("aria-expanded")).toBe("true");

      await userEvent.keyboard("{ArrowLeft}");
      await vi.waitFor(() => expect(outside(host, "[role=\"menu\"][aria-label=\"Theme\"]")).toEqual([]));
      expect(document.activeElement).toBe(row);

      await userEvent.keyboard("{Escape}");
      await vi.waitFor(() => expect(outside(host, "[role=\"menu\"]")).toEqual([]));
      expect(document.activeElement).toBe(trigger);
    });
  });

  describe("the Menu group page", () => {
    it("opens on its group's checked row, names its groups by their labels, and moves across the groups past their labels", async () => {
      const host = await renderAsync(expectPage("MenuGroupComponent"));
      const trigger = DocsFixture.one(section(host, "Examples"), "button.nol-icon-button[aria-label=\"View options\"]");

      trigger.focus();
      await userEvent.keyboard("{ArrowDown}");
      await vi.waitFor(() => expect(outside(host, "[role=\"menu\"][aria-label=\"View options\"] [role=\"group\"]").length).toBe(2));
      await vi.waitFor(() => expect(activeLabel()).toBe("Date"));
      const labels = outside(host, "[role=\"menu\"][aria-label=\"View options\"] [role=\"group\"]")
        .map(t => document.getElementById(t.getAttribute("aria-labelledby") ?? "")?.textContent?.trim());
      expect(labels).toEqual(["Sort by", "Show"]);

      await userEvent.keyboard("{ArrowDown}");
      await vi.waitFor(() => expect(activeLabel()).toBe("Size"));
      await userEvent.keyboard("{ArrowDown}");
      await vi.waitFor(() => expect(activeLabel()).toBe("Hidden files"));

      await userEvent.keyboard("{Escape}");
      await vi.waitFor(() => expect(outside(host, "[role=\"menu\"]")).toEqual([]));
      expect(document.activeElement).toBe(trigger);
    });
  });

  describe("the Menu separator page", () => {
    it("is passed over by the arrow keys, and takes no focus", async () => {
      const host = await renderAsync(expectPage("MenuSeparatorComponent"));
      const trigger = DocsFixture.one(section(host, "Examples"), "button.nol-icon-button[aria-label=\"Tab actions\"]");

      trigger.focus();
      await userEvent.keyboard("{ArrowDown}");
      await vi.waitFor(() => expect(activeLabel()).toBe("Close"));
      await userEvent.keyboard("{ArrowDown}");
      await vi.waitFor(() => expect(activeLabel()).toBe("Close others"));
      await userEvent.keyboard("{ArrowDown}");
      await vi.waitFor(() => expect(activeLabel()).toBe("Split right"));
      const separators = outside(host, "[role=\"menu\"][aria-label=\"Tab actions\"] [role=\"separator\"]");

      expect(separators.length).toBe(1);
      expect(separators.map(t => t.getAttribute("tabindex"))).toEqual([null]);

      await userEvent.keyboard("{Escape}");
      await vi.waitFor(() => expect(outside(host, "[role=\"menu\"]")).toEqual([]));
      expect(document.activeElement).toBe(trigger);
    });
  });

  describe("the Menu bar page", () => {
    it("moves between its items with the arrow keys, opens an item's menu on Arrow Down, and gives the focus back to the item on Escape", async () => {
      const host = await renderAsync(expectPage("MenuBarComponent"));
      const bar = DocsFixture.one(section(host, "Examples"), "nol-menu-bar[aria-label=\"Application menu\"]");
      const edit = DocsFixture.byText(bar, "button", "Edit");

      DocsFixture.byText(bar, "button", "File").focus();
      await userEvent.keyboard("{ArrowRight}");
      await vi.waitFor(() => expect(document.activeElement).toBe(edit));
      await userEvent.keyboard("{ArrowDown}");
      await vi.waitFor(() => expect(outside(host, "[role=\"menu\"][aria-label=\"Edit\"] [role=\"menuitem\"]").length).toBe(2));
      await vi.waitFor(() => expect(activeLabel()).toBe("Undo"));
      expect(edit.getAttribute("aria-expanded")).toBe("true");

      await userEvent.keyboard("{Escape}");
      await vi.waitFor(() => expect(outside(host, "[role=\"menu\"]")).toEqual([]));
      expect(document.activeElement).toBe(edit);
    });

    it("swaps Left and Right in a right-to-left region", async () => {
      const host = await renderAsync(expectPage("MenuBarComponent"));
      const bar = DocsFixture.one(section(host, "Examples"), "nol-menu-bar[aria-label=\"Editor menu\"]");

      DocsFixture.byText(bar, "button", "Format").focus();
      await userEvent.keyboard("{ArrowLeft}");

      await vi.waitFor(() => expect(document.activeElement).toBe(DocsFixture.byText(bar, "button", "Insert")));
    });
  });

  describe("the Menu bar item page", () => {
    it("opens its menu on Enter, and takes the focus back once a row of it runs", async () => {
      const host = await renderAsync(expectPage("MenuBarItemComponent"));
      const examples = section(host, "Examples");
      const format = DocsFixture.byText(DocsFixture.one(examples, "nol-menu-bar[aria-label=\"Document menu\"]"), "button", "Format");

      format.focus();
      await userEvent.keyboard("{Enter}");
      await vi.waitFor(() => expect(outside(host, "[role=\"menu\"][aria-label=\"Format\"] [role=\"menuitemcheckbox\"]").length).toBe(2));
      await vi.waitFor(() => expect(activeLabel()).toBe("Bold"));
      expect(format.getAttribute("aria-expanded")).toBe("true");

      await userEvent.keyboard("{Enter}");
      await vi.waitFor(() => expect(outside(host, "[role=\"menu\"]")).toEqual([]));
      await vi.waitFor(() => expect(document.activeElement).toBe(format));
      expect(examples.textContent).toContain("Bold: On");
    });
  });

  describe("the Dialog page", () => {
    it("opens a modal dialog named by its title and described by its line, keeps the focus inside it, and gives the focus back on Escape", async () => {
      const host = await renderAsync(expectPage("DialogComponent"));
      const examples = section(host, "Examples");
      const opener = DocsFixture.byText(examples, "button", "Delete the note");

      await userEvent.click(opener);
      await vi.waitFor(() => expect(outside(host, "[role=\"dialog\"][aria-modal=\"true\"]").length).toBe(1));
      const dialog = DocsFixture.one(document, ".cdk-overlay-container [role=\"dialog\"]");
      const cancel = DocsFixture.byText(dialog, "button", "Cancel");
      const remove = DocsFixture.byText(dialog, "button", "Delete");
      const close = DocsFixture.one(dialog, "button.nol-dialog-close");
      expect(document.getElementById(dialog.getAttribute("aria-labelledby") ?? "")?.textContent?.trim()).toBe("Delete the note?");
      await vi.waitFor(() => expect(document.getElementById(dialog.getAttribute("aria-describedby") ?? "")?.textContent?.trim()).toBe("The note and its history go for good."));
      await vi.waitFor(() => expect(document.activeElement).toBe(cancel));

      await userEvent.keyboard("{Tab}");
      await vi.waitFor(() => expect(document.activeElement).toBe(remove));
      await userEvent.keyboard("{Tab}");
      await vi.waitFor(() => expect(document.activeElement).toBe(close));
      await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
      await vi.waitFor(() => expect(document.activeElement).toBe(remove));

      await userEvent.keyboard("{Escape}");
      await vi.waitFor(() => expect(outside(host, "[role=\"dialog\"]")).toEqual([]));
      await vi.waitFor(() => expect(document.activeElement).toBe(opener));
      expect(examples.textContent).toContain("Answer: Kept");
    });

    it("toggles a large dialog between its size and the whole window, and closes it from Close", async () => {
      const host = await renderAsync(expectPage("DialogComponent"));
      const opener = DocsFixture.byText(section(host, "Examples"), "button", "Show the changes");

      await userEvent.click(opener);
      await vi.waitFor(() => expect(outside(host, "[role=\"dialog\"]").length).toBe(1));
      const dialog = DocsFixture.one(document, ".cdk-overlay-container [role=\"dialog\"]");
      const maximize = DocsFixture.one(dialog, "button.nol-dialog-maximize");
      expect(maximize.getAttribute("aria-label")).toBe("Maximize");

      await userEvent.click(maximize);
      await vi.waitFor(() => expect(maximize.getAttribute("aria-label")).toBe("Restore"));

      await userEvent.click(DocsFixture.one(dialog, "button.nol-dialog-close"));
      await vi.waitFor(() => expect(outside(host, "[role=\"dialog\"]")).toEqual([]));
      await vi.waitFor(() => expect(document.activeElement).toBe(opener));
    });

    it("answers Deleted once the dialog's Delete is pressed", async () => {
      const host = await renderAsync(expectPage("DialogComponent"));
      const examples = section(host, "Examples");

      await userEvent.click(DocsFixture.byText(examples, "button", "Delete the note"));
      await vi.waitFor(() => expect(outside(host, "[role=\"dialog\"]").length).toBe(1));
      await userEvent.click(DocsFixture.byText(DocsFixture.one(document, ".cdk-overlay-container [role=\"dialog\"]"), "button", "Delete"));

      await vi.waitFor(() => expect(outside(host, "[role=\"dialog\"]")).toEqual([]));
      expect(examples.textContent).toContain("Answer: Deleted");
    });
  });

  describe("the Tooltip page", () => {
    it("shows a button's tooltip as the keys focus it, and hides it on Escape, keeping the focus", async () => {
      const host = await renderAsync(expectPage("TooltipComponent"));
      const examples = section(host, "Examples");
      const undo = DocsFixture.byText(examples, "button", "Undo");

      DocsFixture.byText(examples, "button", "Save").focus();
      await userEvent.keyboard("{Tab}");
      await vi.waitFor(() => expect(document.activeElement).toBe(undo));
      await vi.waitFor(() => expect(outside(host, "[role=\"tooltip\"]").map(t => t.textContent?.trim())).toEqual(["Undo the last change (Ctrl+Z)"]));

      await userEvent.keyboard("{Escape}");
      await vi.waitFor(() => expect(outside(host, "[role=\"tooltip\"]")).toEqual([]));
      expect(document.activeElement).toBe(undo);
    });
  });

  describe("the Quick input page", () => {
    it("moves the active result with the arrows, filters as the query is typed, chooses on Enter and clears on Escape", async () => {
      const host = await renderAsync(expectPage("QuickInputComponent"));
      const examples = section(host, "Examples");
      const field = DocsFixture.one(examples, "input[role=\"combobox\"][aria-label=\"Search notes\"]");
      const list = DocsFixture.one(examples, "[role=\"listbox\"][aria-label=\"Search notes\"]");
      const titles = (): readonly (string | undefined)[] => DocsFixture.all(list, "[role=\"option\"] .nol-quick-input-title").map(t => t.textContent?.trim());

      field.focus();
      await userEvent.keyboard("{ArrowDown}");
      await vi.waitFor(() => expect(DocsFixture.one(list, "[aria-selected=\"true\"] .nol-quick-input-title").textContent?.trim()).toBe("Reading list"));
      expect(field.getAttribute("aria-activedescendant")).toBe(DocsFixture.one(list, "[aria-selected=\"true\"]").id);

      await userEvent.fill(field, "trip");
      await vi.waitFor(() => expect(titles()).toEqual(["Trip plan"]));
      await userEvent.keyboard("{Enter}");
      await vi.waitFor(() => expect(examples.textContent).toContain("Opened: Trip plan"));

      await userEvent.keyboard("{Escape}");
      await vi.waitFor(() => expect(titles().length).toBe(5));
      expect(field.matches(":placeholder-shown")).toBe(true);
    });

    it("heads each section of commands once, and keeps a section's heading on its first match", async () => {
      const host = await renderAsync(expectPage("QuickInputComponent"));
      const examples = section(host, "Examples");
      const field = DocsFixture.one(examples, "input[role=\"combobox\"][aria-label=\"Run a command\"]");
      const list = DocsFixture.one(examples, "[role=\"listbox\"][aria-label=\"Run a command\"]");
      const headings = (): readonly (string | undefined)[] => DocsFixture.all(list, ".nol-quick-input-heading").map(t => t.textContent?.trim());

      expect(headings()).toEqual(["Notes", "View"]);
      expect(DocsFixture.all(list, "[role=\"group\"]").map(t => t.querySelectorAll("[role=\"option\"]").length)).toEqual([2, 2]);

      await userEvent.fill(field, "zoom");
      await vi.waitFor(() => expect(headings()).toEqual(["View"]));
    });

    it("shows its empty text, and reports its list closed, while no result matches", async () => {
      const host = await renderAsync(expectPage("QuickInputComponent"));
      const examples = section(host, "Examples");
      const field = DocsFixture.one(examples, "input[role=\"combobox\"][aria-label=\"Run a command\"]");

      await userEvent.fill(field, "zzz");

      await vi.waitFor(() => expect(DocsFixture.one(examples, ".nol-quick-input-empty").textContent?.trim()).toBe("No command matches."));
      expect(field.getAttribute("aria-expanded")).toBe("false");
    });
  });

  describe("the Toolbar button page", () => {
    it("moves the focus and the Tab stop along its toolbar with Arrow Right, and presses a toggle on Enter", async () => {
      const host = await renderAsync(expectPage("ToolbarButtonComponent"));
      const toolbar = DocsFixture.one(section(host, "Examples"), "[role=\"toolbar\"][aria-label=\"Note actions\"]");
      const wrap = DocsFixture.one(toolbar, "button[aria-label=\"Wrap lines\"]");

      DocsFixture.one(toolbar, "button[aria-label=\"New note\"]").focus();
      await userEvent.keyboard("{ArrowRight}");
      await vi.waitFor(() => expect(document.activeElement).toBe(wrap));
      await vi.waitFor(() => expect(DocsFixture.all(toolbar, "[tabindex=\"0\"]").map(t => t.getAttribute("aria-label"))).toEqual(["Wrap lines"]));

      await userEvent.keyboard("{Enter}");
      await vi.waitFor(() => expect(wrap.getAttribute("aria-pressed")).toBe("true"));
    });

    it("shares nothing while Share is unavailable, and shares once there is a note", async () => {
      const host = await renderAsync(expectPage("ToolbarButtonComponent"));
      const preview = DocsFixture.one(section(host, "Examples"), "nol-docs-toolbar-button-toolbar-example");
      const share = DocsFixture.one(preview, "button[aria-label=\"Share\"]");

      expect(share.getAttribute("aria-disabled")).toBe("true");
      share.click();
      await TestBed.inject(ApplicationRef).whenStable();
      expect(preview.textContent).toContain("Shared: 0");

      await userEvent.click(DocsFixture.one(preview, "button[aria-label=\"New note\"]"));
      await vi.waitFor(() => expect(share.getAttribute("aria-disabled")).toBeNull());
      await userEvent.click(share);
      await vi.waitFor(() => expect(preview.textContent).toContain("Shared: 1"));
    });
  });

  describe("the Chip page", () => {
    it("shows a count above 99 as 99+, and a diff count with its sign", async () => {
      const host = await renderAsync(expectPage("ChipComponent"));
      const examples = section(host, "Examples");

      await vi.waitFor(() => expect(DocsFixture.all(examples, "nol-chip.nol-chip-count, nol-chip.nol-chip-added, nol-chip.nol-chip-removed").map(t => t.textContent?.trim()))
        .toEqual(["3", "99+", "+12", "−4"]));
    });
  });

  describe("the texts the kit shows, quoted on a page", () => {
    const spoken = (element: HTMLElement): string => (element.textContent ?? "").replace(/\s+/gu, " ");
    const described = (host: HTMLElement, table: string, name: string): string => {
      const row = DocsFixture.all(section(host, "API"), `table[aria-label="${table}"] tbody tr`).find(t => t.querySelector("th")?.textContent?.trim() === name);
      return row === undefined ? "" : spoken(row);
    };

    it("quotes the Virtual List's failed read and its Jump to latest as the kit shows them, in its accessibility text and its position and jumped API texts", async () => {
      const host = await renderAsync(expectPage("VirtualListComponent"));
      const jump = `"${VirtualListResources.virtualListJumpLabel}"`;

      expect(spoken(section(host, "Accessibility"))).toContain(`"${VirtualListResources.virtualListFailed}"`);
      expect(described(host, "Inputs", "position")).toContain(jump);
      expect(described(host, "Outputs", "jumped")).toContain(jump);
    });

    it("quotes the Message's default error, empty text, actions toolbar and Copy labels as the kit shows them, in its API and accessibility texts", async () => {
      const host = await renderAsync(expectPage("MessageComponent"));
      const accessibility = spoken(section(host, "Accessibility"));

      expect(described(host, "Inputs", "error")).toContain(`"${MessageResources.messageDefaultError}"`);
      expect(described(host, "Inputs", "blocks")).toContain(`"${MessageResources.messageEmptyText}"`);
      expect(described(host, "Outputs", "copied")).toContain(`"${MessageResources.messageCopyLabels[CopyState.Ready]}"`);
      expect(accessibility).toContain(`"${MessageResources.messageActionsLabel}"`);
      expect(accessibility).toContain(`"${MessageResources.messageCopyLabels[CopyState.Ready]}"`);
      expect(accessibility).toContain(`"${MessageResources.messageCopyLabels[CopyState.Copied]}"`);
    });
  });

  describe("the Spinner page", () => {
    it("announces its label example's work hidden from sight, as its API and accessibility texts say", async () => {
      const host = await renderAsync(expectPage("SpinnerComponent"));
      const example = DocsFixture.one(section(host, "Examples"), "nol-docs-example-view");
      const status = DocsFixture.one(example, ".nol-docs-example-preview nol-spinner[role=\"status\"]");
      const label = DocsFixture.one(status, ".nol-spinner-label");
      const described = DocsFixture.one(section(host, "API"), "table[aria-label=\"Inputs\"] tbody tr").textContent ?? "";

      expect(DocsFixture.one(example, "h3").textContent?.trim()).toBe("A spinner that announces its work");
      expect(label.textContent?.trim()).toBe("Loading the list");
      expect(label.getBoundingClientRect().width).toBeLessThanOrEqual(1);
      expect(described).toContain("announced and hidden from sight");
      expect(described).not.toContain("shown beside the ring");
      expect(section(host, "Accessibility").textContent).toContain("hidden from sight");
    });
  });

  describe("the Meter page", () => {
    it("reads its text as its value's text, and a bar's fraction without text as a percentage", async () => {
      const host = await renderAsync(expectPage("MeterComponent"));
      const examples = section(host, "Examples");

      await vi.waitFor(() => expect(DocsFixture.one(examples, "nol-meter[aria-label=\"Weekly usage\"]").getAttribute("aria-valuetext")).toBe("42% · Nov 2"));
      expect(DocsFixture.one(examples, "nol-meter[aria-label=\"Storage\"]").getAttribute("aria-valuetext")).toBe("30%");
    });
  });

  describe("the Section header page", () => {
    it("folds its group on Enter and opens it again on Space", async () => {
      const host = await renderAsync(expectPage("SectionHeaderComponent"));
      const examples = section(host, "Examples");
      const toggle = DocsFixture.one(examples, "button[aria-controls=\"nol-docs-section-header-drafts\"]");
      const rows = DocsFixture.one(examples, "#nol-docs-section-header-drafts");

      toggle.focus();
      await userEvent.keyboard("{Enter}");
      await vi.waitFor(() => expect([toggle.getAttribute("aria-expanded"), rows.querySelector("li")]).toEqual(["false", null]));

      await userEvent.keyboard(" ");
      await vi.waitFor(() => expect([toggle.getAttribute("aria-expanded"), DocsFixture.all(rows, "li").length]).toEqual(["true", 2]));
      expect(document.activeElement).toBe(toggle);
    });
  });

  describe("the Group header page", () => {
    it("folds its group on Enter, opens it again on Space, and moves to its action on Tab", async () => {
      const host = await renderAsync(expectPage("GroupHeaderComponent"));
      const examples = section(host, "Examples");
      const toggle = DocsFixture.one(examples, "button[aria-controls=\"nol-docs-group-header-drafts\"]");
      const rows = DocsFixture.one(examples, "#nol-docs-group-header-drafts");

      toggle.focus();
      await userEvent.keyboard("{Enter}");
      await vi.waitFor(() => expect([toggle.getAttribute("aria-expanded"), rows.querySelector("li")]).toEqual(["false", null]));

      await userEvent.keyboard(" ");
      await vi.waitFor(() => expect([toggle.getAttribute("aria-expanded"), DocsFixture.all(rows, "li").length]).toEqual(["true", 2]));

      await userEvent.keyboard("{Tab}");
      await vi.waitFor(() => expect(document.activeElement).toBe(DocsFixture.one(examples, "button[aria-label=\"New draft\"]")));
    });
  });

  describe("the Code block page", () => {
    it("moves along its actions with the arrows, Home and End, keeping one Tab stop, wraps on Enter and runs on Space", async () => {
      const host = await renderAsync(expectPage("CodeBlockComponent"));
      const examples = section(host, "Examples");
      const block = DocsFixture.one(examples, ".nol-docs-example-preview nol-code-block:has(button.nol-code-block-run)");
      const toolbar = DocsFixture.one(block, "[role=\"toolbar\"]");
      const wrap = DocsFixture.one(toolbar, "button.nol-code-block-wrap");
      const run = DocsFixture.one(toolbar, "button.nol-code-block-run");

      wrap.focus();
      await userEvent.keyboard("{End}");
      await vi.waitFor(() => expect(document.activeElement).toBe(DocsFixture.one(toolbar, "button.nol-code-block-copy")));
      await userEvent.keyboard("{Home}");
      await vi.waitFor(() => expect(document.activeElement).toBe(wrap));
      await userEvent.keyboard("{Enter}");
      await vi.waitFor(() => expect([wrap.getAttribute("aria-pressed"), block.classList.contains("nol-code-block-wrapped")]).toEqual(["true", true]));

      await userEvent.keyboard("{ArrowRight}");
      await vi.waitFor(() => expect(document.activeElement).toBe(run));
      await vi.waitFor(() => expect(DocsFixture.all(toolbar, "[tabindex=\"0\"]")).toEqual([run]));
      await userEvent.keyboard(" ");
      await vi.waitFor(() => expect(examples.textContent).toContain("Ran git status --short in bash"));
      await vi.waitFor(() => expect(run.getAttribute("aria-label")).toBe("Run bash command again"));

      await userEvent.keyboard("{ArrowLeft}");
      await vi.waitFor(() => expect(document.activeElement).toBe(wrap));
    });
  });

  describe("the Sash page", () => {
    it("reports a step's move on each arrow key of its orientation, which its owner applies within its limits", async () => {
      const host = await renderAsync(expectPage("SashComponent"));
      const examples = section(host, "Examples");
      const side = DocsFixture.one(examples, "nol-sash[aria-label=\"Resize the outline\"]");
      const history = DocsFixture.one(examples, "nol-sash[aria-label=\"Resize the history\"]");

      side.focus();
      await userEvent.keyboard("{ArrowRight}");
      await vi.waitFor(() => expect(side.getAttribute("aria-valuenow")).toBe("120"));
      expect(examples.textContent).toContain("Outline: 120 px");
      await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
      await vi.waitFor(() => expect(side.getAttribute("aria-valuenow")).toBe("104"));

      history.focus();
      await userEvent.keyboard("{ArrowDown}");
      await vi.waitFor(() => expect(history.getAttribute("aria-valuenow")).toBe("40"));
      await userEvent.keyboard("{ArrowUp}{ArrowUp}");
      await vi.waitFor(() => expect(history.getAttribute("aria-valuenow")).toBe("56"));
      expect(examples.textContent).toContain("History: 56 px");
    });
  });

  describe("the Tab page", () => {
    it("moves the focus along its tabs with the arrows, Home and End through its owner, and selects the focused tab on Enter", async () => {
      const host = await renderAsync(expectPage("TabComponent"));
      const examples = section(host, "Examples");
      const strip = DocsFixture.one(examples, "[role=\"tablist\"][aria-label=\"Open notes\"]");
      const notes = DocsFixture.one(strip, "nol-tab[aria-label=\"Notes\"]");
      const outline = DocsFixture.one(strip, "nol-tab[aria-label=\"Outline\"]");

      notes.focus();
      await userEvent.keyboard("{ArrowRight}");
      await vi.waitFor(() => expect(document.activeElement).toBe(outline));
      expect(outline.getAttribute("aria-selected")).toBe("false");

      await userEvent.keyboard("{Enter}");
      await vi.waitFor(() => expect([outline.getAttribute("aria-selected"), outline.getAttribute("tabindex"), notes.getAttribute("tabindex")]).toEqual(["true", "0", "-1"]));
      expect(examples.textContent).toContain("Showing: Outline");

      await userEvent.keyboard("{End}");
      await vi.waitFor(() => expect(document.activeElement).toBe(DocsFixture.one(strip, "nol-tab[aria-label=\"Tasks\"]")));
      await userEvent.keyboard("{ArrowRight}");
      await vi.waitFor(() => expect(document.activeElement).toBe(notes));
      await userEvent.keyboard("{ArrowLeft}");
      await vi.waitFor(() => expect(document.activeElement?.getAttribute("aria-label")).toBe("Tasks"));
    });

    it("closes the focused tab on Delete, and its owner selects the next one left", async () => {
      const host = await renderAsync(expectPage("TabComponent"));
      const examples = section(host, "Examples");
      const strip = DocsFixture.one(examples, "[role=\"tablist\"][aria-label=\"Open notes\"]");

      DocsFixture.one(strip, "nol-tab[aria-label=\"Notes\"]").focus();
      await userEvent.keyboard("{Delete}");

      await vi.waitFor(() => expect(DocsFixture.all(strip, "nol-tab").map(t => t.getAttribute("aria-label"))).toEqual(["Outline", "Tasks"]));
      expect(DocsFixture.one(strip, "nol-tab[aria-selected=\"true\"]").getAttribute("aria-label")).toBe("Outline");
      expect(examples.textContent).toContain("Showing: Outline");
    });

    it("goes back to the first tab on Home, keeps the selection when another tab closes, and shows no note once every tab is closed", async () => {
      const host = await renderAsync(expectPage("TabComponent"));
      const preview = DocsFixture.one(section(host, "Examples"), "nol-docs-tab-strip-example");
      const tab = (label: string): HTMLElement => DocsFixture.one(preview, `nol-tab[aria-label="${label}"]`);
      const closeAsync = async (label: string, count: number): Promise<void> => {
        DocsFixture.one(tab(label), "button.nol-tab-close").click();
        await vi.waitFor(() => expect(DocsFixture.all(preview, "nol-tab").length).toBe(count));
      };
      const notes = tab("Notes");

      notes.focus();
      await userEvent.keyboard("{End}");
      await vi.waitFor(() => expect(document.activeElement).toBe(tab("Tasks")));
      await userEvent.keyboard("{Home}");
      await vi.waitFor(() => expect(document.activeElement).toBe(notes));

      await closeAsync("Outline", 2);
      expect(preview.textContent).toContain("Showing: Notes");
      await closeAsync("Notes", 1);
      await vi.waitFor(() => expect(preview.textContent).toContain("Showing: Tasks"));
      await closeAsync("Tasks", 0);
      await vi.waitFor(() => expect(preview.textContent).toContain("No note open"));
    });
  });

  describe("the Tree page", () => {
    const row = (tree: HTMLElement, label: string): HTMLElement | undefined =>
      DocsFixture.all(tree, "[role=\"treeitem\"]").find(t => t.querySelector(".nol-tree-label")?.textContent?.trim() === label);

    it("closes and opens a branch with the arrows, moves into it, and chooses a row on Enter", async () => {
      const host = await renderAsync(expectPage("TreeComponent"));
      const examples = section(host, "Examples");
      const tree = DocsFixture.one(examples, "[role=\"tree\"][aria-label=\"Project files\"]");

      row(tree, "Project")?.focus();
      await vi.waitFor(() => expect(document.activeElement).toBe(row(tree, "Project")));
      await userEvent.keyboard("{ArrowLeft}");
      await vi.waitFor(() => expect(row(tree, "Project")?.getAttribute("aria-expanded")).toBe("false"));
      await userEvent.keyboard("{ArrowRight}");
      await vi.waitFor(() => expect(row(tree, "Project")?.getAttribute("aria-expanded")).toBe("true"));

      await userEvent.keyboard("{ArrowDown}");
      await vi.waitFor(() => expect(document.activeElement).toBe(row(tree, "Source")));
      await userEvent.keyboard("{ArrowRight}");
      await vi.waitFor(() => expect(row(tree, "Source")?.getAttribute("aria-expanded")).toBe("true"));
      await userEvent.keyboard("{ArrowRight}");
      await vi.waitFor(() => expect(document.activeElement).toBe(row(tree, "App")));
      await userEvent.keyboard("{ArrowLeft}");
      await vi.waitFor(() => expect(document.activeElement).toBe(row(tree, "Source")));

      await userEvent.keyboard("{Enter}");
      await vi.waitFor(() => expect(row(tree, "Source")?.getAttribute("aria-expanded")).toBe("false"));
      expect(examples.textContent).toContain("Opened: Source");
      expect(row(tree, "Source")?.getAttribute("aria-selected")).toBe("true");
    });

    it("moves the focused row among its siblings on Alt with Arrow Down, keeping the focus on it", async () => {
      const host = await renderAsync(expectPage("TreeComponent"));
      const tree = DocsFixture.one(section(host, "Examples"), "[role=\"tree\"][aria-label=\"Reading list\"]");
      const labels = (): readonly (string | undefined)[] => DocsFixture.all(tree, "[role=\"treeitem\"] .nol-tree-label").filter(t => t.checkVisibility())
        .map(t => t.textContent?.trim());

      row(tree, "Atlas")?.focus();
      await vi.waitFor(() => expect(document.activeElement).toBe(row(tree, "Atlas")));
      await userEvent.keyboard("{Alt>}{ArrowDown}{/Alt}");

      await vi.waitFor(() => expect(labels()).toEqual(["Books", "Field guide", "Atlas", "Articles", "Later"]));
      await vi.waitFor(() => expect(document.activeElement).toBe(row(tree, "Atlas")));
    });
  });

  describe("the Virtual list page", () => {
    it("moves to its last and first rows on End and Home, to the next on Arrow Down, and chooses the focused row on Enter", async () => {
      const host = await renderAsync(expectPage("VirtualListComponent"));
      const examples = section(host, "Examples");
      const list = DocsFixture.one(examples, "[role=\"listbox\"][aria-label=\"Notes\"]");
      const position = (): string | null | undefined => document.activeElement?.getAttribute("aria-posinset");

      DocsFixture.one(list, "[role=\"option\"][tabindex=\"0\"]").focus();
      await userEvent.keyboard("{End}");
      await vi.waitFor(() => expect(position()).toBe("1000"));
      expect(document.activeElement?.textContent?.trim()).toBe("Note 1000");
      expect(list.contains(document.activeElement)).toBe(true);

      await userEvent.keyboard("{Home}");
      await vi.waitFor(() => expect(position()).toBe("1"));
      await userEvent.keyboard("{ArrowDown}");
      await vi.waitFor(() => expect(position()).toBe("2"));

      await userEvent.keyboard("{Enter}");
      await vi.waitFor(() => expect(examples.textContent).toContain("Chosen: Note 2"));
      await vi.waitFor(() => expect(document.activeElement?.getAttribute("aria-selected")).toBe("true"));
    });
  });

  describe("the Terminal output page", () => {
    it("reads its runs as one text, and opens a capped log at its end", async () => {
      const host = await renderAsync(expectPage("TerminalOutputComponent"));
      const examples = section(host, "Examples");
      const run = DocsFixture.one(examples, ".nol-docs-example-preview pre.nol-terminal-output-body:not([style*=\"max-height\"])");
      const log = DocsFixture.one(examples, ".nol-docs-example-preview pre.nol-terminal-output-body[style*=\"max-height\"]");

      expect(run.textContent).toContain("expected 3 items, received 2");
      expect(run.querySelectorAll("span").length).toBeGreaterThan(5);
      await vi.waitFor(() => expect(log.scrollHeight - log.clientHeight - log.scrollTop).toBeLessThanOrEqual(1));
      expect(log.scrollHeight).toBeGreaterThan(log.clientHeight);
      expect(log.textContent).toContain("[40] synced note 40");
    });
  });

  describe("the Configuration table page", () => {
    it("names its table by its heading, and its owner removes and adds the rows its actions name", async () => {
      const host = await renderAsync(expectPage("ConfigurationTableComponent"));
      const examples = section(host, "Examples");
      const table = DocsFixture.one(examples, "nol-configuration-table:has([role=\"heading\"])");
      const names = (): readonly (string | undefined)[] => DocsFixture.all(table, "tbody tr td:first-child").map(t => t.textContent?.trim());

      expect(DocsFixture.one(table, "[role=\"heading\"]").textContent?.trim()).toBe("Note authors");
      await userEvent.click(DocsFixture.one(table, "button[aria-label=\"Remove Ada Park\"]"));
      await vi.waitFor(() => expect(names()).toEqual(["Mia Lund"]));

      await userEvent.click(DocsFixture.byText(table, "button", "Add"));
      await vi.waitFor(() => expect(names()).toEqual(["Mia Lund", "Author 2"]));
      expect(table.querySelector("button[aria-label=\"Remove Author 2\"]")).not.toBeNull();
    });
  });

  describe("the Message page", () => {
    it("moves through a reply's actions with the arrow keys, Home and End, presses one with Enter, and leaves for its article on Escape", async () => {
      const host = await renderAsync(expectPage("MessageComponent"));
      const article = DocsFixture.one(section(host, "Examples"), ".nol-docs-example-preview [role=\"article\"]");
      const helpful = DocsFixture.one(article, "button[aria-label=\"Helpful\"]");
      const copy = DocsFixture.one(article, "button.nol-message-copy");

      expect(document.getElementById(article.getAttribute("aria-labelledby") ?? "")?.textContent).toContain("Guide");
      helpful.focus();
      await userEvent.keyboard("{ArrowRight}");
      await vi.waitFor(() => expect(document.activeElement).toBe(copy));
      await userEvent.keyboard("{Home}");
      await vi.waitFor(() => expect(document.activeElement).toBe(helpful));
      await userEvent.keyboard("{End}");
      await vi.waitFor(() => expect(document.activeElement).toBe(copy));
      await userEvent.keyboard("{ArrowLeft}");
      await vi.waitFor(() => expect(document.activeElement).toBe(helpful));
      await userEvent.keyboard("{Enter}");
      await vi.waitFor(() => expect(helpful.getAttribute("aria-pressed")).toBe("true"));
      await userEvent.keyboard("{Escape}");
      await vi.waitFor(() => expect(document.activeElement).toBe(article));
    });

    it("shows a failed reply's error with Retry, and drops both once its owner tries again", async () => {
      const host = await renderAsync(expectPage("MessageComponent"));
      const failed = DocsFixture.one(section(host, "Examples"), ".nol-docs-example-preview nol-message:has(.nol-message-retry)");

      expect(failed.querySelector(".nol-message-error-text")?.textContent?.trim()).toBe("The connection closed before the reply ended.");
      await userEvent.click(DocsFixture.one(failed, "button.nol-message-retry"));
      await vi.waitFor(() => expect(failed.querySelector(".nol-message-error")).toBeNull());
      await vi.waitFor(() => expect(failed.textContent).toContain("in the note Weekly plan, under Monday."));
    });

    it("opens its owner's menu on Shift+F10 below the focused part, and gives that part the focus back on Escape", async () => {
      const host = await renderAsync(expectPage("MessageComponent"));
      const menued = DocsFixture.one(section(host, "Examples"), ".nol-docs-example-preview .nol-docs-message-menu");
      const copy = DocsFixture.one(menued, "button.nol-message-copy");

      copy.focus();
      await userEvent.keyboard("{Shift>}{F10}{/Shift}");
      await vi.waitFor(() => expect(activeLabel()).toBe("Quote"));
      expect(outside(host, "nol-menu[aria-label=\"Message menu\"]").length).toBe(1);
      await userEvent.keyboard("{Escape}");
      await vi.waitFor(() => expect(document.activeElement).toBe(copy));
      await vi.waitFor(() => expect(outside(host, "nol-menu[aria-label=\"Message menu\"]")).toEqual([]));
    });

    it("opens its owner's menu at the pointer on a right click, and shows the item picked from it", async () => {
      const host = await renderAsync(expectPage("MessageComponent"));
      const preview = DocsFixture.one(section(host, "Examples"), "nol-docs-message-menu-example");

      await userEvent.click(DocsFixture.one(preview, "nol-message"), { button: "right" });
      await vi.waitFor(() => expect(DocsFixture.all(document, "[role=\"menu\"] [role=\"menuitem\"]").length).toBe(2));
      await userEvent.click(DocsFixture.byText(document, ".nol-menu-item-label", "Quote"));

      await vi.waitFor(() => expect(document.querySelector("[role=\"menu\"]")).toBeNull());
      expect(preview.textContent).toContain("Chosen: Quote");
    });
  });

  describe("the Markdown view page", () => {
    it("moves to its next link on Tab and hands the focused link to its owner on Enter, which never follows it", async () => {
      const host = await renderAsync(expectPage("MarkdownViewComponent"));
      const examples = section(host, "Examples");
      const view = DocsFixture.one(examples, ".nol-docs-example-preview nol-markdown-view:has(.nol-markdown-mention)");
      const notes = DocsFixture.one(view, "a.nol-markdown-link[href=\"https://example.com/notes\"]");
      const guide = DocsFixture.one(view, "a.nol-markdown-link[href=\"https://example.com/guide\"]");
      const address = location.href;

      notes.focus();
      await userEvent.keyboard("{Tab}");
      await vi.waitFor(() => expect(document.activeElement).toBe(guide));
      await userEvent.keyboard("{Enter}");
      await vi.waitFor(() => expect(examples.textContent).toContain("Opened https://example.com/guide"));
      expect([location.href, document.activeElement]).toEqual([address, guide]);
    });

    it("draws its text as elements: a heading with its level, the task items' marks, the table's alignment and the code in the kit's code block", async () => {
      const host = await renderAsync(expectPage("MarkdownViewComponent"));
      const view = DocsFixture.one(section(host, "Examples"), ".nol-docs-example-preview nol-markdown-view:has(nol-code-block)");
      const cells = DocsFixture.all(view, ".nol-markdown-table thead > tr > *");

      expect(DocsFixture.one(view, "[role=\"heading\"]").textContent?.trim()).toBe("Pin a note");
      expect(DocsFixture.all(view, ".nol-markdown-task-mark").map(t => t.getAttribute("aria-label"))).toEqual(["Done", "Not done"]);
      expect(cells.map(t => [t.tagName, t.style.textAlign])).toEqual([["TH", "left"], ["TH", "right"]]);
      expect([view.querySelector("s")?.textContent, view.querySelector("code[nol-inline-code]")?.textContent, DocsFixture.one(view, "nol-code-block pre code").textContent])
        .toEqual(["Star", "notes.pinned", "git status --short"]);
    });
  });
});
