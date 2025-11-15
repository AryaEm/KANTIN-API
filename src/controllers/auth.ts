import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import md5 from "md5";
import { sign } from "jsonwebtoken";

const prisma = new PrismaClient({ errorFormat: "pretty" })

export const registerSiswa = async (req: Request, res: Response) => {
    try {
        const { username, password, nama_siswa, alamat, telp, jenis_kelamin } = req.body;

        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUser) {
            return res.status(400).json({ status: false, message: "Username already registered" });
        }

        const user = await prisma.user.create({
            data: {
                uuid: uuidv4(),
                username,
                password: md5(password),
                role: "siswa"
            }
        });

        const siswa = await prisma.siswa.create({
            data: {
                nama_siswa,
                alamat,
                telp,
                jenis_kelamin,
                id_user: user.id
            }
        });

        return res.status(201).json({
            status: true,
            message: "Siswa registered successfully",
            data: {
                user,
                siswa
            }
        });

    } catch (error: any) {
        return res.status(500).json({
            status: false,
            message: error?.message || "Internal server error"
        });
    }
};

export const registerAdminStan = async (req: Request, res: Response) => {
    try {
        const { username, password, nama_stan, nama_pemilik, telp } = req.body;

        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUser) {
            return res.status(400).json({ status: false, message: "Username already registered" });
        }

        const user = await prisma.user.create({
            data: {
                uuid: uuidv4(),
                username,
                password: md5(password),
                role: "admin_stan"
            }
        });

        const stan = await prisma.stan.create({
            data: {
                nama_stan,
                nama_pemilik,
                telp,
                id_user: user.id
            }
        });

        return res.status(201).json({
            status: true,
            message: "Admin stan registered successfully",
            data: {
                user,
                stan
            }
        });

    } catch (error: any) {
        return res.status(500).json({
            status: false,
            message: error?.message || "Internal server error"
        });
    }
};