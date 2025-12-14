# Auth API Documentation

## Overview

The Auth API provides endpoints for user authentication, registration, and password management. All endpoints use JSON format for request and response bodies.

**Base URL:** `http://localhost:<PORT>/api/v1/auth`

**Content-Type:** `application/json`

---

## Table of Contents

1. [Register User](#1-register-user)
2. [Login User](#2-login-user)
3. [Forgot Password](#3-forgot-password)
4. [Reset Password](#4-reset-password)
5. [Authentication Middleware](#5-authentication-middleware)
6. [User Model Schema](#6-user-model-schema)
7. [Error Responses](#7-error-responses)

---

## 1. Register User

Creates a new user account and sends a welcome email.

**Endpoint:** `POST /api/v1/auth/register`

**Authentication:** Not required

### Request Body

| Field       | Type   | Required | Description                                                       |
| ----------- | ------ | -------- | ----------------------------------------------------------------- |
| `firstName` | string | Yes      | User's first name                                                 |
| `lastName`  | string | Yes      | User's last name                                                  |
| `email`     | string | Yes      | User's email address (must be unique and valid)                   |
| `password`  | string | Yes      | User's password (min 8 chars, must be strong)                     |
| `phone`     | string | No       | User's phone number (must be valid if provided)                   |
| `role`      | string | No       | User role: `"user"`, `"vendor"`, or `"admin"` (default: `"user"`) |

### Password Requirements

- Minimum 8 characters
- Maximum 32 characters
- Must be a strong password (validated using validator library)

### Request Example

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

### Success Response

**Status Code:** `201 Created`

```json
{
  "message": "Registration successful! Welcome email sent.",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "role": "user",
    "isVerified": false,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Error Responses

**Status Code:** `400 Bad Request`

- Missing required fields:

```json
{
  "status": "error",
  "message": "All fields are required"
}
```

- Invalid email format:

```json
{
  "status": "error",
  "message": "Please provide a valid email"
}
```

- Weak password:

```json
{
  "status": "error",
  "message": "Please provide a strong password"
}
```

- Duplicate email:

```json
{
  "status": "error",
  "message": "Email already exists"
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

## 2. Login User

Authenticates a user and returns a JWT token.

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
  "message": "Login successful",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "role": "user",
    "isVerified": false,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Important:** Save the `token` from the response. You'll need it for protected routes.

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

## 3. Forgot Password

Sends a password reset link to the user's email.

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

**Note:** The reset token expires in 10 minutes. The reset link is sent to the user's email.

### Error Responses

**Status Code:** `400 Bad Request`

- Missing email:

```json
{
  "status": "error",
  "message": "Email is required"
}
```

- User not found (for security, same message is returned):

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

## 4. Reset Password

Resets the user's password using a reset token.

**Endpoint:** `POST /api/v1/auth/reset-password`

**Authentication:** Not required

### Request Body

| Field      | Type   | Required | Description                                    |
| ---------- | ------ | -------- | ---------------------------------------------- |
| `token`    | string | Yes      | Reset token received via email                 |
| `password` | string | Yes      | New password (must meet password requirements) |

### Request Example

```json
{
  "token": "abc123def456...",
  "password": "NewStrongPass123!"
}
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "message": "Password reset successful",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "role": "user",
    "isVerified": false,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

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
    "token": "abc123def456...",
    "password": "NewStrongPass123!"
  }'
```

---

## 5. Authentication Middleware

The `protect` middleware is used to secure routes that require authentication.

### Usage

Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### How It Works

1. Extracts the token from the `Authorization` header
2. Verifies the token signature using `JWT_SECRET`
3. Checks if the user still exists in the database
4. Attaches the user object to `req.user` for use in route handlers

### Example Protected Route

```javascript
import { protect } from "../middlewares/auth.middleware.js";

router.get("/profile", protect, getProfile);
```

### Error Responses

**Status Code:** `401 Unauthorized`

- No token provided:

```json
{
  "status": "error",
  "message": "Your are not logged in! Please login to get access"
}
```

- Invalid token or user not found:

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

## 6. User Model Schema

The User model contains the following fields:

| Field                      | Type    | Required | Description                                                       |
| -------------------------- | ------- | -------- | ----------------------------------------------------------------- |
| `firstName`                | String  | Yes      | User's first name                                                 |
| `lastName`                 | String  | Yes      | User's last name                                                  |
| `email`                    | String  | Yes      | Unique email address (validated, lowercase)                       |
| `phone`                    | String  | Yes      | Phone number (validated)                                          |
| `password`                 | String  | Yes      | Hashed password (not returned in responses)                       |
| `role`                     | String  | No       | User role: `"user"`, `"vendor"`, or `"admin"` (default: `"user"`) |
| `verificationToken`        | String  | No       | Token for email verification                                      |
| `verificationTokenExpires` | Date    | No       | Expiration date for verification token                            |
| `resetToken`               | String  | No       | Token for password reset                                          |
| `resetTokenExpires`        | Date    | No       | Expiration date for reset token (10 minutes)                      |
| `isVerified`               | Boolean | No       | Email verification status (default: `false`)                      |
| `isActive`                 | Boolean | No       | Account active status (default: `true`)                           |
| `createdAt`                | Date    | Auto     | Timestamp when user was created                                   |
| `updatedAt`                | Date    | Auto     | Timestamp when user was last updated                              |

### Password Hashing

- Passwords are automatically hashed using bcrypt (cost factor: 12) before saving
- Password field is excluded from queries by default (`select: false`)
- Use `.select("+password")` to include password in queries when needed

---

## 7. Error Responses

All error responses follow a consistent format:

```json
{
  "status": "error",
  "message": "Error message description"
}
```

### Common Status Codes

- `400 Bad Request` - Invalid input, missing fields, validation errors
- `401 Unauthorized` - Authentication required or invalid token
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Environment Variables

The following environment variables are required:

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token signing
- `JWT_EXPIRES_IN` - JWT token expiration time (e.g., "7d", "24h")
- `FRONTEND_URL` - Frontend URL for password reset links
- `PORT` - Server port number

---

## Rate Limiting

All `/api` routes are rate-limited to:

- **100 requests per hour** per IP address
- Exceeding the limit returns: `"Too many requests from this IP, please try again in an hour!"`

---

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt before storage
2. **JWT Authentication**: Secure token-based authentication
3. **Input Validation**: Email, phone, and password validation
4. **Rate Limiting**: Protection against brute force attacks
5. **Helmet**: Security HTTP headers
6. **CORS**: Cross-origin resource sharing enabled
7. **Password Strength**: Enforced strong password requirements

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Password field is never returned in API responses
- Reset tokens expire after 10 minutes
- Email addresses are automatically converted to lowercase
- Phone numbers are validated using the validator library
- Welcome emails are sent automatically upon registration
- Password reset emails are sent automatically when requested
