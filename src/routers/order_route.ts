import express from "express"
import { verifyRole, verifyToken } from "../middlewares/authorization"
import { createTransaksi } from "../controllers/order"
import { verifyCreateOrder } from "../middlewares/verify_order"

const app = express()
app.use(express.json())

// app.get("/order/history/stan", [verifyToken, verifyRole(["admin_stan"])], getStanHistory)
// app.get("/order/history/siswa", [verifyToken, verifyRole(["siswa"])], getSiswaHistory)
app.post("/", [verifyToken, verifyRole(["siswa"]), verifyCreateOrder], createTransaksi);
// app.put("/update/:id", [verifyToken, verifyRole(["admin_stan"]), verifyUpdateStatus], updateStatus);
// app.delete("/delete/:id", [verifyToken, verifyRole(["siswa"])], deleteOrder);

// app.get("/report/income", [verifyToken, verifyRole(["admin_stan"])], getIncomeByMonth);
// app.get("/report/order", [verifyToken, verifyRole(["admin_stan"])], getOrderByMonth);

export default app