import { z } from "zod";

export const observationsQuerySchema = z.object({
  state: z.string().regex(/^[A-Z]{2}$/).optional(),
  level: z.enum(["state", "municipality"]).optional(),
  metric: z.string().max(32).optional(),
});

export const ingestTokenSchema = z.string().min(16);
