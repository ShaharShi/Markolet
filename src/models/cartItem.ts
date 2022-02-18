import { ICart } from "./cart";
import { IProduct } from "./product";

export interface ICartItem {
    _id: string;
    product: IProduct;
    quantity: number;
    cartID: ICart;
}