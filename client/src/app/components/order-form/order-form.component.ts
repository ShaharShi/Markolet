import { animate, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { ECities } from 'src/app/models/enums';
import { IOrder } from 'src/app/models/order';
import { ISessionUser } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth/auth.service';
import { OrdersService } from 'src/app/services/orders/orders.service';
import { IState } from 'src/app/store/store';
import { validateCity, validateCreditCard, validateShippingDate } from 'src/app/utils/validators';

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.css'],
  animations: [
    trigger('errorMessageState', [
      transition(':enter', [
        style({ transform: 'translateY(-20%)', opacity: 0 }),
        animate('.2s ease-in', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        style({ transform: 'translateY(0)', opacity: 1 }),
        animate('.2s ease-out', style({ transform: 'translateY(-20%)', opacity: 0 }))
      ])
    ])
  ]
})
export class OrderFormComponent implements OnInit {
  formError: string = '';
  creatingOrder$!: Observable<boolean>;
  cities = Object.values(ECities);
  minDate = moment().format('YYYY-MM-DDTHH:mm');
  form = this.fb.group({
    city: ['', [Validators.required, validateCity()]],
    street: ['', [Validators.required]],
    shippingDate: ['', [Validators.required, validateShippingDate()]],
    creditCard: ['', [Validators.required, Validators.minLength(12), validateCreditCard]],
  })
  constructor(private fb: FormBuilder, private orderService: OrdersService, private authService: AuthService, private router: Router, private store: Store<IState>) { }

  async ngOnInit(): Promise<void> {
    const user = await this.authService.fetchUserSession();
    if (!user) return this.authService.logout();

    this.creatingOrder$ = this.store.select(state => state.ordersState.creatingOrder);
    this.initialFormValues(user)
  }
  initialFormValues = async (user: ISessionUser) => {
    // initial the order-form values with the current user city and street as he signup with.
    // initial minDate with 8 hours and 30 minutes from now, to simulate process work time (products collection, delivery, etc...) 
    if (user.address.city) this.form.controls['city'].setValue(user.address.city)
    if (user.address.street) this.form.controls['street'].setValue(user.address.street)
    this.minDate = moment().add(8, 'hours').add(30, 'minutes').format('YYYY-MM-DDTHH:mm');
    this.form.controls['shippingDate'].setValue(this.minDate)
  }

  handleSubmit = async (): Promise<void> => {
    if ((this.form.invalid || this.form.untouched || this.form.pristine)) { this.formError = 'All fields are require to proceed'; return; }
    const controls = this.form.controls;
    const city = controls['city'].value, street = controls['street'].value, shippingDate = controls['shippingDate'].value, creditCard = controls['creditCard'].value;

    const order: Partial<IOrder> = {
      creditCard,
      deliverDetails: {
        city: city, 
        street, 
        date: shippingDate,
      },
    };
    const errorMsg = await this.orderService.createOrder(order);
    if (errorMsg) return this.formError = errorMsg;
    this.router.navigate(['order/success'])
  }
}