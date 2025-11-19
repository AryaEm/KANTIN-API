import { NextFunction, Request, Response } from "express";
import Joi from 'joi'

const stan = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(8).required(),
    nama_siswa: Joi.string().required(),
    alamat: Joi.string().required(),
    telp: Joi.string().required(),
    foto: Joi.allow().optional(),
    jenis_kelamin: Joi.string().valid("laki_laki", "perempuan").required(),
})