// Login, logout and token storage.
import { SIGNIN_URL } from "./config.js";

const form = document.getElementById("login-form");

form.addEventListener("submit", (event) => {
  // Stop the browser from reloading the page and putting the fields in the URL.
  event.preventDefault();

  // Temporary: proves the handler works. Never log the password itself.
  console.log("Form submitted. Would send request to:", SIGNIN_URL);
});
