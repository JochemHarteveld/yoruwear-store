import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OrderRequest {
  contact: {
    fullName: string;
    email: string;
    phone: string;
  };
  address: {
    streetAddress: string;
    city: string;
    postalCode: string;
    country: string;
  };
  delivery: {
    method: string;
    cost: number;
  };
  payment: {
    method: string;
  };
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
  }>;
  subtotal: number;
  deliveryCost: number;
  total: number;
}

export interface OrderResponse {
  id: number;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  deliveryCost: number;
  createdAt: string;
  contact: {
    fullName: string;
    email: string;
    phone: string;
  };
  address: {
    streetAddress: string;
    city: string;
    postalCode: string;
    country: string;
  };
  delivery: {
    method: string;
    cost: number;
  };
  payment: {
    method: string;
  };
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api';

  createOrder(orderData: OrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.baseUrl}/orders`, orderData);
  }

  getOrder(orderId: number): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.baseUrl}/orders/${orderId}`);
  }

  getUserOrders(userId: number): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(`${this.baseUrl}/orders/user/${userId}`);
  }
}