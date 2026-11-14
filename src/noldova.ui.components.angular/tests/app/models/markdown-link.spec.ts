/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MarkdownLink } from "../../../src/app/models/markdown-link";
import { MarkdownLinkSchemes } from "../../../src/app/models/markdown-link-schemes";

describe("MarkdownLink", () => {
  it("allows only absolute http, https and mailto addresses, whatever their case", () => {
    const urls = ["http://example.com/", "HTTPS://example.com/a", "MailTo:user-1@host-1.example", "javascript:alert(1)", "JavaScript:alert(1)", "data:text/html,x",
      "vbscript:msgbox(1)", "file:///etc/hosts", "ftp://example.com/", "/docs/a", "docs/a", "//example.com/a", "#top", "", " javascript:alert(1)", "%01javascript:alert(1)"];

    expect(urls.map(t => MarkdownLink.isAllowed(t))).toEqual([true, true, true, false, false, false, false, false, false, false, false, false, false, false, false, false]);
  });

  it("takes a relative, a rooted or a Windows drive path, judged decoded, and nothing with a scheme, a host, an in-page target, a leading space or a control character, or that doesn't decode", () => {
    const paths = ["images/1.jpg", "./a", "../b", "/srv/ada/a", "C:%5Cwork%5Ca.png", "c:/work/a.png", "docs/my%20notes.md", "a.ts#L3", "%C3%A9t%C3%A9.md", "./a.ts:42"];
    const others = ["", "#top", "?q", "//example.com/a", "%5C%5Chost%5Ca", "/%5Chost/a", "file:///etc/hosts", "https://example.com/", "mailto:user-1@host-1.example", "javascript:alert(1)",
      "C:", "C:a", "%20a", "a%0Ab", "a%7Fb", "%2F%2Fhost/a", "/%2Fhost/a", "%5C%2Fhost/a", "javascript%3Aalert(1)", "file%3A//host/a", "C:/a%01b", "%23top", "%E0%A4%A", "a.ts:42"];

    expect([paths.filter(t => !MarkdownLink.isPath(t)), others.filter(t => MarkdownLink.isPath(t)), [...paths, "https://example.com/", "#top"].map(t => MarkdownLink.isLink(t))])
      .toEqual([[], [], [...paths.map(() => true), true, false]]);
  });

  it("takes an address with a scheme the app names as a link, matching its name in any case, and never one that can carry a file, content or script, in any case, even when schemes made around their own checks name it", () => {
    const forged = Object.assign(Object.create(MarkdownLinkSchemes.prototype) as MarkdownLinkSchemes, { names: ["example", "file", "javascript", "data", "vbscript"] });
    const urls = ["example:chat/12", "Example:chat/13", "file:///etc/hosts", "javascript:alert(1)", "data:text/html,x", "vbscript:msgbox(1)", "FILE:///etc/hosts", "JavaScript:alert(1)",
      "Data:text/html,x", "VBScript:msgbox(1)", "chirp:x/1"];
    const named = urls.map(t => t.toLowerCase().startsWith("example:"));

    expect([urls.map(t => MarkdownLink.isLink(t)), urls.map(t => MarkdownLink.isLink(t, new MarkdownLinkSchemes(["example"]))), urls.map(t => MarkdownLink.isLink(t, forged))])
      .toEqual([urls.map(() => false), named, named]);
  });

  it("takes a drive path as a link where the browser parses it as a file: URL, as Chromium does on Windows, and still refuses a real file: URL and the other schemes that are never links", () => {
    class WindowsUrl extends URL {
      public constructor(url: string | URL, base?: string | URL) {
        super(typeof url === "string" && /^[a-z]:[/\\]/iu.test(url) ? `file:///${url.replaceAll("\\", "/")}` : url, base);
      }
    }
    const drives = ["D:/elsewhere/y.png", "D:\\elsewhere\\y.png", "d:/x", "C:%5Cwork%5Ca.png"];
    const refused = ["file:///D:/x", "FILE:///etc/hosts", "file:D:/x", "javascript:alert(1)", " javascript:alert(1)", "data:text/html,x", "vbscript:msgbox(1)", "D:", "D:x",
      "\\\\host\\share\\a.png", "//host/share/a.png"];
    vi.stubGlobal("URL", WindowsUrl);
    let parsed = String.empty;
    let links: boolean[] = [];
    try {
      parsed = new URL("D:/elsewhere/y.png").protocol;
      links = [...drives, ...refused].map(t => MarkdownLink.isLink(t, new MarkdownLinkSchemes(["example"])));
    }
    finally {
      vi.unstubAllGlobals();
    }

    expect([parsed, links]).toEqual(["file:", [...drives.map(() => true), ...refused.map(() => false)]]);
  });

  it("takes a file: URL with no host or localhost as a link only for an app that takes file links, and gives its path decoded, a Windows drive's without the slash before it and in upper case on every system", () => {
    const local = ["file:///C:/repo/notes.md", "file:///c:/repo/pictures/portrait.png", "file:///srv/a/portrait.png", "file://localhost/srv/a/my%20notes.md", "FILE:///D:/x"];
    const refused = ["file://server/share/x", "file:////server/share/x", "file://localhost//server/share/x", "file:///\\server\\share", "file:///C:/a%01b", "file:///%E0%A4%A", "file://example.com/a", "https://example.com/a", "docs/a"];

    expect([local.map(t => MarkdownLink.fileUrlPathOf(t)), refused.map(t => MarkdownLink.fileUrlPathOf(t))]).toEqual([
      ["C:/repo/notes.md", "C:/repo/pictures/portrait.png", "/srv/a/portrait.png", "/srv/a/my notes.md", "D:/x"],
      refused.map(() => null)
    ]);
    expect([local.map(t => MarkdownLink.isLink(t, MarkdownLinkSchemes.none, true)), local.map(t => MarkdownLink.isLink(t)), refused.slice(0, 7).map(t => MarkdownLink.isLink(t, MarkdownLinkSchemes.none, true))])
      .toEqual([local.map(() => true), local.map(() => false), refused.slice(0, 7).map(() => false)]);
  });

  it("reads a Windows drive in a file: URL written with a bar, straight after the host's slashes or with its colon escaped, as the drive, on every system", () => {
    const drives = ["file:///C|/repo/notes.md", "file://C:/repo/notes.md", "file:///C%3A/repo/notes.md", "file:///c%3a/repo/notes.md", "file://localhost/C|/repo/notes.md", "file://C|/repo/notes.md"];

    expect([drives.map(t => MarkdownLink.fileUrlPathOf(t)), drives.map(t => MarkdownLink.isLink(t, MarkdownLinkSchemes.none, true)), drives.map(t => MarkdownLink.isLink(t))])
      .toEqual([drives.map(() => "C:/repo/notes.md"), drives.map(() => true), drives.map(() => false)]);
  });

  it("keeps a file: URL's query and fragment on its path, decoded where they decode and as written where they don't, as a path keeps them", () => {
    const urls = ["file:///C:/repo/a.ts#L3", "file:///srv/a/report.html?page=2#top", "file://localhost/srv/a/my%20notes.md#%C3%A9t%C3%A9", "file:///C:/repo/a.html?zoom=50%",
      "file:///C:/repo/a%20b.html#50%", "file:///C:/repo/a.ts#L3%01"];

    expect([urls.map(t => MarkdownLink.fileUrlPathOf(t)), MarkdownLink.fileOf("C:/repo/a.ts#L3")]).toEqual([
      ["C:/repo/a.ts#L3", "/srv/a/report.html?page=2#top", "/srv/a/my notes.md#été", "C:/repo/a.html?zoom=50%", "C:/repo/a b.html#50%", null], "C:/repo/a.ts#L3"
    ]);
  });

  it("names a file link's file by its path without the query or fragment after it, which in a path starts in its last segment, and names nothing for any other target", () => {
    const paths = ["C:/repo/a.ts#L3", "docs/a.md?raw", "C:/src/c#/a.ts", "C:\\src\\c#\\a.ts", "C:/repo/a%23b.ts", "C:/repo/a%23b.ts#L3", "docs/a.md", "a.ts#"];
    const urls = ["file:///C:/repo/a.ts#L3", "file:///srv/a/report.html?page=2#top", "file:///C:/src/c%23/a.ts", "file:///C:/repo/a%23b.ts#L3", "file:///C:/repo/a.html?zoom=50%"];

    expect([paths.map(t => MarkdownLink.fileNameOf(t)), urls.map(t => MarkdownLink.fileNameOf(t)), ["https://example.com/a.ts", "file://server/share/a.ts"].map(t => MarkdownLink.fileNameOf(t))])
      .toEqual([
        ["C:/repo/a.ts", "docs/a.md", "C:/src/c#/a.ts", "C:\\src\\c#\\a.ts", "C:/repo/a#b.ts", "C:/repo/a#b.ts", "docs/a.md", "a.ts"],
        ["C:/repo/a.ts", "/srv/a/report.html", "C:/src/c#/a.ts", "C:/repo/a#b.ts", "C:/repo/a.html"],
        [String.empty, String.empty]
      ]);
  });

  it("gives a file link's path, from a path or a file: URL on this machine, and null for any other target", () => {
    expect(["C:%5Cwork%5Ca%20b.png", "file:///C:/work/a%20b.png", "file://server/share/a.png", "https://example.com/"].map(t => MarkdownLink.fileOf(t)))
      .toEqual(["C:\\work\\a b.png", "C:/work/a b.png", null, null]);
  });

  it("gives a path decoded once, as it was judged, and null for any other target", () => {
    expect(["C:%5Cwork%5Ca%20b.png", "docs/%C3%A9t%C3%A9.md#L3", "%252F%252Fhost/a", "%2F%2Fhost/a", "https://example.com/"].map(t => MarkdownLink.pathOf(t)))
      .toEqual(["C:\\work\\a b.png", "docs/été.md#L3", "%2F%2Fhost/a", null, null]);
  });

  it("reads a mention link's id, percent-decoded, as a link, and none from a blank id, a broken encoding or another link", () => {
    const urls = ["mention:p-1", "mention:agent%207", "mention:%28x%29", "mention:", "mention:%20", "mention:%E0%A4%A", "Mention:p-1", "https://x/mention:p-1"];

    expect([urls.map(t => MarkdownLink.mentionIdOf(t)), urls.map(t => MarkdownLink.isLink(t))])
      .toEqual([["p-1", "agent 7", "(x)", null, null, null, null, null], [true, true, true, false, false, false, false, true]]);
  });

  it("rethrows an error other than a broken encoding that decoding a target raises", () => {
    const failure = new TypeError("Decoding failed.");
    vi.stubGlobal("decodeURIComponent", () => {
      throw failure;
    });
    onTestFinished(() => {
      vi.unstubAllGlobals();
    });

    expect(() => MarkdownLink.pathOf("docs/a.md")).toThrow(failure);
    expect(() => MarkdownLink.mentionIdOf("mention:p-1")).toThrow(failure);
  });
});
