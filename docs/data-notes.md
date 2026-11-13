# Data notes

What I learned about the school platform's GraphQL API while exploring it with GraphiQL, and the rules the profile page relies on.

> **Privacy rule for this file:** it records **structure and rules only**. Personal values (login, user ID, XP totals, ratios, dates, row counts, tokens) stay out of the public repo. Raw exploration output lives in `docs/raw-exploration.local.md`, which is ignored by git (`*.local.md` in `.gitignore`).

**Legend**
- **Verified**: observed on my own account.
- **Inferred**: reasoned from names or patterns, not confirmed.
- Paths look like `/<campus>/<module>/...`. `<campus>` stands for the campus name.

---

## 1. Endpoints and authentication

| Purpose | URL |
|---|---|
| Sign in | `https://platform.zone01.gr/api/auth/signin` |
| GraphQL | `https://platform.zone01.gr/api/graphql-engine/v1/graphql` |

- Sign in with `POST` and `Authorization: Basic base64(identifier:password)`. The identifier can be a username or an email. The body is the JWT as plain text. (Verified)
- Wrong credentials give **401** when nothing matches and **403** when the account exists but the password is wrong. The page treats both as "invalid credentials". (Verified)
- GraphQL requests use `Authorization: Bearer <jwt>` and `Content-Type: application/json`. The body is `{ "query": "...", "variables": {...} }`. (Verified)
- The JWT payload holds the user ID under the claim `https://hasura.io/jwt/claims`, key `x-hasura-user-id`, as text. Convert it to a number. (Verified)
- Browsers on `localhost` and `github.io` are allowed to call both endpoints (CORS). (Verified)
- GraphQL failures can arrive with HTTP 200 and an `errors` array, so check both the status and `errors`. (General GraphQL behaviour)

---

## 2. How to explore

- **GraphiQL** (reachable from the platform when logged in): query on the left, JSON on the right, Docs panel for the schema. `Ctrl+Enter` runs, `Ctrl+Space` autocompletes.
- **Introspection** lists what exists, so there's no need to guess names:

```graphql
# Every table that can be queried
{ __schema { queryType { fields { name } } } }

# Fields of one table (relationships show up as fields whose type is another table)
{ __type(name: "transaction") { fields { name type { name kind ofType { name } } } } }

# Official lookup tables
{ transaction_type { type } object_type { type } }
```

In introspection output, `kind: "NON_NULL"` with a null `ofType.name` means a **list** (a "has many" relationship).

- **Fragments** avoid repeating a block:

```graphql
fragment S on transaction_aggregate { aggregate { count sum { amount } } }
{
  a: transaction_aggregate(where: { type: { _eq: "xp" } }) { ...S }
  b: transaction_aggregate(where: { type: { _eq: "up" } }) { ...S }
}
```

---

## 3. Hasura query vocabulary

| Argument | Meaning | Example |
|---|---|---|
| `where` | Filter | `where: { type: { _eq: "xp" } }` |
| `order_by` | Sort | `order_by: { createdAt: desc }` |
| `limit` / `offset` | Paging (always pair with `order_by`) | `limit: 10, offset: 20` |
| `distinct_on` | One row per value (its column must be first in `order_by`) | `distinct_on: type` |

- Operators: `_eq`, `_neq`, `_gt`, `_gte`, `_lt`, `_lte`, `_in`, `_like`, `_nlike`, `_ilike`, `_is_null`. Combine with `_and` / `_or`. Several fields in one `where` object mean "and".
- `_like` patterns use `%` as a wildcard.
- Every table `X` has `X_aggregate { aggregate { count sum{...} min{...} max{...} } }`.
- **There is no GROUP BY.** Fetch the rows and group them in JavaScript.
- **Aliases** (`name: table(...)`) let one request run the same table several times.
- **Variables** keep values out of the query text:

```graphql
query ($type: String!) {
  transaction_aggregate(where: { type: { _eq: $type } }) { aggregate { count } }
}
```
Variables pane: `{ "type": "xp" }`.

The three query styles the project requires:

```graphql
{ user { id login } }                                           # normal
{ object(where: { id: { _eq: 3323 } }) { name type } }          # with arguments
{ transaction(limit: 5) { amount object { name type } } }       # nested
```

---

## 3b. Tables worth knowing

| Table | What it holds |
|---|---|
| `user` | The logged-in user (one row). Identity and audit totals. |
| `transaction` | XP, audit up/down, level and skill rows. Only my own rows. |
| `progress` | One row per attempt, with `userId`, `grade`, `isDone`, `path`. |
| `result` | Results, including group results that have **no** `userId`. |
| `object` | Names and types of projects, exercises, piscines and so on. |
| `event`, `event_user` | Modules/piscines and the user's enrolment (`createdAt`, `level`). |
| `xp_view`, `user.xps` | The XP rows again (not pre-summed). (Inferred) |
| `audit` | Audits done and received. Not used yet. |
| `transaction_type`, `object_type` | Lookup tables of valid types. |

Ignored: `audit_private`, the `toad_*` tables, and the registration, record, role and markdown tables.

**`user` fields used:** `id`, `login`, `firstName`, `lastName`, `campus`, `createdAt`, `auditRatio`, `totalUp`, `totalDown`, `totalUpBonus`. Names can be `null`, so fall back to the login.

**`transaction.type` values:** `xp`, `up`, `down`, `level`, and many `skill_<name>` types.

**`object.type` values (seen):** `exercise`, `project`, `piscine`, `module`, `raid`, `quest`, `exam`, `quiz`, `onboarding`, and a few others.

---

## 4. Rules the page relies on

### XP (Verified)
- `amount` is in **bytes**. The platform displays units of **1000** (350 B, 51.8 kB, 1.06 MB), with about 3 significant digits.
- **Platform XP = the sum of `xp` transactions whose path is not inside a piscine.**

```graphql
where: { type: { _eq: "xp" }, path: { _nlike: "%/piscine-%/%" } }
```

- This keeps the piscine **completion** rows (path ends at the piscine folder) and projects, checkpoints and assessments, and it drops the per-exercise rows inside piscines.
- On my account this matched the platform's total XP and its transaction count exactly.
- It assumes piscine folders are named `piscine-...`. If that ever changes, the rule must change too.
- A plain sum of all `xp` rows is **much larger** than the platform total and is wrong for display.
- `isBonus` and `invalidatedAt` were never set on my XP rows, so they don't affect the total. Handle `null` anyway.
- A path is **not unique**: checkpoint exercises repeat across sessions. Group by transaction `id`, never by path.

### Level (Verified)
- The level is the highest `amount` among `level` transactions, using the same `_nlike "%/piscine-%/%"` path filter. It matched the platform's level.
- `event_user.level` also exists per event. (Inferred relationship)

### Audit ratio (Verified)
- `auditRatio = totalUp / totalDown`. The bonus total (`totalUpBonus`) is **not** part of it.
- `totalUp` and `totalDown` equal the sums of the `up` and `down` transactions.

### Skills (Verified, partly inferred)
- Skill rows are `skill_<name>` transactions whose `amount` grows over time, like a running percentage. The current value is the **maximum** per type, not the sum. (Inferred, and it matched my profile's top skills.)

```graphql
{
  transaction(
    where: { type: { _like: "skill_%" } }
    distinct_on: type
    order_by: [{ type: asc }, { amount: desc }]
  ) { type amount }
}
```

### Results, progress and pass/fail (Verified, meanings partly inferred)
- **Group results have `userId: null`** and are linked by `groupId`. `user.results` and `where: { userId: ... }` would **silently drop them**. Use `progress` (which carries `userId`) for project pass/fail.
- Every submission creates a row in both `progress` and `result`. Repeated attempts show as several rows with the same path: grade `0` is a fail, `1` is a pass.
- `result.type` values seen: `tester`, `user_audit`, `admin_audit`, `admin_selection`. Their meanings are inferred from the names: automatic tests, peer-audited projects, raids, and final selection grades.
- A passed project has grade **1.2**. A failed attempt is below 1. Working rule: **`grade >= 1` means pass**.
- Exam grades are fractions of the exercises solved.
- `result.isLast` is **not reliable** (many attempts showed `true`). Don't use it.
- `result` can contain a row for something I never started. For anything related to XP, prefer `transaction` over `result`.

### Dates (Verified)
- `createdAt` is ISO 8601 with a timezone (`+00:00`). The platform shows **local time**, so group by month in local time to match it.

### Row limits (Verified at small scale)
- No cap was observed at a few hundred rows. Method: fetch everything with `order_by: { id: asc }` and compare the last `id` with `order_by: { id: desc }, limit: 1`. If they differ, the server truncated the list. Re-check if an account grows into the thousands.
- `transaction` ids are sparse because they're shared across the whole table.

### Program start (Verified)
- `user.createdAt` is the account registration date, not the start of the program.
- The main module is the event whose `object.type` is `"module"`. Its start is `event.startAt` of the earliest matching enrolment in `user.events` (enrolment itself is `createdAt` on that row).
- `event.endAt` on the module is a far-future placeholder: don't display or use it.
- A student still in a piscine has no module enrolment yet: show a dash.

---

## 5. Query recipes for the app

```graphql
# Identity and audit totals (normal)
{ user { id login firstName lastName campus createdAt auditRatio totalUp totalDown } }

# All counted XP rows, with the nested object name and type (nested + arguments)
{
  transaction(
    where: { type: { _eq: "xp" }, path: { _nlike: "%/piscine-%/%" } }
    order_by: { createdAt: asc }
  ) { id amount createdAt path object { name type } }
}

# Current level
{
  transaction(
    where: { type: { _eq: "level" }, path: { _nlike: "%/piscine-%/%" } }
    order_by: { amount: desc }
    limit: 1
  ) { amount path }
}
```

---

## 6. Open questions

- Why a passed project is graded 1.2 and not 1.
- What the `null`-grade row on an exam path means (probably a placeholder before final grading).
- What `isBonus` means in practice.
- Whether skill amounts are capped at 100.
- What the platform shows for XP and level while a student is still in a piscine (the path filter excludes everything inside piscines, so the page shows 0 and a dash).
- Rounding the platform uses for the audit ratio.

---

## 7. Decisions

- **Profile sections:** welcome header, level + XP + audit ratio card, identity card (login, campus, start date), top 5 skills.
- **Graphs:** cumulative XP over time (animated line), XP per month (animated bars, split between piscine completion and everything else), plus optional skills bars and audit up/down bars.
- **Query styles covered:** normal (identity), arguments (XP, level, skills), nested (XP rows with `object { ... }`).