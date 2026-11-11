// Login, logout and token storage.
import { SIGNIN_URL } from "./config.js";

// ----- Error handling -----

// An Error that also says WHAT KIND of failure it was.
class SigninError extends Error {
  constructor(kind, message) {
    super(message);
    this.kind = kind; // "credentials" | "network" | "server"
  }
}

// What the user sees for each kind of failure.
const ERROR_MESSAGES = {
  credentials: "Invalid username/email or password.",
  network: "Could not reach the school server. Check your connection and try again.",
  server: "The server had a problem. Please try again later.",
};

// ----- Signin request -----

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
// Throws a SigninError describing what went wrong.
async function signin(identifier, password) {
  const credentials = toBase64(`${identifier}:${password}`);

  let response;
  try {
    response = await fetch(SIGNIN_URL, {
      method: "POST",
      headers: { Authorization: `Basic ${credentials}` },
    });
  } catch (error) {
    // fetch throws only when no response could be obtained at all.
    throw new SigninError("network", error.message);
  }

  // The server answers 401 or 403 for bad credentials (we saw both).
  if (response.status === 401 || response.status === 403) {
    throw new SigninError("credentials", `Status ${response.status}`);
  }

  // Anything else that is not a success is unexpected.
  if (!response.ok) {
    throw new SigninError("server", `Status ${response.status}`);
  }

  // The token may arrive wrapped in quotes; strip them if present.
  const body = await response.text();
  return body.trim().replace(/^"|"$/g, "");
}

// ----- Page behaviour -----

const form = document.getElementById("login-form");
const errorElement = document.getElementById("error-message");
const submitButton = form.querySelector("button[type='submit']");

function showError(message) {
  errorElement.textContent = message;
  errorElement.hidden = false;
}

function clearError() {
  errorElement.textContent = "";
  errorElement.hidden = true;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearError();

  const identifier = form.elements.identifier.value.trim();
  const password = form.elements.password.value;

  submitButton.disabled = true;
  submitButton.textContent = "Signing in...";

  try {
    const token = await signin(identifier, password);

    // Temporary: Task 1.4 will store the token and redirect.
    console.log("Signin OK. Token received, parts:", token.split(".").length);
  } catch (error) {
    if (error instanceof SigninError) {
      showError(ERROR_MESSAGES[error.kind]);
      console.log(`Signin failed (${error.kind}):`, error.message);

      if (error.kind === "credentials") {
        form.elements.password.value = "";
        form.elements.password.focus();
      }
    } else {
      // A bug in our own code. Don't blame the user's credentials.
      showError("Something unexpected went wrong.");
      console.error(error);
    }
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Sign in";
  }
});
