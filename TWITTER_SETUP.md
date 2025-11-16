# Twitter Integration Setup Guide

This guide explains how to set up Twitter/X account connection and posting functionality in your Blip app.

## Features Implemented

✅ **Connect/Disconnect Twitter Accounts** - Users can authenticate their Twitter accounts via OAuth 2.0
✅ **Post to Twitter** - Share content directly to Twitter from the app
✅ **Connection Status** - Real-time display of Twitter connection status
✅ **Error Handling** - Comprehensive error messages and feedback
✅ **Token Storage** - Secure storage of access tokens in HTTP-only cookies and database

## Prerequisites

1. **Twitter Developer Account**
   - Visit [Twitter Developer Portal](https://developer.twitter.com)
   - Create a new App (or use existing one)
   - Enable OAuth 2.0 authentication

2. **Environment Variables**
   
   Create a `.env.local` file in the project root with:

   ```env
   # Twitter OAuth
   TWITTER_CLIENT_ID=your_client_id_here
   TWITTER_CLIENT_SECRET=your_client_secret_here
   TWITTER_REDIRECT_URI=http://localhost:3000/api/auth/twitter/callback
   TWITTER_CODE_CHALLENGE=challenge
   TWITTER_CODE_VERIFIER=challenge
   
   # Database (for token storage)
   DATABASE_URL=postgresql://user:password@localhost:5432/blip_db
   ```

3. **Database Setup**

   Run Prisma migrations to create the necessary tables:

   ```bash
   npx prisma migrate dev --name init
   ```

   This creates:
   - `TwitterAccount` table - stores Twitter tokens and user info
   - `Post` table - tracks posts published from the app

## How It Works

### 1. Twitter Authentication Flow

When a user clicks "Connect Twitter":

1. A popup window opens to `/api/auth/twitter`
2. User authenticates with their Twitter account
3. Twitter redirects to `/api/auth/twitter/callback` with an authorization code
4. Backend exchanges the code for an access token
5. Token is stored in HTTP-only cookie and database
6. Frontend detects the connection and updates UI

### 2. Posting to Twitter

When a user posts with Twitter selected:

1. Frontend sends POST request to `/api/auth/twitter/post`
2. Backend retrieves access token from cookie
3. Backend sends tweet to Twitter API
4. Tweet is published and response is returned to frontend

### 3. Token Management

- Access tokens are stored securely in HTTP-only cookies (not accessible via JavaScript)
- Tokens are also backed up in the database
- Refresh tokens (if provided) are stored for token renewal
- Tokens are cleared when user clicks "Disconnect"

## File Structure

```
app/
├── api/auth/twitter/
│   ├── route.ts              # OAuth authorization endpoint
│   ├── callback/
│   │   └── route.ts          # OAuth callback handler
│   ├── status/
│   │   └── route.ts          # Check connection status
│   ├── post/
│   │   └── route.ts          # Post to Twitter
│   └── logout/
│       └── route.ts          # Disconnect account
└── components/
    └── SocialMediaPoster.tsx  # Main UI component

prisma/
├── schema.prisma             # Database schema (updated)
└── migrations/               # Database migrations
```

## Component Features

The `SocialMediaPoster` component now includes:

- **Twitter Status Indicator** - Shows connected/disconnected status with visual indicator
- **Connect/Disconnect Button** - Easy account management
- **Error Banner** - Displays connection and posting errors
- **Success Banner** - Confirms successful posting
- **Loading States** - Feedback during authentication and posting
- **Platform Selection** - Select Twitter (and other platforms) to post to
- **Content & Media** - Support for text and media attachments

## API Routes

### GET `/api/auth/twitter`
Initiates Twitter OAuth flow by redirecting to Twitter authorization URL.

### GET `/api/auth/twitter/callback`
Handles OAuth callback, exchanges code for token, stores in DB and cookie.

**Query Parameters:**
- `code` - Authorization code from Twitter
- `state` - State parameter for CSRF protection

**Response:** Redirects to home page with token set in cookie

### GET `/api/auth/twitter/status`
Checks if user has active Twitter connection.

**Response:**
```json
{
  "connected": true
}
```

### POST `/api/auth/twitter/post`
Posts content to Twitter.

**Request Body:**
```json
{
  "content": "Your tweet text",
  "mediaUrls": ["https://example.com/image.jpg"]
}
```

**Response:**
```json
{
  "data": {
    "id": "1234567890",
    "text": "Your tweet text"
  }
}
```

### POST `/api/auth/twitter/logout`
Clears Twitter authentication.

**Response:**
```json
{
  "success": true
}
```

## Security Considerations

1. **HTTP-Only Cookies** - Access tokens stored in HTTP-only cookies prevent XSS attacks
2. **HTTPS Required** - In production, use HTTPS only (SameSite=Lax requires Secure flag)
3. **State Parameter** - CSRF protection using state parameter in OAuth flow
4. **Client Secret** - Never expose client secret in frontend code
5. **Token Expiration** - Implement token refresh for long-lived access
6. **User Isolation** - Each user's tokens stored separately in database

## Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the SocialMediaPoster component
3. Click "Connect Twitter"
4. Authenticate with your Twitter account
5. You should see "Twitter Connected" status
6. Write a post and select Twitter platform
7. Click "Post to Selected Platforms"
8. Tweet should appear on your Twitter account

## Troubleshooting

### "Please allow pop-ups to connect Twitter"
- Check browser pop-up blocker settings
- Ensure pop-ups are allowed for localhost:3000

### Token exchange fails
- Verify `TWITTER_CLIENT_ID` and `TWITTER_CLIENT_SECRET` are correct
- Check that `TWITTER_REDIRECT_URI` matches Twitter app settings
- Ensure redirect URI uses correct protocol (http/https)

### Failed to post to Twitter
- Verify token hasn't expired
- Check Twitter API rate limits
- Ensure tweet content meets Twitter requirements (not empty, not duplicated)

### Database errors
- Run `npx prisma migrate dev` to apply migrations
- Check `DATABASE_URL` is correct
- Verify PostgreSQL is running

## Next Steps

- [ ] Implement token refresh logic for expired tokens
- [ ] Add support for Instagram, TikTok, Facebook, LinkedIn
- [ ] Implement proper user authentication system
- [ ] Add scheduled posting
- [ ] Add analytics/post history
- [ ] Add media upload with preview
- [ ] Implement rate limiting

## References

- [Twitter API v2 Documentation](https://developer.twitter.com/en/docs/twitter-api)
- [OAuth 2.0 with PKCE](https://developer.twitter.com/en/docs/authentication/oauth-2-0/authorization-code)
- [Prisma Documentation](https://www.prisma.io/docs/)
