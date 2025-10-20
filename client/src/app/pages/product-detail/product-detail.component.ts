import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';
import { CurrencyUtils } from '../../utils/currency.utils';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="product-detail-container">
      @if (loading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading product...</p>
        </div>
      } @else if (error()) {
        <div class="error-state">
          <div class="error-icon material-icons">warning</div>
          <h2>Product Not Found</h2>
          <p>{{ error() }}</p>
          <button class="btn secondary" (click)="goBack()">← Back to Products</button>
        </div>
      } @else if (product(); as prod) {
        <div class="product-detail">
          <!-- Back Button -->
          <button class="back-btn" (click)="goBack()">
            ← Back to Products
          </button>

          <div class="product-content">
            <!-- Product Image -->
            <div class="product-image">
              <div class="image-placeholder">
                <div class="placeholder-icon material-icons">{{ getCategoryIcon(prod.categoryId) }}</div>
                <span class="placeholder-text">Product Image</span>
              </div>
            </div>

            <!-- Product Info -->
            <div class="product-info">
              <div class="product-header">
                <h1 class="product-name">{{ prod.name }}</h1>
                <div class="product-price">{{ formatPrice(prod.price) }}</div>
              </div>

              <div class="product-description">
                <h3>Description</h3>
                <p>{{ prod.description }}</p>
              </div>

              <!-- Size Selection -->
              <div class="size-selection">
                <h3>Size</h3>
                <div class="size-options">
                  @for (size of availableSizes(); track size) {
                    <button 
                      class="size-btn"
                      [class.selected]="selectedSize() === size"
                      (click)="selectSize(size)">
                      {{ size }}
                    </button>
                  }
                </div>
                @if (selectedSize()) {
                  <p class="size-selected">Selected: {{ selectedSize() }}</p>
                }
              </div>

              <!-- Stock Info -->
              <div class="stock-info">
                @if (prod.stock > 0) {
                  <span class="in-stock">
                    <span class="material-icons">check_circle</span>
                    In Stock ({{ prod.stock }} available)
                  </span>
                } @else {
                  <span class="out-of-stock">
                    <span class="material-icons">cancel</span>
                    Out of Stock
                  </span>
                }
              </div>

              <!-- Add to Cart Section -->
              <div class="add-to-cart-section">
                <div class="quantity-selector">
                  <label for="quantity">Quantity:</label>
                  <div class="quantity-controls">
                    <button 
                      class="qty-btn" 
                      (click)="decreaseQuantity()"
                      [disabled]="quantity() <= 1">
                      <span class="material-icons">remove</span>
                    </button>
                    <span class="quantity">{{ quantity() }}</span>
                    <button 
                      class="qty-btn" 
                      (click)="increaseQuantity()"
                      [disabled]="quantity() >= prod.stock">
                      <span class="material-icons">add</span>
                    </button>
                  </div>
                </div>

                <button 
                  class="add-to-cart-btn"
                  [disabled]="!selectedSize() || prod.stock === 0 || addingToCart()"
                  (click)="addToCart()">
                  @if (addingToCart()) {
                    <span class="spinner small"></span>
                    Adding...
                  } @else {
                    <span class="material-icons">shopping_cart</span>
                    Add to Cart
                  }
                </button>
              </div>

              @if (addedToCart()) {
                <div class="success-message">
                  <span class="material-icons">check_circle</span>
                  Added to cart successfully!
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .product-detail-container {
      min-height: 100vh;
      background: var(--bg-primary, #0b1220);
      color: var(--text-primary, #ffffff);
      padding: 2rem;
    }

    .loading-state, .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      text-align: center;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(255, 255, 255, 0.1);
      border-left: 4px solid var(--brand-primary, #7c5cff);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    .spinner.small {
      width: 16px;
      height: 16px;
      border-width: 2px;
      margin: 0 0.5rem 0 0;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-state .error-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .back-btn {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: var(--text-primary, #ffffff);
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s ease;
      margin-bottom: 2rem;
    }

    .back-btn:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-1px);
    }

    .product-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .product-image {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      overflow: hidden;
      aspect-ratio: 1;
    }

    .image-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--text-muted, #94a3b8);
    }

    .placeholder-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.6;
    }

    .placeholder-text {
      font-size: 1.1rem;
      font-weight: 600;
    }

    .product-info {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .product-header {
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 1.5rem;
    }

    .product-name {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 1rem 0;
      line-height: 1.2;
    }

    .product-price {
      font-size: 2rem;
      font-weight: 600;
      color: var(--brand-primary, #7c5cff);
    }

    .product-description h3 {
      margin: 0 0 0.75rem 0;
      color: var(--text-primary, #ffffff);
      font-size: 1.25rem;
    }

    .product-description p {
      color: var(--text-secondary, #94a3b8);
      line-height: 1.6;
      margin: 0;
    }

    .size-selection h3 {
      margin: 0 0 1rem 0;
      color: var(--text-primary, #ffffff);
      font-size: 1.25rem;
    }

    .size-options {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }

    .size-btn {
      padding: 0.75rem 1rem;
      border: 2px solid rgba(255, 255, 255, 0.2);
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-primary, #ffffff);
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      min-width: 3rem;
      transition: all 0.2s ease;
    }

    .size-btn:hover {
      border-color: var(--brand-primary, #7c5cff);
      background: rgba(124, 92, 255, 0.1);
    }

    .size-btn.selected {
      border-color: var(--brand-primary, #7c5cff);
      background: var(--brand-primary, #7c5cff);
      color: white;
    }

    .size-selected {
      color: var(--brand-primary, #7c5cff);
      font-weight: 600;
      margin: 0;
    }

    .stock-info {
      padding: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
    }

    .in-stock {
      color: #10b981;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .out-of-stock {
      color: #ef4444;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .add-to-cart-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .quantity-selector {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .quantity-selector label {
      font-weight: 600;
      color: var(--text-primary, #ffffff);
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 0.5rem;
    }

    .qty-btn {
      width: 2rem;
      height: 2rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-primary, #ffffff);
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }

    .qty-btn .material-icons {
      font-size: 1rem;
    }

    .qty-btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.2);
    }

    .qty-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .quantity {
      min-width: 2rem;
      text-align: center;
      font-weight: 600;
    }

    .add-to-cart-btn {
      padding: 1rem 2rem;
      background: linear-gradient(135deg, var(--brand-primary, #7c5cff), #9f7aea);
      border: none;
      color: white;
      border-radius: 12px;
      font-size: 1.1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .add-to-cart-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(124, 92, 255, 0.3);
    }

    .add-to-cart-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .success-message {
      padding: 1rem;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 8px;
      color: #10b981;
      font-weight: 600;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
    }

    .btn.secondary {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-primary, #ffffff);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .btn.secondary:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    @media (max-width: 768px) {
      .product-detail-container {
        padding: 1rem;
      }

      .product-content {
        grid-template-columns: 1fr;
        gap: 2rem;
      }

      .product-name {
        font-size: 2rem;
      }

      .product-price {
        font-size: 1.75rem;
      }

      .add-to-cart-section {
        position: sticky;
        bottom: 1rem;
        background: var(--bg-primary, #0b1220);
        padding: 1rem;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  // State signals
  product = signal<Product | null>(null);
  loading = signal(true);
  error = signal<string>('');
  selectedSize = signal<string>('');
  quantity = signal(1);
  addingToCart = signal(false);
  addedToCart = signal(false);

  // Available sizes (you can make this dynamic based on product category later)
  availableSizes = signal(['XS', 'S', 'M', 'L', 'XL', 'XXL']);

  ngOnInit() {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(parseInt(productId));
    } else {
      this.error.set('Invalid product ID');
      this.loading.set(false);
    }
  }

  loadProduct(id: number) {
    this.loading.set(true);
    this.error.set('');

    this.productService.getProduct(id).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Product not found or could not be loaded');
        this.loading.set(false);
        console.error('Error loading product:', error);
      }
    });
  }

  formatPrice(price: string): string {
    return CurrencyUtils.formatPrice(price);
  }

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

  selectSize(size: string) {
    this.selectedSize.set(size);
    // Clear the success message when changing size
    this.addedToCart.set(false);
  }

  increaseQuantity() {
    const current = this.quantity();
    const maxStock = this.product()?.stock || 0;
    if (current < maxStock) {
      this.quantity.set(current + 1);
    }
  }

  decreaseQuantity() {
    const current = this.quantity();
    if (current > 1) {
      this.quantity.set(current - 1);
    }
  }

  addToCart() {
    const product = this.product();
    const size = this.selectedSize();
    const quantity = this.quantity();

    if (!size || !product) {
      return;
    }

    this.addingToCart.set(true);

    // Simulate API call delay
    setTimeout(() => {
      // Add to cart using cart service
      this.cartService.addToCart(product, quantity, size);
      
      this.addingToCart.set(false);
      this.addedToCart.set(true);
      
      console.log('Added to cart:', {
        product: product.name,
        size: size,
        quantity: quantity
      });

      // Hide success message after 3 seconds
      setTimeout(() => {
        this.addedToCart.set(false);
      }, 3000);
    }, 1000);
  }

  goBack() {
    this.router.navigate(['/products']);
  }
}