import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AsyncPipe, DatePipe, CommonModule, JsonPipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { User } from '../../types/auth.types';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [AsyncPipe, DatePipe, FormsModule, CommonModule, JsonPipe],
  template: `
    <div class="profile-container">
      <div class="profile-wrapper">
        <!-- Profile Header -->
        <div class="profile-header">
          <h1>My Profile</h1>
          @if (authService.currentUser$ | async; as user) {
            <div class="user-welcome">
              <div class="avatar">
                <span class="material-icons">person</span>
              </div>
              <div class="user-details">
                <h2>{{ user.name }}</h2>
                <p>{{ user.email }}</p>
                @if (user.createdAt) {
                  <span class="member-since">Member since {{ user.createdAt | date:'longDate' }}</span>
                }
              </div>
            </div>
          }
        </div>

        <!-- Profile Navigation -->
        <div class="profile-nav">
          <button 
            class="nav-item" 
            [class.active]="activeTab() === 'personal'"
            (click)="setActiveTab('personal')">
            <span class="material-icons">person</span>
            Personal Info
          </button>
          <button 
            class="nav-item" 
            [class.active]="activeTab() === 'address'"
            (click)="setActiveTab('address')">
            <span class="material-icons">home</span>
            Delivery Address
          </button>
          <button 
            class="nav-item" 
            [class.active]="activeTab() === 'orders'"
            (click)="setActiveTab('orders')">
            <span class="material-icons">receipt_long</span>
            Order History
          </button>
        </div>

        <!-- Profile Content -->
        <div class="profile-content">
          @if (authService.currentUser$ | async; as user) {
            
            <!-- Personal Information Tab -->
            @if (activeTab() === 'personal') {
              <div class="tab-content">
                <div class="section-header">
                  <h3>Personal Information</h3>
                  <span class="section-description">Manage your account details</span>
                </div>
                
                <div class="info-grid">
                  <div class="info-card">
                    <label>Display Name</label>
                    <div class="info-value">{{ user.name }}</div>
                  </div>
                  <div class="info-card">
                    <label>Email Address</label>
                    <div class="info-value">{{ user.email }}</div>
                  </div>
                  @if (user.fullName) {
                    <div class="info-card">
                      <label>Full Name</label>
                      <div class="info-value">{{ user.fullName }}</div>
                    </div>
                  }
                  @if (user.phone) {
                    <div class="info-card">
                      <label>Phone Number</label>
                      <div class="info-value">{{ user.phone }}</div>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Delivery Address Tab -->
            @if (activeTab() === 'address') {
              <div class="tab-content">
                <div class="section-header">
                  <h3>Delivery Address</h3>
                  <span class="section-description">Manage your shipping information</span>
                  <button class="btn primary-outline" (click)="toggleEditAddress()">
                    @if (editingAddress()) {
                      <span class="material-icons">close</span>
                      Cancel
                    } @else {
                      <span class="material-icons">edit</span>
                      Edit Address
                    }
                  </button>
                </div>

                @if (!editingAddress()) {
                  <!-- Display Mode -->
                  @if (hasCompleteAddress(user)) {
                    <div class="address-display">
                      <div class="address-card">
                        <div class="address-header">
                          <span class="material-icons">location_on</span>
                          <h4>Current Address</h4>
                        </div>
                        <div class="address-details">
                          @if (user.fullName) {
                            <div class="address-line">
                              <strong>{{ user.fullName }}</strong>
                            </div>
                          } @else if (user.name) {
                            <div class="address-line">
                              <strong>{{ user.name }}</strong>
                            </div>
                          }
                          @if (user.phone) {
                            <div class="address-line">
                              <span class="material-icons small">phone</span>
                              {{ user.phone }}
                            </div>
                          }
                          @if (user.streetAddress) {
                            <div class="address-line">
                              {{ user.streetAddress }}
                            </div>
                            <div class="address-line">
                              {{ user.city }}, {{ user.postalCode }}
                            </div>
                            <div class="address-line">
                              {{ user.country }}
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  } @else {
                    <div class="empty-state">
                      <span class="material-icons">add_location</span>
                      <h4>No delivery address set</h4>
                      <p>Add your delivery information to speed up checkout</p>
                      <button class="btn primary" (click)="toggleEditAddress()">
                        <span class="material-icons">add</span>
                        Add Address
                      </button>
                    </div>
                  }
                } @else {
                  @if (editingAddress()) {
                    <!-- Debug section - can be removed in production -->
                    <div style="background: rgba(255,255,255,0.1); padding: 1rem; margin-bottom: 1rem; border-radius: 8px; font-size: 0.8rem;">
                      <strong>Debug Info:</strong><br>
                      Form Values: {{ addressForm | json }}<br>
                      <button type="button" class="btn secondary" style="margin-top: 0.5rem;" (click)="debugFormState()">Log Form State</button>
                    </div>
                  }

                  <!-- Edit Mode -->
                  <form class="address-form" (ngSubmit)="saveAddress()">
                    <div class="form-grid">
                      <div class="form-group full-width">
                        <label for="fullName">Full Name *</label>
                        <input 
                          type="text" 
                          id="fullName"
                          name="fullName"
                          [(ngModel)]="addressForm.fullName"
                          placeholder="Enter your full name"
                          required>
                      </div>

                      <div class="form-group">
                        <label for="phone">Phone Number *</label>
                        <input 
                          type="tel" 
                          id="phone"
                          name="phone"
                          [(ngModel)]="addressForm.phone"
                          placeholder="Enter phone number"
                          required>
                      </div>

                      <div class="form-group">
                        <label for="country">Country *</label>
                        <select 
                          id="country"
                          name="country"
                          [(ngModel)]="addressForm.country"
                          required>
                          <option value="">Select country</option>
                          <option value="Netherlands">Netherlands</option>
                          <option value="Germany">Germany</option>
                          <option value="Belgium">Belgium</option>
                          <option value="France">France</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Spain">Spain</option>
                          <option value="Italy">Italy</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div class="form-group full-width">
                        <label for="streetAddress">Street Address *</label>
                        <input 
                          type="text" 
                          id="streetAddress"
                          name="streetAddress"
                          [(ngModel)]="addressForm.streetAddress"
                          placeholder="Enter street address"
                          required>
                      </div>

                      <div class="form-group">
                        <label for="city">City *</label>
                        <input 
                          type="text" 
                          id="city"
                          name="city"
                          [(ngModel)]="addressForm.city"
                          placeholder="Enter city"
                          required>
                      </div>

                      <div class="form-group">
                        <label for="postalCode">Postal Code *</label>
                        <input 
                          type="text" 
                          id="postalCode"
                          name="postalCode"
                          [(ngModel)]="addressForm.postalCode"
                          placeholder="Enter postal code"
                          required>
                      </div>
                    </div>

                    <div class="form-actions">
                      <button type="button" class="btn secondary" (click)="cancelAddressEdit()">
                        Cancel
                      </button>
                      <button type="submit" class="btn primary" [disabled]="savingAddress()">
                        @if (savingAddress()) {
                          <div class="spinner"></div>
                          Saving...
                        } @else {
                          <span class="material-icons">save</span>
                          Save Address
                        }
                      </button>
                    </div>
                  </form>
                }
              </div>
            }

            <!-- Order History Tab -->
            @if (activeTab() === 'orders') {
              <div class="tab-content">
                <div class="section-header">
                  <h3>Order History</h3>
                  <span class="section-description">View your past orders and track deliveries</span>
                </div>

                <div class="orders-section">
                  <!-- Placeholder for now - will be implemented with actual order system -->
                  <div class="empty-state">
                    <span class="material-icons">receipt_long</span>
                    <h4>No orders yet</h4>
                    <p>When you place your first order, it will appear here</p>
                    <button class="btn primary" (click)="goToShop()">
                      <span class="material-icons">shopping_bag</span>
                      Start Shopping
                    </button>
                  </div>
                </div>
              </div>
            }

          } @else {
            <div class="loading-state">
              <div class="spinner large"></div>
              <p>Loading profile...</p>
            </div>
          }
        </div>

        <!-- Profile Actions -->
        <div class="profile-actions">
          <button class="btn secondary" (click)="goBack()">
            <span class="material-icons">arrow_back</span>
            Back to Home
          </button>
          <button class="btn danger" (click)="onLogout()">
            <span class="material-icons">logout</span>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      min-height: 100vh;
      padding: 2rem;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    }

    .profile-wrapper {
      max-width: 900px;
      margin: 0 auto;
    }

    .profile-header {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    .profile-header h1 {
      color: #ffffff;
      margin: 0 0 1.5rem 0;
      font-size: 2rem;
      font-weight: 700;
      text-align: center;
    }

    .user-welcome {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }

    .avatar .material-icons {
      font-size: 2.5rem;
      color: white;
    }

    .user-details h2 {
      color: #ffffff;
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .user-details p {
      color: #94a3b8;
      margin: 0 0 0.5rem 0;
      font-size: 1rem;
    }

    .member-since {
      color: #64748b;
      font-size: 0.875rem;
    }

    .profile-nav {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 2rem;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 0.75rem;
      overflow-x: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      background: transparent;
      border: none;
      color: #94a3b8;
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.3s ease;
      white-space: nowrap;
      min-width: fit-content;
    }

    .nav-item:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.05);
    }

    .nav-item.active {
      color: #ffffff;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }

    .nav-item .material-icons {
      font-size: 1.25rem;
    }

    .profile-content {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      min-height: 400px;
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .section-header h3 {
      color: #ffffff;
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .section-description {
      color: #94a3b8;
      font-size: 0.875rem;
      margin-left: auto;
      margin-right: 1rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .info-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1.5rem;
      transition: all 0.3s ease;
    }

    .info-card:hover {
      background: rgba(255, 255, 255, 0.08);
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    }

    .info-card label {
      color: #94a3b8;
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: block;
      margin-bottom: 0.75rem;
    }

    .info-value {
      color: #ffffff;
      font-size: 1.1rem;
      font-weight: 500;
    }

    .address-display {
      margin-top: 1rem;
    }

    .address-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 2rem;
      transition: all 0.3s ease;
    }

    .address-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .address-header .material-icons {
      color: #667eea;
      font-size: 1.5rem;
    }

    .address-header h4 {
      color: #ffffff;
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .address-details {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .address-line {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: #ffffff;
      font-size: 1rem;
    }

    .address-line .material-icons.small {
      font-size: 1rem;
      color: #94a3b8;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 2rem;
      color: #94a3b8;
    }

    .empty-state .material-icons {
      font-size: 4rem;
      color: #64748b;
      margin-bottom: 1rem;
    }

    .empty-state h4 {
      color: #ffffff;
      margin: 0 0 1rem 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .empty-state p {
      margin: 0 0 2rem 0;
      font-size: 1rem;
    }

    .address-form {
      margin-top: 1rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      color: #94a3b8;
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .form-group input,
    .form-group select {
      padding: 1rem;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(255, 255, 255, 0.05);
      color: #ffffff;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
      background: rgba(255, 255, 255, 0.08);
    }

    .form-group input::placeholder {
      color: #64748b;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.875rem 1.5rem;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.875rem;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.3s ease;
      border: none;
      min-width: fit-content;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }

    .btn.primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }

    .btn.primary:hover:not(:disabled) {
      background: linear-gradient(135deg, #5a6fd8 0%, #6b4190 100%);
      transform: translateY(-2px);
      box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
    }

    .btn.primary-outline {
      background: transparent;
      color: #667eea;
      border: 2px solid #667eea;
    }

    .btn.primary-outline:hover {
      background: #667eea;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }

    .btn.secondary {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .btn.secondary:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
    }

    .btn.danger {
      background: linear-gradient(135deg, #ff3860, #e73c5e);
      color: white;
      border: 1px solid rgba(255, 56, 96, 0.3);
      box-shadow: 0 8px 20px rgba(255, 56, 96, 0.3);
    }

    .btn.danger:hover {
      background: linear-gradient(135deg, #ff1744, #d32f2f);
      transform: translateY(-2px);
      box-shadow: 0 12px 30px rgba(255, 56, 96, 0.4);
    }

    .profile-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .loading-state {
      text-align: center;
      padding: 3rem;
      color: #94a3b8;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .spinner.large {
      width: 40px;
      height: 40px;
      border-width: 3px;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    @media (max-width: 768px) {
      .profile-container {
        padding: 1rem;
      }

      .profile-header {
        padding: 1.5rem;
      }

      .user-welcome {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }

      .profile-nav {
        flex-direction: column;
        gap: 0.5rem;
      }

      .profile-content {
        padding: 1.5rem;
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .section-description {
        margin: 0;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }

      .profile-actions {
        flex-direction: column;
      }
    }

    @media (max-width: 480px) {
      .profile-header h1 {
        font-size: 1.5rem;
      }

      .user-details h2 {
        font-size: 1.25rem;
      }

      .nav-item {
        padding: 0.875rem 1.25rem;
        font-size: 0.8rem;
      }

      .section-header h3 {
        font-size: 1.25rem;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  public authService = inject(AuthService);
  private router = inject(Router);

  // Navigation state
  activeTab = signal<'personal' | 'address' | 'orders'>('address'); // Start with address tab

  // Address editing state
  editingAddress = signal(false);
  savingAddress = signal(false);
  addressForm = {
    fullName: '',
    phone: '',
    streetAddress: '',
    city: '',
    postalCode: '',
    country: 'Netherlands'
  };

  ngOnInit() {
    // Ensure user data is loaded and keep it updated
    this.authService.getCurrentUser().subscribe({
      next: (response) => {
        // User data loaded successfully
        console.log('Profile loaded:', response.user);
        console.log('Address data available:', {
          fullName: response.user.fullName,
          phone: response.user.phone,
          streetAddress: response.user.streetAddress,
          city: response.user.city,
          postalCode: response.user.postalCode,
          country: response.user.country
        });
      },
      error: (error) => {
        console.error('Failed to load profile:', error);
        // If user data can't be loaded, redirect to signin
        this.router.navigate(['/signin']);
      }
    });
  }

  setActiveTab(tab: 'personal' | 'address' | 'orders'): void {
    this.activeTab.set(tab);
  }

  goBack() {
    this.router.navigate(['/']);
  }

  goToShop() {
    this.router.navigate(['/']);
  }

  onLogout() {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logout successful');
        // Navigate to home page
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Even if there's an error, navigate to home (local state is cleared)
        this.router.navigate(['/']);
      }
    });
  }

  hasCompleteAddress(user: User): boolean {
    // Check if user has a complete delivery address
    const hasAddress = !!(
      user.streetAddress?.trim() && 
      user.city?.trim() && 
      user.postalCode?.trim() && 
      user.country?.trim()
    );
    console.log('User address check:', {
      streetAddress: user.streetAddress,
      city: user.city,
      postalCode: user.postalCode,
      country: user.country,
      hasCompleteAddress: hasAddress
    });
    return hasAddress;
  }

  toggleEditAddress(): void {
    if (!this.editingAddress()) {
      // First set editing mode
      this.editingAddress.set(true);
      
      // Then load current user data into form using the current observable value
      this.authService.currentUser$.pipe(take(1)).subscribe({
        next: (currentUser: User | null) => {
          if (currentUser) {
            // Pre-fill form with current user data
            this.addressForm = {
              fullName: currentUser.fullName || currentUser.name || '',
              phone: currentUser.phone || '',
              streetAddress: currentUser.streetAddress || '',
              city: currentUser.city || '',
              postalCode: currentUser.postalCode || '',
              country: currentUser.country || 'Netherlands'
            };
            console.log('Pre-filled address form with user data:', this.addressForm);
            console.log('Current user data:', currentUser);
          } else {
            console.log('No current user found, fetching fresh data...');
            // If no current user, fetch it fresh from the server
            this.authService.getCurrentUser().subscribe({
              next: (response) => {
                const user = response.user;
                this.addressForm = {
                  fullName: user.fullName || user.name || '',
                  phone: user.phone || '',
                  streetAddress: user.streetAddress || '',
                  city: user.city || '',
                  postalCode: user.postalCode || '',
                  country: user.country || 'Netherlands'
                };
                console.log('Fetched and pre-filled address form with user data:', this.addressForm);
                console.log('Fetched user data:', user);
              },
              error: (error) => {
                console.error('Failed to load user data for address form:', error);
                // Set editing back to false if we can't load data
                this.editingAddress.set(false);
              }
            });
          }
        }
      });
    } else {
      // If already editing, just toggle off
      this.editingAddress.set(false);
    }
  }

  cancelAddressEdit(): void {
    this.editingAddress.set(false);
    // Don't reset the form completely, just close edit mode
    // The form data will be reloaded fresh next time user clicks edit
  }

  // Debug method to check current form state
  debugFormState(): void {
    console.log('Current address form state:', this.addressForm);
    console.log('Is editing:', this.editingAddress());
  }

  saveAddress(): void {
    if (!this.validateAddressForm()) {
      console.log('Address form validation failed');
      return;
    }

    this.savingAddress.set(true);
    console.log('Saving address:', this.addressForm);

    // Call auth service to update user profile
    this.authService.updateProfile(this.addressForm).subscribe({
      next: (response) => {
        this.savingAddress.set(false);
        this.editingAddress.set(false);
        console.log('Address saved successfully:', response.user);
        
        // Show success feedback (you can add a toast notification here)
        // The user data is automatically updated in the auth service
      },
      error: (error) => {
        this.savingAddress.set(false);
        console.error('Failed to save address:', error);
        // TODO: Add proper error handling UI here
        alert('Failed to save address. Please try again.');
      }
    });
  }

  private validateAddressForm(): boolean {
    const form = this.addressForm;
    return !!(
      form.fullName?.trim() &&
      form.phone?.trim() &&
      form.streetAddress?.trim() &&
      form.city?.trim() &&
      form.postalCode?.trim() &&
      form.country?.trim()
    );
  }
}