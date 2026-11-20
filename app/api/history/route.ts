import { NextResponse } from "next/server";
import { getObservations } from "@/lib/data";
import { stateSummaries } from "@/lib/aggregations";

export function GET() {
  return NextResponse.json({ data: stateSummaries(getObservations()), mode: "fixture" });
}
