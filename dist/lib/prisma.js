"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient({
    errorFormat: "pretty",
});
console.log("DATABASE_URL:", process.env.DATABASE_URL);
// export default prisma
