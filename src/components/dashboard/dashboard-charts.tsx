"use client";

import dynamic from "next/dynamic";

const ContactsByStageChart = dynamic(
  () => import("./charts").then((mod) => mod.ContactsByStageChart),
  {
    ssr: false,
    loading: () => <div className="h-[300px] animate-pulse rounded-md bg-muted" />,
  }
);

const CampaignPerformanceChart = dynamic(
  () => import("./charts").then((mod) => mod.CampaignPerformanceChart),
  {
    ssr: false,
    loading: () => <div className="h-[300px] animate-pulse rounded-md bg-muted" />,
  }
);

interface DashboardChartsProps {
  stageData: { stage: string; count: number }[];
  campaignData: { name: string; sent: number; opens: number; clicks: number }[];
}

export function DashboardCharts({ stageData, campaignData }: DashboardChartsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ContactsByStageChart data={stageData} />
      <CampaignPerformanceChart data={campaignData} />
    </div>
  );
}
