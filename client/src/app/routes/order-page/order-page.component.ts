import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { firstValueFrom } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';
import { CartService } from 'src/app/services/cart/cart.service';
import { OrdersService } from 'src/app/services/orders/orders.service';
import { IState } from 'src/app/store/store';
import { APP_IMAGES } from 'src/app/utils/images';

@Component({
  templateUrl: './order-page.component.html',
  styleUrls: ['./order-page.component.css']
})
export class OrderPageComponent implements OnInit {

  IMAGES = APP_IMAGES;
  constructor(private cartService: CartService, private authService: AuthService, private router: Router, private ordersService: OrdersService, private store: Store<IState>) { }

  async ngOnInit(): Promise<void> {
    const user = await this.authService.fetchUserSession();
    if (!user) return this.authService.logout();
    const order = await firstValueFrom(this.store.select((state) => state.ordersState.currentOrder));
    if (order) this.ordersService.completeOrder();

    if (user?.isAdmin) this.router.navigate(['/'])
    else this.initialComponent()
  }
  initialComponent = async () => {
    const cartExist = await this.cartService.fetchCart();
    if (!cartExist) this.navigateToShop()
  }
  navigateToShop = () => {
    this.router.navigate(['shop'])
  }

}