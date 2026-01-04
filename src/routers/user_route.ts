import express from "express"
import { deleteUser, getAllUsers, updateAdminStan, updateFotoSiswa, updateSiswa } from "../controllers/user"
import { authentication, registerSiswa, registerStan } from "../controllers/auth"
import { verifyLoginUser, verifyRegisterAdminStan, verifyRegisterUser, verifyUpdateAdminStan, verifyUpdateUser } from "../middlewares/verify_user"
import { verifyRole, verifyToken } from "../middlewares/authorization"
import uploadFile from "../middlewares/upload"


const app = express()
app.use(express.json())

//auth
app.post(`/register-siswa`, [verifyRegisterUser], registerSiswa)
app.post(`/register-admin`, [verifyRegisterAdminStan], registerStan)
app.post(`/login`, [verifyLoginUser], authentication)

app.get(`/`, [verifyToken, verifyRole(["admin_stan"])], getAllUsers) // MENAMPILKAN SEMUA USER (SISWA & ADMIN STAN)
app.put(`/update-siswa/:id`, [verifyToken, verifyRole(["siswa"]), verifyUpdateUser], updateSiswa) // UPDATE/EDIT SISWA
app.put(`/update-admin-stan/:id`, [verifyToken, verifyRole(["admin_stan"]), verifyUpdateAdminStan], updateAdminStan) // UPDATE/EDIT ADMIN STAN
app.put(`/siswa/pic/:id`, [verifyToken, verifyRole(["siswa"]), uploadFile.single("foto")], updateFotoSiswa) // ADD/EDIT FOTO SISWA
app.delete(`/delete/:id`, [verifyToken], deleteUser) // DELETE USER (SISWA & ADMIN STAN)

export default app
