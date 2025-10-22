import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminService, AdminDashboardStats } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { filter, take } from 'rxjs';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [RouterLink, CommonModule],
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
            <p></p>
            <div class="stat-value">{{ stats?.totalOrders || 0 }}</div>
            <div class="stat-label">Total Orders</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <span class="material-icons">inventory</span>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats?.totalProducts || 0 }}</div>
            <div class="stat-label">Products</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <span class="material-icons">attach_money</span>
          </div>
          <div class="stat-info">
            <div class="stat-value">€{{ stats?.totalRevenue || 0 }}</div>
            <div class="stat-label">Revenue</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <span class="material-icons">people</span>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats?.totalUsers || 0 }}</div>
            <div class="stat-label">Users</div>
          </div>
        </div>
      </div>

      <div class="loading-error" *ngIf="loading">
        <span class="material-icons">refresh</span>
        Loading dashboard data...
      </div>

      <div class="loading-error error" *ngIf="error">
        <span class="material-icons">error</span>
        Failed to load dashboard data: {{ error }}
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

    .loading-error {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 2rem;
      color: var(--text-secondary);
      font-size: 1.1rem;
    }

    .loading-error.error {
      color: #ff6b6b;
    }

    .loading-error .material-icons {
      font-size: 1.5rem;
    }
  `]
})
export class AdminOverviewComponent implements OnInit {
  stats: AdminDashboardStats | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('AdminOverviewComponent: ngOnInit called');
    
    // Wait for user authentication to be established before loading data
    this.authService.currentUser$.pipe(
      filter(user => user !== null), // Wait until we have a user (not null)
      take(1) // Only take the first emission after the filter
    ).subscribe(user => {
      console.log('AdminOverviewComponent: User authenticated:', user);
      if (user?.isAdmin) {
        console.log('AdminOverviewComponent: User is admin, loading dashboard stats');
        this.loadDashboardStats();
      } else {
        console.error('AdminOverviewComponent: User is not admin');
        this.error = 'Access denied: Admin privileges required';
      }
    });
  }

  private loadDashboardStats() {
    console.log('AdminOverviewComponent: Loading dashboard stats...');
    this.loading = true;
    this.error = null;
    console.log('AdminOverviewComponent: Loading set to true');

    this.adminService.getDashboardStats().subscribe({
      next: (response) => {
        console.log('AdminOverviewComponent: Received response:', JSON.stringify(response, null, 2));
        console.log('AdminOverviewComponent: Response type:', typeof response);
        console.log('AdminOverviewComponent: Response success property:', response?.success);
        console.log('AdminOverviewComponent: Response statistics:', response?.statistics);
        
        if (response && response.success) {
          this.stats = response.statistics;
          console.log('AdminOverviewComponent: Stats updated to:', this.stats);
          // Explicitly trigger change detection
          this.cdr.detectChanges();
        } else {
          this.error = 'Failed to load dashboard statistics';
          console.error('AdminOverviewComponent: API returned success=false or invalid response');
        }
        this.loading = false;
        console.log('AdminOverviewComponent: Loading set to false');
        // Trigger change detection again after loading is set to false
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('AdminOverviewComponent: Error loading dashboard stats:', err);
        this.error = err.error?.error || 'Failed to load dashboard data';
        this.loading = false;
        console.log('AdminOverviewComponent: Loading set to false (error case)');
        // Trigger change detection for error state
        this.cdr.detectChanges();
      }
    });
  }
}