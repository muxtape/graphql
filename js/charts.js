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

// How long the line takes to draw itself, in seconds.
const DRAW_SECONDS = 2.8;

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
    return { replay() {} };
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

  drawYAxis(svg, ticks, y, plotRight);

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
  // While building it we also add up its length, and note how far along it
  // each dot sits (needed for the draw-in animation).
  let path = `M${x(first.date)},${y(0)}`;
  let length = 0;
  let previousX = x(first.date);
  let previousY = y(0);
  const reached = []; // path length at which each dot is reached
  for (const point of series) {
    const px = x(point.date);
    const py = y(point.total);
    path += `H${px}V${py}`;
    length += Math.abs(px - previousX) + Math.abs(previousY - py);
    reached.push(length);
    previousX = px;
    previousY = py;
  }
  svgEl("path", { class: "chart-line", d: path }, svg);

  // One dot per XP transaction.
  const dots = series.map((point) =>
    svgEl("circle", { class: "chart-dot", cx: x(point.date), cy: y(point.total), r: 3.5 }, svg)
  );

  const replay = setUpDrawAnimation({ svg, dots, reached, length });

  addXpHover({
    container,
    svg,
    series,
    x,
    y,
    plot: { left: MARGIN.left, right: plotRight, top: MARGIN.top, bottom: plotBottom },
  });

  return { replay };
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

    placeTooltip(container, svg, tip, px, py);
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

// Sets up the draw-in animation of the XP line chart (the CSS does the animating).
// Returns a function that plays it again.
function setUpDrawAnimation({ svg, dots, reached, length }) {
  const total = length || 1;

  // Read by the CSS. The "+ 2" keeps the round line cap from leaving a speck at the start.
  svg.style.setProperty("--length", String(total + 2));
  svg.style.setProperty("--duration", `${DRAW_SECONDS}s`);

  // Each dot appears when the line reaches it.
  dots.forEach((dot, index) => {
    dot.style.setProperty("--delay", `${(reached[index] / total) * DRAW_SECONDS}s`);
  });

  // The last dot finishes last; remove the animation classes then, so the chart
  // returns to its normal, fully drawn state.
  function stop() {
    svg.classList.remove("is-animating", "is-playing");
  }
  dots[dots.length - 1].addEventListener("animationend", stop);

  let observer = null;

  function replay() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    stop();
    if (prefersReducedMotion()) {
      return;
    }
    void svg.getBoundingClientRect(); // forces a layout, so the animation restarts from the beginning
    svg.classList.add("is-animating", "is-playing");
  }

  if (!prefersReducedMotion()) {
    // "is-animating" hides the line and dots (and holds the animation paused);
    // "is-playing" starts it once the chart is on screen.
    svg.classList.add("is-animating");
    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          svg.classList.add("is-playing");
          observer.disconnect();
          observer = null;
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(svg);
  }

  return replay;
}

// Horizontal gridlines with y-axis labels, shared by the charts.
function drawYAxis(svg, ticks, y, plotRight) {
  for (const tick of ticks) {
    svgEl("line", { class: "chart-grid", x1: MARGIN.left, x2: plotRight, y1: y(tick), y2: y(tick) }, svg);
    const label = svgEl(
      "text",
      { class: "chart-axis-label", x: MARGIN.left - 8, y: y(tick) + 4, "text-anchor": "end" },
      svg
    );
    label.textContent = tick === 0 ? "0" : formatBytes(tick);
  }
}

// ----- Monthly XP bars -----

// What each key shows. "segments" are drawn bottom to top.
const MONTHLY_VIEWS = {
  all: { name: "all XP", segments: ["projects", "piscines"], empty: "No XP earned yet." },
  projects: { name: "projects and exercises", segments: ["projects"], empty: "No project or exercise XP yet." },
  piscines: { name: "piscines", segments: ["piscines"], empty: "No piscine XP yet." },
};

// Which field of a month (from monthlyXp in xp.js) feeds each segment.
const SEGMENT_FIELD = { projects: "other", piscines: "piscines" };

const BAR_MAX_WIDTH = 24;
const BAR_GAP = 2; // space between stacked segments, in SVG units
const BAR_MIN_HEIGHT = 2; // so a small, non-zero month stays visible

// Draws the monthly XP bar chart into `container`.
// months: [{ date, piscines, other, total }] (the output of monthlyXp in xp.js).
// Returns { setView(name) } where name is "all", "projects" or "piscines".
export function renderMonthlyChart(container, months) {
  function draw(viewName, initial) {
    const view = MONTHLY_VIEWS[viewName] ?? MONTHLY_VIEWS.all;
    container.replaceChildren();

    // The XP of a month that this view shows.
    const visibleTotal = (month) =>
      view.segments.reduce((sum, segment) => sum + month[SEGMENT_FIELD[segment]], 0);

    let peak = months[0];
    for (const month of months) {
      if (visibleTotal(month) > visibleTotal(peak)) {
        peak = month;
      }
    }

    if (months.length === 0 || visibleTotal(peak) <= 0) {
      const message = document.createElement("p");
      message.className = "stat-note";
      message.textContent = view.empty;
      container.append(message);
      return;
    }

    // The scale fits the visible data, so small months stay readable.
    const { ticks, max } = niceTicks(visibleTotal(peak), 5);
    const plotRight = WIDTH - MARGIN.right;
    const plotBottom = HEIGHT - MARGIN.bottom;
    const y = scaleLinear([0, max], [plotBottom, MARGIN.top]);

    const band = (plotRight - MARGIN.left) / months.length; // horizontal space per month
    const barWidth = Math.min(BAR_MAX_WIDTH, band * 0.7);

    const svg = svgEl(
      "svg",
      {
        viewBox: `0 0 ${WIDTH} ${HEIGHT}`,
        class: "chart-frame",
        role: "img",
        "aria-labelledby": "xp-month-title xp-month-desc",
      },
      container
    );
    svgEl("title", { id: "xp-month-title" }, svg).textContent = `XP per month: ${view.name}`;
    svgEl("desc", { id: "xp-month-desc" }, svg).textContent =
      `${months.length} months. Highest month: ${formatBytes(visibleTotal(peak))} in ${monthLabel.format(peak.date)}. ` +
      "Use the arrow keys to browse the months.";

    drawYAxis(svg, ticks, y, plotRight);

    // X-axis labels; skip some when there are too many months to fit.
    const maxLabels = Math.max(1, Math.floor((plotRight - MARGIN.left) / 40));
    const every = Math.ceil(months.length / maxLabels);
    months.forEach((month, index) => {
      if (index % every !== 0) {
        return;
      }
      const label = svgEl(
        "text",
        {
          class: "chart-axis-label",
          x: MARGIN.left + band * (index + 0.5),
          y: HEIGHT - 8,
          "text-anchor": "middle",
        },
        svg
      );
      label.textContent = monthLabel.format(month.date);
    });

     // A faint band behind the bars highlights the hovered month.
    const bandRect = svgEl(
      "rect",
      { class: "chart-hover chart-band", x: MARGIN.left, y: MARGIN.top, width: band, height: plotBottom - MARGIN.top },
      svg
    );

    // The bars: each month is a group of segments, bottom to top.
    // The group is what the animation scales, so the whole stack rises as one.
    months.forEach((month, index) => {
      const left = MARGIN.left + band * (index + 0.5) - barWidth / 2;
      const group = svgEl("g", { class: "chart-bar-group", style: `--i: ${index}` }, svg);
      let below = 0; // the value already stacked underneath

      for (const segment of view.segments) {
        const value = month[SEGMENT_FIELD[segment]];
        if (value <= 0) {
          continue;
        }

        const top = y(below + value);
        const bottom = y(below);
        const gap = below > 0 ? BAR_GAP : 0; // carved from this segment, so the bar's top stays exact
        const height = Math.max(bottom - top - gap, BAR_MIN_HEIGHT);

        svgEl(
          "rect",
          {
            class: `chart-bar chart-bar-${segment}`,
            x: left,
            y: bottom - gap - height,
            width: barWidth,
            height,
            rx: 3,
          },
          group
        );
        below += value;
      }
    });

    // "is-animating" hides the bars and holds the animation paused; "is-playing" starts it.
    if (!prefersReducedMotion()) {
      svg.classList.add("is-animating");
      if (initial) {
        playWhenVisible(svg); // the first draw: wait until the chart is on screen
      } else {
        svg.classList.add("is-playing"); // the user just picked a key: play now
      }
    }

    addMonthlyHover({
      container,
      svg,
      months,
      view,
      visibleTotal,
      y,
      band,
      bandRect,
      plot: { left: MARGIN.left, right: plotRight, top: MARGIN.top, bottom: plotBottom },
    });
  }

  draw("all", true);
  return { setView: (viewName) => draw(viewName, false) };
}

// ----- Helpers shared by the charts' tooltips and animations -----

const monthLongLabel = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });

const SEGMENT_LABEL = { projects: "Projects and exercises", piscines: "Piscines" };

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Adds "is-playing" to the svg the first time at least 40% of it is on screen.
function playWhenVisible(svg) {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        svg.classList.add("is-playing");
        observer.disconnect();
      }
    },
    { threshold: 0.4 }
  );
  observer.observe(svg);
}

// Puts the tooltip above the point (px, py) given in SVG units, flips it below when there
// is no room, and keeps it inside the container horizontally.
function placeTooltip(container, svg, tip, px, py) {
  const scale = svg.getBoundingClientRect().width / WIDTH; // SVG units -> screen pixels
  const width = tip.offsetWidth;
  const height = tip.offsetHeight;
  const left = clamp(px * scale - width / 2, 0, container.clientWidth - width);
  let top = py * scale - height - 12;
  if (top < 0) {
    top = py * scale + 14;
  }
  tip.style.left = `${left}px`;
  tip.style.top = `${top}px`;
  tip.classList.add("is-visible");
}

// A tooltip row with a small color swatch for one category.
function tooltipRow(segment, text) {
  const row = document.createElement("div");
  row.className = "chart-tooltip-row";

  const swatch = document.createElement("i");
  swatch.className = `legend-swatch legend-${segment}`;

  const label = document.createElement("span");
  label.textContent = text;

  row.append(swatch, label);
  return row;
}

// Hover, touch and keyboard behaviour of the monthly chart: a highlighted column
// and a tooltip for the month under the pointer.
function addMonthlyHover({ container, svg, months, view, visibleTotal, y, band, bandRect, plot }) {
  container.classList.add("chart-wrap");
  const tip = document.createElement("div");
  tip.className = "chart-tooltip";
  tip.setAttribute("aria-live", "off");
  container.append(tip);

  // A transparent rectangle over the plot area catches the pointer. It comes last, on top.
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

  svg.setAttribute("tabindex", "0");
  let keyIndex = null;

  function hide() {
    keyIndex = null;
    svg.classList.remove("is-active");
    tip.classList.remove("is-visible");
  }

  function show(index) {
    const month = months[index];
    const total = visibleTotal(month);

    bandRect.setAttribute("x", plot.left + band * index);
    svg.classList.add("is-active");

    const rows = [tooltipLine("chart-tooltip-title", monthLongLabel.format(month.date))];
    if (total <= 0) {
      rows.push(tooltipLine("chart-tooltip-line", "No XP"));
    } else {
      for (const segment of view.segments) {
        rows.push(tooltipRow(segment, `${SEGMENT_LABEL[segment]}: ${formatBytes(month[SEGMENT_FIELD[segment]])}`));
      }
      if (view.segments.length > 1) {
        rows.push(tooltipLine("chart-tooltip-line", `Total: ${formatBytes(total)}`));
      }
    }
    tip.replaceChildren(...rows);

    placeTooltip(container, svg, tip, plot.left + band * (index + 0.5), y(total));
  }

  function onPointer(event) {
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0) {
      return;
    }
    const svgX = ((event.clientX - rect.left) / rect.width) * WIDTH;
    const index = clamp(Math.floor((svgX - plot.left) / band), 0, months.length - 1);
    keyIndex = null;
    tip.setAttribute("aria-live", "off");
    show(index);
  }

  overlay.addEventListener("pointermove", onPointer);
  overlay.addEventListener("pointerdown", onPointer);
  overlay.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "mouse") {
      hide();
    }
  });
  overlay.addEventListener("pointercancel", hide);

  svg.addEventListener("keydown", (event) => {
    const last = months.length - 1;
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

    event.preventDefault();
    keyIndex = next;
    tip.setAttribute("aria-live", "polite");
    show(next);
  });
  svg.addEventListener("blur", hide);
}

// ----- Horizontal bars (skills, audits) -----

const HBAR = { width: 680, rowHeight: 34, barHeight: 14, top: 6, left: 90, right: 70, minWidth: 2 };
const HBAR_LABEL_MAX = 12; // characters before a label is shortened

function showMessage(container, text) {
  container.replaceChildren();
  const message = document.createElement("p");
  message.className = "stat-note";
  message.textContent = text;
  container.append(message);
}

// Draws rows of horizontal bars into `container`.
// rows: [{ label, value, valueText, className }]. The scale runs from 0 to `max` (> 0).
// `id` makes the title and description ids unique on the page.
function renderHorizontalBars(container, { rows, max, id, title, description }) {
  container.replaceChildren();

  const height = HBAR.top * 2 + rows.length * HBAR.rowHeight;
  const plotRight = HBAR.width - HBAR.right;
  const x = scaleLinear([0, max], [HBAR.left, plotRight]);

  const svg = svgEl(
    "svg",
    {
      viewBox: `0 0 ${HBAR.width} ${height}`,
      class: "chart-frame",
      role: "img",
      "aria-labelledby": `${id}-title ${id}-desc`,
    },
    container
  );
  svgEl("title", { id: `${id}-title` }, svg).textContent = title;
  svgEl("desc", { id: `${id}-desc` }, svg).textContent = description;

  rows.forEach((row, index) => {
    const centerY = HBAR.top + HBAR.rowHeight * (index + 0.5);
    const barY = centerY - HBAR.barHeight / 2;

    // Shortened label; the full text stays available as a hover title.
    const shown =
      row.label.length > HBAR_LABEL_MAX ? `${row.label.slice(0, HBAR_LABEL_MAX - 1)}…` : row.label;
    const label = svgEl(
      "text",
      { class: "chart-hbar-label", x: HBAR.left - 10, y: centerY + 4, "text-anchor": "end" },
      svg
    );
    label.textContent = shown;
    if (shown !== row.label) {
      svgEl("title", {}, label).textContent = row.label;
    }

    // The gray track marks the full length of the scale.
    svgEl(
      "rect",
      { class: "chart-hbar-track", x: HBAR.left, y: barY, width: plotRight - HBAR.left, height: HBAR.barHeight, rx: 3 },
      svg
    );

    // A value of 0 draws no bar. Values above the maximum stop at the end of the track.
    const shownValue = Math.min(Math.max(row.value, 0), max);
    if (shownValue > 0) {
      svgEl(
        "rect",
        {
          class: `chart-hbar ${row.className}`,
          x: HBAR.left,
          y: barY,
          width: Math.max(x(shownValue) - HBAR.left, HBAR.minWidth),
          height: HBAR.barHeight,
          rx: 3,
          style: `--i: ${index}`,
        },
        svg
      );
    }

    const value = svgEl(
      "text",
      { class: "chart-hbar-value", x: plotRight + 10, y: centerY + 4 },
      svg
    );
    value.textContent = row.valueText;
  });

  if (!prefersReducedMotion()) {
    svg.classList.add("is-animating");
    playWhenVisible(svg);
  }
}

// Top skills as bars on a fixed 0 to 100 scale.
// skills: [{ name, amount }], highest first (the output of loadTopSkills).
export function renderSkillsChart(container, skills) {
  if (skills.length === 0) {
    showMessage(container, "No skills yet.");
    return;
  }

  renderHorizontalBars(container, {
    rows: skills.map((skill) => ({
      label: skill.name,
      value: skill.amount,
      valueText: `${skill.amount}%`,
      className: "chart-hbar-skill",
    })),
    max: 100,
    id: "skills-svg",
    title: "Top skills",
    description: `${skills.map((skill) => `${skill.name} ${skill.amount}%`).join(", ")}.`,
  });
}

// Audits done and received, compared on one scale.
// `up` and `down` are the totals from the user table (bytes of XP); null counts as 0.
export function renderAuditChart(container, up, down) {
  const done = Number(up) || 0;
  const received = Number(down) || 0;
  const max = Math.max(done, received);

  if (max <= 0) {
    showMessage(container, "No audits yet.");
    return;
  }

  renderHorizontalBars(container, {
    rows: [
      { label: "Done", value: done, valueText: formatBytes(done), className: "chart-hbar-done" },
      { label: "Received", value: received, valueText: formatBytes(received), className: "chart-hbar-received" },
    ],
    max,
    id: "audit-svg",
    title: "Audits done and received",
    description: `Done ${formatBytes(done)}, received ${formatBytes(received)}.`,
  });
}