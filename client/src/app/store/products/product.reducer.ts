import { state } from '@angular/animations';
import {
  createReducer,
  on,
} from '@ngrx/store';
import { ICategory } from 'src/app/models/category';
import { IProduct } from 'src/app/models/product';
import { addProductSuccess, fetchCategoriesFail, fetchCategoriesStart, fetchCategoriesSuccess, fetchCategoryProductsFail, fetchCategoryProductsStart, fetchCategoryProductsSuccess, fetchProductsSearchFail, fetchProductsSearchStart, fetchProductsSearchSuccess, removeProductSuccess, setActiveProduct, updateProductSuccess } from './product.actions';

export interface IProductState {
  fetchingCategories: boolean;
  fetchingProducts: boolean;
  activeProduct: IProduct | null;
  currentProducts: {
    categoryId: string;
    products: IProduct[];
  },
  categories: ICategory[];
}
const initialState: IProductState = {
  fetchingCategories: false,
  fetchingProducts: false,
  activeProduct: null,
  currentProducts: {
    categoryId: '',
    products: []
  },
  categories: [],
}

export const productReducer = createReducer(initialState,
  on(fetchCategoriesStart, (state) => ({ ...state, fetchingCategories: true })),
  on(fetchCategoriesSuccess, fetchCategoriesFail, (state) => ({ ...state, fetchingCategories: false })),
  on(fetchCategoriesSuccess, (state, { categories }) => ({ ...state, categories: categories })),

  on(fetchCategoryProductsStart, fetchProductsSearchStart, (state) => ({ ...state, fetchingProducts: true })),
  on(fetchCategoryProductsFail, fetchCategoryProductsSuccess, fetchProductsSearchSuccess, fetchProductsSearchFail, (state) => ({ ...state, fetchingProducts: false })),
  on(fetchCategoryProductsSuccess, (state, { products, categoryId }) => ({ ...state, currentProducts: { ...state.currentProducts, products, categoryId } })),

  on(fetchProductsSearchSuccess, (state, { products }) => ({ ...state, currentProducts: { ...state.currentProducts, products, categoryId: '' } })),

  on(addProductSuccess, (state, { newProduct }) => {
    if (newProduct.categoryID !== state.currentProducts.categoryId) return state;
    return { ...state, currentProducts: { ...state.currentProducts, products: state.currentProducts.products.concat(newProduct) }}
  }),
  on(updateProductSuccess, (state, { updatedProduct }) => {
    if (updatedProduct.categoryID !== state.currentProducts.categoryId) return state;
    return { ...state, currentProducts: { ...state.currentProducts, products: state.currentProducts.products.map(p => p._id === updatedProduct._id ? updatedProduct : p) }}
  }),
  on(removeProductSuccess, (state, { productToRemove }) => {
    if (productToRemove.categoryID !== state.currentProducts.categoryId) return state;
    return { ...state, currentProducts: { ...state.currentProducts, products: state.currentProducts.products.filter(p => p._id !== productToRemove._id ) }}
  }),

  on(setActiveProduct, (state, { product }) => ({ ...state, activeProduct: product })),
  on(addProductSuccess, updateProductSuccess, removeProductSuccess, (state) => ({ ...state, activeProduct: null })),
)
