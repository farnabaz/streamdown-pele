import { render as peleRender } from "pele";
import type { PluginConfig } from "streamdown";
import { describe, expect, it, vi } from "vitest";
import { createPelePlugin, pele } from "../src/index";

const chart = "flowchart LR\n  A[Mermaid text] --> B[SVG]";

describe("pele plugin", () => {
  it("matches Streamdown's DiagramPlugin shape", () => {
    const plugins: PluginConfig = { mermaid: pele };
    expect(plugins.mermaid).toMatchObject({
      name: "mermaid",
      type: "diagram",
      language: "mermaid",
    });
  });

  it("renders with the lazy default", async () => {
    const { svg } = await pele.getMermaid().render("mermaid-1-2-abc", chart);
    expect(svg).toMatch(/^<svg[^>]*class="pele pele-flowchart"/);
  });

  it("uses the Streamdown render id as a unique SVG id prefix", async () => {
    const render = vi.fn(peleRender);
    const plugin = createPelePlugin({ render });
    await plugin.getMermaid().render("mermaid-123-456-x.y", chart);
    expect(render).toHaveBeenCalledWith(
      chart,
      expect.objectContaining({ idPrefix: "mermaid-123-456-x-y" })
    );
  });

  it("maps mermaid fontFamily and lets renderOptions win", async () => {
    const render = vi.fn(peleRender);
    const plugin = createPelePlugin({
      render,
      renderOptions: { padding: 4 },
    });
    await plugin.getMermaid({ fontFamily: "Inter", theme: "dark" }).render("id", chart);
    expect(render.mock.calls[0][1]).toMatchObject({ fontFamily: "Inter", padding: 4 });
  });

  it("rejects with Pele errors so Streamdown can show its error UI", async () => {
    await expect(
      createPelePlugin({ render: peleRender }).getMermaid().render("id", "flowchart LR\n  A -->")
    ).rejects.toMatchObject({ name: "PeleError", code: "syntax" });
  });

});
