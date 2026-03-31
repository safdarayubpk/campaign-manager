import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const filterSchema = z.object({
  field: z.string(),
  operator: z.string(),
  value: z.string(),
});

const segmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  filters: z.array(filterSchema).min(1, "At least one filter rule is required"),
});

function buildWhereClause(filters: z.infer<typeof filterSchema>[]) {
  const conditions: Record<string, unknown>[] = [];

  for (const filter of filters) {
    if (filter.field === "lifecycleStage") {
      if (filter.operator === "equals") {
        conditions.push({ lifecycleStage: filter.value });
      } else if (filter.operator === "not_equals") {
        conditions.push({ lifecycleStage: { not: filter.value } });
      }
    } else if (filter.field === "tags") {
      if (filter.operator === "contains") {
        conditions.push({ tags: { contains: filter.value } });
      }
    } else if (filter.field === "company") {
      if (filter.operator === "equals") {
        conditions.push({ company: filter.value });
      } else if (filter.operator === "contains") {
        conditions.push({ company: { contains: filter.value } });
      }
    } else if (filter.field === "name") {
      conditions.push({ name: { contains: filter.value } });
    } else if (filter.field === "email") {
      conditions.push({ email: { contains: filter.value } });
    }
  }

  return conditions.length > 0 ? { AND: conditions } : {};
}

export async function GET() {
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
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = segmentSchema.parse(body);

    // Count matching contacts
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
