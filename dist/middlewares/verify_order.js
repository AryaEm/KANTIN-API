"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRejectOrder = exports.verifyUpdateOrder = exports.verifyCreateOrder = void 0;
const joi_1 = __importDefault(require("joi"));
const createOrderSchema = joi_1.default.object({
    items: joi_1.default.array()
        .items(joi_1.default.object({
        id_menu: joi_1.default.number().required(),
        qty: joi_1.default.number().integer().min(1).max(50).required(),
    }))
        .min(1)
        .max(20)
        .required()
});
const updateOrderSchema = joi_1.default.object({
    status: joi_1.default.string()
        .valid("belum_dikonfirmasi", "proses", "selesai")
        .required(),
});
const rejectOrderSchema = joi_1.default.object({
    reason: joi_1.default.string().max(255).optional()
});
const verifyCreateOrder = (req, res, next) => {
    const { error } = createOrderSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        });
    }
    return next();
};
exports.verifyCreateOrder = verifyCreateOrder;
const verifyUpdateOrder = (req, res, next) => {
    const { error } = updateOrderSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        });
    }
    return next();
};
exports.verifyUpdateOrder = verifyUpdateOrder;
const verifyRejectOrder = (req, res, next) => {
    const { error } = rejectOrderSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join(", "),
        });
    }
    next();
};
exports.verifyRejectOrder = verifyRejectOrder;
