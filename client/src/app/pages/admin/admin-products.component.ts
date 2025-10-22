import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

interface ProductStats {
  product: Product;
  timesOrdered: number;
  totalRevenue: number;
  lowStock: boolean;
}

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-products-container">
      <div class="admin-header">
        <h1>
          <span class="material-icons">inventory_2</span>
          Product Management
        </h1>
        <p class="subtitle">Monitor stock levels and sales performance</p>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading products...</p>
        </div>
      } @else if (error()) {
        <div class="error-state">
          <div class="error-icon material-icons">error</div>
          <h2>Error Loading Products</h2>
          <p>{{ error() }}</p>
          <button class="btn secondary" (click)="loadProducts()">Retry</button>
        </div>
      } @else {
        <div class="products-stats">
          <div class="stat-card">
            <div class="stat-value">{{ productStats().length }}</div>
            <div class="stat-label">Total Products</div>
          </div>
          <div class="stat-card warning">
            <div class="stat-value">{{ getLowStockCount() }}</div>
            <div class="stat-label">Low Stock Items</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">€{{ getTotalInventoryValue() }}</div>
            <div class="stat-label">Inventory Value</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ getBestSellerName() }}</div>
            <div class="stat-label">Best Seller</div>
          </div>
        </div>

        <div class="filter-section">
          <div class="filter-buttons">
            <button class="filter-btn" 
                    [class.active]="currentFilter() === 'all'"
                    (click)="setFilter('all')">
              All Products
            </button>
            <button class="filter-btn" 
                    [class.active]="currentFilter() === 'low-stock'"
                    (click)="setFilter('low-stock')">
              Low Stock
            </button>
            <button class="filter-btn" 
                    [class.active]="currentFilter() === 'best-sellers'"
                    (click)="setFilter('best-sellers')">
              Best Sellers
            </button>
          </div>
        </div>

        <div class="products-grid">
          @for (stat of getFilteredProducts(); track stat.product.id) {
            <div class="product-card" [class.low-stock]="stat.lowStock">
              <div class="product-image">
                <img 
                  [src]="getProductImageUrl(stat.product)" 
                  [alt]="stat.product.name"
                  (error)="onImageError($event)"
                  loading="lazy"
                  class="product-img"
                />
                <div class="image-placeholder" style="display: none;">
                  <span class="material-icons product-icon">{{ getCategoryIcon(stat.product.categoryId) }}</span>
                </div>
                @if (stat.lowStock) {
                  <div class="low-stock-badge">
                    <span class="material-icons">warning</span>
                    Low Stock
                  </div>
                }
              </div>

              <div class="product-info">
                <div class="product-header">
                  <h3 class="product-name">{{ stat.product.name }}</h3>
                  <div class="product-price">€{{ stat.product.price }}</div>
                </div>

                <div class="product-stats-grid">
                  <div class="stat-item">
                    <span class="stat-icon material-icons">inventory</span>
                    <div class="stat-content">
                      <div class="stat-number">{{ stat.product.stock }}</div>
                      <div class="stat-text">In Stock</div>
                    </div>
                  </div>

                  <div class="stat-item">
                    <span class="stat-icon material-icons">shopping_cart</span>
                    <div class="stat-content">
                      <div class="stat-number">{{ stat.timesOrdered }}</div>
                      <div class="stat-text">Times Ordered</div>
                    </div>
                  </div>

                  <div class="stat-item">
                    <span class="stat-icon material-icons">attach_money</span>
                    <div class="stat-content">
                      <div class="stat-number">€{{ stat.totalRevenue.toFixed(0) }}</div>
                      <div class="stat-text">Revenue</div>
                    </div>
                  </div>

                  <div class="stat-item">
                    <span class="stat-icon material-icons">trending_up</span>
                    <div class="stat-content">
                      <div class="stat-number">{{ getPopularityScore(stat) }}%</div>
                      <div class="stat-text">Popularity</div>
                    </div>
                  </div>
                </div>

                <div class="product-actions">
                  <button class="action-btn" title="Edit Product">
                    <span class="material-icons">edit</span>
                  </button>
                  <button class="action-btn" title="View Analytics">
                    <span class="material-icons">analytics</span>
                  </button>
                  <button class="action-btn danger" title="Archive Product">
                    <span class="material-icons">archive</span>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>

        @if (getFilteredProducts().length === 0) {
          <div class="no-products">
            <span class="material-icons">inventory_2</span>
            <h3>No Products Found</h3>
            <p>No products match the current filter criteria.</p>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .admin-products-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
      background: var(--bg-primary);
      min-height: 100vh;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .admin-header {
      margin-bottom: 2rem;
      text-align: center;
    }

    .admin-header h1 {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 0.5rem 0;
    }

    .subtitle {
      color: var(--text-secondary);
      font-size: 1.1rem;
      margin: 0;
    }

    .loading-state, .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(124, 92, 255, 0.2);
      border-top: 4px solid var(--brand-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    .products-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 1.5rem;
      text-align: center;
    }

    .stat-card.warning {
      border-color: rgba(255, 193, 7, 0.3);
      background: rgba(255, 193, 7, 0.1);
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--brand-primary);
      margin-bottom: 0.5rem;
      word-break: break-word;
    }

    .stat-card.warning .stat-value {
      color: #ffc107;
    }

    .stat-label {
      color: var(--text-secondary);
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .filter-section {
      margin-bottom: 2rem;
    }

    .filter-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: 0.75rem 1.5rem;
      background: transparent;
      border: 2px solid rgba(255, 255, 255, 0.2);
      color: var(--text-secondary);
      border-radius: 25px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .filter-btn:hover {
      border-color: var(--brand-primary);
      color: var(--brand-primary);
    }

    .filter-btn.active {
      background: var(--brand-primary);
      border-color: var(--brand-primary);
      color: white;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 2rem;
    }

    .product-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      border-color: var(--brand-primary);
    }

    .product-card.low-stock {
      border-color: rgba(255, 193, 7, 0.5);
      box-shadow: 0 0 20px rgba(255, 193, 7, 0.2);
    }

    .product-image {
      aspect-ratio: 1;
      position: relative;
      overflow: hidden;
    }

    .product-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }

    .image-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--brand-gradient);
      opacity: 0.1;
    }

    .product-icon {
      font-size: 3rem;
      opacity: 0.7;
      color: var(--text-tertiary);
    }

    .low-stock-badge {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: rgba(255, 193, 7, 0.9);
      color: #000;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .low-stock-badge .material-icons {
      font-size: 1rem;
    }

    .product-info {
      padding: 1.5rem;
    }

    .product-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }

    .product-name {
      font-size: 1.2rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
      flex: 1;
      line-height: 1.3;
    }

    .product-price {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--brand-primary);
      margin-left: 1rem;
    }

    .product-stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
    }

    .stat-icon {
      color: var(--brand-primary);
      font-size: 1.5rem;
    }

    .stat-content {
      flex: 1;
    }

    .stat-number {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1;
    }

    .stat-text {
      font-size: 0.8rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .product-actions {
      display: flex;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .action-btn {
      flex: 1;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .action-btn:hover {
      background: rgba(255, 255, 255, 0.15);
      color: var(--text-primary);
      transform: translateY(-1px);
    }

    .action-btn.danger:hover {
      background: rgba(220, 53, 69, 0.2);
      border-color: #dc3545;
      color: #dc3545;
    }

    .no-products {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--text-secondary);
    }

    .no-products .material-icons {
      font-size: 4rem;
      opacity: 0.5;
      margin-bottom: 1rem;
    }

    .btn.secondary {
      background: transparent;
      border: 2px solid var(--brand-primary);
      color: var(--brand-primary);
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn.secondary:hover {
      background: var(--brand-primary);
      color: white;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .admin-products-container {
        padding: 1rem;
      }

      .products-grid {
        grid-template-columns: 1fr;
      }

      .filter-buttons {
        justify-content: stretch;
      }

      .filter-btn {
        flex: 1;
        text-align: center;
      }
    }
  `]
})
export class AdminProductsComponent implements OnInit {
  private productService = inject(ProductService);

  productStats = signal<ProductStats[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  currentFilter = signal<'all' | 'low-stock' | 'best-sellers'>('all');

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.loading.set(true);
    this.error.set(null);
    
    this.productService.getProducts().subscribe({
      next: (products) => {
        // Create product stats with mock data for now
        const stats: ProductStats[] = products.map(product => ({
          product,
          timesOrdered: Math.floor(Math.random() * 50), // Mock data
          totalRevenue: Math.floor(Math.random() * 1000), // Mock data
          lowStock: product.stock < 10
        }));
        
        this.productStats.set(stats);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set('Failed to load products');
        this.loading.set(false);
        console.error('Error loading products:', error);
      }
    });
  }

  setFilter(filter: 'all' | 'low-stock' | 'best-sellers') {
    this.currentFilter.set(filter);
  }

  getFilteredProducts(): ProductStats[] {
    const filter = this.currentFilter();
    const stats = this.productStats();

    switch (filter) {
      case 'low-stock':
        return stats.filter(stat => stat.lowStock);
      case 'best-sellers':
        return stats.filter(stat => stat.timesOrdered > 20).sort((a, b) => b.timesOrdered - a.timesOrdered);
      default:
        return stats;
    }
  }

  getLowStockCount(): number {
    return this.productStats().filter(stat => stat.lowStock).length;
  }

  getTotalInventoryValue(): string {
    const total = this.productStats().reduce((sum, stat) => {
      return sum + (parseFloat(stat.product.price) * stat.product.stock);
    }, 0);
    return total.toFixed(0);
  }

  getBestSellerName(): string {
    const bestSeller = this.productStats().reduce((max, stat) => 
      stat.timesOrdered > max.timesOrdered ? stat : max, 
      { timesOrdered: 0, product: { name: 'None' } } as any
    );
    return bestSeller.product.name;
  }

  getPopularityScore(stat: ProductStats): number {
    const maxOrdered = Math.max(...this.productStats().map(s => s.timesOrdered));
    return maxOrdered > 0 ? Math.round((stat.timesOrdered / maxOrdered) * 100) : 0;
  }

  getProductImageUrl(product: Product): string {
    const categoryMap: { [key: number]: string } = {
      1: 'led-tshirts',
      2: 'hoodies-sweaters',
      3: 'bottoms',
      4: 'accessories',
      5: 'festival-sets'
    };
    
    const category = categoryMap[product.categoryId] || 'led-tshirts';
    const slug = product.name.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    
    return `/assets/products/${category}/${product.id}-${slug}.png`;
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    const placeholder = target.nextElementSibling as HTMLElement;
    if (target && placeholder) {
      target.style.display = 'none';
      placeholder.style.display = 'flex';
    }
  }

  getCategoryIcon(categoryId: number): string {
    switch (categoryId) {
      case 1: return 'checkroom'; // LED T-Shirts
      case 2: return 'dry_cleaning'; // Hoodies & Sweaters
      case 3: return 'straighten'; // Bottoms
      case 4: return 'watch'; // Accessories
      case 5: return 'shopping_bag'; // Festival Sets
      default: return 'shopping_cart';
    }
  }
}