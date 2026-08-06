import { api } from "./client";

/**
 * Fetches recent card taps for a given counter device, most recent first.
 * Used by CounterSearch.jsx to auto-trigger a search when a new scan
 * comes in from this counter's physical reader.
 */
export async function getLatestTaps(deviceId, minutes = 1) {
  const { data } = await api.get("/sipass/latest-taps/", {
    params: { minutes, device_id: deviceId },
  });
  return data; // [{ access_card_number, reader_name, timestamp }, ...]
}