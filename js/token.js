// Token storage. Kept in its own module so any page can import it safely.
// sessionStorage: cleared when the tab closes (safer on shared computers).

const TOKEN_KEY = "jwt";

export function saveToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY); // null if nothing stored
}

export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}
