# Notes

## Open-scope features

I added filtering by room type, booking source, status, and guest search. This makes the heatmap useful for front-desk questions like which channels are filling the hotel or whether a room class is tight on a given week. The heatmap recalculates from the filtered booking set, while search also marks matching nights on the calendar.

I also added CSV export for the selected range. Once a user drags across a date span, the details panel can export exactly the overlapping bookings shown there.

The app persists the last viewed month and filters in `localStorage`, so reloading keeps the current operational context.

## Date logic choices

The grid starts on Monday. For hotel operations, grouping weekdays first and weekends at the end makes weekday-versus-weekend occupancy easier to scan. Adjacent-month days are still visible, so the grid remains rectangular and drag selection can cross month boundaries.

Occupancy uses the hotel-night convention: `checkIn` is inclusive and `checkOut` is exclusive. A booking from `2026-02-10` to `2026-02-13` counts on Feb 10, 11, and 12 only. Cancelled bookings are shown in details when they overlap a range, but they never count toward occupancy.

## Trade-offs

I stayed with native `Date` plus `YYYY-MM-DD` string comparisons instead of adding `date-fns`. The mock data is ISO date-only strings, so lexicographic comparison is reliable and keeps the date logic easy to explain.

The UI is desktop-first, as allowed by the brief. It has a responsive fallback, but the main layout is optimized for front-desk scanning on a larger screen.

With more time, I would add a detailed room list for each date. When staff click a day on the calendar, they could see exactly which rooms are available, which rooms are already booked, and which rooms are unavailable due to maintenance. This would make the app more useful for real front-desk workflows like walk-in bookings, room changes, and same-day availability checks.
