import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OrderService, OrderResponse } from '../../services/order.service';

interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
}

interface Address {
  id: number;
  fullName: string;
  streetAddress: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private orderService = inject(OrderService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // State signals
  activeTab = signal<'personal' | 'address' | 'orders'>('personal');
  user = signal<User | null>(null);
  addresses = signal<Address[]>([]);
  orders = signal<OrderResponse[]>([]);
  loadingOrders = signal(false);

  // Edit mode signals
  editingPersonal = signal(false);
  showAddressForm = signal(false);
  editingAddressId = signal<number | null>(null);

  // Forms
  personalForm: FormGroup;
  addressForm: FormGroup;

  constructor() {
    this.personalForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['']
    });

    this.addressForm = this.fb.group({
      fullName: ['', [Validators.required]],
      streetAddress: ['', [Validators.required]],
      city: ['', [Validators.required]],
      postalCode: ['', [Validators.required]],
      country: ['', [Validators.required]],
      phone: [''],
      isDefault: [false]
    });
  }

  ngOnInit() {
    this.loadUserData();
    this.loadAddresses();
  }

  private loadUserData() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        // Map the user data to our interface
        const mappedUser: User = {
          id: user.id,
          email: user.email,
          fullName: user.fullName || user.name || '',
          phone: user.phone
          // dateOfBirth and gender are not in the backend User type yet
        };
        this.user.set(mappedUser);

        // Pre-fill personal form
        this.personalForm.patchValue({
          fullName: mappedUser.fullName,
          email: mappedUser.email,
          phone: mappedUser.phone || ''
        });
      }
    });
  }

  private loadAddresses() {
    this.authService.currentUser$.subscribe(user => {
      if (user && user.streetAddress && user.city && user.postalCode && user.country) {
        const userAddress: Address = {
          id: 1,
          fullName: user.fullName || user.name || '',
          streetAddress: user.streetAddress,
          city: user.city,
          postalCode: user.postalCode,
          country: user.country,
          phone: user.phone,
          isDefault: true
        };
        this.addresses.set([userAddress]);
      } else {
        this.addresses.set([]);
      }
    });
  }



  private loadOrders() {
    const user = this.user();
    if (!user) return;

    this.loadingOrders.set(true);
    
    this.orderService.getUserOrders(user.id).subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loadingOrders.set(false);
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.orders.set([]);
        this.loadingOrders.set(false);
      }
    });
  }

  setActiveTab(tab: 'personal' | 'address' | 'orders'): void {
    this.activeTab.set(tab);
    
    // Load orders when orders tab is selected
    if (tab === 'orders' && this.orders().length === 0) {
      this.loadOrders();
    }
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Even if logout fails on server, redirect to home
        this.router.navigate(['/']);
      }
    });
  }

  // Personal info methods
  startEditingPersonal(): void {
    this.editingPersonal.set(true);
  }

  cancelEditingPersonal(): void {
    this.editingPersonal.set(false);
    // Reset form to original values
    const user = this.user();
    if (user) {
      this.personalForm.patchValue({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || ''
      });
    }
  }

  savePersonalInfo(): void {
    if (this.personalForm.valid) {
      const formValue = this.personalForm.value;
      // TODO: Save to API
      console.log('Saving personal info:', formValue);
      
      // Update local user data
      const currentUser = this.user();
      if (currentUser) {
        this.user.set({
          ...currentUser,
          ...formValue
        });
      }
      
      this.editingPersonal.set(false);
    }
  }

  // Address methods
  addNewAddress(): void {
    this.editingAddressId.set(null);
    this.addressForm.reset();
    this.showAddressForm.set(true);
  }

  editAddress(address: Address): void {
    this.editingAddressId.set(address.id);
    this.addressForm.patchValue({
      fullName: address.fullName,
      streetAddress: address.streetAddress,
      city: address.city,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone || '',
      isDefault: address.isDefault
    });
    this.showAddressForm.set(true);
  }

  cancelAddressForm(): void {
    this.showAddressForm.set(false);
    this.editingAddressId.set(null);
    this.addressForm.reset();
  }

  saveAddress(): void {
    if (this.addressForm.valid) {
      const formValue = this.addressForm.value;
      const editingId = this.editingAddressId();
      
      if (editingId) {
        // Update existing address
        const addresses = this.addresses().map(addr => 
          addr.id === editingId ? { ...addr, ...formValue } : addr
        );
        this.addresses.set(addresses);
      } else {
        // Add new address
        const newAddress: Address = {
          id: Date.now(),
          ...formValue
        };
        this.addresses.set([...this.addresses(), newAddress]);
      }
      
      this.cancelAddressForm();
    }
  }

  setDefaultAddress(addressId: number): void {
    const addresses = this.addresses().map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    }));
    this.addresses.set(addresses);
  }

  deleteAddress(addressId: number): void {
    if (confirm('Are you sure you want to delete this address?')) {
      const addresses = this.addresses().filter(addr => addr.id !== addressId);
      this.addresses.set(addresses);
    }
  }

  // Order methods
  viewOrderDetails(order: OrderResponse): void {
    // TODO: Navigate to order details page or show modal
    console.log('View order details:', order);
  }

  goToShop(): void {
    this.router.navigate(['/']);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }


}