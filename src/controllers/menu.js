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
exports.deleteMenu = exports.getMenusForAdminStan = exports.updateMenu = exports.addMenu = exports.getAllMenusForSiswa = exports.getMenuByStanId = exports.getAllStan = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma_1 = require("../lib/prisma");
const getAllStan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield prisma_1.prisma.stan.findMany({
            select: {
                id: true,
                nama_stan: true,
                nama_pemilik: true,
                telp: true
            }
        });
        return res.status(200).json({
            status: true,
            message: "Daftar semua stan berhasil dimuat",
            data
        });
    }
    catch (error) {
        return res.status(500).json({
            status: false,
            message: `Terjadi kesalahan server: ${error}`
        });
    }
});
exports.getAllStan = getAllStan;
const getMenuByStanId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const now = new Date();
        const stan = yield prisma_1.prisma.stan.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                nama_stan: true,
                nama_pemilik: true,
                telp: true,
                menu: {
                    where: {
                        status: "tersedia",
                    },
                    select: {
                        id: true,
                        nama_menu: true,
                        deskripsi: true,
                        jenis: true,
                        harga: true,
                        foto: true,
                        menuDiskon: {
                            select: {
                                diskon: {
                                    select: {
                                        persentase_diskon: true,
                                        tanggal_awal: true,
                                        tanggal_akhir: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!stan) {
            return res.status(404).json({
                status: false,
                message: "Stan tidak ditemukan",
            });
        }
        const data = {
            id: stan.id,
            name: stan.nama_stan,
            owner: stan.nama_pemilik,
            telp: stan.telp,
            menus: stan.menu.map((menu) => {
                const activeDiskon = menu.menuDiskon.find((md) => now >= md.diskon.tanggal_awal &&
                    now <= md.diskon.tanggal_akhir);
                return {
                    id: menu.id,
                    name: menu.nama_menu,
                    description: menu.deskripsi,
                    jenis_menu: menu.jenis,
                    price: menu.harga,
                    image: menu.foto,
                    discount: activeDiskon
                        ? activeDiskon.diskon.persentase_diskon
                        : 0,
                };
            }),
        };
        return res.status(200).json({
            status: true,
            data,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server",
        });
    }
});
exports.getMenuByStanId = getMenuByStanId;
const getAllMenusForSiswa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search, jenis, harga_min, harga_max, id_stan } = req.query;
        let nama_stan = "Semua Kantin";
        if (id_stan) {
            const stan = yield prisma_1.prisma.stan.findFirst({
                where: { id: Number(id_stan) },
                select: { nama_stan: true },
            });
            if (!stan) {
                return res.status(404).json({
                    status: false,
                    message: `Kantin dengan ID ${id_stan} tidak ditemukan.`,
                });
            }
            nama_stan = stan.nama_stan;
        }
        const menus = yield prisma_1.prisma.menu.findMany({
            where: {
                id_stan: id_stan ? Number(id_stan) : undefined,
                nama_menu: search
                    ? {
                        contains: search.toString(),
                    }
                    : undefined,
                jenis: jenis
                    ? {
                        equals: jenis.toString(),
                    }
                    : undefined,
                harga: harga_min || harga_max
                    ? {
                        gte: harga_min ? Number(harga_min) : undefined,
                        lte: harga_max ? Number(harga_max) : undefined,
                    }
                    : undefined,
            },
            include: {
                stan: {
                    select: {
                        id: true,
                        nama_stan: true,
                    },
                },
            },
            orderBy: {
                nama_menu: "asc",
            },
        });
        return res.status(200).json({
            status: true,
            message: `Menu berhasil ditampilkan (${nama_stan}).`,
            data: menus,
        });
    }
    catch (err) {
        console.log("GET MENU SISWA ERROR:", err);
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan pada server.",
        });
    }
});
exports.getAllMenusForSiswa = getAllMenusForSiswa;
const addMenu = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = res.locals.user;
        if (!user) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }
        const { nama_menu, harga, jenis, deskripsi } = req.body;
        const stan = yield prisma_1.prisma.stan.findFirst({
            where: { id_user: user.id },
        });
        if (!stan) {
            return res.status(404).json({
                status: false,
                message: "Stan tidak ditemukan untuk user ini",
            });
        }
        let foto = "";
        if (req.file) {
            foto = req.file.filename;
        }
        const newMenu = yield prisma_1.prisma.menu.create({
            data: {
                nama_menu: nama_menu !== null && nama_menu !== void 0 ? nama_menu : "",
                harga: Number(harga),
                jenis: jenis,
                deskripsi: deskripsi !== null && deskripsi !== void 0 ? deskripsi : "",
                foto: foto !== null && foto !== void 0 ? foto : "",
                id_stan: stan.id,
            },
        });
        return res.json({
            status: true,
            message: "Menu berhasil ditambahkan",
            data: newMenu,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(400).json({
            status: false,
            message: "Terjadi kesalahan server",
            error: String(error),
        });
    }
});
exports.addMenu = addMenu;
const updateMenu = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id_menu = Number(req.params.id);
        const authUser = res.locals.user;
        if (!authUser) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }
        // cek menu ada atau nggak
        const menu = yield prisma_1.prisma.menu.findUnique({
            where: { id: id_menu },
        });
        if (!menu) {
            return res.status(404).json({
                status: false,
                message: "Menu tidak ditemukan"
            });
        }
        // cek stan mana yang dimiliki user login
        const stanPemilik = yield prisma_1.prisma.stan.findFirst({
            where: { id_user: authUser.id },
        });
        if (!stanPemilik) {
            return res.status(403).json({
                status: false,
                message: "User ini tidak memiliki stan."
            });
        }
        if (menu.id_stan !== stanPemilik.id) {
            return res.status(403).json({
                status: false,
                message: "Tidak boleh mengupdate menu milik stan lain."
            });
        }
        // update data
        const { nama_menu, harga, jenis, deskripsi, status, } = req.body;
        const updated = yield prisma_1.prisma.menu.update({
            where: { id: id_menu },
            data: {
                nama_menu: nama_menu !== null && nama_menu !== void 0 ? nama_menu : menu.nama_menu,
                harga: harga !== undefined ? Number(harga) : menu.harga,
                jenis: jenis !== null && jenis !== void 0 ? jenis : menu.jenis,
                deskripsi: deskripsi !== null && deskripsi !== void 0 ? deskripsi : menu.deskripsi,
                status: status !== null && status !== void 0 ? status : menu.status,
            },
        });
        return res.status(200).json({
            status: true,
            message: "Berhasil update menu",
            data: updated
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server",
            error: error.message,
        });
    }
});
exports.updateMenu = updateMenu;
const getMenusForAdminStan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authUser = res.locals.user;
        if (!authUser) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }
        const stan = yield prisma_1.prisma.stan.findFirst({
            where: { id_user: authUser.id },
        });
        if (!stan) {
            return res.status(404).json({
                status: false,
                message: "Stan tidak ditemukan untuk user ini.",
            });
        }
        // ambil menu milik stan tersebut
        const menus = yield prisma_1.prisma.menu.findMany({
            where: {
                id_stan: stan.id,
            },
            orderBy: {
                nama_menu: "asc",
            },
        });
        return res.status(200).json({
            status: true,
            message: `Menu berhasil ditampilkan (${stan.nama_stan})`,
            data: menus,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server",
        });
    }
});
exports.getMenusForAdminStan = getMenusForAdminStan;
const deleteMenu = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id_menu = Number(req.params.id);
        const authUser = res.locals.user;
        if (!authUser) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }
        const menu = yield prisma_1.prisma.menu.findUnique({
            where: { id: id_menu },
        });
        if (!menu) {
            return res.status(404).json({
                status: false,
                message: "Menu tidak ditemukan",
            });
        }
        const stanPemilik = yield prisma_1.prisma.stan.findFirst({
            where: { id_user: authUser.id },
        });
        if (!stanPemilik) {
            return res.status(403).json({
                status: false,
                message: "User ini tidak memiliki stan.",
            });
        }
        if (menu.id_stan !== stanPemilik.id) {
            return res.status(403).json({
                status: false,
                message: "Tidak boleh menghapus menu milik stan lain.",
            });
        }
        if (menu.foto) {
            const fotoPath = path_1.default.join(__dirname, "../../public/foto_menu", menu.foto);
            if (fs_1.default.existsSync(fotoPath)) {
                fs_1.default.unlinkSync(fotoPath);
            }
        }
        yield prisma_1.prisma.menu.delete({
            where: { id: id_menu },
        });
        return res.status(200).json({
            status: true,
            message: "Menu berhasil dihapus",
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server",
            error: error.message,
        });
    }
});
exports.deleteMenu = deleteMenu;
