import { orders, orderItems } from '../../db/schema.js';

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

export interface CreateOrderRequest {
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
  }>;
}