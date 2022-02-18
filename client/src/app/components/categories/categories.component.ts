import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ICategory } from 'src/app/models/category';
import { ProductsService } from 'src/app/services/products/products.service';
import { IState } from 'src/app/store/store';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  
  categories!: ICategory[];
  fetchingCategories$!: Observable<boolean>;
  currentCategoryId: string = '';
  constructor(private store: Store<IState>, private productsService: ProductsService) { }

  ngOnInit(): void {
    // initial the products categories, and set the the first category with its products as "active category".
    this.store.select((state) => state.productsState.categories).subscribe(categories => {
      if (!this.currentCategoryId && categories[0]) this.setCategoryProducts(categories[0]._id)
      this.categories = categories;
    })
    this.store.select((state) => state.productsState.currentProducts.categoryId).subscribe((id: string) => this.currentCategoryId = id)
    this.fetchingCategories$ = this.store.select((state) => state.productsState.fetchingCategories)
  }

  setCategoryProducts = async (id: string) => {
    if(this.currentCategoryId === id) return;
    this.productsService.fetchCategoryProducts(id)
  }

}
