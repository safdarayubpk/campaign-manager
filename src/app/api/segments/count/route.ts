import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { filters } = await request.json();

    const conditions: Record<string, unknown>[] = [];
    for (const filter of filters) {
      if (filter.field === "lifecycleStage") {
        if (filter.operator === "equals") {
          conditions.push({ lifecycleStage: filter.value });
        } else if (filter.operator === "not_equals") {
          conditions.push({ lifecycleStage: { not: filter.value } });
        }
      } else if (filter.field === "tags") {
        conditions.push({ tags: { contains: filter.value } });
      } else if (filter.field === "company") {
        if (filter.operator === "equals") {
          conditions.push({ company: filter.value });
        } else {
          conditions.push({ company: { contains: filter.value } });
        }
      } else if (filter.field === "name") {
        conditions.push({ name: { contains: filter.value } });
      } else if (filter.field === "email") {
        conditions.push({ email: { contains: filter.value } });
      }
    }

    const where = conditions.length > 0 ? { AND: conditions } : {};
    const count = await prisma.contact.count({ where });

    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
