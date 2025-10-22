import { Elysia, t } from 'elysia';

// Auth validation schemas
export const AuthModel = {
  // Request body schemas
  registerBody: t.Object({
    name: t.String({ minLength: 1, maxLength: 100 }),
    email: t.String({ format: 'email', maxLength: 255 }),
    password: t.String({ 
      minLength: 8,
      maxLength: 128,
      description: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }),
    fullName: t.Optional(t.String({ maxLength: 200 })),
    phone: t.Optional(t.String({ maxLength: 20 })),
    streetAddress: t.Optional(t.String({ maxLength: 255 })),
    city: t.Optional(t.String({ maxLength: 100 })),
    postalCode: t.Optional(t.String({ maxLength: 20 })),
    country: t.Optional(t.String({ maxLength: 100 }))
  }),

  loginBody: t.Object({
    email: t.String({ format: 'email' }),
    password: t.String({ minLength: 1 })
  }),

  refreshBody: t.Object({
    refreshToken: t.String({ minLength: 1 })
  }),

  // Response schemas
  userResponse: t.Object({
    id: t.Number(),
    email: t.String(),
    name: t.String(),
    fullName: t.Optional(t.String()),
    phone: t.Optional(t.String()),
    streetAddress: t.Optional(t.String()),
    city: t.Optional(t.String()),
    postalCode: t.Optional(t.String()),
    country: t.Optional(t.String()),
    isFirstPurchase: t.Optional(t.Boolean()),
    isAdmin: t.Optional(t.Boolean()),
    createdAt: t.Optional(t.String()),
    updatedAt: t.Optional(t.String())
  }),

  tokensResponse: t.Object({
    accessToken: t.String(),
    refreshToken: t.String()
  }),

  authSuccessResponse: t.Object({
    message: t.String(),
    user: t.Ref('user'),
    tokens: t.Ref('tokens')
  }),

  messageResponse: t.Object({
    message: t.String()
  }),

  // Error responses
  errorResponse: t.Object({
    error: t.String(),
    details: t.Optional(t.String())
  }),

  validationErrorResponse: t.Object({
    error: t.String()
  })
};

// Model plugin with references
export const AuthModelPlugin = new Elysia({ name: 'Auth.Model' })
  .model({
    'auth.register': AuthModel.registerBody,
    'auth.login': AuthModel.loginBody,
    'auth.refresh': AuthModel.refreshBody,
    'user': AuthModel.userResponse,
    'tokens': AuthModel.tokensResponse,
    'auth.success': AuthModel.authSuccessResponse,
    'auth.message': AuthModel.messageResponse,
    'auth.error': AuthModel.errorResponse,
    'auth.validation': AuthModel.validationErrorResponse
  });

// Type exports for TypeScript inference
export type RegisterBody = typeof AuthModel.registerBody.static;
export type LoginBody = typeof AuthModel.loginBody.static;
export type RefreshBody = typeof AuthModel.refreshBody.static;
export type UserResponse = typeof AuthModel.userResponse.static;
export type TokensResponse = typeof AuthModel.tokensResponse.static;
export type AuthSuccessResponse = typeof AuthModel.authSuccessResponse.static;