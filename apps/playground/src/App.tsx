import { placeholder as corePlaceholder } from "@kairon-render/core";

/**
 * Proves the playground wires up correctly end to end: a workspace package
 * (`@kairon-render/core`) imported and rendered with hot reload. Replaced by the
 * real demo scene in docs/tasks/phase-1-scene-runtime-and-player.md (P1-27).
 */
export function App() {
  return (
    <main style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>Kairon Playground</h1>
      <p>
        A placeholder element rendered from the workspace package
        @kairon-render/core:
      </p>
      {corePlaceholder()}
    </main>
  );
}
