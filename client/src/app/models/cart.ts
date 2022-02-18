import { IUser } from "./user";

export interface ICart {
    _id: string;
    costumerID: IUser;
    cartClosed: boolean;
    createdAt: string;
}