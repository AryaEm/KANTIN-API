"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("../controllers/user");
const auth_1 = require("../controllers/auth");
const verify_user_1 = require("../middlewares/verify_user");
const authorization_1 = require("../middlewares/authorization");
const upload_1 = __importDefault(require("../middlewares/upload"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
//auth
app.post(`/register-siswa`, [verify_user_1.verifyRegisterUser], auth_1.registerSiswa);
app.post(`/register-admin`, [verify_user_1.verifyRegisterAdminStan], auth_1.registerStan);
app.post(`/login`, [verify_user_1.verifyLoginUser], auth_1.authentication);
app.get(`/`, [authorization_1.verifyToken, (0, authorization_1.verifyRole)(["admin_stan"])], user_1.getAllUsers); // MENAMPILKAN SEMUA USER (ADMIN STAN)
app.put(`/update-siswa/:id`, [authorization_1.verifyToken, (0, authorization_1.verifyRole)(["siswa"]), verify_user_1.verifyUpdateUser], user_1.updateSiswa); // UPDATE/EDIT SISWA
app.put(`/update-admin-stan/:id`, [authorization_1.verifyToken, (0, authorization_1.verifyRole)(["admin_stan"]), verify_user_1.verifyUpdateAdminStan], user_1.updateAdminStan); // UPDATE/EDIT ADMIN STAN
app.put(`/siswa/pic/:id`, [authorization_1.verifyToken, (0, authorization_1.verifyRole)(["siswa"]), upload_1.default.single("foto")], user_1.updateFotoSiswa); // ADD/EDIT FOTO SISWA
app.delete(`/delete/:id`, [authorization_1.verifyToken], user_1.deleteUser); // DELETE USER (SISWA & ADMIN STAN)
exports.default = app;
