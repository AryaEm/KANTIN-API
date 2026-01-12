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
Object.defineProperty(exports, "__esModule", { value: true });
exports.lepasDiskon = exports.pasangDiskon = exports.deleteDiskon = exports.getDiskonStatus = exports.updateDiskon = exports.getAvailableDiskon = exports.createDiskon = exports.getActiveDiskon = exports.getAllDiskon = exports.getDiskonByStan = void 0;
const prisma_1 = require("../lib/prisma");
const getDiskonByStan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const idStan = Number(req.params.id);
        if (isNaN(idStan)) {
            return res.status(400).json({
                status: false,
                message: "ID stan tidak valid",
            });
        }
        const stan = yield prisma_1.prisma.stan.findUnique({
            where: { id: idStan },
        });
        if (!stan) {
            return res.status(404).json({
                status: false,
                message: "Stan tidak ditemukan",
            });
        }
        const now = new Date();
        const diskon = yield prisma_1.prisma.diskon.findMany({
            where: {
                tanggal_awal: { lte: now },
                tanggal_akhir: { gte: now },
                menuDiskon: {
                    some: {
                        menu: {
                            id_stan: idStan,
                        },
                    },
                },
            },
            include: {
                menuDiskon: {
                    include: {
                        menu: {
                            select: {
                                id: true,
                                nama_menu: true,
                                harga: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                tanggal_akhir: "asc",
            },
        });
        return res.status(200).json({
            status: true,
            message: `Diskon aktif untuk stan ${stan.nama_stan}`,
            data: diskon,
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
exports.getDiskonByStan = getDiskonByStan;
const getAllDiskon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const diskon = yield prisma_1.prisma.diskon.findMany({
            where: {
                menuDiskon: {
                    some: {
                        menu: {
                            id_stan: stan.id,
                        },
                    },
                },
            },
            include: {
                menuDiskon: {
                    include: {
                        menu: {
                            select: {
                                id: true,
                                nama_menu: true,
                                harga: true,
                                status: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                tanggal_awal: "desc",
            },
        });
        return res.status(200).json({
            status: true,
            message: `Semua diskon untuk stan ${stan.nama_stan}`,
            data: diskon,
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
exports.getAllDiskon = getAllDiskon;
const getActiveDiskon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authUser = res.locals.user;
        if (!authUser) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }
        const role = authUser.role;
        const now = new Date();
        const diskonAktif = yield prisma_1.prisma.diskon.findMany({
            where: {
                tanggal_awal: { lte: now },
                tanggal_akhir: { gte: now },
            },
            include: {
                menuDiskon: {
                    include: {
                        menu: {
                            include: {
                                stan: true,
                            },
                        },
                    },
                },
            },
        });
        // RESPONSE SISWA 
        if (role === "siswa") {
            const data = diskonAktif.flatMap((diskon) => diskon.menuDiskon.map((md) => {
                const hargaAwal = md.menu.harga;
                const hargaDiskon = hargaAwal - (hargaAwal * diskon.persentase_diskon) / 100;
                return {
                    id_menu: md.menu.id,
                    nama_menu: md.menu.nama_menu,
                    nama_stan: md.menu.stan.nama_stan,
                    harga_awal: hargaAwal,
                    harga_setelah_diskon: Math.round(hargaDiskon),
                    diskon: diskon.persentase_diskon,
                };
            }));
            return res.status(200).json({
                status: true,
                message: "Diskon aktif berhasil diambil",
                data,
            });
        }
        // RESPONSE ADMIN
        if (role === "admin_stan") {
            // ambil stan milik admin
            const stan = yield prisma_1.prisma.stan.findUnique({
                where: { id_user: authUser.id },
            });
            if (!stan) {
                return res.status(404).json({
                    status: false,
                    message: "Stan tidak ditemukan",
                });
            }
            const data = diskonAktif
                // filter hanya diskon yg terkait menu stan ini
                .filter((diskon) => diskon.menuDiskon.some((md) => md.menu.id_stan === stan.id))
                .map((diskon) => ({
                id: diskon.id,
                nama_diskon: diskon.nama_diskon,
                persentase_diskon: diskon.persentase_diskon,
                tanggal_awal: diskon.tanggal_awal,
                tanggal_akhir: diskon.tanggal_akhir,
                menu: diskon.menuDiskon
                    .filter((md) => md.menu.id_stan === stan.id)
                    .map((md) => {
                    const hargaAwal = md.menu.harga;
                    const hargaDiskon = hargaAwal -
                        (hargaAwal * diskon.persentase_diskon) / 100;
                    return {
                        id_menu: md.menu.id,
                        nama_menu: md.menu.nama_menu,
                        harga_awal: hargaAwal,
                        harga_setelah_diskon: Math.round(hargaDiskon),
                        status: md.menu.status,
                    };
                }),
            }));
            return res.status(200).json({
                status: true,
                message: "Diskon aktif berhasil diambil",
                data,
            });
        }
        // ===== ROLE TIDAK VALID =====
        return res.status(403).json({
            status: false,
            message: "Role tidak diizinkan",
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
exports.getActiveDiskon = getActiveDiskon;
const createDiskon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
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
                message: "Akses ditolak.",
            });
        }
        const { nama_diskon, persentase_diskon, tanggal_awal, tanggal_akhir } = req.body;
        const stan = yield prisma_1.prisma.stan.findFirst({
            where: { id_user: authUser.id },
        });
        if (!stan) {
            return res.status(404).json({
                status: false,
                message: "Stan tidak ditemukan untuk admin ini.",
            });
        }
        const diskon = yield prisma_1.prisma.diskon.create({
            data: {
                nama_diskon: nama_diskon !== null && nama_diskon !== void 0 ? nama_diskon : "",
                persentase_diskon: persentase_diskon !== null && persentase_diskon !== void 0 ? persentase_diskon : 0,
                tanggal_awal: new Date(tanggal_awal),
                tanggal_akhir: new Date(tanggal_akhir),
                id_stan: stan.id,
            },
        });
        return res.status(201).json({
            status: true,
            message: "Diskon berhasil dibuat",
            data: diskon,
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
exports.createDiskon = createDiskon;
const getAvailableDiskon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authUser = res.locals.user;
        if (authUser.role !== "admin_stan") {
            return res.status(403).json({
                status: false,
                message: "Akses ditolak.",
            });
        }
        const stan = yield prisma_1.prisma.stan.findFirst({
            where: { id_user: authUser.id },
        });
        if (!stan) {
            return res.status(404).json({
                status: false,
                message: "Stan tidak ditemukan.",
            });
        }
        const now = new Date();
        const diskon = yield prisma_1.prisma.diskon.findMany({
            where: {
                id_stan: stan.id,
                tanggal_awal: { lte: now },
                tanggal_akhir: { gte: now },
            },
            select: {
                id: true,
                nama_diskon: true,
                persentase_diskon: true,
                tanggal_awal: true,
                tanggal_akhir: true,
            },
            orderBy: {
                tanggal_akhir: "asc",
            },
        });
        return res.status(200).json({
            status: true,
            message: "Daftar diskon tersedia",
            data: diskon,
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
exports.getAvailableDiskon = getAvailableDiskon;
const updateDiskon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const authUser = res.locals.user;
        if (!authUser) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }
        const diskonId = Number(req.params.id);
        if (isNaN(diskonId)) {
            return res.status(400).json({
                status: false,
                message: "ID diskon tidak valid.",
            });
        }
        // 1. Cari stan milik admin yang login
        const stan = yield prisma_1.prisma.stan.findFirst({
            where: {
                id_user: authUser.id,
            },
        });
        if (!stan) {
            return res.status(404).json({
                status: false,
                message: "Stan tidak ditemukan.",
            });
        }
        // 2. Pastikan diskon milik stan tersebut
        const diskon = yield prisma_1.prisma.diskon.findFirst({
            where: {
                id: diskonId,
                id_stan: stan.id,
            },
        });
        if (!diskon) {
            return res.status(404).json({
                status: false,
                message: "Diskon tidak ditemukan atau bukan milik stan Anda.",
            });
        }
        // 3. Tentukan tanggal final (support partial update)
        const tanggalAwalFinal = (_a = req.body.tanggal_awal) !== null && _a !== void 0 ? _a : diskon.tanggal_awal;
        const tanggalAkhirFinal = (_b = req.body.tanggal_akhir) !== null && _b !== void 0 ? _b : diskon.tanggal_akhir;
        if (new Date(tanggalAkhirFinal) <= new Date(tanggalAwalFinal)) {
            return res.status(400).json({
                status: false,
                message: "Tanggal akhir harus lebih besar dari tanggal awal.",
            });
        }
        // 4. Bangun data update secara DINAMIS (hindari undefined)
        const dataToUpdate = {};
        if (req.body.nama_diskon !== undefined) {
            dataToUpdate.nama_diskon = req.body.nama_diskon;
        }
        if (req.body.persentase_diskon !== undefined) {
            dataToUpdate.persentase_diskon = req.body.persentase_diskon;
        }
        if (req.body.tanggal_awal !== undefined) {
            dataToUpdate.tanggal_awal = new Date(req.body.tanggal_awal);
        }
        if (req.body.tanggal_akhir !== undefined) {
            dataToUpdate.tanggal_akhir = new Date(req.body.tanggal_akhir);
        }
        // 5. Update diskon
        const updatedDiskon = yield prisma_1.prisma.diskon.update({
            where: {
                id: diskonId,
            },
            data: dataToUpdate,
        });
        return res.status(200).json({
            status: true,
            message: "Diskon berhasil diperbarui.",
            data: {
                id: updatedDiskon.id,
                nama_diskon: updatedDiskon.nama_diskon,
                persentase_diskon: updatedDiskon.persentase_diskon,
                tanggal_awal: updatedDiskon.tanggal_awal,
                tanggal_akhir: updatedDiskon.tanggal_akhir,
            },
        });
    }
    catch (error) {
        console.error("UPDATE DISKON ERROR:", error);
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server.",
        });
    }
});
exports.updateDiskon = updateDiskon;
const getDiskonStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authUser = res.locals.user;
        if (!authUser) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }
        // 1. Ambil stan milik admin login
        const stan = yield prisma_1.prisma.stan.findFirst({
            where: {
                id_user: authUser.id,
            },
        });
        if (!stan) {
            return res.status(404).json({
                status: false,
                message: "Stan tidak ditemukan.",
            });
        }
        // 2. Ambil semua diskon milik stan (tanpa filter tanggal)
        const diskonList = yield prisma_1.prisma.diskon.findMany({
            where: {
                id_stan: stan.id,
            },
            orderBy: {
                tanggal_awal: "desc",
            },
        });
        const now = new Date();
        const result = diskonList.map((d) => {
            let status;
            if (now < d.tanggal_awal) {
                status = "belum_aktif";
            }
            else if (now > d.tanggal_akhir) {
                status = "expired";
            }
            else {
                status = "aktif";
            }
            return {
                id: d.id,
                nama_diskon: d.nama_diskon,
                persentase_diskon: d.persentase_diskon,
                tanggal_awal: d.tanggal_awal,
                tanggal_akhir: d.tanggal_akhir,
                status,
            };
        });
        return res.status(200).json({
            status: true,
            message: "Daftar semua diskon milik stan",
            data: result,
        });
    }
    catch (error) {
        console.error("GET ALL DISKON ADMIN ERROR:", error);
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server.",
        });
    }
});
exports.getDiskonStatus = getDiskonStatus;
const deleteDiskon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authUser = res.locals.user;
        if (!authUser) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }
        const diskonId = Number(req.params.id);
        const stan = yield prisma_1.prisma.stan.findFirst({
            where: { id_user: authUser.id },
        });
        if (!stan) {
            return res.status(404).json({
                status: false,
                message: "Stan tidak ditemukan.",
            });
        }
        const diskon = yield prisma_1.prisma.diskon.findFirst({
            where: {
                id: diskonId,
                id_stan: stan.id,
            },
            include: {
                menuDiskon: true,
            },
        });
        if (!diskon) {
            return res.status(404).json({
                status: false,
                message: "Diskon tidak ditemukan atau bukan milik stan Anda.",
            });
        }
        if (diskon.menuDiskon.length > 0) {
            return res.status(400).json({
                status: false,
                message: "Diskon masih terpasang pada menu. Lepas diskon dari menu terlebih dahulu.",
            });
        }
        yield prisma_1.prisma.diskon.delete({
            where: { id: diskonId },
        });
        return res.status(200).json({
            status: true,
            message: "Diskon berhasil dihapus.",
        });
    }
    catch (error) {
        console.error("DELETE DISKON ERROR:", error);
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server.",
        });
    }
});
exports.deleteDiskon = deleteDiskon;
const pasangDiskon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authUser = res.locals.user;
        if (!authUser) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }
        const idMenu = Number(req.params.id_menu);
        const idDiskon = Number(req.params.id_diskon);
        const stan = yield prisma_1.prisma.stan.findFirst({
            where: {
                id_user: authUser.id,
            },
        });
        if (!stan) {
            return res.status(404).json({
                status: false,
                message: "Stan tidak ditemukan.",
            });
        }
        const menu = yield prisma_1.prisma.menu.findFirst({
            where: {
                id: idMenu,
                id_stan: stan.id,
            },
        });
        if (!menu) {
            return res.status(404).json({
                status: false,
                message: "Menu tidak ditemukan atau bukan milik stan Anda.",
            });
        }
        const diskon = yield prisma_1.prisma.diskon.findFirst({
            where: {
                id: idDiskon,
                id_stan: stan.id,
            },
        });
        if (!diskon) {
            return res.status(404).json({
                status: false,
                message: "Diskon tidak ditemukan atau bukan milik stan Anda.",
            });
        }
        const existing = yield prisma_1.prisma.menuDiskon.findFirst({
            where: {
                id_menu: idMenu,
                id_diskon: idDiskon,
            },
        });
        if (existing) {
            return res.status(400).json({
                status: false,
                message: "Diskon sudah terpasang pada menu ini.",
            });
        }
        yield prisma_1.prisma.menuDiskon.create({
            data: {
                id_menu: idMenu,
                id_diskon: idDiskon,
            },
        });
        return res.status(201).json({
            status: true,
            message: "Diskon berhasil dipasang ke menu.",
        });
    }
    catch (error) {
        console.error("PASANG DISKON ERROR:", error);
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server.",
        });
    }
});
exports.pasangDiskon = pasangDiskon;
const lepasDiskon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authUser = res.locals.user;
        if (!authUser) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }
        const idMenu = Number(req.params.id_menu);
        const idDiskon = Number(req.params.id_diskon);
        const stan = yield prisma_1.prisma.stan.findFirst({
            where: {
                id_user: authUser.id,
            },
        });
        if (!stan) {
            return res.status(404).json({
                status: false,
                message: "Stan tidak ditemukan.",
            });
        }
        const menu = yield prisma_1.prisma.menu.findFirst({
            where: {
                id: idMenu,
                id_stan: stan.id,
            },
        });
        if (!menu) {
            return res.status(404).json({
                status: false,
                message: "Menu tidak ditemukan atau bukan milik stan Anda.",
            });
        }
        const diskon = yield prisma_1.prisma.diskon.findFirst({
            where: {
                id: idDiskon,
                id_stan: stan.id,
            },
        });
        if (!diskon) {
            return res.status(404).json({
                status: false,
                message: "Diskon tidak ditemukan atau bukan milik stan Anda.",
            });
        }
        const menuDiskon = yield prisma_1.prisma.menuDiskon.findFirst({
            where: {
                id_menu: idMenu,
                id_diskon: idDiskon,
            },
        });
        if (!menuDiskon) {
            return res.status(400).json({
                status: false,
                message: "Diskon tidak sedang terpasang pada menu ini.",
            });
        }
        yield prisma_1.prisma.menuDiskon.delete({
            where: {
                id: menuDiskon.id,
            },
        });
        return res.status(200).json({
            status: true,
            message: "Diskon berhasil dilepas dari menu.",
        });
    }
    catch (error) {
        console.error("Lepas Diskon gagal:", error);
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server.",
        });
    }
});
exports.lepasDiskon = lepasDiskon;
