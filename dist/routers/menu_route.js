"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const menu_1 = require("../controllers/menu");
const authorization_1 = require("../middlewares/authorization");
const menu_upload_1 = __importDefault(require("../middlewares/menu_upload"));
const verify_menu_1 = require("../middlewares/verify_menu");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get("/stan", [authorization_1.verifyToken, (0, authorization_1.verifyRole)(["siswa"])], menu_1.getAllStan); // MENAMPILKAN SEMUA STAN
app.get("/menu-kantin", [authorization_1.verifyToken, (0, authorization_1.verifyRole)(["siswa"])], menu_1.getAllMenusForSiswa); // MENAMPILKAN MENU KANTIN (BISA FILTER KANTIN)
app.get("/menu-admin", [authorization_1.verifyToken, (0, authorization_1.verifyRole)(["admin_stan"])], menu_1.getMenusForAdminStan); // MENAMPILKAN MENU PER KANTIN (SESUAI USER LOGIN) 
app.get("/stan/:id/menu", [authorization_1.verifyToken, (0, authorization_1.verifyRole)(["siswa"])], menu_1.getMenuByStanId); // MENAMPILKAN MENU PER KANTIN (SESUAI STAN YANG DIPILIH SISWA) 
app.post("/add", [authorization_1.verifyToken, (0, authorization_1.verifyRole)(["admin_stan"]), menu_upload_1.default.single("foto"), verify_menu_1.verifyAddMenu], menu_1.addMenu); // MENAMBAH MENU PADA KANTIN
app.put("/update/:id", [authorization_1.verifyToken, (0, authorization_1.verifyRole)(["admin_stan"]), menu_upload_1.default.single("foto"), verify_menu_1.verifyUpdateMenu], menu_1.updateMenu); // UPDATE MENU OLEH ADMIN/PEMILIK STAN
app.delete("/delete/:id", [authorization_1.verifyToken, (0, authorization_1.verifyRole)(["admin_stan"])], menu_1.deleteMenu); // MENGHAPUS MENU PER STAN SESUAI USER LOGIN
exports.default = app;
