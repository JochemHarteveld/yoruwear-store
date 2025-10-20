import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
    method: string;
    cost: number;
  };
  payment: {
    method: string;
  };
}

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.css'
})
export class OrderSummaryComponent {
  @Input() orderForm!: OrderForm;
  @Input() finalTotal: number = 0;
  @Input() subtotal: number = 0;
  @Input() isFirstTimeBuyer: boolean = false;
  @Input() isFormValid: boolean = false;
  @Input() isProcessing: boolean = false;
  
  @Output() goBack = new EventEmitter<void>();
  @Output() completeOrder = new EventEmitter<void>();

  onGoBack(): void {
    this.goBack.emit();
  }

  onCompleteOrder(): void {
    if (this.isFormValid && !this.isProcessing) {
      this.completeOrder.emit();
    }
  }

  getDeliveryMethodName(): string {
    switch (this.orderForm.delivery.method) {
      case 'standard': return 'Standard Delivery';
      case 'express': return 'Express Delivery';
      default: return '';
    }
  }

  getDeliveryTime(): string {
    switch (this.orderForm.delivery.method) {
      case 'standard': return '3-5 business days';
      case 'express': return '1-2 business days';
      default: return '';
    }
  }

  getPaymentMethodName(): string {
    switch (this.orderForm.payment.method) {
      case 'ideal': return 'iDEAL';
      case 'applepay': return 'Apple Pay';
      case 'googlepay': return 'Google Pay';
      default: return '';
    }
  }

  getDiscountAmount(): number {
    if (!this.isFirstTimeBuyer) return 0;
    const subtotal = this.finalTotal - (this.orderForm.delivery.cost || 0);
    return subtotal * 0.1;
  }
}