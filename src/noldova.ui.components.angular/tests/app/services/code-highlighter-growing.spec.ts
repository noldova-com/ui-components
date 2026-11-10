/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";
import type { MockInstance } from "vitest";

import { CodeTokenKind } from "../../../src/app/enums/code-token-kind";
import { CodeHighlighterTokens } from "../../../src/app/models/code-highlighter-tokens";
import { CodeLanguage } from "../../../src/app/models/code-language";
import { CodeSettledLines } from "../../../src/app/models/code-settled-lines";
import type { CodeToken } from "../../../src/app/models/code-token";
import { CodeHighlighter } from "../../../src/app/services/code-highlighter";
import { CodeHighlightingFixture } from "../../../src/testing/models/code-highlighting-fixture";
import { CodeHighlighterFixture } from "../../fixtures/code-highlighter.fixture";

describe("CodeHighlighter", () => {
  const { signal, typescript } = CodeHighlighterFixture;

  beforeEach(() => TestBed.configureTestingModule({ providers: [{ provide: CodeHighlighterTokens.tokenizeTimeLimit, useValue: 0 }, CodeHighlightingFixture.sharedShiki] }));

  describe("on code that grows", () => {
    const python = CodeLanguage.named("python") as CodeLanguage;
    const texts: readonly (readonly [CodeLanguage, string])[] = [
      [typescript, "/**\n * A doc comment\n * over lines.\n */\nconst greeting = `Hello,\n${name}, a template\n  across lines`;\n/* a block\n   comment */ const b = \"string\"; // line\n"
        + "function f(a: number): string {\n\n  return /re\\/gex/.test(String(a)) ? 'x' : \"y\";\n}"],
      [python, "def a():\n    \"\"\"A docstring\n    over lines.\"\"\"\n    s = '''another\nstring'''\n\n    return 1  # note"]
    ];
    const made = (): CodeHighlighter => TestBed.runInInjectionContext(() => new CodeHighlighter());
    const spyOnContinued = (): MockInstance<CodeSettledLines["isContinuedBy"]> => vi.spyOn(CodeSettledLines.prototype, "isContinuedBy");
    let continued: MockInstance<CodeSettledLines["isContinuedBy"]>;
    let probes = 0;
    const shown = (tokens: readonly CodeToken[]): string => tokens.map(t => `${t.start}:${t.kind}:${t.text}`).join("\n");

    const settledOfAsync = async (highlighter: CodeHighlighter, language: CodeLanguage = typescript): Promise<readonly string[]> => {
      continued.mockClear();
      await highlighter.tokensAsync(`probe${probes++}`, language, signal);
      return continued.mock.contexts.filter(t => t instanceof CodeSettledLines).map(t => t.code);
    };

    const wholeAsync = async (fresh: CodeHighlighter, code: string, language: CodeLanguage): Promise<readonly CodeToken[]> => {
      continued.mockReturnValue(false);
      try {
        return await fresh.tokensAsync(code, language, signal);
      }
      finally {
        continued.mockRestore();
        continued = spyOnContinued();
      }
    };

    beforeEach(() => {
      continued = spyOnContinued();
    });

    afterEach(() => vi.restoreAllMocks());

    it("tokenizes only after its complete lines, giving at every length streamed the tokens of the whole code, inside a string or a comment over lines too", async () => {
      const fresh = made();
      const differences: string[] = [];

      for (const [language, text] of texts)
        for (const size of [1, 5, 24]) {
          const streamed = made();
          for (let length = size; length < text.length + size; length += size) {
            const code = text.slice(0, length);
            if (shown(await streamed.tokensAsync(code, language, signal)) !== shown(await wholeAsync(fresh, code, language)))
              differences.push(`${language.id} by ${size} at ${code.length}`);
          }
          const settled = await settledOfAsync(streamed, language);
          if (settled[0] !== text.slice(0, text.lastIndexOf("\n")))
            differences.push(`${language.id} by ${size} settled ${settled[0]?.length}`);
        }

      expect(differences).toEqual([]);
      const text = texts[0]?.[1] ?? String.empty;
      const whole = await wholeAsync(fresh, text, typescript);
      const lines = ["over lines.", "across lines", "   comment"].map(t => text.indexOf(t));
      expect(lines.map(t => whole.find(token => token.start <= t + 4 && token.end > t + 4)?.kind))
        .toEqual([CodeTokenKind.Comment, CodeTokenKind.String, CodeTokenKind.Comment]);
    });

    it("keeps none of the complete lines the time limit may have cut short, so the next update tokenizes them again", async () => {
      TestBed.overrideProvider(CodeHighlighterTokens.tokenizeTimeLimit, { useValue: 500 });
      const fresh = made();
      const streamed = made();
      const text = texts[0]?.[1] ?? String.empty;
      const code = text.slice(0, text.lastIndexOf("\n") + 1);
      await streamed.tokensAsync("let warm = 1;", typescript, signal);
      let now = Date.now();
      const clock = vi.spyOn(Date, "now").mockImplementation(() => now += 1000);
      const cut = await streamed.tokensAsync(code, typescript, signal);
      clock.mockRestore();
      const kept = (await settledOfAsync(streamed)).length;
      const grown = await streamed.tokensAsync(`${code}x`, typescript, signal);

      expect([shown(cut) === shown(await wholeAsync(fresh, code, typescript)), kept, shown(grown) === shown(await wholeAsync(fresh, `${code}x`, typescript))])
        .toEqual([false, 0, true]);
    });

    it("tokenizes code with a carriage return whole, keeping none of its lines, with the tokens of the whole code at every length", async () => {
      const fresh = made();
      const streamed = made();
      const bat = CodeLanguage.named("bat") as CodeLanguage;
      const text = "echo hi\r\nREM a note\r\nset a=1\r\necho %a%";
      const differences: number[] = [];

      for (let length = 3; length < text.length + 3; length += 3) {
        const code = text.slice(0, length);
        if (shown(await streamed.tokensAsync(code, bat, signal)) !== shown(await wholeAsync(fresh, code, bat)))
          differences.push(code.length);
      }

      expect([differences, (await settledOfAsync(streamed, bat)).length]).toEqual([[], 0]);
    });

    it("keeps the settled lines of the 8 codes it settled last, each in place of the code it grew from", async () => {
      const streamed = made();

      for (let index = 0; index < 10; index++)
        for (const code of [`let a${index} = 1;\n`, `let a${index} = 1;\nlet b = 2;\n`])
          await streamed.tokensAsync(code, typescript, signal);

      expect(await settledOfAsync(streamed)).toEqual([9, 8, 7, 6, 5, 4, 3, 2].map(t => `let a${t} = 1;\nlet b = 2;`));
    });
  });
});
