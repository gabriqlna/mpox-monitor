import { NextResponse } from "next/server";
import { fixtureSources } from "@/lib/data";

export function GET() {
  return NextResponse.json({ data: fixtureSources, mode: "fixture" });
}
