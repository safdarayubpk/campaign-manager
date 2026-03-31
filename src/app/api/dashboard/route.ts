import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const [
    totalContacts,
    activeCampaigns,
    completedCampaigns,
    newContactsThisMonth,
    recentContacts,
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
    prisma.contact.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, lifecycleStage: true, createdAt: true },
    }),
    prisma.campaign.findMany({
      where: { status: { not: "draft" } },
      select: { name: true, sent: true, opens: true, clicks: true, status: true },
    }),
  ]);

  // Calculate average open rate across completed campaigns
  const totalSent = completedCampaigns.reduce((acc, c) => acc + c.sent, 0);
  const totalOpens = completedCampaigns.reduce((acc, c) => acc + c.opens, 0);
  const avgOpenRate = totalSent > 0 ? Math.round((totalOpens / totalSent) * 100) : 0;

  // Contacts by lifecycle stage for chart
  const contactsByStage = await prisma.contact.groupBy({
    by: ["lifecycleStage"],
    _count: { id: true },
  });

  return NextResponse.json({
    kpis: {
      totalContacts,
      activeCampaigns,
      avgOpenRate,
      newContactsThisMonth,
    },
    contactsByStage: contactsByStage.map((s) => ({
      stage: s.lifecycleStage,
      count: s._count.id,
    })),
    campaignStats: campaignStats.map((c) => ({
      name: c.name,
      sent: c.sent,
      opens: c.opens,
      clicks: c.clicks,
    })),
    recentContacts,
  });
}
