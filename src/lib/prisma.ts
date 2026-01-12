import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  errorFormat: "pretty",
});

console.log("DATABASE_URL:", process.env.DATABASE_URL);

// export default prisma
