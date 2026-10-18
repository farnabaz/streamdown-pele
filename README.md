# streamdown-pele

A [Streamdown](https://streamdown.ai) diagram plugin that renders ` ```mermaid ` code blocks with [Pele](https://pele.run), the fast Mermaid renderer kepano wrote for Obsidian. Use it in place of `@streamdown/mermaid`.

- No `mermaid` dependency: Pele is about 230 kB gzip, while Mermaid.js is about 1.6 MB.
- Renders take well under a millisecond, so redrawing while a response streams stays cheap.
- Streamdown's Mermaid controls keep working: fullscreen, pan/zoom, copy, and SVG/PNG download.
- Diagrams are themed with CSS variables, so light/dark switches don't need a re-render.

## Install

```sh
pnpm add streamdown-pele
```

`pele` is installed as a dependency. To pass a custom `render` from `pele` / `pele/core` (see below), import it from the same `pele` version.

## Use

```tsx
import { Streamdown } from "streamdown";
import { pele } from "streamdown-pele";
import "streamdown-pele/styles.css"; // optional: follow shadcn theme tokens

<Streamdown plugins={{ mermaid: pele }}>{markdown}</Streamdown>;
```

By default, diagram types are loaded on demand through `pele/lazy`. To change that, pass your own render function:

```ts
import { createPelePlugin } from "streamdown-pele";

// Full synchronous bundle
import { render } from "pele";
const mermaid = createPelePlugin({ render });

// Only the diagram types you need
import { register, render as renderCore } from "pele/core";
import flowchart from "pele/diagrams/flowchart";
import sequence from "pele/diagrams/sequence";
register(flowchart, sequence);
const small = createPelePlugin({ render: renderCore });
```

### Options

| Option          | Default                     | Description                                                                 |
| --------------- | --------------------------- | --------------------------------------------------------------------------- |
| `render`        | `renderAsync` (`pele/lazy`) | Pele render function, either sync or async.                                 |
| `renderOptions` | `{}`                        | Pele [render options](https://pele.run/api), such as `padding`, `icons`, `links`, or `maxEdges`. |

Each diagram gets a unique `idPrefix`, so several diagrams on one page don't share SVG ids. From Streamdown's `mermaid.config`, only `fontFamily` is used. Mermaid themes don't apply here; use the CSS variables below.

## Theming

`styles.css` maps Pele's variables to Streamdown/shadcn tokens (Tailwind v4, where `--background` and similar tokens hold full colors). You can also set them yourself:

```css
[data-streamdown="mermaid-block"] {
  --pele-bg: #fffcf0;
  --pele-fg: #100f0f;
  --pele-accent: #205ea6;
  --pele-font: Inter, sans-serif;
}
```

See [Pele theming](https://pele.run/theming) for the full list of variables.

## Differences from Mermaid.js

Pele reads Mermaid 12.1.0 syntax but uses its own layout and visual style. It does not support JavaScript click callbacks or Mermaid plugins such as ZenUML.

## License

[MIT](./LICENSE)
