import express from "express";
import { verifyRole, verifyToken } from "../middlewares/authorization";
import { createDiskon, getActiveDiskon, getAllDiskon, getAvailableDiskon, getDiskonByStan, getDiskonStatus, updateDiskon } from "../controllers/diskon";
import { verifyCreateDiskon, verifyUpdateDiskon } from "../middlewares/verify_diskon";

const app = express();
app.use(express.json());

app.get("/stan/:id", [verifyToken, verifyRole(["siswa"])], getDiskonByStan)
app.get("/all", [verifyToken, verifyRole(["admin_stan"])], getAllDiskon)
app.get("/active", [verifyToken, verifyRole(["admin_stan", "siswa"])], getActiveDiskon)
app.get("/available", [verifyToken, verifyRole(["admin_stan"])], getAvailableDiskon)
app.get("/status", [verifyToken, verifyRole(["admin_stan"])], getDiskonStatus)

app.post("/create", [verifyToken, verifyRole(["admin_stan"]), verifyCreateDiskon], createDiskon);
app.put("/update/:id", [verifyToken, verifyRole(["admin_stan"]), verifyUpdateDiskon], updateDiskon)

export default app;
