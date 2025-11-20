import express from "express"
import { getAllStan } from "../controllers/menu"
import { verifyRole, verifyToken } from "../middlewares/authorization"

const app = express()
app.use(express.json())

app.get(`/`, [verifyToken, verifyRole(["siswa"])], getAllStan) // MENAMPILKAN SEMUA STAN

export default app