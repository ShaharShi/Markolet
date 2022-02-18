import { createAction, props } from "@ngrx/store";
import { ICategory } from "src/app/models/category";
import { IProduct } from "src/app/models/product";
import { createActionsGroup } from "src/app/utils/context.helpers";

export const {
  start: fetchCategoriesStart,
  success: fetchCategoriesSuccess,
  fail: fetchCategoriesFail,
} = createActionsGroup<{ categories: ICategory[] }>('Products', 'Fetch Products Categories');

export const {
  start: fetchCategoryProductsStart,
  success: fetchCategoryProductsSuccess,
  fail: fetchCategoryProductsFail,
} = createActionsGroup<{ products: IProduct[], categoryId: string }>('Products', 'Fetch Category Products');

export const {
  start: fetchProductsSearchStart,
  success: fetchProductsSearchSuccess,
  fail: fetchProductsSearchFail,
} = createActionsGroup<{ products: IProduct[] }>('Products', 'Fetch Products Search');

export const {
  start: addProductStart,
  success: addProductSuccess,
  fail: addProductFail,
} = createActionsGroup<{ newProduct: IProduct }>('Products', 'Add Product');

export const {
  start: removeProductStart,
  success: removeProductSuccess,
  fail: removeProductFail,
} = createActionsGroup<{ productToRemove: IProduct }>('Products', 'Remove Product');

export const {
  start: updateProductStart,
  success: updateProductSuccess,
  fail: updateProductFail,
} = createActionsGroup<{ updateProduct: IProduct }>('Products', 'Update Product');

export const setActiveProduct = createAction('[Product] Set Active Product', props<{ product: IProduct | null }>())