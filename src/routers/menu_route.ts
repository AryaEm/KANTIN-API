import express from "express";
import { addMenu, getAllMenusForSiswa, getAllStan, updateMenu } from "../controllers/menu";
import { verifyRole, verifyToken } from "../middlewares/authorization";
import uploadMenuFile from "../middlewares/menu_upload";
import { verifyAddMenu, verifyUpdateMenu } from "../middlewares/verify_menu";

const app = express();
app.use(express.json());

app.get(`/stan`, [verifyToken, verifyRole(["siswa"])], getAllStan); // MENAMPILKAN SEMUA STAN
app.get(`/menu-kantin`, [verifyToken, verifyRole(["siswa"])], getAllMenusForSiswa);

app.post(`/add`, [verifyToken, verifyRole(["admin_stan"]), uploadMenuFile.single("foto"), verifyAddMenu], addMenu)
app.put(`/update/:id`, [verifyToken, verifyRole(["admin_stan"]), uploadMenuFile.single("foto"), verifyUpdateMenu], updateMenu)

export default app;
