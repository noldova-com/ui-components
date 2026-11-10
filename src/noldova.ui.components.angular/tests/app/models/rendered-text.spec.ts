/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { RenderedText } from "../../../src/app/models/rendered-text";
import { Resources } from "../../../src/resources";
import { RenderedTextResources } from "../../../src/app/models/rendered-text.resources";
import { DomFixture } from "../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../fixtures/forced-colors.fixture";
import { RevealedTextFixture } from "../../fixtures/revealed-text.fixture";

const rendered = (html: string): { root: HTMLElement; text: RenderedText } => {
  const root = document.createElement("div");
  root.innerHTML = html;
  return { root, text: new RenderedText(root) };
};
const visible = (node: Node): string => RevealedTextFixture.visible(node);
const codeOf = (lines: readonly string[]): string => `<pre><code>${lines.map(t => `<span class="${Resources.codeLineClass}">${t}</span>`).join(String.empty)}</code></pre>`;

describe("RenderedText's written text", () => {
  it("writes each text short to the part it shows, and back whole once it is shown or put back", () => {
    const { root, text } = rendered("<p>Hello <strong>world</strong> again</p>");

    text.show(8);
    const partway = root.textContent;
    text.show(11);
    const grown = root.textContent;
    text.restore();

    expect([partway, grown, root.textContent]).toEqual(["Hello wo", "Hello world", "Hello world again"]);
  });

  it("lays out a block at the height of what it shows, so the block grows with it", () => {
    const { root, text } = rendered("<pre><code>one\ntwo\nthree</code></pre>");
    document.body.append(root);
    try {
      const full = root.getBoundingClientRect().height;
      text.show(2);
      const partial = root.getBoundingClientRect().height;
      text.restore();

      expect([visible(root), partial > 0, partial < full / 2]).toEqual(["one\ntwo\nthree", true, true]);
    }
    finally {
      root.remove();
    }
  });

  it("hides no line of a code and writes the lines after the one it reaches empty, so the code grows a line at a time", () => {
    const { root, text } = rendered(codeOf(["one\n", "two\n", "three"]));
    document.body.append(root);
    try {
      const lines = [...root.querySelectorAll<HTMLElement>(`.${Resources.codeLineClass}`)];
      const read = (): (string | null)[] => lines.map(t => t.textContent);
      const full = root.getBoundingClientRect().height;
      text.show(2);
      const first = [lines.map(t => t.hidden), read(), root.getBoundingClientRect().height < full / 2];
      text.show(6);
      const second = [lines.map(t => t.hidden), read()];
      text.show(13);
      const third = read();
      text.show(5);
      const fourth = read();
      text.restore();

      expect(first).toEqual([[false, false, false], ["on", "", ""], true]);
      expect(second).toEqual([[false, false, false], ["one\n", "tw", ""]]);
      expect([third, fourth, read()]).toEqual([["one\n", "two\n", "three"], ["one\n", "t", ""], ["one\n", "two\n", "three"]]);
    }
    finally {
      root.remove();
    }
  });

  it("cuts a code inside its last line, and at a line's end writes the next line empty", () => {
    const { root, text } = rendered(codeOf(["one\n", "two\n", "three"]));
    text.show(10);
    const last = visible(root);
    text.show(4);
    const end = visible(root);
    text.restore();

    expect([last, end]).toEqual(["one\ntwo\nth", "one\n"]);
  });

  it("cuts a code line its token spans hold in the span the reveal reaches, writing the spans after it empty", () => {
    const line = (...tokens: string[]): string => `<span class="${Resources.codeLineClass}">${tokens.map(t => `<span>${t}</span>`).join(String.empty)}</span>`;
    const { root, text } = rendered(`<pre><code>${line("con", "st a\n")}${line("b")}</code></pre>`);
    const tokens = (): (string | null)[] => [...root.querySelectorAll(`.${Resources.codeLineClass} > span`)].map(t => t.textContent);
    text.show(5);
    const inside = tokens();
    text.show(3);
    const end = tokens();
    text.show(9);
    const whole = tokens();
    text.restore();

    expect([inside, end, whole]).toEqual([["con", "st", ""], ["con", "", ""], ["con", "st a\n", "b"]]);
  });

  it("shows a code it hid whole at once", () => {
    const { root, text } = rendered(`<p>ab</p>${codeOf(["one\n", "two"])}`);
    const read = (): (boolean | string | null)[] => [root.querySelector("pre")?.hidden ?? null, visible(root)];
    text.show(2);
    const first = read();
    text.show(9);
    const second = read();
    text.restore();

    expect([first, second]).toEqual([[true, "ab"], [false, "abone\ntwo"]]);
  });

  it("shows whole a text it keeps cut through a render that changed the element holding it, once the reveal reaches its end", () => {
    const { root, text } = rendered("<p>Hello</p>");
    const paragraph = DomFixture.one(root, "p");
    paragraph.append(" one two");
    text.restore([paragraph, DomFixture.at([...paragraph.childNodes], 1)]);
    text.show(7);
    const partway = visible(root);

    paragraph.append(" three");
    text.restore([paragraph, DomFixture.at([...paragraph.childNodes], 2)]);
    text.show(text.count);

    expect([partway, visible(root)]).toEqual(["Hello o", "Hello one two three"]);
  });

  it("leaves a text something else wrote over its cut, with no render telling it, when it puts back all it cut", () => {
    const { root, text } = rendered("<p>Hello</p><p>world</p>");
    text.show(3);
    DomFixture.firstTextOf(DomFixture.one(root, "p")).textContent = "Help";
    text.restore();

    expect(root.textContent).toBe("Helpworld");
  });

  it("cuts the text of inline code, so its chip grows with its text", () => {
    const { root, text } = rendered("<p>a <code nol-inline-code>bcd</code> e</p>");
    const code = (): string | null => root.querySelector("code")?.textContent ?? null;

    text.show(3);
    const partway = [code(), root.textContent];
    text.show(5);
    const whole = code();
    text.restore();

    expect([partway, whole, code(), visible(root)]).toEqual([["b", "a b"], "bcd", "bcd", "a bcd e"]);
  });

  it("walks no code line after the one it reaches again, in a frame that shows more of that line, or after a render that changes the lines after it, adds lines at the code's end or takes them away", () => {
    const { root, text } = rendered(codeOf(["ab\n", "cd\n", "ef\n", "gh\n", "ij\n", "kl"]));
    const code = DomFixture.one(root, "code");
    const lines = (): HTMLElement[] => [...code.children] as HTMLElement[];
    const textOf = (line: number): Text => DomFixture.firstTextOf(DomFixture.at(lines(), line)) as Text;
    const reads = vi.spyOn(CharacterData.prototype, "data", "get");
    const walked = (step: () => void): number[] => {
      reads.mockClear();
      step();
      const read = new Set(reads.mock.contexts);
      return lines().flatMap((t, i) => read.has(t.firstChild) ? [i] : []);
    };
    const render = (line: number, data: string): void => {
      textOf(line).data = data;
      text.restore([textOf(line)]);
    };
    try {
      const entered = walked(() => text.show(1));
      const further = walked(() => text.show(2));
      const grownLast = walked(() => {
        render(5, "klm");
        text.show(2);
      });
      const shown = visible(root);
      const added = walked(() => {
        const line = document.createElement("span");
        line.className = Resources.codeLineClass;
        line.append("no");
        textOf(5).data = "klm\n";
        code.append(line);
        text.restore([code, line, textOf(5)]);
        text.show(2);
      });
      const changedMiddle = walked(() => {
        render(3, "GH\n");
        text.show(2);
      });
      const changedFirst = walked(() => {
        render(1, "CD\n");
        text.show(2);
      });
      const changedReached = walked(() => {
        render(0, "AB\n");
        text.show(2);
      });
      const takenAway = walked(() => {
        lines().slice(4).forEach(t => t.remove());
        text.restore([code]);
        text.show(2);
      });
      const back = walked(() => {
        text.show(5);
        text.show(1);
      });
      const final = visible(root);
      text.restore();

      expect([entered, further, grownLast, shown, added]).toEqual([[0, 1, 2, 3, 4, 5], [0], [0, 5], "ab", [0, 5, 6]]);
      expect([changedMiddle, changedFirst, changedReached, takenAway, back]).toEqual([[0, 3, 4, 5, 6], [0, 1, 2, 3, 4, 5, 6], [0], [0, 1, 2, 3], [0, 1, 2, 3]]);
      expect([final, root.textContent]).toEqual(["A", "AB\nCD\nef\nGH\n"]);
    }
    finally {
      reads.mockRestore();
    }
  });
});

for (const isForced of [false, true])
  describe(isForced ? "RenderedText in forced colors" : "RenderedText", () => {
    beforeEach(async () => {
      if (isForced)
        await ForcedColorsFixture.activateAsync();
    });

    afterEach(async () => {
      if (isForced)
        await ForcedColorsFixture.resetAsync();
    });

    it("counts the characters a reader sees, without markup, layout newlines or the code header", () => {
      const { root, text } = rendered("<p>Hello <strong>world</strong></p>\n<ul>\n<li>one</li>\n</ul>\n<div class=\"nol-code-block\"><div class=\"nol-code-block-header\"><span>typescript</span></div>"
        + "<pre><code><span>a</span>\nb</code></pre></div>");
      const counted = text.count;

      text.show(5);

      expect([counted, visible(root)]).toEqual(["Hello world".length + "one".length + "a\nb".length, "Hello\n\n"]);
    });

    it("shows the first characters and hides what comes after", () => {
      const { root, text } = rendered("<p>Hello <strong>world</strong> again</p><p>Second</p>");

      text.show(8);
      expect(visible(root)).toBe("Hello wo");
      expect(root.querySelectorAll("p")[1]?.hidden).toBe(true);

      text.show(0);
      expect(visible(root)).toBe("");

      text.show(17);
      expect(visible(root)).toBe("Hello world again");
      expect(root.querySelectorAll("p")[1]?.hidden).toBe(true);

      text.show(18);
      expect(visible(root)).toBe("Hello world againS");
      expect(root.querySelectorAll("p")[1]?.hidden).toBe(false);
    });

    it("keeps an element hidden until its first character is reached", () => {
      const { root, text } = rendered("<p>a<em>b</em></p>");

      text.show(1);
      expect(root.querySelector("em")?.hidden).toBe(true);

      text.show(2);
      expect(root.querySelector("em")?.hidden).toBe(false);
      expect(visible(root)).toBe("ab");
    });

    it("moves by whole characters", () => {
      const { root, text } = rendered("<p>a👍🏽b́c</p>");

      text.show(2);
      expect(visible(root)).toBe("a👍🏽");

      text.show(3);
      expect(visible(root)).toBe("a👍🏽b́");
    });

    it("restores everything when all of it is shown, including trailing elements without text", () => {
      const { root, text } = rendered("<p>one<br></p><hr><p>two</p>");

      text.show(2);
      expect(visible(root)).toBe("on");
      expect(root.querySelector("br")?.hidden).toBe(true);

      text.showAll();
      expect(visible(root)).toBe("onetwo");
      expect(Array.from(root.querySelectorAll("*")).every(t => !(t as HTMLElement).hidden)).toBe(true);
    });

    it("can move backwards and forwards again", () => {
      const { root, text } = rendered("<p>abcdef</p>");

      text.show(5);
      text.show(2);
      expect(visible(root)).toBe("ab");
      text.show(4);
      expect(visible(root)).toBe("abcd");
    });

    it("shows a code block's header with the block and reveals its lines one by one", () => {
      const { root, text } = rendered("<p>Intro</p><div class=\"nol-code-block\"><div class=\"nol-code-block-header\"><span>typescript</span></div>"
        + "<pre><code><span>let</span>\n<span>x</span>\n</code></pre></div>");
      const block = DomFixture.one(root, ".nol-code-block");

      text.show(5);
      expect(block.hidden).toBe(true);

      text.show(6);
      expect(block.hidden).toBe(false);
      expect(block.querySelector(".nol-code-block-header")?.textContent).toBe("typescript");
      expect(visible(DomFixture.one(block, "pre"))).toBe("l");

      text.show(9);
      expect(visible(DomFixture.one(block, "pre"))).toBe("let\n");
      expect(block.querySelectorAll("span")[2]?.hidden).toBe(true);

      text.showAll();
      expect(visible(DomFixture.one(block, "pre"))).toBe("let\nx\n");
    });

    it("counts a line break in preformatted text, and neither counts nor hides an SVG", () => {
      const { root, text } = rendered("<p>a<svg></svg>b</p><pre><code>\n</code></pre>");

      text.show(1);

      expect([text.count, visible(root), root.querySelector("svg")?.hasAttribute("hidden"), root.querySelector("pre")?.hidden]).toEqual([3, "a", false, true]);
    });

    it("puts back what it hid after a render and counts again, keeping the texts the render left cut, and puts back all it cut once it stops", () => {
      const { root, text } = rendered("<p>Hello <em>world</em></p><p>Again</p>");
      text.show(3);
      const before = visible(root);

      text.restore([]);
      const restored = [visible(root), [...root.querySelectorAll("p, em")].map(t => (t as HTMLElement).hidden)];
      const written = root.querySelector("em")?.firstChild as Text;
      written.data = "there";
      text.restore([written]);
      text.show(8);
      const shown = [text.count, visible(root)];
      text.restore();

      expect([before, restored, shown, root.textContent]).toEqual(["Hel", ["HelworldAgain", [false, false, false]], [16, "Hello th"], "Hello thereAgain"]);
    });

    it("counts again what a render changed, a text written over or an element given more children, and the elements around them", () => {
      const { root, text } = rendered("<p>one</p><p>two</p>");
      const paragraphs = DomFixture.all(root, "p");
      const first = DomFixture.at(paragraphs, 0);
      const second = DomFixture.at(paragraphs, 1);
      const counted = text.count;
      text.show(4);

      (first.firstChild as Text).data = "uno!";
      second.append(" more");
      text.restore([first.firstChild as Text, second]);
      const recounted = text.count;
      text.show(6);

      expect([counted, recounted, visible(root)]).toEqual([6, 12, "uno!tw"]);
    });

    it("keeps a text something else wrote over its cut, even one that matches the cut, and leaves an element it didn't hide hidden, counting nothing in it", () => {
      const { root, text } = rendered("<p>abcdef</p><p hidden>gh</p><p>ij</p>");
      const written = root.querySelector("p")?.firstChild as Text;
      text.show(3);

      written.data = "abc";
      text.restore([written]);
      const counted = text.count;
      text.showAll();

      expect([counted, visible(root), [...root.querySelectorAll("p")].map(t => t.hidden)]).toEqual([5, "abcij", [false, true, false]]);
    });

    it("counts an element a template hid once it shows again", () => {
      const { root, text } = rendered("<p>ab</p><p hidden>cd</p>");
      const hidden = root.querySelectorAll("p")[1] as HTMLElement;
      const counted = text.count;
      text.show(2);

      hidden.hidden = false;
      text.restore([hidden]);

      expect([counted, text.count, visible(root)]).toEqual([2, 4, "abcd"]);
    });

    it("passes over an element marked to be skipped, counting nothing in it, never hiding it and leaving its text and what is added into it whole", () => {
      const { root, text } = rendered(`<p>ab</p><div ${Resources.revealSkipAttribute}><span>term</span></div><p>cd</p>`);
      const skipped = root.querySelector("div");
      if (skipped === null)
        throw new Error("The skipped element isn't rendered.");
      const counted = text.count;
      text.show(1);
      const partway = [skipped.hidden, skipped.textContent, visible(root)];

      skipped.append(document.createElement("span"), " out");
      text.restore([skipped]);
      text.show(3);

      expect([counted, partway, text.count, skipped.hidden, skipped.textContent, visible(root)])
        .toEqual([4, [false, "term", "aterm"], 4, false, "term out", "abterm outc"]);
    });

    it("walks into an element past the reveal point that holds one marked to be skipped, hiding what is around it rather than the element whole", () => {
      const { root, text } = rendered(`<p>ab</p><ul><li>cd<div ${Resources.revealSkipAttribute}>term</div><em>ef</em></li></ul><blockquote><p>gh</p></blockquote>`);
      const counted = text.count;
      text.show(1);
      const partway = [visible(root), [...root.querySelectorAll<HTMLElement>("ul, li, div, em, blockquote")].map(t => t.hidden)];
      text.show(5);

      expect([counted, partway, visible(root)]).toEqual([8, ["aterm", [false, false, false, true, true]], "abcdterme"]);
    });

    it("counts an image as one character, shown or hidden whole, and never cuts the app's content in it", () => {
      const { root, text } = rendered("<p>ab<span class=\"nol-markdown-image\"><span>chart</span></span>cd</p>");
      const image = DomFixture.one(root, ".nol-markdown-image");
      const counted = text.count;
      text.show(2);
      const before = [visible(root), image.hidden];

      text.show(3);

      expect([counted, before, visible(root), image.hidden]).toEqual([5, ["ab", true], "abchart", false]);
    });

    it("counts a formula as one character, shown or hidden whole, and never cuts the glyphs KaTeX drew in it", () => {
      const { root, text } = rendered("<p>ab<span class=\"nol-markdown-math\"><span>x</span><span>2</span></span>cd</p>");
      const formula = DomFixture.one(root, ".nol-markdown-math");
      const counted = text.count;
      text.show(2);
      const before = [visible(root), formula.hidden];

      text.show(3);

      expect([counted, before, visible(root), formula.hidden]).toEqual([5, ["ab", true], "abx2", false]);
    });

    it("shows more of a long text without looking again at the blocks before it that it already shows whole, in the element that holds them too, though a render changed a later one", () => {
      const { root, text } = rendered(`<div>${Array.from({ length: 200 }, (_, t) => `<p>${t % 10}${t % 7}</p>`).join("\n")}</div>`);
      text.show(398);
      const last = DomFixture.one(root, "p:last-child");
      last.append(" more");
      text.restore([last, DomFixture.at([...last.childNodes], 1)]);
      const counted = text.count;
      const reads = vi.spyOn(Element.prototype, "classList", "get");

      text.show(402);
      const looked = reads.mock.calls.length;
      reads.mockRestore();

      expect([looked < 10, visible(last), counted]).toEqual([true, "93 m", 405]);
    });

    it("shows again from where a render changed the blocks it shows whole, a block put in place of one before them, a text in the last of them, or one taken away", () => {
      const { root, text } = rendered("<p>ab</p><p>cd</p><p>ef</p>");
      const second = DomFixture.one(root, "p:nth-child(2)");
      text.show(4);
      const put = document.createElement("p");
      put.textContent = "wxyz";
      root.replaceChild(put, DomFixture.one(root, "p:first-child"));
      text.restore([put, root]);
      text.show(4);
      const replaced = visible(root);

      text.show(6);
      second.textContent = "CDE";
      text.restore([DomFixture.firstTextOf(second), second]);
      text.show(6);
      const changed = visible(root);

      text.show(7);
      put.remove();
      text.restore([root, put]);
      text.show(7);
      const removed = visible(root);
      text.show(2);

      expect([replaced, changed, removed, visible(root), text.count]).toEqual(["wxyz", "wxyzCD", "CDEef", "CD", 5]);
    });

    const countOf = (text: RenderedText, step: () => void): readonly [number, number] => {
      step();
      const reads = vi.spyOn(Element.prototype, "classList", "get");
      try {
        const count = text.count;
        return [count, reads.mock.calls.length];
      }
      finally {
        reads.mockRestore();
      }
    };
    const readsDuring = (step: () => void): number => {
      const reads = vi.spyOn(Element.prototype, "classList", "get");
      try {
        step();
        return reads.mock.calls.length;
      }
      finally {
        reads.mockRestore();
      }
    };

    it("counts again only from the block a render changes, or after the one it adds or takes blocks after, though the blocks end with a comment, as a template's list does", () => {
      const { root, text } = rendered(Array.from({ length: 200 }, (_, t) => `<p>${t % 10}</p>`).join(String.empty));
      const end = root.appendChild(document.createComment("list"));
      const blocks = [...root.querySelectorAll("p")];
      const first = DomFixture.at(blocks, 0);
      const middle = DomFixture.at(blocks, 100);
      const last = DomFixture.at(blocks, 199);
      const added = document.createElement("p");
      added.textContent = "yz";
      const counted = text.count;

      const grown = countOf(text, () => {
        last.append("x");
        text.restore([DomFixture.at([...last.childNodes], 1)]);
      });
      const addedAfter = countOf(text, () => {
        root.insertBefore(added, end);
        text.restore([{ parent: root, after: last, removed: [] }, added]);
      });
      const takenAway = countOf(text, () => {
        added.remove();
        text.restore([{ parent: root, after: last, removed: [added] }]);
      });
      const endTaken = countOf(text, () => {
        end.remove();
        text.restore([{ parent: root, after: last, removed: [end] }]);
      });
      const addedAtEnd = countOf(text, () => {
        root.append(added);
        text.restore([{ parent: root, after: last, removed: [] }, added]);
      });
      const takenBefore = countOf(text, () => {
        const before = middle.previousSibling;
        middle.remove();
        text.restore([{ parent: root, after: before, removed: [middle] }]);
      });

      expect([counted, grown[0], addedAfter[0], takenAway[0], endTaken[0], addedAtEnd[0], takenBefore[0], first.textContent]).toEqual([200, 201, 203, 201, 201, 203, 202, "0"]);
      expect([grown, addedAfter, takenAway, endTaken, addedAtEnd].map(t => t[1] < 10)).toEqual([true, true, true, true, true]);
      expect([takenBefore[1] > 90, takenBefore[1] < 110]).toEqual([true, true]);
    });

    it("counts again from the start when a render changes the first block, or a change it can't place among the blocks it counted", () => {
      const { root, text } = rendered(Array.from({ length: 200 }, (_, t) => `<p>${t % 10}</p>`).join(String.empty));
      const blocks = (): HTMLParagraphElement[] => [...root.querySelectorAll("p")];
      const counted = text.count;

      const changedFirst = countOf(text, () => {
        const first = DomFixture.at(blocks(), 0);
        const old = [...first.childNodes];
        first.textContent = "abc";
        text.restore([{ parent: first, after: null, removed: old }, ...first.childNodes]);
      });
      const lastTakenUntold = countOf(text, () => {
        const last = DomFixture.at(blocks(), 199);
        const before = last.previousSibling;
        last.remove();
        text.restore([{ parent: root, after: before, removed: [] }]);
      });
      const lastTakenUnseen = countOf(text, () => {
        DomFixture.at(blocks(), 198).remove();
        const before = DomFixture.at(blocks(), 197);
        before.append("x");
        text.restore([DomFixture.at([...before.childNodes], 1)]);
      });
      const afterUncounted = countOf(text, () => {
        const unseen = document.createElement("p");
        unseen.textContent = "u";
        const put = document.createElement("p");
        put.textContent = "vw";
        root.insertBefore(unseen, DomFixture.at(blocks(), 100));
        root.insertBefore(put, DomFixture.at(blocks(), 101));
        text.restore([{ parent: root, after: unseen, removed: [] }, put]);
      });

      expect([counted, changedFirst[0], lastTakenUntold[0], lastTakenUnseen[0], afterUncounted[0]]).toEqual([200, 202, 201, 201, 204]);
      expect([changedFirst, lastTakenUntold, lastTakenUnseen, afterUncounted].map(t => t[1] >= 198)).toEqual([true, true, true, true]);
    });

    it("shows a block a render adds after those it shows whole without walking them again", () => {
      const { root, text } = rendered(`<div>${Array.from({ length: 200 }, (_, t) => `<p>${t % 10}${t % 7}</p>`).join(String.empty)}</div>`);
      const blocks = DomFixture.one(root, "div");
      text.show(400);
      const last = blocks.lastChild;
      const added = document.createElement("p");
      added.textContent = "ab";
      blocks.append(added);
      text.restore([{ parent: blocks, after: last, removed: [] }, added]);
      const counted = text.count;

      const looked = readsDuring(() => text.show(401));

      expect([looked < 20, visible(added), counted]).toEqual([true, "a", 402]);
    });

    it("counts again after a render that writes many texts in one block, placing each block around it among its siblings once rather than once for every text", () => {
      const strongs = Array.from({ length: 100 }, (_, t) => `<strong>${t % 10}</strong>`).join(String.empty);
      const { root, text } = rendered(`<p>a</p><div><p>a</p><div><p>a</p><div><p>a</p><p>${strongs}</p><p>z</p></div><p>z</p></div><p>z</p></div><p>z</p>`);
      text.show(text.count);
      const texts = [...root.querySelectorAll("strong")].map(t => DomFixture.firstTextOf(t));
      texts.forEach((t, index) => {
        t.textContent = `${index % 10}x`;
      });
      const compares = vi.spyOn(Node.prototype, "compareDocumentPosition");
      try {
        text.restore(texts);
        const compared = compares.mock.calls.length;

        expect([compared < texts.length, text.count]).toEqual([true, 208]);
      }
      finally {
        compares.mockRestore();
      }
    });

    const shownAfterRender = (before: string, after: string, render: (root: HTMLElement, text: RenderedText) => void): readonly [number, string, string, number, number] => {
      const html = (middle: string): string => `${"<p>a</p>".repeat(100)}${middle}${"<p>b</p>".repeat(100)}<p>streaming</p>`;
      const { root, text } = rendered(html(before));
      const count = text.count;
      text.show(count - 5);
      render(root, text);
      const recounted = text.count;
      const read = readsDuring(() => text.show(count - 4));
      const twin = rendered(html(after));
      const fromStart = readsDuring(() => twin.text.show(count - 4));
      return [recounted - count, visible(root), visible(twin.root), read, fromStart];
    };

    it("shows the text whole up to the reveal, nothing skipped or twice, after a render splits a code line before it into token spans, walking less than from the start", () => {
      const lines = Array.from({ length: 20 }, (_, t) => `l${t % 10}\n`);
      const split = `<span class="${Resources.codeLineClass}"><span class="nol-code-variable">l</span><span>5\n</span></span>`;
      const after = codeOf(lines).replace(`<span class="${Resources.codeLineClass}">l5\n</span>`, split);
      const [added, shown, twin, read, fromStart] = shownAfterRender(codeOf(lines), after, (root, text) => {
        const line = DomFixture.at([...root.querySelectorAll(`.${Resources.codeLineClass}`)], 5);
        const old = [...line.childNodes];
        const variable = document.createElement("span");
        variable.className = "nol-code-variable";
        variable.textContent = "l";
        const rest = document.createElement("span");
        rest.textContent = "5\n";
        line.replaceChildren(variable, rest);
        text.restore([{ parent: line, after: null, removed: old }, variable, rest]);
      });

      expect([added, shown, shown.endsWith("strea"), read < fromStart]).toEqual([0, twin, true, true]);
    });

    it("shows the text whole up to the reveal, nothing skipped or twice, after a render puts a formula in place of one before it, walking less than from the start", () => {
      const formula = `x<span class="${RenderedTextResources.markdownMathClass}"><span>x</span><span>2</span></span>y`;
      const [added, shown, twin, read, fromStart] = shownAfterRender(`<p>${formula}</p>`, `<p>${formula}</p>`, (root, text) => {
        const paragraph = DomFixture.one(root, `p:has(> .${RenderedTextResources.markdownMathClass})`);
        const old = DomFixture.one(paragraph, `.${RenderedTextResources.markdownMathClass}`);
        const before = old.previousSibling;
        const put = document.createElement("span");
        put.className = RenderedTextResources.markdownMathClass;
        put.innerHTML = "<span>x</span><span>2</span>";
        paragraph.replaceChild(put, old);
        text.restore([{ parent: paragraph, after: before, removed: [old] }, put]);
      });

      expect([added, shown, shown.endsWith("strea"), read < fromStart]).toEqual([0, twin, true, true]);
    });

    it("shows more of the text the last frame stopped inside without walking to it, and walks when it moves past or before that text, or after a render or a write over it", () => {
      const { root, text } = rendered(`<div>${Array.from({ length: 200 }, (_, t) => `<p>${t % 10}</p>`).join(String.empty)}<p>abcdef</p></div>`);
      const last = DomFixture.one(root, "p:last-child");
      const reads = vi.spyOn(Element.prototype, "classList", "get");
      const readsOf = (count: number): number => {
        reads.mockClear();
        text.show(count);
        return reads.mock.calls.length;
      };
      try {
        const entered = readsOf(202);
        const within = readsOf(204);
        const shownWithin = visible(last);
        const past = readsOf(206);
        readsOf(203);
        const before = readsOf(150);
        readsOf(203);
        text.restore([]);
        const afterRender = readsOf(204);
        DomFixture.firstTextOf(last).textContent = "abcdefgh";
        const writtenOver = readsOf(205);

        expect([entered > 100, within, shownWithin, past > 0, before > 0, afterRender > 0, writtenOver > 0, visible(last)])
          .toEqual([true, 0, "abcd", true, true, true, true, "abcde"]);
      }
      finally {
        reads.mockRestore();
      }
    });
  });
