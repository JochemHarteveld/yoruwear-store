import { Component, OnInit, signal } from '@angular/core';
import { Product, Category } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
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

  formatPrice(price: string): string {
    return `$${parseFloat(price).toFixed(2)}`;
  }

  addToCart(product: Product): void {
    // TODO: Implement add to cart functionality
    console.log('Added to cart:', product);
    // You can implement cart functionality here later
  }
}