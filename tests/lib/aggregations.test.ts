import { describe, expect, it } from "vitest";
import { fixtureObservations } from "@/lib/data";
import { latestCollection, stateSummaries, totalCases, uniqueStates } from "@/lib/aggregations";

describe("agregações do painel", () => {
  it("soma apenas casos confirmados por estado", () => {
    expect(totalCases(fixtureObservations)).toBe(578);
  });

  it("ordena estados pelo maior número de casos", () => {
    expect(stateSummaries(fixtureObservations)[0]).toMatchObject({ stateCode: "SP", value: 248 });
  });

  it("conta localidades estaduais únicas", () => {
    expect(uniqueStates(fixtureObservations)).toBe(9);
  });

  it("retorna a coleta mais recente", () => {
    expect(latestCollection(fixtureObservations)).toBe("2026-11-20T10:00:00-03:00");
  });
});
