import { Component, OnInit, signal, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
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
  template: `
    <div class="admin-orders-container">
      <div class="admin-header">
        <h1>
          <span class="material-icons">receipt_long</span>
          Order Management
        </h1>
        <p class="subtitle">View and manage all customer orders</p>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading orders...</p>
        </div>
      } @else if (error()) {
        <div class="error-state">
          <div class="error-icon material-icons">error</div>
          <h2>Error Loading Orders</h2>
          <p>{{ error() }}</p>
          <button class="btn secondary" (click)="loadOrders()">Retry</button>
        </div>
      } @else {
        <div class="orders-stats">
          <div class="stat-card">
            <div class="stat-value">{{ orders().length }}</div>
            <div class="stat-label">Total Orders</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ getPendingCount() }}</div>
            <div class="stat-label">Pending Orders</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">€{{ getTotalRevenue() }}</div>
            <div class="stat-label">Total Revenue</div>
          </div>
        </div>

        <div class="orders-table-container">
          <table class="orders-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (order of orders(); track order.id) {
                <tr class="order-row" [class.pending]="order.status === 'pending'">
                  <td class="order-number">{{ order.orderNumber }}</td>
                  <td class="customer-name">{{ order.userName }}</td>
                  <td class="customer-email">{{ order.contactEmail }}</td>
                  <td class="order-total">€{{ order.total }}</td>
                  <td class="order-status">
                    <span class="status-badge" [class]="order.status">
                      {{ order.status | titlecase }}
                    </span>
                  </td>
                  <td class="order-date">{{ formatDate(order.createdAt) }}</td>
                  <td class="order-actions">
                    <button class="btn-icon" (click)="toggleOrderDetails(order.id)" 
                            [title]="expandedOrders.has(order.id) ? 'Hide Details' : 'Show Details'">
                      <span class="material-icons">
                        {{ expandedOrders.has(order.id) ? 'expand_less' : 'expand_more' }}
                      </span>
                    </button>
                  </td>
                </tr>
                @if (expandedOrders.has(order.id)) {
                  <tr class="order-details">
                    <td colspan="7">
                      <div class="details-content">
                        <div class="customer-info">
                          <h4>Customer Information</h4>
                          <p><strong>Name:</strong> {{ order.contactName }}</p>
                          <p><strong>Email:</strong> {{ order.contactEmail }}</p>
                          <p><strong>Phone:</strong> {{ order.contactPhone }}</p>
                          <div class="address-info">
                            <p><strong>Delivery Address:</strong></p>
                            <p>{{ order.streetAddress }}</p>
                            <p>{{ order.postalCode }} {{ order.city }}</p>
                            <p>{{ order.country }}</p>
                          </div>
                          <p><strong>Payment Method:</strong> {{ order.paymentMethod | titlecase }}</p>
                          <p><strong>Delivery Method:</strong> {{ order.deliveryMethod | titlecase }}</p>
                        </div>
                        <div class="order-items">
                          <h4>Order Items</h4>
                          <div class="items-list">
                            @if (order.items && order.items.length > 0) {
                              @for (item of order.items; track item.id) {
                                <div class="item-row">
                                  <span class="item-name">{{ item.productName }}</span>
                                  <span class="item-quantity">Qty: {{ item.quantity }}</span>
                                  <span class="item-price">€{{ item.price }}</span>
                                </div>
                              }
                            } @else {
                              <p class="no-items">No items found for this order</p>
                            }
                          </div>
                          <div class="order-totals">
                            <p><strong>Subtotal:</strong> €{{ order.subtotal }}</p>
                            <p><strong>Delivery:</strong> €{{ order.deliveryCost }}</p>
                            <p class="total"><strong>Total:</strong> €{{ order.total }}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
          
          @if (orders().length === 0) {
            <div class="no-orders">
              <span class="material-icons">receipt</span>
              <h3>No Orders Found</h3>
              <p>No customer orders have been placed yet.</p>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-orders-container {
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

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .orders-stats {
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

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--brand-primary);
      margin-bottom: 0.5rem;
    }

    .stat-label {
      color: var(--text-secondary);
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .orders-table-container {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      overflow: hidden;
    }

    .orders-table {
      width: 100%;
      border-collapse: collapse;
    }

    .orders-table th {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-primary);
      font-weight: 600;
      padding: 1rem;
      text-align: left;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .orders-table td {
      padding: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      color: var(--text-primary);
    }

    .order-row:hover {
      background: rgba(255, 255, 255, 0.03);
    }

    .order-row.pending {
      background: rgba(255, 193, 7, 0.1);
    }

    .order-number {
      font-family: monospace;
      font-weight: 600;
      color: var(--brand-primary);
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-badge.pending {
      background: rgba(255, 193, 7, 0.2);
      color: #ffc107;
    }

    .status-badge.completed {
      background: rgba(40, 167, 69, 0.2);
      color: #28a745;
    }

    .status-badge.cancelled {
      background: rgba(220, 53, 69, 0.2);
      color: #dc3545;
    }

    .btn-icon {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      padding: 0.5rem;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-icon:hover {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-primary);
    }

    .order-details td {
      background: linear-gradient(135deg, rgba(124, 92, 255, 0.05), rgba(255, 255, 255, 0.02));
      border-bottom: 2px solid rgba(124, 92, 255, 0.2);
      padding: 0;
    }

    .details-content {
      display: grid;
      grid-template-columns: 1fr 1.5fr;
      gap: 2rem;
      padding: 2rem;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 12px;
      margin: 1rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .customer-info, .order-items {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .customer-info h4, .order-items h4 {
      color: var(--brand-primary);
      margin: 0 0 1.5rem 0;
      font-size: 1.2rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .customer-info h4::before {
      content: '👤';
      font-size: 1rem;
    }

    .order-items h4::before {
      content: '📦';
      font-size: 1rem;
    }

    .customer-info p {
      margin: 0.75rem 0;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .customer-info strong {
      color: var(--text-primary);
      min-width: 120px;
      display: inline-block;
    }

    .address-info {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 1rem;
      margin: 1rem 0;
      border-left: 3px solid var(--brand-primary);
    }

    .address-info p:first-child {
      margin-top: 0;
      font-weight: 600;
      color: var(--brand-primary);
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .item-row {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 1rem;
      align-items: center;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.2s ease;
    }

    .item-row:hover {
      background: rgba(255, 255, 255, 0.12);
      transform: translateY(-1px);
    }

    .item-name {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 1rem;
    }

    .item-quantity {
      color: var(--text-secondary);
      font-size: 0.9rem;
      background: rgba(255, 255, 255, 0.1);
      padding: 0.25rem 0.75rem;
      border-radius: 15px;
      font-weight: 500;
    }

    .item-price {
      font-weight: 700;
      color: var(--brand-primary);
      font-size: 1.1rem;
    }

    .no-items {
      text-align: center;
      color: var(--text-secondary);
      font-style: italic;
      padding: 2rem;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 8px;
      border: 2px dashed rgba(255, 255, 255, 0.1);
    }

    .order-totals {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 2px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.03);
      border-radius: 8px;
      padding: 1rem;
    }

    .order-totals p {
      display: flex;
      justify-content: space-between;
      margin: 0.5rem 0;
      color: var(--text-secondary);
    }

    .order-totals .total {
      font-size: 1.1rem;
      color: var(--brand-primary);
      font-weight: 700;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      padding-top: 0.5rem;
      margin-top: 0.5rem;
    }

    .no-orders {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--text-secondary);
    }

    .no-orders .material-icons {
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

    @media (max-width: 768px) {
      .admin-orders-container {
        padding: 1rem;
      }

      .orders-table-container {
        overflow-x: auto;
      }

      .details-content {
        grid-template-columns: 1fr;
        gap: 1.5rem;
        padding: 1.5rem;
        margin: 0.5rem;
      }

      .customer-info, .order-items {
        padding: 1rem;
      }

      .item-row {
        grid-template-columns: 1fr;
        gap: 0.5rem;
        text-align: center;
      }

      .item-name {
        font-size: 0.9rem;
      }

      .customer-info strong {
        min-width: auto;
        display: block;
        margin-bottom: 0.25rem;
      }

      .customer-info p {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.25rem;
      }
    }

    @media (max-width: 480px) {
      .orders-stats {
        grid-template-columns: 1fr;
      }

      .admin-header h1 {
        font-size: 2rem;
      }

      .details-content {
        padding: 1rem;
      }
    }
  `]
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