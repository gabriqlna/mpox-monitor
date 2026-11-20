import { fixtureNews, fixtureObservations } from "@/lib/data";
import { config } from "@/lib/config";
import { fetchOfficialObservations, SOURCE_ID, SOURCE_URL } from "@/lib/ingestion/official-source";
import { persistIngestion } from "@/lib/db/repositories";
import type { Source } from "@/lib/types";

export interface IngestionResult {
  observations: number;
  news: number;
  collectedAt: string;
  status: "success";
}

export async function runIngestion(): Promise<IngestionResult> {
  const startedAt = new Date().toISOString();
  const observations = config.dataMode === "live" ? await fetchOfficialObservations() : fixtureObservations;
  const news = config.dataMode === "live" ? [] : fixtureNews;
  if (config.dataMode === "live") {
    const source: Source = { id: SOURCE_ID, name: "Ministério da Saúde · e-SUS Sinan/Mpox", kind: "official", status: "active", url: SOURCE_URL, lastSuccessAt: startedAt };
    await persistIngestion(source, observations, news, startedAt);
  }
  const result = {
    observations: observations.length,
    news: news.length,
    collectedAt: new Date().toISOString(),
    status: "success" as const,
  };
  console.log(JSON.stringify(result));
  return result;
}
