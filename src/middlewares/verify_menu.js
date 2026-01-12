"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUpdateMenu = exports.verifyAddMenu = void 0;
const joi_1 = __importDefault(require("joi"));
const addDataMenu = joi_1.default.object({
    nama_menu: joi_1.default.string().required(),
    harga: joi_1.default.number().min(0).required(),
    jenis: joi_1.default.string().valid('makanan', 'minuman').required(),
    deskripsi: joi_1.default.string().required(),
    foto: joi_1.default.allow().optional(),
});
const updateDataMenu = joi_1.default.object({
    nama_menu: joi_1.default.string().optional(),
    harga: joi_1.default.number().min(0).optional(),
    jenis: joi_1.default.string().valid('makanan', 'minuman').optional(),
    deskripsi: joi_1.default.string().optional(),
    status: joi_1.default.string().valid('tersedia', 'habis').optional(),
    foto: joi_1.default.allow().optional(),
    // id_stan: Joi.allow().required()
});
const verifyAddMenu = (req, res, next) => {
    console.log("=== VERIFY ADD MENU ===");
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);
    const { error, value } = addDataMenu.validate(req.body, {
        abortEarly: false,
        convert: true,
    });
    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        });
    }
    req.body = value;
    return next();
};
exports.verifyAddMenu = verifyAddMenu;
const verifyUpdateMenu = (req, res, next) => {
    const { error } = updateDataMenu.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        });
    }
    return next();
};
exports.verifyUpdateMenu = verifyUpdateMenu;
