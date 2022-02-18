import { Component, HostListener, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { IProduct } from 'src/app/models/product';
import { CartService } from 'src/app/services/cart/cart.service';
import { ProductsService } from 'src/app/services/products/products.service';
import { IState } from 'src/app/store/store';

@Component({
  selector: 'app-product-in-list',
  templateUrl: './product-in-list.component.html',
  styleUrls: ['./product-in-list.component.css']
})
export class ProductInListComponent implements OnInit {

  @Input() data!: IProduct;
  @Input() editProduct: boolean = false;
  editing: boolean = false;
  selectedQuantity: number = 0;
  showInput: boolean = false;
  constructor(private store: Store<IState>, private cartService: CartService, private productsService: ProductsService) { }

  @HostListener('mouseenter')
  onMouseEnter = () => {
    if (this.editProduct) return;
    this.showInput = true;
  }
  @HostListener('mouseleave') 
  onMouseLeave = () => {
    this.showInput = false;
  }
  
  async ngOnInit(): Promise<void> {
    this.store.select((state) => state.cartState.cartItems.find(ci => ci.product._id === this.data._id)).subscribe((relevantCartItem) => {
      this.selectedQuantity = relevantCartItem ? relevantCartItem.quantity : 0;
    })
    this.store.select((state) => state.productsState.activeProduct).subscribe(activeProduct => {
      if (activeProduct?._id !== this.data._id) this.editing = false;
      else this.editing = true;
    })
  }
  onActiveProductClick = () => {
    // onActiveProductClick method set the activeProduct for admin actions only (remove, edit, etc..)
    if (!this.editProduct || !this.data) return;
    if (this.editing) {
      this.editing = false;
      this.productsService.setActiveProduct(null)
    } else {
      this.editing = true;
      this.productsService.setActiveProduct(this.data)
    }
  }

  increaseQuantity = () => {
    if (this.editProduct) return;
    this.cartService.handleCartItemAddition(this.data._id, this.selectedQuantity)
  }
  decreaseQuantity = () => {
    if (this.editProduct) return;
    this.cartService.handleCartItemDeletion(this.data._id, this.selectedQuantity)
  }
  
}
