import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";

export const filterSchema = z.object({
  field: z.enum(["lifecycleStage", "tags", "company", "name", "email"]),
  operator: z.enum(["equals", "contains", "not_equals"]),
  value: z.string().min(1),
});

export type ValidatedFilter = z.infer<typeof filterSchema>;

export function buildWhereClause(filters: ValidatedFilter[]): Prisma.ContactWhereInput {
  const conditions: Prisma.ContactWhereInput[] = [];

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

  return conditions.length > 0 ? { AND: conditions } : {};
}
