import DashboardFeatureGuard from "@/components/Dashboard/DashboardFeatureGuard";
import DashboardPage from "../[dashboard]/page";

export default function DashboardHome() {
  return (
    <DashboardFeatureGuard>
      <DashboardPage />
    </DashboardFeatureGuard>
  );
}
