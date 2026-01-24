// 
import { Request, Response } from "express";
import { StatusTransaksi } from "@prisma/client";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import weekOfYear from "dayjs/plugin/weekOfYear";
import PDFDocument from "pdfkit";
import { prisma } from "../lib/prisma";

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);


const statusOrder: StatusTransaksi[] = [
    "belum_dikonfirmasi",
    "proses",
    "selesai",
];

export const createTransaksi = async (req: Request, res: Response) => {
    try {
        const authUser = res.locals.user;
        const { items } = req.body;

        if (!authUser) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }

        const siswa = await prisma.siswa.findFirst({
            where: { id_user: authUser.id },
        });

        if (!siswa) {
            return res.status(404).json({
                status: false,
                message: "Data siswa tidak ditemukan",
            });
        }

        const menuIds = items.map((i: any) => i.id_menu);

        const menus = await prisma.menu.findMany({
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

        const detailData = items.map((item: any) => {
            const menu = menus.find((m) => m.id === item.id_menu)!;

            const diskonAktif = menu.menuDiskon
                .map((md) => md.diskon)
                .find(
                    (d) => now >= d.tanggal_awal && now <= d.tanggal_akhir
                );

            const persentase = diskonAktif ? diskonAktif.persentase_diskon : 0;
            const hargaSetelahDiskon =
                menu.harga - (menu.harga * persentase) / 100;

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

        const transaksi = await prisma.transaksi.create({
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

        await prisma.transaksi.update({
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
    } catch (error) {
        console.error("CREATE TRANSAKSI ERROR:", error);
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server",
        });
    }
};

export const updateStatus = async (req: Request, res: Response) => {
    try {
        const id_transaksi = Number(req.params.id);
        const { status } = req.body as { status: StatusTransaksi };

        if (!statusOrder.includes(status)) {
            return res.status(400).json({
                status: false,
                message: "Status tidak valid",
            });
        }

        const transaksi = await prisma.transaksi.findUnique({
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

        const updated = await prisma.transaksi.update({
            where: { id: id_transaksi },
            data: { status },
        });

        return res.status(200).json({
            status: true,
            message: "Status transaksi berhasil diperbarui",
            data: updated,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server",
        });
    }
};

export const deleteOrder = async (req: Request, res: Response) => {
    try {
        const id_transaksi = Number(req.params.id);
        const id_user = res.locals.user
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

        const siswa = await prisma.siswa.findUnique({
            where: { id_user: id_user.id },
        });

        if (!siswa) {
            return res.status(403).json({
                status: false,
                message: "Akses ditolak",
            });
        }

        const transaksi = await prisma.transaksi.findFirst({
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

        if (
            transaksi.status === StatusTransaksi.proses ||
            transaksi.status === StatusTransaksi.selesai
        ) {
            return res.status(400).json({
                status: false,
                message: "Transaksi tidak dapat dihapus karena sudah diproses",
            });
        }

        await prisma.transaksi.delete({
            where: { id: transaksi.id },
        });

        return res.json({
            status: true,
            message: "Transaksi berhasil dibatalkan",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan pada server",
        });
    }
};

export const getStanHistory = async (req: Request, res: Response) => {
    try {
        const authUser = res.locals.user;
        if (!authUser) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }

        const stan = await prisma.stan.findFirst({
            where: {
                id_user: authUser.id,
            },
        });

        if (!stan) {
            return res.status(404).json({
                status: false,
                message: "Stan tidak ditemukan",
            });
        }

        const { status } = req.query;

        const transaksiWhere: any = {
            id_stan: stan.id,
            status: {
                in: ["belum_dikonfirmasi", "proses"],
            },
        };

        if (typeof status === "string" && status.trim() !== "") {
            transaksiWhere.status = status;
        }

        const transaksiList = await prisma.transaksi.findMany({
            where: transaksiWhere,
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
            const total_harga = trx.detail.reduce(
                (sum, item) => sum + item.subtotal,
                0
            );

            const total_item = trx.detail.reduce(
                (sum, item) => sum + item.qty,
                0
            );

            return {
                id_transaksi: trx.id,
                kode_transaksi: trx.kode_transaksi,
                tanggal: trx.tanggal,
                status: trx.status,
                siswa: {
                    id: trx.siswa.id,
                    nama_siswa: trx.siswa.nama_siswa,
                },
                items: trx.detail,
                total_item,
                total_harga,
            };
        });

        return res.status(200).json({
            status: true,
            data,
        });
    } catch (error) {
        console.error("GET STAN HISTORY ERROR:", error);
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server",
        });
    }
};

export const getStanHistorySelesai = async (req: Request, res: Response) => {
    try {
        const authUser = res.locals.user;
        if (!authUser) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }

        const stan = await prisma.stan.findFirst({
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

        const { type, year, month, week } = req.query;

        let startDate: Date | undefined;
        let endDate: Date | undefined;

        if (type === "month") {
            if (!year || !month) {
                return res.status(400).json({
                    status: false,
                    message: "Parameter year dan month wajib diisi.",
                });
            }

            const y = Number(year);
            const m = Number(month) - 1;

            startDate = new Date(y, m, 1);
            endDate = new Date(y, m + 1, 1);
        }

        if (type === "week") {
            if (!year || !week) {
                return res.status(400).json({
                    status: false,
                    message: "Parameter year dan week wajib diisi.",
                });
            }

            const y = Number(year);
            const w = Number(week);

            const firstDayOfYear = new Date(y, 0, 1);
            const dayOffset = (firstDayOfYear.getDay() + 6) % 7;

            startDate = new Date(y, 0, 1 + (w - 1) * 7 - dayOffset);
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 7);
        }

        const transaksiList = await prisma.transaksi.findMany({
            where: {
                id_stan: stan.id,
                status: "selesai",
                ...(startDate && endDate
                    ? {
                        tanggal: {
                            gte: startDate,
                            lt: endDate,
                        },
                    }
                    : {}),
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
            const total_harga = trx.detail.reduce(
                (sum, item) => sum + item.subtotal,
                0
            );

            const total_item = trx.detail.reduce(
                (sum, item) => sum + item.qty,
                0
            );

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
            filter: {
                type: type ?? "all",
                startDate,
                endDate,
            },
            data,
        });
    } catch (error) {
        console.error("GET STAN HISTORY SELESAI ERROR:", error);
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server.",
        });
    }
};

export const getSiswaHistory = async (req: Request, res: Response) => {
    try {
        const authUser = res.locals.user;
        if (!authUser) {
            return res.status(401).json({ status: false, message: "Unauthorized" });
        }

        const siswa = await prisma.siswa.findFirst({
            where: { id_user: authUser.id },
        });

        if (!siswa) {
            return res.status(404).json({
                status: false,
                message: "Data siswa tidak ditemukan.",
            });
        }

        const { type, year, month, week } = req.query;

        let startDate: Date | undefined;
        let endDate: Date | undefined;

        if (type === "month") {
            if (!year || !month) {
                return res.status(400).json({
                    status: false,
                    message: "Parameter year dan month wajib diisi.",
                });
            }

            const y = Number(year);
            const m = Number(month) - 1;

            startDate = new Date(y, m, 1);
            endDate = new Date(y, m + 1, 1);
        }

        if (type === "week") {
            if (!year || !week) {
                return res.status(400).json({
                    status: false,
                    message: "Parameter year dan week wajib diisi.",
                });
            }

            const y = Number(year);
            const w = Number(week);

            const firstDayOfYear = new Date(y, 0, 1);
            const dayOffset = (firstDayOfYear.getDay() + 6) % 7;

            startDate = new Date(y, 0, 1 + (w - 1) * 7 - dayOffset);
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 7);
        }

        const transaksiList = await prisma.transaksi.findMany({
            where: {
                id_siswa: siswa.id,
                status: "selesai",
                ...(startDate && endDate
                    ? { tanggal: { gte: startDate, lt: endDate } }
                    : {}),
            },
            orderBy: { tanggal: "desc" },
            include: {
                stan: { select: { id: true, nama_stan: true } },
                detail: true,
            },
        });

        const data = transaksiList.map((trx) => {
            const total_harga = trx.detail.reduce(
                (sum, item) => sum + item.subtotal,
                0
            );

            return {
                id_transaksi: trx.id,
                kode_transaksi: trx.kode_transaksi,
                tanggal: trx.tanggal,
                status: trx.status,
                stan: trx.stan,
                items: trx.detail,
                total_harga,
            };
        });

        return res.status(200).json({
            status: true,
            message: "Riwayat transaksi siswa",
            filter: { type: type ?? "all", startDate, endDate },
            data,
        });
    } catch (error) {
        console.error("GET SISWA HISTORY ERROR:", error);
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server.",
        });
    }
};


export const getSiswaOngoingOrder = async (req: Request, res: Response) => {
    try {
        const authUser = res.locals.user;
        if (!authUser) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }

        const siswa = await prisma.siswa.findFirst({
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

        const transaksiList = await prisma.transaksi.findMany({
            where: {
                id_siswa: siswa.id,
                status: {
                    in: ["belum_dikonfirmasi", "proses", "ditolak"],

                },
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
            const total_harga = trx.detail.reduce(
                (sum, item) => sum + item.subtotal,
                0
            );

            const total_item = trx.detail.reduce(
                (sum, item) => sum + item.qty,
                0
            );

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
    } catch (error) {
        console.error("GET SISWA HISTORY ERROR:", error);
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server.",
        });
    }
};

export const getIncome = async (req: Request, res: Response) => {
    try {
        const authUser = res.locals.user;

        if (!authUser) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }

        const { type, year, month, week } = req.query;

        const stan = await prisma.stan.findFirst({
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

        let startDate: Date | undefined;
        let endDate: Date | undefined;

        if (type === "year") {
            if (!year) {
                return res.status(400).json({
                    status: false,
                    message: "Parameter year wajib diisi",
                });
            }

            startDate = dayjs(`${year}-01-01`).startOf("year").toDate();
            endDate = dayjs(`${year}-12-31`).endOf("year").toDate();
        }

        if (type === "month") {
            if (!year || !month) {
                return res.status(400).json({
                    status: false,
                    message: "Parameter year dan month wajib diisi",
                });
            }

            startDate = dayjs(`${year}-${month}-01`).startOf("month").toDate();
            endDate = dayjs(`${year}-${month}-01`).endOf("month").toDate();
        }

        if (type === "week") {
            if (!year || !week) {
                return res.status(400).json({
                    status: false,
                    message: "Parameter year dan week wajib diisi",
                });
            }

            startDate = dayjs()
                .year(Number(year))
                .isoWeek(Number(week))
                .startOf("isoWeek")
                .toDate();

            endDate = dayjs()
                .year(Number(year))
                .isoWeek(Number(week))
                .endOf("isoWeek")
                .toDate();
        }

        const transaksi = await prisma.transaksi.findMany({
            where: {
                id_stan: stan.id,
                status: "selesai",
                ...(startDate &&
                    endDate && {
                    tanggal: {
                        gte: startDate,
                        lte: endDate,
                    },
                }),
            },
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
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server",
            error: error.message,
        });
    }
};

export const getOrder = async (req: Request, res: Response) => {
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
        const stan = await prisma.stan.findFirst({
            where: { id_user: authUser.id },
        });

        if (!stan) {
            return res.status(403).json({
                status: false,
                message: "Stan tidak ditemukan",
            });
        }

        // 2. Tentukan filter tanggal
        let startDate: Date | undefined;
        let endDate: Date | undefined;
        let filterType = "all";

        if (year && month) {
            filterType = "month";
            startDate = dayjs(`${year}-${month}-01`).startOf("month").toDate();
            endDate = dayjs(startDate).endOf("month").toDate();
        } else if (year && week) {
            filterType = "week";
            startDate = dayjs()
                .year(Number(year))
                .isoWeek(Number(week))
                .startOf("isoWeek")
                .toDate();
            endDate = dayjs(startDate).endOf("week").toDate();
        } else if (year) {
            filterType = "year";
            startDate = dayjs(`${year}-01-01`).startOf("year").toDate();
            endDate = dayjs(startDate).endOf("year").toDate();
        }

        // 3. Ambil transaksi
        const transaksi = await prisma.transaksi.findMany({
            where: {
                id_stan: stan.id,
                status: StatusTransaksi.selesai,
                ...(startDate &&
                    endDate && {
                    tanggal: {
                        gte: startDate,
                        lte: endDate,
                    },
                }),
            },
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
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server",
            error: error.message,
        });
    }
};

export const getPendingTransactionCount = async (req: Request, res: Response) => {
    try {
        const authUser = res.locals.user;
        if (!authUser) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }

        const stan = await prisma.stan.findFirst({
            where: { id_user: authUser.id },
        });

        if (!stan) {
            return res.status(404).json({
                status: false,
                message: "Stan tidak ditemukan",
            });
        }

        const pending_count = await prisma.transaksi.count({
            where: {
                id_stan: stan.id,
                status: "belum_dikonfirmasi"
            },
        });

        return res.status(200).json({
            status: true,
            data: {
                pending_count,
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server",
        });
    }
};

export const rejectOrder = async (req: Request, res: Response) => {
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
        const stan = await prisma.stan.findFirst({
            where: { id_user: authUser.id },
        });

        if (!stan) {
            return res.status(403).json({
                status: false,
                message: "Stan tidak ditemukan",
            });
        }

        // ambil transaksi
        const transaksi = await prisma.transaksi.findFirst({
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
        if (transaksi.status !== StatusTransaksi.belum_dikonfirmasi) {
            return res.status(400).json({
                status: false,
                message: "Pesanan tidak dapat ditolak karena sudah diproses/selasai",
            });
        }

        const updated = await prisma.transaksi.update({
            where: { id: transaksi.id },
            data: {
                status: StatusTransaksi.ditolak,
            },
        });

        return res.status(200).json({
            status: true,
            message: "Pesanan berhasil ditolak",
            data: updated,
        });
    } catch (error) {
        console.error("REJECT ORDER ERROR:", error);
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server",
        });
    }
};

export const getTransaksiNotaById = async (req: Request, res: Response) => {
    try {
        const authUser = res.locals.user;
        const id_transaksi = Number(req.params.id);

        if (!authUser) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }

        if (isNaN(id_transaksi)) {
            return res.status(400).json({
                status: false,
                message: "ID transaksi tidak valid.",
            });
        }

        const transaksi = await prisma.transaksi.findFirst({
            where: {
                id: id_transaksi,
                id_siswa: authUser.id,
            },
            include: {
                stan: {
                    select: {
                        id: true,
                        nama_stan: true,
                        nama_pemilik: true,
                        telp: true,
                    },
                },
                siswa: {
                    select: {
                        id: true,
                        nama_siswa: true,
                        telp: true,
                    },
                },
                detail: {
                    select: {
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

        if (!transaksi) {
            return res.status(404).json({
                status: false,
                message: "Transaksi tidak ditemukan.",
            });
        }

        const total_item = transaksi.detail.reduce(
            (sum, item) => sum + item.qty,
            0
        );

        const total_harga = transaksi.detail.reduce(
            (sum, item) => sum + item.subtotal,
            0
        );

        const nota = {
            id_transaksi: transaksi.id,
            tanggal: transaksi.tanggal,
            status: transaksi.status,

            stan: {
                nama_stan: transaksi.stan.nama_stan,
                nama_pemilik: transaksi.stan.nama_pemilik,
                telp: transaksi.stan.telp,
            },

            siswa: {
                nama_siswa: transaksi.siswa.nama_siswa,
                telp: transaksi.siswa.telp,
            },

            items: transaksi.detail.map((item) => ({
                nama_menu: item.nama_menu,
                qty: item.qty,
                harga_asli: item.harga_asli,
                diskon_persen: item.persentase_diskon,
                harga_setelah_diskon: item.harga_setelah_diskon,
                subtotal: item.subtotal,
            })),

            total_item,
            total_harga,
        };

        return res.status(200).json({
            status: true,
            message: "Bukti transaksi",
            data: nota,
        });
    } catch (error) {
        console.error("GET TRANSAKSI NOTA ERROR:", error);
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server.",
        });
    }
};

export const downloadNotaPdf = async (req: Request, res: Response) => {
    try {
        const authUser = res.locals.user; 
        const id = Number(req.params.id);

        const transaksi = await prisma.transaksi.findFirst({
            where: {
                id,
                id_siswa: authUser.id,
            },
            include: {
                stan: true,
                siswa: true,
                detail: true,
            },
        });

        if (!transaksi) {
            return res.status(404).json({ message: "Transaksi tidak ditemukan" });
        }

        const doc = new PDFDocument({ margin: 40 });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=invoice-${id}.pdf`
        );

        doc.pipe(res);

        doc.fontSize(18).text("INVOICE", { align: "center" });
        doc.moveDown();

        doc.fontSize(12);
        doc.text(`ID Transaksi: ${transaksi.id}`);
        doc.text(`Tanggal: ${transaksi.tanggal.toLocaleDateString("id-ID")}`);
        doc.text(`Status: ${transaksi.status}`);
        doc.moveDown();

        doc.text(`Stan: ${transaksi.stan.nama_stan}`);
        doc.text(`Pembeli: ${transaksi.siswa.nama_siswa}`);
        doc.moveDown();

        doc.text("Detail Pesanan:");
        doc.moveDown(0.5);

        transaksi.detail.forEach((item) => {
            doc.text(
                `- ${item.nama_menu} x${item.qty} = Rp ${item.subtotal.toLocaleString(
                    "id-ID"
                )}`
            );
        });

        const total = transaksi.detail.reduce((s, i) => s + i.subtotal, 0);

        doc.moveDown();
        doc.fontSize(13).text(`Total: Rp ${total.toLocaleString("id-ID")}`, {
            align: "right",
        });

        doc.end();

    } catch (err) {
        console.error("PDF ERROR:", err);
        if (!res.headersSent) {
            res.status(500).json({ message: "Gagal generate PDF" });
        }
    }
};

export const getStanPelanggan = async (req: Request, res: Response) => {
    try {
        const authUser = res.locals.user;

        if (!authUser) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }

        const stan = await prisma.stan.findFirst({
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

        const transaksiList = await prisma.transaksi.findMany({
            where: {
                id_stan: stan.id,
            },
            include: {
                siswa: {
                    select: {
                        id: true,
                        nama_siswa: true,
                        foto: true,
                        telp: true,
                    },
                },
                detail: {
                    select: {
                        qty: true,
                        subtotal: true,
                    },
                },
            },
            orderBy: {
                tanggal: "desc",
            },
        });

        const pelangganMap = new Map<number, any>();

        transaksiList.forEach((trx) => {
            const total_item = trx.detail.reduce(
                (sum, item) => sum + item.qty,
                0
            );

            const total_harga = trx.detail.reduce(
                (sum, item) => sum + item.subtotal,
                0
            );

            if (!pelangganMap.has(trx.siswa.id)) {
                pelangganMap.set(trx.siswa.id, {
                    id_siswa: trx.siswa.id,
                    nama_siswa: trx.siswa.nama_siswa,
                    telp: trx.siswa.telp,
                    foto: trx.siswa.foto,
                    total_transaksi: 1,
                    total_item,
                    total_pengeluaran: total_harga,
                    terakhir_transaksi: trx.tanggal,
                });
            } else {
                const pelanggan = pelangganMap.get(trx.siswa.id);
                pelanggan.total_transaksi += 1;
                pelanggan.total_item += total_item;
                pelanggan.total_pengeluaran += total_harga;
            }
        });

        const data = Array.from(pelangganMap.values());

        return res.status(200).json({
            status: true,
            message: `Daftar pelanggan stan ${stan.nama_stan}`,
            total_pelanggan: data.length,
            data,
        });
    } catch (error) {
        console.error("GET STAN PELANGGAN ERROR:", error);
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server.",
        });
    }
};