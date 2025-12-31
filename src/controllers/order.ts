import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ errorFormat: "pretty" })

export const createOrder = async (req: Request, res: Response) => {
    try {
        const authUser = res.locals.user;

        // 1. pastikan role siswa
        if (authUser.role !== "siswa") {
            return res.status(403).json({
                status: false,
                message: "Hanya siswa yang dapat membuat order.",
            });
        }

        const { items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                status: false,
                message: "Item order tidak boleh kosong.",
            });
        }

        // 2. ambil data siswa
        const siswa = await prisma.siswa.findFirst({
            where: { id_user: authUser.id },
        });

        if (!siswa) {
            return res.status(404).json({
                status: false,
                message: "Data siswa tidak ditemukan.",
            });
        }

        const menuIds = items.map((i: any) => i.id_menu);

        // 3. ambil menu
        const menus = await prisma.menu.findMany({
            where: {
                id: { in: menuIds },
            },
            include: {
                menuDiskon: {
                    include: {
                        diskon: true,
                    },
                },
            },
        });

        // 4. validasi menu lengkap
        if (menus.length !== items.length) {
            return res.status(400).json({
                status: false,
                message: "Terdapat menu yang tidak valid.",
            });
        }

        // 5. validasi 1 stan
        const stanId = menus[0].id_stan;
        const bedaStan = menus.some((m) => m.id_stan !== stanId);

        if (bedaStan) {
            return res.status(400).json({
                status: false,
                message: "Order hanya boleh dari satu stan.",
            });
        }

        // 6. validasi menu tersedia
        const menuHabis = menus.find((m) => m.status === "habis");
        if (menuHabis) {
            return res.status(400).json({
                status: false,
                message: `Menu ${menuHabis.nama_menu} sedang habis.`,
            });
        }

        // 7. buat transaksi
        const transaksi = await prisma.transaksi.create({
            data: {
                id_siswa: siswa.id,
                id_stan: stanId,
                status: "belum_dikonfirmasi",
            },
        });

        const now = new Date();

        // 8. buat detail transaksi (snapshot harga + diskon)
        for (const item of items) {
            const menu = menus.find((m) => m.id === item.id_menu)!;

            let hargaFinal = menu.harga;

            // cek diskon aktif
            const diskonAktif = menu.menuDiskon.find(
                (md) =>
                    md.diskon.tanggal_awal <= now &&
                    md.diskon.tanggal_akhir >= now
            );

            if (diskonAktif) {
                hargaFinal =
                    hargaFinal -
                    (hargaFinal * diskonAktif.diskon.persentase_diskon) / 100;
            }

            await prisma.detailTransaksi.create({
                data: {
                    id_transaksi: transaksi.id,
                    id_menu: menu.id,
                    qty: item.qty,
                    harga_beli: Math.round(hargaFinal),
                },
            });
        }

        return res.status(201).json({
            status: true,
            message: "Order berhasil dibuat.",
            data: {
                id_transaksi: transaksi.id,
                status: transaksi.status,
            },
        });

    } catch (error) {
        console.error("CREATE ORDER ERROR:", error);
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server.",
        });
    }
};