import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProductsComponent } from './pages/products/products.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { SigninComponent } from './pages/auth/signin.component';
import { SignupComponent } from './pages/auth/signup.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'product/:id', component: ProductDetailComponent },
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
  { path: '**', redirectTo: '' }
];
