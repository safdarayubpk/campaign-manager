export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { Users, Megaphone, MailOpen, UserPlus } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";

export default async function DashboardPage() {
  const [
    totalContacts,
    activeCampaigns,
    completedCampaigns,
    newContactsThisMonth,
    contactsByStage,
    campaignStats,
  ] = await Promise.all([
    prisma.contact.count(),
    prisma.campaign.count({ where: { status: "active" } }),
    prisma.campaign.findMany({
      where: { status: "completed" },
      select: { opens: true, sent: true },
    }),
    prisma.contact.count({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    prisma.contact.groupBy({
      by: ["lifecycleStage"],
      _count: { id: true },
    }),
    prisma.campaign.findMany({
      where: { status: { not: "draft" } },
      select: { name: true, sent: true, opens: true, clicks: true },
    }),
  ]);

  const totalSent = completedCampaigns.reduce((acc, c) => acc + c.sent, 0);
  const totalOpens = completedCampaigns.reduce((acc, c) => acc + c.opens, 0);
  const avgOpenRate = totalSent > 0 ? Math.round((totalOpens / totalSent) * 100) : 0;

  const stageData = contactsByStage.map((s) => ({
    stage: s.lifecycleStage,
    count: s._count.id,
  }));

  const campaignData = campaignStats.map((c) => ({
    name: c.name.length > 20 ? c.name.slice(0, 20) + "..." : c.name,
    sent: c.sent,
    opens: c.opens,
    clicks: c.clicks,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Contacts"
          value={totalContacts}
          description="All contacts in database"
          icon={Users}
        />
        <KpiCard
          title="Active Campaigns"
          value={activeCampaigns}
          description="Currently running"
          icon={Megaphone}
        />
        <KpiCard
          title="Avg Open Rate"
          value={`${avgOpenRate}%`}
          description="Across completed campaigns"
          icon={MailOpen}
        />
        <KpiCard
          title="New This Month"
          value={newContactsThisMonth}
          description="Contacts added this month"
          icon={UserPlus}
        />
      </div>

      <DashboardCharts stageData={stageData} campaignData={campaignData} />
    </div>
  );
}
