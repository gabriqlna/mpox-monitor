import { fixtureNews, fixtureObservations, fixtureSources } from "@/lib/data";
import { config } from "@/lib/config";
import { fetchOfficialObservations, SOURCE_ID, SOURCE_URL } from "@/lib/ingestion/official-source";
import type { NewsItem, Observation, Source } from "@/lib/types";

export interface DashboardData {
  observations: Observation[];
  news: NewsItem[];
  sources: Source[];
  mode: "fixture" | "live";
}

export async function getDashboardData(): Promise<DashboardData> {
  if (config.dataMode === "live") {
    const observations = await fetchOfficialObservations();
    const now = new Date().toISOString();
    return {
      observations,
      news: [],
      sources: [{ id: SOURCE_ID, name: "Ministério da Saúde · e-SUS Sinan/Mpox", kind: "official", status: "active", url: SOURCE_URL, lastSuccessAt: now }],
      mode: "live",
    };
  }
  return { observations: fixtureObservations, news: fixtureNews, sources: fixtureSources, mode: "fixture" };
}
