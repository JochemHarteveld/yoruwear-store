import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  size: string;
  categoryId: number;
  maxStock: number;
}

export interface CartSummary {
  subtotal: number;
  vat: number;
  vatPercentage: number;
  discount: number;
  couponCode?: string;
  total: number;
  itemCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems = signal<CartItem[]>([]);
  private couponCode = signal<string>('');
  private vatPercentage = 21; // 21% VAT for EU

  // Computed values
  public items = this.cartItems.asReadonly();
  public itemCount = computed(() => 
    this.cartItems().reduce((sum, item) => sum + item.quantity, 0)
  );

  public subtotal = computed(() => 
    this.cartItems().reduce((sum, item) => sum + (item.price * item.quantity), 0)
  );

  public vatAmount = computed(() => 
    // VAT is included in prices, so calculate the VAT portion
    (this.subtotal() * this.vatPercentage) / (100 + this.vatPercentage)
  );

  private firstTimeBuyerDiscount = signal<boolean>(false);

  public discount = computed(() => {
    const code = this.couponCode();
    const subtotal = this.subtotal();
    let discount = 0;
    
    // First-time buyer discount (10%)
    if (this.firstTimeBuyerDiscount()) {
      discount = subtotal * 0.10;
    }
    
    // Example coupon codes (can stack with first-time buyer discount)
    switch (code.toUpperCase()) {
      case 'SAVE10': 
        discount = Math.max(discount, subtotal * 0.10);
        break;
      case 'SAVE20': 
        discount = Math.max(discount, subtotal * 0.20);
        break;
      case 'WELCOME': 
        discount = Math.max(discount, Math.min(subtotal * 0.15, 50));
        break;
    }
    
    return discount;
  });

  public total = computed(() => 
    // VAT is already included in subtotal, so just subtract discount
    this.subtotal() - this.discount()
  );

  public summary = computed((): CartSummary => ({
    subtotal: this.subtotal(),
    vat: this.vatAmount(),
    vatPercentage: this.vatPercentage,
    discount: this.discount(),
    couponCode: this.couponCode() || undefined,
    total: this.total(),
    itemCount: this.itemCount()
  }));

  constructor() {
    this.loadCartFromStorage();
  }

  addToCart(product: any, quantity: number = 1, size: string = 'M'): void {
    const items = this.cartItems();
    const existingItemIndex = items.findIndex(
      item => item.productId === product.id && item.size === size
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...items];
      const existingItem = updatedItems[existingItemIndex];
      const newQuantity = Math.min(
        existingItem.quantity + quantity,
        existingItem.maxStock
      );
      updatedItems[existingItemIndex] = { ...existingItem, quantity: newQuantity };
      this.cartItems.set(updatedItems);
    } else {
      // Add new item
      const newItem: CartItem = {
        id: Date.now(), // Simple ID generation
        productId: product.id,
        name: product.name,
        price: Number(product.price), // Ensure price is a number
        quantity: Math.min(quantity, product.stock),
        size,
        categoryId: product.categoryId,
        maxStock: product.stock
      };
      this.cartItems.set([...items, newItem]);
    }

    this.saveCartToStorage();
  }

  updateQuantity(itemId: number, quantity: number): void {
    const items = this.cartItems();
    const updatedItems = items.map(item => {
      if (item.id === itemId) {
        return { 
          ...item, 
          quantity: Math.max(0, Math.min(quantity, item.maxStock))
        };
      }
      return item;
    }).filter(item => item.quantity > 0);

    this.cartItems.set(updatedItems);
    this.saveCartToStorage();
  }

  removeItem(itemId: number): void {
    const items = this.cartItems();
    const updatedItems = items.filter(item => item.id !== itemId);
    this.cartItems.set(updatedItems);
    this.saveCartToStorage();
  }

  applyCoupon(code: string): boolean {
    const validCoupons = ['SAVE10', 'SAVE20', 'WELCOME'];
    if (validCoupons.includes(code.toUpperCase())) {
      this.couponCode.set(code.toUpperCase());
      this.saveCartToStorage();
      return true;
    }
    return false;
  }

  removeCoupon(): void {
    this.couponCode.set('');
    this.saveCartToStorage();
  }

  setFirstTimeBuyerDiscount(isFirstTime: boolean): void {
    this.firstTimeBuyerDiscount.set(isFirstTime);
    this.saveCartToStorage();
  }

  clearCart(): void {
    this.cartItems.set([]);
    this.couponCode.set('');
    this.firstTimeBuyerDiscount.set(false);
    this.saveCartToStorage();
  }

  private saveCartToStorage(): void {
    const cartData = {
      items: this.cartItems(),
      couponCode: this.couponCode(),
      firstTimeBuyerDiscount: this.firstTimeBuyerDiscount()
    };
    localStorage.setItem('cart', JSON.stringify(cartData));
  }

  private loadCartFromStorage(): void {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const cartData = JSON.parse(savedCart);
        this.cartItems.set(cartData.items || []);
        this.couponCode.set(cartData.couponCode || '');
        this.firstTimeBuyerDiscount.set(cartData.firstTimeBuyerDiscount || false);
      }
    } catch (error) {
      console.error('Failed to load cart from storage:', error);
    }
  }
}