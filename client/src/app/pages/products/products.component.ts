import { Component, OnInit, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Product, Category } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { CurrencyUtils } from '../../utils/currency.utils';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  private router = inject(Router);
  
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  selectedCategory = signal<number | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts() {
    this.loading.set(true);
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load products');
        this.loading.set(false);
        console.error('Error loading products:', err);
      }
    });
  }

  loadCategories() {
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  filterByCategory(categoryId: number | null) {
    this.selectedCategory.set(categoryId);
  }

  get filteredProducts() {
    const allProducts = this.products();
    const selectedCat = this.selectedCategory();
    
    if (selectedCat === null) {
      return allProducts;
    }
    
    return allProducts.filter(product => product.categoryId === selectedCat);
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories().find(cat => cat.id === categoryId);
    return category?.name || 'Unknown Category';
  }

  getCategoryIcon(categoryId: number): string {
    switch (categoryId) {
      case 1: return 'checkroom'; // T-Shirts
      case 2: return 'dry_cleaning'; // Hoodies & Sweatshirts
      case 3: return 'watch'; // Accessories
      case 4: return 'footprint'; // Shoes
      case 5: return 'dry_cleaning'; // Jackets
      case 6: return 'checkroom'; // Pants & Jeans
      case 7: return 'checkroom'; // Dresses & Skirts
      case 8: return 'shopping_bag'; // Bags
      default: return 'shopping_cart'; // Default
    }
  }

  formatPrice(price: string): string {
    return CurrencyUtils.formatPrice(price);
  }

  getProductImageUrl(product: Product): string {
    // Use the imageUrl from the server, fallback to generated path if not available
    if (product.imageUrl) {
      return environment.assetsUrl + product.imageUrl;
    }
    
    // Fallback logic (legacy)
    const categoryMap: { [key: number]: string } = {
      1: 'led-tshirts',        // LED T-Shirts
      2: 'hoodies-sweaters',   // Hoodies & Sweaters
      3: 'bottoms',           // Bottoms
      4: 'accessories',       // Accessories
      5: 'festival-sets'      // Festival Sets
    };
    
    const category = categoryMap[product.categoryId] || 'led-tshirts';
    const slug = product.name.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    
    return environment.assetsUrl + `/assets/products/${category}/${product.id}-${slug}.png`;
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    const placeholder = target.nextElementSibling as HTMLElement;
    if (target && placeholder) {
      target.style.display = 'none';
      placeholder.style.display = 'flex';
    }
  }

  viewProduct(productId: number): void {
    this.router.navigate(['/product', productId]);
  }

  addToCart(product: Product): void {
    // TODO: Implement add to cart functionality
    console.log('Added to cart:', product);
    // You can implement cart functionality here later
  }
}