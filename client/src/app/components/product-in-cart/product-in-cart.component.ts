import { animate, style, transition, trigger } from '@angular/animations';
import { Component, HostListener, Input, OnInit } from '@angular/core';
import { ICartItem } from 'src/app/models/cartItem';
import { CartService } from 'src/app/services/cart/cart.service';

@Component({
  selector: 'app-product-in-cart',
  templateUrl: './product-in-cart.component.html',
  styleUrls: ['./product-in-cart.component.css'],
  animations: [
    trigger('fadeInOutState', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('.2s ease-in', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class ProductInCartComponent implements OnInit {

  @Input() data!: ICartItem;
  @Input() readOnlyCartItem: boolean = false;
  totalPrice: number = 0;
  constructor(private cartService: CartService) { }

  ngOnInit(): void {
    this.totalPrice = this.data.product.price * this.data.quantity;
  }
  increaseQuantity = () => {
    if (this.readOnlyCartItem) return;
    this.cartService.handleCartItemAddition(this.data.product._id, this.data.quantity)
  }
  decreaseQuantity = () => {
    if (this.readOnlyCartItem) return;
    this.cartService.handleCartItemDeletion(this.data.product._id, this.data.quantity)
  }
  removeCartItem = () => {
    if (this.readOnlyCartItem) return;
    this.cartService.removeCartItem(this.data.product._id)
  }

}
