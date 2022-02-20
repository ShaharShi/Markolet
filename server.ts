import express, { NextFunction, Request, Response } from "express";
import dotenv from 'dotenv';
import cors from 'cors';
import expressJwt from 'express-jwt';
import { authRouter } from "./src/routers/auth.router";
import { connectDb } from "./src/db/db";
import { productsRouter } from "./src/routers/products.router";
import { cartsRouter } from "./src/routers/carts.router";
import { categoriesRouter } from "./src/routers/categories.router";
import { ordersRouter } from "./src/routers/orders.router";
import path from 'path';

dotenv.config()
const { JWT_SECRET = "!@_7_9*4%2application_secret!*%^*32!$", PORT = 4000 } = process.env;
const app = express();

app.use(cors())
app.use(express.json())

app.use('/', express.static('./client/dist'));
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'));
});
app.use(expressJwt({ secret: JWT_SECRET, algorithms: ['HS256'] }).unless({ 
  path: [
    '/api/auth/login',
    '/api/auth/signup',
    '/api/auth/validate-user',
    '/api/products/statistics'
]}))
  
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const apiPossiblePathes = ['/api/auth/', '/api/products/', '/api/carts/', '/api/categories/', 'api/orders/'];
  console.log('--------');
  console.log(err.name);
  console.log(req.url);
  if (!apiPossiblePathes.includes(req.url)) res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'));
  console.log('Continue to API');
  console.log('--------');
  next()
});
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/orders', ordersRouter);


app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err.name === 'UnauthorizedError') {
      res.status(401).send(`${err.name}: ${err.message}`);
    }
});
  
startServer()
async function startServer() {
    await connectDb()
    app.listen(PORT, () => console.log(`Server is up on port ${PORT}`))
}