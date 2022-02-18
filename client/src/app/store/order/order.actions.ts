
import { createAction } from '@ngrx/store';
import { IOrder } from 'src/app/models/order';
import { createActionsGroup } from 'src/app/utils/context.helpers';

export const {
  start: createOrderStart,
  success: createOrderSuccess,
  fail: createOrderFail,
} = createActionsGroup<{ newOrder: IOrder }>('Order', 'Create Order');


export const orderComplete = createAction('[Order] Order Completed')