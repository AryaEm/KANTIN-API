"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const registerSiswa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password, nama_siswa, alamat, telp, jenis_kelamin } = req.body;
        const existing = yield prisma_1.prisma.user.findUnique({ where: { username } });
        if (existing) {
            return res.status(400).json({ status: false, message: "Username already taken" });
        }
        const user = yield prisma_1.prisma.user.create({
            data: {
                uuid: (0, uuid_1.v4)(),
                username,
                password: (0, md5_1.default)(password),
                role: "siswa"
            }
        });
        const siswa = yield prisma_1.prisma.siswa.create({
            data: {
                nama_siswa,
                alamat: alamat !== null && alamat !== void 0 ? alamat : "",
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
});
exports.registerSiswa = registerSiswa;
const registerStan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password, nama_stan, nama_pemilik, telp } = req.body;
        const existing = yield prisma_1.prisma.user.findUnique({ where: { username } });
        if (existing) {
            return res.status(400).json({ status: false, message: "Username already taken" });
        }
        const user = yield prisma_1.prisma.user.create({
            data: {
                uuid: (0, uuid_1.v4)(),
                username,
                password: (0, md5_1.default)(password),
                role: "admin_stan"
            }
        });
        const stan = yield prisma_1.prisma.stan.create({
            data: {
                nama_stan: nama_stan !== null && nama_stan !== void 0 ? nama_stan : "",
                nama_pemilik: nama_pemilik !== null && nama_pemilik !== void 0 ? nama_pemilik : "",
                telp: telp !== null && telp !== void 0 ? telp : "",
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
});
exports.registerStan = registerStan;
const authentication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { username, password } = req.body;
        const findUser = yield prisma_1.prisma.user.findFirst({
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
            data: Object.assign(Object.assign({}, payload), { siswa: (_a = findUser.siswa) !== null && _a !== void 0 ? _a : null, stan: (_b = findUser.stan) !== null && _b !== void 0 ? _b : null })
        });
    }
    catch (error) {
        return res.status(400).json({
            status: false,
            message: `Error: ${error}`
        });
    }
});
exports.authentication = authentication;
