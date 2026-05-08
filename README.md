# Guestara Booking Calendar Heatmap

A single-page React app for visualizing hotel occupancy across a month-view calendar. It loads `public/bookings.json` with `fetch`, renders occupied room counts per night, and supports drag selection for booking details.

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite. In this workspace the dev server is running at:

```text
http://127.0.0.1:5173/
```

## Build

```bash
npm run build
```

## What to try

- Use Previous, Next, and Today to move between months.
- Drag forward or backward across calendar cells to select a date range.
- Drag into the dimmed adjacent-month cells to select across month boundaries.
- Filter by room type, source, or status.
- Search a guest name to narrow results and mark matching booking nights.
- Export the selected booking list as CSV from the details panel.
