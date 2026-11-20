import { NextResponse } from "next/server";
import { fixtureObservations } from "@/lib/data";
import { latestCollection } from "@/lib/aggregations";

export function GET() {
  return NextResponse.json({
    status: "ok",
    mode: "fixture",
    latestCollection: latestCollection(fixtureObservations),
  });
}
