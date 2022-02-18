import {
  ActionReducer,
  ActionReducerMap,
  MetaReducer,
} from '@ngrx/store';
import { storeLogger } from 'ngrx-store-logger';
import { environment } from 'src/environments/environment';
import { authReducer, IAuthState } from './auth/auth.reducer';
import { cartReducer, ICartState } from './cart/cart.reducer';
import { IOrderState, ordersReducer } from './order/order.reducer';
import { IProductState, productReducer } from './products/product.reducer';

export interface IState {
  authState: IAuthState;
  productsState: IProductState;
  cartState: ICartState;
  ordersState: IOrderState
}

export const reducers: ActionReducerMap<IState> = {
  authState: authReducer,
  productsState: productReducer,
  cartState: cartReducer,
  ordersState: ordersReducer
};

export function logger(reducer: ActionReducer<IState>): any {
  return storeLogger({ collapsed: true })(reducer);
}

export const metaReducers: MetaReducer<IState>[] = !environment.production
  ? [logger]
  : [];
