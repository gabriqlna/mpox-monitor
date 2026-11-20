import { describe, expect, it } from "vitest";
import { observationsQuerySchema } from "@/lib/validation";

describe("validação dos filtros", () => {
  it("aceita filtros válidos", () => {
    expect(observationsQuerySchema.parse({ state: "SP", level: "state" })).toEqual({ state: "SP", level: "state" });
  });

  it("rejeita sigla de estado inválida", () => {
    expect(observationsQuerySchema.safeParse({ state: "São Paulo" }).success).toBe(false);
  });
});
