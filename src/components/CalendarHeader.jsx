import { getMonthLabel } from '../utils/dateUtils';

export default function CalendarHeader({ year, month, onPrevious, onNext, onToday }) {
  return (
    <div className="calendar-header">
      <div>
        <h2 className="month-label">{getMonthLabel(year, month)}</h2>
        <p className="month-note">Monday-first grid for operational weekday scanning.</p>
      </div>
      <div className="month-nav" aria-label="Month navigation">
        <button className="nav-btn" type="button" onClick={onPrevious} aria-label="Previous month">
          <span aria-hidden="true">&lt;</span>
        </button>
        <button className="today-btn" type="button" onClick={onToday}>
          Today
        </button>
        <button className="nav-btn" type="button" onClick={onNext} aria-label="Next month">
          <span aria-hidden="true">&gt;</span>
        </button>
      </div>
    </div>
  );
}
