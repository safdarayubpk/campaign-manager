import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";

const SORTABLE_COLUMNS = ["name", "email", "company", "lifecycleStage", "createdAt"] as const;
const MAX_PAGE_SIZE = 100;

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  lifecycleStage: z.enum(["lead", "prospect", "customer", "churned"]).default("lead"),
  tags: z.array(z.string()).default([]),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const page = Math.max(1, parseInt(searchParams.get("page") || "1") || 1);
    const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(searchParams.get("limit") || "10") || 10));
    const search = searchParams.get("search")?.trim().slice(0, 200) || "";
    const stage = searchParams.get("stage") || "";
    const sortBy = SORTABLE_COLUMNS.includes(searchParams.get("sortBy") as typeof SORTABLE_COLUMNS[number])
      ? (searchParams.get("sortBy") as string)
      : "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
    const tag = searchParams.get("tag") || "";

    const where: Prisma.ContactWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { company: { contains: search } },
      ];
    }

    if (stage) {
      where.lifecycleStage = stage;
    }

    if (tag) {
      where.tags = { contains: tag };
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contact.count({ where }),
    ]);

    return NextResponse.json({
      contacts: contacts.map((c) => ({
        ...c,
        tags: JSON.parse(c.tags),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = contactSchema.parse(body);

    const contact = await prisma.contact.create({
      data: {
        ...validated,
        tags: JSON.stringify(validated.tags),
      },
    });

    return NextResponse.json(
      { ...contact, tags: JSON.parse(contact.tags) },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
  }
}
