export type DeliveryTimeline = "SAME_DAY" | "NEXT_DAY";

export const getDeliveryTimelineForCity = (city: string): DeliveryTimeline => {
  const normalizedCity = city.trim().toLowerCase();

  return normalizedCity.includes("accra") ? "SAME_DAY" : "NEXT_DAY";
};
