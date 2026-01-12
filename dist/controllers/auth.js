"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authentication = exports.registerStan = exports.registerSiswa = void 0;
const uuid_1 = require("uuid");
const md5_1 = __importDefault(require("md5"));
const global_1 = require("../global");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const registerSiswa = async (req, res) => {
    try {
        const { username, password, nama_siswa, alamat, telp, jenis_kelamin } = req.body;
        const existing = await prisma_1.prisma.user.findUnique({ where: { username } });
        if (existing) {
            return res.status(400).json({ status: false, message: "Username already taken" });
        }
        const user = await prisma_1.prisma.user.create({
            data: {
                uuid: (0, uuid_1.v4)(),
                username,
                password: (0, md5_1.default)(password),
                role: "siswa"
            }
        });
        const siswa = await prisma_1.prisma.siswa.create({
            data: {
                nama_siswa,
                alamat: alamat ?? "",
                telp,
                jenis_kelamin,
                id_user: user.id
            }
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, global_1.SECRET, { expiresIn: "1d" });
        return res.status(200).json({
            status: true,
            message: "Register siswa berhasil",
            token,
            user,
            siswa
        });
    }
    catch (error) {
        return res.status(400).json({ status: false, message: `Error: ${error}` });
    }
};
exports.registerSiswa = registerSiswa;
const registerStan = async (req, res) => {
    try {
        const { username, password, nama_stan, nama_pemilik, telp } = req.body;
        const existing = await prisma_1.prisma.user.findUnique({ where: { username } });
        if (existing) {
            return res.status(400).json({ status: false, message: "Username already taken" });
        }
        const user = await prisma_1.prisma.user.create({
            data: {
                uuid: (0, uuid_1.v4)(),
                username,
                password: (0, md5_1.default)(password),
                role: "admin_stan"
            }
        });
        const stan = await prisma_1.prisma.stan.create({
            data: {
                nama_stan: nama_stan ?? "",
                nama_pemilik: nama_pemilik ?? "",
                telp: telp ?? "",
                id_user: user.id
            }
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, global_1.SECRET, { expiresIn: "1d" });
        return res.status(200).json({
            status: true,
            message: "Register stan berhasil",
            token,
            user,
            stan
        });
    }
    catch (error) {
        return res.status(400).json({ status: false, message: `Error: ${error}` });
    }
};
exports.registerStan = registerStan;
const authentication = async (req, res) => {
    try {
        const { username, password } = req.body;
        const findUser = await prisma_1.prisma.user.findFirst({
            where: { username, password: (0, md5_1.default)(password) },
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
        const token = jsonwebtoken_1.default.sign(payload, global_1.SECRET, { expiresIn: "1d" });
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
    }
    catch (error) {
        return res.status(400).json({
            status: false,
            message: `Error: ${error}`
        });
    }
};
exports.authentication = authentication;
