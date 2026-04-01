import "dotenv/config";
import { defineConfig } from "prisma/config";

// Use Turso URL for remote, local SQLite otherwise
// Falls back to a dummy URL for prisma generate (no DB connection needed)
const url = process.env.TURSO_DATABASE_URL
  ? `${process.env.TURSO_DATABASE_URL}?authToken=${process.env.TURSO_AUTH_TOKEN}`
  : process.env.DATABASE_URL || "file:./prisma/dev.db";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url,
  },
});
