/**
 * Parse a "yyyy-MM-dd" string into a UTC Date object.
 */
export function parseDateString(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/**
 * Given a UTC Date, return a Prisma-compatible date range for that single day.
 * Useful for querying records on a specific date when the DB stores @db.Date.
 */
export function dayRange(dateObj: Date) {
  const y = dateObj.getUTCFullYear();
  const m = dateObj.getUTCMonth();
  const d = dateObj.getUTCDate();
  return {
    gte: new Date(Date.UTC(y, m, d)),
    lt: new Date(Date.UTC(y, m, d + 1)),
  };
}
