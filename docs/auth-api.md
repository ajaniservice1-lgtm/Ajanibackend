# Auth API Usage

- Base URL: `http://localhost:<PORT>/api/v1/auth`
- Content type: `application/json`
- Auth: JWT issued on login; include as `Authorization: Bearer <token>` for protected routes (none in this module yet).

## Endpoints

### POST `/register`

- Creates a user and emails a verification link.
- Required body: `firstName`, `lastName`, `email`, `phone`, `password`, `confirmPassword`
- Optional body: `role` (`user` | `vendor` | `admin`)
- Responses:
  - `201` `{ message: "Check your email to verify", data: <user> }`
  - `400` on validation failures (missing fields, weak password, duplicate email, etc.)
- Example:

```
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
        "firstName":"Ada",
        "lastName":"Lovelace",
        "email":"ada@example.com",
        "phone":"+12025550123",
        "password":"Str0ng!Pass",
        "confirmPassword":"Str0ng!Pass"
      }'
```

### GET `/verify`

- Marks a user as verified if the token is valid and unexpired (24h).
- Accepts token via query `?token=<token>` or JSON body `{ "token": "<token>" }`.
- Responses:
  - `200` `{ message: "Email verified", data: <user> }`
  - `400` when the token is missing, invalid, or expired.
- Example:

```
curl "http://localhost:3000/api/v1/auth/verify?token=<token-from-email>"
```

### POST `/login`

- Authenticates a verified, active user and returns a JWT.
- Required body: `email`, `password`
- Responses:
  - `200` `{ message: "Login successful", data: <user>, token: "<jwt>" }`
  - `400` for missing fields, wrong credentials, unverified, or inactive user.
- Example:

```
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email":"ada@example.com", "password":"Str0ng!Pass" }'
```

## Notes

- JWT payload: `{ id, email, role }`; expiration controlled by `JWT_EXPIRES_IN`.
- Verification link generated as `<protocol>://<host>/api/v1/auth/verify?token=<token>`.
- Errors use `{ status, message }` in production; include stack/error detail in development.
