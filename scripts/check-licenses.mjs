#!/usr/bin/env node
// Fails the build if any production dependency, anywhere in the workspace,
// has a license outside the allowed list — see ADR 0007
// (docs/decisions/0007-mit-license.md) and docs/11-legal-and-clean-room.md.
// Exceptions live in license-allowlist.json at the repo root, each with a
// reason. Run via `pnpm check-licenses` (wired into CI in P0-09).
//
// Scope is production dependencies only (`pnpm licenses list --prod`):
// devDependencies (build/lint/test tooling) never ship in a published
// `@kairon/*` package, so their licenses don't create distribution
// obligations for Kairon's own code.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(fileURLToPath(import.meta.url), "../..");

const ALLOWED_LICENSES = [
  "MIT",
  "ISC",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "Apache-2.0",
  "0BSD",
];

/**
 * @typedef {{ package: string; license: string; reason: string }} Exception
 * @typedef {{ name: string; versions: string[]; license: string; paths: string[] }} ReportedPackage
 */

function loadAllowlist() {
  const file = path.join(ROOT, "license-allowlist.json");
  /** @type {{ exceptions: Exception[] }} */
  const { exceptions } = JSON.parse(readFileSync(file, "utf8"));
  for (const entry of exceptions) {
    if (!entry.package || !entry.license || !entry.reason) {
      throw new Error(
        `license-allowlist.json: every exception needs "package", "license" and "reason" (got ${JSON.stringify(entry)})`,
      );
    }
  }
  return exceptions;
}

function runPnpmLicensesList() {
  const output = execFileSync(
    "pnpm",
    ["licenses", "list", "--prod", "--json"],
    { cwd: ROOT, encoding: "utf8" },
  );
  /** @type {Record<string, ReportedPackage[]>} */
  return JSON.parse(output);
}

function main() {
  const exceptions = loadAllowlist();
  const usedExceptions = new Set();
  const byLicense = runPnpmLicensesList();

  /** @type {{ pkg: ReportedPackage; license: string }[]} */
  const violations = [];
  let scanned = 0;

  for (const [license, packages] of Object.entries(byLicense)) {
    scanned += packages.length;
    if (ALLOWED_LICENSES.includes(license)) continue;

    for (const pkg of packages) {
      const exceptionIndex = exceptions.findIndex(
        (e) => e.package === pkg.name && e.license === license,
      );
      if (exceptionIndex === -1) {
        violations.push({ pkg, license });
      } else {
        usedExceptions.add(exceptionIndex);
      }
    }
  }

  const staleExceptions = exceptions.filter((_, i) => !usedExceptions.has(i));

  console.log(
    `Scanned ${scanned} production dependencies across ${Object.keys(byLicense).length} licenses.`,
  );

  if (violations.length > 0) {
    console.error(
      `\n✖ ${violations.length} package(s) with a license outside [${ALLOWED_LICENSES.join(", ")}]:\n`,
    );
    for (const { pkg, license } of violations) {
      console.error(
        `  - ${pkg.name}@${pkg.versions.join(", ")} — ${license}\n    ${pkg.paths[0]}`,
      );
    }
    console.error(
      "\nEither remove/replace the dependency, or add an exception to " +
        "license-allowlist.json with a reason.",
    );
  }

  if (staleExceptions.length > 0) {
    console.error(
      `\n✖ ${staleExceptions.length} unused exception(s) in license-allowlist.json ` +
        "(the dependency is gone, or no longer reports that license). Remove them:\n",
    );
    for (const e of staleExceptions) {
      console.error(`  - ${e.package} (${e.license})`);
    }
  }

  if (violations.length > 0 || staleExceptions.length > 0) {
    process.exitCode = 1;
    return;
  }

  console.log(
    `✓ All production dependencies use an allowed license (${exceptions.length} documented exception(s)).`,
  );
}

main();
