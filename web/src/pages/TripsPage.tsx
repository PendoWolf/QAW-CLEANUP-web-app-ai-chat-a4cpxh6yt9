import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TRACK_EVENTS, errorStatus, trackEvent, tripDays } from "../analytics/pendo";
import { tripsApi, type Trip } from "../api/trips";
import { TripList } from "../components/TripList";

/** The signed-in user's trips. */
export function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    tripsApi
      .list()
      .then(setTrips)
      .catch((e: Error) => setError(e.message));
  }, []);

  const removeTrip = async (trip: Trip) => {
    try {
      setError(null);
      await tripsApi.remove(trip.id);
      setTrips((current) => current.filter((t) => t.id !== trip.id));
      // The API deleted the trip and it no longer shows in the list.
      trackEvent(TRACK_EVENTS.tripRemoved, {
        trip_id: trip.id,
        travelers: trip.travelers,
        trip_days: tripDays(trip.startDate, trip.endDate),
      });
    } catch (e) {
      trackEvent(TRACK_EVENTS.tripSaveFailed, {
        operation: "remove",
        trip_id: trip.id,
        status_code: errorStatus(e),
      });
      setError((e as Error).message);
    }
  };

  return (
    <section aria-labelledby="trips-heading">
      <div className="section-header">
        <h2 id="trips-heading">Your trips</h2>
        <Link className="button" to="/trips/new">
          Plan a trip
        </Link>
      </div>
      <TripList trips={trips} onRemove={removeTrip} />
      {error && <p className="error">{error}</p>}
    </section>
  );
}
