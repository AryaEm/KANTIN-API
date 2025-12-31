import { Request, Response } from "express";
import { JenisMenu, PrismaClient } from "@prisma/client";

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

    const menus = await prisma.menu.findMany({
      where: {
        id_stan: id_stan ? Number(id_stan) : undefined,

        nama_menu: search
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
        nama_menu: "asc",
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

export const addMenu = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;
    const { nama_menu, harga, jenis, deskripsi } = req.body;

    const stan = await prisma.stan.findFirst({
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

    const newMenu = await prisma.menu.create({
      data: {
        nama_menu,
        harga: Number(harga),
        jenis: jenis as JenisMenu,
        deskripsi,
        foto,
        id_stan: stan.id,
      },
    });

    return res.json({
      status: true,
      message: "Menu berhasil ditambahkan",
      data: newMenu,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Terjadi kesalahan server",
      error: String(error),
    });
  }
};

export const updateMenu = async (req: Request, res: Response) => {
  try {
    const id_menu = Number(req.params.id);
    const authUser = res.locals.user; // ambil dari token JWT

    // cek menu ada atau nggak
    const menu = await prisma.menu.findUnique({
      where: { id: id_menu },
    });

    if (!menu) {
      return res.status(404).json({
        status: false,
        message: "Menu tidak ditemukan"
      });
    }

    // cek stan mana yang dimiliki user login
    const stanPemilik = await prisma.stan.findFirst({
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
    const updated = await prisma.menu.update({
      where: { id: id_menu },
      data: {
        ...req.body,
        harga: req.body.harga ? Number(req.body.harga) : menu.harga,
      }
    });

    return res.status(200).json({
      status: true,
      message: "Berhasil update menu",
      data: updated
    });

  } catch (error: any) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Terjadi kesalahan server",
      error: error.message,
    });
  }
};

export const getMenusForAdminStan = async (req: Request, res: Response) => {
  try {
    const authUser = res.locals.user;

    // pastikan role admin stan
    if (authUser.role !== "admin_stan") {
      return res.status(403).json({
        status: false,
        message: "Akses ditolak.",
      });
    }

    // cari stan milik user login
    const stan = await prisma.stan.findFirst({
      where: { id_user: authUser.id },
    });

    if (!stan) {
      return res.status(404).json({
        status: false,
        message: "Stan tidak ditemukan untuk user ini.",
      });
    }

    // ambil menu milik stan tersebut
    const menus = await prisma.menu.findMany({
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

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Terjadi kesalahan server",
    });
  }
};

export const deleteMenu = async (req: Request, res: Response) => {
  try {
    const id_menu = Number(req.params.id);
    const authUser = res.locals.user;

    const menu = await prisma.menu.findUnique({
      where: { id: id_menu },
    });

    if (!menu) {
      return res.status(404).json({
        status: false,
        message: "Menu tidak ditemukan",
      });
    }

    const stanPemilik = await prisma.stan.findFirst({
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

    await prisma.menu.delete({
      where: { id: id_menu },
    });

    return res.status(200).json({
      status: true,
      message: "Menu berhasil dihapus",
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