import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AsyncPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [AsyncPipe, DatePipe],
  template: `
    <div class="profile-container">
      <div class="profile-card">
        <h1>My Profile</h1>
        
        @if (authService.currentUser$ | async; as user) {
          <div class="user-info">
            <div class="info-item">
              <label>Name:</label>
              <span>{{ user.name }}</span>
            </div>
            <div class="info-item">
              <label>Email:</label>
              <span>{{ user.email }}</span>
            </div>
            @if (user.createdAt) {
              <div class="info-item">
                <label>Member since:</label>
                <span>{{ user.createdAt | date:'longDate' }}</span>
              </div>
            }
          </div>
        } @else {
          <div class="loading">Loading profile...</div>
        }
        
        <div class="actions">
          <button class="btn secondary" (click)="goBack()">
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      min-height: 100vh;
      padding: 2rem;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding-top: 4rem;
    }

    .profile-card {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 2rem;
      width: 100%;
      max-width: 500px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    h1 {
      color: var(--text-primary, #ffffff);
      margin: 0 0 2rem 0;
      font-size: 1.75rem;
      font-weight: 700;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .info-item label {
      color: var(--text-muted, #94a3b8);
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-item span {
      color: var(--text-primary, #ffffff);
      font-size: 1.1rem;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .loading {
      text-align: center;
      padding: 2rem;
      color: var(--text-muted, #94a3b8);
      font-style: italic;
    }

    .actions {
      display: flex;
      justify-content: center;
      margin-top: 2rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 10px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
      font-size: 0.875rem;
    }

    .btn.secondary {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
      color: var(--text-primary, #ffffff);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .btn.secondary:hover {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    }

    @media (max-width: 640px) {
      .profile-container {
        padding: 1rem;
        padding-top: 2rem;
      }

      .profile-card {
        padding: 1.5rem;
      }

      h1 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  public authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    // Ensure user data is loaded
    this.authService.getCurrentUser().subscribe({
      error: (error) => {
        console.error('Failed to load profile:', error);
        // If user data can't be loaded, redirect to signin
        this.router.navigate(['/signin']);
      }
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }
}