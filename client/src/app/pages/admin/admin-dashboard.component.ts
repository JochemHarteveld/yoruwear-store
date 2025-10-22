import { Component } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, RouterOutlet, RouterLinkActive],
  template: `
    <div class="admin-dashboard">
      <div class="admin-sidebar">
        <div class="sidebar-header">
          <span class="material-icons">admin_panel_settings</span>
          <h2>Admin Panel</h2>
        </div>
        
        <nav class="sidebar-nav">
          <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
            <span class="material-icons">dashboard</span>
            Dashboard
          </a>
          <a routerLink="/admin/orders" routerLinkActive="active" class="nav-item">
            <span class="material-icons">receipt_long</span>
            Orders
          </a>
          <a routerLink="/admin/products" routerLinkActive="active" class="nav-item">
            <span class="material-icons">inventory_2</span>
            Products
          </a>
        </nav>
      </div>
      
      <div class="admin-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard {
      display: flex;
      min-height: 100vh;
      background: var(--bg-primary);
    }

    .admin-sidebar {
      width: 280px;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border-right: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      flex-direction: column;
    }

    .sidebar-header {
      padding: 2rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .sidebar-header .material-icons {
      font-size: 2rem;
      color: var(--brand-primary);
    }

    .sidebar-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .sidebar-nav {
      flex: 1;
      padding: 1.5rem 0;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      color: var(--text-secondary);
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s ease;
      border-left: 3px solid transparent;
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-primary);
      border-left-color: var(--brand-primary);
    }

    .nav-item.active {
      background: rgba(124, 92, 255, 0.1);
      color: var(--brand-primary);
      border-left-color: var(--brand-primary);
    }

    .nav-item .material-icons {
      font-size: 1.25rem;
    }

    .admin-content {
      flex: 1;
      overflow-y: auto;
    }

    @media (max-width: 768px) {
      .admin-dashboard {
        flex-direction: column;
      }

      .admin-sidebar {
        width: 100%;
        height: auto;
      }

      .sidebar-nav {
        display: flex;
        overflow-x: auto;
        padding: 0;
      }

      .nav-item {
        flex-shrink: 0;
        border-left: none;
        border-bottom: 3px solid transparent;
      }

      .nav-item:hover,
      .nav-item.active {
        border-left-color: transparent;
        border-bottom-color: var(--brand-primary);
      }
    }
  `]
})
export class AdminDashboardComponent {}