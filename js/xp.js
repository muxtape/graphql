// Pure functions that turn XP transactions into the shapes the charts need.
// No DOM, no network: data in, data out.
//
// A transaction here is a plain object: { id, amount, date, name, type }
//   amount: number of bytes of XP     date: a Date
//   name:   project/exercise name     type: the object type ("project", "piscine", ...)

// Object type of the rows that give XP for completing a whole piscine.
export const PISCINE_OBJECT_TYPE = "piscine";

const monthLabelFormatter = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  year: "numeric",
});

// Oldest first; the id breaks ties between identical timestamps.
function byDate(a, b) {
  return a.date - b.date || a.id - b.id;
}

// Running total of XP over time: one point per transaction.
// -> [{ date, total, amount, name }]
export function cumulativeXp(transactions) {
  let total = 0;
  return [...transactions].sort(byDate).map((transaction) => {
    total += transaction.amount;
    return {
      date: transaction.date,
      total,
      amount: transaction.amount,
      name: transaction.name,
    };
  });
}

// A number that identifies a calendar month: 2025 January -> 2025*12 + 0.
// Consecutive months have consecutive numbers, which makes gap-filling easy.
function monthIndex(date) {
  return date.getFullYear() * 12 + date.getMonth();
}

// XP per calendar month (local time), split into piscine completions
// and everything else. Months without any XP are included as zeros.
// -> [{ date, label, piscines, other, total }]
export function monthlyXp(transactions) {
  if (transactions.length === 0) {
    return [];
  }

  const buckets = new Map(); // monthIndex -> { piscines, other }
  for (const transaction of transactions) {
    const index = monthIndex(transaction.date);
    const bucket = buckets.get(index) ?? { piscines: 0, other: 0 };

    if (transaction.type === PISCINE_OBJECT_TYPE) {
      bucket.piscines += transaction.amount;
    } else {
      bucket.other += transaction.amount;
    }
    buckets.set(index, bucket);
  }

  const indexes = [...buckets.keys()];
  const first = Math.min(...indexes);
  const last = Math.max(...indexes);

  const months = [];
  for (let index = first; index <= last; index += 1) {
    const date = new Date(Math.floor(index / 12), index % 12, 1);
    const bucket = buckets.get(index) ?? { piscines: 0, other: 0 };
    months.push({
      date,
      label: monthLabelFormatter.format(date),
      piscines: bucket.piscines,
      other: bucket.other,
      total: bucket.piscines + bucket.other,
    });
  }
  return months;
}
