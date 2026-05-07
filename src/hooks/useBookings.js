import { useState, useEffect } from 'react';

/**
 * Fetches bookings.json from the public folder.
 * Returns { bookings, loading, error }.
 */
export function useBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchBookings() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/bookings.json');

        if (!response.ok) {
          throw new Error(`Failed to load bookings: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!cancelled) {
          setBookings(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    fetchBookings();

    return () => {
      cancelled = true;
    };
  }, []);

  return { bookings, loading, error };
}
