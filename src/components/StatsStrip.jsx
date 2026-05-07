import { useMemo } from 'react';
import { calculateMonthStats } from '../utils/occupancyUtils';

export default function StatsStrip({ bookings, year, month }) {
  const stats = useMemo(
    () => calculateMonthStats(bookings, year, month),
    [bookings, year, month]
  );

  const fmtCurrency = (n) =>
    '₹' + n.toLocaleString('en-IN');

  const fmtPct = (n) => Math.round(n * 100) + '%';

  return (
    <div className="stats-strip">
      <div className="stat-card">
        <div className="stat-label">Total Bookings</div>
        <div className="stat-value">{stats.totalBookings}</div>
        <div className="stat-sub">{stats.cancelledCount} cancelled</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Revenue</div>
        <div className="stat-value revenue">{fmtCurrency(stats.totalRevenue)}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Avg Occupancy</div>
        <div className="stat-value occupancy">{fmtPct(stats.avgOccupancy)}</div>
        <div className="stat-sub">of 10 rooms</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Longest Stay</div>
        <div className="stat-value nights">{stats.longestStay} nights</div>
        <div className="stat-sub">{stats.longestGuest}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Most Booked Type</div>
        <div className="stat-value type">{stats.mostBookedType}</div>
      </div>
    </div>
  );
}
