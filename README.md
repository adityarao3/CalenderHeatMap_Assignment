# Guestara Booking Calendar Heatmap

A working single-page React + Vite app for visualizing hotel occupancy in a month-view calendar. The app loads mock booking data from `public/bookings.json`, calculates occupied rooms per night, and lets front-desk users inspect bookings by dragging across calendar dates.

## Features

- Monthly occupancy heatmap with Previous, Next, and Today navigation.
- Drag selection across one or more calendar days, including adjacent-month cells.
- Booking details panel for the selected date range.
- Filters for room type, booking source, and booking status.
- Guest-name search that highlights matching occupied nights.
- CSV export for bookings in the selected range.
- Last viewed month and filters persisted in `localStorage`.

## Tech Stack

- React
- Vite
- JavaScript/JSX source files
- TypeScript compiler checking with `allowJs`

## Project Setup

Install Node.js first. Node 20 or newer is recommended.

Clone the repository and move into the project folder:

```bash
git clone <repo-url>
cd BookingCalender
```

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Open the URL printed by Vite in your terminal. It is usually:

```text
http://localhost:5173/
```

## Build

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Data

The app reads bookings from:

```text
public/bookings.json
```

Each booking includes guest, room, date, status, source, and amount fields. The occupancy calculation treats `checkIn` as inclusive and `checkOut` as exclusive, which matches normal hotel-night logic.

## Notes

See `NOTES.md` for the open-scope features chosen, why they were added, trade-offs made, and what could be improved with more time.
