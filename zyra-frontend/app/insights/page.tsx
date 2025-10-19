import { Header } from "@/components/shared/header"
import InsightsDashboard from "@/components/sections/insights-dashboard"

export default function InsightsPage() {
  return (
    <div className="min-h-screen bg-zyra-gradient">
      <Header />
      <InsightsDashboard />
    </div>
  )
}