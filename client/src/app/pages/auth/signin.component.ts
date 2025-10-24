import { Component, signal, inject, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  email = signal('');
  password = signal('');
  isLoading = signal(false);
  errorMessage = signal('');
  returnUrl = signal('');

  ngOnInit() {
    // Get return URL from query parameters
    this.route.queryParams.subscribe(params => {
      this.returnUrl.set(params['returnUrl'] || '/');
    });
  }

  onSignIn() {
    // Validate form
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Please fill in all fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email())) {
      this.errorMessage.set('Please enter a valid email address');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    // Call authentication service
    this.authService.login({
      email: this.email(),
      password: this.password()
    }).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        console.log('Login successful:', response);
        // Navigate to return URL or home
        this.router.navigate([this.returnUrl()]);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.message || 'Login failed. Please try again.');
        console.error('Login error:', error);
      }
    });
  }

  updateEmail(event: Event) {
    const target = event.target as HTMLInputElement;
    this.email.set(target.value);
    // Clear error when user starts typing
    if (this.errorMessage()) {
      this.errorMessage.set('');
    }
  }

  updatePassword(event: Event) {
    const target = event.target as HTMLInputElement;
    this.password.set(target.value);
    // Clear error when user starts typing
    if (this.errorMessage()) {
      this.errorMessage.set('');
    }
  }

  // Development helper methods
  get isDevelopment(): boolean {
    return environment.showDevButtons;
  }

  signInAsUser() {
    if (!environment.showDevButtons) return;
    
    this.email.set('user@example.com');
    this.password.set('user123');
    this.onSignIn();
  }

  signInAsAdmin() {
    if (!environment.showDevButtons) return;
    
    this.email.set('admin@yoruwear.com');
    this.password.set('admin123');
    this.onSignIn();
  }
}