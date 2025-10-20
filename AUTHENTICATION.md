# Authentication Integration# 🔐 YoruWear Store Authentication System



The authentication system has been successfully connected to the backend API. Here's what's been implemented:## Overview



## FeaturesThe YoruWear Store now has a complete JWT-based authentication system with user registration, login, token refresh, and secure password management.



### 🔐 Authentication Service## 🚀 Live System Status

- **Registration**: Create new user accounts with email validation and password strength requirements

- **Login**: Authenticate with email and password ### Production Endpoints

- **Logout**: Clear user session and tokens- **API Base URL**: `https://yoruwear-api-production.up.railway.app`

- **Token Management**: Automatic token refresh and storage- **Frontend URL**: `https://jochemharteveld.github.io/yoruwear-store`

- **Profile Management**: View and manage user profile information

### ✅ Fully Functional Endpoints

### 🛡️ Route Protection

- **Auth Guard**: Protects routes that require authentication#### 1. User Registration

- **Guest Guard**: Redirects authenticated users away from login/register pages```bash

- **Auto-redirect**: Automatic navigation based on authentication statePOST /api/auth/register

Content-Type: application/json

### 🎨 UI Integration

- **Dynamic Header**: Shows different UI based on authentication state{

- **User Menu**: Profile access and logout functionality  "name": "Test User",

- **Error Handling**: User-friendly error messages and validation  "email": "test@example.com",

- **Loading States**: Visual feedback during authentication operations  "password": "Password123!"

}

## API Endpoints Used```



- `POST /api/auth/register` - User registration**Response**: User data + access/refresh tokens

- `POST /api/auth/login` - User login  

- `POST /api/auth/refresh` - Token refresh#### 2. User Login

- `GET /api/auth/me` - Get current user info```bash

- `POST /api/auth/logout` - User logoutPOST /api/auth/login

Content-Type: application/json

## Testing the Authentication

{

### 1. Start the Development Environment  "email": "admin@yoruwear.com",

```bash  "password": "Admin123!"

make dev-fast}

``````



### 2. Open the Application**Response**: User data + access/refresh tokens

Navigate to `http://localhost:4200`

#### 3. Get Current User (Protected)

### 3. Test Registration```bash

1. Click "Sign In" in the headerGET /api/auth/me

2. Click "Sign up now" to go to registrationAuthorization: Bearer <access_token>

3. Fill out the registration form:```

   - **First Name**: Test

   - **Last Name**: User**Response**: Current user information

   - **Email**: test@example.com

   - **Password**: TestPassword123!#### 4. Refresh Access Token

   - **Confirm Password**: TestPassword123!```bash

4. Click "Sign Up"POST /api/auth/refresh

Content-Type: application/json

### 4. Test Login

1. Go to the sign-in page{

2. Use the credentials you just created:  "refreshToken": "<refresh_token>"

   - **Email**: test@example.com}

   - **Password**: TestPassword123!```

3. Click "Sign In"

**Response**: New access token

### 5. Test Protected Routes

1. After login, click "Profile" in the header#### 5. User Logout

2. View your profile information```bash

3. Try navigating to `/profile` directly when logged outPOST /api/auth/logout

Authorization: Bearer <access_token>

### 6. Test Logout```

1. Click "Logout" in the header

2. Verify you're redirected to the home page**Response**: Success message (clears refresh token from database)

3. Try accessing `/profile` again (should redirect to sign-in)

## 🔑 Default User Accounts

## Password Requirements

The system comes with pre-configured accounts:

For security, passwords must:

- Be at least 8 characters long### Admin User

- Contain at least one uppercase letter- **Email**: `admin@yoruwear.com`

- Contain at least one lowercase letter  - **Password**: `Admin123!`

- Contain at least one number- **Role**: Administrator

- Contain at least one special character (@$!%*?&)

### Customer User

## Technical Implementation- **Email**: `customer@example.com`

- **Password**: `Customer123!`

### State Management- **Role**: Regular customer

- Uses Angular signals for reactive state management

- RxJS observables for authentication state streaming## 🛡️ Security Features

- LocalStorage for token persistence

### Password Requirements

### Error Handling- Minimum 8 characters

- HTTP interceptor for automatic token attachment- At least one uppercase letter

- Automatic token refresh on 401 errors- At least one lowercase letter

- Graceful error messages for users- At least one number

- At least one special character

### Security Features

- JWT token-based authentication### JWT Token Configuration

- Automatic token refresh- **Access Token**: 15 minutes expiration

- Route guards for access control- **Refresh Token**: 7 days expiration

- Secure token storage- **Issuer**: `yoruwear-api`

- **Audience**: `yoruwear-client`

## Files Modified/Created

### Password Security

### Services- **Hashing**: bcrypt with 12 rounds

- `src/app/services/auth.service.ts` - Main authentication service- **Salting**: Automatic per password

- `src/app/types/auth.types.ts` - TypeScript interfaces- **Validation**: Server-side enforcement



### Components## 🏗️ System Architecture

- `src/app/pages/auth/signin.component.ts` - Sign-in form

- `src/app/pages/auth/signup.component.ts` - Registration form### Backend Components

- `src/app/pages/profile/profile.component.ts` - User profile page

- `src/app/header/header.component.ts` - Updated with auth UI#### Authentication Utilities (`src/auth.ts`)

- `AuthUtils.hashPassword()` - Secure password hashing

### Guards & Interceptors- `AuthUtils.verifyPassword()` - Password verification

- `src/app/guards/auth.guard.ts` - Route protection- `AuthUtils.generateAccessToken()` - JWT access token creation

- `src/app/interceptors/auth.interceptor.ts` - HTTP request interceptor- `AuthUtils.generateRefreshToken()` - JWT refresh token creation

- `AuthUtils.verifyAccessToken()` - Access token validation

### Configuration- `AuthUtils.verifyRefreshToken()` - Refresh token validation

- `src/app/app.config.ts` - Added interceptor configuration

- `src/app/app.routes.ts` - Added protected routes#### Middleware (`src/middleware.ts`)

- `authenticateToken()` - Protects routes requiring authentication

## Notes- JWT token extraction and validation

- User context injection

- The authentication state persists across browser refreshes

- Tokens are automatically refreshed when they expire#### Database Schema (`src/db/schema.ts`)

- All API requests to protected endpoints include authentication headers```sql

- The UI dynamically updates based on authentication stateusers table:
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