import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { runIngestion } from "@/lib/ingestion/orchestrator";

runIngestion().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
