import express from "express";
import { verifyRole, verifyToken } from "../middlewares/authorization";
import { getAllDiskon, getDiskonByStan } from "../controllers/diskon";

const app = express();
app.use(express.json());

app.get("/stan/:id", [verifyToken, verifyRole(["siswa"])], getDiskonByStan)
app.get("/all", [verifyToken, verifyRole(["admin_stan"])], getAllDiskon)

export default app;
