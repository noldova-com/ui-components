/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { kitDocument } from "@docs-generated/documents/section-header.js";
import { exampleFiles as sectionHeaderCollapsibleFiles } from "@docs-generated/examples/section-header-collapsible-example.js";
import { exampleFiles as sectionHeaderGroupsFiles } from "@docs-generated/examples/section-header-groups-example.js";

import { GallerySectionHeaderComponent } from "../../../../../noldova.ui.components.angular/src/app/components/gallery/gallery-section-header.component.js";
import { SectionHeaderCollapsibleExampleComponent } from "../../components/section-header-collapsible-example/section-header-collapsible-example.component.js";
import { SectionHeaderGroupsExampleComponent } from "../../components/section-header-groups-example/section-header-groups-example.component.js";
import { DocsComponentPage } from "../docs-component-page.js";
import { DocsExample } from "../docs-example.js";
import { SectionHeaderPageResources } from "./section-header-page.resources.js";

export class SectionHeaderPage {
  public static readonly content: DocsComponentPage = new DocsComponentPage(SectionHeaderPageResources.title, SectionHeaderPageResources.componentName, [
    new DocsExample(SectionHeaderPageResources.sectionHeaderGroupsTitle, SectionHeaderGroupsExampleComponent, sectionHeaderGroupsFiles),
    new DocsExample(SectionHeaderPageResources.sectionHeaderCollapsibleTitle, SectionHeaderCollapsibleExampleComponent, sectionHeaderCollapsibleFiles)
  ], GallerySectionHeaderComponent, kitDocument, SectionHeaderPageResources.keys, SectionHeaderPageResources.roles);
}
