import { ICart } from "./cart";
import { ECities } from "./enums";
import { IUser } from "./user";

export interface IOrder {
    _id: string;
    costumerID: IUser;
    cartID: ICart;
    totalPrice: number;
    deliverDetails: {
        city: ECities;
        street: string;
        date: Date;
    };
    createdAt: Date;
    creditCard: number;
}