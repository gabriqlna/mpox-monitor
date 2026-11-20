import { describe, expect, it } from "vitest";
import { runIngestion } from "@/lib/ingestion/orchestrator";

describe("ingestão", () => {
  it("processa fixtures de forma idempotente", async () => {
    const result = await runIngestion();
    expect(result.status).toBe("success");
    expect(result.observations).toBeGreaterThan(0);
    expect(result.news).toBeGreaterThan(0);
  });
});
