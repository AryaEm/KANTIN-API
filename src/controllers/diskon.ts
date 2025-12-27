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

export const createDiskon = async (req: Request, res: Response) => {
    try {
        const authUser = res.locals.user;

        if (authUser.role !== "admin_stan") {
            return res.status(403).json({
                status: false,
                message: "Akses ditolak.",
            });
        }

        const { nama_diskon, persentase_diskon, tanggal_awal, tanggal_akhir } =
            req.body;

        const stan = await prisma.stan.findFirst({
            where: { id_user: authUser.id },
        });

        if (!stan) {
            return res.status(404).json({
                status: false,
                message: "Stan tidak ditemukan untuk admin ini.",
            });
        }

        const diskon = await prisma.diskon.create({
            data: {
                nama_diskon,
                persentase_diskon,
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

    } catch (error: any) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server",
            error: error.message,
        });
    }
};

export const getAvailableDiskon = async (req: Request, res: Response) => {
    try {
        const authUser = res.locals.user;

        if (authUser.role !== "admin_stan") {
            return res.status(403).json({
                status: false,
                message: "Akses ditolak.",
            });
        }

        const stan = await prisma.stan.findFirst({
            where: { id_user: authUser.id },
        });

        if (!stan) {
            return res.status(404).json({
                status: false,
                message: "Stan tidak ditemukan.",
            });
        }

        const now = new Date();

        const diskon = await prisma.diskon.findMany({
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

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server",
        });
    }
};

export const updateDiskon = async (req: Request, res: Response) => {
    try {
        const authUser = res.locals.user;
        const diskonId = Number(req.params.id);

        if (isNaN(diskonId)) {
            return res.status(400).json({
                status: false,
                message: "ID diskon tidak valid.",
            });
        }

        // 1. Cari stan milik admin yang login
        const stan = await prisma.stan.findFirst({
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
        const diskon = await prisma.diskon.findFirst({
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
        const tanggalAwalFinal =
            req.body.tanggal_awal ?? diskon.tanggal_awal;

        const tanggalAkhirFinal =
            req.body.tanggal_akhir ?? diskon.tanggal_akhir;

        if (new Date(tanggalAkhirFinal) <= new Date(tanggalAwalFinal)) {
            return res.status(400).json({
                status: false,
                message: "Tanggal akhir harus lebih besar dari tanggal awal.",
            });
        }

        // 4. Bangun data update secara DINAMIS (hindari undefined)
        const dataToUpdate: any = {};

        if (req.body.nama_diskon !== undefined) {
            dataToUpdate.nama_diskon = req.body.nama_diskon;
        }

        if (req.body.persentase !== undefined) {
            dataToUpdate.persentase_diskon = req.body.persentase;
        }

        if (req.body.tanggal_awal !== undefined) {
            dataToUpdate.tanggal_awal = new Date(req.body.tanggal_awal);
        }

        if (req.body.tanggal_akhir !== undefined) {
            dataToUpdate.tanggal_akhir = new Date(req.body.tanggal_akhir);
        }

        // 5. Update diskon
        const updatedDiskon = await prisma.diskon.update({
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

    } catch (error) {
        console.error("UPDATE DISKON ERROR:", error);
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server.",
        });
    }
};

export const getDiskonStatus = async (req: Request, res: Response) => {
  try {
    const authUser = res.locals.user;

    // 1. Ambil stan milik admin login
    const stan = await prisma.stan.findFirst({
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
    const diskonList = await prisma.diskon.findMany({
      where: {
        id_stan: stan.id,
      },
      orderBy: {
        tanggal_awal: "desc",
      },
    });

    const now = new Date();

    // 3. Tambahkan status diskon
    const result = diskonList.map((d) => {
      let status: "belum_aktif" | "aktif" | "expired";

      if (now < d.tanggal_awal) {
        status = "belum_aktif";
      } else if (now > d.tanggal_akhir) {
        status = "expired";
      } else {
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

  } catch (error) {
    console.error("GET ALL DISKON ADMIN ERROR:", error);
    return res.status(500).json({
      status: false,
      message: "Terjadi kesalahan server.",
    });
  }
};