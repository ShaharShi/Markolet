import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { firstValueFrom, Observable } from 'rxjs';
import { ICategory } from 'src/app/models/category';
import { IProduct } from 'src/app/models/product';
import { AuthService } from 'src/app/services/auth/auth.service';
import { OrdersService } from 'src/app/services/orders/orders.service';
import { ProductsService } from 'src/app/services/products/products.service';
import { IState } from 'src/app/store/store';
import { APP_IMAGES } from 'src/app/utils/images';

@Component({
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.css']
})
export class AdminPageComponent implements OnInit {

  categories!: ICategory[];
  products$!: Observable<IProduct[]>;
  fetchingProducts$!: Observable<boolean>;
  activeProduct: IProduct | null = null;
  IMAGES = APP_IMAGES;
  
  constructor(private productsService: ProductsService, private authService: AuthService, private router: Router, private store: Store<IState>, private ordersService: OrdersService) { }

  async ngOnInit(): Promise<void> {
    const user = await this.authService.fetchUserSession();
    if (!user) return this.authService.logout()
    const order = await firstValueFrom(this.store.select((state) => state.ordersState.currentOrder));
    if (order) this.ordersService.completeOrder();

    if (!user.isAdmin) this.router.navigate(['/'])
    else this.initialComponent()
  }
  initialComponent = async () => {
    this.productsService.fetchProductsCategories();
    
    this.fetchingProducts$ = this.store.select((state) => state.productsState.fetchingProducts);
    this.products$ = this.store.select((state) => state.productsState.currentProducts.products);
    this.store.select((state) => state.productsState.activeProduct).subscribe(activeProduct => this.activeProduct = activeProduct);
    this.store.select((state) => state.productsState.categories).subscribe(categories => this.categories = categories);

  }
  searchProducts = async (term: string) => {
    if (!term.trim()) {
      // if the term is empty, then get the first category from state and fetch its products to initial the products list component.
      const categories = await firstValueFrom(this.store.select((state) => state.productsState.categories))
      categories[0] && this.productsService.fetchCategoryProducts(categories[0]._id)
    };
    this.productsService.fetchProductsSearch(term);
  }
}
