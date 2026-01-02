# Ajani Backend API

Backend API for Ajani service platform built with Node.js, Express, and MongoDB.

## Features

- 🔐 User authentication (register, login, password reset)
- 👤 User management
- 📋 Listings management
- 📅 Booking requests
- 📧 Email notifications
- 🛡️ Security features (password hashing, JWT tokens, rate limiting)

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file in the root directory with your environment variables (see below)

3. Start the development server:

```bash
npm run dev
```

## Environment Variables

Create a `.env.local` file with these variables:

```env
# Server
PORT=3000

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT Authentication
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d

# Frontend
FRONTEND_URL=http://localhost:3000

# Email (Gmail)
GOOGLE_EMAIL=your_email@gmail.com
GOOGLE_APP_PASSWORD=your_app_password

# Cloudinary (for image uploads)
CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET=your_cloudinary_api_secret
```

**⚠️ Important:** Never commit your `.env.local` file to GitHub! It contains sensitive information.

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password with token

### Users

- `GET /api/v1/users` - Get all users (protected)
- `GET /api/v1/users/:id` - Get user by ID (protected)
- `PATCH /api/v1/users/:id` - Update user (protected)

### Listings

- `GET /api/v1/listings` - Get all listings
- `GET /api/v1/listings/:id` - Get listing by ID
- `POST /api/v1/listings` - Create listing (protected)
- `PATCH /api/v1/listings/:id` - Update listing (protected)

### Bookings

- `GET /api/v1/bookings` - Get all bookings (protected)
- `POST /api/v1/bookings` - Create booking request (protected)

For detailed API documentation, see [docs/auth-api.md](./docs/auth-api.md)

## Security

- ✅ Passwords are hashed with bcrypt
- ✅ JWT tokens for authentication
- ✅ Rate limiting (100 requests/hour per IP)
- ✅ Input validation and sanitization
- ✅ Security headers with Helmet
- ✅ CORS enabled

## Scripts

- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

## License

ISC
