import { Request, Response, NextFunction } from "express";
import Joi from "joi";

const createOrderSchema = Joi.object({
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

const rejectOrderSchema = Joi.object({
    reason: Joi.string().max(255).optional()
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

export const verifyRejectOrder = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
    const { error } = rejectOrderSchema.validate(req.body, { abortEarly: false });

    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join(", "),
        });
    }

    next();
};