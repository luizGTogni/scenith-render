import type { ReactElement } from "react";

interface PlaceholderProps {
  "data-scenith-placeholder": string;
}

/**
 * Placeholder export, proving the browser preset (DOM lib + JSX) builds
 * and type-checks for @scenith-render/media. Replaced by the real public API in
 * docs/tasks/phase-1-scene-runtime-and-player.md and later phases.
 */
export function placeholder(): ReactElement<PlaceholderProps> {
  return <div data-scenith-placeholder="@scenith-render/media" />;
}
