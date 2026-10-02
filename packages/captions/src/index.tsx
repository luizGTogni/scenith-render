import type { ReactElement } from "react";

interface PlaceholderProps {
  "data-kairon-placeholder": string;
}

/**
 * Placeholder export, proving the browser preset (DOM lib + JSX) builds
 * and type-checks for @kairon-render/captions. Replaced by the real public API in
 * docs/tasks/phase-1-scene-runtime-and-player.md and later phases.
 */
export function placeholder(): ReactElement<PlaceholderProps> {
  return <div data-kairon-placeholder="@kairon-render/captions" />;
}
