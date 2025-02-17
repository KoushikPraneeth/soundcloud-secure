# Environment Setup

## Local Development

1. Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

2. Update the `.env` file with your credentials:
- Google OAuth credentials (from Google Cloud Console)
- Supabase credentials (from your Supabase project settings)
- JWT secret (generate a secure random key)

3. Environment variables are loaded automatically when running the application.

## Important Security Notes

- Never commit the `.env` file to version control
- Keep your credentials secure and don't share them
- Rotate secrets regularly
- For production, use a secure secrets management service

## Required Environment Variables

```properties
# Google OAuth Configuration
GOOGLE_CLIENT_ID=           # Your Google OAuth client ID
GOOGLE_CLIENT_SECRET=       # Your Google OAuth client secret
GOOGLE_REDIRECT_URI=        # OAuth callback URL (default: http://localhost:8081/oauth2/callback/google)

# Supabase Configuration
SUPABASE_URL=              # Your Supabase project URL
SUPABASE_KEY=              # Your Supabase API key

# JWT Configuration
JWT_SECRET=                # Secret key for JWT token generation/validation
