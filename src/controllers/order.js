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
exports.rejectOrder = exports.getPendingTransactionCount = exports.getOrder = exports.getIncome = exports.getSiswaHistory = exports.getStanHistorySelesai = exports.getStanHistory = exports.deleteOrder = exports.updateStatus = exports.createTransaksi = void 0;
const client_1 = require("@prisma/client");
const dayjs_1 = __importDefault(require("dayjs"));
const isoWeek_1 = __importDefault(require("dayjs/plugin/isoWeek"));
const weekOfYear_1 = __importDefault(require("dayjs/plugin/weekOfYear"));
const prisma_1 = require("../lib/prisma");
dayjs_1.default.extend(weekOfYear_1.default);
dayjs_1.default.extend(isoWeek_1.default);
const statusOrder = [
    "belum_dikonfirmasi",
    "proses",
    "selesai",
];
const createTransaksi = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authUser = res.locals.user;
        const { items } = req.body;
        if (!authUser) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }
        const siswa = yield prisma_1.prisma.siswa.findFirst({
            where: { id_user: authUser.id },
        });
        if (!siswa) {
            return res.status(404).json({
                status: false,
                message: "Data siswa tidak ditemukan",
            });
        }
        const menuIds = items.map((i) => i.id_menu);
        const menus = yield prisma_1.prisma.menu.findMany({
            where: {
                id: { in: menuIds },
                status: "tersedia",
            },
            include: {
                stan: true,
                menuDiskon: {
                    include: {
                        diskon: true,
                    },
                },
            },
        });
        if (menus.length !== items.length) {
            return res.status(400).json({
                status: false,
                message: "Salah satu menu tidak tersedia",
            });
        }
        const stanId = menus[0].id_stan;
        const bedaStan = menus.some((m) => m.id_stan !== stanId);
        if (bedaStan) {
            return res.status(400).json({
                status: false,
                message: "Transaksi hanya boleh untuk satu stan",
            });
        }
        const stan = menus[0].stan;
        const now = new Date();
        let totalHarga = 0;
        const detailData = items.map((item) => {
            const menu = menus.find((m) => m.id === item.id_menu);
            const diskonAktif = menu.menuDiskon
                .map((md) => md.diskon)
                .find((d) => now >= d.tanggal_awal && now <= d.tanggal_akhir);
            const persentase = diskonAktif ? diskonAktif.persentase_diskon : 0;
            const hargaSetelahDiskon = menu.harga - (menu.harga * persentase) / 100;
            const subtotal = hargaSetelahDiskon * item.qty;
            totalHarga += subtotal;
            return {
                id_menu: menu.id,
                nama_menu: menu.nama_menu,
                harga_asli: menu.harga,
                persentase_diskon: persentase,
                harga_setelah_diskon: Math.round(hargaSetelahDiskon),
                qty: item.qty,
                subtotal: Math.round(subtotal),
            };
        });
        // const kodeTransaksi = `TRX-${Date.now()}`;
        const transaksi = yield prisma_1.prisma.transaksi.create({
            data: {
                id_stan: stanId,
                id_siswa: siswa.id,
                detail: {
                    create: detailData,
                },
            },
            include: {
                detail: true,
            },
        });
        const kodeTransaksi = `TRX-${String(transaksi.id).padStart(3, "0")}`;
        yield prisma_1.prisma.transaksi.update({
            where: { id: transaksi.id },
            data: {
                kode_transaksi: kodeTransaksi,
            },
        });
        return res.status(201).json({
            status: true,
            message: "Transaksi berhasil dibuat",
            data: {
                id_transaksi: transaksi.id,
                kode_transaksi: transaksi.kode_transaksi,
                tanggal: transaksi.tanggal,
                status: transaksi.status,
                stan: {
                    id: stan.id,
                    nama_stan: stan.nama_stan,
                },
                items: transaksi.detail.map((d) => ({
                    id_menu: d.id_menu,
                    nama_menu: d.nama_menu,
                    qty: d.qty,
                    harga_satuan: d.harga_asli,
                    diskon_persen: d.persentase_diskon,
                    harga_setelah_diskon: d.harga_setelah_diskon,
                    subtotal: d.subtotal,
                })),
                total_harga: totalHarga,
            },
        });
    }
    catch (error) {
        console.error("CREATE TRANSAKSI ERROR:", error);
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server",
        });
    }
});
exports.createTransaksi = createTransaksi;
const updateStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id_transaksi = Number(req.params.id);
        const { status } = req.body;
        if (!statusOrder.includes(status)) {
            return res.status(400).json({
                status: false,
                message: "Status tidak valid",
            });
        }
        const transaksi = yield prisma_1.prisma.transaksi.findUnique({
            where: { id: id_transaksi },
        });
        if (!transaksi) {
            return res.status(404).json({
                status: false,
                message: "Transaksi tidak ditemukan",
            });
        }
        if (transaksi.status === "selesai") {
            return res.status(400).json({
                status: false,
                message: "Transaksi yang sudah selesai tidak dapat diubah",
            });
        }
        const currentIndex = statusOrder.indexOf(transaksi.status);
        const newIndex = statusOrder.indexOf(status);
        if (newIndex !== currentIndex + 1) {
            return res.status(400).json({
                status: false,
                message: `Status harus berurutan dari '${transaksi.status}'`,
            });
        }
        const updated = yield prisma_1.prisma.transaksi.update({
            where: { id: id_transaksi },
            data: { status },
        });
        return res.status(200).json({
            status: true,
            message: "Status transaksi berhasil diperbarui",
            data: updated,
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
exports.updateStatus = updateStatus;
const deleteOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id_transaksi = Number(req.params.id);
        const id_user = res.locals.user;
        if (!id_user) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }
        if (isNaN(id_transaksi)) {
            return res.status(400).json({
                status: false,
                message: "ID transaksi tidak valid",
            });
        }
        // 1. Ambil siswa berdasarkan user login
        const siswa = yield prisma_1.prisma.siswa.findUnique({
            where: { id_user: id_user.id },
        });
        if (!siswa) {
            return res.status(403).json({
                status: false,
                message: "Akses ditolak",
            });
        }
        // 2. Cari transaksi milik siswa tsb
        const transaksi = yield prisma_1.prisma.transaksi.findFirst({
            where: {
                id: id_transaksi,
                id_siswa: siswa.id,
            },
        });
        if (!transaksi) {
            return res.status(404).json({
                status: false,
                message: "Transaksi tidak ditemukan",
            });
        }
        // 3. Validasi status transaksi
        if (transaksi.status !== client_1.StatusTransaksi.belum_dikonfirmasi) {
            return res.status(400).json({
                status: false,
                message: "Transaksi tidak dapat dihapus karena sudah diproses",
            });
        }
        // 4. Hapus transaksi (detail ikut kehapus via cascade)
        yield prisma_1.prisma.transaksi.delete({
            where: { id: transaksi.id },
        });
        return res.json({
            status: true,
            message: "Transaksi berhasil dibatalkan",
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan pada server",
        });
    }
});
exports.deleteOrder = deleteOrder;
const getStanHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authUser = res.locals.user;
        if (!authUser) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }
        const stan = yield prisma_1.prisma.stan.findFirst({
            where: {
                id_user: authUser.id,
            },
        });
        if (!stan) {
            return res.status(404).json({
                status: false,
                message: "Stan tidak ditemukan untuk user ini.",
            });
        }
        const transaksiList = yield prisma_1.prisma.transaksi.findMany({
            where: {
                id_stan: stan.id,
                status: {
                    in: ["belum_dikonfirmasi", "proses", "ditolak"],
                }
            },
            orderBy: {
                tanggal: "desc",
            },
            include: {
                siswa: {
                    select: {
                        id: true,
                        nama_siswa: true,
                    },
                },
                detail: {
                    select: {
                        id_menu: true,
                        nama_menu: true,
                        harga_asli: true,
                        persentase_diskon: true,
                        harga_setelah_diskon: true,
                        qty: true,
                        subtotal: true,
                    },
                },
            },
        });
        const data = transaksiList.map((trx) => {
            const total_harga = trx.detail.reduce((sum, item) => sum + item.subtotal, 0);
            const total_item = trx.detail.reduce((sum, item) => sum + item.qty, 0);
            return {
                id_transaksi: trx.id,
                kode_transaksi: trx.kode_transaksi,
                tanggal: trx.tanggal,
                status: trx.status,
                siswa: {
                    id: trx.siswa.id,
                    nama_siswa: trx.siswa.nama_siswa,
                },
                items: trx.detail.map((item) => ({
                    id_menu: item.id_menu,
                    nama_menu: item.nama_menu,
                    qty: item.qty,
                    harga_satuan: item.harga_asli,
                    diskon_persen: item.persentase_diskon,
                    harga_setelah_diskon: item.harga_setelah_diskon,
                    subtotal: item.subtotal,
                })),
                total_item,
                total_harga,
            };
        });
        return res.status(200).json({
            status: true,
            message: `Riwayat transaksi untuk stan ${stan.nama_stan}`,
            data,
        });
    }
    catch (error) {
        console.error("GET STAN HISTORY ERROR:", error);
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server.",
        });
    }
});
exports.getStanHistory = getStanHistory;
const getStanHistorySelesai = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authUser = res.locals.user;
        if (!authUser) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }
        const stan = yield prisma_1.prisma.stan.findFirst({
            where: {
                id_user: authUser.id,
            },
        });
        if (!stan) {
            return res.status(404).json({
                status: false,
                message: "Stan tidak ditemukan untuk user ini.",
            });
        }
        const transaksiList = yield prisma_1.prisma.transaksi.findMany({
            where: {
                id_stan: stan.id,
                status: "selesai", // ⭐ FILTER UTAMA
            },
            orderBy: {
                tanggal: "desc",
            },
            include: {
                siswa: {
                    select: {
                        id: true,
                        nama_siswa: true,
                    },
                },
                detail: {
                    select: {
                        id_menu: true,
                        nama_menu: true,
                        harga_asli: true,
                        persentase_diskon: true,
                        harga_setelah_diskon: true,
                        qty: true,
                        subtotal: true,
                    },
                },
            },
        });
        const data = transaksiList.map((trx) => {
            const total_harga = trx.detail.reduce((sum, item) => sum + item.subtotal, 0);
            const total_item = trx.detail.reduce((sum, item) => sum + item.qty, 0);
            return {
                id_transaksi: trx.id,
                kode_transaksi: trx.kode_transaksi,
                tanggal: trx.tanggal,
                status: trx.status,
                siswa: {
                    id: trx.siswa.id,
                    nama_siswa: trx.siswa.nama_siswa,
                },
                items: trx.detail.map((item) => ({
                    id_menu: item.id_menu,
                    nama_menu: item.nama_menu,
                    qty: item.qty,
                    harga_satuan: item.harga_asli,
                    diskon_persen: item.persentase_diskon,
                    harga_setelah_diskon: item.harga_setelah_diskon,
                    subtotal: item.subtotal,
                })),
                total_item,
                total_harga,
            };
        });
        return res.status(200).json({
            status: true,
            message: `Riwayat transaksi selesai untuk stan ${stan.nama_stan}`,
            data,
        });
    }
    catch (error) {
        console.error("GET STAN HISTORY SELESAI ERROR:", error);
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server.",
        });
    }
});
exports.getStanHistorySelesai = getStanHistorySelesai;
const getSiswaHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authUser = res.locals.user;
        if (!authUser) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }
        const siswa = yield prisma_1.prisma.siswa.findFirst({
            where: {
                id_user: authUser.id,
            },
        });
        if (!siswa) {
            return res.status(404).json({
                status: false,
                message: "Data siswa tidak ditemukan.",
            });
        }
        const transaksiList = yield prisma_1.prisma.transaksi.findMany({
            where: {
                id_siswa: siswa.id,
            },
            orderBy: {
                tanggal: "desc",
            },
            include: {
                stan: {
                    select: {
                        id: true,
                        nama_stan: true,
                    },
                },
                detail: {
                    select: {
                        id_menu: true,
                        nama_menu: true,
                        harga_asli: true,
                        persentase_diskon: true,
                        harga_setelah_diskon: true,
                        qty: true,
                        subtotal: true,
                    },
                },
            },
        });
        const data = transaksiList.map((trx) => {
            const total_harga = trx.detail.reduce((sum, item) => sum + item.subtotal, 0);
            const total_item = trx.detail.reduce((sum, item) => sum + item.qty, 0);
            return {
                id_transaksi: trx.id,
                kode_transaksi: trx.kode_transaksi,
                tanggal: trx.tanggal,
                status: trx.status,
                stan: {
                    id: trx.stan.id,
                    nama_stan: trx.stan.nama_stan,
                },
                items: trx.detail.map((item) => ({
                    id_menu: item.id_menu,
                    nama_menu: item.nama_menu,
                    qty: item.qty,
                    harga_satuan: item.harga_asli,
                    diskon_persen: item.persentase_diskon,
                    harga_setelah_diskon: item.harga_setelah_diskon,
                    subtotal: item.subtotal,
                })),
                total_item,
                total_harga,
            };
        });
        return res.status(200).json({
            status: true,
            message: "Riwayat transaksi siswa",
            data,
        });
    }
    catch (error) {
        console.error("GET SISWA HISTORY ERROR:", error);
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server.",
        });
    }
});
exports.getSiswaHistory = getSiswaHistory;
const getIncome = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authUser = res.locals.user;
        if (!authUser) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }
        const { type, year, month, week } = req.query;
        const stan = yield prisma_1.prisma.stan.findFirst({
            where: {
                id_user: authUser.id,
            },
        });
        if (!stan) {
            return res.status(403).json({
                status: false,
                message: "User ini tidak memiliki stan",
            });
        }
        let startDate;
        let endDate;
        if (type === "year") {
            if (!year) {
                return res.status(400).json({
                    status: false,
                    message: "Parameter year wajib diisi",
                });
            }
            startDate = (0, dayjs_1.default)(`${year}-01-01`).startOf("year").toDate();
            endDate = (0, dayjs_1.default)(`${year}-12-31`).endOf("year").toDate();
        }
        if (type === "month") {
            if (!year || !month) {
                return res.status(400).json({
                    status: false,
                    message: "Parameter year dan month wajib diisi",
                });
            }
            startDate = (0, dayjs_1.default)(`${year}-${month}-01`).startOf("month").toDate();
            endDate = (0, dayjs_1.default)(`${year}-${month}-01`).endOf("month").toDate();
        }
        if (type === "week") {
            if (!year || !week) {
                return res.status(400).json({
                    status: false,
                    message: "Parameter year dan week wajib diisi",
                });
            }
            startDate = (0, dayjs_1.default)()
                .year(Number(year))
                .isoWeek(Number(week))
                .startOf("isoWeek")
                .toDate();
            endDate = (0, dayjs_1.default)()
                .year(Number(year))
                .isoWeek(Number(week))
                .endOf("isoWeek")
                .toDate();
        }
        const transaksi = yield prisma_1.prisma.transaksi.findMany({
            where: Object.assign({ id_stan: stan.id, status: "selesai" }, (startDate &&
                endDate && {
                tanggal: {
                    gte: startDate,
                    lte: endDate,
                },
            })),
            include: {
                detail: {
                    select: {
                        subtotal: true,
                    },
                },
            },
        });
        let totalIncome = 0;
        transaksi.forEach((trx) => {
            trx.detail.forEach((d) => {
                totalIncome += d.subtotal;
            });
        });
        return res.status(200).json({
            status: true,
            data: {
                filter: {
                    type: type || "all",
                    year: year || null,
                    month: month || null,
                    week: week || null,
                },
            },
            total_transaksi: transaksi.length,
            total_income: totalIncome,
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
exports.getIncome = getIncome;
const getOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authUser = res.locals.user;
        if (!authUser) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }
        const { year, month, week } = req.query;
        // 1. Ambil stan milik admin
        const stan = yield prisma_1.prisma.stan.findFirst({
            where: { id_user: authUser.id },
        });
        if (!stan) {
            return res.status(403).json({
                status: false,
                message: "Stan tidak ditemukan",
            });
        }
        // 2. Tentukan filter tanggal
        let startDate;
        let endDate;
        let filterType = "all";
        if (year && month) {
            filterType = "month";
            startDate = (0, dayjs_1.default)(`${year}-${month}-01`).startOf("month").toDate();
            endDate = (0, dayjs_1.default)(startDate).endOf("month").toDate();
        }
        else if (year && week) {
            filterType = "week";
            startDate = (0, dayjs_1.default)()
                .year(Number(year))
                .isoWeek(Number(week))
                .startOf("isoWeek")
                .toDate();
            endDate = (0, dayjs_1.default)(startDate).endOf("week").toDate();
        }
        else if (year) {
            filterType = "year";
            startDate = (0, dayjs_1.default)(`${year}-01-01`).startOf("year").toDate();
            endDate = (0, dayjs_1.default)(startDate).endOf("year").toDate();
        }
        // 3. Ambil transaksi
        const transaksi = yield prisma_1.prisma.transaksi.findMany({
            where: Object.assign({ id_stan: stan.id, status: client_1.StatusTransaksi.selesai }, (startDate &&
                endDate && {
                tanggal: {
                    gte: startDate,
                    lte: endDate,
                },
            })),
            include: {
                detail: true,
            },
        });
        // 4. Hitung total
        const total_transaksi = transaksi.length;
        const total_item = transaksi.reduce((total, trx) => {
            const qty = trx.detail.reduce((sum, item) => sum + item.qty, 0);
            return total + qty;
        }, 0);
        return res.status(200).json({
            status: true,
            data: {
                filter: {
                    type: filterType,
                    year: year ? Number(year) : null,
                    month: month ? Number(month) : null,
                    week: week ? Number(week) : null,
                },
            },
            total_transaksi,
            total_item,
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
exports.getOrder = getOrder;
const getPendingTransactionCount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
                message: "Stan tidak ditemukan",
            });
        }
        const pending_count = yield prisma_1.prisma.transaksi.count({
            where: {
                id_stan: stan.id,
                status: "belum_dikonfirmasi",
            },
        });
        return res.status(200).json({
            status: true,
            data: {
                pending_count,
            }
        });
    }
    catch (error) {
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server",
        });
    }
});
exports.getPendingTransactionCount = getPendingTransactionCount;
const rejectOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const authUser = res.locals.user;
        const id_transaksi = Number(req.params.id);
        if (!authUser) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }
        // ambil stan admin
        const stan = yield prisma_1.prisma.stan.findFirst({
            where: { id_user: authUser.id },
        });
        if (!stan) {
            return res.status(403).json({
                status: false,
                message: "Stan tidak ditemukan",
            });
        }
        // ambil transaksi
        const transaksi = yield prisma_1.prisma.transaksi.findFirst({
            where: {
                id: id_transaksi,
                id_stan: stan.id,
            },
        });
        if (!transaksi) {
            return res.status(404).json({
                status: false,
                message: "Transaksi tidak ditemukan",
            });
        }
        // hanya boleh ditolak jika belum dikonfirmasi
        if (transaksi.status !== client_1.StatusTransaksi.belum_dikonfirmasi) {
            return res.status(400).json({
                status: false,
                message: "Pesanan tidak dapat ditolak karena sudah diproses/selasai",
            });
        }
        const updated = yield prisma_1.prisma.transaksi.update({
            where: { id: transaksi.id },
            data: {
                status: client_1.StatusTransaksi.ditolak,
            },
        });
        return res.status(200).json({
            status: true,
            message: "Pesanan berhasil ditolak",
            data: updated,
        });
    }
    catch (error) {
        console.error("REJECT ORDER ERROR:", error);
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server",
        });
    }
});
exports.rejectOrder = rejectOrder;
