import express from "express"
import { verifyRole, verifyToken } from "../middlewares/authorization"
import { createTransaksi, deleteOrder, getIncome, getSiswaHistory, getStanHistory, updateStatus } from "../controllers/order"
import { verifyCreateOrder, verifyUpdateOrder } from "../middlewares/verify_order"

const app = express()
app.use(express.json())

app.get("/history/stan", [verifyToken, verifyRole(["admin_stan"])], getStanHistory)
app.get("/history/siswa", [verifyToken, verifyRole(["siswa"])], getSiswaHistory)
app.post("/", [verifyToken, verifyRole(["siswa"]), verifyCreateOrder], createTransaksi);
app.put("/update/:id", [verifyToken, verifyRole(["admin_stan"]), verifyUpdateOrder], updateStatus);
app.delete("/delete/:id", [verifyToken, verifyRole(["siswa"])], deleteOrder);

app.get("/report/income", [verifyToken, verifyRole(["admin_stan"])], getIncome); //report/income?type=month&year=2026&month=1
// app.get("/report/order", [verifyToken, verifyRole(["admin_stan"])], getOrder); //report/order?type=month&year=2026&month=1
// app

export default app  