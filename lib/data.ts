import observations from "@/data/fixtures/official-observations.json";
import news from "@/data/fixtures/news-items.json";
import sources from "@/data/fixtures/sources.json";
import type { NewsItem, Observation, Source } from "@/lib/types";

export const fixtureObservations = observations as Observation[];
export const fixtureNews = news as NewsItem[];
export const fixtureSources = sources as Source[];

export function getObservations(params?: {
  state?: string;
  level?: string;
  metric?: string;
}) {
  return fixtureObservations.filter((item) => {
    if (params?.state && item.stateCode !== params.state) return false;
    if (params?.level && item.level !== params.level) return false;
    if (params?.metric && item.metric !== params.metric) return false;
    return true;
  });
}
