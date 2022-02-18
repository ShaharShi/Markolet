import {
  createReducer,
  on,
} from '@ngrx/store';
import { IOrder } from 'src/app/models/order';
import { createOrderFail, createOrderStart, createOrderSuccess, orderComplete } from './order.actions';

export interface IOrderState {
  creatingOrder: boolean;
  currentOrder: IOrder | null;
}
const initialState: IOrderState = {
  creatingOrder: false,
  currentOrder: null
}

export const ordersReducer = createReducer(initialState,
  on(createOrderStart, (state) => ({ ...state, creatingOrder: true })),
  on(createOrderFail, createOrderSuccess, orderComplete, (state) => ({ ...state, creatingOrder: false })),
  on(createOrderSuccess, (state, { newOrder }) => ({ ...state, currentOrder: newOrder })),
  on(createOrderFail, orderComplete, (state) => ({ ...state, currentOrder: null })),
)