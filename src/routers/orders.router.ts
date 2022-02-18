import express, { Request, Response } from 'express';
import { IError } from '../models/error';
import { getDecodedJwt } from '../utils/helpers';
import dotenv from 'dotenv';
import { errorMessages } from '../utils/errors';
import { Cart, CartItem, Order } from '../db/collections';
import { IOrder } from '../models/order';
import { ICartItem } from '../models/cartItem';
import { capitalize } from 'underscore.string';
import { ECities } from '../models/enums';
dotenv.config();

export const ordersRouter = express.Router();

ordersRouter.get('/last', async (req: Request, res: Response<IOrder | IError>) => {
    if (!req.headers?.authorization) return res.status(401).send({ message: errorMessages.unknownToken })
    const token = req.headers.authorization.split(' ')[1]
    const user = getDecodedJwt(token);

    try {
        const orders = await Order.find({ costumerID: user._id });
        const sortedOrders = orders.sort((a: IOrder, b: IOrder) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
        res.send(sortedOrders[0])
    } catch (error: any) {
        console.log({ errorAt: 'GET api/orders/last endpoint', message: error.message, status: 500 })
        res.status(500).send({ message: error.message })
    }
})
ordersRouter.get('/order-receipt/:orderID', async (req: Request, res: Response<IError | string>) => {
    const { orderID } = req.params;
    let data: string = '';
    if (!orderID) return res.status(400).send({ message: errorMessages.allParametersAreRequired });
    try {
        const order = await Order.findOne({ _id: orderID });
        if (!order) return res.status(400).send({ message: errorMessages.invalidIdField('order') });
        const populatedCartItems = await CartItem.find({ cartID: order.cartID }).populate('product');
        populatedCartItems.forEach( async (cartItem: ICartItem) => {
            data += `\n ${capitalize(cartItem.product.name.toLowerCase())} - ${cartItem.quantity} ${cartItem.product.unit} - ${(cartItem.product.price * cartItem.quantity).toFixed(2)}₪`;
        })

        data += `\n\r _____________________________ \n\r Total - ${order.totalPrice.toFixed(2)}₪`
        res.set({"Content-Disposition":`attachment;`});
        res.send(data)
    } catch (error: any) {
        console.log({ errorAt: 'GET api/orders/order-receipt endpoint', message: error.message, status: 500 })
        res.status(500).send({ message: error.message })
    }
})
ordersRouter.post('/', async (req: Request, res: Response<IOrder | IError>) => {
    if (!req.headers?.authorization) return res.status(401).send({ message: errorMessages.unknownToken })
    const token = req.headers.authorization.split(' ')[1]
    const user = getDecodedJwt(token);

    const { deliverDetails, creditCard, totalPrice, cartID } = req.body;
    if (!deliverDetails || !creditCard || !totalPrice || !cartID) return res.status(400).send({ message: errorMessages.allParametersAreRequired });
    const citiesValuesArr = Object.values(ECities) as string[];
    if (!citiesValuesArr.includes(deliverDetails.city.toLowerCase())) return res.status(400).send({ message: errorMessages.invalidField('city', `field (${citiesValuesArr.join(', ')})`) })
    
    try {
        const newOrder = new Order({
            costumerID: user._id,
            cartID,
            totalPrice,
            deliverDetails,
            creditCard
        })
        const savedOrder = await newOrder.save();
        await Cart.findOneAndUpdate({ _id: cartID }, { cartClosed: true })
        res.send(savedOrder);
    } catch (error: any) {
        console.log({ errorAt: 'POST api/orders endpoint', message: error.message, status: 500 })
        res.status(500).send({ message: error.message })
    }
})