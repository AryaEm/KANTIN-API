import { Request, Response } from "express";
import { JenisMenu, PrismaClient } from "@prisma/client";
import fs from "fs";
import { BASE_URL } from "../global";
import md5 from "md5";

const prisma = new PrismaClient({ errorFormat: "pretty" })

export const getAllStan = async (req: Request, res: Response) => {
    try {
        const data = await prisma.stan.findMany({
            select: {
                id: true,
                nama_stan: true,
                nama_pemilik: true
            }
        });

        return res.status(200).json({
            status: true,
            message: "Daftar semua stan berhasil dimuat",
            data
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: `Terjadi kesalahan server: ${error}`
        });
    }
};

export const getAllMenusForSiswa = async (req: Request, res: Response) => {
  try {
    const { search, jenis, harga_min, harga_max, id_stan } = req.query;

    // Ambil nama stan (jika id_stan diberikan)
    let nama_stan = "Semua Kantin";

    if (id_stan) {
      const stan = await prisma.stan.findFirst({
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

    // Query menu
    const menus = await prisma.menu.findMany({
      where: {
        id_stan: id_stan ? Number(id_stan) : undefined,

        nama_makanan: search
          ? {
              contains: search.toString(),
            }
          : undefined,

        jenis: jenis
          ? {
              equals: jenis.toString() as JenisMenu,
            }
          : undefined,

        harga:
          harga_min || harga_max
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
        nama_makanan: "asc",
      },
    });

    return res.status(200).json({
      status: true,
      message: `Menu berhasil ditampilkan (${nama_stan}).`,
      data: menus,
    });
  } catch (err) {
    console.log("GET MENU SISWA ERROR:", err);
    return res.status(500).json({
      status: false,
      message: "Terjadi kesalahan pada server.",
    });
  }
};