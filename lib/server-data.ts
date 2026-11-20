import { fixtureNews, fixtureObservations, fixtureSources } from "@/lib/data";
import { config } from "@/lib/config";
import { readLiveData } from "@/lib/db/repositories";
import type { NewsItem, Observation, Source } from "@/lib/types";

export interface DashboardData {
  observations: Observation[];
  news: NewsItem[];
  sources: Source[];
  mode: "fixture" | "live";
}

export async function getDashboardData(): Promise<DashboardData> {
  if (config.dataMode === "live") {
    const data = await readLiveData();
    return { ...data, mode: "live" };
  }
  return { observations: fixtureObservations, news: fixtureNews, sources: fixtureSources, mode: "fixture" };
}
