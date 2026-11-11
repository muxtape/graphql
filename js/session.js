// Session helpers shared by the pages: guards and logout.
import { getToken, clearToken } from "./token.js";

const LOGIN_PAGE = "index.html";
const PROFILE_PAGE = "profile.html";

// For pages that need a login. Returns true if a token exists.
// If not, sends the visitor to the login page and returns false.
export function requireLogin() {
  if (getToken()) {
    return true;
  }
  window.location.replace(LOGIN_PAGE);
  return false;
}

// For the login page: if already logged in, skip straight to the profile.
export function redirectIfLoggedIn() {
  if (getToken()) {
    window.location.replace(PROFILE_PAGE);
  }
}

// Forget the token and go back to the login page.
export function logout() {
  clearToken();
  window.location.replace(LOGIN_PAGE);
}
