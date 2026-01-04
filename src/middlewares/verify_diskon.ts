import { NextFunction, Request, Response } from "express";
import Joi from 'joi'

const addDiscountSchema = Joi.object({
    nama_diskon: Joi.string().required().messages({
        "string.empty": "Nama diskon tidak boleh kosong.",
        "any.required": "Nama diskon wajib diisi.",
    }),
    persentase_diskon: Joi.number().min(1).max(100).required().messages({
        "number.base": "Persentase harus berupa angka.",
        "number.min": "Persentase minimal 1.",
        "number.max": "Persentase maksimal 100.",
        "any.required": "Persentase wajib diisi.",
    }),
    tanggal_awal: Joi.date().required().messages({
        "date.base": "Tanggal awal harus berupa tanggal yang valid.",
        "any.required": "Tanggal awal wajib diisi.",
    }),
    tanggal_akhir: Joi.date()
        .required()
        .greater(Joi.ref("tanggal_awal"))
        .messages({
            "date.greater": "Tanggal akhir harus lebih besar dari tanggal awal.",
            "any.required": "Tanggal akhir wajib diisi.",
        }),
});

const updateDiscountSchema = Joi.object({
    nama_diskon: Joi.string().optional(),
    persentase_diskon: Joi.number().min(0).max(100).optional(),
    tanggal_awal: Joi.date().optional(),
    tanggal_akhir: Joi.date().optional(),
}).or("nama_diskon", "persentase_diskon", "tanggal_awal", "tanggal_akhir");


export const verifyCreateDiskon = (req: Request, res: Response, next: NextFunction) => {
    const { error } = addDiscountSchema.validate(req.body, { abortEarly: false })

    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}
export const verifyUpdateDiskon = (req: Request, res: Response, next: NextFunction) => {
    const { error } = updateDiscountSchema.validate(req.body, { abortEarly: false })

    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}