import { fixtureNews, fixtureObservations } from "@/lib/data";

export interface IngestionResult {
  observations: number;
  news: number;
  collectedAt: string;
  status: "success";
}

export async function runIngestion(): Promise<IngestionResult> {
  const result = {
    observations: fixtureObservations.length,
    news: fixtureNews.length,
    collectedAt: new Date().toISOString(),
    status: "success" as const,
  };
  console.log(JSON.stringify(result));
  return result;
}
