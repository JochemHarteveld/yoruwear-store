import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  
  firstName = signal('');
  lastName = signal('');
  fullName = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  phone = signal('');
  streetAddress = signal('');
  city = signal('');
  postalCode = signal('');
  country = signal('Netherlands');
  loading = signal(false);
  error = signal<string | null>(null);
  returnUrl = signal('');
  returnStep = signal('');

  ngOnInit() {
    // Get return URL and step from query parameters
    this.route.queryParams.subscribe(params => {
      this.returnUrl.set(params['returnUrl'] || '/');
      this.returnStep.set(params['step'] || '');
    });
  }

  onSubmit() {
    // Basic validation (alternative: use fullName OR first/last name)
    const hasName = this.fullName() || (this.firstName() && this.lastName());
    if (!hasName || !this.email() || !this.password() || !this.confirmPassword() || 
        !this.phone() || !this.streetAddress() || !this.city() || !this.postalCode() || !this.country()) {
      this.error.set('Please fill in all required fields');
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

    // Combine first and last name or use fullName directly
    const displayName = this.fullName() || `${this.firstName()} ${this.lastName()}`;

    // Call authentication service
    this.authService.register({
      name: displayName,
      email: this.email(),
      password: this.password(),
      fullName: this.fullName() || displayName,
      phone: this.phone(),
      streetAddress: this.streetAddress(),
      city: this.city(),
      postalCode: this.postalCode(),
      country: this.country()
    }).subscribe({
      next: (response) => {
        this.loading.set(false);
        console.log('Registration successful:', response);
        
        // Apply first-time buyer discount
        this.cartService.setFirstTimeBuyerDiscount(true);
        
        // Navigate to return URL or home
        const url = this.returnUrl();
        if (url === '/cart' && this.returnStep() === '2') {
          // Return to cart checkout step
          this.router.navigate([url]).then(() => {
            // Set step back to 2 after navigation
            window.setTimeout(() => {
              // This would need to be handled by the cart component
            }, 100);
          });
        } else {
          this.router.navigate([url]);
        }
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

  updateFullName(event: Event) {
    const target = event.target as HTMLInputElement;
    this.fullName.set(target.value);
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

  updatePhone(event: Event) {
    const target = event.target as HTMLInputElement;
    this.phone.set(target.value);
    this.clearErrorOnInput();
  }

  updateStreetAddress(event: Event) {
    const target = event.target as HTMLInputElement;
    this.streetAddress.set(target.value);
    this.clearErrorOnInput();
  }

  updateCity(event: Event) {
    const target = event.target as HTMLInputElement;
    this.city.set(target.value);
    this.clearErrorOnInput();
  }

  updatePostalCode(event: Event) {
    const target = event.target as HTMLInputElement;
    this.postalCode.set(target.value);
    this.clearErrorOnInput();
  }

  updateCountry(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.country.set(target.value);
    this.clearErrorOnInput();
  }

  private clearErrorOnInput() {
    if (this.error()) {
      this.error.set(null);
    }
  }
}