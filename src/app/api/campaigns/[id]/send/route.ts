import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: { segment: true },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Simulate sending — generate mock stats
    const sentCount = campaign.segment?.contactCount || Math.floor(Math.random() * 200) + 50;
    const openRate = 0.4 + Math.random() * 0.35; // 40-75% open rate
    const clickRate = 0.15 + Math.random() * 0.25; // 15-40% click rate

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        status: "active",
        sentAt: new Date(),
        sent: sentCount,
        opens: Math.round(sentCount * openRate),
        clicks: Math.round(sentCount * clickRate),
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to send campaign" }, { status: 500 });
  }
}
