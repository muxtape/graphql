// Login, logout and token storage.
import { SIGNIN_URL } from "./config.js";

// Base64-encode text safely, including non-Latin characters (e.g. Greek).
function toBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

// Sends the credentials to the school server and returns the JWT string.
// Throws an Error if the server rejects them or cannot be reached.
async function signin(identifier, password) {
  const credentials = toBase64(`${identifier}:${password}`);

  const response = await fetch(SIGNIN_URL, {
    method: "POST",
    headers: { Authorization: `Basic ${credentials}` },
  });

  // fetch only fails on network problems. A 401 still "succeeds", so check it.
  if (!response.ok) {
    throw new Error(`Signin failed with status ${response.status}`);
  }

  // The token may arrive wrapped in quotes; strip them if present.
  const body = await response.text();
  return body.trim().replace(/^"|"$/g, "");
}

const form = document.getElementById("login-form");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const identifier = form.elements.identifier.value.trim();
  const password = form.elements.password.value;
  const button = form.querySelector("button[type='submit']");

  button.disabled = true; // prevent double submissions while waiting

  try {
    const token = await signin(identifier, password);

    // Temporary checks. Never print the full token or the password.
    console.log("Signin OK. Token received, parts:", token.split(".").length);
  } catch (error) {
    console.log("Signin problem:", error.message);
  } finally {
    button.disabled = false;
  }
});
