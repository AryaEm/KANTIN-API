import express from "express";
import { verifyRole, verifyToken } from "../middlewares/authorization";
import { createDiskon, deleteDiskon, getActiveDiskon, getAllDiskon, getAvailableDiskon, getDiskonByStan, getDiskonStatus, lepasDiskon, pasangDiskon, updateDiskon } from "../controllers/diskon";
import { verifyCreateDiskon, verifyUpdateDiskon } from "../middlewares/verify_diskon";

const app = express();
app.use(express.json());

app.get("/stan/:id", [verifyToken, verifyRole(["siswa"])], getDiskonByStan)
app.get("/all", [verifyToken, verifyRole(["admin_stan"])], getAllDiskon)
app.get("/active", [verifyToken, verifyRole(["admin_stan", "siswa"])], getActiveDiskon)
app.get("/available", [verifyToken, verifyRole(["admin_stan"])], getAvailableDiskon)
app.get("/status", [verifyToken, verifyRole(["admin_stan"])], getDiskonStatus)

app.post("/create", [verifyToken, verifyRole(["admin_stan"]), verifyCreateDiskon], createDiskon);
app.post("/menu/:id_menu/pasang-diskon/:id_diskon", [verifyToken, verifyRole(["admin_stan"])], pasangDiskon);
app.delete("/menu/:id_menu/lepas-diskon/:id_diskon", [verifyToken, verifyRole(["admin_stan"])], lepasDiskon);
app.put("/update/:id", [verifyToken, verifyRole(["admin_stan"]), verifyUpdateDiskon], updateDiskon)
app.delete("/delete/:id", [verifyToken, verifyRole(["admin_stan"])], deleteDiskon)

export default app;