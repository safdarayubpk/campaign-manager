import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const campaignSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["email", "sms"]).default("email"),
  subject: z.string().optional().nullable(),
  body: z.string().optional().nullable(),
  segmentId: z.string().optional().nullable(),
  status: z.enum(["draft", "active", "completed"]).default("draft"),
});

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: "desc" },
      include: { segment: { select: { id: true, name: true, contactCount: true } } },
    });

    return NextResponse.json(campaigns);
  } catch {
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = campaignSchema.parse(body);

    const campaign = await prisma.campaign.create({
      data: validated,
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}
