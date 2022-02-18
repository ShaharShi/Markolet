import { HttpClient } from '@angular/common/http';
import { Injectable, isDevMode } from '@angular/core';
import { Store } from '@ngrx/store';
import { lastValueFrom } from 'rxjs';
import { ICategory } from 'src/app/models/category';
import { IProduct } from 'src/app/models/product';
import { addProductFail, addProductStart, addProductSuccess, fetchCategoriesFail, fetchCategoriesStart, fetchCategoriesSuccess, fetchCategoryProductsFail, fetchCategoryProductsStart, fetchCategoryProductsSuccess, fetchProductsSearchFail, fetchProductsSearchStart, fetchProductsSearchSuccess, removeProductFail, removeProductStart, removeProductSuccess, setActiveProduct, updateProductFail, updateProductStart, updateProductSuccess } from 'src/app/store/products/product.actions';
import { IState } from 'src/app/store/store';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';

const API_BASE_URL_PRODS = !environment.production ? 'http://localhost:4000/api/products' : 'api/products';
const API_BASE_URL_CATES = !environment.production ? 'http://localhost:4000/api/categories' : 'api/categories';

// Explanation:
// 1. I have decided that both Products and Categories entities will share a service because there aren't a lot of actions that Category entity do.
// and they basically do a similar actions that take care of the application products.
// 2. The service called "ProductsService" and not "CategoriesService" or "ProductsCategoryService" because the subject here is all about products.

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(private http: HttpClient, private store: Store<IState>, private authService: AuthService) { }

  async fetchCategoryProducts(categoryId: string) {
    // fetch all specific category's products, and update the relevant state.
    this.store.dispatch(fetchCategoryProductsStart());
    try {
      const authHeader = this.authService.getAuthorizationHeader();
      const categoryProducts = await lastValueFrom<IProduct[]>(this.http.get<IProduct[]>(`${API_BASE_URL_CATES}/products/${categoryId}`, { headers: { ...authHeader }}));
      this.store.dispatch(fetchCategoryProductsSuccess({ products: categoryProducts, categoryId }))

    } catch (error: any) {
      this.store.dispatch(fetchCategoryProductsFail())
      console.log({ errorAt: '[ProductsService] Fetch Category Products', message: error.error?.message, status: error?.status})
    }
  }
  async fetchProductsCategories() {
    // fetch all categories and update the relevant state.
    this.store.dispatch(fetchCategoriesStart());
    try {
      const authHeader = this.authService.getAuthorizationHeader();
      const categories = await lastValueFrom<ICategory[]>(this.http.get<ICategory[]>(`${API_BASE_URL_CATES}`, { headers: { ...authHeader }}));
      this.store.dispatch(fetchCategoriesSuccess({ categories }))

    } catch (error: any) {
      this.store.dispatch(fetchCategoriesFail())
      console.log({ errorAt: '[ProductsService] Fetch Products Categories', message: error.error?.message, status: error?.status})
    }
  }
  async getProductsStatistics() {
    // fetch application statistics and return the statistics results. 
    try {
      const authHeader = this.authService.getAuthorizationHeader();
      const results = await lastValueFrom<{ totalProductCount: number, totalOrdersCount: number }>(this.http.get<{ totalProductCount: number, totalOrdersCount: number }>(`${API_BASE_URL_PRODS}/statistics`, { headers: { ...authHeader }}));

      return results;
    } catch (error: any) {
      console.log({ errorAt: '[ProductsService] Fetch Products Statistics', message: error.error?.message, status: error?.status})
      return error.error?.message
    }
  }
  async fetchProductsSearch(term: string) {
    // fetch products search by term , and update the relevant state.
    // * if there isn't term, then return and don't proceed.
    if (!term) return;
    this.store.dispatch(fetchProductsSearchStart())
    try {
      
      const authHeader = this.authService.getAuthorizationHeader();
      const products = await lastValueFrom<IProduct[]>(this.http.get<IProduct[]>(`${API_BASE_URL_PRODS}/search`, { params: { term }, headers: { ...authHeader }}));
      this.store.dispatch(fetchProductsSearchSuccess({ products }))
      return
    } catch (error: any) {
      this.store.dispatch(fetchProductsSearchFail());
      console.log({ errorAt: '[ProductsService] Fetch Products Search', message: error.error?.message, status: error?.status });
      return;
    }
  }
  async addProduct(newProduct: Partial<IProduct>) {
    // send the new product to server for creating new one in DB, also updateing the the state.
    // the method doesn't return any value, unless an error occurred, then return the error message to the component that the user (admin) will know why an error occurred.
    const { name, categoryID, price, unit, imgURL } = newProduct;
    if (!name || !categoryID || !price || !unit || !imgURL) throw new Error('All parameters are required !');
    this.store.dispatch(addProductStart())
    try {
      const authHeader = this.authService.getAuthorizationHeader();
      const fetchedNewProducts = await lastValueFrom<IProduct>(this.http.post<IProduct>(`${API_BASE_URL_PRODS}/`, { name, categoryID, price, unit, imgURL }, { headers: { ...authHeader }}));
      this.store.dispatch(addProductSuccess({ newProduct: fetchedNewProducts }))
    } catch (error: any) {
      console.log({ errorAt: '[ProductsService] Add Product', message: error.error?.message, status: error?.status});
      this.store.dispatch(addProductFail())
      return error.error?.message;
    }
  }
  async updateProduct(updatedProduct: Partial<IProduct>) {
    // send the updated product to server to update the relevant product in DB, also updateing the the state.
    // the method doesn't return any value, unless an error occurred, then return the error message to the component that the user (admin) will know why an error occurred.
    const { _id, name, categoryID, price, unit, imgURL } = updatedProduct;
    if (!_id || !name || !categoryID || !price || !unit || !imgURL) throw new Error('All parameters are required !');
    this.store.dispatch(updateProductStart())
    try {
      const authHeader = this.authService.getAuthorizationHeader();
      const fetchedUpdatedProduct = await lastValueFrom<IProduct>(this.http.put<IProduct>(`${API_BASE_URL_PRODS}/${_id}`, { name, categoryID, price, unit, imgURL }, { headers: { ...authHeader }}));
      this.store.dispatch(updateProductSuccess({ updatedProduct: fetchedUpdatedProduct }))
    } catch (error: any) {
      console.log({ errorAt: '[ProductsService] Update Product', message: error.error?.message, status: error?.status});
      this.store.dispatch(updateProductFail())
      return error.error?.message;
    }
  }
  async removeProduct(product: IProduct) {
    // remove a product from DB by given ID, also updateing the the state.
    // the method doesn't return any value, unless an error occurred, then return the error message to the component that the user (admin) will know why an error occurred.
    if (!product._id) throw new Error("product ID parameter must be fulfilled !");
    this.store.dispatch(removeProductStart())
    try {
      const authHeader = this.authService.getAuthorizationHeader();
      await lastValueFrom(this.http.delete(`${API_BASE_URL_PRODS}/${product._id}`, { headers: { ...authHeader }}));
      this.store.dispatch(removeProductSuccess({ productToRemove: product }))
    } catch (error: any) {
      console.log({ errorAt: '[ProductsService] Remove Product', message: error.error?.message, status: error?.status});
      this.store.dispatch(removeProductFail())
      return error.error?.message;
    }
  }
  async setActiveProduct(product: IProduct | null) {
    // Set activeProduct for admin actions such as edit and delete product.

    if (!product && product !== null) throw new Error("product is required parameter.");
    this.store.dispatch(setActiveProduct({ product }))
  }
}
