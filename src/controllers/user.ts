import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import fs from "fs";    
import md5 from "md5";
import path from "path";

const prisma = new PrismaClient({ errorFormat: "pretty" })

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                siswa: true,
                stan: true
            },
            orderBy: {
                id: "asc"
            }
        });

        return res.json({
            status: true,
            message: "Daftar user berhasil diambil",
            data: users
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server",
            error
        });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const authUser = res.locals.user;

        const findUser = await prisma.user.findFirst({
            where: { id: Number(id) },
        });

        if (!findUser) {
            return res.status(404).json({
                status: false,
                message: `User tidak ditemukan.`,
            });
        }

        if (authUser.id !== findUser.id) {
            return res.status(403).json({
                status: false,
                message: "Tidak boleh menghapus user lain."
            });
        }
        const deleteUser = await prisma.user.delete({
            where: { id: Number(id) },
        });

        return res.status(200).json({
            status: true,
            message: `User role ${findUser.role} berhasil dihapus`,
            data: deleteUser,
        });

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            status: false,
            message: `Terjadi sebuah kesalahan : ${error}.`,
        });
    }
};

export const updateSiswa = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const authUser = res.locals.user;

        if (authUser.role !== "siswa") {
            return res.status(403).json({
                status: false,
                message: "Akses ditolak. Hanya siswa yang dapat update siswa."
            });
        }

        const {
            nama_siswa,
            alamat,
            telp,
            jenis_kelamin,
            foto,
            username,
            password
        } = req.body;

        const findSiswa = await prisma.siswa.findFirst({
            where: { id: Number(id) },
            include: { user: true }
        });

        if (!findSiswa) {
            return res.status(404).json({
                status: false,
                message: "Data siswa tidak ditemukan"
            });
        }

        if (findSiswa.id_user !== authUser.id) {
            return res.status(403).json({
                status: false,
                message: "Tidak boleh mengupdate data siswa milik orang lain."
            });
        }

        const updatedUser = await prisma.user.update({
            where: { id: findSiswa.id_user },
            data: {
                username: username || findSiswa.user.username,
                password: password ? md5(password) : findSiswa.user.password
            }
        });

        const updatedSiswa = await prisma.siswa.update({
            where: { id: Number(id) },
            data: {
                nama_siswa: nama_siswa !== undefined ? nama_siswa : findSiswa.nama_siswa,
                alamat: alamat !== undefined ? alamat : findSiswa.alamat,
                telp: telp !== undefined ? telp : findSiswa.telp,
                jenis_kelamin: jenis_kelamin !== undefined ? jenis_kelamin : findSiswa.jenis_kelamin,
                foto: foto !== undefined ? foto : findSiswa.foto
            }
        })

        return res.status(200).json({
            status: true,
            message: "Siswa berhasil diperbarui",
            data: {
                user: updatedUser,
                siswa: updatedSiswa
            }
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: `Terjadi kesalahan: ${error}`
        });
    }
};

export const updateAdminStan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const authUser = res.locals.user;

        if (authUser.role !== "admin_stan") {
            return res.status(403).json({
                status: false,
                message: "Akses ditolak. Hanya admin stan yang dapat update data ini."
            });
        }

        const {
            nama_stan,
            nama_pemilik,
            telp,
            username,
            password
        } = req.body;

        const findStan = await prisma.stan.findFirst({
            where: { id: Number(id) },
            include: { user: true }
        });

        if (!findStan) {
            return res.status(404).json({
                status: false,
                message: "Data stan tidak ditemukan"
            });
        }

        if (findStan.id_user !== authUser.id) {
            return res.status(403).json({
                status: false,
                message: "Tidak boleh mengupdate data stan milik orang lain."
            });
        }

        const updatedUser = await prisma.user.update({
            where: { id: findStan.id_user },
            data: {
                username: username || findStan.user.username,
                password: password ? md5(password) : findStan.user.password
            }
        });

        const updatedStan = await prisma.stan.update({
            where: { id: Number(id) },
            data: {
                nama_stan: nama_stan ?? findStan.nama_stan,
                nama_pemilik: nama_pemilik ?? findStan.nama_pemilik,
                telp: telp ?? findStan.telp
            }
        });

        return res.status(200).json({
            status: true,
            message: "Data admin stan berhasil diperbarui",
            data: {
                user: updatedUser,
                stan: updatedStan
            }
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: `Terjadi kesalahan: ${error}`
        });
    }
};

export const updateFotoSiswa = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const authUser = res.locals.user;

        if (authUser.role !== "siswa") {
            return res.status(403).json({
                status: false,
                message: "Akses ditolak.",
            });
        }

        const siswa = await prisma.siswa.findFirst({
            where: { id: Number(id) },
        });

        if (!siswa) {
            return res.status(404).json({
                status: false,
                message: "User tidak ada.",
            });
        }

        if (siswa.id_user !== authUser.id) {
            return res.status(403).json({
                status: false,
                message: "Tidak boleh mengupdate foto siswa milik orang lain.",
            });
        }

        let filename = siswa.foto ?? "";

        if (req.file) {
            filename = req.file.filename;

            if (siswa.foto) {
                const oldPath = path.join(__dirname, "../../public/foto_siswa", siswa.foto);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
        }

        const updatePicture = await prisma.siswa.update({
            where: { id: Number(id) },
            data: { foto: filename },
        });

        return res.json({
            status: true,
            data: updatePicture,
            message: "Foto telah diganti",
        });
    } catch (error) {
        return res.status(400).json({
            status: false,
            error: String(error),
        });
    }
};