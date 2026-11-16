// SVG statistic graphs. Each function takes plain data and a container element.
import { svgEl, scaleLinear, niceTicks } from "./svg.js";
import { formatBytes } from "./format.js";

const WIDTH = 680;
const HEIGHT = 300;
// Space around the plot area. The left margin must be wider than the longest
// y-axis label (e.g. "1.20 MB"), or the label gets clipped by the SVG's edge.
const MARGIN = { top: 12, right: 16, bottom: 30, left: 60 };

// Points closer than this many SVG units (horizontally) count as one spot when hovering.
const CLUSTER_PX = 3;

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
    `to ${formatBytes(last.total)} on ${dayLabel.format(last.date)}. ` +
    "Use the arrow keys to browse the transactions.";

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

  addXpHover({
    container,
    svg,
    series,
    x,
    y,
    plot: { left: MARGIN.left, right: plotRight, top: MARGIN.top, bottom: plotBottom },
  });
}

function clamp(value, low, high) {
  return Math.min(Math.max(value, low), high);
}

function tooltipLine(className, text) {
  const line = document.createElement("div");
  line.className = className;
  line.textContent = text;
  return line;
}

// Adds the hover behaviour to the XP line chart: a guide line, a highlighted dot
// and a tooltip. Works with mouse, touch (pointer events) and the keyboard.
function addXpHover({ container, svg, series, x, y, plot }) {
  const xs = series.map((point) => x(point.date));

  // Created once; the "is-active" class on the svg shows them (see CSS).
  const guide = svgEl("line", { class: "chart-hover chart-guide", y1: plot.top, y2: plot.bottom }, svg);
  const marker = svgEl("circle", { class: "chart-hover chart-dot-active", r: 6 }, svg);

  // A transparent rectangle over the plot area catches the pointer. It must come last
  // so it sits on top of everything else.
  const overlay = svgEl(
    "rect",
    {
      class: "chart-overlay",
      x: plot.left,
      y: plot.top,
      width: plot.right - plot.left,
      height: plot.bottom - plot.top,
    },
    svg
  );

  container.classList.add("chart-wrap");
  const tip = document.createElement("div");
  tip.className = "chart-tooltip";
  tip.setAttribute("aria-live", "off");
  container.append(tip);

  svg.setAttribute("tabindex", "0");
  let keyIndex = null; // the point being browsed with the keyboard

  function nearestIndex(svgX) {
    let best = 0;
    for (let index = 1; index < xs.length; index += 1) {
      if (Math.abs(xs[index] - svgX) < Math.abs(xs[best] - svgX)) {
        best = index;
      }
    }
    return best;
  }

  // All the points that sit on top of each other around `index`: [first, last].
  function clusterAround(index) {
    let low = index;
    let high = index;
    while (low > 0 && xs[index] - xs[low - 1] < CLUSTER_PX) {
      low -= 1;
    }
    while (high < xs.length - 1 && xs[high + 1] - xs[index] < CLUSTER_PX) {
      high += 1;
    }
    return [low, high];
  }

  function hide() {
    keyIndex = null;
    svg.classList.remove("is-active");
    tip.classList.remove("is-visible");
  }

  // Shows the guide, the highlighted dot and the tooltip for series[low..high].
  function show(low, high) {
    const lastPoint = series[high];
    const gained = series.slice(low, high + 1).reduce((sum, point) => sum + point.amount, 0);
    const title = low === high ? lastPoint.name : `${high - low + 1} transactions`;

    const px = xs[high];
    const py = y(lastPoint.total);

    guide.setAttribute("x1", px);
    guide.setAttribute("x2", px);
    marker.setAttribute("cx", px);
    marker.setAttribute("cy", py);
    svg.classList.add("is-active");

    tip.replaceChildren(
      tooltipLine("chart-tooltip-date", dayLabel.format(lastPoint.date)),
      tooltipLine("chart-tooltip-title", title),
      tooltipLine("chart-tooltip-line", `+${formatBytes(gained)}`),
      tooltipLine("chart-tooltip-line", `Total ${formatBytes(lastPoint.total)}`)
    );

    // Position in screen pixels, relative to the container. Measured after the content is set.
    const scale = svg.getBoundingClientRect().width / WIDTH;
    const width = tip.offsetWidth;
    const height = tip.offsetHeight;
    const left = clamp(px * scale - width / 2, 0, container.clientWidth - width);
    let top = py * scale - height - 12;
    if (top < 0) {
      top = py * scale + 14; // no room above: show it below the point
    }
    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
    tip.classList.add("is-visible");
  }

  function onPointer(event) {
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0) {
      return;
    }
    const svgX = ((event.clientX - rect.left) / rect.width) * WIDTH;
    const [low, high] = clusterAround(nearestIndex(svgX));
    keyIndex = null;
    tip.setAttribute("aria-live", "off");
    show(low, high);
  }

  overlay.addEventListener("pointermove", onPointer);
  overlay.addEventListener("pointerdown", onPointer);
  overlay.addEventListener("pointerleave", (event) => {
    // A finger leaves the overlay the moment it is lifted; keep the tooltip then.
    if (event.pointerType === "mouse") {
      hide();
    }
  });
  overlay.addEventListener("pointercancel", hide);

  svg.addEventListener("keydown", (event) => {
    const last = series.length - 1;
    let next = null;

    if (event.key === "ArrowRight") {
      next = keyIndex === null ? 0 : Math.min(keyIndex + 1, last);
    } else if (event.key === "ArrowLeft") {
      next = keyIndex === null ? last : Math.max(keyIndex - 1, 0);
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = last;
    } else if (event.key === "Escape") {
      hide();
      return;
    } else {
      return;
    }

    event.preventDefault(); // keep the arrow keys from scrolling the page
    keyIndex = next;
    tip.setAttribute("aria-live", "polite"); // announce changes to screen readers
    show(next, next);
  });
  svg.addEventListener("blur", hide);
}
