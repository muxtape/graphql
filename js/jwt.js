// Reading the contents of a JWT. We do NOT verify the signature here:
// only the server can do that, and it does so on every request.

// Decode base64url text (the JWT variant of base64) into a normal string.
function decodeBase64Url(text) {
  // 1. Convert base64url back to standard base64.
  let base64 = text.replace(/-/g, "+").replace(/_/g, "/");

  // 2. Restore the "=" padding so the length is a multiple of 4.
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }

  // 3. base64 -> "binary string" -> bytes -> UTF-8 text.
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

// Returns the payload (the claims) of a token as an object.
// Throws an Error if the token is malformed.
export function parseJwt(token) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Malformed token");
  }
  return JSON.parse(decodeBase64Url(parts[1]));
}

// The platform's user ID, read from the token's claims.
// The ID is stored as text in the claims, so we convert it to a number.
export function getUserId(token) {
  const claims = parseJwt(token);
  const hasuraClaims = claims["https://hasura.io/jwt/claims"];
  const id = hasuraClaims?.["x-hasura-user-id"] ?? claims.sub;
  return Number(id);
}