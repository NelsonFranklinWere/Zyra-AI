# JWT Authentication Configuration Guide

## Overview

The Zyra backend uses a comprehensive JWT (JSON Web Token) authentication system with access tokens and refresh tokens for secure API access.

## Configuration

### Environment Variables

```env
# JWT Secret Key (REQUIRED - Use a strong random string in production)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# JWT Expiration Times
JWT_EXPIRES_IN=7d                           # Human-readable format (7 days)
JWT_EXPIRES_IN_MS=604800000                 # Milliseconds format (7 days)
JWT_REFRESH_EXPIRES_IN=30d                  # Human-readable format (30 days)
JWT_REFRESH_EXPIRES_IN_MS=2592000000        # Milliseconds format (30 days)
```

## API Usage

### Login/Register Response

```json
{
  "success": true,
  "data": {
    "user": {...},
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 604800,
    "tokenType": "Bearer"
  }
}
```

### Using Access Token

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Refresh Token

```bash
POST /api/auth/refresh-token
{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

## Error Codes

- `MISSING_TOKEN` - No Authorization header
- `INVALID_TOKEN` - Token is invalid
- `TOKEN_EXPIRED` - Access token expired
- `INVALID_TOKEN_TYPE` - Wrong token type
- `USER_NOT_FOUND` - User doesn't exist
- `ACCOUNT_DEACTIVATED` - Account inactive

