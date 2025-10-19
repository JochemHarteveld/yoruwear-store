export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}