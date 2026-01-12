"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyLoginUser = exports.verifyRegisterAdminStan = exports.verifyUpdateAdminStan = exports.verifyUpdateUser = exports.verifyRegisterUser = void 0;
const joi_1 = __importDefault(require("joi"));
const registerDataSiswa = joi_1.default.object({
    username: joi_1.default.string().required(),
    password: joi_1.default.string().min(8).required(),
    nama_siswa: joi_1.default.string().required(),
    alamat: joi_1.default.string().allow("").optional(),
    telp: joi_1.default.string().required(),
    foto: joi_1.default.allow().optional(),
    jenis_kelamin: joi_1.default.string().valid("laki_laki", "perempuan").optional(),
});
const updateDataSiswa = joi_1.default.object({
    username: joi_1.default.string().optional(),
    password: joi_1.default.string().min(8).optional(),
    nama_siswa: joi_1.default.string().optional(),
    alamat: joi_1.default.string().optional(),
    telp: joi_1.default.string().optional(),
    foto: joi_1.default.allow().optional(),
    jenis_kelamin: joi_1.default.string().valid("laki_laki", "perempuan").optional(),
});
const registerDataAdminStan = joi_1.default.object({
    username: joi_1.default.string().required(),
    password: joi_1.default.string().min(8).required(),
    nama_stan: joi_1.default.string().required(),
    nama_pemilik: joi_1.default.string().required(),
    telp: joi_1.default.string().optional(),
});
const updateDataAdminStan = joi_1.default.object({
    username: joi_1.default.string().optional(),
    password: joi_1.default.string().min(8).optional(),
    nama_stan: joi_1.default.string().optional(),
    nama_pemilik: joi_1.default.string().optional(),
    telp: joi_1.default.string().optional(),
});
const loginUser = joi_1.default.object({
    username: joi_1.default.string().required(),
    password: joi_1.default.string().min(8).alphanum().required()
});
const verifyRegisterUser = (req, res, next) => {
    const { error } = registerDataSiswa.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        });
    }
    return next();
};
exports.verifyRegisterUser = verifyRegisterUser;
const verifyUpdateUser = (req, res, next) => {
    const { error } = updateDataSiswa.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        });
    }
    return next();
};
exports.verifyUpdateUser = verifyUpdateUser;
const verifyUpdateAdminStan = (req, res, next) => {
    const { error } = updateDataAdminStan.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        });
    }
    return next();
};
exports.verifyUpdateAdminStan = verifyUpdateAdminStan;
const verifyRegisterAdminStan = (req, res, next) => {
    const { error } = registerDataAdminStan.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        });
    }
    return next();
};
exports.verifyRegisterAdminStan = verifyRegisterAdminStan;
const verifyLoginUser = (req, res, next) => {
    const { error } = loginUser.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        });
    }
    return next();
};
exports.verifyLoginUser = verifyLoginUser;
