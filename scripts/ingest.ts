import { runIngestion } from "@/lib/ingestion/orchestrator";

runIngestion().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
