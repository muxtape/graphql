// Fetches the data and renders the profile page.
import { requireLogin, logout } from "./session.js";
import { graphqlRequest } from "./graphql.js";
import { getToken } from "./token.js";
import { getUserId } from "./jwt.js";
import { USER_QUERY, STATS_QUERY, NOT_PISCINE_PATH } from "./queries.js";
import { formatDate, formatBytes, formatRatio } from "./format.js";

const app = document.getElementById("app");
const statusMessage = document.getElementById("status-message");
const dashboard = document.getElementById("dashboard");

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

// Returns plain values ready for display: level, xp, auditRatio, up, down.
async function loadStats(userId) {
  const data = await graphqlRequest(STATS_QUERY, {
    userId,
    notPiscine: NOT_PISCINE_PATH,
  });
  const me = data.user[0];

  return {
    level: data.level[0]?.amount ?? null,            // no level row yet -> null
    xp: data.xp.aggregate.sum?.amount ?? 0,          // no XP rows -> sum is null
    auditRatio: me.auditRatio,
    up: me.totalUp,
    down: me.totalDown,
  };
}

// ----- Rendering (puts data on the page) -----

// First and last name when available, otherwise the login.
function displayName(user) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return fullName || user.login;
}

function renderUser(user) {
  document.getElementById("welcome").textContent = `Welcome, ${displayName(user)}`;
  document.getElementById("user-login").textContent = user.login;
  document.getElementById("user-campus").textContent = user.campus ?? "—";

  // The earliest module enrolment, if there is one yet.
  const mainModule = user.events[0];
  document.getElementById("user-started").textContent = formatDate(mainModule?.event?.startAt);
}

function renderStats(stats) {
  document.getElementById("stat-level").textContent = stats.level ?? "—";
  document.getElementById("stat-xp").textContent = formatBytes(stats.xp);
  document.getElementById("stat-audit").textContent = formatRatio(stats.auditRatio);
  document.getElementById("audit-up").textContent = formatBytes(stats.up);
  document.getElementById("audit-down").textContent = formatBytes(stats.down);
}

// ----- Page startup -----

async function start() {
  if (!requireLogin()) {
    return;
  }

  // A token we cannot decode is garbage: start over.
  let userId;
  try {
    userId = getUserId(getToken());
  } catch {
    logout();
    return;
  }

  app.hidden = false;
  showStatus("Loading your data...");

  try {
    // The two requests don't depend on each other: send both at once.
    const [user, stats] = await Promise.all([loadUser(), loadStats(userId)]);

    renderUser(user);
    renderStats(stats);
    dashboard.hidden = false;
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
