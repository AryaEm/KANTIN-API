import { NextFunction, Request, Response } from "express";
import Joi from 'joi'

const registerDataSiswa = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(8).required(),
    nama_siswa: Joi.string().required(),
    alamat: Joi.string().allow("").optional(),
    telp: Joi.string().required(),
    foto: Joi.allow().optional(),
    jenis_kelamin: Joi.string().valid("laki_laki", "perempuan").optional(),
})

const updateDataSiswa = Joi.object({
    username: Joi.string().optional(),
    password: Joi.string().min(8).optional(),
    nama_siswa: Joi.string().optional(),
    alamat: Joi.string().optional(),
    telp: Joi.string().optional(),
    foto: Joi.allow().optional(),
    jenis_kelamin: Joi.string().valid("laki_laki", "perempuan").optional(),
})

const registerDataAdminStan = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(8).required(),
    nama_stan: Joi.string().required(),
    nama_pemilik: Joi.string().required(),
    telp: Joi.string().optional(),
})

const updateDataAdminStan = Joi.object({
    username: Joi.string().optional(),
    password: Joi.string().min(8).optional(),
    nama_stan: Joi.string().optional(),
    nama_pemilik: Joi.string().optional(),
    telp: Joi.string().optional(),
})


const loginUser = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(8).alphanum().required()
})

export const verifyRegisterUser = (req: Request, res: Response, next: NextFunction) => {
    const { error } = registerDataSiswa.validate(req.body, { abortEarly: false })

    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}

export const verifyUpdateUser = (req: Request, res: Response, next: NextFunction) => {
    const { error } = updateDataSiswa.validate(req.body, { abortEarly: false })

    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}

export const verifyUpdateAdminStan = (req: Request, res: Response, next: NextFunction) => {
    const { error } = updateDataAdminStan.validate(req.body, { abortEarly: false })

    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}

export const verifyRegisterAdminStan = (req: Request, res: Response, next: NextFunction) => {
    const { error } = registerDataAdminStan.validate(req.body, { abortEarly: false })

    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}

export const verifyLoginUser = (req: Request, res: Response, next: NextFunction) => {
    const { error } = loginUser.validate(req.body, { abortEarly: false })

    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}

export const verifyGetSiswaHistory = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { type, year, month, week } = req.query;

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (!type) {
        // tanpa filter → lanjut
        res.locals.filter = {};
        return next();
    }

    if (type !== "month" && type !== "week") {
        return res.status(400).json({
            status: false,
            message: "Type filter tidak valid. Gunakan 'month' atau 'week'.",
        });
    }

    if (type === "month") {
        if (!year || !month) {
            return res.status(400).json({
                status: false,
                message: "Parameter year dan month wajib diisi.",
            });
        }

        const y = Number(year);
        const m = Number(month);

        if (isNaN(y) || isNaN(m) || m < 1 || m > 12) {
            return res.status(400).json({
                status: false,
                message: "Year atau month tidak valid.",
            });
        }

        startDate = new Date(y, m - 1, 1);
        endDate = new Date(y, m, 1);
    }

    if (type === "week") {
        if (!year || !week) {
            return res.status(400).json({
                status: false,
                message: "Parameter year dan week wajib diisi.",
            });
        }

        const y = Number(year);
        const w = Number(week);

        if (isNaN(y) || isNaN(w) || w < 1 || w > 53) {
            return res.status(400).json({
                status: false,
                message: "Year atau week tidak valid.",
            });
        }

        const firstDayOfYear = new Date(y, 0, 1);
        const dayOffset = (firstDayOfYear.getDay() + 6) % 7;

        startDate = new Date(y, 0, 1 + (w - 1) * 7 - dayOffset);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 7);
    }

    // inject ke controller
    res.locals.filter = {
        type,
        startDate,
        endDate,
    };

    next();
};