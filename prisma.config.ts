import { existsSync } from "fs";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local if it exists, otherwise fallback to .env
if (existsSync(".env.local")) {
  config({ path: ".env.local" });
} else {
  config();
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
