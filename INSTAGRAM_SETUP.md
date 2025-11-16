# 📸 Instagram Setup Guide

## What's New

Instagram posting has been added to your Blip app alongside Twitter! Users can now:
- ✅ Connect their Instagram Business Account via Meta OAuth
- ✅ Post photos/videos with captions
- ✅ Mix Instagram & Twitter posting
- ✅ Track post history across both platforms

## Get Instagram API Credentials

### Step 1: Go to Meta Developers
Visit: https://developers.facebook.com

### Step 2: Create an App
1. Click "My Apps" → "Create App"
2. Choose "Business" type
3. Fill in app details:
   - App Name: "Blip Social Poster"
   - App Purpose: "Other"

### Step 3: Add Products
1. In your app dashboard, find "Products"
2. Add "Instagram" product
3. Add "Facebook Login" product

### Step 4: Configure Instagram API
1. Go to Settings → Basic
2. Copy your:
   - **App ID** → `INSTAGRAM_APP_ID`
   - **App Secret** → `INSTAGRAM_APP_SECRET`

### Step 5: Set OAuth Redirect URI
1. Go to Settings → Basic
2. Find "Valid OAuth Redirect URIs"
3. Add: `http://localhost:3000/api/auth/instagram/callback`
4. Save changes

### Step 6: Configure Scopes
In "Roles & Permissions", ensure these scopes are enabled:
- ✅ `instagram_basic`
- ✅ `instagram_content_publish`
- ✅ `pages_read_engagement`
- ✅ `pages_manage_metadata`

## Add to .env.local

Update your `.env.local` file:

```env
# Instagram/Meta API Credentials
INSTAGRAM_APP_ID=your_app_id_here
INSTAGRAM_APP_SECRET=your_app_secret_here
INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/auth/instagram/callback
```

## Test It

1. **Restart your app:**
   ```bash
   npm run dev
   ```

2. **Click "Connect Instagram"** button in the UI

3. **Authenticate** with your Meta/Facebook account

4. **Select Instagram** platform and post!

## How It Works

### Instagram OAuth Flow
```
1. User clicks "Connect Instagram"
   ↓
2. Redirects to Instagram OAuth page
   ↓
3. User authenticates with Meta account
   ↓
4. Instagram returns authorization code
   ↓
5. App exchanges code for access token
   ↓
6. Token stored in HTTP-only cookie
   ↓
7. Status shows "Instagram Connected"
```

### Instagram Posting Flow
```
1. User writes caption
2. Uploads photo/video
3. Selects "Instagram" platform
4. Clicks "Post"
   ↓
5. Backend uploads media to Instagram
   ↓
6. Creates carousel/post with caption
   ↓
7. Publishes to Instagram account
   ↓
8. Success! Post appears on Instagram
```

## File Structure

```
app/api/auth/instagram/
├── route.ts              # OAuth initiation
├── callback/
│   └── route.ts          # OAuth callback & token exchange
├── status/
│   └── route.ts          # Check connection status
├── post/
│   └── route.ts          # Post content to Instagram
└── logout/
    └── route.ts          # Disconnect account
```

## Features

### Connection Management
- One-click Instagram connection
- Real-time status indicator
- Easy disconnect/reconnect

### Posting
- Photo uploads
- Video uploads
- Caption text
- Character limit warnings (2200 chars)

### Security
- OAuth 2.0 authentication
- HTTP-only cookies (XSS protection)
- Server-side secret (never exposed)
- Long-lived access tokens (60-day refresh)

## Supported Media

- **Photos**: JPEG, PNG, GIF, WebP
- **Videos**: MP4, MOV, AVI (up to 15 minutes)
- **Carousel Posts**: Multiple photos/videos

## Limitations

- Requires Business Account (not Personal)
- Requires Meta app approval for production
- Videos must be under 15 minutes
- Maximum 50 posts per day

## Troubleshooting

### "Invalid OAuth redirect URI"
→ Verify redirect URI in Meta app settings matches exactly

### "App not installed"
→ Install Facebook Login product in Meta app

### "Instagram Business Account Required"
→ Convert Personal account to Business account on Instagram

### Token expires after posting
→ Instagram tokens refresh every 60 days automatically

### Video upload fails
→ Check video format (MP4 recommended) and duration (<15 min)

## Environment Variables

| Variable | Value | Notes |
|----------|-------|-------|
| INSTAGRAM_APP_ID | Your Meta App ID | From app.facebook.com |
| INSTAGRAM_APP_SECRET | Your Meta App Secret | Keep secret! |
| INSTAGRAM_REDIRECT_URI | http://localhost:3000/api/auth/instagram/callback | For local dev |

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/auth/instagram` | Start OAuth flow |
| GET | `/api/auth/instagram/callback` | OAuth callback |
| GET | `/api/auth/instagram/status` | Check connection |
| POST | `/api/auth/instagram/post` | Post content |
| POST | `/api/auth/instagram/logout` | Disconnect |

## Production Deployment

When deploying to production:

1. **Update redirect URI** in Meta app settings:
   ```
   https://yourdomain.com/api/auth/instagram/callback
   ```

2. **Update .env.local** on production server:
   ```env
   INSTAGRAM_REDIRECT_URI=https://yourdomain.com/api/auth/instagram/callback
   ```

3. **Request app review** from Meta for production use

4. **Use HTTPS** for all OAuth endpoints

## Next Steps

- ✅ Add credentials to .env.local
- ✅ Restart dev server
- ✅ Click "Connect Instagram"
- ✅ Authenticate with Meta
- ✅ Post your first Instagram photo! 📸

---

**Status**: ✅ Ready to use
**Setup Time**: 10 minutes
**Support**: Check Instagram Graph API docs
