// Small helpers for drawing SVG with JavaScript.

export const SVG_NS = "http://www.w3.org/2000/svg";

// Creates an SVG element. A plain document.createElement("rect") would make an
// HTML element that the browser never draws; SVG elements need the SVG namespace.
// attributes: { x: 10, fill: "red" } -> setAttribute for each pair.
// parent (optional): the element to append the new one to.
export function svgEl(tag, attributes = {}, parent = null) {
  const element = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value);
  }
  if (parent) {
    parent.append(element);
  }
  return element;
}

// Returns a function that maps a value in `domain` to a position in `range`.
//   const y = scaleLinear([0, 100], [200, 0]);  y(0) -> 200, y(100) -> 0, y(50) -> 100
// Values can be numbers or Dates (a Date is converted to milliseconds).
export function scaleLinear(domain, range) {
  const [d0, d1] = domain.map(Number);
  const [r0, r1] = range;

  return (value) => {
    if (d0 === d1) {
      return (r0 + r1) / 2; // a single-valued domain: put it in the middle
    }
    return r0 + ((Number(value) - d0) / (d1 - d0)) * (r1 - r0);
  };
}

// Readable axis values from 0 up to a rounded maximum.
//   niceTicks(994800, 5) -> { ticks: [0, 200000, 400000, 600000, 800000, 1000000], max: 1000000 }
// `count` is only a target: the step is rounded to 1, 2, 5 or 10 times a power of ten.
export function niceTicks(max, count = 5) {
  if (!Number.isFinite(max) || max <= 0) {
    return { ticks: [0, 1], max: 1 };
  }

  const roughStep = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalized = roughStep / magnitude; // between 1 and 10

  let niceFactor = 10;
  if (normalized <= 1) {
    niceFactor = 1;
  } else if (normalized <= 2) {
    niceFactor = 2;
  } else if (normalized <= 5) {
    niceFactor = 5;
  }

  const step = niceFactor * magnitude;
  const niceMax = Math.ceil(max / step) * step;

  const ticks = [];
  for (let value = 0; value <= niceMax + step / 2; value += step) {
    ticks.push(Math.round(value * 1e6) / 1e6); // avoid float noise like 0.30000000000000004
  }
  return { ticks, max: niceMax };
}
