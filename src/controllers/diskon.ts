import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ errorFormat: "pretty" })

export const getDiskonByStan = async (req: Request, res: Response) => {
    try {
        const idStan = Number(req.params.id);

        if (isNaN(idStan)) {
            return res.status(400).json({
                status: false,
                message: "ID stan tidak valid",
            });
        }

        const stan = await prisma.stan.findUnique({
            where: { id: idStan },
        });

        if (!stan) {
            return res.status(404).json({
                status: false,
                message: "Stan tidak ditemukan",
            });
        }

        const now = new Date();

        const diskon = await prisma.diskon.findMany({
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

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server",
        });
    }
};

export const getAllDiskon = async (req: Request, res: Response) => {
    try {
        const authUser = res.locals.user;

        // guard tambahan (defensive)
        // if (authUser.role !== "admin_stan") {
        //   return res.status(403).json({
        //     status: false,
        //     message: "Akses ditolak.",
        //   });
        // }

        const stan = await prisma.stan.findFirst({
            where: { id_user: authUser.id },

        });

        if (!stan) {
            return res.status(404).json({
                status: false,
                message: "Stan tidak ditemukan untuk user ini.",
            });
        }

        const diskon = await prisma.diskon.findMany({
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

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server",
        });
    }
};

export const getActiveDiskon = async (req: Request, res: Response) => {
    try {
        const authUser = res.locals.user;
        const role = authUser.role;

        const now = new Date();

        const diskonAktif = await prisma.diskon.findMany({
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
            const data = diskonAktif.flatMap((diskon) =>
                diskon.menuDiskon.map((md) => {
                    const hargaAwal = md.menu.harga;
                    const hargaDiskon =
                        hargaAwal - (hargaAwal * diskon.persentase_diskon) / 100;

                    return {
                        id_menu: md.menu.id,
                        nama_menu: md.menu.nama_menu,
                        nama_stan: md.menu.stan.nama_stan,
                        harga_awal: hargaAwal,
                        harga_setelah_diskon: Math.round(hargaDiskon),
                        diskon: diskon.persentase_diskon,
                    };
                })
            );

            return res.status(200).json({
                status: true,
                message: "Diskon aktif berhasil diambil",
                data,
            });
        }

        // RESPONSE ADMIN
        if (role === "admin_stan") {
            // ambil stan milik admin
            const stan = await prisma.stan.findUnique({
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
                .filter((diskon) =>
                    diskon.menuDiskon.some(
                        (md) => md.menu.id_stan === stan.id
                    )
                )
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
                            const hargaDiskon =
                                hargaAwal -
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
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server",
        });
    }
};