import { NextResponse } from "next/server";
import { getObservations } from "@/lib/data";
import { observationsQuerySchema } from "@/lib/validation";

export function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams.entries());
  const parsed = observationsQuerySchema.safeParse(params);
  if (!parsed.success) return NextResponse.json({ error: "Filtros inválidos" }, { status: 400 });
  return NextResponse.json({ data: getObservations(parsed.data), mode: "fixture" });
}
