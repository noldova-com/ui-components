/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class LinkReferenceResources {
  public static readonly linkReferenceFootnoteSubject: string = "A reference's footnote";
  public static readonly linkReferenceLocationPart: string = "a place";
  public static readonly linkReferenceAuthorPart: string = "an author";
  public static readonly linkReferenceTimePart: string = "a time";
  public static readonly linkReferenceDiffPart: string = "changes";
  public static readonly linkReferenceCommentsPart: string = "a comment count";
  public static readonly linkReferenceDurationPart: string = "a duration";
  public static readonly linkReferenceActionPart: string = "an action";
  public static readonly linkReferenceStatusesPart: string = "statuses";
  public static readonly linkReferenceFootnotePart: string = "a footnote";
  public static readonly linkReferenceDetailsPart: string = "details";
  public static readonly linkReferenceItemHrefSubject: string = "An item's address";
  public static readonly linkReferenceLocationHrefSubject: string = "A place's address";
  public static readonly linkReferenceAuthorHrefSubject: string = "An author's address";
  public static readonly linkReferenceDiffHrefSubject: string = "The changes' address";
  public static readonly linkReferenceCommentsHrefSubject: string = "The comments' address";
  public static readonly linkReferenceItemHrefPart: string = "an item's address";
  public static readonly linkReferenceLocationHrefPart: string = "a place's address";
  public static readonly linkReferenceAuthorHrefPart: string = "an author's address";
  public static readonly linkReferenceDiffHrefPart: string = "the changes' address";
  public static readonly linkReferenceCommentsHrefPart: string = "the comments' address";
  public static formatLinkReferenceCardless(part: string): string {
    return `A reference with no card can't have ${part}.`;
  }
  public static formatLinkReferenceDurationInvalid(value: number): string {
    return `A reference's duration must be a finite number of seconds, 0 or more, not ${value}.`;
  }
}
