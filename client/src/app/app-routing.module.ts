import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPageComponent } from './routes/admin-page/admin-page.component';
import { HomePageComponent } from './routes/home-page/home-page.component';
import { OrderPageComponent } from './routes/order-page/order-page.component';
import { ShopPageComponent } from './routes/shop-page/shop-page.component';
import { SignupPageComponent } from './routes/signup-page/signup-page.component';
import { SuccessPageComponent } from './routes/success-page/success-page.component';

const routes: Routes = [
  { path: '', component: HomePageComponent, pathMatch: 'full' },
  { path: 'signup', component: SignupPageComponent, pathMatch: 'full' },
  { path: 'shop', component: ShopPageComponent, pathMatch: 'full' },
  { path: 'order', component: OrderPageComponent, pathMatch: 'full' },
  { path: 'order/success', component: SuccessPageComponent, pathMatch: 'full' },
  { path: 'admin-panel', component: AdminPageComponent, pathMatch: 'full' },
  { path: '**', component: HomePageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
