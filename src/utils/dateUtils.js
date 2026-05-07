/**
 * Pure date utility functions — no external libraries.
 * All date math uses native Date objects.
 */

/**
 * Returns a new Date set to midnight local time for the given year/month/day.
 */
export function createDate(year, month, day) {
  return new Date(year, month, day);
}

/**
 * Get the number of days in a given month (0-indexed month).
 */
export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Get the day-of-week (0=Sun … 6=Sat) for the 1st of the given month.
 */
export function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

/**
 * Build the 6×7 (or 5×7) grid of day-objects for a calendar month view.
 * Each object: { date: Date, day: number, isCurrentMonth: boolean, dateStr: 'YYYY-MM-DD' }
 * Week starts on Monday (ISO standard, common in hotel industry).
 */
export function buildCalendarGrid(year, month) {
  const days = [];
  const daysInMonth = getDaysInMonth(year, month);

  // getDay(): 0=Sun. We want Monday=0, so shift: (getDay()+6)%7
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7;

  // Previous month padding
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const date = new Date(prevYear, prevMonth, day);
    days.push({
      date,
      day,
      isCurrentMonth: false,
      dateStr: formatDate(date),
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    days.push({
      date,
      day: d,
      isCurrentMonth: true,
      dateStr: formatDate(date),
    });
  }

  // Next month padding — fill to complete the last row
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  let d = 1;
  while (days.length % 7 !== 0) {
    const date = new Date(nextYear, nextMonth, d);
    days.push({
      date,
      day: d,
      isCurrentMonth: false,
      dateStr: formatDate(date),
    });
    d++;
  }

  return days;
}

/**
 * Format a Date to 'YYYY-MM-DD' string.
 */
export function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Format a date string to a human-readable format: "Mon DD, YYYY"
 */
export function formatDateDisplay(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Get month name and year label: "May 2026"
 */
export function getMonthLabel(year, month) {
  const date = new Date(year, month, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/**
 * Check if two date strings represent the same calendar date.
 */
export function isSameDate(a, b) {
  return a === b;
}

/**
 * Check if a dateStr falls within [startStr, endStr] inclusive.
 */
export function isDateInRange(dateStr, startStr, endStr) {
  return dateStr >= startStr && dateStr <= endStr;
}

/**
 * Returns today's date as 'YYYY-MM-DD'.
 */
export function getTodayStr() {
  return formatDate(new Date());
}

/**
 * Parse 'YYYY-MM-DD' → { year, month (0-indexed) }
 */
export function parseYearMonth(dateStr) {
  const [y, m] = dateStr.split('-').map(Number);
  return { year: y, month: m - 1 };
}

/**
 * Add days to a date string, return new date string.
 */
export function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return formatDate(d);
}
