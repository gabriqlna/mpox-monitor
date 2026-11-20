import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/server-data";
import { observationsQuerySchema } from "@/lib/validation";

export async function GET(request: Request) {
  const params = Object.fromEntries(new URL(request.url).searchParams.entries());
  const parsed = observationsQuerySchema.safeParse(params);
  if (!parsed.success) return NextResponse.json({ error: "Filtros inválidos" }, { status: 400 });
  const dashboard = await getDashboardData();
  const data = dashboard.observations.filter((item) => {
    if (parsed.data.state && item.stateCode !== parsed.data.state) return false;
    if (parsed.data.level && item.level !== parsed.data.level) return false;
    if (parsed.data.metric && item.metric !== parsed.data.metric) return false;
    return true;
  });
  return NextResponse.json({ data, mode: dashboard.mode });
}
