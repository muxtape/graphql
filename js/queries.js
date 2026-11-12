// All GraphQL query strings, kept in one place.

// Basic identification of the logged-in user.
export const USER_QUERY = `
  {
    user {
      id
      login
    }
  }
`;
