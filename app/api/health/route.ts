import { NextResponse } from "next/server";
import { latestCollection } from "@/lib/aggregations";
import { getDashboardData } from "@/lib/server-data";

export async function GET() {
  try {
    const dashboard = await getDashboardData();
    return NextResponse.json({ status: "ok", mode: dashboard.mode, latestCollection: latestCollection(dashboard.observations) });
  } catch (error) {
    return NextResponse.json({ status: "error", error: error instanceof Error ? error.message : "Falha na fonte oficial" }, { status: 503 });
  }
}
