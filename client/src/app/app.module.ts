import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';
import { environment } from 'src/environments/environment';
import { ReactiveFormsModule } from '@angular/forms';
import { IState, reducers, metaReducers } from './store/store';
import { HomePageComponent } from './routes/home-page/home-page.component';
import { HeaderComponent } from './components/header/header.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { CookieService } from 'ngx-cookie-service';
import { SignupPageComponent } from './routes/signup-page/signup-page.component';
import { CapitalizeWordPipe } from './pipes/capitalize-word.pipe';
import { ShopPageComponent } from './routes/shop-page/shop-page.component';
import { ProductInListComponent } from './components/product-in-list/product-in-list.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ProductInCartComponent } from './components/product-in-cart/product-in-cart.component';
import { CartComponent } from './components/cart/cart.component';
import { SearchComponent } from './components/search/search.component';
import { OrderPageComponent } from './routes/order-page/order-page.component';
import { OrderFormComponent } from './components/order-form/order-form.component';
import { SuccessPageComponent } from './routes/success-page/success-page.component';
import { AdminPageComponent } from './routes/admin-page/admin-page.component';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { MatIconModule } from '@angular/material/icon';
import { CategoriesComponent } from './components/categories/categories.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TitleCasePipe } from '@angular/common';
import { DialogComponent } from './components/dialog/dialog.component'

@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    HeaderComponent,
    LoginFormComponent,
    SignupPageComponent,
    CapitalizeWordPipe,
    ShopPageComponent,
    ProductInListComponent,
    ProductInCartComponent,
    CartComponent,
    SearchComponent,
    OrderPageComponent,
    OrderFormComponent,
    SuccessPageComponent,
    AdminPageComponent,
    ProductFormComponent,
    CategoriesComponent,
    DialogComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    StoreModule.forRoot<IState>(reducers, { metaReducers }),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTooltipModule,
    MatBadgeModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  providers: [
    CookieService,
    TitleCasePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
