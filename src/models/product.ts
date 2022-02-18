import { ICategory } from "./category";

export interface IProduct {
    _id: string;
    name: string;
    categoryID: ICategory;
    price: number;
    unit: string;
    imgURL: string;
}