import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import { BASE_URL, SECRET } from "../global";
import { v4 as uuidv4 } from "uuid";
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
        const authUser = req.body.user;

        const findUser = await prisma.user.findFirst({
            where: { id: Number(id) },
        });

        if (!findUser) {
            return res.status(200).json({
                status: false,
                message: `User tidak ditemukan.`,
            });
        }

        if (authUser.role !== findUser.role) {
            return res.status(403).json({
                status: false,
                message: `Tidak diizinkan menghapus user dengan role ${findUser.role}.`,
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
        const authUser = req.body.user;

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

export const updateFotoSiswa = async (req: Request, res: Response) => {
    try {
        const { id } = req.params

        const findUser = await prisma.siswa.findFirst({ where: { id: Number(id) } })
        if (!findUser) return res
            .status(200)
            .json({
                message: 'User tidak ada',
            })

        let filename = findUser.foto
        if (req.file) {
            filename = req.file.filename // UPDATE NAMA FILE SESUAI GAMBAR YANG DIUPLOAD

            let path = `${BASE_URL}/../public/foto_siswa/${findUser.foto}` // CEK FOTO LAMA PADA FOLDER
            let exist = fs.existsSync(path)

            if (exist && findUser.foto !== ``) fs.unlinkSync(path) //MENGHAPUS FOTO LAMA JIKA ADA
        }

        const updatePicture = await prisma.siswa.update({
            data: { foto: filename },
            where: { id: Number(id) }
        })
        return res.json({
            status: true,
            data: updatePicture,
            message: 'Foto telah diganti'
        })

    } catch (error) {
        return res.json({
            status: false,
            error: `${error}`
        }).status(400)
    }
}