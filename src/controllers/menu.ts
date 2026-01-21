import { Request, Response } from "express";
import { JenisMenu } from "@prisma/client";
import fs from "fs";
import path from "path";
import { prisma } from "../lib/prisma";
import { supabase } from "../lib/supabase";
import { randomUUID } from "crypto";

export const getAllStan = async (req: Request, res: Response) => {
  try {
    const data = await prisma.stan.findMany({
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

  } catch (error) {
    return res.status(500).json({
      status: false,
      message: `Terjadi kesalahan server: ${error}`
    });
  }
};

export const getMenuByStanId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { jenis, diskon, status } = req.query;
    const now = new Date();

    const menuWhere: any = {};

    if (jenis) {
      menuWhere.jenis = jenis; // makanan | minuman
    }

    if (status) {
      menuWhere.status = status; // tersedia | habis
    }

    const stan = await prisma.stan.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        nama_stan: true,
        nama_pemilik: true,
        telp: true,
        menu: {
          where: menuWhere,
          select: {
            id: true,
            nama_menu: true,
            deskripsi: true,
            jenis: true,
            harga: true,
            foto: true,
            status: true,
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

    let menus = stan.menu.map((menu) => {
      const activeDiskon = menu.menuDiskon.find(
        (md) =>
          now >= md.diskon.tanggal_awal &&
          now <= md.diskon.tanggal_akhir
      );

      return {
        id: menu.id,
        name: menu.nama_menu,
        description: menu.deskripsi,
        jenis_menu: menu.jenis,
        price: menu.harga,
        image: menu.foto,
        status: menu.status,
        discount: activeDiskon
          ? activeDiskon.diskon.persentase_diskon
          : 0,
      };
    });

    if (diskon === "true") {
      menus = menus.filter((m) => m.discount > 0);
    }

    if (diskon === "false") {
      menus = menus.filter((m) => m.discount === 0);
    }

    return res.status(200).json({
      status: true,
      data: {
        id: stan.id,
        name: stan.nama_stan,
        owner: stan.nama_pemilik,
        telp: stan.telp,
        menus,
      },
    });
  } catch (error) {
    console.error("GET MENU BY STAN ERROR:", error);
    return res.status(500).json({
      status: false,
      message: "Terjadi kesalahan server",
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
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized",
      });
    }
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

    let fotoUrl = "";
    if (req.file) {
      const ext = req.file.originalname.split(".").pop();
      const fileName = `menus/${randomUUID()}.${ext}`;

      const { error } = await supabase.storage
        .from("foto_menu")
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (error) {
        return res.status(500).json({
          status: false,
          message: "Gagal upload foto",
          error: error.message,
        });
      }

      fotoUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/foto_menu/${fileName}`;
    }

    const newMenu = await prisma.menu.create({
      data: {
        nama_menu: nama_menu ?? "",
        harga: Number(harga),
        jenis: jenis as JenisMenu,
        deskripsi: deskripsi ?? "",
        foto: fotoUrl ?? "",
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
    return res.status(400).json({
      status: false,
      message: "Terjadi kesalahan server",
      error: String(error),
    });
  }
};

export const updateMenu = async (req: Request, res: Response) => {
  try {
    const id_menu = Number(req.params.id);
    const authUser = res.locals.user;

    if (!authUser) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized",
      });
    }

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

    if (!stanPemilik || menu.id_stan !== stanPemilik.id) {
      return res.status(403).json({
        status: false,
        message: "Tidak boleh mengupdate menu milik stan lain",
      });
    }

    const {
      nama_menu,
      harga,
      jenis,
      deskripsi,
      status,
    } = req.body;

    const data: any = {};

    if (nama_menu !== undefined && nama_menu !== "")
      data.nama_menu = nama_menu;

    if (harga !== undefined)
      data.harga = Number(harga);

    if (jenis !== undefined && jenis !== "")
      data.jenis = jenis;

    if (deskripsi !== undefined && deskripsi !== "")
      data.deskripsi = deskripsi;

    if (status !== undefined && status !== "")
      data.status = status;

    let oldFotoPath: string | null = null;

    if (req.file) {
      const ext = req.file.originalname.split(".").pop();
      const fileName = `menus/${randomUUID()}.${ext}`;

      const { error } = await supabase.storage
        .from("foto_menu")
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (error) {
        return res.status(500).json({
          status: false,
          message: "Gagal upload foto menu",
          error: error.message,
        });
      }

      data.foto = `${process.env.SUPABASE_URL}/storage/v1/object/public/foto_menu/${fileName}`;

      if (menu.foto) {
        oldFotoPath = menu.foto.split("/foto_menu/")[1] ?? null;
      }
    }

    const updated = await prisma.menu.update({
      where: { id: id_menu },
      data,
    });

    if (oldFotoPath) {
      await supabase.storage
        .from("foto_menu")
        .remove([oldFotoPath]);
    }

    return res.status(200).json({
      status: true,
      message: "Berhasil update menu",
      data: updated,
    });

  } catch (error: any) {
    console.error("UPDATE MENU ERROR:", error);
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
        message: "Stan tidak ditemukan untuk user ini.",
      });
    }

    const now = new Date();

    const menus = await prisma.menu.findMany({
      where: {
        id_stan: stan.id,
      },
      orderBy: {
        nama_menu: "asc",
      },
      select: {
        id: true,
        nama_menu: true,
        deskripsi: true,
        jenis: true,
        harga: true,
        foto: true,
        status: true,
        menuDiskon: {
          select: {
            diskon: {
              select: {
                id: true,
                persentase_diskon: true,
                tanggal_awal: true,
                tanggal_akhir: true,
              },
            },
          },
        },
      },
    });

    const mappedMenus = menus.map((menu) => {
      const activeDiskon = menu.menuDiskon.find(
        (md) =>
          now >= md.diskon.tanggal_awal &&
          now <= md.diskon.tanggal_akhir
      );

      return {
        id: menu.id,
        name: menu.nama_menu,
        description: menu.deskripsi,
        jenis_menu: menu.jenis,
        price: menu.harga,
        image: menu.foto,
        status: menu.status,
        discount: activeDiskon
          ? activeDiskon.diskon.persentase_diskon
          : 0,
        activeDiskonId: activeDiskon
          ? activeDiskon.diskon.id
          : null,
      };
    });
    ;

    return res.status(200).json({
      status: true,
      message: `Menu berhasil ditampilkan (${stan.nama_stan})`,
      data: mappedMenus,
    });

  } catch (error) {
    console.error("GET MENU ADMIN ERROR:", error);
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
    if (!authUser) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized",
      });
    }

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

    if (menu.foto) {
      const fotoPath = path.join(
        __dirname,
        "../../public/foto_menu",
        menu.foto
      );

      if (fs.existsSync(fotoPath)) {
        fs.unlinkSync(fotoPath);
      }
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

export const getBestSellerForAdminStan = async (req: Request, res: Response) => {
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
        message: "Stan tidak ditemukan untuk user ini.",
      });
    }

    const bestSellers = await prisma.menu.findMany({
      where: { id_stan: stan.id },
      orderBy: {
        detailTransaksi: {
          _count: "desc",
        },
      },
      take: 3,
      select: {
        id: true,
        nama_menu: true,
        deskripsi: true,
        jenis: true,
        harga: true,
        foto: true,
        status: true,
        _count: {
          select: { detailTransaksi: true },
        },
      },
    });

    const mappedBestSellers = bestSellers.map(menu => ({
      id: menu.id,
      name: menu.nama_menu,
      description: menu.deskripsi,
      jenis_menu: menu.jenis,
      price: menu.harga,
      image: menu.foto,
      status: menu.status,
      totalTerjual: menu._count.detailTransaksi,
    }));

    return res.status(200).json({
      status: true,
      message: `Best seller (${stan.nama_stan}) berhasil ditampilkan`,
      data: mappedBestSellers,
    });

  } catch (error) {
    console.error("GET BEST SELLER ERROR:", error);
    return res.status(500).json({
      status: false,
      message: "Terjadi kesalahan server",
    });
  }
};