import AdmZip from "adm-zip";
import { parse } from "csv-parse/sync";
import type { Observation } from "@/lib/types";

const SOURCE_ID = "ms-esus-sinan-mpox";
const SOURCE_URL = "https://s3.sa-east-1.amazonaws.com/ckan.saude.gov.br/mpox/csv/MPX_2026_OPENDATASUS.csv.zip";
const COLLECTED_AT = new Date().toISOString();

const stateNames: Record<string, string> = {
  AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas", BA: "Bahia", CE: "Ceará", DF: "Distrito Federal", ES: "Espírito Santo", GO: "Goiás", MA: "Maranhão", MT: "Mato Grosso", MS: "Mato Grosso do Sul", MG: "Minas Gerais", PA: "Pará", PB: "Paraíba", PR: "Paraná", PE: "Pernambuco", PI: "Piauí", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte", RS: "Rio Grande do Sul", RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina", SP: "São Paulo", SE: "Sergipe", TO: "Tocantins",
};

interface OfficialRow {
  classi_fin?: string;
  sg_uf?: string;
  id_municip?: string;
  dt_notific?: string;
}

function parseDate(value: string | undefined) {
  if (!value) return new Date().toISOString().slice(0, 10);
  const [day, month, year] = value.split("/");
  return `${year}-${month}-${day}`;
}

function csvRowsToObservations(rows: OfficialRow[]): Observation[] {
  const confirmed = rows.filter((row) => row.classi_fin?.trim() === "1" && row.sg_uf?.trim());
  const grouped = new Map<string, { stateCode: string; locationCode: string; locationName: string; referenceDate: string; value: number }>();

  for (const row of confirmed) {
    const stateCode = row.sg_uf!.trim();
    const locationCode = row.id_municip?.trim() || `${stateCode}-unknown`;
    const level = row.id_municip?.trim() ? "municipality" : "state";
    const key = `${level}:${locationCode}`;
    const current = grouped.get(key) ?? { stateCode, locationCode, locationName: level === "state" ? stateNames[stateCode] ?? stateCode : `Município ${locationCode}`, referenceDate: parseDate(row.dt_notific), value: 0 };
    current.value += 1;
    if (row.dt_notific) current.referenceDate = parseDate(row.dt_notific);
    grouped.set(key, current);
  }

  const stateTotals = new Map<string, number>();
  for (const item of grouped.values()) stateTotals.set(item.stateCode, (stateTotals.get(item.stateCode) ?? 0) + item.value);
  for (const [stateCode, value] of stateTotals) {
    grouped.set(`state:${stateCode}`, { stateCode, locationCode: stateCode, locationName: stateNames[stateCode] ?? stateCode, referenceDate: new Date().toISOString().slice(0, 10), value });
  }

  const observations: Observation[] = [];
  for (const [key, item] of grouped) {
    const level = key.startsWith("state:") ? "state" : "municipality";
    observations.push({
      id: `official-${key}`,
      locationCode: item.locationCode,
      locationName: item.locationName,
      stateCode: item.stateCode,
      level,
      referenceDate: item.referenceDate,
      metric: "cases",
      status: "confirmed",
      value: item.value,
      sourceId: SOURCE_ID,
      sourcePublishedAt: COLLECTED_AT,
      collectedAt: COLLECTED_AT,
    });
  }
  return observations;
}

export async function fetchOfficialObservations(): Promise<Observation[]> {
  const response = await fetch(SOURCE_URL, { signal: AbortSignal.timeout(120_000), cache: "no-store" });
  if (!response.ok) throw new Error(`Fonte oficial respondeu ${response.status}`);
  const archive = new AdmZip(Buffer.from(await response.arrayBuffer()));
  const csv = archive.getEntries().find((entry) => entry.entryName.endsWith(".csv"));
  if (!csv) throw new Error("Arquivo CSV não encontrado no ZIP oficial");
  const rows = parse(csv.getData().toString("utf8"), { columns: true, delimiter: ";", skip_empty_lines: true, relax_column_count: true, bom: true }) as OfficialRow[];
  const observations = csvRowsToObservations(rows);
  if (!observations.length) throw new Error("A fonte oficial não retornou casos confirmados");
  return observations;
}

export { SOURCE_ID, SOURCE_URL, csvRowsToObservations };
