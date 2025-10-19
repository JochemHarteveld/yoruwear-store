import { Elysia, t } from 'elysia';

// Product validation schemas
export const ProductModel = {
  // Response schemas
  productResponse: t.Object({
    id: t.Number(),
    name: t.String(),
    description: t.String(),
    price: t.String(),
    stock: t.Number(),
    categoryId: t.Number(),
    createdAt: t.Optional(t.Any()),
    updatedAt: t.Optional(t.Any())
  }),

  productListResponse: t.Array(t.Ref('product')),

  errorResponse: t.Object({
    error: t.String(),
    details: t.Optional(t.String())
  })
};

// Model plugin with references
export const ProductModelPlugin = new Elysia({ name: 'Product.Model' })
  .model({
    'product': ProductModel.productResponse,
    'product.list': ProductModel.productListResponse,
    'product.error': ProductModel.errorResponse
  });

// Type exports for TypeScript inference
export type ProductResponse = typeof ProductModel.productResponse.static;
export type ProductListResponse = typeof ProductModel.productListResponse.static;