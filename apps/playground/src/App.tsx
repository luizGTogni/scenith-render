import { placeholder as corePlaceholder } from "@scenith-render/core";

/**
 * Proves the playground wires up correctly end to end: a workspace package
 * (`@scenith-render/core`) imported and rendered with hot reload. Replaced by the
 * real demo scene in docs/tasks/phase-1-scene-runtime-and-player.md (P1-27).
 */
export function App() {
  return (
    <main style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>Scenith Playground</h1>
      <p>
        A placeholder element rendered from the workspace package
        @scenith-render/core:
      </p>
      {corePlaceholder()}
    </main>
  );
}
