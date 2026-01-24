import express from "express";
import { addMenu, deleteMenu, getAllMenusForSiswa, getAllStan, getBestSellerForAdminStan, getMenuByStanId, getMenusForAdminStan, updateMenu } from "../controllers/menu";
import { verifyRole, verifyToken } from "../middlewares/authorization";
import upload from "../middlewares/menu_upload";
import { verifyAddMenu, verifyUpdateMenu } from "../middlewares/verify_menu";

const app = express();
app.use(express.json());

app.get("/stan", [verifyToken, verifyRole(["siswa"])], getAllStan); // MENAMPILKAN SEMUA STAN
app.get("/menu-kantin", [verifyToken, verifyRole(["siswa"])], getAllMenusForSiswa); // MENAMPILKAN MENU KANTIN (BISA FILTER KANTIN)
app.get("/menu-admin", [verifyToken, verifyRole(["admin_stan"])], getMenusForAdminStan); // MENAMPILKAN MENU PER KANTIN (SESUAI USER LOGIN) 
app.get("/best-seller", [verifyToken, verifyRole(["admin_stan"])], getBestSellerForAdminStan)
app.get("/stan/:id/menu", [verifyToken, verifyRole(["siswa"])], getMenuByStanId); // MENAMPILKAN MENU PER KANTIN (SESUAI STAN YANG DIPILIH SISWA) 
// /menu/stan/1/menu?jenis=makanan
// /menu/stan/1/menu?iskon=true
// /menu/stan/1/menu?jenis=makanan&diskon=true
// /menu/stan/1/menu?status=tersedia
// /menu/stan/1/menu?status=habis&jenis=makanan

app.post("/add", [verifyToken, verifyRole(["admin_stan"]), upload.single("foto"), verifyAddMenu], addMenu) // MENAMBAH MENU PADA KANTIN
app.put("/update/:id", [verifyToken, verifyRole(["admin_stan"]), upload.single("foto"), verifyUpdateMenu], updateMenu) // UPDATE MENU OLEH ADMIN/PEMILIK STAN
app.delete("/delete/:id", [verifyToken, verifyRole(["admin_stan"])], deleteMenu) // MENGHAPUS MENU PER STAN SESUAI USER LOGIN

export default app;
