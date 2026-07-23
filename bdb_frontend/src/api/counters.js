import { api } from "./client";

export async function fetchCounterMappings() {
  const { data } = await api.get("/counter-mappings/");
  return data;
}
