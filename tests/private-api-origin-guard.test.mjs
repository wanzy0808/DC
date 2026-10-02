import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));
const apiRoot = path.join(repoRoot, "app", "api");

function walkRoutes(dir) {
  const routes = [];
  for (const entry of readdirSync(dir)) {
    const target = path.join(dir, entry);
    const stat = statSync(target);
    if (stat.isDirectory()) routes.push(...walkRoutes(target));
    else if (entry === "route.ts") routes.push(target);
  }
  return routes;
}

test("every session-authenticated private mutation route enforces trusted origin", () => {
  const failures = [];
  for (const routePath of walkRoutes(apiRoot)) {
    const source = readFileSync(routePath, "utf8");
    const hasSessionAuth = source.includes("getCurrentUser");
    const hasMutation = /export async function (POST|PUT|PATCH|DELETE)\b/.test(source);
    if (!hasSessionAuth || !hasMutation) continue;

    if (!source.includes("isTrustedMutationOrigin")) {
      failures.push(path.relative(repoRoot, routePath).replaceAll(path.sep, "/"));
    }
  }

  assert.deepEqual(
    failures,
    [],
    "Private mutation routes missing trusted-origin enforcement:\n" + failures.join("\n"),
  );
});
