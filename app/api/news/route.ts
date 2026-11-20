import { NextResponse } from "next/server";
import { fixtureNews } from "@/lib/data";

export function GET() {
  return NextResponse.json({ data: fixtureNews, mode: "fixture" });
}
