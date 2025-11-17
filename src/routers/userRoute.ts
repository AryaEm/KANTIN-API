import express from "express"
import { deleteUser, getAllUsers, updateFotoSiswa, updateSiswa } from "../controllers/user"
import { authentication, registerSiswa, registerStan } from "../controllers/auth"
import { verifyLoginUser, verifyRegisterAdminStan, verifyRegisterUser } from "../middlewares/verify_user"
import { verifyRole, verifyToken } from "../middlewares/authorization"
import uploadFoto from "../middlewares/upload"


const app = express()
app.use(express.json())

//auth
app.post(`/register-siswa`, [verifyRegisterUser], registerSiswa)
app.post(`/register-admin`, [verifyRegisterAdminStan], registerStan)
app.post(`/login`, [verifyLoginUser], authentication)

app.get(`/`, [verifyToken, verifyRole(["siswa", "admin_stan"])], getAllUsers)
app.put(`/update-siswa/:id`, [verifyToken, verifyRole(["siswa"])], updateSiswa)
app.put(`/siswa/pic/:id`, [verifyToken, verifyRole(["siswa"])], uploadFoto.single("foto"), updateFotoSiswa)
app.delete(`/delete/:id`, [verifyToken], deleteUser)

export default app
