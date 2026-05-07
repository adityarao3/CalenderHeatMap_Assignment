/**
 * Occupancy calculation utilities.
 *
 * KEY RULE: A booking with checkIn "2026-02-10" and checkOut "2026-02-13"
 * occupies the room on nights of Feb 10, 11, 12 — NOT Feb 13.
 * checkIn is inclusive, checkOut is exclusive.
 *
 * Cancelled bookings do NOT count toward occupancy.
 */

const TOTAL_ROOMS = 10;

/**
 * Build a Map<dateStr, number> of occupancy counts for every night.
 * Only non-cancelled bookings count.
 */
export function buildOccupancyMap(bookings, filters = {}) {
  const map = new Map();
  const filtered = applyFilters(bookings, filters);

  for (const booking of filtered) {
    if (booking.status === 'cancelled') continue;

    const start = new Date(booking.checkIn + 'T00:00:00');
    const end = new Date(booking.checkOut + 'T00:00:00');
    const current = new Date(start);

    while (current < end) {
      const key = fmtKey(current);
      map.set(key, (map.get(key) || 0) + 1);
      current.setDate(current.getDate() + 1);
    }
  }
  return map;
}

export function getOccupancyLevel(count) {
  return Math.min(count / TOTAL_ROOMS, 1);
}

/** Heatmap color via CSS custom properties */
export function getHeatmapColor(count) {
  if (count === 0) return 'var(--heat-0)';
  if (count <= 2) return 'var(--heat-1)';
  if (count <= 4) return 'var(--heat-2)';
  if (count <= 6) return 'var(--heat-3)';
  if (count <= 8) return 'var(--heat-4)';
  return 'var(--heat-5)';
}

export function getHeatmapTextColor(count) {
  return count <= 4 ? 'var(--text-on-light)' : 'var(--text-on-dark)';
}

/**
 * Find all bookings overlapping [startStr, endStr].
 * Occupied nights: [checkIn, checkOut) — checkOut exclusive.
 * Overlap: booking.checkIn <= rangeEnd AND booking.checkOut > rangeStart
 */
export function getBookingsInRange(bookings, startStr, endStr) {
  return bookings.filter((b) => b.checkIn <= endStr && b.checkOut > startStr);
}

/** Apply filter criteria */
export function applyFilters(bookings, filters = {}) {
  let result = bookings;
  if (filters.roomTypes?.length) {
    result = result.filter((b) => filters.roomTypes.includes(b.roomType));
  }
  if (filters.sources?.length) {
    result = result.filter((b) => filters.sources.includes(b.source));
  }
  if (filters.statuses?.length) {
    result = result.filter((b) => filters.statuses.includes(b.status));
  }
  if (filters.searchQuery?.trim()) {
    const q = filters.searchQuery.toLowerCase().trim();
    result = result.filter((b) => b.guestName.toLowerCase().includes(q));
  }
  return result;
}

/** Calculate the number of nights from checkIn/checkOut strings */
export function calcNights(checkIn, checkOut) {
  const a = new Date(checkIn + 'T00:00:00');
  const b = new Date(checkOut + 'T00:00:00');
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

/** Monthly stats */
export function calculateMonthStats(bookings, year, month) {
  const dim = new Date(year, month + 1, 0).getDate();
  const ms = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const me = `${year}-${String(month + 1).padStart(2, '0')}-${String(dim).padStart(2, '0')}`;

  const active = bookings.filter(
    (b) => b.status !== 'cancelled' && b.checkIn <= me && b.checkOut > ms
  );
  const totalRevenue = active.reduce((s, b) => s + b.totalAmount, 0);
  const cancelledCount = bookings.filter(
    (b) => b.status === 'cancelled' && b.checkIn <= me && b.checkOut > ms
  ).length;

  const occMap = buildOccupancyMap(bookings);
  let totalOcc = 0;
  for (let d = 1; d <= dim; d++) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    totalOcc += occMap.get(key) || 0;
  }
  const avgOccupancy = totalOcc / dim / TOTAL_ROOMS;

  let longestStay = 0, longestGuest = '';
  for (const b of active) {
    const n = calcNights(b.checkIn, b.checkOut);
    if (n > longestStay) { longestStay = n; longestGuest = b.guestName; }
  }

  const typeCounts = {};
  for (const b of active) typeCounts[b.roomType] = (typeCounts[b.roomType] || 0) + 1;
  const mostBookedType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  return { totalBookings: active.length, totalRevenue, avgOccupancy, longestStay, longestGuest, mostBookedType, cancelledCount };
}

function fmtKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
