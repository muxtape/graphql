// A reusable function that sends any GraphQL query with the Bearer token.
import { GRAPHQL_URL } from "./config.js";
import { getToken } from "./token.js";
import { logout } from "./session.js";

// An Error that also says WHAT KIND of failure it was.
export class GraphQLRequestError extends Error {
  constructor(kind, message) {
    super(message);
    this.kind = kind; // "auth" | "network" | "timeout" | "query" | "server"
  }
}

// Does this response mean our token is missing, expired or invalid?
function isAuthProblem(status, errors) {
  if (status === 401) {
    return true;
  }
  if (Array.isArray(errors)) {
    return errors.some(
      (e) => e.extensions?.code === "invalid-jwt" || /jwt/i.test(e.message ?? "")
    );
  }
  return false;
}

// Sends a query and returns the "data" part of the answer.
// Throws a GraphQLRequestError on failure.
export async function graphqlRequest(query, variables = {}) {
  const token = getToken();
  if (!token) {
    logout();
    throw new GraphQLRequestError("auth", "No token");
  }

  let response;
  try {
    response = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(15000),
    });
  } catch (error) {
    if (error.name === "TimeoutError") {
      throw new GraphQLRequestError("timeout", error.message);
    }
    throw new GraphQLRequestError("network", error.message);
  }

  // The body may not be valid JSON (for example an HTML error page).
  let body = null;
  try {
    body = await response.json();
  } catch {
    // leave body as null
  }

  // Token rejected: the session is over.
  if (isAuthProblem(response.status, body?.errors)) {
    logout();
    throw new GraphQLRequestError("auth", "Token rejected");
  }

  // GraphQL errors (can arrive with status 200 or 400).
  if (body?.errors) {
    const message = body.errors.map((e) => e.message).join("; ");
    throw new GraphQLRequestError("query", message);
  }

  if (!response.ok || !body || !body.data) {
    throw new GraphQLRequestError("server", `Status ${response.status}`);
  }

  return body.data;
}
