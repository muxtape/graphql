# StatZone01

A personal stats page for the [Zone01 Athens](https://www.zone01.gr/) platform. Sign in with your platform credentials and see your own data: identity, level and XP, audit ratio, top skills, and two interactive statistics graphs.

**Live site:** https://muxtape.github.io/graphql/

Built with plain HTML, CSS and JavaScript (ES modules). No frameworks, no build step and no chart libraries: every graph is drawn by hand with SVG.

> Unofficial student project. The Zone01 name and logo belong to Zone01.

## What you can see

- **Welcome and identity**: your name, login, campus and the date your main program started.
- **Progress**: current level and total XP.
- **Audits**: audit ratio, with audits done and received compared as bars.
- **Top skills**: your five strongest skills as bars.
- **XP over time**: an animated step line of your cumulative XP. Hover, touch or use the arrow keys to inspect any moment.
- **XP per month**: stacked bars with three views (All, Projects, Piscines). The vertical scale fits the selected view.

## Try it

Open the live site and sign in with your own platform credentials, either `username` or `email` plus your password. Every student sees only their own data: the page contains no personal information, and the platform's server decides what each token may read.

## How it works

```
Browser (this site)                        School servers
-------------------                        ---------------
1. POST /api/auth/signin   (Basic auth)  -> checks the credentials
2. <- JWT
3. POST /graphql           (Bearer JWT)  -> returns only your data
4. <- JSON
5. JavaScript turns the data into HTML and SVG
```

There is no backend of my own. The site is a set of static files, and the browser talks directly to the school's authentication and GraphQL endpoints.

## Project structure

```
index.html            Login page
profile.html          Profile page
404.html              "Page not found" page (served by GitHub Pages)
assets/               Zone01 logo
css/style.css         All styling; every color is a token at the top
js/
  config.js           The two endpoint URLs
  auth.js             Login form, signin request, error handling
  token.js            Token storage (sessionStorage)
  session.js          Route guards and logout
  jwt.js              Reads the user id from the token (no verification)
  graphql.js          One function that sends any query with the Bearer token
  queries.js          All GraphQL query strings
  xp.js               Turns XP transactions into chart data (pure functions)
  format.js           Number, date and name formatting
  svg.js              SVG helpers: element factory, scales, axis ticks
  charts.js           The four SVG graphs, tooltips and animations
  profile.js          Loads the data and renders the profile page
docs/data-notes.md    What I learned about the API, and the rules the page relies on
```

## Run it locally

ES modules do not load from `file://`, so serve the folder:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## GraphQL queries

The three styles the project asks for are all used (see `js/queries.js`):

```graphql
# Normal
{ user { id login firstName lastName campus } }

# With arguments (variables, filters, ordering, limits)
query ($userId: Int!, $notPiscine: String!) {
  transaction(
    where: { userId: { _eq: $userId }, type: { _eq: "level" }, path: { _nlike: $notPiscine } }
    order_by: { amount: desc }
    limit: 1
  ) { amount }
}

# Nested (a related table inside a query)
{ transaction(where: { type: { _eq: "xp" } }) { amount createdAt object { name type } } }
```

## How the numbers are defined

These rules came from exploring the API (see `docs/data-notes.md`) and were checked against the platform's own profile:

- **Total XP** counts every `xp` transaction except those inside a piscine folder. The piscine's own completion row is counted. Amounts are bytes, shown in units of 1000 (kB, MB).
- **Level** is the highest `level` transaction, using the same piscine exclusion.
- **Audit ratio** is `totalUp / totalDown` from the user record. Bonus XP is not part of it.
- **Skills** are `skill_*` transactions. The current value of a skill is the highest amount recorded, shown as a percentage.
- **Months** use the viewer's local time.

## Security and privacy

- Your credentials are sent only to the school's signin endpoint, over HTTPS. They are never stored.
- Only the JWT is kept, in `sessionStorage`: it is gone when the tab closes, and logging out clears it.
- The page decodes the token only to read the user id. It does not verify the signature, because only the server can, and it does so on every request.
- No third-party scripts are loaded. All text that comes from the server is inserted with `textContent`, never as HTML.
- Network requests are made only in `js/auth.js` and `js/graphql.js`, and only to the two endpoints in `js/config.js`.

Limits: like any single-page site without a backend, a script running on the page could read the token. That is why the page loads no outside code.

## Accessibility and responsiveness

- Works with the keyboard throughout, with visible focus and a skip link. Charts can be browsed with the arrow keys, Home, End and Escape.
- Every chart has a text title and description, and live regions announce errors.
- Respects the reduced-motion setting (animations are skipped).
- Charts measure their container and redraw at its real width, so they stay readable from a 320px phone to a wide desktop.
- Handles empty states (no XP, no skills, no audits yet), network failures and expired sessions.

## Hosting

The site is served by GitHub Pages from the `main` branch. The repository is hosted on the school's Gitea and mirrored to GitHub: `origin` has two push URLs, so one `git push` updates both, and pushing to GitHub is what deploys the site.

## For reviewers

- Login and logout: `js/auth.js`, `js/session.js`
- Queries (normal, arguments, nested): `js/queries.js`
- Requests with the Bearer token: `js/graphql.js`
- SVG graphs: `js/charts.js`, helpers in `js/svg.js`
- Data rules and API notes: `docs/data-notes.md`

## License
- Licensed under the MIT License. See the [`LICENSE`](LICENSE) file for details.