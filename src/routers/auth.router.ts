import express, { Request, Response } from 'express';
import { User } from '../db/collections';
import { IError } from '../models/error';
import bcrypt from 'bcrypt';
import { generateJWT, getDecodedJwt } from '../utils/helpers';
import dotenv from 'dotenv';
import { ECities } from '../models/enums';
import { errorMessages } from '../utils/errors';
import { ISessionUser, IUser } from '../models/user';
dotenv.config();

export const authRouter = express.Router();

authRouter.get('/login', async (req: Request, res: Response<{ jwt: string, user: Pick<IUser, 'firstName' | 'lastName' | 'email' | 'isAdmin'> } | IError>) => {
    const { email, password } = req.query;
    if (!email || !password) return res.status(400).send({ message: errorMessages.allParametersAreRequired});

    try {
        const user = await User.findOne({ email: (email as string).toLowerCase() })
        if (!user) return res.status(400).send({ message: errorMessages.incorrectParameters })
        const validPassword = await bcrypt.compare(password as string, user.password);
        if (!validPassword) return res.status(400).send({ message: errorMessages.incorrectParameters })
    
        const jwt = await generateJWT({ email: user.email, _id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET as string) as string;
    
        res.send({ jwt: jwt, user: { firstName: user.firstName, lastName: user.lastName , email: user.email, isAdmin: user.isAdmin }});
        
    } catch (error: any) {
        console.log({ errorAt: 'GET api/auth/login endpoint', message: error.message, status: 500 })
        res.status(500).send({ message: error.message })
    }

})
authRouter.post('/signup', async (req: Request, res: Response<{ jwt: string, user: Pick<IUser, 'firstName' | 'lastName' | 'email'> } | IError>) => {
    const { firstName, lastName, email, personalID, password, city, street } = req.body;

    if (!firstName || !lastName || !email || !personalID || !password || !city || !street) return res.status(400).send({ message: errorMessages.allParametersAreRequired });
    const citiesValuesArr = Object.values(ECities) as string[];
    if (!citiesValuesArr.includes(city.toLowerCase())) return res.status(400).send({ message: errorMessages.invalidField('city', `field (${citiesValuesArr.join(', ')})`) })

    try {
        const user = await User.findOne({ $or: [{ email: (email as string).toLowerCase()}, { personalID: personalID } ]});
        if(user) return res.status(400).send({ message: errorMessages.userAlreadyExists });
    
        const salt = await bcrypt.genSalt(10);
        const bycryptedPassword = await bcrypt.hash(password, salt);
    
        const newUser = new User({ 
            firstName, 
            lastName, 
            email: email.toLowerCase(), 
            personalID, 
            password: bycryptedPassword, 
            address: { 
                city,
                street,
            }
        })
        await newUser.save()
        const jwt = await generateJWT({ email: newUser.email, _id: newUser._id, isAdmin: newUser.isAdmin || false }, process.env.JWT_SECRET as string) as string;
    
        res.send({ jwt: jwt, user: { firstName: newUser.firstName, lastName: newUser.lastName , email: newUser.email }});
        
    } catch (error: any) {
        console.log({ errorAt: 'POST api/auth/signup endpoint', message: error.message, status: 500 })
        res.status(500).send({ message: error.message })
    }
})

authRouter.get('/validate-user', async (req: Request, res: Response<null | IError>) => {
    const { email, personalID } = req.query;
    try {
        const user = await User.findOne({ $or: [{ email: (email as string).toLowerCase()}, { personalID: personalID } ]});
        if (user) return res.status(400).send({ message: errorMessages.userAlreadyExists })
    
        res.send(null)
    } catch (error: any) {
        console.log({ errorAt: 'GET api/auth/validate-user endpoint', message: error.message, status: 500 })
        res.status(500).send({ message: error.message })
    }
})
authRouter.get('/user', async (req: Request, res: Response< { user: ISessionUser | null, jwt?: string | undefined } | IError>) => {
    if (!req.headers?.authorization) return res.status(401).send({ message: errorMessages.unknownToken })
    const token = req.headers.authorization.split(' ')[1]
    const userFromToken = getDecodedJwt(token);

    try {
        let jwt;
        const userFromDataBase = await User.findOne({ _id: userFromToken._id });
        if (!userFromDataBase) return res.status(400).send({ user: null })

        if (userFromToken.isAdmin && !userFromDataBase.isAdmin) jwt = await generateJWT({ email: userFromDataBase.email, _id: userFromDataBase._id, isAdmin: false }, process.env.JWT_SECRET as string) as string;
    
        res.send({
            jwt,
            user: { 
                firstName: userFromDataBase.firstName, 
                lastName: userFromDataBase.lastName, 
                email: userFromDataBase.email, 
                address: userFromDataBase.address, 
                isAdmin: userFromDataBase.isAdmin 
            } 
        })
    } catch (error: any) {
        console.log({ errorAt: 'GET api/auth/user endpoint', message: error.message, status: 500 })
        res.status(500).send({ message: error.message })
    }
})