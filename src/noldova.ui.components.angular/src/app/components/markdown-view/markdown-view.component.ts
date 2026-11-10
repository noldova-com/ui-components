/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isPlatformBrowser } from "@angular/common";
import {
  Component, DestroyRef, ElementRef, PLATFORM_ID, type ResourceRef, type Signal, ViewEncapsulation, afterRenderEffect, computed, contentChild, effect, inject, input,
  output, resource, untracked
} from "@angular/core";
import type { MarkdownIt } from "markdown-it";

import "@noldova/context.core";

import { MarkdownNodeKind } from "../../enums/markdown-node-kind.js";
import type { ShellRunState } from "../../enums/shell-run-state.js";
import type { ILinkReferenceSource } from "../../interfaces/i-link-reference-source.js";
import type { IMarkdownParser } from "../../interfaces/i-markdown.parser.js";
import type { LinkMenuEvent } from "../../models/link-menu-event.js";
import type { LinkOpenEvent } from "../../models/link-open-event.js";
import { MarkdownNode } from "../../models/markdown.node.js";
import { MarkdownReader } from "../../models/markdown.reader.js";
import { MarkdownFilePaths } from "../../models/markdown-file-paths.js";
import { MarkdownLink } from "../../models/markdown-link.js";
import { MarkdownLinkSchemes } from "../../models/markdown-link-schemes.js";
import { MarkdownImages } from "../../models/markdown-images.js";
import { MarkdownMentions } from "../../models/markdown-mentions.js";
import { MarkdownReveal } from "../../models/markdown-reveal.js";
import { MarkdownShellRunner } from "../../models/markdown-shell-runner.js";
import { MarkdownViewTokens } from "../../models/markdown-view-tokens.js";
import type { MentionCandidate } from "../../models/mention-candidate.js";
import type { ShellRun } from "../../models/shell-run.js";
import { ShellRunBlocks } from "../../models/shell-run-blocks.js";
import { MarkdownMathRenderer } from "../../services/markdown-math.renderer.js";
import { ShellRunOutputDirective } from "../code-block/shell-run-output.directive.js";
import { MarkdownViewResources } from "./markdown-view.resources.js";
import { MessageImageDirective } from "../message/message-image.directive.js";
import { MarkdownViewNodesComponent } from "./markdown-view-nodes.component.js";

@Component({
  selector: "nol-markdown-view",
  imports: [MarkdownViewNodesComponent],
  templateUrl: "./markdown-view.component.html",
  styleUrl: "./markdown-view.component.css",
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: MarkdownViewTokens.mentions, useFactory: (): Signal<MarkdownMentions> => {
    const view = inject(MarkdownViewComponent);
    return computed(() => new MarkdownMentions(view.mentions(), view.mentionNames()));
  } }, { provide: MarkdownViewTokens.images, useFactory: (): MarkdownImages => new MarkdownImages() },
  { provide: MarkdownViewTokens.fileLinks, useFactory: (): Signal<boolean> => inject(MarkdownViewComponent).fileLinks },
  { provide: MarkdownViewTokens.folderLinks, useFactory: (): Signal<ReadonlySet<string>> => inject(MarkdownViewComponent).folderLinks },
  { provide: MarkdownViewTokens.references, useFactory: (): Signal<ILinkReferenceSource | null> => inject(MarkdownViewComponent).references },
  { provide: MarkdownViewTokens.streaming, useFactory: (): Signal<boolean> => inject(MarkdownViewComponent).streaming },
  { provide: MarkdownViewTokens.shellRunner, useFactory: (): MarkdownShellRunner => {
    const view = inject(MarkdownViewComponent);
    return new MarkdownShellRunner(computed(() => view.shellRuns() && !view.streaming()), t => view.shellRun.emit(t), inject<ElementRef<HTMLElement>>(ElementRef).nativeElement);
  } }, { provide: ShellRunBlocks, useFactory: (): ShellRunBlocks => inject(ShellRunBlocks, { skipSelf: true, optional: true }) ?? new ShellRunBlocks() }],
  host: {
    "class": "nol-markdown-view"
  }
})
export class MarkdownViewComponent {
  private readonly markdown: IMarkdownParser | null = inject(MarkdownViewTokens.parser);
  private readonly reader: MarkdownReader = new MarkdownReader();
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly reveal: MarkdownReveal | null = isPlatformBrowser(inject(PLATFORM_ID)) ? new MarkdownReveal(this.host) : null;
  private readonly image: Signal<MessageImageDirective | undefined> = contentChild(MessageImageDirective, { descendants: false });
  private readonly shellRunOutput: Signal<ShellRunOutputDirective | undefined> = contentChild(ShellRunOutputDirective, { descendants: false });
  private readonly outerImages: MarkdownImages = inject(MarkdownViewTokens.images, { skipSelf: true });
  private readonly mathRenderer: MarkdownMathRenderer = inject(MarkdownMathRenderer);
  private readonly messagePaths: MarkdownFilePaths | null = inject(MarkdownViewTokens.filePaths);
  private readonly filePaths: Signal<readonly string[]> = computed(() => this.fileLinks() ? [...MarkdownViewComponent.filesIn(this.nodes())] : [], { equal: MarkdownFilePaths.isSame });
  private isMathRequested: boolean = false;
  private readonly loadedParser: MarkdownIt | undefined = this.markdown?.parser();
  private readonly parser: ResourceRef<MarkdownIt | null | undefined> = resource({
    params: () => Object.isUndefined(this.loadedParser) ? true : undefined,
    loader: () => Object.isNull(this.markdown) ? Promise.resolve(null) : this.markdown.parserAsync()
  });

  protected readonly nodes: Signal<readonly MarkdownNode[]> = computed(() => {
    const parser = this.loadedParser ?? (this.parser.hasValue() ? this.parser.value() : null);
    return Object.isNull(parser) ? [MarkdownNode.textOf(MarkdownNodeKind.Plain, this.text())] : this.reader.read(parser, this.text(), this.streaming(), this.linkSchemes(), this.math(), this.fileLinks(),
      this.references());
  });

  public readonly text = input.required<string>();
  public readonly streaming = input<boolean>(false);
  public readonly entering = input<boolean>(false);
  public readonly paced = input<boolean>(false);
  public readonly mentions = input<readonly MentionCandidate[]>([]);
  public readonly mentionNames = input<boolean>(true);
  public readonly linkActivate = output<string>();
  public readonly linkOpen = output<LinkOpenEvent>();
  public readonly linkMenu = output<LinkMenuEvent>();
  public readonly fileLinks = input<boolean>(false);
  public readonly linkSchemes = input<MarkdownLinkSchemes>(MarkdownLinkSchemes.none);
  public readonly fileActivate = output<string>();
  public readonly folderLinks = input<ReadonlySet<string>>(new Set());
  public readonly references = input<ILinkReferenceSource | null>(null);
  public readonly filePathsChange = output<readonly string[]>();
  public readonly shellRuns = input<boolean>(false);
  public readonly math = input<boolean>(true);
  public readonly shellRun = output<ShellRun>();
  public readonly shellRunStates = input<ReadonlyMap<number, ShellRunState>>(new Map());
  public readonly shellRunOutputs = input<ReadonlySet<number>>(new Set());

  public constructor() {
    afterRenderEffect(() => this.reveal?.follow(this.streaming(), this.entering(), this.paced()));
    let drawn = String.empty;
    effect(() => {
      const text = this.text();
      if (!text.startsWith(drawn))
        this.reveal?.replace();
      drawn = text;
    });
    let emitted: readonly string[] = [];
    effect(() => {
      const paths = this.filePaths();
      untracked(() => {
        this.messagePaths?.set(this.host, paths);
        if (!MarkdownFilePaths.isSame(paths, emitted)) {
          emitted = paths;
          this.filePathsChange.emit(paths);
        }
      });
    });
    inject(DestroyRef).onDestroy(() => {
      this.reveal?.destroy();
      this.messagePaths?.delete(this.host);
    });
    inject(MarkdownViewTokens.images, { self: true }).take(computed(() => this.image()?.template ?? this.outerImages.template()));
    if (Object.isNull(inject(ShellRunBlocks, { skipSelf: true, optional: true })))
      inject(ShellRunBlocks, { self: true }).take(this.shellRunStates, this.shellRunOutputs, computed(() => this.shellRunOutput()?.template ?? null));
    effect(() => {
      this.text();
      if (!Object.isNull(this.markdown) && untracked(() => this.parser.hasValue() && Object.isNull(this.parser.value())))
        this.parser.reload();
    });
    effect(() => {
      if (!this.isMathRequested && !Object.isNull(this.markdown) && this.math() && this.streaming() && MarkdownViewResources.markdownMathOpenPattern.test(this.text())) {
        this.isMathRequested = true;
        void this.mathRenderer.loadAsync();
      }
    });
  }

  private static filesIn(nodes: readonly MarkdownNode[], files: Set<string> = new Set()): Set<string> {
    for (const node of nodes) {
      const file = node.kind === MarkdownNodeKind.Link ? MarkdownLink.fileOf(node.href) : null;
      if (Object.isNull(file))
        MarkdownViewComponent.filesIn(node.children, files);
      else
        files.add(file);
    }
    return files;
  }

  protected activate(open: LinkOpenEvent): void {
    const path = MarkdownLink.fileOf(open.url);
    if (Object.isNull(path)) {
      this.linkActivate.emit(open.url);
      this.linkOpen.emit(open);
    }
    else
      this.fileActivate.emit(path);
  }

  protected openMenu(menu: LinkMenuEvent): void {
    if (Object.isNull(MarkdownLink.fileOf(menu.url)))
      this.linkMenu.emit(menu);
  }
}
