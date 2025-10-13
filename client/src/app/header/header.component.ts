import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="nav">
      <div class="brand">YoruWear</div>
      <nav class="nav-links">
        <a routerLink="/">Home</a>
        <a routerLink="/products">Products</a>
        <a routerLink="/about">About</a>
        <a routerLink="/contact">Contact</a>
      </nav>
      <div class="cart" aria-label="Shopping cart">
        <button class="cart-btn">
          <span class="icon">🧺</span>
          <span class="count">{{ cartCount }}</span>
        </button>
      </div>
    </header>
  `,
  styles: [
    `
      /* Load Montserrat for brand (fallbacks included) */
      @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&display=swap');

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
      .cart {
        display: flex;
        align-items: center;
      }
      .cart-btn {
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.06);
        padding: 0.45rem 0.6rem;
        border-radius: 10px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        box-shadow: 0 6px 18px rgba(2, 6, 23, 0.6);
        font-weight: 700;
        backdrop-filter: blur(4px);
      }
      .cart .icon {
        font-size: 1.05rem;
        line-height: 1;
      }
      .count {
        display: inline-grid;
        place-items: center;
        min-width: 1.55rem;
        height: 1.55rem;
        padding: 0 0.35rem;
        background: var(--danger);
        color: white;
        border-radius: 999px;
        font-size: 0.78rem;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.5);
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
      }
    `,
  ],
})
export class HeaderComponent {
  cartCount = 0;
}
