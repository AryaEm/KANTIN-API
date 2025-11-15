import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import { BASE_URL, SECRET } from "../global";
import { v4 as uuidv4 } from "uuid";
import md5 from "md5";
import { sign } from "jsonwebtoken";

const prisma = new PrismaClient({ errorFormat: "pretty" })

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                siswa: true,
                stan: true,
            },
            orderBy: { id: "asc" },
        });

        res.status(200).json({
            status: true,
            message: "Semua user berhasil diambil",
            data: users,
        });
    } catch (error) {
        console.error("Error getAllUsers:", error);
        res.status(500).json({
            status: false,
            message: "Gagal mengambil data users",
            // error: Error.message,
        });
    }
};
