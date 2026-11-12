// Fetches the data and renders the profile page.
import { requireLogin, logout } from "./session.js";
import { graphqlRequest } from "./graphql.js";
import { getToken } from "./token.js";
import { getUserId } from "./jwt.js";

const app = document.getElementById("app");

async function start() {
  // Not logged in: requireLogin() redirects, and we stop here.
  if (!requireLogin()) {
    return;
  }

  let userId;
  try {
    userId = getUserId(getToken());
  } catch {
    logout(); // the stored token is garbage: start over
    return;
  }

  app.hidden = false; // token present: reveal the page  
  console.log("User ID from token:", userId);
  
  // Temporary test, replaced in Task 2.3.
  try {
    const data = await graphqlRequest("{ user { id login } }");
    console.log("GraphQL data:", data);
  } catch (error) {
    console.log(`GraphQL failed (${error.kind}):`, error.message);
  }
}

start();

// When the browser restores this page from its back/forward cache,
// no script runs again, so re-check the login state ourselves.
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    if (!requireLogin()) {
      app.hidden = true;
    }
  }
});

document.getElementById("logout-button").addEventListener("click", logout);
