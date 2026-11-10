/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { EnvironmentInjector } from "@angular/core";
import { TestBed } from "@angular/core/testing";

import { ClockTokens } from "../../../src/app/models/clock-tokens";
import { CodeWorkerMessageKind } from "../../../src/app/enums/code-worker-message-kind";
import { CodeHighlighterTokens } from "../../../src/app/models/code-highlighter-tokens";
import { CodeLanguage } from "../../../src/app/models/code-language";
import { CodeTokenizer } from "../../../src/app/models/code-tokenizer";
import { CodeHighlighter } from "../../../src/app/services/code-highlighter";
import { provideCodeHighlighting } from "../../../src/app/services/provide-code-highlighting";
import { CodeHighlightingFixture } from "../../../src/testing/models/code-highlighting-fixture";
import { CodeHighlighterWorkerFixture } from "../../fixtures/code-highlighter-worker.fixture";
import { CodeHighlighterFixture, type ICodeHighlighterStatics } from "../../fixtures/code-highlighter.fixture";
import { CodeWorkerStartFixture } from "../../fixtures/code-worker.fixture";
import { TestTimeSource } from "../../fixtures/test-time-source";

describe("CodeHighlightingFixture", () => {
  const { signal, typescript, idleStepsAsync } = CodeHighlighterFixture;
  const loaded = (injector: EnvironmentInjector, names: readonly string[]): readonly boolean[] => names.map(t => CodeHighlightingFixture.isLanguageLoaded(injector, t));

  afterEach(() => vi.restoreAllMocks());

  it("gives a second TestBed's highlighter the Shiki the first one's grammar compiled into, so it finds that grammar loaded and colors with it", async () => {
    TestBed.configureTestingModule({ providers: [CodeHighlightingFixture.sharedShiki] });
    await TestBed.inject(CodeHighlighter).tokensAsync("let a;", typescript, signal);
    const first = TestBed.inject(CodeHighlighterTokens.shiki);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [CodeHighlightingFixture.sharedShiki] });

    const second = TestBed.inject(CodeHighlighterTokens.shiki);
    const loaded = second?.getLoadedLanguages().includes("typescript");
    const tokens = await TestBed.inject(CodeHighlighter).tokensAsync("let b;", typescript, signal);

    expect([Object.isNull(second), second === first, loaded, tokens.length > 0]).toEqual([false, true, true, true]);
  });

  it("reads a preloaded language as loaded once it loads, by its name or an alias, and a language not loaded or a name it doesn't know as absent", async () => {
    const source = new TestTimeSource();
    TestBed.configureTestingModule({ providers: [provideCodeHighlighting({ preload: ["ts"] }), { provide: ClockTokens.timeSource, useValue: source }, CodeHighlightingFixture.sharedShiki] });
    const injector = TestBed.inject(EnvironmentInjector);
    const names = ["ts", "typescript", "python", "nothing-known"];
    const before = loaded(injector, names);

    await idleStepsAsync(TestBed.inject(CodeHighlighter), source, [typescript]);

    expect([before, loaded(injector, names)]).toEqual([[false, false, false, false], [true, true, false, false]]);
  });

  it("starts no load: reading leaves Shiki and the language unloaded and asks for no idle callback, and a later load of another language leaves it absent", async () => {
    const source = new TestTimeSource();
    const startAsync = vi.spyOn(CodeHighlighter as unknown as ICodeHighlighterStatics, "startAsync");
    const loadAsync = vi.spyOn(CodeHighlighter as unknown as ICodeHighlighterStatics, "loadLanguageAsync");
    TestBed.configureTestingModule({ providers: [provideCodeHighlighting(), { provide: ClockTokens.timeSource, useValue: source }, CodeHighlightingFixture.sharedShiki] });
    const injector = TestBed.inject(EnvironmentInjector);
    const reads = [...loaded(injector, ["python", "py"]), ...loaded(injector, ["python"])];
    const asked = [source.idleCount, startAsync.mock.calls.length, loadAsync.mock.calls.length];

    await TestBed.inject(CodeHighlighter).tokensAsync("let a;", typescript, signal);

    expect([reads, asked, loadAsync.mock.calls.map(t => t[1] instanceof CodeLanguage ? t[1].id : null), loaded(injector, ["python", "ts"])])
      .toEqual([[false, false, false], [0, 0, 0], [typescript.id], [false, true]]);
  });

  it("reads a language the highlighting worker loaded as loaded, while the page holds none, and one it didn't load as absent", async () => {
    const bed = new CodeHighlighterWorkerFixture();
    const starts = new CodeWorkerStartFixture();
    TestBed.configureTestingModule({ providers: [provideCodeHighlighting({ preload: ["json"] }), { provide: CodeHighlighterTokens.worker, useValue: starts.start }] });
    const injector = TestBed.inject(EnvironmentInjector);
    const before = loaded(injector, ["json"]);

    bed.source.runIdles();
    await vi.waitFor(() => expect(loaded(injector, ["json"])).toEqual([true]), { interval: 1 });

    expect([before, loaded(injector, ["ini"]), bed.loadedOnPage(TestBed.inject(CodeHighlighter))]).toEqual([[false], [false], false]);
  });

  it("reads a language the worker failed to load as absent, also once the worker answers a load with the failure it holds", async () => {
    const bed = new CodeHighlighterWorkerFixture();
    vi.spyOn(CodeTokenizer.prototype, "loadAsync").mockRejectedValueOnce(new Error("The grammar did not load."));
    const starts = new CodeWorkerStartFixture();
    TestBed.configureTestingModule({ providers: [provideCodeHighlighting(), { provide: CodeHighlighterTokens.worker, useValue: starts.start }] });
    const injector = TestBed.inject(EnvironmentInjector);
    const highlighter = TestBed.inject(CodeHighlighter);

    highlighter.preload(["json"]);
    bed.source.runIdles();
    await vi.waitFor(() => expect(bed.errors.length).toBe(1), { interval: 1 });
    const failed = loaded(injector, ["json"]);
    highlighter.preload(["json"]);
    bed.source.runIdles();
    await vi.waitFor(() => expect(starts.started[0]?.scope.answers.length).toBe(3), { interval: 1 });
    await highlighter.tokensAsync("1", CodeHighlighterWorkerFixture.json, signal);

    expect([failed, loaded(injector, ["json"]), starts.started[0]?.scope.answers.map(t => [t.kind, Object.isNull(t.error)]), bed.errors.length])
      .toEqual([[false], [false], [[CodeWorkerMessageKind.Ready, true], [CodeWorkerMessageKind.Failed, false], [CodeWorkerMessageKind.Failed, true], [CodeWorkerMessageKind.Failed, true]], 1]);
  });

  it("reads every language as absent for an injector without provideCodeHighlighting", () => {
    expect(loaded(TestBed.inject(EnvironmentInjector), ["ts", "json"])).toEqual([false, false]);
  });
});
