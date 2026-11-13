import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TRACK_EVENTS, errorStatus, trackEvent, tripDays } from "../analytics/pendo";
import { tripsApi, type NewTrip } from "../api/trips";
import { TripForm } from "../components/TripForm";

/** Plans a new trip, then goes back to the trip list. */
export function NewTripPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const createTrip = async (trip: NewTrip) => {
    try {
      setError(null);
      const created = await tripsApi.create(trip);
      // The API saved the new trip; the person goes back to the trip list.
      trackEvent(TRACK_EVENTS.tripCreated, {
        trip_id: created.id,
        travelers: trip.travelers,
        trip_days: tripDays(trip.startDate, trip.endDate),
      });
      navigate("/trips");
    } catch (e) {
      trackEvent(TRACK_EVENTS.tripSaveFailed, { operation: "create", status_code: errorStatus(e) });
      setError((e as Error).message);
    }
  };

  return (
    <>
      <TripForm heading="Plan a trip" submitLabel="Add trip" onSubmit={createTrip} />
      {error && <p className="error">{error}</p>}
    </>
  );
}
