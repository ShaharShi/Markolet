import { ICart } from "./cart";
import { IUser } from "./user";

export interface IOrder {
    _id: string;
    costumerID: IUser;
    cartID: ICart;
    totalPrice: number;
    deliverDetails: {
        city: string;
        street: string;
        date: Date;
    };
    createdAt: string;
    creditCard: number;
}