import jwt from 'jsonwebtoken';
import jwt_decode from "jwt-decode";
import { promisify } from 'util';

const promisifiedJwtSign = promisify(jwt.sign)

export const generateJWT = (tokenObject: Object, secret: string) => {
    return promisifiedJwtSign(tokenObject, secret);
}

export const getDecodedJwt = (token: string): { email: string, _id: string, isAdmin: boolean, iat: number } => jwt_decode(token); 