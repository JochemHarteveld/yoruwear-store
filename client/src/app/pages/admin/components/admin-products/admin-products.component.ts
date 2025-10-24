import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../../services/product.service';
import { Product } from '../../../../models/product.model';

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
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.css'
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