// Fetches the data and renders the profile page.
import { requireLogin, logout } from "./session.js";
import { graphqlRequest } from "./graphql.js";
import { getToken } from "./token.js";
import { getUserId } from "./jwt.js";
import { USER_QUERY } from "./queries.js";

const app = document.getElementById("app");
const statusMessage = document.getElementById("status-message");
const identitySection = document.getElementById("identity");

// What the user sees when loading fails. ("auth" is not listed: the
// graphqlRequest helper already logs the user out and redirects.)
const ERROR_MESSAGES = {
  network: "Could not reach the school server. Check your connection and try again.",
  timeout: "The server took too long to respond. Please try again.",
  query: "The server could not process the request.",
  server: "The server had a problem. Please try again later.",
};

function showStatus(message) {
  statusMessage.textContent = message;
  statusMessage.hidden = false;
}

function hideStatus() {
  statusMessage.hidden = true;
}

// ----- Data loading (talks to the server) -----

async function loadUser() {
  const data = await graphqlRequest(USER_QUERY);
  return data.user[0]; // the "user" table returns an array with just you
}

// ----- Rendering (puts data on the page) -----

function renderUser(user) {
  document.getElementById("user-login").textContent = user.login;
  document.getElementById("user-id").textContent = user.id;
  identitySection.hidden = false;
}

// ----- Page startup -----

async function start() {
  if (!requireLogin()) {
    return;
  }

  // A token we cannot decode is garbage: start over.
  let userId;
  try {
    userId = getUserId(getToken()); // will be used by later queries
  } catch {
    logout();
    return;
  }

  app.hidden = false;
  showStatus("Loading your data...");

  try {
    const user = await loadUser();
    renderUser(user);
    hideStatus();
  } catch (error) {
    if (error.kind === "auth") {
      return; // already being redirected to the login page
    }
    showStatus(ERROR_MESSAGES[error.kind] ?? "Something unexpected went wrong.");
    console.error(error);
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
