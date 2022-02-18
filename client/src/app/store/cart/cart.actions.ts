import { createAction, props } from "@ngrx/store";
import { ICart } from "src/app/models/cart";
import { ICartItem } from "src/app/models/cartItem";
import { createActionsGroup } from "src/app/utils/context.helpers";

export const {
  start: fetchCartStart,
  success: fetchCartSuccess,
  fail: fetchCartFail,
} = createActionsGroup<{ cartItems: ICartItem[], cart: ICart }>('Carts', 'Fetch Cart');
export const {
  start: addCartItemStart,
  success: addCartItemSuccess,
  fail: addCartItemFail,
} = createActionsGroup<{ cartItem: ICartItem, cart: ICart }>('Carts', 'Add Cart Item');
export const {
  start: removeCartItemStart,
  success: removeCartItemSuccess,
  fail: removeCartItemFail,
} = createActionsGroup<{ cartCleared: boolean, cartItemID: string }>('Carts', 'Remove Cart Item');
export const {
  start: clearCartStart,
  success: clearCartSuccess,
  fail: clearCartFail,
} = createActionsGroup<{ cartID: string }>('Carts', 'Clear Cart');
export const {
  start: updateCartItemStart,
  success: updateCartItemSuccess,
  fail: updateCartItemFail,
} = createActionsGroup<{ cartItemID: string, quantity: number }>('Carts', 'Update Cart Item');