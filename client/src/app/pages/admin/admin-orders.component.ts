import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order.service';

interface AdminOrder {
  id: number;
  orderNumber: string;
  userEmail: string;
  userName: string;
  total: string;
  status: string;
  contactEmail: string;
  contactPhone: string;
  deliveryAddress: string;
  createdAt: string;
  items: Array<{
    id: number;
    productName: string;
    quantity: number;
    price: string;
  }>;
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
                          <p><strong>Name:</strong> {{ order.userName }}</p>
                          <p><strong>Email:</strong> {{ order.contactEmail }}</p>
                          <p><strong>Phone:</strong> {{ order.contactPhone }}</p>
                          <p><strong>Address:</strong> {{ order.deliveryAddress }}</p>
                        </div>
                        <div class="order-items">
                          <h4>Order Items</h4>
                          <div class="items-list">
                            @for (item of order.items; track item.id) {
                              <div class="item-row">
                                <span class="item-name">{{ item.productName }}</span>
                                <span class="item-quantity">Qty: {{ item.quantity }}</span>
                                <span class="item-price">€{{ item.price }}</span>
                              </div>
                            }
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
      background: rgba(255, 255, 255, 0.02);
      border-bottom: 2px solid rgba(255, 255, 255, 0.1);
    }

    .details-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      padding: 1rem;
    }

    .customer-info h4, .order-items h4 {
      color: var(--brand-primary);
      margin: 0 0 1rem 0;
      font-size: 1.1rem;
    }

    .customer-info p {
      margin: 0.5rem 0;
      color: var(--text-secondary);
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .item-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
    }

    .item-name {
      flex: 1;
      font-weight: 500;
    }

    .item-quantity {
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    .item-price {
      font-weight: 600;
      color: var(--brand-primary);
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
        gap: 1rem;
      }
    }
  `]
})
export class AdminOrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private router = inject(Router);

  orders = signal<AdminOrder[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  expandedOrders = new Set<number>();

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading.set(true);
    this.error.set(null);
    
    // TODO: Replace with actual admin orders service call
    // For now, we'll use placeholder data
    setTimeout(() => {
      this.orders.set([]);
      this.loading.set(false);
    }, 1000);
  }

  toggleOrderDetails(orderId: number) {
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