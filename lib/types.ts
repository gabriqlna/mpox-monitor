export type LocationLevel = "state" | "municipality";
export type ObservationStatus = "confirmed" | "suspected" | "discarded";
export type SourceKind = "official" | "news" | "fixture";

export interface Observation {
  id: string;
  locationCode: string;
  locationName: string;
  stateCode: string;
  level: LocationLevel;
  referenceDate: string;
  metric: string;
  status: ObservationStatus;
  value: number;
  sourceId: string;
  sourcePublishedAt: string;
  collectedAt: string;
}

export interface NewsItem {
  id: string;
  title: string;
  publisher: string;
  url: string;
  publishedAt: string;
  collectedAt: string;
  summary: string;
  verificationStatus: "unconfirmed" | "official-context";
  sourceId: string;
}

export interface Source {
  id: string;
  name: string;
  kind: SourceKind;
  status: "demo" | "active" | "error";
  url: string;
  lastSuccessAt: string;
}

export interface StateSummary {
  stateCode: string;
  name: string;
  value: number;
}
