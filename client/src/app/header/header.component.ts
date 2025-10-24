import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, AsyncPipe],
  template: `
    <header class="nav">
      <div class="brand">YoruWear</div>
      <nav class="nav-links">
        <a routerLink="/">Home</a>
        <a routerLink="/products">Products</a>
        <a routerLink="/about">About</a>
      </nav>
      
      @if (authService.isAuthenticated$ | async; as isAuth) {
        @if ((authService.currentUser$ | async)?.isAdmin) {
          <div class="admin-chip">
            <a routerLink="/admin" class="admin-link">
              <span class="material-icons">admin_panel_settings</span>
              Admin Panel
            </a>
          </div>
        }
      }
      
      <div class="header-actions">
        <div class="cart" aria-label="Shopping cart">
          <a routerLink="/cart" class="cart-btn">
            <span class="material-icons">shopping_cart</span>
            <span class="cart-label">Cart</span>
            <span class="count">{{ cartService.itemCount() }}</span>
          </a>
        </div>
        
        @if (authService.isAuthenticated$ | async) {
          <!-- Authenticated User UI -->
          <div class="user-menu">
            <a routerLink="/profile" class="profile-btn">
              <span class="material-icons">person</span>
              Profile
            </a>
          </div>
        } @else {
          <!-- Guest UI -->
          <a routerLink="/signin" class="signin-btn">
            <span class="material-icons">person</span>
            Sign In
          </a>
        }
      </div>
    </header>
  `,
  styles: [
    `
      :root {
        --bg-900: #0b1220;
        --bg-800: #0f1724;
        --muted: #94a3b8;
        --accent: #7c5cff;
        --danger: #ff3860;
      }

      /* Global text font for header; app body should use Arial where applicable */
      :host {
        font-family: Arial, Helvetica, sans-serif;
        color: #e6eef8;
        display: block;
      }
      :host {
        display: block;
      }
      .nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.75rem 1.25rem;
        background: linear-gradient(180deg, var(--bg-900), rgba(11, 17, 32, 0.6));
        border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      }
      .brand {
        font-family: 'Montserrat', Arial, Helvetica, sans-serif;
        font-weight: 800;
        font-size: 1.15rem;
        letter-spacing: 0.4px;
        color: #ffffff;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.45);
      }
      .nav-links {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      .nav-links a {
        padding: 0.35rem 0.6rem;
        border-radius: 8px;
        text-decoration: none;
        color: var(--muted);
        font-weight: 600;
        transition: all 160ms cubic-bezier(0.2, 0.9, 0.2, 1);
      }
      .nav-links a:hover {
        background: rgba(124, 92, 255, 0.12);
        color: #ffffff;
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba(124, 92, 255, 0.12);
      }
      
      .admin-chip {
        display: flex;
        align-items: center;
      }
      
      .admin-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.4rem 0.8rem;
        background: linear-gradient(135deg, #ff6b6b, #ff8e53);
        color: #ffffff;
        text-decoration: none;
        border-radius: 20px;
        font-weight: 600;
        font-size: 0.85rem;
        box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
        transition: all 200ms ease;
      }
      
      .admin-link:hover {
        transform: translateY(-2px) scale(1.05);
        box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
        background: linear-gradient(135deg, #ff5252, #ff7043);
      }
      
      .admin-link .material-icons {
        font-size: 1rem;
      }
      
      .header-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      .cart {
        display: flex;
        align-items: center;
      }
      .cart-btn,
      .signin-btn {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.15);
        padding: 0.65rem 1rem;
        border-radius: 16px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.6rem;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 
                    0 2px 8px rgba(0, 0, 0, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1);
        font-weight: 600;
        backdrop-filter: blur(12px);
        text-decoration: none;
        transition: all 200ms cubic-bezier(0.2, 0.8, 0.2, 1);
        font-size: 0.875rem;
        position: relative;
        overflow: hidden;
      }
      
      .cart-btn::before,
      .signin-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        transition: left 600ms ease;
      }
      
      .cart-btn:hover::before,
      .signin-btn:hover::before {
        left: 100%;
      }
      
      .cart-btn:hover,
      .signin-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4), 
                    0 4px 12px rgba(0, 0, 0, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.25);
      }
      .signin-btn {
        background: linear-gradient(135deg, var(--accent), rgba(124, 92, 255, 0.8));
        border: 1px solid rgba(124, 92, 255, 0.4);
        box-shadow: 0 8px 32px rgba(124, 92, 255, 0.3), 
                    0 2px 8px rgba(124, 92, 255, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2);
      }
      .signin-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 40px rgba(124, 92, 255, 0.4), 
                    0 4px 12px rgba(124, 92, 255, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.25);
        border-color: rgba(124, 92, 255, 0.6);
      }
      .user-menu {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      .welcome-text {
        color: var(--muted);
        font-weight: 600;
        font-size: 0.875rem;
      }

      .profile-btn {
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.15);
        padding: 0.65rem 1rem;
        border-radius: 16px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.6rem;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 
                    0 2px 8px rgba(0, 0, 0, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1);
        font-weight: 600;
        backdrop-filter: blur(12px);
        text-decoration: none;
        transition: all 200ms cubic-bezier(0.2, 0.8, 0.2, 1);
        font-size: 0.875rem;
        position: relative;
        overflow: hidden;
      }
      .profile-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        transition: left 600ms ease;
      }
      .profile-btn:hover::before {
        left: 100%;
      }
      .profile-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 40px rgba(124, 92, 255, 0.3), 
                    0 4px 12px rgba(124, 92, 255, 0.2),
                    inset 0 1px 0 rgba(255, 255, 255, 0.15);
        background: linear-gradient(135deg, rgba(124, 92, 255, 0.15), rgba(124, 92, 255, 0.08));
        border: 1px solid rgba(124, 92, 255, 0.3);
      }
      .material-icons {
        font-size: 1.2rem;
        line-height: 1;
        vertical-align: middle;
      }
      .cart-label {
        font-size: 0.875rem;
        font-weight: 600;
        color: #fff;
      }
      
      .count {
        display: inline-grid;
        place-items: center;
        min-width: 1.4rem;
        height: 1.4rem;
        padding: 0 0.3rem;
        background: linear-gradient(135deg, var(--danger), #e73c5e);
        color: white;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 700;
        box-shadow: 0 4px 12px rgba(255, 56, 96, 0.4), 
                    0 2px 4px rgba(0, 0, 0, 0.3),
                    inset 0 1px 0 rgba(255, 255, 255, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      @media (max-width: 640px) {
        .nav {
          padding: 0.5rem 0.75rem;
        }
        .nav-links {
          display: none;
        }
        .brand {
          font-size: 1rem;
        }
        .header-actions {
          gap: 0.5rem;
        }
        .signin-btn {
          padding: 0.5rem 0.75rem;
          font-size: 0.8rem;
        }
        .profile-btn {
          padding: 0.5rem 0.75rem;
          font-size: 0.8rem;
        }
        .cart-btn {
          padding: 0.5rem 0.75rem;
        }
        .cart-label {
          display: none;
        }
      }
    `,
  ],
})
export class HeaderComponent implements OnInit {
  private router = inject(Router);
  public authService = inject(AuthService);
  public cartService = inject(CartService);

  ngOnInit() {
    // Initialize auth state when header loads
    this.authService.initializeAuth();
  }
}
