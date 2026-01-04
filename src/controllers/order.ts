import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ errorFormat: "pretty" })

export const createTransaksi = async (req: Request, res: Response) => {
    try {
        const authUser = res.locals.user; // siswa
        const { items } = req.body;

        // 1. Ambil data siswa
        const siswa = await prisma.siswa.findFirst({
            where: { id_user: authUser.id },
        });

        if (!siswa) {
            return res.status(404).json({
                status: false,
                message: "Data siswa tidak ditemukan",
            });
        }

        // 2. Ambil semua menu yang dipesan
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

        // 3. Validasi 1 transaksi = 1 stan
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

        // 4. Siapkan detail transaksi (SNAPSHOT)
        let totalHarga = 0;

        const detailData = items.map((item: any) => {
            const menu = menus.find((m) => m.id === item.id_menu)!;

            // cari diskon aktif (kalau ada)
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

        // 5. Generate kode transaksi
        const kodeTransaksi = `TRX-${Date.now()}`;

        // 6. Simpan transaksi + detail (TRANSACTION DB)
        const transaksi = await prisma.transaksi.create({
            data: {
                kode_transaksi: kodeTransaksi,
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

        // 7. RESPONSE LENGKAP
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