import { NextFunction, Request, Response } from "express";
import Joi, { required } from 'joi'

const registerDataSiswa = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(8).required(),
    nama_siswa: Joi.string().required(),
    alamat: Joi.string().required(),
    telp: Joi.string().required(),
    foto: Joi.allow().optional(),
    jenis_kelamin: Joi.string().valid("laki_laki", "perempuan").required(),
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
    telp: Joi.string().required(),
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