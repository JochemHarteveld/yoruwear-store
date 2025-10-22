import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProductsComponent } from './pages/products/products.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { CartComponent } from './pages/cart/cart.component';
import { SigninComponent } from './pages/auth/signin.component';
import { SignupComponent } from './pages/auth/signup.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard.component';
import { AdminOverviewComponent } from './pages/admin/admin-overview.component';
import { AdminOrdersComponent } from './pages/admin/admin-orders.component';
import { AdminProductsComponent } from './pages/admin/admin-products.component';
import { authGuard, guestGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'cart', component: CartComponent },
  { 
    path: 'signin', 
    component: SigninComponent,
    canActivate: [guestGuard]
  },
  { 
    path: 'signup', 
    component: SignupComponent,
    canActivate: [guestGuard]
  },
  { 
    path: 'profile', 
    component: ProfileComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [AdminGuard],
    children: [
      { path: '', component: AdminOverviewComponent },
      { path: 'orders', component: AdminOrdersComponent },
      { path: 'products', component: AdminProductsComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
