/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class PeerRange {
  private static readonly EXACT_VERSION: RegExp = /^(\d+)\.(\d+)\.\d+$/u;
  private static readonly RANGE: RegExp = /^>=(\d+\.\d+\.\d+) <\d+\.\d+\.\d+$/u;

  public static isExact(version: unknown): version is string {
    return typeof version === "string" && PeerRange.EXACT_VERSION.test(version);
  }

  public static from(lowest: string): string | null {
    const parts = PeerRange.EXACT_VERSION.exec(lowest);
    if (parts === null)
      return null;
    const major = Number(parts[1]);
    const minor = Number(parts[2]);
    const firstRefused = major === 0 ? `0.${minor + 1}.0` : `${major + 1}.0.0`;
    return `>=${lowest} <${firstRefused}`;
  }

  public static lowestOf(version: string): string {
    return PeerRange.RANGE.exec(version)?.[1] ?? version;
  }

  public static compare(left: string, right: string): number {
    const leftParts = left.split(".").map(Number);
    const rightParts = right.split(".").map(Number);
    for (let index = 0; index < leftParts.length; index++) {
      const difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
      if (difference !== 0)
        return difference;
    }
    return 0;
  }

  public static newestOf(versions: readonly string[]): string | null {
    return versions.reduce<string | null>((newest, version) => newest === null || PeerRange.compare(version, newest) > 0 ? version : newest, null);
  }
}
