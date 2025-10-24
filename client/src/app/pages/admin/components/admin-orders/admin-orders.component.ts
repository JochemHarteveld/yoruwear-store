import { Component, OnInit, signal, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../../../services/admin.service';
import { AuthService } from '../../../../services/auth.service';
import { filter, take } from 'rxjs';

interface AdminOrder {
  id: string;
  orderNumber: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  total: string;
  subtotal: string;
  deliveryCost: string;
  status: string;
  contactEmail: string;
  contactPhone: string;
  contactName: string;
  streetAddress: string;
  city: string;
  postalCode: string;
  country: string;
  paymentMethod: string;
  deliveryMethod: string;
  createdAt: string;
  updatedAt: string;
  items: AdminOrderItem[];
}

interface AdminOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: string;
}

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.css'
})
export class AdminOrdersComponent implements OnInit {
  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  orders = signal<AdminOrder[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  expandedOrders = new Set<string>();

  ngOnInit() {
    // Wait for user authentication before loading orders
    this.authService.currentUser$.pipe(
      filter(user => user !== null),
      take(1)
    ).subscribe(user => {
      if (user?.isAdmin) {
        this.loadOrders();
      } else {
        this.error.set('Access denied: Admin privileges required');
        this.loading.set(false);
      }
    });
  }

  loadOrders() {
    this.loading.set(true);
    this.error.set(null);
    
    this.adminService.getAllOrders().subscribe({
      next: (response) => {
        console.log('AdminOrdersComponent: Received orders response:', response);
        if (response.success && response.data) {
          this.orders.set(response.data);
          console.log('AdminOrdersComponent: Loaded orders:', response.data.length);
        } else {
          this.error.set('Failed to load orders');
        }
        this.loading.set(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('AdminOrdersComponent: Error loading orders:', err);
        this.error.set('Failed to load orders');
        this.loading.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  toggleOrderDetails(orderId: string) {
    if (this.expandedOrders.has(orderId)) {
      this.expandedOrders.delete(orderId);
    } else {
      this.expandedOrders.add(orderId);
    }
  }

  getPendingCount(): number {
    return this.orders().filter(order => order.status === 'pending').length;
  }

  getTotalRevenue(): string {
    const total = this.orders().reduce((sum, order) => {
      return sum + parseFloat(order.total);
    }, 0);
    return total.toFixed(2);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}