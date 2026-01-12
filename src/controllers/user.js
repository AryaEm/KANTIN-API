"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFotoSiswa = exports.updateAdminStan = exports.updateSiswa = exports.deleteUser = exports.getAllUsers = void 0;
const fs_1 = __importDefault(require("fs"));
const md5_1 = __importDefault(require("md5"));
const path_1 = __importDefault(require("path"));
const prisma_1 = require("../lib/prisma");
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma_1.prisma.user.findMany({
            include: {
                siswa: true,
                stan: true
            },
            orderBy: {
                id: "asc"
            }
        });
        return res.json({
            status: true,
            message: "Daftar user berhasil diambil",
            data: users
        });
    }
    catch (error) {
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server",
            error
        });
    }
});
exports.getAllUsers = getAllUsers;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const authUser = res.locals.user;
        if (!authUser) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }
        const findUser = yield prisma_1.prisma.user.findFirst({
            where: { id: Number(id) },
        });
        if (!findUser) {
            return res.status(404).json({
                status: false,
                message: `User tidak ditemukan.`,
            });
        }
        if (authUser.id !== findUser.id) {
            return res.status(403).json({
                status: false,
                message: "Tidak boleh menghapus user lain."
            });
        }
        const deleteUser = yield prisma_1.prisma.user.delete({
            where: { id: Number(id) },
        });
        return res.status(200).json({
            status: true,
            message: `User role ${findUser.role} berhasil dihapus`,
            data: deleteUser,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(400).json({
            status: false,
            message: `Terjadi sebuah kesalahan : ${error}.`,
        });
    }
});
exports.deleteUser = deleteUser;
const updateSiswa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const authUser = res.locals.user;
        if (!authUser) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }
        if (authUser.role !== "siswa") {
            return res.status(403).json({
                status: false,
                message: "Akses ditolak. Hanya siswa yang dapat update siswa."
            });
        }
        const { nama_siswa, alamat, telp, jenis_kelamin, foto, username, password } = req.body;
        const findSiswa = yield prisma_1.prisma.siswa.findFirst({
            where: { id: Number(id) },
            include: { user: true }
        });
        if (!findSiswa) {
            return res.status(404).json({
                status: false,
                message: "Data siswa tidak ditemukan"
            });
        }
        if (findSiswa.id_user !== authUser.id) {
            return res.status(403).json({
                status: false,
                message: "Tidak boleh mengupdate data siswa milik orang lain."
            });
        }
        const updatedUser = yield prisma_1.prisma.user.update({
            where: { id: findSiswa.id_user },
            data: {
                username: username || findSiswa.user.username,
                password: password ? (0, md5_1.default)(password) : findSiswa.user.password
            }
        });
        const updatedSiswa = yield prisma_1.prisma.siswa.update({
            where: { id: Number(id) },
            data: {
                nama_siswa: nama_siswa !== undefined ? nama_siswa : findSiswa.nama_siswa,
                alamat: alamat !== undefined ? alamat : findSiswa.alamat,
                telp: telp !== undefined ? telp : findSiswa.telp,
                jenis_kelamin: jenis_kelamin !== undefined ? jenis_kelamin : findSiswa.jenis_kelamin,
                foto: foto !== undefined ? foto : findSiswa.foto
            }
        });
        return res.status(200).json({
            status: true,
            message: "Siswa berhasil diperbarui",
            data: {
                user: updatedUser,
                siswa: updatedSiswa
            }
        });
    }
    catch (error) {
        return res.status(500).json({
            status: false,
            message: `Terjadi kesalahan: ${error}`
        });
    }
});
exports.updateSiswa = updateSiswa;
const updateAdminStan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const authUser = res.locals.user;
        if (!authUser) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }
        if (authUser.role !== "admin_stan") {
            return res.status(403).json({
                status: false,
                message: "Akses ditolak. Hanya admin stan yang dapat update data ini."
            });
        }
        const { nama_stan, nama_pemilik, telp, username, password } = req.body;
        const findStan = yield prisma_1.prisma.stan.findFirst({
            where: { id: Number(id) },
            include: { user: true }
        });
        if (!findStan) {
            return res.status(404).json({
                status: false,
                message: "Data stan tidak ditemukan"
            });
        }
        if (findStan.id_user !== authUser.id) {
            return res.status(403).json({
                status: false,
                message: "Tidak boleh mengupdate data stan milik orang lain."
            });
        }
        const updatedUser = yield prisma_1.prisma.user.update({
            where: { id: findStan.id_user },
            data: {
                username: username || findStan.user.username,
                password: password ? (0, md5_1.default)(password) : findStan.user.password
            }
        });
        const updatedStan = yield prisma_1.prisma.stan.update({
            where: { id: Number(id) },
            data: {
                nama_stan: nama_stan !== null && nama_stan !== void 0 ? nama_stan : findStan.nama_stan,
                nama_pemilik: nama_pemilik !== null && nama_pemilik !== void 0 ? nama_pemilik : findStan.nama_pemilik,
                telp: telp !== null && telp !== void 0 ? telp : findStan.telp
            }
        });
        return res.status(200).json({
            status: true,
            message: "Data admin stan berhasil diperbarui",
            data: {
                user: updatedUser,
                stan: updatedStan
            }
        });
    }
    catch (error) {
        return res.status(500).json({
            status: false,
            message: `Terjadi kesalahan: ${error}`
        });
    }
});
exports.updateAdminStan = updateAdminStan;
const updateFotoSiswa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const authUser = res.locals.user;
        if (authUser.role !== "siswa") {
            return res.status(403).json({
                status: false,
                message: "Akses ditolak.",
            });
        }
        const siswa = yield prisma_1.prisma.siswa.findFirst({
            where: { id: Number(id) },
        });
        if (!siswa) {
            return res.status(404).json({
                status: false,
                message: "User tidak ada.",
            });
        }
        if (siswa.id_user !== authUser.id) {
            return res.status(403).json({
                status: false,
                message: "Tidak boleh mengupdate foto siswa milik orang lain.",
            });
        }
        let filename = (_a = siswa.foto) !== null && _a !== void 0 ? _a : "";
        if (req.file) {
            filename = req.file.filename;
            if (siswa.foto) {
                const oldPath = path_1.default.join(__dirname, "../../public/foto_siswa", siswa.foto);
                if (fs_1.default.existsSync(oldPath)) {
                    fs_1.default.unlinkSync(oldPath);
                }
            }
        }
        const updatePicture = yield prisma_1.prisma.siswa.update({
            where: { id: Number(id) },
            data: { foto: filename },
        });
        return res.json({
            status: true,
            data: updatePicture,
            message: "Foto telah diganti",
        });
    }
    catch (error) {
        return res.status(400).json({
            status: false,
            error: String(error),
        });
    }
});
exports.updateFotoSiswa = updateFotoSiswa;
