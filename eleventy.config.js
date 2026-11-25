// shekharkg.com: static HTML and one stylesheet. No client-side JavaScript.
export default function (config) {
  config.addPassthroughCopy({ "src/assets": "assets" });
  config.addPassthroughCopy({ "src/assets/img/favicon.svg": "favicon.svg" });
  // Savescape's Play listing links to this exact path; copy it untouched by templating.
  config.addPassthroughCopy({ "src/privacy-policy.html": "privacy-policy.html" });
  config.ignores.add("src/privacy-policy.html");

  config.addFilter("isoDate", (d) => new Date(d).toISOString().slice(0, 10));
  config.addFilter("year", (d) => new Date(d).getFullYear());
  config.addFilter("absolute", (path, base) => new URL(path, base).href);
  config.addFilter("json", (v) => JSON.stringify(v));
  // Escape text, then turn `backticks` into <code>. Use with | safe.
  config.addFilter("inlineCode", (s) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
  );

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
