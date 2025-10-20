import { Component, inject, output } from '@angular/core';
import { CartService } from '../../../../services/cart.service';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cart-items',
  standalone: true,
  imports: [CurrencyPipe, FormsModule],
  templateUrl: './cart-items.component.html',
  styleUrl: './cart-items.component.css'
})
export class CartItemsComponent {
  cartService = inject(CartService);
  proceedToCheckout = output<void>();

  getCategoryIcon(categoryId: number): string {
    switch (categoryId) {
      case 1: return 'checkroom'; // T-Shirts
      case 2: return 'dry_cleaning'; // Hoodies & Sweatshirts
      case 3: return 'watch'; // Accessories
      case 4: return 'fitness_center'; // Shoes
      case 5: return 'local_fire_department'; // Jackets
      case 6: return 'straighten'; // Pants & Jeans
      case 7: return 'face_retouching_natural'; // Dresses & Skirts
      case 8: return 'backpack'; // Bags
      default: return 'shopping_bag'; // Default
    }
  }

  updateQuantity(itemId: number, quantity: number): void {
    this.cartService.updateQuantity(itemId, quantity);
  }

  removeItem(itemId: number): void {
    this.cartService.removeItem(itemId);
  }

  applyCoupon(code: string): void {
    if (code.trim()) {
      const success = this.cartService.applyCoupon(code.trim());
      if (!success) {
        console.log('Invalid coupon code');
      }
    }
  }

  removeCoupon(): void {
    this.cartService.removeCoupon();
  }

  onProceedToCheckout(): void {
    this.proceedToCheckout.emit();
  }
}