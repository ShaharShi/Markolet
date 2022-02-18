import express, { Request, Response } from 'express';
import { Category, Product } from '../db/collections';
import { ICategory } from '../models/category';
import { IError } from '../models/error';
import { IProduct } from '../models/product';
import { errorMessages } from '../utils/errors';

export const categoriesRouter = express.Router();

categoriesRouter.get('/', async (req: Request, res: Response<ICategory[] | IError>) => {
    try {
        const categories: ICategory[] = await Category.find();
        res.send(categories)
    } catch (error: any) {
        console.log({ errorAt: 'GET api/categories endpoint', message: error.message, status: 500 })
        res.status(500).send({ message: error.message })
    }
})
categoriesRouter.get('/products/:categoryID', async (req: Request, res: Response<IProduct[] | IError>) => {
    const { categoryID } = req.params;

    if (!categoryID) return res.status(400).send({ message: errorMessages.allParametersAreRequired })
    try {
        const categoryProducts: IProduct[] = await Product.find({ categoryID: categoryID });
        res.send(categoryProducts)
    } catch (error: any) {
        console.log({ errorAt: 'GET api/categories/products endpoint', message: error.message, status: 500 })
        res.status(500).send({ message: error.message })
    }
})