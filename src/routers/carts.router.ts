import express, { Request, Response } from 'express';
import { Cart, CartItem } from '../db/collections';
import { ICart } from '../models/cart';
import { ICartItem } from '../models/cartItem';
import { IError } from '../models/error';
import { errorMessages } from '../utils/errors';
import { getDecodedJwt } from '../utils/helpers';

export const cartsRouter = express.Router()


cartsRouter.get('/', async (req: Request, res: Response<{ cartItems: ICartItem[], cart: ICart, cartTotal: number } | null | IError>) => {
    if (!req.headers?.authorization) return res.status(401).send({ message: errorMessages.unknownToken })
    const token = req.headers.authorization.split(' ')[1]
    const user = getDecodedJwt(token);

    try {
        const cart = await Cart.findOne({ costumerID: user._id, cartClosed: false });
        if (!cart) return res.send(null);

        const cartItems = await CartItem.find({ cartID: cart._id }).populate('product');
        const cartTotal = cartItems.reduce((acc, ci) =>  acc + (ci.product.price * ci.quantity), 0);

        res.send({ cart, cartItems, cartTotal });
    } catch (error: any) {
        console.log({ errorAt: 'GET api/carts endpoint', message: error.message, status: 500 })
        res.status(500).send({ message: error.message })
    }
});

cartsRouter.post('/', async (req: Request, res: Response<{ cartItem: ICartItem, cart: ICart } | IError>) => {
    const { cartID, productID } = req.body;
    
    if (!cartID && cartID !== null || !productID) return res.status(400).send({ message: errorMessages.allParametersAreRequired });
    
    let currentCart = cartID;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(400).send({ message: errorMessages.unknownToken });
    const decodedToken = getDecodedJwt(token);
    
    try {
        if (!cartID) {
            const newCart = new Cart({ costumerID: decodedToken._id })
            const cart = await newCart.save();
            currentCart = cart;
        } else currentCart = await Cart.findOne({ _id: cartID });

        const newCartItem = new CartItem({ cartID: currentCart._id, product: productID, quantity: 1 })
        const cartItem = await newCartItem.save();

        const populatedCartItem = await cartItem.populate("product");
        
        res.send({ cartItem: populatedCartItem, cart: currentCart })
    } catch (error: any) {
        console.log({ errorAt: 'POST api/carts endpoint', message: error.message, status: 500 })
        res.status(500).send({ message: error.message })
    }
})
cartsRouter.put('/update/:cartItemID', async (req: Request, res: Response<{ cartItem: ICartItem, cart: ICart } | IError>) => {
    const { cartItemID } = req.params;
    const { quantity } = req.body;

    if (!cartItemID || !quantity) return res.status(400).send({ message: errorMessages.allParametersAreRequired });
    const quantityAsNumber = Number(quantity);
    if (isNaN(quantityAsNumber)) return res.status(400).send({ message: errorMessages.invalidField('quantity', 'integer') });

    try {
        await CartItem.findOneAndUpdate({ _id: cartItemID}, { quantity: quantityAsNumber })

        res.send()
    } catch (error: any) {
        console.log({ errorAt: 'PUT api/carts/update endpoint', message: error.message, status: 500 })
        res.status(500).send({ message: error.message })
    }
})
cartsRouter.delete('/clear/:cartID', async (req: Request, res: Response<ICartItem | IError>) => {
    const { cartID } = req.params;
    
    if (!cartID) return res.status(400).send({ message: errorMessages.allParametersAreRequired });

    try {
        await CartItem.deleteMany({ cartID: cartID })
        await Cart.findOneAndDelete({ _id: cartID })
        
        res.send()
    } catch (error: any) {
        console.log({ errorAt: 'DELETE api/carts/clear endpoint', message: error.message, status: 500 })
        res.status(500).send({ message: error.message })
    }
})
cartsRouter.delete('/:cartID/:cartItemID', async (req: Request, res: Response<{ cartCleared : boolean } | IError>) => {
    const { cartID, cartItemID } = req.params;
    
    if (!cartID || !cartItemID) return res.status(400).send({ message: errorMessages.allParametersAreRequired });

    try {
        await CartItem.findOneAndDelete({ _id: cartItemID })
        const cartItems = await CartItem.find({ cartID: cartID })
        if (!cartItems.length) {
            // clear the cart from DB in case of there are no more items in the cart after the deletion of the current item.
            const results = await Cart.findOneAndDelete({ _id: cartID })
            return results ? res.send({ cartCleared: true }) : res.send({ cartCleared: false });
        }
        
        res.send({ cartCleared: false })
    } catch (error: any) {
        console.log({ errorAt: 'DELETE api/carts endpoint', message: error.message, status: 500 })
        res.status(500).send({ message: error.message })
    }
})
