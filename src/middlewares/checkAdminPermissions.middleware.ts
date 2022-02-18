import { NextFunction, Request, Response } from "express";
import { IError } from "../models/error";
import { errorMessages } from "../utils/errors";
import { getDecodedJwt } from "../utils/helpers";

export function checkAdminPermissions(req: Request, res: Response<IError>, next: NextFunction) {
    if (!req.headers?.authorization) return res.status(401).send({ message: errorMessages.unknownToken })
    const token = req.headers.authorization.split(' ')[1]
    const user = getDecodedJwt(token);


    if (user.isAdmin) next()
    else return res.status(401).send({ message: errorMessages.permissionDenied })
}