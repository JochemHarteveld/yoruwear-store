import { Component, signal, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  
  firstName = signal('');
  lastName = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  loading = signal(false);
  error = signal<string | null>(null);

  onSignUp() {
    // Validation
    if (!this.firstName() || !this.lastName() || !this.email() || !this.password() || !this.confirmPassword()) {
      this.error.set('Please fill in all fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email())) {
      this.error.set('Please enter a valid email address');
      return;
    }

    if (this.password() !== this.confirmPassword()) {
      this.error.set('Passwords do not match');
      return;
    }

    if (this.password().length < 8) {
      this.error.set('Password must be at least 8 characters long');
      return;
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(this.password())) {
      this.error.set('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    // Combine first and last name
    const fullName = `${this.firstName()} ${this.lastName()}`;

    // Call authentication service
    this.authService.register({
      name: fullName,
      email: this.email(),
      password: this.password()
    }).subscribe({
      next: (response) => {
        this.loading.set(false);
        console.log('Registration successful:', response);
        // Navigate to home or dashboard (user is automatically logged in)
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.loading.set(false);
        this.error.set(error.message || 'Registration failed. Please try again.');
        console.error('Registration error:', error);
      }
    });
  }

  updateFirstName(event: Event) {
    const target = event.target as HTMLInputElement;
    this.firstName.set(target.value);
    this.clearErrorOnInput();
  }

  updateLastName(event: Event) {
    const target = event.target as HTMLInputElement;
    this.lastName.set(target.value);
    this.clearErrorOnInput();
  }

  updateEmail(event: Event) {
    const target = event.target as HTMLInputElement;
    this.email.set(target.value);
    this.clearErrorOnInput();
  }

  updatePassword(event: Event) {
    const target = event.target as HTMLInputElement;
    this.password.set(target.value);
    this.clearErrorOnInput();
  }

  updateConfirmPassword(event: Event) {
    const target = event.target as HTMLInputElement;
    this.confirmPassword.set(target.value);
    this.clearErrorOnInput();
  }

  private clearErrorOnInput() {
    if (this.error()) {
      this.error.set(null);
    }
  }
}