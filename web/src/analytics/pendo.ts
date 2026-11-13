import { ApiError } from "../api/client";

// Pendo Track Events. The Pendo agent attaches the visitor and account to every
// event, so the properties here only describe the event itself.

type TrackProperties = Record<string, string | number | boolean>;

declare global {
  interface Window {
    pendo?: { track?: (event: string, properties?: TrackProperties) => void };
  }
}

/** Event names, copied exactly as they are registered in Pendo. */
export const TRACK_EVENTS = {
  signedIn: "Signed in",
  signInFailed: "Sign-in failed",
  assistantReplyReceived: "Assistant reply received",
  assistantReplyFailed: "Assistant reply failed",
  profileSaved: "Profile saved",
  tripCreated: "Trip created",
  tripUpdated: "Trip updated",
  tripRemoved: "Trip removed",
  tripSaveFailed: "Trip save failed",
} as const;

export type TrackEventName = (typeof TRACK_EVENTS)[keyof typeof TRACK_EVENTS];

/** Sends a Track Event to Pendo. Does nothing when the Pendo agent isn't loaded, and never throws. */
export function trackEvent(event: TrackEventName, properties: TrackProperties = {}): void {
  try {
    window.pendo?.track?.(event, properties);
  } catch (e) {
    console.warn(`Pendo track failed for "${event}"`, e);
  }
}

/** The HTTP status of a failed API call, or 0 when the request didn't get a response. */
export function errorStatus(e: unknown): number {
  return e instanceof ApiError ? e.status : 0;
}

/** The number of days a trip spans, counting the first and last day. */
export function tripDays(startDate: string, endDate: string): number {
  const days = Math.round((Date.parse(endDate) - Date.parse(startDate)) / 86_400_000) + 1;
  return Number.isFinite(days) ? days : 0;
}
