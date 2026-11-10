/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type Signal, signal } from "@angular/core";

import "@noldova/context.core";

import type { ILinkReferenceSource } from "../../interfaces/i-link-reference-source.js";
import { LinkReference } from "../../models/link-reference.js";
import { LinkReferenceAction } from "../../models/link-reference-action.js";
import { LinkReferenceAuthor } from "../../models/link-reference-author.js";
import { LinkReferenceColor } from "../../models/link-reference-color.js";
import { LinkReferenceDetail } from "../../models/link-reference-detail.js";
import { LinkReferenceDiff } from "../../models/link-reference-diff.js";
import { LinkReferenceImage } from "../../models/link-reference-image.js";
import { LinkReferenceState } from "../../models/link-reference-state.js";
import { LinkReferenceStatus } from "../../models/link-reference-status.js";
import { LinkReferenceTone } from "../../models/link-reference-tone.js";
import { LinkReferenceWorkItemState } from "../../models/link-reference-work-item-state.js";
import { GalleryResources } from "./gallery-resources.js";

export class GalleryReferences implements ILinkReferenceSource {
  private static readonly text: typeof GalleryResources.text = GalleryResources.text;
  private static readonly icons: typeof GalleryResources.referenceIcons = GalleryResources.referenceIcons;
  public static readonly open: LinkReferenceState = GalleryReferences.stateOf(GalleryReferences.text.referenceOpen, GalleryResources.referenceOpenColor);
  public static readonly draft: LinkReferenceState = GalleryReferences.stateOf(GalleryReferences.text.referenceDraft, GalleryResources.referenceDraftColor);
  public static readonly merged: LinkReferenceState = new LinkReferenceState(GalleryReferences.text.referenceMerged,
    GalleryReferences.colorOf(GalleryResources.referenceMergedLightColor, GalleryResources.referenceMergedLightFillPercent),
    GalleryReferences.colorOf(GalleryResources.referenceMergedDarkColor, GalleryResources.referenceMergedDarkFillPercent));
  public static readonly closed: LinkReferenceState = GalleryReferences.stateOf(GalleryReferences.text.referenceClosed, GalleryResources.referenceClosedColor,
    GalleryResources.referenceClosedFillPercent);
  public static readonly failed: LinkReferenceState = GalleryReferences.stateOf(GalleryReferences.text.referenceFailed, GalleryResources.referenceClosedColor);
  public static readonly running: LinkReferenceState = GalleryReferences.stateOf(GalleryReferences.text.referenceRunning, GalleryResources.referenceRunningColor);
  public static readonly passed: LinkReferenceState = GalleryReferences.stateOf(GalleryReferences.text.referencePassed, GalleryResources.referenceOpenColor);
  public static readonly mark: LinkReferenceImage = new LinkReferenceImage(GalleryResources.referenceMark);
  public static readonly colorMark: LinkReferenceImage = new LinkReferenceImage(GalleryResources.referenceColorMark, false);
  public static readonly author: LinkReferenceAuthor = new LinkReferenceAuthor(GalleryReferences.text.referenceAuthor);
  public static readonly pullRequest: LinkReference = GalleryReferences.itemOf(GalleryResources.referencePull, GalleryReferences.icons.pull, GalleryReferences.open, {
    diff: new LinkReferenceDiff(GalleryResources.referenceAdded, GalleryResources.referenceRemoved, GalleryResources.referenceFiles)
  });
  public static readonly issue: LinkReference = GalleryReferences.itemOf(GalleryResources.referenceIssue, GalleryReferences.icons.issue, GalleryReferences.open, {
    comments: GalleryResources.referenceComments
  });
  public static readonly mergeRequest: LinkReference = GalleryReferences.itemOf(GalleryResources.referenceMergeRequest, GalleryReferences.icons.pull, GalleryReferences.open, {
    statuses: [new LinkReferenceStatus(GalleryReferences.text.referencePassed, new LinkReferenceImage(GalleryReferences.icons.done),
      new LinkReferenceTone(GalleryResources.referenceOpenColor, GalleryResources.referenceOpenColor))]
  });
  public static readonly bug: LinkReferenceState = GalleryReferences.stateOf(GalleryResources.referenceWorkItem.reference, GalleryResources.referenceClosedColor,
    GalleryResources.referenceClosedFillPercent);
  public static readonly commitState: LinkReferenceState = GalleryReferences.stateOf(GalleryReferences.text.referenceCommitState, GalleryResources.referenceDraftColor);
  public static readonly workItem: LinkReference = GalleryReferences.itemOf(GalleryResources.referenceWorkItem, GalleryReferences.icons.failed, GalleryReferences.bug, {
      statuses: [new LinkReferenceStatus(GalleryReferences.text.referenceSprint)],
      workItemState: new LinkReferenceWorkItemState(GalleryReferences.text.referenceActive, new LinkReferenceTone(GalleryResources.referenceActiveColor, GalleryResources.referenceActiveColor))
    });
  public static readonly commit: LinkReference = GalleryReferences.itemOf(GalleryResources.referenceCommit, GalleryReferences.icons.done, GalleryReferences.commitState, {
    diff: new LinkReferenceDiff(GalleryResources.referenceCommitAdded, 0, GalleryResources.referenceCommitFiles), footnote: GalleryReferences.text.referenceCommitFootnote,
    details: [new LinkReferenceDetail(GalleryReferences.text.referenceCommitAuthorLabel, GalleryReferences.text.referenceCommitAuthor),
      new LinkReferenceDetail(GalleryReferences.text.referenceCommitBranchesLabel, GalleryReferences.text.referenceCommitBranches)]
  });
  public static readonly runAction: LinkReferenceAction = new LinkReferenceAction(GalleryReferences.text.referenceOpenRun, GalleryResources.referenceRunCard.url);
  public static readonly run: LinkReference = GalleryReferences.itemOf(GalleryResources.referenceRunCard, GalleryReferences.icons.failed, GalleryReferences.failed, {
    duration: GalleryResources.referenceDuration, action: GalleryReferences.runAction
  });

  private readonly items: ReadonlyMap<string, Signal<LinkReference | null>> = new Map([
    [GalleryResources.referencePull.url, signal(GalleryReferences.pullRequest)],
    [GalleryResources.referenceDraftPull.url, signal(GalleryReferences.itemOf(GalleryResources.referenceDraftPull, GalleryReferences.icons.draft, GalleryReferences.draft))],
    [GalleryResources.referenceMergedPull.url, signal(GalleryReferences.itemOf(GalleryResources.referenceMergedPull, GalleryReferences.icons.merged, GalleryReferences.merged))],
    [GalleryResources.referenceClosedPull.url, signal(GalleryReferences.itemOf(GalleryResources.referenceClosedPull, GalleryReferences.icons.closed, GalleryReferences.closed))],
    [GalleryResources.referenceIssue.url, signal(GalleryReferences.issue)],
    [GalleryResources.referenceDoneIssue.url, signal(GalleryReferences.itemOf(GalleryResources.referenceDoneIssue, GalleryReferences.icons.done, GalleryReferences.merged))],
    [GalleryResources.referenceSkippedIssue.url, signal(GalleryReferences.itemOf(GalleryResources.referenceSkippedIssue, GalleryReferences.icons.skipped, GalleryReferences.draft))],
    [GalleryResources.referenceMarked.url, signal(GalleryReferences.itemOf(GalleryResources.referenceMarked, GalleryReferences.icons.pull, GalleryReferences.open, { mark: GalleryReferences.mark }))],
    [GalleryResources.referenceColorMarked.url, signal(GalleryReferences.itemOf(GalleryResources.referenceColorMarked, GalleryReferences.icons.pull, GalleryReferences.open, { mark: GalleryReferences.colorMark }))],
    [GalleryResources.referenceFailedRun.url, signal(GalleryReferences.itemOf(GalleryResources.referenceFailedRun, GalleryReferences.icons.failed, GalleryReferences.failed, {
      duration: GalleryResources.referenceDuration, action: GalleryReferences.runAction
    }))],
    [GalleryResources.referenceRunningJob.url, signal(GalleryReferences.itemOf(GalleryResources.referenceRunningJob, GalleryReferences.icons.running, GalleryReferences.running))],
    [GalleryResources.referencePassedRun.url, signal(GalleryReferences.itemOf(GalleryResources.referencePassedRun, GalleryReferences.icons.done, GalleryReferences.passed))],
    [GalleryResources.referencePendingMarked.url, signal(GalleryReferences.itemOf(GalleryResources.referencePendingMarked, GalleryReferences.icons.pull, GalleryReferences.open, { isMarkPending: true }))],
    [GalleryResources.referenceLong.url, signal(GalleryReferences.itemOf(GalleryResources.referenceLong, GalleryReferences.icons.issue, GalleryReferences.open))],
    [GalleryResources.referenceMergeRequest.url, signal(GalleryReferences.mergeRequest)],
    [GalleryResources.referenceWorkItem.url, signal(GalleryReferences.workItem)],
    [GalleryResources.referenceCommit.url, signal(GalleryReferences.commit)],
    [GalleryResources.referenceBranch.url, signal(new LinkReference(GalleryResources.referenceBranch.reference, GalleryReferences.text.referenceBranchKind,
      new LinkReferenceImage(GalleryReferences.icons.pull), { state: GalleryReferences.draft, hasCard: false }))],
    [GalleryResources.referenceReading.url, signal(new LinkReference(GalleryResources.referenceReading.reference, GalleryReferences.text.referenceIssueKind, new LinkReferenceImage(GalleryReferences.icons.issue)))]
  ]);

  public find(url: string): Signal<LinkReference | null> | null {
    return this.items.get(url) ?? null;
  }

  private static stateOf(label: string, color: string, percent: number = GalleryResources.referenceFillPercent): LinkReferenceState {
    const colors = GalleryReferences.colorOf(color, percent);
    return new LinkReferenceState(label, colors, colors);
  }

  private static colorOf(color: string, percent: number): LinkReferenceColor {
    return new LinkReferenceColor(color, GalleryResources.formatReferenceBackground(color, percent));
  }

  private static itemOf(item: { readonly reference: string; readonly title: string; readonly location: string; readonly kind: "referencePullKind" | "referenceIssueKind" | "referenceRunKind" | "referenceJobKind"
    | "referenceMergeKind" | "referenceWorkItemKind" | "referenceCommitKind" }, icon: string,
    state: LinkReferenceState,
    options: { readonly diff?: LinkReferenceDiff; readonly comments?: number; readonly mark?: LinkReferenceImage; readonly isMarkPending?: boolean; readonly duration?: number;
      readonly action?: LinkReferenceAction; readonly statuses?: readonly LinkReferenceStatus[]; readonly footnote?: string; readonly details?: readonly LinkReferenceDetail[];
      readonly workItemState?: LinkReferenceWorkItemState } = {}): LinkReference {
    return new LinkReference(item.reference, GalleryReferences.text[item.kind], new LinkReferenceImage(icon), {
      state, title: item.title, location: item.location, author: GalleryReferences.author, time: GalleryResources.referenceTime, ...options
    });
  }
}
