import type { NewsItem, Observation, Source } from "@/lib/types";
import { getSupabaseAdmin } from "@/lib/db/client";

function sourceRow(source: Source) {
  return { id: source.id, name: source.name, kind: source.kind, url: source.url, status: source.status, last_success_at: source.lastSuccessAt };
}

function observationRow(item: Observation) {
  return {
    id: item.id,
    source_id: item.sourceId,
    location_code: item.locationCode,
    location_name: item.locationName,
    state_code: item.stateCode,
    location_level: item.level,
    reference_date: item.referenceDate,
    metric: item.metric,
    case_status: item.status,
    value: item.value,
    source_published_at: item.sourcePublishedAt,
    collected_at: item.collectedAt,
  };
}

function toObservation(row: Record<string, unknown>): Observation {
  return {
    id: String(row.id), locationCode: String(row.location_code), locationName: String(row.location_name), stateCode: String(row.state_code),
    level: row.location_level as Observation["level"], referenceDate: String(row.reference_date), metric: String(row.metric), status: row.case_status as Observation["status"],
    value: Number(row.value), sourceId: String(row.source_id), sourcePublishedAt: String(row.source_published_at), collectedAt: String(row.collected_at),
  };
}

function toSource(row: Record<string, unknown>): Source {
  return { id: String(row.id), name: String(row.name), kind: row.kind as Source["kind"], status: row.status as Source["status"], url: String(row.url), lastSuccessAt: String(row.last_success_at) };
}

export async function persistIngestion(source: Source, observations: Observation[], news: NewsItem[], startedAt: string) {
  const db = getSupabaseAdmin();
  const { error: sourceError } = await db.from("sources").upsert(sourceRow(source));
  if (sourceError) throw sourceError;
  const { error: observationError } = await db.from("observations").upsert(observations.map(observationRow), { onConflict: "id" });
  if (observationError) throw observationError;
  if (news.length) {
    const { error: newsError } = await db.from("news_items").upsert(news.map((item) => ({ id: item.id, source_id: item.sourceId, title: item.title, publisher: item.publisher, url: item.url, summary: item.summary, published_at: item.publishedAt, collected_at: item.collectedAt, verification_status: item.verificationStatus })), { onConflict: "id" });
    if (newsError) throw newsError;
  }
  const { error: runError } = await db.from("ingestion_runs").insert({ source_id: source.id, started_at: startedAt, finished_at: new Date().toISOString(), status: "success", records_seen: observations.length + news.length, records_inserted: observations.length + news.length });
  if (runError) throw runError;
}

export async function readLiveData() {
  const db = getSupabaseAdmin();
  const [observations, sources, news] = await Promise.all([
    db.from("observations").select("*").order("reference_date", { ascending: false }).limit(10000),
    db.from("sources").select("*").order("name"),
    db.from("news_items").select("*").order("published_at", { ascending: false }).limit(100),
  ]);
  if (observations.error) throw observations.error;
  if (sources.error) throw sources.error;
  if (news.error) throw news.error;
  return { observations: observations.data.map(toObservation), sources: sources.data.map(toSource), news: news.data as NewsItem[] };
}
