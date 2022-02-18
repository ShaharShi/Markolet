import { HttpClient } from '@angular/common/http';
import { Injectable, isDevMode } from '@angular/core';
import { Store } from '@ngrx/store';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { ICart } from 'src/app/models/cart';
import { ICartItem } from 'src/app/models/cartItem';
import { addCartItemFail, addCartItemStart, addCartItemSuccess, clearCartFail, clearCartStart, clearCartSuccess, fetchCartFail, fetchCartStart, fetchCartSuccess, removeCartItemFail, removeCartItemStart, removeCartItemSuccess, updateCartItemFail, updateCartItemStart, updateCartItemSuccess } from 'src/app/store/cart/cart.actions';
import { IState } from 'src/app/store/store';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';

const API_BASE_URL = !environment.production ? 'http://localhost:4000/api/carts' : 'api/carts';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  constructor(private http: HttpClient, private store: Store<IState>, private authService: AuthService) { }

  getCurrentCart = async () => {
    const currentCart: {cart: ICart | null, cartTotal: number} = await firstValueFrom(this.store.select((state) => { 
      return { cart: state.cartState.cart, cartTotal: state.cartState.cartTotal }
    }));
    return currentCart;
  };

  handleCartItemAddition = (productID: string, currentQuantity: number) => {
    if (currentQuantity === 0) {
      this.addCartItem(productID)
    } else {
      const increasedQuantity = currentQuantity + 1;
      this.updateCartItem(productID, increasedQuantity)
    }
  }
  handleCartItemDeletion = (productID: string, currentQuantity: number) => {
    if (currentQuantity === 0) return;
    const decreasedQuantity = currentQuantity - 1;
    if (decreasedQuantity === 0) {
      this.removeCartItem(productID)
    } else {
      this.updateCartItem(productID, decreasedQuantity)
    }
  }

  fetchCart = async () => {
    this.store.dispatch(fetchCartStart())
    try {
      const authHeader = this.authService.getAuthorizationHeader();
      const results = await lastValueFrom<{ cart: ICart, cartItems: ICartItem[], cartTotal: number } | null>(this.http.get<{ cart: ICart, cartItems: ICartItem[], cartTotal: number } | null>(API_BASE_URL, { 
        headers: { ...authHeader }
      }));
      if (!results) {
        this.store.dispatch(fetchCartFail())
        return false;
      };

      this.store.dispatch(fetchCartSuccess({ cart: results.cart, cartItems: results.cartItems, cartTotal: results.cartTotal }))
      return true;
    } catch (error: any) {
      console.log({ errorAt: '[CartService] Fetch Cart', message: error.error?.message, status: error?.status })
      this.store.dispatch(fetchCartFail())
      return false;
    }
  }

  addCartItem = async (productID: string) => {
    this.store.dispatch(addCartItemStart())
    try {
      const authHeader = this.authService.getAuthorizationHeader();
      const currentCart = await this.getCurrentCart();
      
      const { cartItem, cart } = await lastValueFrom<{ cartItem: ICartItem, cart: ICart }>(this.http.post<{ cartItem: ICartItem, cart: ICart }>(`${API_BASE_URL}`, {
        cartID: currentCart.cart ? currentCart.cart._id : null,
        productID: productID,
      }, { headers: { ...authHeader }
      }));
      this.store.dispatch(addCartItemSuccess({ cartItem , cart }))
      
    } catch (error: any) {
      console.log({ errorAt: '[CartService] Add Cart Item', message: error.error?.message, status: error?.status })
      this.store.dispatch(addCartItemFail())
      return error.error?.message
    }
  }
  removeCartItem = async (productID: string) => {
    this.store.dispatch(removeCartItemStart())

    const cartItems = await firstValueFrom(this.store.select((state) => state.cartState.cartItems));
    const cartItemID = cartItems.find(c => c.product._id === productID)?._id;
    try {
      const authHeader = this.authService.getAuthorizationHeader();
      const currentCart = await this.getCurrentCart();
      if (!currentCart.cart) return;
      const { cartCleared } = await lastValueFrom<{ cartCleared: boolean }>(this.http.delete<{ cartCleared: boolean }>(`${API_BASE_URL}/${currentCart.cart._id}/${cartItemID}`, { headers: { ...authHeader }}));
      
      this.store.dispatch(removeCartItemSuccess({ cartCleared, cartItemID }))
    } catch (error: any) {
      console.log({ errorAt: '[CartService] Remove Cart Item', message: error.error?.message, status: error?.status })
      this.store.dispatch(removeCartItemFail())
      return error.error?.message
    }
  }
  updateCartItem = async (productID: string, quantity: number) => {
    this.store.dispatch(updateCartItemStart())

    const cartItems = await firstValueFrom(this.store.select((state) => state.cartState.cartItems));
    const cartItemID = cartItems.find(c => c.product._id === productID)?._id;
    try {
      const authHeader = this.authService.getAuthorizationHeader();
      await lastValueFrom(this.http.put(`${API_BASE_URL}/update/${cartItemID}`, { quantity }, { headers: { ...authHeader }}));
  
      this.store.dispatch(updateCartItemSuccess({ cartItemID, quantity }))
    } catch (error: any) {
      console.log({ errorAt: '[CartService] Update Cart Item', message: error.error?.message, status: error?.status })
      this.store.dispatch(updateCartItemFail())
      return error.error?.message
    }
  }
  clearCart = async () => {
    this.store.dispatch(clearCartStart())
    try {
      const authHeader = this.authService.getAuthorizationHeader();
      const currentCart = await this.getCurrentCart();
      if (!currentCart.cart) return this.store.dispatch(clearCartFail());
      const cartID = currentCart.cart._id;
       await lastValueFrom(this.http.delete(`${API_BASE_URL}/clear/${cartID}`, { headers: { ...authHeader }}));
  
      this.store.dispatch(clearCartSuccess({ cartID }))
      
    } catch (error: any) {
      console.log({ errorAt: '[CartService] Clear Cart', message: error.error?.message, status: error?.status })
      this.store.dispatch(clearCartFail())
      return error.error?.message;
    }
  }
}

