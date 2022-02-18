import { TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as moment from 'moment';
import { firstValueFrom, Observable } from 'rxjs';
import { IOrder } from 'src/app/models/order';
import { ISessionUser } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CartService } from 'src/app/services/cart/cart.service';
import { OrdersService } from 'src/app/services/orders/orders.service';
import { ProductsService } from 'src/app/services/products/products.service';
import { setActivityMessages } from 'src/app/store/auth/auth.actions';
import { IState } from 'src/app/store/store';
import { APP_IMAGES } from 'src/app/utils/images';

@Component({
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  isGuest: boolean = true;
  isAdmin: boolean = false;
  fetchingUser$!: Observable<boolean>;
  availableProducts: number = 0;
  ordersCount: number = 0;
  activity$!: Observable<{ message: string, btnMessage: string }>;
  IMAGES = APP_IMAGES;
  constructor(private store: Store<IState>, private productsService: ProductsService, private authService: AuthService, private cartService: CartService, private ordersService: OrdersService, private router: Router, private titleCasePipe: TitleCasePipe) { }

  ngOnInit(): void {
    this.initialComponent()
  }
  initialComponent = async () => {
    const user: ISessionUser | null = await this.authService.fetchUserSession();
    if (!user) this.authService.logout();
    const order = await firstValueFrom(this.store.select((state) => state.ordersState.currentOrder));
    if (order) this.ordersService.completeOrder();

    if (user?.isAdmin) this.isAdmin = true;
    this.store.select((state) => state.authState.user ).subscribe(async (user) => {
      if (!user) this.isGuest = true;
      if (user) {
        this.isGuest = false;
        !user.isAdmin && await this.cartService.fetchCart();
        await this.setActivityMessages();
      }
    })
    this.fetchingUser$ = this.store.select((state) => state.authState.fetchingUser);
    this.activity$ = this.store.select((state) => state.authState.activity);
    const { totalProductCount, totalOrdersCount } = await this.productsService.getProductsStatistics();
    this.availableProducts = totalProductCount;
    this.ordersCount = totalOrdersCount;
  }
  navigate = async () => {
    const user = await this.authService.fetchUserSession();
    
    if (user) this.router.navigate([user.isAdmin ? 'admin-panel' : 'shop']);
    else {
      alert('You are not allowed to proceed ! (Unauthorized)');
      this.authService.logout();
    }
  }
  setActivityMessages = async () => {
    const user = await firstValueFrom(this.store.select((state) => state.authState.user ));
    if (!user) return this.authService.logout()

    const { firstName, lastName, isAdmin } = user;
    if (isAdmin) return this.store.dispatch(setActivityMessages({ btnMessage: 'Go to Admin Panel', message: '' }))

    const currentCart = await this.cartService.getCurrentCart();
    if (currentCart.cart) {
      this.store.dispatch(setActivityMessages({ btnMessage: 'Resume Shopping', message: `You have an open cart from ${moment(currentCart.cart.createdAt).fromNow()}, for a total of ${currentCart.cartTotal.toFixed(2)} ₪` }))
      return;
    }
    const lastOrder: IOrder = await this.ordersService.fetchLastOrder();
    if (lastOrder) return this.store.dispatch(setActivityMessages({ btnMessage: 'Start Shopping', message: `Your last purchase was on ${moment(lastOrder.createdAt).calendar()}` }))
    return this.store.dispatch(setActivityMessages({ btnMessage: 'Start Shopping', message: `Welcome ${this.titleCasePipe.transform(firstName + ' ' + lastName)}` }))
  }

}
