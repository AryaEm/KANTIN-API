import path from "path";
import dotenv from "dotenv";

dotenv.config();

export const BASE_URL = `${path.join(__dirname, "../")}`
export const PORT = process.env.PORT
export const SECRET = process.env.JWT_SECRET