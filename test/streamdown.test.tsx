// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import { Streamdown } from "streamdown";
import { beforeAll, expect, it } from "vitest";
import { pele } from "../src/index";

beforeAll(() => {
  // jsdom has no IntersectionObserver; Streamdown uses it to lazy-render diagrams.
  globalThis.IntersectionObserver = class {
    constructor(private cb: IntersectionObserverCallback) {}
    observe(target: Element) {
      this.cb(
        [{ isIntersecting: true, target } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver
      );
    }
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  } as unknown as typeof IntersectionObserver;
});

const markdown = `Here is a diagram:

\`\`\`mermaid
flowchart LR
  A[Mermaid text] --> B[SVG]
\`\`\`
`;

it("renders a mermaid fence through Streamdown with Pele", async () => {
  const { container } = render(
    <Streamdown plugins={{ mermaid: pele }}>{markdown}</Streamdown>
  );
  expect(screen.getByText("Here is a diagram:")).toBeTruthy();
  await waitFor(() => {
    expect(container.querySelector("svg.pele.pele-flowchart")).toBeTruthy();
  });
  expect(container.querySelector('[data-streamdown="mermaid-block"]')).toBeTruthy();
});
