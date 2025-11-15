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

const registerDataAdminStan = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(8).required(),
    nama_stan: Joi.string().required(),
    nama_pemilik: Joi.string().required(),
    telp: Joi.string().required(),
})

export const verifyRegisterUser = (req: Request, res: Response, next: NextFunction) => {
    const { error } = registerDataSiswa.validate(req.body, { abortEarly: false })

    if (error) {
        return res.status(200).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}

export const verifyRegisterAdminStan = (req: Request, res: Response, next: NextFunction) => {
    const { error } = registerDataAdminStan.validate(req.body, { abortEarly: false })

    if (error) {
        return res.status(200).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}