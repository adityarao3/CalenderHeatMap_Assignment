import { useState } from 'react';
import {
  formatDateDisplay,
  getTodayStr,
  isDateInRange,
  isSameDate,
} from '../utils/dateUtils';
import {
  getBookingsInRange,
  getHeatmapColor,
  getHeatmapTextColor,
} from '../utils/occupancyUtils';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function statusLabel(status) {
  return status.replaceAll('_', ' ');
}

export default function CalendarGrid({
  days,
  occupancyMap,
  bookings,
  selection,
  searchDateSet,
  dragHandlers,
}) {
  const [hoveredDate, setHoveredDate] = useState(null);
  const today = getTodayStr();
  const hoveredBookings = hoveredDate
    ? getBookingsInRange(bookings, hoveredDate, hoveredDate)
    : [];
  const hoveredCount = hoveredDate ? occupancyMap.get(hoveredDate) || 0 : 0;

  return (
    <div className="calendar-grid-wrapper">
      <div className="weekday-row">
        {WEEKDAYS.map((day) => (
          <div className="weekday-label" key={day}>
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid" onMouseLeave={() => setHoveredDate(null)}>
        {days.map((day) => {
          const count = occupancyMap.get(day.dateStr) || 0;
          const selected =
            selection && isDateInRange(day.dateStr, selection.start, selection.end);
          const isSearchMatch = searchDateSet.has(day.dateStr);
          const className = [
            'day-cell',
            day.isCurrentMonth ? '' : 'other-month',
            isSameDate(day.dateStr, today) ? 'today' : '',
            selected ? 'selected' : '',
            selection && isSameDate(day.dateStr, selection.start) ? 'range-start' : '',
            selection && isSameDate(day.dateStr, selection.end) ? 'range-end' : '',
            isSearchMatch ? 'search-match' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <button
              className={className}
              type="button"
              key={day.dateStr}
              style={{
                backgroundColor: getHeatmapColor(count),
                color: getHeatmapTextColor(count),
              }}
              onMouseDown={(event) => {
                if (event.button !== 0) return;
                event.preventDefault();
                dragHandlers.onMouseDown(day.dateStr);
              }}
              onMouseEnter={() => {
                setHoveredDate(day.dateStr);
                dragHandlers.onMouseEnter(day.dateStr);
              }}
              onMouseUp={dragHandlers.onMouseUp}
              aria-label={`${formatDateDisplay(day.dateStr)}, ${count} of 10 rooms occupied`}
            >
              <span className="day-number">{day.day}</span>
              <span className="day-occupancy">{count}/10</span>
            </button>
          );
        })}
      </div>

      <div className="heatmap-legend" aria-label="Occupancy heatmap legend">
        <span className="legend-label">Empty</span>
        <span className="legend-scale" aria-hidden="true">
          {[0, 2, 4, 6, 8, 10].map((count) => (
            <span
              className="legend-swatch"
              key={count}
              style={{ backgroundColor: getHeatmapColor(count) }}
            />
          ))}
        </span>
        <span className="legend-label">Full</span>
      </div>

      <div className="hover-preview" aria-live="polite">
        {hoveredDate ? (
          <>
            <div>
              <strong>{formatDateDisplay(hoveredDate)}</strong>
              <span>{hoveredCount} of 10 rooms occupied</span>
            </div>
            <div className="hover-bookings">
              {hoveredBookings.length ? (
                hoveredBookings.slice(0, 4).map((booking) => (
                  <span className={`hover-pill ${booking.status}`} key={booking.id}>
                    {booking.roomNumber} {booking.guestName} ({statusLabel(booking.status)})
                  </span>
                ))
              ) : (
                <span className="hover-empty">No bookings for this night</span>
              )}
              {hoveredBookings.length > 4 ? (
                <span className="hover-empty">+{hoveredBookings.length - 4} more</span>
              ) : null}
            </div>
          </>
        ) : (
          <>
            <div>
              <strong>Hover a date</strong>
              <span>Quick occupancy and booking summary appears here.</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
