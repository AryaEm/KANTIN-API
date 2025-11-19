import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
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