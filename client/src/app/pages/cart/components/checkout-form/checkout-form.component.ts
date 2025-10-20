import { Component, inject, input, output, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { CartService } from '../../../../services/cart.service';
import { FormsModule } from '@angular/forms';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { OrderSummaryComponent } from '../order-summary/order-summary.component';

export interface OrderForm {
  contact: {
    fullName: string;
    email: string;
    phone: string;
  };
  address: {
    streetAddress: string;
    city: string;
    postalCode: string;
    country: string;
  };
  delivery: {
    method: 'standard' | 'express' | '';
    cost: number;
  };
  payment: {
    method: string;
  };
}

@Component({
  selector: 'app-checkout-form',
  standalone: true,
  imports: [FormsModule, AsyncPipe, OrderSummaryComponent],
  templateUrl: './checkout-form.component.html',
  styleUrl: './checkout-form.component.css'
})
export class CheckoutFormComponent implements OnInit {
  private router = inject(Router);
  authService = inject(AuthService);
  cartService = inject(CartService);

  orderForm = input.required<OrderForm>();
  isProcessing = input<boolean>(false);
  orderFormChange = output<OrderForm>();
  completeOrder = output<void>();
  goBack = output<void>();

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

  isContactFormValid(): boolean {
    const contact = this.orderForm().contact;
    return !!(contact.fullName && contact.email && contact.phone);
  }

  isAddressFormValid(): boolean {
    const address = this.orderForm().address;
    return !!(address.streetAddress && address.city && address.postalCode && address.country);
  }

  isCheckoutFormValid(): boolean {
    return this.isContactFormValid() && 
           this.isAddressFormValid() && 
           !!this.orderForm().delivery.method && 
           !!this.orderForm().payment.method;
  }

  selectDeliveryMethod(method: 'standard' | 'express', cost: number): void {
    this.updateOrderForm({
      ...this.orderForm(),
      delivery: { method, cost }
    });
  }

  selectPaymentMethod(method: string): void {
    this.updateOrderForm({
      ...this.orderForm(),
      payment: { method }
    });
  }

  getFinalTotal(): number {
    return this.cartService.summary().total + this.orderForm().delivery.cost;
  }

  getSubtotal(): number {
    return this.cartService.summary().total;
  }

  isFirstTimeBuyer(): boolean {
    return this.cartService['firstTimeBuyerDiscount']();
  }

  goToSignup(): void {
    this.router.navigate(['/signup'], { queryParams: { returnUrl: '/cart', step: '2' } });
  }

  goToSignin(): void {
    this.router.navigate(['/signin'], { queryParams: { returnUrl: '/cart', step: '2' } });
  }

  onGoBack(): void {
    this.goBack.emit();
  }

  onCompleteOrder(): void {
    if (this.isCheckoutFormValid()) {
      this.completeOrder.emit();
    }
  }

  private updateOrderForm(form: OrderForm): void {
    this.orderFormChange.emit(form);
  }

  updateContactField(field: string, value: string): void {
    this.updateOrderForm({
      ...this.orderForm(),
      contact: {
        ...this.orderForm().contact,
        [field]: value
      }
    });
  }

  updateAddressField(field: string, value: string): void {
    this.updateOrderForm({
      ...this.orderForm(),
      address: {
        ...this.orderForm().address,
        [field]: value
      }
    });
  }

  onCountryChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.updateAddressField('country', target.value);
    }
  }

  onInputChange(event: Event, section: 'contact' | 'address', field: string): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      if (section === 'contact') {
        this.updateContactField(field, target.value);
      } else if (section === 'address') {
        this.updateAddressField(field, target.value);
      }
    }
  }
}