#!/usr/bin/env node
// One-command publish: sync fallback data, commit + push to GitHub, then deploy to Cloudflare.
// Usage: npm run publish -- "commit message"
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { menu } from "../menu-data.js";

const message = process.argv.slice(2).join(" ") || "Update menu";

function run(cmd) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

function syncFallback() {
  const path = new URL("../public/index.html", import.meta.url);
  const html = readFileSync(path, "utf8");
  const json = JSON.stringify(menu);
  const re = /window\.__FALLBACK__ = .*?;\n/;
  if (!re.test(html)) {
    throw new Error("Could not find window.__FALLBACK__ line in public/index.html");
  }
  writeFileSync(path, html.replace(re, `window.__FALLBACK__ = ${json};\n`));
}

try {
  // Keep the embedded fallback (used if /api/menu ever fails) in sync with
  // menu-data.js on every publish — this is what the offline/fallback view
  // shows, and it's easy to forget to regenerate by hand.
  syncFallback();

  run("git add -A");

  const status = execSync("git status --porcelain").toString().trim();
  if (status) {
    run(`git commit -m "${message.replace(/"/g, '\\"')}"`);
    run("git push");
  } else {
    console.log("\nNo file changes to commit — skipping commit/push.");
  }

  run("npm run deploy");

  console.log("\nDone: pushed to GitHub and deployed to Cloudflare.");
} catch (err) {
  console.error("\nPublish failed:", err.message);
  process.exit(1);
}
