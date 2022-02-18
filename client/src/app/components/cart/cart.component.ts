import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ICartItem } from 'src/app/models/cartItem';
import { CartService } from 'src/app/services/cart/cart.service';
import { IState } from 'src/app/store/store';
import { APP_IMAGES } from 'src/app/utils/images';
import { trigger, style, animate, transition } from '@angular/animations'
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  animations: [
    trigger('cartVisibilityState', [
      transition(':enter', [
        style({ width: '0', minWidth: '0', maxWidth: '0', opacity: 0 }),
        animate('.3s ease-in', style({ width: '350px', minWidth: '350px', maxWidth: '350px', opacity: .1 }))
      ]),
      transition(':leave', [
          style({ width: '350px', minWidth: '350px', maxWidth: '350px', opacity: 1, whiteSpace: 'nowrap' }),
          animate('.3s ease-out', style({width: '0', minWidth: '0', maxWidth: '0', opacity: 0, whiteSpace: 'nowrap'}))
      ])
    ])
  ]
})
export class CartComponent implements OnInit {
  // The cart is displayed in both shop-page and order-page.
  // if readOnlyCart is true so just display the products of the cart (of the order) to the user, without actions (add, remove, quantity, etc..).
  @Input() readOnlyCart: boolean = false;
  cartItems$!: Observable<ICartItem[]>;
  searchCartItems: null | ICartItem[] = null;
  totalCartPrice: number = 0;
  showCart: boolean = true;
  updatingCart$!: Observable<boolean>;
  IMAGES = APP_IMAGES;
  constructor(private store: Store<IState>, private cartService: CartService, private router: Router, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.cartItems$ = this.store.select((state) => {
      this.totalCartPrice = state.cartState.cartItems.reduce((acc: number, cartItem: ICartItem) => {
        return acc + (cartItem.quantity * cartItem.product.price)
      }, 0)
      return state.cartState.cartItems
    });
    
    this.updatingCart$ = this.store.select((state) => state.cartState.updatingCart );
  }
  navigate = async (navigateTo: string) => {
    // navigate to order-page or shop-page based on which route the cart in.
    if (!this.readOnlyCart) {
      const { cart } = await this.cartService.getCurrentCart();
      if (!cart) return this.snackBar.open('To create a new order, you must add at least one product to cart.', 'X', {
        duration: 8000,
        panelClass: 'snack-bar-box'
      });
    }
    this.router.navigate([navigateTo])
    return;
  }

  searchProductsInCart = async (term: string) => {
    if (!term.trim()) {
      this.searchCartItems = null;
    };
    this.cartItems$.subscribe(cartItems => {
      this.searchCartItems = cartItems.filter(cartItem => cartItem.product.name.toLocaleLowerCase().includes(term.toLocaleLowerCase()))
    })
  }
  toggleCartVisibility = () => {
    if (this.readOnlyCart) return;
      this.showCart = !this.showCart;
  }
  clearCart = () => {
    if (this.readOnlyCart) return;
    this.cartService.clearCart();
  }
}
