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
