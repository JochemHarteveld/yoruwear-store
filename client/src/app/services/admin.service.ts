import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface AdminDashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  userName: string;
  total: string;
  status: string;
  createdAt: string;
}

export interface TopProduct {
  productId: string;
  productName: string;
  totalSold: number;
}

export interface AdminDashboardResponse {
  success: boolean;
  statistics: AdminDashboardStats;
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    console.log('AdminService: Getting auth headers, token exists:', !!token);
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getDashboardStats(): Observable<AdminDashboardResponse> {
    console.log('AdminService: Making API call to', `${this.apiUrl}/admin/dashboard`);
    console.log('AdminService: Token exists:', !!this.authService.getAccessToken());
    
    // Let the auth interceptor handle the Authorization header
    return this.http.get<AdminDashboardResponse>(
      `${this.apiUrl}/admin/dashboard`
    ).pipe(
      tap(response => {
        console.log('AdminService: Raw HTTP response:', response);
        console.log('AdminService: Response type:', typeof response);
      }),
      catchError(error => {
        console.error('AdminService: HTTP error:', error);
        throw error;
      })
    );
  }

  getAllOrders(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/orders`);
  }

  getAllProducts(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/products`);
  }
}