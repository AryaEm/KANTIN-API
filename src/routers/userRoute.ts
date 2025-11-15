import express from "express"
import { getAllUsers } from "../controllers/user"
import { registerSiswa } from "../controllers/auth"
import { verifyRegisterAdminStan, verifyRegisterUser } from "../middlewares/verify_user"

const app = express()
app.use(express.json())

//auth
app.post(`/register-siswa`, [verifyRegisterUser], registerSiswa)
app.post(`/register-admin`, [verifyRegisterAdminStan], registerSiswa)

app.get(`/`, getAllUsers)

export default app
