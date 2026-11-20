import { fixtureNews, fixtureObservations } from "@/lib/data";
import { config } from "@/lib/config";
import { fetchOfficialObservations } from "@/lib/ingestion/official-source";

export interface IngestionResult {
  observations: number;
  news: number;
  collectedAt: string;
  status: "success";
}

export async function runIngestion(): Promise<IngestionResult> {
  const observations = config.dataMode === "live" ? await fetchOfficialObservations() : fixtureObservations;
  const news = config.dataMode === "live" ? [] : fixtureNews;
  const result = {
    observations: observations.length,
    news: news.length,
    collectedAt: new Date().toISOString(),
    status: "success" as const,
  };
  console.log(JSON.stringify(result));
  return result;
}
