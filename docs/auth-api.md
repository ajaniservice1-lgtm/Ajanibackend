# Auth API Documentation

## Overview

The Auth API provides comprehensive endpoints for user authentication, registration, password management, and email verification. The API supports three user roles: `user`, `vendor`, and `admin`. All endpoints use JSON format for request and response bodies.

**Base URL:** `http://localhost:<PORT>/api/v1/auth`  
**Content-Type:** `application/json`

---

## Table of Contents

1. [Register User](#1-register-user)
2. [Verify OTP](#2-verify-otp)
3. [Resend OTP](#3-resend-otp)
4. [Login User](#4-login-user)
5. [Forgot Password](#5-forgot-password)
6. [Reset Password](#6-reset-password)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [User Model Schema](#8-user-model-schema)
9. [Error Responses](#9-error-responses)
10. [Security Features](#10-security-features)

---

## 1. Register User

Creates a new user account and sends a 6-digit OTP to the user's email for verification. The account is created but remains unverified until the OTP is confirmed.

**Endpoint:** `POST /api/v1/auth/register`

**Authentication:** Not required

### Request Body

| Field       | Type   | Required | Description                                                                           |
| ----------- | ------ | -------- | ------------------------------------------------------------------------------------- |
| `firstName` | string | Yes      | User's first name                                                                     |
| `lastName`  | string | Yes      | User's last name                                                                      |
| `email`     | string | Yes      | User's email address (must be unique and valid, automatically converted to lowercase) |
| `password`  | string | Yes      | User's password (minimum 8 characters, automatically hashed with bcrypt)              |
| `phone`     | string | No       | User's phone number (must be valid mobile phone format if provided)                   |
| `role`      | string | No       | User role: `"user"`, `"vendor"`, or `"admin"` (default: `"user"`)                     |
| `vendor`    | object | No       | Vendor information object (required if `role` is `"vendor"`)                          |

### Vendor Object (Required when `role` is `"vendor"`)

| Field             | Type   | Required | Description                                                                                       |
| ----------------- | ------ | -------- | ------------------------------------------------------------------------------------------------- |
| `category`        | string | Yes      | Vendor category: `"hotel"`, `"restaurant"`, `"shortlet"`, `"service provider"`, `"accommodation"` |
| `businessName`    | string | No       | Business name                                                                                     |
| `businessAddress` | string | No       | Business address                                                                                  |

**Note:** When registering as a vendor, the `vendor.approvalStatus` is automatically set to `"pending"` and requires admin approval.

### Password Requirements

- Minimum 8 characters
- Automatically hashed using bcrypt (cost factor: 12) before storage

### Request Examples

#### Regular User Registration

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "password": "StrongPass123!",
  "role": "user"
}
```

#### Vendor Registration

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "phone": "+1234567891",
  "password": "VendorPass123!",
  "role": "vendor",
  "vendor": {
    "category": "hotel",
    "businessName": "Grand Hotel",
    "businessAddress": "123 Main Street, City, Country"
  }
}
```

### Success Response

**Status Code:** `201 Created`

```json
{
  "message": "Account created successfully! OTP email sent.",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "role": "user",
    "isVerified": false,
    "isActive": true,
    "verificationToken": "123456",
    "verificationTokenExpires": "2024-01-01T00:10:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Important Notes:**

- The OTP is sent to the user's email automatically
- The OTP expires in **10 minutes**
- The account is not verified until OTP is confirmed
- For vendors, `vendor.approvalStatus` will be `"pending"` until admin approval

### Error Responses

**Status Code:** `400 Bad Request`

- Missing required fields:

```json
{
  "status": "error",
  "message": "All fields are required"
}
```

- Duplicate email:

```json
{
  "status": "error",
  "message": "User with this email already exists"
}
```

- Invalid email format:

```json
{
  "status": "error",
  "message": "Please provide a valid email"
}
```

- Invalid phone number:

```json
{
  "status": "error",
  "message": "Please provide a valid phone number"
}
```

- Vendor without category:

```json
{
  "status": "error",
  "message": "Category is required for vendor accounts"
}
```

### cURL Example

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "password": "StrongPass123!",
    "role": "user"
  }'
```

---

## 2. Verify OTP

Verifies the 6-digit OTP sent to the user's email during registration. Upon successful verification, the account is activated, and a JWT token is returned.

**Endpoint:** `POST /api/v1/auth/verify-otp`

**Authentication:** Not required

### Request Body

| Field   | Type   | Required | Description                                   |
| ------- | ------ | -------- | --------------------------------------------- |
| `email` | string | Yes      | User's email address used during registration |
| `otp`   | string | Yes      | 6-digit OTP code received via email           |

### Request Example

```json
{
  "email": "john.doe@example.com",
  "otp": "123456"
}
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "message": "OTP verified successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "role": "user",
    "isVerified": true,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:05:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImVtYWlsIjoiam9obi5kb2VAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTcwNDA2NDAwMCwiZXhwIjoxNzA0NjY4ODAwfQ..."
}
```

**Important Notes:**

- Upon successful verification, `isVerified` is set to `true` and `isActive` is set to `true`
- A welcome email is automatically sent to the user
- A JWT token is returned for immediate authentication
- The verification token and expiration are cleared from the user record

### Error Responses

**Status Code:** `400 Bad Request`

- Missing fields:

```json
{
  "status": "error",
  "message": "All fields are required"
}
```

- Invalid or expired OTP:

```json
{
  "status": "error",
  "message": "Invalid or expired OTP"
}
```

### cURL Example

```bash
curl -X POST http://localhost:3000/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "otp": "123456"
  }'
```

---

## 3. Resend OTP

Resends a new 6-digit OTP to the user's email. Useful when the original OTP has expired or was not received.

**Endpoint:** `POST /api/v1/auth/resend-otp`

**Authentication:** Not required

### Request Body

| Field   | Type   | Required | Description                                   |
| ------- | ------ | -------- | --------------------------------------------- |
| `email` | string | Yes      | User's email address used during registration |

### Request Example

```json
{
  "email": "john.doe@example.com"
}
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "message": "OTP resent successfully"
}
```

**Important Notes:**

- A new 6-digit OTP is generated and sent to the email
- The new OTP expires in **10 minutes**
- The previous OTP (if any) is invalidated

### Error Responses

**Status Code:** `400 Bad Request`

- Missing email:

```json
{
  "status": "error",
  "message": "Email is required"
}
```

- User not found:

```json
{
  "status": "error",
  "message": "User not found"
}
```

### cURL Example

```bash
curl -X POST http://localhost:3000/api/v1/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com"
  }'
```

---

## 4. Login User

Authenticates a user with email and password and returns a JWT token for accessing protected routes.

**Endpoint:** `POST /api/v1/auth/login`

**Authentication:** Not required

### Request Body

| Field      | Type   | Required | Description          |
| ---------- | ------ | -------- | -------------------- |
| `email`    | string | Yes      | User's email address |
| `password` | string | Yes      | User's password      |

### Request Example

```json
{
  "email": "john.doe@example.com",
  "password": "StrongPass123!"
}
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "message": "Login successful! Welcome to Ajani.",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "role": "user",
    "isVerified": true,
    "isActive": true,
    "profilePicture": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImVtYWlsIjoiam9obi5kb2VAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTcwNDA2NDAwMCwiZXhwIjoxNzA0NjY4ODAwfQ..."
}
```

**Important:**

- Save the `token` from the response. You'll need it for protected routes.
- The token contains: `id`, `email`, and `role`
- Token expiration is set by `JWT_EXPIRES_IN` environment variable (default: `7d`)

### Error Responses

**Status Code:** `400 Bad Request`

- Missing fields:

```json
{
  "status": "error",
  "message": "All fields are required"
}
```

- Invalid credentials:

```json
{
  "status": "error",
  "message": "Incorrect email or password"
}
```

### cURL Example

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "StrongPass123!"
  }'
```

---

## 5. Forgot Password

Sends a password reset link to the user's email. The reset token is valid for 10 minutes.

**Endpoint:** `POST /api/v1/auth/forgot-password`

**Authentication:** Not required

### Request Body

| Field   | Type   | Required | Description          |
| ------- | ------ | -------- | -------------------- |
| `email` | string | Yes      | User's email address |

### Request Example

```json
{
  "email": "john.doe@example.com"
}
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "message": "Reset password email sent"
}
```

**Important Notes:**

- A reset token is generated and sent via email
- The reset link format: `${FRONTEND_URL}/reset-password?token=${resetToken}`
- The reset token expires in **10 minutes**
- For security, the same message is returned whether the user exists or not

### Error Responses

**Status Code:** `400 Bad Request`

- Missing email:

```json
{
  "status": "error",
  "message": "Email is required"
}
```

- User not found (security response):

```json
{
  "status": "error",
  "message": "Reset link will be sent if it exists"
}
```

### cURL Example

```bash
curl -X POST http://localhost:3000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com"
  }'
```

---

## 6. Reset Password

Resets the user's password using a valid reset token received via email.

**Endpoint:** `POST /api/v1/auth/reset-password`

**Authentication:** Not required

### Request Body

| Field      | Type   | Required | Description                                               |
| ---------- | ------ | -------- | --------------------------------------------------------- |
| `token`    | string | Yes      | Reset token received via email (from URL query parameter) |
| `password` | string | Yes      | New password (must meet password requirements)            |

### Request Example

```json
{
  "token": "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
  "password": "NewStrongPass123!"
}
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "message": "Password reset successful! Welcome to Ajani.",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "role": "user",
    "isVerified": true,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:10:00.000Z"
  }
}
```

**Important Notes:**

- The reset token is cleared after successful password reset
- The new password is automatically hashed before storage
- The user can immediately login with the new password

### Error Responses

**Status Code:** `400 Bad Request`

- Missing fields:

```json
{
  "status": "error",
  "message": "All fields are required"
}
```

- Invalid or expired token:

```json
{
  "status": "error",
  "message": "Invalid or expired token"
}
```

### cURL Example

```bash
curl -X POST http://localhost:3000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
    "password": "NewStrongPass123!"
  }'
```

---

## 7. Authentication & Authorization

### JWT Token Structure

The JWT token contains the following payload:

```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "john.doe@example.com",
  "role": "user",
  "iat": 1704064000,
  "exp": 1704668800
}
```

### Using the Token

Include the JWT token in the `Authorization` header for protected routes:

```
Authorization: Bearer <your-jwt-token>
```

### Token Expiration

- Token expiration is controlled by the `JWT_EXPIRES_IN` environment variable
- Default: `7d` (7 days)
- Format examples: `7d`, `24h`, `1h`, `30m`

### Protected Routes

Protected routes require a valid JWT token. The middleware:

1. Extracts the token from the `Authorization` header
2. Verifies the token signature using `JWT_SECRET`
3. Checks if the user still exists in the database
4. Attaches the user object to `req.user` for use in route handlers

### Error Responses

**Status Code:** `401 Unauthorized`

- No token provided:

```json
{
  "status": "error",
  "message": "You are not logged in! Please login to get access"
}
```

- Invalid token:

```json
{
  "status": "error",
  "message": "Invalid token. Please login again"
}
```

- User not found:

```json
{
  "status": "error",
  "message": "The user belonging to this token does not longer exist! Please login to get access"
}
```

### cURL Example with Authentication

```bash
curl -X GET http://localhost:3000/api/v1/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 8. User Model Schema

The User model contains the following fields:

### Base User Fields

| Field                      | Type     | Required | Description                                                          |
| -------------------------- | -------- | -------- | -------------------------------------------------------------------- |
| `_id`                      | ObjectId | Auto     | Unique user identifier                                               |
| `firstName`                | String   | Yes      | User's first name                                                    |
| `lastName`                 | String   | Yes      | User's last name                                                     |
| `email`                    | String   | Yes      | Unique email address (validated, lowercase, trimmed)                 |
| `phone`                    | String   | Yes      | Phone number (validated as mobile phone, lowercase, trimmed)         |
| `password`                 | String   | Yes      | Hashed password (bcrypt, cost factor: 12, not returned in responses) |
| `profilePicture`           | String   | No       | URL to user's profile picture (default: `null`)                      |
| `role`                     | String   | No       | User role: `"user"`, `"vendor"`, or `"admin"` (default: `"user"`)    |
| `isVerified`               | Boolean  | No       | Email verification status (default: `false`)                         |
| `isActive`                 | Boolean  | No       | Account active status (default: `true`)                              |
| `verificationToken`        | String   | No       | 6-digit OTP for email verification                                   |
| `verificationTokenExpires` | Date     | No       | Expiration date for verification token (10 minutes from generation)  |
| `resetToken`               | String   | No       | Token for password reset (32-byte hex string)                        |
| `resetTokenExpires`        | Date     | No       | Expiration date for reset token (10 minutes from generation)         |
| `createdAt`                | Date     | Auto     | Timestamp when user was created                                      |
| `updatedAt`                | Date     | Auto     | Timestamp when user was last updated                                 |

### Vendor Sub-Schema (when `role` is `"vendor"`)

| Field             | Type   | Required | Description                                                                                       |
| ----------------- | ------ | -------- | ------------------------------------------------------------------------------------------------- |
| `category`        | String | Yes      | Vendor category: `"hotel"`, `"restaurant"`, `"shortlet"`, `"service provider"`, `"accommodation"` |
| `approvalStatus`  | String | No       | Approval status: `"pending"`, `"approved"`, `"rejected"` (default: `"pending"`)                   |
| `approvedAt`      | Date   | No       | Timestamp when vendor was approved (default: `null`)                                              |
| `businessName`    | String | No       | Business name (default: `null`)                                                                   |
| `businessAddress` | String | No       | Business address (default: `null`)                                                                |

### Password Hashing

- Passwords are automatically hashed using bcrypt before saving
- Cost factor: 12 (high security)
- Password field is excluded from queries by default (`select: false`)
- Use `.select("+password")` to include password in queries when needed (e.g., login verification)

### Indexes

- `role` - Indexed for efficient role-based queries
- `vendor.approvalStatus` - Indexed for efficient vendor approval queries

---

## 9. Error Responses

All error responses follow a consistent format:

```json
{
  "status": "error",
  "message": "Error message description"
}
```

### Common Status Codes

| Status Code | Description                                                    |
| ----------- | -------------------------------------------------------------- |
| `400`       | Bad Request - Invalid input, missing fields, validation errors |
| `401`       | Unauthorized - Authentication required or invalid token        |
| `404`       | Not Found - Resource not found                                 |
| `429`       | Too Many Requests - Rate limit exceeded                        |
| `500`       | Internal Server Error - Server error                           |

### Common Error Messages

- `"All fields are required"` - Missing required fields in request
- `"User with this email already exists"` - Duplicate email during registration
- `"Incorrect email or password"` - Invalid login credentials
- `"Invalid or expired OTP"` - OTP verification failed
- `"Invalid or expired token"` - Password reset token invalid/expired
- `"Email is required"` - Missing email field
- `"User not found"` - User doesn't exist
- `"Category is required for vendor accounts"` - Missing vendor category
- `"Please provide a valid email"` - Invalid email format
- `"Please provide a valid phone number"` - Invalid phone format
- `"Too many requests from this IP, please try again in an hour!"` - Rate limit exceeded

---

## 10. Security Features

### 1. Password Security

- **Hashing**: All passwords are hashed using bcrypt with cost factor 12
- **Minimum Length**: Passwords must be at least 8 characters
- **Never Exposed**: Password field is never returned in API responses
- **Select Exclusion**: Password field excluded from queries by default

### 2. JWT Authentication

- **Token-Based**: Secure token-based authentication
- **Signed Tokens**: Tokens signed with `JWT_SECRET`
- **Configurable Expiration**: Token expiration controlled by `JWT_EXPIRES_IN`
- **User Verification**: Token validation includes user existence check

### 3. Input Validation

- **Email Validation**: Validated using validator library
- **Phone Validation**: Validated as mobile phone format
- **Automatic Normalization**: Email and phone automatically converted to lowercase
- **Trimmed Inputs**: All string inputs are trimmed

### 4. Rate Limiting

- **Global Limit**: 100 requests per hour per IP address
- **Applied to**: All `/api` routes
- **Protection**: Prevents brute force attacks and abuse

### 5. Security Headers

- **Helmet**: Security HTTP headers enabled
- **CORS**: Cross-origin resource sharing configured with allowed origins
- **Trust Proxy**: Configured for proper rate limiting behind proxies

### 6. Email Verification

- **OTP System**: 6-digit OTP for email verification
- **Time-Limited**: OTP expires in 10 minutes
- **One-Time Use**: OTP cleared after successful verification
- **Resend Capability**: Users can request new OTP if expired

### 7. Password Reset Security

- **Cryptographically Secure**: Reset tokens generated using `crypto.randomBytes(32)`
- **Time-Limited**: Reset tokens expire in 10 minutes
- **One-Time Use**: Reset tokens cleared after successful password reset
- **Secure Response**: Same response for existing/non-existing users (prevents email enumeration)

### 8. Vendor Approval System

- **Admin Approval**: Vendors require admin approval before activation
- **Status Tracking**: Approval status tracked (`pending`, `approved`, `rejected`)
- **Category Validation**: Vendor category required and validated

---

## Environment Variables

The following environment variables are required for the Auth API:

| Variable         | Description                                      | Example                           |
| ---------------- | ------------------------------------------------ | --------------------------------- |
| `MONGODB_URI`    | MongoDB connection string                        | `mongodb://localhost:27017/ajani` |
| `JWT_SECRET`     | Secret key for JWT token signing                 | `your-secret-key-here`            |
| `JWT_EXPIRES_IN` | JWT token expiration time                        | `7d`, `24h`, `1h`                 |
| `FRONTEND_URL`   | Frontend URL for password reset links            | `http://localhost:5173`           |
| `PORT`           | Server port number                               | `3000`                            |
| `NODE_ENV`       | Environment mode (`development` or `production`) | `development`                     |

**Email Configuration** (for Resend service):

- Email sending is handled via Resend service
- Email templates are customized for users and vendors

---

## Rate Limiting

All `/api` routes are rate-limited to:

- **Limit**: 100 requests per hour per IP address
- **Window**: 60 minutes (1 hour)
- **Response**: `"Too many requests from this IP, please try again in an hour!"`
- **Status Code**: `429 Too Many Requests`

---

## Email Notifications

The API automatically sends emails for various events:

### 1. Registration OTP Email

- **Trigger**: User registration
- **Content**: 6-digit OTP code
- **Expiration**: 10 minutes
- **Templates**: Different templates for users and vendors

### 2. Welcome Email

- **Trigger**: Successful OTP verification
- **Content**: Welcome message
- **Templates**: Different templates for users and vendors

### 3. Password Reset Email

- **Trigger**: Forgot password request
- **Content**: Reset link with token
- **Expiration**: 10 minutes

### 4. Resend OTP Email

- **Trigger**: Resend OTP request
- **Content**: New 6-digit OTP code
- **Expiration**: 10 minutes

---

## Registration Flow

### For Regular Users

1. **Register** → User creates account → OTP sent to email
2. **Verify OTP** → User enters OTP → Account verified → Token returned
3. **Login** → User can now login with email/password

### For Vendors

1. **Register** → Vendor creates account with category → OTP sent to email
2. **Verify OTP** → Vendor enters OTP → Account verified → Token returned
3. **Admin Approval** → Vendor status is `pending` → Admin approves/rejects
4. **Login** → Vendor can login (may have restrictions based on approval status)

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Password field is never returned in API responses
- OTP codes expire after 10 minutes
- Reset tokens expire after 10 minutes
- Email addresses are automatically converted to lowercase
- Phone numbers are validated and converted to lowercase
- Welcome emails are sent automatically upon OTP verification
- Password reset emails are sent automatically when requested
- Email sending failures are logged but don't block the API response
- The API uses async/await with error handling via `catchAsync` wrapper
- All sensitive tokens (verification, reset) are cleared from responses

---

## API Versioning

The API uses versioning in the URL path:

- Current version: `v1`
- Base path: `/api/v1/auth`
- Future versions: `/api/v2/auth`, etc.

---

## Support

For issues or questions regarding the Auth API, please contact the development team or refer to the main project documentation.
