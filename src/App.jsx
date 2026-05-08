import { useEffect, useMemo, useRef, useState } from 'react';
import BookingPanel from './components/BookingPanel.jsx';
import CalendarGrid from './components/CalendarGrid.jsx';
import CalendarHeader from './components/CalendarHeader.jsx';
import FilterBar from './components/FilterBar.jsx';
import StatsStrip from './components/StatsStrip.jsx';
import { useBookings } from './hooks/useBookings.js';
import { useDragSelection } from './hooks/useDragSelection.js';
import {
  addDays,
  buildCalendarGrid,
  formatDate,
  getTodayStr,
  parseYearMonth,
} from './utils/dateUtils.js';
import {
  applyFilters,
  buildOccupancyMap,
  calcNights,
  getBookingsInRange,
} from './utils/occupancyUtils.js';

const DEFAULT_FILTERS = {
  roomTypes: [],
  sources: [],
  statuses: [],
  searchQuery: '',
};

function readStoredMonth() {
  const stored = window.localStorage.getItem('guestara:viewMonth');
  if (!stored || !/^\d{4}-\d{2}$/.test(stored)) return null;
  const [year, month] = stored.split('-').map(Number);
  return { year, month: month - 1 };
}

function readStoredFilters() {
  try {
    return { ...DEFAULT_FILTERS, ...JSON.parse(window.localStorage.getItem('guestara:filters')) };
  } catch {
    return DEFAULT_FILTERS;
  }
}

function getInitialMonth() {
  const stored = readStoredMonth();
  if (stored) return stored;
  return parseYearMonth(getTodayStr());
}

function getUniqueOptions(bookings, key) {
  return [...new Set(bookings.map((booking) => booking[key]))].sort();
}

function createSearchDateSet(bookings, query) {
  const q = query.trim().toLowerCase();
  if (!q) return new Set();

  const dates = new Set();
  for (const booking of bookings) {
    if (!booking.guestName.toLowerCase().includes(q)) continue;
    let current = booking.checkIn;
    while (current < booking.checkOut) {
      dates.add(current);
      current = addDays(current, 1);
    }
  }
  return dates;
}

function downloadCsv(bookings, selection) {
  const rows = [
    ['Guest name', 'Room number', 'Room type', 'Check-in', 'Check-out', 'Nights', 'Status', 'Source', 'Amount'],
    ...bookings.map((booking) => [
      booking.guestName,
      booking.roomNumber,
      booking.roomType,
      booking.checkIn,
      booking.checkOut,
      calcNights(booking.checkIn, booking.checkOut),
      booking.status,
      booking.source,
      booking.totalAmount,
    ]),
  ];
  const csv = rows
    .map((row) =>
      row
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(','),
    )
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `bookings-${selection.start}-to-${selection.end}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function App() {
  const { bookings, loading, error } = useBookings();
  const [viewMonth, setViewMonth] = useState(getInitialMonth);
  const [filters, setFilters] = useState(readStoredFilters);
  const hasStoredMonth = useRef(Boolean(readStoredMonth()));
  const dragSelection = useDragSelection();

  useEffect(() => {
    if (hasStoredMonth.current || loading || bookings.length === 0) return;
    const firstBooking = [...bookings].sort((a, b) => a.checkIn.localeCompare(b.checkIn))[0];
    setViewMonth(parseYearMonth(firstBooking.checkIn));
    hasStoredMonth.current = true;
  }, [bookings, loading]);

  useEffect(() => {
    window.localStorage.setItem(
      'guestara:viewMonth',
      `${viewMonth.year}-${String(viewMonth.month + 1).padStart(2, '0')}`,
    );
  }, [viewMonth]);

  useEffect(() => {
    window.localStorage.setItem('guestara:filters', JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    if (!dragSelection.isDragging) return undefined;
    window.addEventListener('mouseup', dragSelection.onMouseUp);
    return () => window.removeEventListener('mouseup', dragSelection.onMouseUp);
  }, [dragSelection.isDragging, dragSelection.onMouseUp]);

  const filteredBookings = useMemo(() => applyFilters(bookings, filters), [bookings, filters]);
  const occupancyMap = useMemo(
    () => buildOccupancyMap(bookings, filters),
    [bookings, filters],
  );
  const days = useMemo(
    () => buildCalendarGrid(viewMonth.year, viewMonth.month),
    [viewMonth.year, viewMonth.month],
  );
  const selectedBookings = useMemo(() => {
    if (!dragSelection.selection) return [];
    return getBookingsInRange(
      filteredBookings,
      dragSelection.selection.start,
      dragSelection.selection.end,
    ).sort((a, b) => a.checkIn.localeCompare(b.checkIn) || a.roomNumber.localeCompare(b.roomNumber));
  }, [dragSelection.selection, filteredBookings]);

  const options = useMemo(
    () => ({
      roomTypes: getUniqueOptions(bookings, 'roomType'),
      sources: getUniqueOptions(bookings, 'source'),
      statuses: getUniqueOptions(bookings, 'status'),
    }),
    [bookings],
  );
  const searchDateSet = useMemo(
    () => createSearchDateSet(filteredBookings, filters.searchQuery),
    [filteredBookings, filters.searchQuery],
  );

  function changeMonth(offset) {
    setViewMonth((current) => {
      const date = new Date(current.year, current.month + offset, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  }

  function jumpToToday() {
    setViewMonth(parseYearMonth(formatDate(new Date())));
  }

  function toggleFilter(key, value) {
    setFilters((current) => {
      const selected = current[key];
      const next = selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value];
      return { ...current, [key]: next };
    });
  }

  function handleSearch(searchQuery) {
    setFilters((current) => ({ ...current, searchQuery }));
  }

  function clearFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  if (loading) {
    return (
      <div className="center-state">
        <div className="spinner" aria-hidden="true" />
        <p>Loading bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="center-state">
        <h1>Bookings could not load</h1>
        <p>{error}</p>
        <button className="retry-btn" type="button" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <main className="app-container">
      <header className="app-header">
        <div>
          <p className="eyebrow">Guestara front desk</p>
          <h1>Booking Calendar Heatmap</h1>
        </div>
        <div className="room-count">
          <span>10</span>
          rooms
        </div>
      </header>

      <StatsStrip bookings={filteredBookings} year={viewMonth.year} month={viewMonth.month} />

      <div className="main-layout">
        <section className="calendar-section" aria-label="Occupancy calendar">
          <FilterBar
            filters={filters}
            options={options}
            onToggle={toggleFilter}
            onSearch={handleSearch}
            onClear={clearFilters}
          />
          <CalendarHeader
            year={viewMonth.year}
            month={viewMonth.month}
            onPrevious={() => changeMonth(-1)}
            onNext={() => changeMonth(1)}
            onToday={jumpToToday}
          />
          <CalendarGrid
            days={days}
            occupancyMap={occupancyMap}
            bookings={filteredBookings}
            selection={dragSelection.selection}
            searchDateSet={searchDateSet}
            dragHandlers={dragSelection}
          />
        </section>

        <BookingPanel
          selection={dragSelection.selection}
          bookings={selectedBookings}
          onExport={() => downloadCsv(selectedBookings, dragSelection.selection)}
        />
      </div>
    </main>
  );
}
