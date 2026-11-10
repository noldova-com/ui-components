/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DiffFileStatus } from "../../../src/app/enums/diff-file-status";
import { DiffException } from "../../../src/app/exceptions/diff.exception";
import { DiffFile } from "../../../src/app/models/diff-file";
import { DiffPending } from "../../../src/app/models/diff-pending";

describe("DiffFile", () => {
  const content = new DiffPending();

  it("holds its id, paths, status, counts, language and content", () => {
    const file = new DiffFile("f1", "src/main.ts", null, DiffFileStatus.Modified, 3, 1, "typescript", content);

    expect([file.id, file.path, file.oldPath, file.status, file.additions, file.deletions, file.language, file.content])
      .toEqual(["f1", "src/main.ts", null, DiffFileStatus.Modified, 3, 1, "typescript", content]);
  });

  it("holds an old path for a renamed file", () => {
    const renamed = new DiffFile("f1", "src/new.ts", "src/old.ts", DiffFileStatus.Renamed, 0, 0, null, content);

    expect([renamed.oldPath, renamed.language]).toEqual(["src/old.ts", null]);
  });

  it("refuses an empty id, path or old path", () => {
    expect(() => new DiffFile(" ", "a.ts", null, DiffFileStatus.Added, 1, 0, null, content)).toThrow(new DiffException("A file's id must not be empty."));
    expect(() => new DiffFile("f1", "", null, DiffFileStatus.Added, 1, 0, null, content)).toThrow(new DiffException("A file's path must not be empty."));
    expect(() => new DiffFile("f1", "a.ts", " ", DiffFileStatus.Renamed, 1, 0, null, content)).toThrow(new DiffException("A file's old path must not be empty."));
  });

  it("needs an old path for a renamed file, and refuses one for any other status", () => {
    expect(() => new DiffFile("f1", "a.ts", null, DiffFileStatus.Renamed, 0, 0, null, content)).toThrow(new DiffException("A file whose status is Renamed needs its old path."));
    expect(() => new DiffFile("f1", "a.ts", "b.ts", DiffFileStatus.Deleted, 0, 0, null, content)).toThrow(new DiffException("A file whose status is Deleted has no old path."));
  });

  it("refuses a count of added or removed lines that is not a whole number of 0 or more", () => {
    expect(() => new DiffFile("f1", "a.ts", null, DiffFileStatus.Modified, -1, 0, null, content)).toThrow(new DiffException("A file's count of added lines must be a whole number of 0 or more, not -1."));
    expect(() => new DiffFile("f1", "a.ts", null, DiffFileStatus.Modified, 0, 0.5, null, content)).toThrow(new DiffException("A file's count of removed lines must be a whole number of 0 or more, not 0.5."));
  });
});
