import { Request, Response } from "express";
// import fs from "fs";
import md5 from "md5";
// import path from "path";
import { prisma } from "../lib/prisma";
import { supabase } from "../lib/supabase";
import { randomUUID } from "crypto";

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
        if (!authUser) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }

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

        if (!authUser) {
            return res.status(401).json({ status: false, message: "Unauthorized" });
        }

        if (authUser.role !== "siswa") {
            return res.status(403).json({
                status: false,
                message: "Akses ditolak. Hanya siswa yang dapat update siswa.",
            });
        }

        const {
            nama_siswa,
            alamat,
            telp,
            jenis_kelamin,
            foto,
            username,
            password,
        } = req.body;

        const siswa = await prisma.siswa.findFirst({
            where: { id: Number(id) },
            include: { user: true },
        });

        if (!siswa) {
            return res.status(404).json({
                status: false,
                message: "Data siswa tidak ditemukan",
            });
        }

        if (siswa.id_user !== authUser.id) {
            return res.status(403).json({
                status: false,
                message: "Tidak boleh mengupdate data siswa milik orang lain.",
            });
        }

        // ======================
        // UPDATE USER
        // ======================
        const userData: any = {};

        if (typeof username === "string" && username.trim() !== "") {
            userData.username = username;
        }

        if (typeof password === "string" && password.trim() !== "") {
            userData.password = md5(password);
        }

        if (Object.keys(userData).length > 0) {
            await prisma.user.update({
                where: { id: siswa.id_user },
                data: userData,
            });
        }

        // ======================
        // UPDATE SISWA
        // ======================
        const siswaData: any = {};

        if (typeof nama_siswa === "string" && nama_siswa.trim() !== "") {
            siswaData.nama_siswa = nama_siswa;
        }

        if (typeof alamat === "string" && alamat.trim() !== "") {
            siswaData.alamat = alamat;
        }

        if (typeof telp === "string" && telp.trim() !== "") {
            siswaData.telp = telp;
        }

        if (jenis_kelamin === "laki_laki" || jenis_kelamin === "perempuan") {
            siswaData.jenis_kelamin = jenis_kelamin;
        }

        if (typeof foto === "string" && foto.trim() !== "") {
            siswaData.foto = foto;
        }

        if (Object.keys(siswaData).length > 0) {
            await prisma.siswa.update({
                where: { id: Number(id) },
                data: siswaData,
            });
        }

        // ======================
        // RETURN FULL PROFILE
        // ======================
        const profile = await prisma.user.findFirst({
            where: { id: authUser.id },
            include: { siswa: true },
        });

        return res.status(200).json({
            status: true,
            message: "Profil siswa berhasil diperbarui",
            data: profile,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server",
        });
    }
};

export const updateAdminStan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const authUser = res.locals.user;
        if (!authUser) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }

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

        if (!authUser) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }

        const siswa = await prisma.siswa.findFirst({
            where: { id: Number(id) },
        });

        if (!siswa) {
            return res.status(404).json({
                status: false,
                message: "Data siswa tidak ditemukan",
            });
        }

        if (siswa.id_user !== authUser.id) {
            return res.status(403).json({
                status: false,
                message: "Tidak boleh mengupdate foto siswa milik orang lain",
            });
        }

        let fotoUrl = siswa.foto;

        if (req.file) {
            const ext = req.file.originalname.split(".").pop();
            const fileName = `users/${randomUUID()}.${ext}`;

            const { error } = await supabase.storage
                .from("foto_siswa")
                .upload(fileName, req.file.buffer, {
                    contentType: req.file.mimetype,
                    upsert: false,
                });

            if (error) {
                return res.status(500).json({
                    status: false,
                    message: "Gagal upload foto",
                });
            }

            fotoUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/foto_siswa/${fileName}`;
        }

        await prisma.siswa.update({
            where: { id: Number(id) },
            data: { foto: fotoUrl },
        });

        const profile = await prisma.user.findFirst({
            where: { id: authUser.id },
            include: {
                siswa: true,
            },
        });

        return res.status(200).json({
            status: true,
            message: "Foto profil berhasil diperbarui",
            data: profile,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server",
        });
    }
};

export const getProfile = async (req: Request, res: Response) => {
    try {
        const authUser = res.locals.user;

        if (!authUser) {
            return res.status(401).json({
                status: false,
                message: "Unauthorized",
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: authUser.id },
            include: {
                siswa: true,
                stan: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User tidak ditemukan",
            });
        }

        return res.status(200).json({
            status: true,
            message: "Data profile berhasil diambil",
            data: user,
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Terjadi kesalahan server",
            error: String(error),
        });
    }
};