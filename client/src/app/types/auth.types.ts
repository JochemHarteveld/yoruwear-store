// Authentication types matching backend API
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  tokens: Tokens;
}

export interface ApiError {
  error: string;
  details?: string;
}

export interface UserInfoResponse {
  user: User;
}

export interface MessageResponse {
  message: string;
}

export interface RefreshTokenResponse {
  message: string;
  tokens: Tokens;
}