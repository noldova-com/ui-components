/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { NgTemplateOutlet } from "@angular/common";
import { Component, type Signal, type TemplateRef, ViewEncapsulation, inject, input, linkedSignal, output } from "@angular/core";

import { MarkdownNodeKind } from "../../enums/markdown-node-kind.js";
import type { ILinkReferenceSource } from "../../interfaces/i-link-reference-source.js";
import type { IMessageImageContext } from "../../interfaces/i-message-image-context.js";
import { LinkMenuEvent } from "../../models/link-menu-event.js";
import { LinkOpenEvent } from "../../models/link-open-event.js";
import type { LinkReference } from "../../models/link-reference.js";
import type { MarkdownNode } from "../../models/markdown.node.js";
import { MarkdownLink } from "../../models/markdown-link.js";
import type { MarkdownMentions } from "../../models/markdown-mentions.js";
import type { MarkdownShellRunner } from "../../models/markdown-shell-runner.js";
import { MarkdownRuns } from "../../models/markdown-runs.js";
import { MarkdownViewTokens } from "../../models/markdown-view-tokens.js";
import type { MentionCandidate } from "../../models/mention-candidate.js";
import { Resources } from "../../../resources.js";
import { CodeBlockComponent } from "../code-block/code-block.component.js";
import { ShellRunOutputComponent } from "../code-block/shell-run-output.component.js";
import { FileBadgeComponent } from "../file-badge/file-badge.component.js";
import { InlineCodeComponent } from "../inline-code/inline-code.component.js";
import { LinkReferenceChipComponent } from "../link-reference/link-reference-chip.component.js";
import { LinkReferenceWorkItemStateComponent } from "../link-reference/link-reference-work-item-state.component.js";
import { MarkdownMathComponent } from "./markdown-math.component.js";
import { MarkdownViewNodesResources } from "./markdown-view-nodes.resources.js";

@Component({
  selector: "[nol-markdown-nodes]",
  imports: [CodeBlockComponent, FileBadgeComponent, InlineCodeComponent, LinkReferenceChipComponent, LinkReferenceWorkItemStateComponent, MarkdownMathComponent, NgTemplateOutlet, ShellRunOutputComponent],
  templateUrl: "./markdown-view-nodes.component.html",
  encapsulation: ViewEncapsulation.None
})
export class MarkdownViewNodesComponent {
  private static count: number = 0;
  private readonly found: Map<string, Signal<LinkReference | null> | null> = new Map();
  private foundBy: ILinkReferenceSource | null = null;
  protected readonly codeHeight: number | null = inject(MarkdownViewTokens.codeHeight);
  protected readonly mentions: Signal<MarkdownMentions> = inject(MarkdownViewTokens.mentions);
  protected readonly fileLinks: Signal<boolean> = inject(MarkdownViewTokens.fileLinks);
  protected readonly folderLinks: Signal<ReadonlySet<string>> = inject(MarkdownViewTokens.folderLinks);
  protected readonly references: Signal<ILinkReferenceSource | null> = inject(MarkdownViewTokens.references);
  protected readonly streaming: Signal<boolean> = inject(MarkdownViewTokens.streaming);
  protected readonly shellRunner: MarkdownShellRunner = inject(MarkdownViewTokens.shellRunner);
  protected readonly image: Signal<TemplateRef<IMessageImageContext> | null> = inject(MarkdownViewTokens.images).template;
  protected readonly kinds: typeof MarkdownNodeKind = MarkdownNodeKind;
  protected readonly textKinds: ReadonlySet<MarkdownNodeKind> = Resources.markdownTextKinds;
  protected readonly inlineKinds: ReadonlySet<MarkdownNodeKind> = Resources.markdownInlineKinds;
  protected readonly tableKinds: ReadonlySet<MarkdownNodeKind> = MarkdownViewNodesResources.markdownTableKinds;
  protected readonly taskLabels: readonly string[] = MarkdownViewNodesResources.markdownTaskLabels;
  protected readonly checkId: string = `${Resources.markdownTaskCheckIdPrefix}${MarkdownViewNodesComponent.count++}-`;
  protected readonly runs: Signal<readonly (readonly MarkdownNode[])[] | null> = linkedSignal({
    source: () => this.nodes(),
    computation: (nodes, previous?: { readonly source: readonly MarkdownNode[]; readonly value: readonly (readonly MarkdownNode[])[] | null }) =>
      MarkdownRuns.of(nodes, previous?.value ?? null, this.top())
  });

  public readonly nodes = input.required<readonly MarkdownNode[]>();
  public readonly top = input<boolean>(false);
  public readonly linkActivate = output<LinkOpenEvent>();
  public readonly linkMenu = output<LinkMenuEvent>();

  protected isShownAsLink(node: MarkdownNode): boolean {
    return this.fileLinks() || !MarkdownLink.isPath(node.href);
  }

  protected referenceOf(node: MarkdownNode): LinkReference | null {
    const source = this.references();
    if (Object.isNull(source))
      return null;
    if (source !== this.foundBy) {
      this.found.clear();
      this.foundBy = source;
    }
    const text = this.textOf(node);
    const key = `${node.href}\n${text}`;
    let reference = this.found.get(key);
    if (Object.isUndefined(reference)) {
      reference = source.find(node.href, text);
      this.found.set(key, reference);
    }
    return reference?.() ?? null;
  }

  protected pathOf(node: MarkdownNode): string | null {
    return this.fileLinks() ? MarkdownLink.fileOf(node.href) : null;
  }

  protected fileNameOf(node: MarkdownNode): string {
    return MarkdownLink.fileNameOf(node.href);
  }

  protected mentionIdOf(node: MarkdownNode): string | null {
    return MarkdownLink.mentionIdOf(node.href);
  }

  protected mentionOf(id: string): MentionCandidate | null {
    return this.mentions().byId(id);
  }

  protected textOf(node: MarkdownNode): string {
    return node.children.map(t => t.text || this.textOf(t)).join(String.empty);
  }

  protected activate(event: MouseEvent | KeyboardEvent, href: string): void {
    event.preventDefault();
    this.linkActivate.emit(new LinkOpenEvent(href, event));
  }

  protected activateKey(event: KeyboardEvent, href: string): void {
    if (event.key === Resources.enterKey)
      this.activate(event, href);
  }

  protected openMenu(event: MouseEvent, href: string): void {
    this.linkMenu.emit(new LinkMenuEvent(href, event));
  }

  protected activateAuxiliary(event: MouseEvent, href: string): void {
    if (event.button === Resources.middleButton)
      this.activate(event, href);
  }
}
