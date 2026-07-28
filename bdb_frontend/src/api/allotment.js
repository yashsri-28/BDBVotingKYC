import { api } from "./client";

export async function searchAccessCard(accessCardNumber) {
  const { data } = await api.post("/ballots/allotment/search/", {
    access_card_number: accessCardNumber,
  });
  return data;
}

export async function allotCustomerCodes(accessCardNumber, customerCodes) {
  const { data } = await api.post("/ballots/allotment/allot/", {
    access_card_number: accessCardNumber,
    customer_codes: customerCodes,
  });
  return data;
}
