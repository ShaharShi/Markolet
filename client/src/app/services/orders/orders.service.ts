import { HttpClient } from '@angular/common/http';
import { Injectable, isDevMode } from '@angular/core';
import { Store } from '@ngrx/store';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { IOrder } from 'src/app/models/order';
import { createOrderFail, createOrderStart, createOrderSuccess, orderComplete } from 'src/app/store/order/order.actions';
import { IState } from 'src/app/store/store';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';
import { CartService } from '../cart/cart.service';

const API_BASE_URL = !environment.production ? 'http://localhost:4000/api/orders' : 'api/orders';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  constructor(private http: HttpClient, private authService: AuthService, private cartService: CartService, private store: Store<IState>) { }

  createOrder = async (order: Partial<IOrder>) => {
    // create an order by partial (IOrder) values and update the currentOrder (in order.reducer) state, for use in success-page.
    this.store.dispatch(createOrderStart())
    try {
      const authHeader = this.authService.getAuthorizationHeader();
      const { cart, cartTotal: totalPrice } = await this.cartService.getCurrentCart();
      if (!cart) return 'Some error occurred, please refresh the page and try again';
      const newOrder = await firstValueFrom<IOrder>(this.http.post<IOrder>(`${API_BASE_URL}`, {
        cartID: cart._id,
        totalPrice,
        deliverDetails: order.deliverDetails,
        creditCard: order.creditCard
      } ,{
        headers: { ...authHeader }
      }));
      this.store.dispatch(createOrderSuccess({ newOrder }))
      return;
    } catch (error: any) {
      this.store.dispatch(createOrderFail())
      console.log({ errorAt: '[OrdersService] Create Order', message: error.error?.message, status: error?.status });
      return error.error?.message;
    }
  }
  fetchLastOrder = async () => {
    // fetch the last order and return the order for using in activity section on home-page .
    try {
      const authHeader = this.authService.getAuthorizationHeader();
      const lastOrder = await firstValueFrom<IOrder>(this.http.get<IOrder>(`${API_BASE_URL}/last`, {
        headers: { ...authHeader }
      }));
      return lastOrder;
    } catch (error: any) {
      console.log({ errorAt: '[OrdersService] Fetch Last Order', message: error.error?.message, status: error?.status });
      return error.error?.message;
    }
  }
  completeOrder = async () => {
    // complete order method inital the currentOrder (in order.reducer) state.
    this.store.dispatch(orderComplete())
  }
  fetchOrderReceipt = async (): Promise<ArrayBuffer> => {
    // fetchOrderReceipt method fetch the computed order data (ready string), and return the data to success-page component for downloading the receipt text file.
    try {
      const order = await firstValueFrom(this.store.select((state) => state.ordersState.currentOrder));
      if (!order) {
        alert('Some error occurred, please refresh the page and try again');
        throw new Error("Some error occurred, please refresh the page and try again");
      }
      const authHeader = this.authService.getAuthorizationHeader();
      return await lastValueFrom(this.http.get(`${API_BASE_URL}/order-receipt/${order._id}`, {
        headers: { ...authHeader },
        responseType: 'arraybuffer'
      }, ));
    } catch (error: any) {
      console.log({ errorAt: '[OrdersService] Fetch Order Receipt', message: error.error?.message, status: error?.status });
      return error.error?.message;
    }
  }
}