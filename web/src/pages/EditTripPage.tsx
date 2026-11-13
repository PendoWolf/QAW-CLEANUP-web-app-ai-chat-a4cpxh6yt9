import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { TRACK_EVENTS, errorStatus, trackEvent, tripDays } from "../analytics/pendo";
import { tripsApi, type NewTrip, type Trip } from "../api/trips";
import { TripForm } from "../components/TripForm";

/** Edits an existing trip's destination, dates and travelers, then goes back to the trip list. */
export function EditTripPage() {
  const { tripId = "" } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    tripsApi
      .get(tripId)
      .then(setTrip)
      .catch((e: Error) => {
        trackEvent(TRACK_EVENTS.tripSaveFailed, {
          operation: "load",
          trip_id: tripId,
          status_code: errorStatus(e),
        });
        setError(e.message);
      });
  }, [tripId]);

  const saveTrip = async (changes: NewTrip) => {
    try {
      setError(null);
      await tripsApi.update(tripId, changes);
      // The API saved the trip changes; the person goes back to the trip list.
      trackEvent(TRACK_EVENTS.tripUpdated, {
        trip_id: tripId,
        travelers: changes.travelers,
        trip_days: tripDays(changes.startDate, changes.endDate),
        destination_changed: trip !== null && changes.destination !== trip.destination,
        dates_changed:
          trip !== null && (changes.startDate !== trip.startDate || changes.endDate !== trip.endDate),
      });
      navigate("/trips");
    } catch (e) {
      trackEvent(TRACK_EVENTS.tripSaveFailed, {
        operation: "update",
        trip_id: tripId,
        status_code: errorStatus(e),
      });
      setError((e as Error).message);
    }
  };

  if (error && !trip) {
    return (
      <p className="error">
        {error} <Link to="/trips">Back to your trips</Link>
      </p>
    );
  }
  if (!trip) {
    return <p>Loading trip…</p>;
  }
  return (
    <>
      <TripForm
        heading={`Edit ${trip.destination}`}
        submitLabel="Save changes"
        initialTrip={trip}
        onSubmit={saveTrip}
      />
      {error && <p className="error">{error}</p>}
    </>
  );
}
