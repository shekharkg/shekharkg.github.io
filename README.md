# shekharkg.com

Portfolio of Shekhar Kumar Gupta: software engineer, building under the Quill Byte studio.

- Static HTML from [Eleventy](https://www.11ty.dev/) and one CSS file. **No JavaScript, cookies, analytics or third-party requests.** `npm run check` fails the build if any sneak in.
- Hosted on **Firebase Hosting** at `shekharkg.com`.
- `shekharkg.github.io` now only redirects to `shekharkg.com`, and still serves the original `privacy-policy.html` (see [GitHub Pages](#github-pages)).
- Plan and decisions: [`docs/portfolio-refresh-plan.md`](docs/portfolio-refresh-plan.md).

## Work on it

```sh
npm install
npm start          # http://localhost:8080, rebuilds on save
npm run build      # → _site/
npm run check      # no third-party requests or scripts, no client names or phone numbers, no broken links
```

## Add or change content

| What | Where |
|---|---|
| Name, pitch, email, links, skills | `src/_data/site.js` |
| Projects (featured + "more work") | `src/_data/projects.js`. `caseStudy: true` gives a project a page at `/projects/<slug>/` |
| Screenshots | `src/assets/img/projects/<slug>/`, as JPEGs about 480 px wide for phones and 960 px for wide images |
| 2014–2016 apps | `src/_data/archive.js` |
| Open source | `src/_data/oss.json`. Edit `repos` by hand; run `npm run oss` to refresh `contributions` from GitHub (merged PRs to other people's repos) |

Client work is anonymised. Never add a client's name, domain, logo or screenshots. `scripts/check.mjs` keeps a list of names that must not appear.

To resize a screenshot on macOS:

```sh
sips -s format jpeg -s formatOptions 78 --resampleWidth 480 in.png --out src/assets/img/projects/<slug>/name.jpg
```

## Deploy (Firebase Hosting)

One-time setup:

```sh
firebase login
firebase projects:create <project-id> --display-name "shekharkg.com"
firebase use --add <project-id>          # writes .firebaserc
```

Then in the Firebase console, go to **Hosting → Add custom domain**, add `shekharkg.com` (and `www.shekharkg.com` as a redirect), and add the A and TXT records it shows at your domain registrar.

Every release:

```sh
npm run oss        # optional: refresh open-source contributions
npm run deploy     # build → check → firebase deploy --only hosting
```

## Email

`mail@shekharkg.com` only works once the domain has MX records. Set up a mail provider or a forwarding service for the domain at the same time as the DNS records above.

## GitHub Pages

`github-pages/` is published to `shekharkg.github.io` by `.github/workflows/pages-redirect.yml`. It contains:

- `index.html` and `404.html`, which redirect to the same path on `shekharkg.com`
- `privacy-policy.html`, an untouched copy of the Savescape privacy policy, because its Play listing links to `shekharkg.github.io/privacy-policy.html`

In **Settings → Pages**, set **Source** to **GitHub Actions** before merging this into `master`. Otherwise Pages will try to serve the repository root, which no longer has an `index.html`.

## License

Code: [Apache-2.0](LICENSE). Text, screenshots and project content: © Shekhar Kumar Gupta, all rights reserved.
