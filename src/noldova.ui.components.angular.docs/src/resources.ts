/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsGroup } from "./app/enums/docs-group.js";
import { DocsTokenGroup } from "./app/enums/docs-token-group.js";

export class Resources {
  public static readonly siteTitle: string = "Noldova UI Components";
  public static readonly stackedTableClass: string = "nol-docs-stacked";
  public static readonly wordmarkLabel: string = "Noldova";
  public static readonly siteName: string = "UI Components";
  public static readonly repositoryLink: string = "https://github.com/noldova-com/ui-components";
  public static readonly kitDocumentsLink: string = "https://github.com/noldova-com/ui-components/blob/main/documents/kit/";
  public static readonly repositoryLabel: string = "GitHub";
  public static readonly xLink: string = "https://x.com/noldova";
  public static readonly xLabel: string = "X";
  public static readonly menuLabel: string = "Pages";
  public static readonly menuButtonLabel: string = "Menu";
  public static readonly menuGlyph: string = "menu";
  public static readonly onThisPageLabel: string = "On this page";
  public static readonly currentLocation: string = "location";
  public static readonly gettingStartedTitle: string = "Getting started";
  public static readonly gettingStartedPath: string = "";
  public static readonly componentsPath: string = "components";
  public static readonly tokensTitle: string = "Theme tokens";
  public static readonly tokensPath: string = "tokens";
  public static readonly homeLink: string = "/";
  public static readonly searchLabel: string = "Search the docs";
  public static readonly searchResultsLabel: string = "Search results";
  public static readonly searchEmpty: string = "No page matches.";
  public static readonly themeLabel: string = "Theme";
  public static readonly themeSystem: string = "System";
  public static readonly themeLight: string = "Light";
  public static readonly themeDark: string = "Dark";
  public static readonly themeStorageKey: string = "nol-docs-theme";
  public static readonly themeModeAttribute: string = "data-nol-theme-mode";
  public static readonly examplesTitle: string = "Examples";
  public static readonly statesTitle: string = "States";
  public static readonly specificationTitle: string = "Specification";
  public static readonly apiTitle: string = "API";
  public static readonly accessibilityTitle: string = "Accessibility";
  public static readonly inputsTitle: string = "Inputs";
  public static readonly outputsTitle: string = "Outputs";
  public static readonly nameColumn: string = "Name";
  public static readonly typeColumn: string = "Type";
  public static readonly defaultColumn: string = "Default";
  public static readonly descriptionColumn: string = "Description";
  public static readonly keyColumn: string = "Key";
  public static readonly actionColumn: string = "Action";
  public static readonly requiredValue: string = "Required";
  public static readonly modelKind: string = "model";
  public static readonly modelNote: string = "Two-way: bind it as";
  public static readonly noKeys: string = "It takes no keys of its own.";
  public static readonly selectorLabel: string = "Selector";
  public static readonly importLabel: string = "Import from";
  public static readonly loading: string = "Loading…";
  public static readonly groupLabels: Readonly<Record<DocsGroup, string>> = {
    [DocsGroup.Inputs]: "Inputs",
    [DocsGroup.Choices]: "Choices",
    [DocsGroup.Overlays]: "Overlays and menus",
    [DocsGroup.Content]: "Content",
    [DocsGroup.Status]: "Status",
    [DocsGroup.Layout]: "Layout"
  };
  public static readonly tokenGroupLabels: Readonly<Record<DocsTokenGroup, string>> = {
    [DocsTokenGroup.Colors]: "Colors",
    [DocsTokenGroup.Typography]: "Text roles and fonts",
    [DocsTokenGroup.Spacing]: "Spacing",
    [DocsTokenGroup.Radius]: "Radius",
    [DocsTokenGroup.Shadows]: "Shadows",
    [DocsTokenGroup.Metrics]: "Metrics",
    [DocsTokenGroup.Derived]: "Built from other tokens"
  };
  public static readonly missingComponent: string = "The kit exports no component named";
  public static readonly missingToken: string = "gives no value for the token";
  public static readonly hostDirectiveNote: string = "From its host directive,";

  public static formatPageTitle(title: string): string {
    return `${title} · ${Resources.siteTitle}`;
  }

  public static formatMissingComponent(name: string): string {
    return `${Resources.missingComponent} ${name}.`;
  }

  public static formatMissingToken(theme: string, variable: string): string {
    return `The ${theme} theme ${Resources.missingToken} ${variable}.`;
  }

  public static formatHostDirective(directive: string): string {
    return `${Resources.hostDirectiveNote} ${directive}.`;
  }

  public static formatModelBinding(name: string): string {
    return `[(${name})]`;
  }
}
