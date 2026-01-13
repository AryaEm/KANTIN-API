import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  errorFormat: "pretty",
});

console.log("DATABASE_URL:", process.env.DATABASE_URL);
console.log("SUPABASE_URL =>", process.env.SUPABASE_URL);


// export default prisma
