import { NextFunction, Request, Response } from "express";
import Joi from 'joi'

const addDiscountSchema = Joi.object({
    nama_diskon: Joi.string().required(),
    persentase_diskon: Joi.number().min(1).max(100).required(),
    tanggal_awal: Joi.date().required(),
    tanggal_akhir: Joi.date().required().greater(Joi.ref("tanggal_awal")),
});

const updateDiscountSchema = Joi.object({
    nama_diskon: Joi.string().optional(),
    persentase_diskon: Joi.number().min(0).max(100).optional(),
    tanggal_awal: Joi.date().optional(),
    tanggal_akhir: Joi.date().optional(),
}).or("nama_diskon", "persentase_diskon", "tanggal_awal", "tanggal_akhir");


export const verifyCreateDiskon = (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = addDiscountSchema.validate(req.body, { abortEarly: false, convert: true })

    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    req.body = value;

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