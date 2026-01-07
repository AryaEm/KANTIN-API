import { Request, Response, NextFunction } from "express";
import Joi from "joi";

const createOrderSchema = Joi.object({
    id_stan: Joi.number().required().messages({
        "any.required": "ID stan wajib diisi",
        "number.base": "ID stan harus berupa angka",
    }),
    items: Joi.array()
        .items(
            Joi.object({
                id_menu: Joi.number().required(),
                qty: Joi.number().integer().min(1).max(50).required(),
            })
        )
        .min(1)
        .max(20)
        .required()
});

const updateOrderSchema = Joi.object({
    status: Joi.string()
        .valid("belum_dikonfirmasi", "proses", "selesai")
        .required(),
});

export const verifyCreateOrder = (req: Request, res: Response, next: NextFunction) => {
    const { error } = createOrderSchema.validate(req.body, { abortEarly: false })

    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}

export const verifyUpdateOrder = (req: Request, res: Response, next: NextFunction) => {
    const { error } = updateOrderSchema.validate(req.body, { abortEarly: false })

    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}