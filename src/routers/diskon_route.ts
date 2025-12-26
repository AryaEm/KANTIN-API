import express from "express";
import { verifyRole, verifyToken } from "../middlewares/authorization";
import { getActiveDiskon, getAllDiskon, getDiskonByStan } from "../controllers/diskon";

const app = express();
app.use(express.json());

app.get("/stan/:id", [verifyToken, verifyRole(["siswa"])], getDiskonByStan)
app.get("/all", [verifyToken, verifyRole(["admin_stan"])], getAllDiskon)
app.get("/active", [verifyToken, verifyRole(["admin_stan", "siswa"])], getActiveDiskon)

export default app;
