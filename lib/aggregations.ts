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

export const STATE_TO_REGION: Record<string, string> = {
  SP: "Sudeste", RJ: "Sudeste", MG: "Sudeste", ES: "Sudeste",
  PR: "Sul", SC: "Sul", RS: "Sul",
  BA: "Nordeste", PE: "Nordeste", CE: "Nordeste", MA: "Nordeste", PB: "Nordeste", RN: "Nordeste", AL: "Nordeste", SE: "Nordeste", PI: "Nordeste",
  GO: "Centro-Oeste", MT: "Centro-Oeste", MS: "Centro-Oeste", DF: "Centro-Oeste",
  AM: "Norte", PA: "Norte", RO: "Norte", TO: "Norte", AC: "Norte", AP: "Norte", RR: "Norte",
};

export interface RegionalSummary {
  region: string;
  cases: number;
  percentage: number;
  statesCount: number;
}

export function regionalSummaries(observations: Observation[]): RegionalSummary[] {
  const states = stateSummaries(observations);
  const total = totalCases(observations);

  const regionMap: Record<string, { cases: number; statesCount: number }> = {
    Sudeste: { cases: 0, statesCount: 0 },
    Nordeste: { cases: 0, statesCount: 0 },
    Sul: { cases: 0, statesCount: 0 },
    "Centro-Oeste": { cases: 0, statesCount: 0 },
    Norte: { cases: 0, statesCount: 0 },
  };

  for (const st of states) {
    const reg = STATE_TO_REGION[st.stateCode] ?? "Outros";
    if (!regionMap[reg]) regionMap[reg] = { cases: 0, statesCount: 0 };
    regionMap[reg].cases += st.value;
    if (st.value > 0) {
      regionMap[reg].statesCount += 1;
    }
  }

  return Object.entries(regionMap)
    .map(([region, data]) => ({
      region,
      cases: data.cases,
      statesCount: data.statesCount,
      percentage: total > 0 ? (data.cases / total) * 100 : 0,
    }))
    .sort((a, b) => b.cases - a.cases);
}

export function uniqueMunicipalitiesCount(observations: Observation[]) {
  return new Set(
    observations
      .filter((item) => item.level === "municipality" && item.value > 0)
      .map((item) => item.locationCode)
  ).size;
}

