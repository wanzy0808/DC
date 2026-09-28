import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const repo = new URL("../", import.meta.url);
const path = (name) => new URL(name, repo);
const read = (name) => readFileSync(path(name), "utf8");

function applicationRouteFiles(directory = "app") {
  return readdirSync(path(directory), { withFileTypes: true }).flatMap((entry) => {
    const relative = join(directory, entry.name);
    if (entry.isDirectory()) return applicationRouteFiles(relative);
    return /(?:page|layout)\.tsx$/.test(entry.name) ? [relative] : [];
  });
}

test("Undara application routes use the canonical typography system", () => {
  const layout = read("app/layout.tsx");
  const styles = read("app/globals.css");

  assert.match(layout, /DM_Serif_Display/);
  assert.match(layout, /Roboto/);
  assert.match(layout, /DM_Mono/);
  assert.match(layout, /variable: "--font-undara-display"/);
  assert.match(layout, /variable: "--font-undara-body"/);
  assert.match(layout, /variable: "--font-undara-technical"/);

  assert.match(styles, /--font-undara-sans:\s*var\(--font-undara-body\)/);
  assert.match(styles, /--font-undara-heading:\s*var\(--font-undara-display\)/);
  assert.match(styles, /--font-undara-mono:\s*var\(--font-undara-technical\)/);
  assert.match(styles, /html, body \{ font-family: var\(--font-undara-sans\)/);
  assert.match(styles, /h1, h2, h3, h4, h5, h6 \{ font-family: var\(--font-undara-heading\)/);
  assert.match(styles, /button, input, textarea, select, option \{ font-family: inherit; \}/);

  for (const file of applicationRouteFiles()) {
    const source = read(file);
    assert.doesNotMatch(source, /var\(--font-(?:cinzel|fauna)\)/i, `${file} still uses a retired application font token`);
  }
});
