import express from "express"
import { verifyRole, verifyToken } from "../middlewares/authorization"
import { createTransaksi, deleteOrder, getIncome, getOrder, getPendingTransactionCount, getSiswaHistory, getSiswaOngoingOrder, getStanHistory, getStanHistorySelesai, getStanPelanggan, getTransaksiNotaById, rejectOrder, updateStatus } from "../controllers/order"
import { verifyCreateOrder, verifyUpdateOrder } from "../middlewares/verify_order"
import { verifyGetSiswaHistory } from "../middlewares/verify_user"

const app = express()
app.use(express.json())

app.get("/history/stan", [verifyToken, verifyRole(["admin_stan"])], getStanHistory)
app.get("/history/stan/selesai", [verifyToken, verifyRole(["admin_stan"])], getStanHistorySelesai) //?type=month&year=2026&month=1
app.get("/history/siswa", [verifyToken, verifyRole(["siswa"]), verifyGetSiswaHistory], getSiswaHistory)  //?type=month&year=2026&month=1
app.get("/history/siswa/ongoing", [verifyToken, verifyRole(["siswa"])], getSiswaOngoingOrder)
app.get("/pending", [verifyToken, verifyRole(["admin_stan"])], getPendingTransactionCount)
app.patch("/:id/reject", verifyToken, verifyRole(["admin_stan"]), rejectOrder);
app.post("/", [verifyToken, verifyRole(["siswa"]), verifyCreateOrder], createTransaksi);
app.put("/update/:id", [verifyToken, verifyRole(["admin_stan"]), verifyUpdateOrder], updateStatus);
app.delete("/delete/:id", [verifyToken, verifyRole(["siswa"])], deleteOrder);

app.get("/stan/pelanggan", [verifyToken, verifyRole(["admin_stan"])], getStanPelanggan)
app.get("/nota/:id", [verifyToken, verifyRole(["siswa", "admin_stan"])], getTransaksiNotaById)
app.get("/report/income", [verifyToken, verifyRole(["admin_stan"])], getIncome); //report/income?type=month&year=2026&month=1
app.get("/report/order", [verifyToken, verifyRole(["admin_stan"])], getOrder); //report/order?type=month&year=2026&month=1
// app

export default app  