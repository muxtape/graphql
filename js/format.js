// Helpers that turn raw values into text for display.

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

// "2024-03-05T09:00:00+00:00" -> "5 March 2024" (in the viewer's time zone).
// Returns a dash when the value is missing or not a valid date.
export function formatDate(isoString) {
  if (!isoString) {
    return "—";
  }
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return dateFormatter.format(date);
}

const BYTE_UNITS = ["B", "kB", "MB", "GB", "TB"];

// 1056100 -> "1.06 MB", 51750 -> "51.8 kB", 350 -> "350 B".
// Units of 1000 with 3 significant digits, like the school platform.
export function formatBytes(bytes) {
  if (bytes === null || bytes === undefined) {
    return "—";
  }
  const number = Number(bytes);
  if (!Number.isFinite(number)) {
    return "—";
  }
  if (number === 0) {
    return "0 B";
  }

  let value = Math.abs(number);
  let unit = 0;
  // Move up a unit when the value is >= 1000, or rounds up to 1000
  // (999.9 would otherwise print as "1.00e+3").
  while (
    (value >= 1000 || Number(value.toPrecision(3)) >= 1000) &&
    unit < BYTE_UNITS.length - 1
  ) {
    value /= 1000;
    unit += 1;
  }

  const sign = number < 0 ? "-" : "";
  return `${sign}${value.toPrecision(3)} ${BYTE_UNITS[unit]}`;
}

// 1.2752836... -> "1.3". Returns a dash when there is no ratio yet.
export function formatRatio(ratio) {
  if (ratio === null || ratio === undefined) {
    return "—";
  }
  const number = Number(ratio);
  return Number.isFinite(number) ? number.toFixed(1) : "—";
}

const SKILL_PREFIX = "skill_";
const SKILL_ACRONYMS = new Set([
  "js", "sql", "css", "html", "tcp", "ai", "ml", "llm", "rag",
  "nlp", "mlops", "cv", "ci", "ga", "php", "sh", "c",
]);
const SKILL_OVERRIDES = { "c-pp": "C++", "c-sharp": "C#", dotnet: ".NET", "no-sql": "NoSQL" };

// "skill_front-end" -> "Front-end", "skill_js" -> "JS", "skill_c-pp" -> "C++".
// Unknown names are simply capitalised.
export function formatSkillName(type) {
  const key = type.startsWith(SKILL_PREFIX) ? type.slice(SKILL_PREFIX.length) : type;
  if (SKILL_OVERRIDES[key]) {
    return SKILL_OVERRIDES[key];
  }
  if (SKILL_ACRONYMS.has(key)) {
    return key.toUpperCase();
  }
  return key.charAt(0).toUpperCase() + key.slice(1);
}
