/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class GalleryReferenceItem {
  public readonly url: string;
  public readonly reference: string;
  public readonly title: string;
  public readonly location: string;
  public readonly kind: "referencePullKind" | "referenceIssueKind" | "referenceRunKind" | "referenceJobKind" | "referenceMergeKind" | "referenceWorkItemKind" | "referenceCommitKind";

  public constructor(url: string, reference: string, title: string, location: string, kind: GalleryReferenceItem["kind"]) {
    this.url = url;
    this.reference = reference;
    this.title = title;
    this.location = location;
    this.kind = kind;
  }
}
