"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUpdateDiskon = exports.verifyCreateDiskon = void 0;
const joi_1 = __importDefault(require("joi"));
const addDiscountSchema = joi_1.default.object({
    nama_diskon: joi_1.default.string().required(),
    persentase_diskon: joi_1.default.number().min(1).max(100).required(),
    tanggal_awal: joi_1.default.date().required(),
    tanggal_akhir: joi_1.default.date().required().greater(joi_1.default.ref("tanggal_awal")),
});
const updateDiscountSchema = joi_1.default.object({
    nama_diskon: joi_1.default.string().optional(),
    persentase_diskon: joi_1.default.number().min(0).max(100).optional(),
    tanggal_awal: joi_1.default.date().optional(),
    tanggal_akhir: joi_1.default.date().optional(),
}).or("nama_diskon", "persentase_diskon", "tanggal_awal", "tanggal_akhir");
const verifyCreateDiskon = (req, res, next) => {
    const { error, value } = addDiscountSchema.validate(req.body, { abortEarly: false, convert: true });
    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        });
    }
    req.body = value;
    return next();
};
exports.verifyCreateDiskon = verifyCreateDiskon;
const verifyUpdateDiskon = (req, res, next) => {
    const { error } = updateDiscountSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        });
    }
    return next();
};
exports.verifyUpdateDiskon = verifyUpdateDiskon;
