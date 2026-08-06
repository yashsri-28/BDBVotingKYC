import { api } from "./client";

/**
 * Resolves a raw reader credential_no into the Access Card Number
 * that manual_search / ballot allotment search already understand.
 * Returns null if no member is linked to this credential.
 */
export async function resolveCredential(credentialNo) {
  try {
    const { data } = await api.get("/kyc/resolve-credential/", {
      params: { credential_no: credentialNo },
    });
    return data.access_card_number;
  } catch {
    return null; // 404 = not found, treat as no match
  }
}