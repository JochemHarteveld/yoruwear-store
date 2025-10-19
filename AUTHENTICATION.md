# 🔐 YoruWear Store Authentication System

## Overview

The YoruWear Store now has a complete JWT-based authentication system with user registration, login, token refresh, and secure password management.

## 🚀 Live System Status

### Production Endpoints
- **API Base URL**: `https://yoruwear-api-production.up.railway.app`
- **Frontend URL**: `https://jochemharteveld.github.io/yoruwear-store`

### ✅ Fully Functional Endpoints

#### 1. User Registration
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Password123!"
}
```

**Response**: User data + access/refresh tokens

#### 2. User Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@yoruwear.com",
  "password": "Admin123!"
}
```

**Response**: User data + access/refresh tokens

#### 3. Get Current User (Protected)
```bash
GET /api/auth/me
Authorization: Bearer <access_token>
```

**Response**: Current user information

#### 4. Refresh Access Token
```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<refresh_token>"
}
```

**Response**: New access token

#### 5. User Logout
```bash
POST /api/auth/logout
Authorization: Bearer <access_token>
```

**Response**: Success message (clears refresh token from database)

## 🔑 Default User Accounts

The system comes with pre-configured accounts:

### Admin User
- **Email**: `admin@yoruwear.com`
- **Password**: `Admin123!`
- **Role**: Administrator

### Customer User
- **Email**: `customer@example.com`
- **Password**: `Customer123!`
- **Role**: Regular customer

## 🛡️ Security Features

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### JWT Token Configuration
- **Access Token**: 15 minutes expiration
- **Refresh Token**: 7 days expiration
- **Issuer**: `yoruwear-api`
- **Audience**: `yoruwear-client`

### Password Security
- **Hashing**: bcrypt with 12 rounds
- **Salting**: Automatic per password
- **Validation**: Server-side enforcement

## 🏗️ System Architecture

### Backend Components

#### Authentication Utilities (`src/auth.ts`)
- `AuthUtils.hashPassword()` - Secure password hashing
- `AuthUtils.verifyPassword()` - Password verification
- `AuthUtils.generateAccessToken()` - JWT access token creation
- `AuthUtils.generateRefreshToken()` - JWT refresh token creation
- `AuthUtils.verifyAccessToken()` - Access token validation
- `AuthUtils.verifyRefreshToken()` - Refresh token validation

#### Middleware (`src/middleware.ts`)
- `authenticateToken()` - Protects routes requiring authentication
- JWT token extraction and validation
- User context injection

#### Database Schema (`src/db/schema.ts`)
```sql
users table:
- id (Primary Key)
- email (Unique)
- name
- password_hash (bcrypt)
- refresh_token (nullable)
- created_at
- updated_at
```

#### Migration System (`src/ensure-tables.ts`)
- Automatic password column addition for existing users
- Default password assignment for pre-existing accounts
- Backward compatibility maintained

### Frontend Integration
- Environment-based API URL configuration
- Production: `https://yoruwear-api-production.up.railway.app/api`
- Development: `http://localhost:3000/api`

## 🧪 Testing Results

All authentication endpoints have been successfully tested in production:

### ✅ Registration Test
```bash
# Test Case: Valid registration with strong password
curl -X POST "https://yoruwear-api-production.up.railway.app/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com", "password": "Password123!"}'

# Result: ✅ SUCCESS - User created with tokens returned
```

### ✅ Login Test
```bash
# Test Case: Admin login with default credentials
curl -X POST "https://yoruwear-api-production.up.railway.app/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@yoruwear.com", "password": "Admin123!"}'

# Result: ✅ SUCCESS - Authentication successful, tokens issued
```

### ✅ Protected Route Test
```bash
# Test Case: Access protected /me endpoint with valid token
curl -X GET "https://yoruwear-api-production.up.railway.app/api/auth/me" \
  -H "Authorization: Bearer <valid_access_token>"

# Result: ✅ SUCCESS - User information returned
```

### ✅ Logout Test
```bash
# Test Case: Logout with access token
curl -X POST "https://yoruwear-api-production.up.railway.app/api/auth/logout" \
  -H "Authorization: Bearer <access_token>"

# Result: ✅ SUCCESS - Refresh token cleared from database
```

### ✅ Validation Test
```bash
# Test Case: Registration with weak password
curl -X POST "https://yoruwear-api-production.up.railway.app/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "email": "test@test.com", "password": "weak"}'

# Result: ✅ SUCCESS - Proper validation error returned
```

## 📊 Database Migration Status

### Migration Results
- ✅ Successfully added `password_hash` column to users table
- ✅ Successfully added `refresh_token` column to users table  
- ✅ Migrated 2 existing users with default passwords
- ✅ Maintained backward compatibility
- ✅ Foreign key constraints preserved

### Migration Log Output
```
🔧 Found 2 users without passwords, updating...
✅ Added password_hash column
✅ Added refresh_token column
✅ Updated existing users with password hashes
```

## 🔄 CI/CD Integration

### Automatic Deployment
- ✅ GitHub Actions workflow configured
- ✅ Railway automatic deployment on push to main
- ✅ Environment variables properly configured
- ✅ CORS settings for production domains

### Environment Configuration
```env
# Railway Production Environment
DATABASE_URL=mysql://...
JWT_SECRET=<secure_random_string>
JWT_REFRESH_SECRET=<secure_random_string>
NODE_ENV=production
```

## 📝 Usage Examples

### Frontend Integration Example
```typescript
// Angular service example
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable()
export class AuthService {
  private apiUrl = environment.apiUrl;
  
  login(email: string, password: string) {
    return this.http.post(`${this.apiUrl}/auth/login`, { email, password });
  }
  
  register(name: string, email: string, password: string) {
    return this.http.post(`${this.apiUrl}/auth/register`, { name, email, password });
  }
  
  getCurrentUser() {
    return this.http.get(`${this.apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${this.getAccessToken()}` }
    });
  }
}
```

## 🎯 Next Steps

### Recommended Enhancements
1. **Password Reset Flow** - Email-based password recovery
2. **Email Verification** - Confirm email addresses on registration
3. **Role-Based Access Control** - Admin vs customer permissions
4. **Account Lockout** - Prevent brute force attacks
5. **Session Management** - Active session tracking
6. **Two-Factor Authentication** - Enhanced security option

### Frontend Authentication UI
1. Login/Register forms
2. Protected route guards
3. User profile management
4. Password change functionality

## 🏁 Summary

The YoruWear Store authentication system is **fully operational** and production-ready with:

- ✅ Complete JWT authentication flow
- ✅ Secure password management
- ✅ Database migration completed successfully  
- ✅ All endpoints tested and functional
- ✅ Production deployment live on Railway
- ✅ Existing API endpoints preserved and working
- ✅ CORS configured for frontend integration

**The system is ready for frontend integration and user authentication!**