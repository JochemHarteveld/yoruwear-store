import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminService, AdminDashboardStats } from '../../../../services/admin.service';
import { AuthService } from '../../../../services/auth.service';
import { filter, take } from 'rxjs';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './admin-overview.component.html',
  styleUrl: './admin-overview.component.css'
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