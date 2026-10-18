import { useCallback, useEffect, useRef, useState } from "react";
import { Streamdown } from "streamdown";
import { pele } from "../src/index";
import { sample } from "./sample";

const plugins = { mermaid: pele };

const speeds = {
  slow: { delay: 80, min: 1, max: 4 },
  normal: { delay: 35, min: 2, max: 8 },
  fast: { delay: 15, min: 4, max: 16 },
} as const;
type Speed = keyof typeof speeds;

const button =
  "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50";

export function App() {
  const [markdown, setMarkdown] = useState(sample);
  const [streamed, setStreamed] = useState<string | null>(null);
  const [speed, setSpeed] = useState<Speed>("normal");
  const [dark, setDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const isStreaming = streamed !== null;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const stop = useCallback(() => {
    clearTimeout(timer.current);
    setStreamed(null);
  }, []);

  const play = useCallback(() => {
    clearTimeout(timer.current);
    const { delay, min, max } = speeds[speed];
    let pos = 0;
    setStreamed("");
    const tick = () => {
      pos = Math.min(markdown.length, pos + min + Math.floor(Math.random() * (max - min + 1)));
      if (pos >= markdown.length) {
        setStreamed(null);
        return;
      }
      setStreamed(markdown.slice(0, pos));
      timer.current = setTimeout(tick, delay);
    };
    timer.current = setTimeout(tick, delay);
  }, [markdown, speed]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const progress = isStreaming ? Math.round((streamed.length / markdown.length) * 100) : 100;

  return (
    <div className="flex h-screen flex-col">
      <header className="flex flex-wrap items-center gap-3 border-b px-4 py-3">
        <h1 className="mr-auto font-semibold">
          streamdown-pele <span className="font-normal text-muted-foreground">playground</span>
        </h1>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Speed
          <select
            className="rounded-md border bg-background px-2 py-1.5 text-foreground"
            value={speed}
            onChange={(e) => setSpeed(e.target.value as Speed)}
            disabled={isStreaming}
          >
            {Object.keys(speeds).map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        {isStreaming ? (
          <button className={button} onClick={stop} type="button">
            Stop
          </button>
        ) : (
          <button
            className={`${button} border-primary bg-primary text-primary-foreground hover:bg-primary/90`}
            onClick={play}
            type="button"
          >
            Play stream
          </button>
        )}
        <button className={button} onClick={() => setMarkdown(sample)} disabled={isStreaming} type="button">
          Reset
        </button>
        <button className={button} onClick={() => setDark((d) => !d)} type="button">
          {dark ? "Light" : "Dark"}
        </button>
      </header>

      <div className="h-0.5 bg-muted">
        <div
          className="h-full bg-primary transition-[width] duration-100"
          style={{ width: `${progress}%`, opacity: isStreaming ? 1 : 0 }}
        />
      </div>

      <main className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-2">
        <section className="flex min-h-0 flex-col border-b md:border-r md:border-b-0">
          <h2 className="border-b px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Markdown
          </h2>
          <textarea
            className="min-h-0 flex-1 resize-none bg-background p-4 font-mono text-sm leading-relaxed outline-none read-only:text-muted-foreground"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            readOnly={isStreaming}
            spellCheck={false}
          />
        </section>

        <section className="flex min-h-0 flex-col">
          <h2 className="flex items-center justify-between border-b px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Render
            {isStreaming && <span className="normal-case tracking-normal">streaming… {progress}%</span>}
          </h2>
          <div className="min-h-0 flex-1 overflow-auto p-6">
            <Streamdown
              plugins={plugins}
              isAnimating={isStreaming}
              caret={isStreaming ? "block" : undefined}
            >
              {streamed ?? markdown}
            </Streamdown>
          </div>
        </section>
      </main>
    </div>
  );
}
