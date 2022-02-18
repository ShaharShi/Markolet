import { animate, style, transition, trigger } from '@angular/animations';
import { TitleCasePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { ICategory } from 'src/app/models/category';
import { EUnits } from 'src/app/models/enums';
import { IProduct } from 'src/app/models/product';
import { ProductsService } from 'src/app/services/products/products.service';
import { IState } from 'src/app/store/store';
import { validateCategory, validateUnit } from 'src/app/utils/validators';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
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
export class ProductFormComponent implements OnInit {

  @Input() data!: IProduct | null;
  @Input() categories!: ICategory[];
  imageURL: string = '';
  units: string[] = Object.values(EUnits);
  formError: string = '';
  form = this.fb.group({
    name: ['', Validators.required],
    price: [null, Validators.required],
    imgURL: ['', Validators.required],
    unit: ['', [Validators.required, validateUnit()]],
    categoryID: ['', Validators.required]
    
  })
  constructor(private store: Store<IState>, private fb: FormBuilder, private productsService: ProductsService, private dialog: MatDialog, private titleCasePipe: TitleCasePipe) { }

  ngOnInit(): void {
    this.attachFormToState()
  }
  attachFormToState = () => {
    this.store.select((state) => state.productsState.activeProduct).subscribe(activeProduct => {
      this.imageURL = activeProduct ? activeProduct.imgURL : '';
      this.form.patchValue({
        name: activeProduct ? activeProduct.name : '',
        price: activeProduct ? activeProduct.price : '',
        imgURL: activeProduct ? activeProduct.imgURL : '',
        unit: activeProduct ? activeProduct.unit.toLowerCase() : '',
        categoryID: activeProduct ? activeProduct.categoryID : '',
      })
    })
  }
  handleURLChange = () => {
    // change the imageUrl on form to show the current picture to the user (admin) in real time, before submiting.
    this.imageURL = this.form.controls['imgURL'].value;
  }
  initialForm = () => {
    this.initialFormError()
    this.productsService.setActiveProduct(null)
    this.imageURL = '';
    this.form.reset()
    this.form.markAsPristine()
    this.form.markAsUntouched()
    this.form.updateValueAndValidity()
  }
  initialFormError = () => {
    this.formError = '';
  }
  handleSubmit = () => {
    const name = this.form.controls['name'].value,
    price = this.form.controls['price'].value,
    imgURL = this.form.controls['imgURL'].value, 
    unit = this.form.controls['unit'].value,
    categoryID = this.form.controls['categoryID'].value;
    
    if (!name || !price || !imgURL || !unit || !categoryID ) return this.formError = 'All parameters are required !';
    if (this.data && (name === this.data.name && price === this.data.price && imgURL === this.data.imgURL && unit === this.data.unit && categoryID === this.data.categoryID )) return this.formError = 'Make some changes to edit this product ..';
    if (!validateCategory(this.categories, categoryID)) return this.formError = 'There is\'nt category with this ID !';
    const product = {
      name: name,
      price: price,
      imgURL: imgURL,
      unit: unit,
      categoryID: categoryID,
    }
    
    if (this.data) this.productsService.updateProduct({ ...product, _id: this.data._id});
    else this.productsService.addProduct(product);

    return this.initialForm();
  }
  openDialog() {
    if (!this.data) return;
    const dialogRef = this.dialog.open(DialogComponent, {
      data: `Are you sure you want to remove ${this.titleCasePipe.transform(this.data.name.toLowerCase())} ? (Irreversible action !)`,
      panelClass: 'dialog-box'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.removeItem()
    });
  }
  removeItem = () => {
    if (!this.data) return;
    this.productsService.removeProduct(this.data)
  }
}
