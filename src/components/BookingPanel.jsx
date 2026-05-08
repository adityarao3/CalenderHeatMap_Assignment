import { calcNights } from '../utils/occupancyUtils';
import { formatDateDisplay } from '../utils/dateUtils';

function statusLabel(status) {
  return status.replaceAll('_', ' ');
}

function formatCurrency(amount, currency) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function selectionLabel(selection) {
  if (!selection) return 'No dates selected';
  if (selection.start === selection.end) return formatDateDisplay(selection.start);
  return `${formatDateDisplay(selection.start)} to ${formatDateDisplay(selection.end)}`;
}

export default function BookingPanel({ selection, bookings, onExport }) {
  return (
    <aside className="booking-panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Booking Details</h2>
          <p className="panel-subtitle">{selectionLabel(selection)}</p>
        </div>
        <button
          className="export-btn"
          type="button"
          onClick={onExport}
          disabled={!selection || !bookings.length}
        >
          CSV
        </button>
      </div>

      <div className="panel-body">
        {!selection ? (
          <div className="panel-empty">
            <div className="panel-empty-icon" aria-hidden="true">
              []
            </div>
            <p className="panel-empty-text">Select a day or drag across the calendar.</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="panel-empty">
            <div className="panel-empty-icon" aria-hidden="true">
              --
            </div>
            <p className="panel-empty-text">No bookings overlap this selection.</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <article className="booking-card" key={booking.id}>
              <div className="booking-card-header">
                <div>
                  <h3 className="guest-name">{booking.guestName}</h3>
                  <p className="booking-id">{booking.id}</p>
                </div>
                <span className={`booking-status ${booking.status}`}>
                  {statusLabel(booking.status)}
                </span>
              </div>

              <dl className="booking-details">
                <div className="booking-detail">
                  <dt>Room</dt>
                  <dd>
                    {booking.roomNumber} - {booking.roomType}
                  </dd>
                </div>
                <div className="booking-detail">
                  <dt>Nights</dt>
                  <dd>{calcNights(booking.checkIn, booking.checkOut)}</dd>
                </div>
                <div className="booking-detail">
                  <dt>Check-in</dt>
                  <dd>{formatDateDisplay(booking.checkIn)}</dd>
                </div>
                <div className="booking-detail">
                  <dt>Check-out</dt>
                  <dd>{formatDateDisplay(booking.checkOut)}</dd>
                </div>
              </dl>

              <div className="booking-card-footer">
                <span className="booking-amount">
                  {formatCurrency(booking.totalAmount, booking.currency)}
                </span>
                <span className="booking-source">{booking.source}</span>
              </div>
            </article>
          ))
        )}
      </div>
    </aside>
  );
}
