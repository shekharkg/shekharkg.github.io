// Refreshes src/_data/oss.json → contributions with merged pull requests that
// shekharkg opened on other people's repositories. Run it before a deploy:
//   npm run oss            (uses GITHUB_TOKEN or `gh auth token` if available)
// The build itself never calls the network; it only reads oss.json.
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";

const USER = "shekharkg";
// Organisations whose PRs aren't open-source contributions (hiring assignments etc.).
const EXCLUDE_OWNERS = [/hiring/i];
const FILE = new URL("../src/_data/oss.json", import.meta.url);

let token = process.env.GITHUB_TOKEN;
if (!token) {
  try {
    token = execSync("gh auth token", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {}
}

const q = encodeURIComponent(`is:pr is:merged author:${USER} -user:${USER}`);
const res = await fetch(`https://api.github.com/search/issues?q=${q}&sort=updated&per_page=100`, {
  headers: {
    Accept: "application/vnd.github+json",
    "User-Agent": "portfolio-oss-fetch",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  },
});
if (!res.ok) {
  console.error(`GitHub API ${res.status}: ${await res.text()}`);
  process.exit(1);
}
const { items } = await res.json();

const contributions = items
  .map((it) => {
    const repo = it.repository_url.replace("https://api.github.com/repos/", "");
    return {
      title: it.title,
      url: it.html_url,
      repo,
      merged: (it.pull_request?.merged_at || it.closed_at).slice(0, 10),
    };
  })
  .filter((c) => !EXCLUDE_OWNERS.some((re) => re.test(c.repo.split("/")[0])))
  .sort((a, b) => b.merged.localeCompare(a.merged));

const data = JSON.parse(readFileSync(FILE, "utf8"));
data.contributions = contributions;
data.updated = new Date().toISOString().slice(0, 10);
writeFileSync(FILE, JSON.stringify(data, null, 2) + "\n");
console.log(`✓ ${contributions.length} merged upstream PRs written to src/_data/oss.json`);
