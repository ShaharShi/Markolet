import express, { Request, Response } from 'express';
import { Order, Product } from '../db/collections';
import { checkAdminPermissions } from '../middlewares/checkAdminPermissions.middleware';
import { EUnits } from '../models/enums';
import { IError } from '../models/error';
import { IProduct } from '../models/product';
import { errorMessages } from '../utils/errors';

export const productsRouter = express.Router();

productsRouter.get('/search', async (req: Request, res: Response<IProduct[] | IError>) => {
    const { term } = req.query;
    if (!term || !term.length) return res.status(400).send({ message: errorMessages.allParametersAreRequired })

    const regex = new RegExp(`^${term}| ${term}`)
    try {
        const products: IProduct[] = await Product.find({ name: { $regex: regex, $options: 'gi'} });
        res.send(products);
    } catch (error: any) {
        console.log({ errorAt: 'GET api/products/search endpoint', message: error.message, status: 500 })
        res.status(500).send({ message: error.message })
    }
})
productsRouter.get('/statistics', async (req: Request, res: Response<{ totalProductCount: number, totalOrdersCount: number} | IError>) => {
    try {
        const totalProductCount: number = await Product.find().count();
        const totalOrdersCount: number = await Order.find().count();
        res.send({ totalProductCount, totalOrdersCount })
    } catch (error: any) {
        console.log({ errorAt: 'GET api/products/statistics endpoint', message: error.message })
        res.status(500).send({ message: error.message })
    }
})
productsRouter.get('/:id', async (req: Request, res: Response<IProduct | IError>) => {
    const { id } = req.params;

    if (!id) return res.status(400).send({ message: errorMessages.allParametersAreRequired })
    try {
        const product = await Product.findOne({ _id: id });
        if (!product) return res.status(400).send({ message: errorMessages.noProductFound })

        res.send(product)
    } catch (error: any) {
        console.log({ errorAt: 'GET api/products/:id endpoint', message: error.message, status: 500 })
        res.status(500).send({ message: error.message })
    }
})
productsRouter.post('/', checkAdminPermissions, async (req: Request, res: Response<IProduct | IError>) => {
    const { name, categoryID, price, unit, imgURL } = req.body;

    if (!name || !categoryID || !price || !unit || !imgURL ) return res.status(400).send({ message: errorMessages.allParametersAreRequired })
    const priceAsNumber = Number(price)
    const unitsValuesArr = Object.values(EUnits);
    if (isNaN(priceAsNumber)) return res.status(400).send({ message: errorMessages.invalidField('price', 'integer') })
    if (!unitsValuesArr.includes(unit.toLowerCase())) return res.status(400).send({ message: errorMessages.invalidField('unit', `field (${unitsValuesArr.join(', ')})`) })

    try {
        const newProduct = new Product({ name, categoryID, price, unit, imgURL })
        const product = await newProduct.save();

        if (!product) throw new Error('Internal Error !')

        res.send(product)
    } catch (error: any) {
        console.log({ errorAt: 'POST api/products endpoint', message: error.message, status: 500 })
        res.status(500).send({ message: error.message })
    }
})
productsRouter.put('/:id', checkAdminPermissions, async (req: Request, res: Response<IProduct | IError | any>) => {
    const { id } = req.params;
    const { name, categoryID, price, unit, imgURL } = req.body;

    if (!name || !categoryID || !price || !unit || !imgURL ) return res.status(400).send({ message: errorMessages.allParametersAreRequired, status: 400 })
    const priceAsNumber = Number(price)
    const unitsValuesArr = Object.values(EUnits);
    if (isNaN(priceAsNumber)) return res.status(400).send({ message: errorMessages.invalidField('price', 'integer'), status: 400 })
    if (!unitsValuesArr.includes(unit.toLowerCase())) return res.status(400).send({ message: errorMessages.invalidField('unit', `field (${unitsValuesArr.join(', ')})`), status: 400 })

    try {
        const results = await Product.findOneAndUpdate({ _id: id}, { name, categoryID, price, unit, imgURL }, { new: true })
        if (!results) return res.status(400).send({ message: errorMessages.noProductFound, status: 400 })
        res.send(results)
    } catch (error: any) {
        console.log({ errorAt: 'PUT api/products endpoint', message: error.message, status: 500 })
        res.status(500).send({ message: error.message, status: 500 })
    }
})
productsRouter.delete('/:id', checkAdminPermissions, async (req: Request, res: Response<IProduct | IError>) => {
    const { id } = req.params;

    if (!id ) return res.status(400).send({ message: errorMessages.allParametersAreRequired })

    try {
        const results = await Product.findOneAndDelete({ _id: id})
        if (!results) return res.status(400).send({ message: errorMessages.noProductFound })
        res.send()
    } catch (error: any) {
        console.log({ errorAt: 'DELETE api/products endpoint', message: error.message, status: 500 })
        res.status(500).send({ message: error.message })
    }
})
