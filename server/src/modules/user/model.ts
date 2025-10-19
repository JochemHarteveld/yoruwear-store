import { Elysia, t } from 'elysia';

// User validation schemas
export const UserModel = {
  // Response schemas
  userListResponse: t.Array(
    t.Object({
      id: t.Number(),
      email: t.String(),
      name: t.String(),
      passwordHash: t.Optional(t.String()),
      refreshToken: t.Optional(t.Nullable(t.String())),
      createdAt: t.Optional(t.Any()),
      updatedAt: t.Optional(t.Any())
    })
  ),

  errorResponse: t.Object({
    error: t.String(),
    details: t.Optional(t.String())
  })
};

// Model plugin with references
export const UserModelPlugin = new Elysia({ name: 'User.Model' })
  .model({
    'user.list': UserModel.userListResponse,
    'user.error': UserModel.errorResponse
  });

// Type exports for TypeScript inference
export type UserListResponse = typeof UserModel.userListResponse.static;