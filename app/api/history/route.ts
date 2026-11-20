import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/server-data";
import { stateSummaries } from "@/lib/aggregations";

export async function GET() {
  const dashboard = await getDashboardData();
  return NextResponse.json({ data: stateSummaries(dashboard.observations), mode: dashboard.mode });
}
