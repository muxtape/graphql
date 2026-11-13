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
