import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import md5 from "md5";
import { SECRET } from "../global";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

export const registerSiswa = async (req: Request, res: Response) => {
    try {
        const {
            username,
            password,
            nama_siswa,
            alamat,
            telp,
            jenis_kelamin
        } = req.body;

        const existing = await prisma.user.findUnique({ where: { username } });
        if (existing) {
            return res.status(400).json({ status: false, message: "Username already taken" });
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
                alamat: alamat ?? "",
                telp,
                jenis_kelamin,
                id_user: user.id
            }
        });

        const token = jwt.sign(
            { id: user.id, role: user.role },
            SECRET!,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            status: true,
            message: "Register siswa berhasil",
            token,
            user,
            siswa
        });

    } catch (error) {
        return res.status(400).json({ status: false, message: `Error: ${error}` });
    }
};


export const registerStan = async (req: Request, res: Response) => {
    try {
        const {
            username,
            password,
            nama_stan,
            nama_pemilik,
            telp
        } = req.body;

        const existing = await prisma.user.findUnique({ where: { username } });
        if (existing) {
            return res.status(400).json({ status: false, message: "Username already taken" });
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
                nama_stan: nama_stan ?? "",
                nama_pemilik: nama_pemilik ?? "",
                telp: telp ?? "",
                id_user: user.id
            }
        });

        const token = jwt.sign(
            { id: user.id, role: user.role },
            SECRET!,
            { expiresIn: "1d" }
        );
        return res.status(200).json({
            status: true,
            message: "Register stan berhasil",
            token,
            user,
            stan
        });

    } catch (error) {
        return res.status(400).json({ status: false, message: `Error: ${error}` });
    }
};

export const authentication = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        const findUser = await prisma.user.findFirst({
            where: { username, password: md5(password) },
            include: {
                siswa: true,
                stan: true
            }
        });

        if (!findUser) {
            return res.status(400).json({
                status: false,
                logged: false,
                message: "Username or password is invalid"
            });
        }

        const payload = {
            id: findUser.id,
            uuid: findUser.uuid,
            username: findUser.username,
            role: findUser.role
        };

        const token = jwt.sign(payload, SECRET!, { expiresIn: "1d" });

        return res.status(200).json({
            status: true,
            logged: true,
            message: "Login successful",
            token,
            data: {
                ...payload,
                siswa: findUser.siswa ?? null,
                stan: findUser.stan ?? null
            }
        });

    } catch (error) {
        return res.status(400).json({
            status: false,
            message: `Error: ${error}`
        });
    }
};