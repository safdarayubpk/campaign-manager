import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { buildWhereClause, filterSchema } from "@/lib/segment-filters";

const countSchema = z.object({
  filters: z.array(filterSchema).min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filters } = countSchema.parse(body);

    const where = buildWhereClause(filters);
    const count = await prisma.contact.count({ where });

    return NextResponse.json({ count });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid filters", count: 0 }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to count contacts", count: 0 }, { status: 500 });
  }
}
