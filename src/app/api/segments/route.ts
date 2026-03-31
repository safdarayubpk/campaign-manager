import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { buildWhereClause, filterSchema } from "@/lib/segment-filters";

const segmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  filters: z.array(filterSchema).min(1, "At least one filter rule is required"),
});

export async function GET() {
  try {
    const segments = await prisma.segment.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { campaigns: true } } },
    });

    return NextResponse.json(
      segments.map((s) => ({
        ...s,
        filters: JSON.parse(s.filters),
        campaignCount: s._count.campaigns,
      }))
    );
  } catch {
    return NextResponse.json({ error: "Failed to fetch segments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = segmentSchema.parse(body);

    const where = buildWhereClause(validated.filters);
    const contactCount = await prisma.contact.count({ where });

    const segment = await prisma.segment.create({
      data: {
        name: validated.name,
        description: validated.description ?? null,
        filters: JSON.stringify(validated.filters),
        contactCount,
      },
    });

    return NextResponse.json(
      { ...segment, filters: JSON.parse(segment.filters) },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create segment" }, { status: 500 });
  }
}
