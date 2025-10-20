import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { OrderService, OrderRequest, OrderResponse } from '../../services/order.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Import new components
import { CartStepperComponent } from './components/cart-stepper/cart-stepper.component';
import { CartItemsComponent } from './components/cart-items/cart-items.component';
import { CheckoutFormComponent, OrderForm } from './components/checkout-form/checkout-form.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule, CartStepperComponent, CartItemsComponent, CheckoutFormComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  private router = inject(Router);
  public cartService = inject(CartService);
  public authService = inject(AuthService);
  private orderService = inject(OrderService);

  currentStep = signal(1);
  
  // Order completion state
  isProcessingOrder = signal(false);
  orderData = signal<OrderResponse | null>(null);
  
  // Store order totals before clearing cart
  orderSubtotal = signal(0);
  orderDeliveryCost = signal(0);
  orderTotal = signal(0);
  
  // Order form data
  orderForm = signal<OrderForm>({
    contact: {
      fullName: '',
      email: '',
      phone: ''
    },
    address: {
      streetAddress: '',
      city: '',
      postalCode: '',
      country: 'Netherlands'
    },
    delivery: {
      method: '' as 'standard' | 'express' | '',
      cost: 0
    },
    payment: {
      method: ''
    }
  });

  ngOnInit(): void {
    // Pre-fill form with user data if authenticated
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.updateOrderForm({
          ...this.orderForm(),
          contact: {
            fullName: user.fullName || '',
            email: user.email || '',
            phone: user.phone || ''
          },
          address: {
            streetAddress: user.streetAddress || '',
            city: user.city || '',
            postalCode: user.postalCode || '',
            country: user.country || 'Netherlands'
          }
        });
      }
    });
  }

  proceedToCheckout(): void {
    this.currentStep.set(2);
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  goBackToCart(): void {
    this.currentStep.set(1);
  }

  updateOrderForm(form: OrderForm): void {
    this.orderForm.set(form);
  }

  completeOrder(): void {
    if (this.isProcessingOrder()) return;

    this.isProcessingOrder.set(true);

    // Prepare order data
    const summary = this.cartService.summary();
    const deliveryCost = this.orderForm().delivery.cost || 0;
    const items = this.cartService.items().map(item => ({
      id: item.productId, // Use the actual product ID, not the cart item ID
      name: item.name,
      price: Number(item.price), // Convert price to number
      quantity: item.quantity,
      size: item.size
    }));

    const orderRequest: OrderRequest = {
      contact: this.orderForm().contact,
      address: this.orderForm().address,
      delivery: this.orderForm().delivery,
      payment: this.orderForm().payment,
      items: items,
      subtotal: summary.total,
      deliveryCost: deliveryCost,
      total: summary.total + deliveryCost
    };

    // Send order to server
    this.orderService.createOrder(orderRequest).subscribe({
      next: (response: OrderResponse) => {
        // Store order data
        this.orderData.set(response);
        
        // Store totals for display
        this.orderSubtotal.set(response.subtotal);
        this.orderDeliveryCost.set(response.deliveryCost);
        this.orderTotal.set(response.total);
        
        // Clear cart
        this.cartService.clearCart();
        
        // Move to confirmation step
        this.currentStep.set(3);
        this.isProcessingOrder.set(false);
      },
      error: (error) => {
        console.error('Error creating order:', error);
        this.isProcessingOrder.set(false);
        // TODO: Show error message to user
        alert('Failed to process your order. Please try again.');
      }
    });
  }

  getFinalTotal(): number {
    // If we're on the confirmation step, use stored totals
    if (this.currentStep() === 3) {
      return this.orderTotal();
    }
    // Otherwise calculate from current cart
    const summary = this.cartService.summary();
    const deliveryCost = this.orderForm().delivery.cost || 0;
    return summary.total + deliveryCost;
  }

  getOrderSubtotal(): number {
    // If we're on the confirmation step, use stored subtotal
    if (this.currentStep() === 3) {
      return this.orderSubtotal();
    }
    // Otherwise get from current cart
    return this.cartService.summary().total;
  }

  getOrderDeliveryCost(): number {
    // If we're on the confirmation step, use stored delivery cost
    if (this.currentStep() === 3) {
      return this.orderDeliveryCost();
    }
    // Otherwise get from current order form
    return this.orderForm().delivery.cost || 0;
  }

  getDeliveryMethodName(): string {
    switch (this.orderForm().delivery.method) {
      case 'standard': return 'Standard Delivery (3-5 business days)';
      case 'express': return 'Express Delivery (1-2 business days)';
      default: return 'Not selected';
    }
  }

  getPaymentMethodName(): string {
    switch (this.orderForm().payment.method) {
      case 'ideal': return 'iDEAL';
      case 'applepay': return 'Apple Pay';
      case 'googlepay': return 'Google Pay';
      default: return 'Not selected';
    }
  }
}