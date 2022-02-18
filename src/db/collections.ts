import { model, Schema } from "mongoose";
import { ICart } from "../models/cart";
import { ICartItem } from "../models/cartItem";
import { ICategory } from "../models/category";
import { IOrder } from "../models/order";
import { IProduct } from "../models/product";
import { IUser } from "../models/user";

export const UserSchema = new Schema<IUser>({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    personalID: { type: Number, required: true, unique: true, minlength: 9, maxlength: 9 },
    password: { type: String, required: true },
    address: {
        city: { type: String, required: true },
        street: { type: String, required: true },
    },
    isAdmin: { type: Boolean, default: false },
}, { timestamps : { updatedAt: false }} )

export const CategorySchema = new Schema<ICategory>({
    name: { type: String, required: true },
    icon: { type: String, required: true },
})

export const ProductSchema = new Schema<IProduct>({
    name: { type: String, required: true },
    categoryID: { type: Schema.Types.ObjectId, ref: 'Category' },
    price: { type: Number, required: true },
    unit: { type: String, required: true },
    imgURL: { type: String, required: true },
}, { timestamps : { updatedAt: false }} )

export const CartSchema = new Schema<ICart>({
    costumerID: { type: Schema.Types.ObjectId, ref: 'User' },
    cartClosed: { type: Boolean, required: true, default: false }
}, { timestamps : { updatedAt: false }} )

export const CartItemSchema = new Schema<ICartItem>({
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, required: true },
    cartID: { type: Schema.Types.ObjectId, ref: 'Cart' },
})

export const OrderSchema = new Schema<IOrder>({
    costumerID: { type: Schema.Types.ObjectId, ref: 'User' },
    cartID: { type: Schema.Types.ObjectId, ref: 'Cart' },
    totalPrice: { type: Number, required: true },
    deliverDetails: {
        city: { type: String, required: true },
        street: { type: String, required: true },
        date: { type: Date, required: true },
    },
    creditCard: { type: Number, required: true },
}, { timestamps : { updatedAt: false }} )

export const User = model<IUser>('User', UserSchema);
export const Category = model<ICategory>('Category', CategorySchema);
export const Product = model<IProduct>('Product', ProductSchema);
export const Cart = model<ICart>('Cart', CartSchema);
export const CartItem = model<ICartItem>('Cart_item', CartItemSchema);
export const Order = model<IOrder>('Order', OrderSchema);