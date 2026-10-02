import { platform } from "node:os";

/**
 * Placeholder export, proving the Node preset (no DOM lib, Node types)
 * builds and type-checks for @scenith-render/renderer. Replaced by the real public API in
 * later phases (see docs/tasks/).
 */
export function placeholder(): string {
  return `@scenith-render/renderer on ${platform()}`;
}
