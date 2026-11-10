/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LinkReferenceException } from "../exceptions/link-reference.exception.js";
import type { ILinkReferenceOptions } from "../interfaces/i-link-reference-options.js";
import { Resources } from "../../resources.js";
import type { LinkReferenceAction } from "./link-reference-action.js";
import type { LinkReferenceAuthor } from "./link-reference-author.js";
import type { LinkReferenceDetail } from "./link-reference-detail.js";
import type { LinkReferenceDiff } from "./link-reference-diff.js";
import type { LinkReferenceImage } from "./link-reference-image.js";
import type { LinkReferenceState } from "./link-reference-state.js";
import type { LinkReferenceStatus } from "./link-reference-status.js";
import type { LinkReferenceWorkItemState } from "./link-reference-work-item-state.js";
import { LinkReferenceResources } from "./link-reference.resources.js";

export class LinkReference {
  public readonly reference: string;
  public readonly kind: string;
  public readonly icon: LinkReferenceImage;
  public readonly mark: LinkReferenceImage | null;
  public readonly isMarkPending: boolean;
  public readonly state: LinkReferenceState | null;
  public readonly title: string | null;
  public readonly location: string | null;
  public readonly author: LinkReferenceAuthor | null;
  public readonly time: Date | null;
  public readonly diff: LinkReferenceDiff | null;
  public readonly comments: number | null;
  public readonly duration: number | null;
  public readonly action: LinkReferenceAction | null;
  public readonly statuses: readonly LinkReferenceStatus[];
  public readonly footnote: string | null;
  public readonly details: readonly LinkReferenceDetail[];
  public readonly workItemState: LinkReferenceWorkItemState | null;
  public readonly itemHref: string | null;
  public readonly locationHref: string | null;
  public readonly authorHref: string | null;
  public readonly diffHref: string | null;
  public readonly commentsHref: string | null;
  public readonly hasCard: boolean;

  public constructor(reference: string, kind: string, icon: LinkReferenceImage, options: ILinkReferenceOptions = {}) {
    const duration = options.duration ?? null;
    if (!Object.isNull(duration) && (!Number.isFinite(duration) || duration < 0))
      throw new LinkReferenceException(LinkReferenceResources.formatLinkReferenceDurationInvalid(duration));
    const footnote = options.footnote ?? null;
    if (!Object.isNull(footnote) && footnote.trim().length === 0)
      throw new LinkReferenceException(Resources.formatLinkReferenceTextEmpty(LinkReferenceResources.linkReferenceFootnoteSubject));
    const statuses = options.statuses ?? [];
    const details = options.details ?? [];
    const hasCard = options.hasCard ?? true;
    const addresses: readonly (readonly [string, string, string | null])[] = [
      [LinkReferenceResources.linkReferenceItemHrefSubject, LinkReferenceResources.linkReferenceItemHrefPart, options.itemHref ?? null],
      [LinkReferenceResources.linkReferenceLocationHrefSubject, LinkReferenceResources.linkReferenceLocationHrefPart, options.locationHref ?? null],
      [LinkReferenceResources.linkReferenceAuthorHrefSubject, LinkReferenceResources.linkReferenceAuthorHrefPart, options.authorHref ?? null],
      [LinkReferenceResources.linkReferenceDiffHrefSubject, LinkReferenceResources.linkReferenceDiffHrefPart, options.diffHref ?? null],
      [LinkReferenceResources.linkReferenceCommentsHrefSubject, LinkReferenceResources.linkReferenceCommentsHrefPart, options.commentsHref ?? null]
    ];
    const empty = addresses.find(([, , href]) => !Object.isNull(href) && href.trim().length === 0);
    if (!Object.isUndefined(empty))
      throw new LinkReferenceException(Resources.formatLinkReferenceTextEmpty(empty[0]));
    const cardParts: readonly (readonly [string, boolean])[] = [
      [LinkReferenceResources.linkReferenceLocationPart, !Object.isNull(options.location ?? null)], [LinkReferenceResources.linkReferenceAuthorPart, !Object.isNull(options.author ?? null)],
      [LinkReferenceResources.linkReferenceTimePart, !Object.isNull(options.time ?? null)], [LinkReferenceResources.linkReferenceDiffPart, !Object.isNull(options.diff ?? null)],
      [LinkReferenceResources.linkReferenceCommentsPart, !Object.isNull(options.comments ?? null)], [LinkReferenceResources.linkReferenceDurationPart, !Object.isNull(duration)],
      [LinkReferenceResources.linkReferenceActionPart, !Object.isNull(options.action ?? null)], [LinkReferenceResources.linkReferenceStatusesPart, statuses.length > 0],
      [LinkReferenceResources.linkReferenceFootnotePart, !Object.isNull(footnote)], [LinkReferenceResources.linkReferenceDetailsPart, details.length > 0],
      ...addresses.map(([, part, href]) => [part, !Object.isNull(href)] as const)
    ];
    const cardPart = hasCard ? undefined : cardParts.find(([, isGiven]) => isGiven);
    if (!Object.isUndefined(cardPart))
      throw new LinkReferenceException(LinkReferenceResources.formatLinkReferenceCardless(cardPart[0]));

    this.reference = reference;
    this.kind = kind;
    this.icon = icon;
    this.mark = options.mark ?? null;
    this.isMarkPending = options.isMarkPending ?? false;
    this.state = options.state ?? null;
    this.title = options.title ?? null;
    this.location = options.location ?? null;
    this.author = options.author ?? null;
    this.time = options.time ?? null;
    this.diff = options.diff ?? null;
    this.comments = options.comments ?? null;
    this.duration = duration;
    this.action = options.action ?? null;
    this.statuses = statuses;
    this.footnote = footnote;
    this.details = details;
    this.workItemState = options.workItemState ?? null;
    this.itemHref = options.itemHref ?? null;
    this.locationHref = options.locationHref ?? null;
    this.authorHref = options.authorHref ?? null;
    this.diffHref = options.diffHref ?? null;
    this.commentsHref = options.commentsHref ?? null;
    this.hasCard = hasCard;
  }
}
