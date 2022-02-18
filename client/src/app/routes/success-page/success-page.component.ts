import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { saveAs } from 'file-saver';
import { AuthService } from 'src/app/services/auth/auth.service';
import { OrdersService } from 'src/app/services/orders/orders.service';
import { IState } from 'src/app/store/store';

@Component({
  templateUrl: './success-page.component.html',
  styleUrls: ['./success-page.component.css']
})
export class SuccessPageComponent implements OnInit {

  orderID: string | null = null;
  constructor(private ordersService: OrdersService, private router: Router, private store: Store<IState>, private authService: AuthService) { }

  async ngOnInit(): Promise<void> {
    const user = await this.authService.fetchUserSession();
    if (!user) return this.authService.logout()
    
    if (user.isAdmin) this.router.navigate(['/']);
    else {
      this.store.select((state) => state.ordersState.currentOrder).subscribe(order => {
        if (!order) {
          this.orderID = null;
          this.completeOrder();
        } else this.orderID = order._id;
      })
    }
  }

  completeOrder = () => {
    this.ordersService.completeOrder()
    this.router.navigate(['/'])
  }
  fetchAndDownloadOrderReceipt = async () => {
    // I decided to implement the download method in SuccessPageComponent, because we expect to meet download functionality only in SuccessPageComponent.
    if (!this.orderID) return this.completeOrder();
    const data = await this.ordersService.fetchOrderReceipt();
    if (!data) return this.completeOrder();
    var blob = new Blob([data], { type: 'octet/stream' });
    
    saveAs(blob, `order_${this.orderID}`);
  }
}
