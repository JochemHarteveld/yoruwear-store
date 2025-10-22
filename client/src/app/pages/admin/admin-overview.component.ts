import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="admin-overview">
      <div class="overview-header">
        <h1>
          <span class="material-icons">dashboard</span>
          Admin Dashboard
        </h1>
        <p class="subtitle">Welcome to the YoruWear administration panel</p>
      </div>

      <div class="quick-actions">
        <div class="action-card">
          <div class="card-icon">
            <span class="material-icons">receipt_long</span>
          </div>
          <div class="card-content">
            <h3>Manage Orders</h3>
            <p>View and manage all customer orders</p>
            <a routerLink="/admin/orders" class="action-btn">View Orders</a>
          </div>
        </div>

        <div class="action-card">
          <div class="card-icon">
            <span class="material-icons">inventory_2</span>
          </div>
          <div class="card-content">
            <h3>Product Management</h3>
            <p>Monitor stock levels and sales performance</p>
            <a routerLink="/admin/products" class="action-btn">Manage Products</a>
          </div>
        </div>
      </div>

      <div class="overview-stats">
        <div class="stat-card">
          <div class="stat-icon">
            <span class="material-icons">shopping_cart</span>
          </div>
          <div class="stat-info">
            <div class="stat-value">0</div>
            <div class="stat-label">Total Orders</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <span class="material-icons">inventory</span>
          </div>
          <div class="stat-info">
            <div class="stat-value">30</div>
            <div class="stat-label">Products</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <span class="material-icons">attach_money</span>
          </div>
          <div class="stat-info">
            <div class="stat-value">€0</div>
            <div class="stat-label">Revenue</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-overview {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .overview-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .overview-header h1 {
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

    .quick-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .action-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 2rem;
      display: flex;
      gap: 1.5rem;
      transition: all 0.3s ease;
    }

    .action-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      border-color: var(--brand-primary);
    }

    .card-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      background: var(--brand-gradient);
      border-radius: 12px;
      flex-shrink: 0;
    }

    .card-icon .material-icons {
      font-size: 2rem;
      color: white;
    }

    .card-content {
      flex: 1;
    }

    .card-content h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 0.5rem 0;
    }

    .card-content p {
      color: var(--text-secondary);
      margin: 0 0 1.5rem 0;
      line-height: 1.5;
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      padding: 0.75rem 1.5rem;
      background: var(--brand-gradient);
      color: white;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(124, 92, 255, 0.3);
    }

    .overview-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 50px;
      height: 50px;
      background: rgba(124, 92, 255, 0.2);
      border-radius: 10px;
    }

    .stat-icon .material-icons {
      font-size: 1.5rem;
      color: var(--brand-primary);
    }

    .stat-value {
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1;
    }

    .stat-label {
      color: var(--text-secondary);
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    @media (max-width: 768px) {
      .admin-overview {
        padding: 1rem;
      }

      .quick-actions {
        grid-template-columns: 1fr;
      }

      .action-card {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class AdminOverviewComponent {}