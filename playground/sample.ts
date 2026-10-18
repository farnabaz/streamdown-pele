export const sample = `# Pele in Streamdown

Mermaid code fences are drawn by **Pele** instead of Mermaid.js. Edit the markdown on the left, or press **Play stream** to watch it arrive token by token.

\`\`\`mermaid
flowchart LR
  User([User]) --> Chat[Chat UI]
  Chat -->|prompt| Model{{LLM}}
  Model -->|tokens| Streamdown
  Streamdown -->|mermaid fence| Pele[Pele renderer]
  Pele --> SVG[(Themeable SVG)]
\`\`\`

## A sequence

\`\`\`mermaid
sequenceDiagram
  participant U as User
  participant A as App
  participant M as Model
  U->>A: Ask a question
  A->>M: Stream request
  loop every token
    M-->>A: chunk
    A-->>U: re-render markdown
  end
  A->>U: Done
\`\`\`

## Some data

\`\`\`mermaid
pie title Bundle size (gzip, kB)
  "Pele" : 230
  "Mermaid.js" : 1600
\`\`\`

\`\`\`mermaid
stateDiagram-v2
  [*] --> Idle
  Idle --> Streaming: play
  Streaming --> Idle: stop
  Streaming --> Done: last token
  Done --> [*]
\`\`\`

| Renderer   | Draw time   | Dependencies |
| ---------- | ----------- | ------------ |
| Pele       | 0.05–0.3 ms | 0            |
| Mermaid.js | 6–82 ms     | 23           |

That's it.
`;
