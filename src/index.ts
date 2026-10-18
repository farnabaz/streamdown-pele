import type { RenderOptions, RenderResult } from "pele";
import type { DiagramPlugin } from "streamdown";

/** Mermaid-style config Streamdown forwards from its `mermaid.config` prop. */
type MermaidConfig = Parameters<DiagramPlugin["getMermaid"]>[0];
/** Mermaid-compatible instance Streamdown calls (not exported by streamdown). */
type MermaidInstance = ReturnType<DiagramPlugin["getMermaid"]>;

/**
 * A Pele render function. Matches `render` from `pele` / `pele/core`
 * (sync) and `renderAsync` from `pele/lazy` (async).
 */
export type PeleRender = (
  source: string,
  options?: RenderOptions
) => RenderResult | Promise<RenderResult>;

export interface PelePluginOptions {
  /**
   * Pele render function to use.
   *
   * Defaults to `renderAsync` from `pele/lazy`, which loads only the
   * diagram types that are actually used. Pass `render` from `pele` for the
   * full synchronous bundle, or from `pele/core` after `register(...)`ing a
   * subset of diagrams.
   */
  render?: PeleRender;
  /** Options passed to every Pele render call. */
  renderOptions?: RenderOptions;
}

const lazyRender: PeleRender = async (source, options) => {
  const { renderAsync } = await import("pele/lazy");
  return renderAsync(source, options);
};

/** Turns Streamdown's random render id into a valid, unique SVG id prefix. */
const toIdPrefix = (id: string) => id.replace(/[^\w-]/g, "-");

/** Maps the parts of a Mermaid config that have a Pele equivalent. */
const fromMermaidConfig = (config: MermaidConfig): RenderOptions => {
  const options: RenderOptions = {};
  if (typeof config?.fontFamily === "string") {
    options.fontFamily = config.fontFamily;
  }
  return options;
};

/**
 * Create a Streamdown diagram plugin that renders Mermaid with Pele.
 *
 * It plugs into Streamdown's built-in Mermaid UI, so fullscreen, pan/zoom,
 * copy and SVG/PNG download keep working.
 */
export function createPelePlugin(
  options: PelePluginOptions = {}
): DiagramPlugin {
  const render = options.render ?? lazyRender;
  let configOptions: RenderOptions = {};

  const instance: MermaidInstance = {
    initialize(config) {
      configOptions = fromMermaidConfig(config);
    },
    async render(id, source) {
      const { svg } = await render(source, {
        ...configOptions,
        ...options.renderOptions,
        idPrefix: options.renderOptions?.idPrefix ?? toIdPrefix(id),
      });
      return { svg };
    },
  };

  return {
    name: "mermaid",
    type: "diagram",
    // Streamdown only routes ```mermaid fences to diagram plugins.
    language: "mermaid",
    getMermaid(config) {
      if (config) {
        instance.initialize(config);
      }
      return instance;
    },
  };
}

/** Pele plugin with default settings (lazy-loaded diagram types). */
export const pele: DiagramPlugin = createPelePlugin();
