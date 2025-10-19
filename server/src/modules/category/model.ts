import { Elysia, t } from 'elysia';

// Category validation schemas
export const CategoryModel = {
  // Response schemas
  categoryResponse: t.Object({
    id: t.Number(),
    name: t.String(),
    description: t.String(),
    createdAt: t.Optional(t.Any()),
    updatedAt: t.Optional(t.Any())
  }),

  categoryListResponse: t.Array(t.Ref('category')),

  errorResponse: t.Object({
    error: t.String(),
    details: t.Optional(t.String())
  })
};

// Model plugin with references
export const CategoryModelPlugin = new Elysia({ name: 'Category.Model' })
  .model({
    'category': CategoryModel.categoryResponse,
    'category.list': CategoryModel.categoryListResponse,
    'category.error': CategoryModel.errorResponse
  });

// Type exports for TypeScript inference
export type CategoryResponse = typeof CategoryModel.categoryResponse.static;
export type CategoryListResponse = typeof CategoryModel.categoryListResponse.static;