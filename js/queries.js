// All GraphQL query strings, kept in one place.

// Identity of the logged-in user, plus the start of their main module
// (the earliest enrolment in an event whose object type is "module").
export const USER_QUERY = `
  {
    user {
      id
      login
      firstName
      lastName
      campus
      createdAt
      events(
        where: { event: { object: { type: { _eq: "module" } } } }
        order_by: { createdAt: asc }
        limit: 1
      ) {
        createdAt
        event {
          path
          startAt
        }
      }
    }
  }
`;

// Paths INSIDE a piscine (e.g. "/campus/piscine-go/quest-01/x") don't count towards
// the platform's XP or level. The rows for the piscine itself do. See docs/data-notes.md.
export const NOT_PISCINE_PATH = "%/piscine-%/%";

// Audit totals, platform XP and current level in a single request.
// Variables: $userId (Int), $notPiscine (String, a LIKE pattern).
export const STATS_QUERY = `
  query ($userId: Int!, $notPiscine: String!) {
    user {
      auditRatio
      totalUp
      totalDown
    }
    xp: transaction_aggregate(
      where: {
        userId: { _eq: $userId }
        type: { _eq: "xp" }
        path: { _nlike: $notPiscine }
      }
    ) {
      aggregate {
        sum { amount }
      }
    }
    level: transaction(
      where: {
        userId: { _eq: $userId }
        type: { _eq: "level" }
        path: { _nlike: $notPiscine }
      }
      order_by: { amount: desc }
      limit: 1
    ) {
      amount
    }
  }
`;

// Skill transactions have the type "skill_<name>".
// (In a LIKE pattern "_" matches any one character; harmless here.)
export const SKILL_PATTERN = "skill_%";

// One row per skill type, keeping the highest amount (the current level of that skill).
// distinct_on requires its column to come first in order_by.
export const SKILLS_QUERY = `
  query ($userId: Int!, $skillPattern: String!) {
    transaction(
      where: { userId: { _eq: $userId }, type: { _like: $skillPattern } }
      distinct_on: type
      order_by: [{ type: asc }, { amount: desc }]
    ) {
      type
      amount
    }
  }
`;
