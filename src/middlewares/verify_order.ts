import { Request, Response, NextFunction } from "express";
import Joi from "joi";

const createOrderSchema = Joi.object({
    items: Joi.array()
        .items(
            Joi.object({
                id_menu: Joi.number().required(),
                qty: Joi.number().min(1).required(),
            })
        )
        .min(1)
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