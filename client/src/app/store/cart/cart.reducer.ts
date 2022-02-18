import {
  createReducer,
  on,
} from '@ngrx/store';
import { ICart } from 'src/app/models/cart';
import { ICartItem } from 'src/app/models/cartItem';
import { loggedOut } from '../auth/auth.actions';
import { createOrderSuccess } from '../order/order.actions';
import { addCartItemFail, addCartItemStart, addCartItemSuccess, clearCartFail, clearCartStart, clearCartSuccess, fetchCartFail, fetchCartStart, fetchCartSuccess, removeCartItemFail, removeCartItemStart, removeCartItemSuccess, updateCartItemFail, updateCartItemStart, updateCartItemSuccess } from './cart.actions';

export interface ICartState {
  cart: ICart | null;
  cartItems: ICartItem[];
  updatingCart: boolean;
  cartTotal: number;
}
const initialState: ICartState = {
  cart: null,
  cartItems: [],
  updatingCart: false,
  cartTotal: 0,
}

export const cartReducer = createReducer(initialState,
    on(addCartItemStart, removeCartItemStart, clearCartStart, updateCartItemStart, fetchCartStart, (state) => ({ ...state, updatingCart: true })),
    on(addCartItemSuccess, addCartItemFail, removeCartItemSuccess, removeCartItemFail, 
      clearCartSuccess, clearCartFail, updateCartItemSuccess, updateCartItemFail, fetchCartSuccess, fetchCartFail, (state) => ({ ...state, updatingCart: false })),
    
    on(addCartItemSuccess, (state, { cartItem, cart }) => ({ ...state, cart, cartItems: state.cartItems.concat(cartItem) })),
    on(removeCartItemSuccess, (state, { cartCleared, cartItemID }) => ({ 
      ...state, 
      cart: cartCleared ? null : state.cart, 
      cartItems: state.cartItems.filter(c => c._id !== cartItemID) })
    ),
    on(clearCartSuccess, (state, { cartID }) => ({ 
      ...state, 
      cart: null, 
      cartItems: [] })
    ),
    on(updateCartItemSuccess, (state, { cartItemID, quantity }) => ({ 
      ...state, 
      cartItems: state.cartItems.map(c => {
        let copy = { ...c }
        if (c._id === cartItemID) copy.quantity = quantity
        return copy;
      }) })
    ),
    on(fetchCartSuccess, (state, { cartItems, cart, cartTotal }) => ({ ...state, cartItems, cart, cartTotal })
    ),
    on(loggedOut, createOrderSuccess, (state) => initialState)
  )

