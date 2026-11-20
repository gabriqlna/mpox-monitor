import { Dashboard } from "@/components/mpox/Dashboard";
import { getDashboardData } from "@/lib/server-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getDashboardData();
  return <Dashboard {...data} />;
}
