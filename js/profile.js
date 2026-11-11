// Fetches the data and renders the profile page.
import { requireLogin, logout } from "./session.js";

const app = document.getElementById("app");

function start() {
  // Not logged in: requireLogin() redirects, and we stop here.
  if (!requireLogin()) {
    return;
  }

  app.hidden = false; // token present: reveal the page
  // Task 2 onwards: load and render the data here.
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
