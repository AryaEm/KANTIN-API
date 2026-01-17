import { NextFunction, Request, Response } from "express";
import Joi from 'joi'

const addDataMenu = Joi.object({
    nama_menu: Joi.string().required(),
    harga: Joi.number().min(0).required(),
    jenis: Joi.string().valid('makanan', 'minuman').required(),
    deskripsi: Joi.string().required(),
    foto: Joi.allow().optional(),
})

const updateDataMenu = Joi.object({
    nama_menu: Joi.string().optional(),
    harga: Joi.number().min(0).optional(),
    jenis: Joi.string().valid('makanan', 'minuman').optional(),
    deskripsi: Joi.string().optional(),
    status: Joi.string().valid('tersedia', 'habis').optional(),
});

export const verifyAddMenu = (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = addDataMenu.validate(req.body, {
        abortEarly: false,
        convert: true,
    })

    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    req.body = value;
    return next()
}

export const verifyUpdateMenu = (req: Request, res: Response, next: NextFunction) => {
    const { error } = updateDataMenu.validate(req.body, { abortEarly: false })

    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}