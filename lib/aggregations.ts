import type { Observation, StateSummary } from "@/lib/types";

export function totalCases(observations: Observation[]) {
  return observations
    .filter((item) => item.metric === "cases" && item.level === "state" && item.status === "confirmed")
    .reduce((total, item) => total + item.value, 0);
}

export function stateSummaries(observations: Observation[]): StateSummary[] {
  return observations
    .filter((item) => item.level === "state" && item.metric === "cases")
    .map((item) => ({ stateCode: item.stateCode, name: item.locationName, value: item.value }))
    .sort((a, b) => b.value - a.value);
}

export function latestCollection(observations: Observation[]) {
  return observations.reduce<string | null>((latest, item) => {
    if (!latest || item.collectedAt > latest) return item.collectedAt;
    return latest;
  }, null);
}

export function uniqueStates(observations: Observation[]) {
  return new Set(observations.filter((item) => item.level === "state").map((item) => item.stateCode)).size;
}
