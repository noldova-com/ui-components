/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Resources } from "../../resources.js";
import { ComponentPageComponent } from "../components/component-page/component-page.component.js";
import { GettingStartedPageComponent } from "../components/getting-started-page/getting-started-page.component.js";
import { TokensPageComponent } from "../components/tokens-page/tokens-page.component.js";
import { DocsGroup } from "../enums/docs-group.js";
import { ApiReference } from "./api-reference.js";
import type { DocsComponentPage } from "./docs-component-page.js";
import { DocsMenuGroup } from "./docs-menu-group.js";
import { DocsPage } from "./docs-page.js";
import { AvatarPage } from "./pages/avatar-page.js";
import { ButtonPage } from "./pages/button-page.js";
import { CardPage } from "./pages/card-page.js";
import { CheckboxPage } from "./pages/checkbox-page.js";
import { ChipPage } from "./pages/chip-page.js";
import { ChoicePillsPage } from "./pages/choice-pills-page.js";
import { ChoiceRowPage } from "./pages/choice-row-page.js";
import { CodeBlockPage } from "./pages/code-block-page.js";
import { CompletionListPage } from "./pages/completion-list-page.js";
import { ConfigurationTablePage } from "./pages/configuration-table-page.js";
import { DialogPage } from "./pages/dialog-page.js";
import { FieldMessagePage } from "./pages/field-message-page.js";
import { FileBadgePage } from "./pages/file-badge-page.js";
import { GroupHeaderPage } from "./pages/group-header-page.js";
import { IconButtonPage } from "./pages/icon-button-page.js";
import { InlineCodePage } from "./pages/inline-code-page.js";
import { MarkdownViewPage } from "./pages/markdown-view-page.js";
import { MenuBarItemPage } from "./pages/menu-bar-item-page.js";
import { MenuBarPage } from "./pages/menu-bar-page.js";
import { MenuGroupPage } from "./pages/menu-group-page.js";
import { MenuItemPage } from "./pages/menu-item-page.js";
import { MenuPage } from "./pages/menu-page.js";
import { MenuSeparatorPage } from "./pages/menu-separator-page.js";
import { MessagePage } from "./pages/message-page.js";
import { MeterPage } from "./pages/meter-page.js";
import { PanelCardPage } from "./pages/panel-card-page.js";
import { ProgressPage } from "./pages/progress-page.js";
import { QuickInputPage } from "./pages/quick-input-page.js";
import { RadioGroupPage } from "./pages/radio-group-page.js";
import { RadioPage } from "./pages/radio-page.js";
import { SashPage } from "./pages/sash-page.js";
import { SectionHeaderPage } from "./pages/section-header-page.js";
import { SelectPage } from "./pages/select-page.js";
import { SpinnerPage } from "./pages/spinner-page.js";
import { SplitButtonPage } from "./pages/split-button-page.js";
import { SwitchPage } from "./pages/switch-page.js";
import { TabPage } from "./pages/tab-page.js";
import { TerminalOutputPage } from "./pages/terminal-output-page.js";
import { TextFieldBoxPage } from "./pages/text-field-box-page.js";
import { TextFieldPage } from "./pages/text-field-page.js";
import { ToolbarButtonPage } from "./pages/toolbar-button-page.js";
import { TooltipPage } from "./pages/tooltip-page.js";
import { TreePage } from "./pages/tree-page.js";
import { ViewBadgePage } from "./pages/view-badge-page.js";
import { VirtualListPage } from "./pages/virtual-list-page.js";

export class DocsCatalog {
  public static readonly gettingStarted: DocsPage = new DocsPage(Resources.gettingStartedTitle, Resources.gettingStartedPath, null, GettingStartedPageComponent, null);
  public static readonly tokens: DocsPage = new DocsPage(Resources.tokensTitle, Resources.tokensPath, null, TokensPageComponent, null);
  public static readonly writtenPages: readonly DocsPage[] = [
    DocsCatalog.componentPage(ButtonPage.content, "button", DocsGroup.Inputs),
    DocsCatalog.componentPage(CheckboxPage.content, "checkbox", DocsGroup.Choices),
    DocsCatalog.componentPage(SwitchPage.content, "switch", DocsGroup.Choices),
    DocsCatalog.componentPage(RadioPage.content, "radio", DocsGroup.Choices),
    DocsCatalog.componentPage(ChoiceRowPage.content, "choice-row", DocsGroup.Choices),
    DocsCatalog.componentPage(RadioGroupPage.content, "radio-group", DocsGroup.Choices),
    DocsCatalog.componentPage(ChoicePillsPage.content, "choice-pills", DocsGroup.Choices),
    DocsCatalog.componentPage(FieldMessagePage.content, "field-message", DocsGroup.Inputs),
    DocsCatalog.componentPage(IconButtonPage.content, "icon-button", DocsGroup.Inputs),
    DocsCatalog.componentPage(SelectPage.content, "select", DocsGroup.Choices),
    DocsCatalog.componentPage(SplitButtonPage.content, "split-button", DocsGroup.Inputs),
    DocsCatalog.componentPage(TextFieldPage.content, "text-field", DocsGroup.Inputs),
    DocsCatalog.componentPage(TextFieldBoxPage.content, "text-field-box", DocsGroup.Inputs),
    DocsCatalog.componentPage(MenuPage.content, "menu", DocsGroup.Overlays),
    DocsCatalog.componentPage(MenuItemPage.content, "menu-item", DocsGroup.Overlays),
    DocsCatalog.componentPage(MenuGroupPage.content, "menu-group", DocsGroup.Overlays),
    DocsCatalog.componentPage(MenuSeparatorPage.content, "menu-separator", DocsGroup.Overlays),
    DocsCatalog.componentPage(MenuBarPage.content, "menu-bar", DocsGroup.Overlays),
    DocsCatalog.componentPage(MenuBarItemPage.content, "menu-bar-item", DocsGroup.Overlays),
    DocsCatalog.componentPage(DialogPage.content, "dialog", DocsGroup.Overlays),
    DocsCatalog.componentPage(TooltipPage.content, "tooltip", DocsGroup.Overlays),
    DocsCatalog.componentPage(QuickInputPage.content, "quick-input", DocsGroup.Overlays),
    DocsCatalog.componentPage(CompletionListPage.content, "completion-list", DocsGroup.Overlays),
    DocsCatalog.componentPage(ToolbarButtonPage.content, "toolbar-button", DocsGroup.Inputs),
    DocsCatalog.componentPage(AvatarPage.content, "avatar", DocsGroup.Content),
    DocsCatalog.componentPage(CardPage.content, "card", DocsGroup.Content),
    DocsCatalog.componentPage(PanelCardPage.content, "panel-card", DocsGroup.Content),
    DocsCatalog.componentPage(InlineCodePage.content, "inline-code", DocsGroup.Content),
    DocsCatalog.componentPage(CodeBlockPage.content, "code-block", DocsGroup.Content),
    DocsCatalog.componentPage(FileBadgePage.content, "file-badge", DocsGroup.Content),
    DocsCatalog.componentPage(SectionHeaderPage.content, "section-header", DocsGroup.Content),
    DocsCatalog.componentPage(GroupHeaderPage.content, "group-header", DocsGroup.Content),
    DocsCatalog.componentPage(ChipPage.content, "chip", DocsGroup.Status),
    DocsCatalog.componentPage(ViewBadgePage.content, "view-badge", DocsGroup.Status),
    DocsCatalog.componentPage(MeterPage.content, "meter", DocsGroup.Status),
    DocsCatalog.componentPage(ProgressPage.content, "progress", DocsGroup.Status),
    DocsCatalog.componentPage(SpinnerPage.content, "spinner", DocsGroup.Status),
    DocsCatalog.componentPage(SashPage.content, "sash", DocsGroup.Layout),
    DocsCatalog.componentPage(TabPage.content, "tab", DocsGroup.Layout),
    DocsCatalog.componentPage(TreePage.content, "tree", DocsGroup.Layout),
    DocsCatalog.componentPage(VirtualListPage.content, "virtual-list", DocsGroup.Layout),
    DocsCatalog.componentPage(TerminalOutputPage.content, "terminal-output", DocsGroup.Layout),
    DocsCatalog.componentPage(ConfigurationTablePage.content, "configuration-table", DocsGroup.Layout),
    DocsCatalog.componentPage(MessagePage.content, "message", DocsGroup.Content),
    DocsCatalog.componentPage(MarkdownViewPage.content, "markdown-view", DocsGroup.Content)
  ];
  public static readonly excludedComponents: ReadonlySet<string> = new Set([
    "DiffViewComponent",
    "DockingGuideComponent",
    "DockingPlateComponent",
    "GalleryCellComponent",
    "GalleryComponent",
    "GallerySpecimenComponent",
    "PermissionCardComponent",
    "PlanComponent",
    "ToolCallComponent"
  ]);
  public static readonly componentPages: readonly DocsPage[] = ApiReference.components.flatMap(t => DocsCatalog.writtenPages.filter(u => u.componentName === t.name));
  public static readonly pages: readonly DocsPage[] = [DocsCatalog.gettingStarted, DocsCatalog.tokens, ...DocsCatalog.componentPages];
  public static readonly menuGroups: readonly DocsMenuGroup[] = Object.values(DocsGroup)
    .map(t => new DocsMenuGroup(Resources.groupLabels[t], DocsCatalog.componentPages.filter(u => u.group === t)))
    .filter(t => t.pages.length > 0);

  private static componentPage(content: DocsComponentPage, name: string, group: DocsGroup): DocsPage {
    return new DocsPage(content.title, `${Resources.componentsPath}/${name}`, group, ComponentPageComponent, content);
  }
}
