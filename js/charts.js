// SVG statistic graphs. Each function takes plain data and a container element.
import { svgEl, scaleLinear, niceTicks } from "./svg.js";
import { formatBytes } from "./format.js";

const WIDTH = 680;
const HEIGHT = 300;
// Space around the plot area. The left margin must be wider than the longest
// y-axis label (e.g. "1.20 MB"), or the label gets clipped by the SVG's edge.
const MARGIN = { top: 12, right: 16, bottom: 30, left: 60 };

const monthLabel = new Intl.DateTimeFormat("en-GB", { month: "short", year: "2-digit" });
const dayLabel = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

// The first day of each month that falls inside (first, last], thinned out
// so there are at most `maxLabels` of them.
function monthTicks(first, last, maxLabels = 6) {
  const starts = [];
  let cursor = new Date(first.getFullYear(), first.getMonth() + 1, 1);
  while (cursor <= last) {
    starts.push(cursor);
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }
  const every = Math.max(1, Math.ceil(starts.length / maxLabels));
  return starts.filter((_, index) => index % every === 0);
}

// Draws the cumulative XP step chart into `container`.
// series: [{ date: Date, total: number, amount: number, name: string }], oldest first
// (the output of cumulativeXp in xp.js).
export function renderXpLineChart(container, series) {
  container.replaceChildren();

  if (series.length === 0) {
    const message = document.createElement("p");
    message.className = "stat-note";
    message.textContent = "No XP earned yet.";
    container.append(message);
    return;
  }

  const first = series[0];
  const last = series[series.length - 1];

  const { ticks, max } = niceTicks(last.total, 6);
  const plotRight = WIDTH - MARGIN.right;
  const plotBottom = HEIGHT - MARGIN.bottom;
  const x = scaleLinear([first.date, last.date], [MARGIN.left, plotRight]);
  const y = scaleLinear([0, max], [plotBottom, MARGIN.top]); // reversed: SVG's y grows downward

  const svg = svgEl(
    "svg",
    {
      viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
      class: "chart-frame",
      role: "img",
      "aria-labelledby": "xp-line-title xp-line-desc",
    },
    container
  );

  // Text alternative for screen readers.
  svgEl("title", { id: "xp-line-title" }, svg).textContent = "XP over time";
  svgEl("desc", { id: "xp-line-desc" }, svg).textContent =
    `Cumulative XP grew from ${formatBytes(first.total)} on ${dayLabel.format(first.date)} ` +
    `to ${formatBytes(last.total)} on ${dayLabel.format(last.date)}.`;

  // Horizontal gridlines with y-axis labels.
  for (const tick of ticks) {
    svgEl("line", { class: "chart-grid", x1: MARGIN.left, x2: plotRight, y1: y(tick), y2: y(tick) }, svg);
    const label = svgEl(
      "text",
      { class: "chart-axis-label", x: MARGIN.left - 8, y: y(tick) + 4, "text-anchor": "end" },
      svg
    );
    label.textContent = tick === 0 ? "0" : formatBytes(tick);
  }

  // X-axis labels at month starts (or the single date when the data is under a month).
  const monthDates = monthTicks(first.date, last.date);
  const xLabels =
    monthDates.length > 0
      ? monthDates.map((date) => ({ date, text: monthLabel.format(date) }))
      : [{ date: first.date, text: dayLabel.format(first.date) }];

  for (const { date, text } of xLabels) {
    const label = svgEl(
      "text",
      { class: "chart-axis-label", x: x(date), y: HEIGHT - 8, "text-anchor": "middle" },
      svg
    );
    label.textContent = text;
  }

  // The step line: stay flat until the date, then jump up to the new total.
  let path = `M${x(first.date)},${y(0)}`;
  for (const point of series) {
    path += `H${x(point.date)}V${y(point.total)}`;
  }
  svgEl("path", { class: "chart-line", d: path }, svg);

  // One dot per XP transaction.
  for (const point of series) {
    svgEl("circle", { class: "chart-dot", cx: x(point.date), cy: y(point.total), r: 3.5 }, svg);
  }
}
