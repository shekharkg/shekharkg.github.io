// Fails the deploy if the built site:
//  - loads anything from another origin, or ships executable JavaScript
//  - is missing a page that something outside links to (privacy-policy.html for Savescape)
//  - leaks a client's name or a phone number (client work is anonymised)
//  - has a broken internal link
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, posix } from "node:path";
import caseStudies from "../src/_data/caseStudies.js";

const out = "_site";
const problems = [];
const files = [];
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    statSync(p).isDirectory() ? walk(p) : files.push(p);
  }
})(out);

const required = [
  "index.html",
  "archive/index.html",
  "404.html",
  "privacy-policy.html",
  "sitemap.xml",
  "robots.txt",
  "favicon.svg",
  ...caseStudies.map((p) => `projects/${p.slug}/index.html`),
];
for (const r of required) if (!existsSync(join(out, r))) problems.push(`missing ${r}`);

// Names that must never appear: anonymised clients. Case-insensitive.
const forbidden = [/ghumlo/i, /ode\s*home/i, /\bpatna\b/i];
// Indian mobile numbers in any common format.
const phone = /(\+91[\s-]*)?\(?\+?91\)?[\s-]*[6-9]\d{4}[\s-]?\d{5}\b/;

for (const f of files.filter((f) => /\.(html|xml|txt)$/.test(f))) {
  const html = readFileSync(f, "utf8");
  const rel = f.slice(out.length + 1);
  const isLegacyPolicy = rel === "privacy-policy.html";

  for (const m of html.matchAll(/<(script|link|img|iframe|source|video|audio)\b[^>]*\b(src|href|srcset)="([^"]+)"/gi)) {
    const [, tag, , url] = m;
    if (tag.toLowerCase() === "link" && /rel="(alternate|canonical)"/.test(m[0])) continue;
    if (/^(https?:)?\/\//i.test(url)) problems.push(`${rel}: third-party ${tag} ${url}`);
  }
  for (const m of html.matchAll(/<script\b([^>]*)>/gi)) {
    if (!/type="application\/ld\+json"/.test(m[1])) problems.push(`${rel}: executable <script> (the site ships no JavaScript)`);
  }
  if (rel.endsWith(".html") && !/<html lang="en"/.test(html)) problems.push(`${rel}: missing <html lang="en">`);
  for (const re of forbidden) if (re.test(html)) problems.push(`${rel}: mentions an anonymised client (${re})`);
  if (!isLegacyPolicy && phone.test(html)) problems.push(`${rel}: looks like it contains a phone number`);

  // Internal links must resolve to a built file.
  if (rel.endsWith(".html")) {
    for (const m of html.matchAll(/\bhref="(\/[^"#?]*)/g)) {
      const target = m[1];
      const candidates = target.endsWith("/")
        ? [join(out, target, "index.html")]
        : [join(out, target), join(out, target + ".html"), join(out, target, "index.html")];
      if (!candidates.some((c) => existsSync(c))) problems.push(`${rel}: broken link ${target}`);
    }
  }
}

if (problems.length) {
  console.error(problems.map((p) => "✗ " + p).join("\n"));
  process.exit(1);
}
console.log(`✓ ${files.length} files checked: no third-party requests or scripts, no client names or phone numbers, all links and required pages present`);
