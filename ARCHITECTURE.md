# Twitter Integration Architecture & Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BLIP APPLICATION                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────┐         ┌──────────────────────────┐  │
│  │  SocialMediaPoster.tsx  │         │   API Routes             │  │
│  │  (Frontend)             │◄───────►│   (Backend)              │  │
│  │                         │         │                          │  │
│  │ • Connect Button        │         │ • /auth/twitter          │  │
│  │ • Disconnect Button     │         │ • /auth/twitter/callback │  │
│  │ • Status Indicator      │         │ • /auth/twitter/status   │  │
│  │ • Post Form             │         │ • /auth/twitter/post     │  │
│  │ • Post History          │         │ • /auth/twitter/logout   │  │
│  │                         │         │                          │  │
│  └────────────┬────────────┘         └──────────────┬───────────┘  │
│               │                                      │              │
│               └──────────────┬───────────────────────┘              │
│                              │                                      │
│                    ┌─────────▼────────┐                            │
│                    │  Prisma Client   │                            │
│                    │  (ORM)           │                            │
│                    └────────┬─────────┘                            │
│                             │                                      │
└─────────────────────────────┼──────────────────────────────────────┘
                              │
                    ┌─────────▼────────┐
                    │  PostgreSQL DB   │
                    │  (Token Storage) │
                    └──────────────────┘
                              
                              │
                    ┌─────────▼─────────────┐
                    │  Twitter API v2       │
                    │  • OAuth 2.0          │
                    │  • Post Tweets        │
                    │  • User Info          │
                    └───────────────────────┘
```

## OAuth 2.0 Flow

```
Step 1: User clicks "Connect Twitter"
┌─────────────────────────────────────────────────────────────────┐
│ User (Browser)              │ Your App              │ Twitter    │
├─────────────────────────────────────────────────────────────────┤
│                             │                      │             │
│  Click Connect Twitter ──►  │                      │             │
│                             │ Opens popup window   │             │
│                             │ with OAuth URL ──────►             │
│                             │                      │             │
│                             │                   (Show Login)     │
│◄────────────────────────────────────────────────────────────────►
│  User logs in & authorizes  │                      │             │
│                             │                      │             │
│                             │ ◄─ Redirect with code┤             │
│ Receives auth code ◄───────────────────────────────┤             │
│
Step 2: Exchange code for token (happens on backend)
│                             │                      │             │
│                             │ POST /oauth2/token   │             │
│                             ├─ code                │             │
│                             ├─ client_id ────────►             │
│                             ├─ client_secret       │             │
│                             │                      │             │
│                             │ ◄─ access_token ─────┤             │
│ ◄──── Token stored in cookie + DB ────────────────┤             │
│                             │                      │             │
│  Status: Connected ✓        │                      │             │
└─────────────────────────────────────────────────────────────────┘
```

## Posting Flow

```
┌────────────────────────────────────────────────────────────────────┐
│                     POST TO TWITTER FLOW                          │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Step 1: User composes post                                       │
│  ┌───────────────────────────┐                                    │
│  │ Content: "Hello Twitter!" │                                    │
│  │ Platforms: [Twitter]      │                                    │
│  │ Media: [image.jpg]        │                                    │
│  │ [Post Button] ────┐       │                                    │
│  └────────────────────────────┘       │                           │
│                                        ▼                          │
│  Step 2: Frontend validation                                      │
│  ┌──────────────────────────────────────┐                        │
│  │ ✓ Content not empty                  │                        │
│  │ ✓ At least one platform selected     │                        │
│  │ ✓ Twitter connected                  │                        │
│  │ → Send to backend                    │                        │
│  └────────────┬───────────────────────────┘                       │
│               │                                                    │
│  Step 3: Backend processing                                       │
│  ┌────────────▼──────────────────────────┐                       │
│  │ POST /api/auth/twitter/post           │                       │
│  │ • Verify access token in cookie       │                       │
│  │ • Fetch from database if needed       │                       │
│  │ • Prepare tweet payload               │                       │
│  └────────────┬───────────────────────────┘                       │
│               │                                                    │
│  Step 4: Twitter API call                                         │
│  ┌────────────▼───────────────────────┐                          │
│  │ POST https://api.twitter.com/2/tweets                         │
│  │ Header: Authorization: Bearer {access_token}                  │
│  │ Body: {                                                        │
│  │   "text": "Hello Twitter!",                                   │
│  │   "media": {...}                                              │
│  │ }                                                              │
│  └────────────┬────────────────────────┘                         │
│               │                                                    │
│  Step 5: Success response                                         │
│  ┌────────────▼────────────────────────┐                         │
│  │ Response:                            │                         │
│  │ {                                    │                         │
│  │   "data": {                          │                         │
│  │     "id": "1234567890",              │                         │
│  │     "text": "Hello Twitter!"         │                         │
│  │   }                                  │                         │
│  │ }                                    │                         │
│  └────────────┬────────────────────────┘                         │
│               │                                                    │
│  Step 6: Update frontend                                          │
│  ┌────────────▼──────────────────────┐                           │
│  │ ✓ Show success banner              │                           │
│  │ ✓ Clear form                       │                           │
│  │ ✓ Add to post history              │                           │
│  │ ✓ Reset platforms                  │                           │
│  └───────────────────────────────────┘                           │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

## Component State Management

```
SocialMediaPoster Component
│
├─ postContent (string)
│  └─ What the user types
│
├─ selectedPlatforms (object)
│  └─ { instagram: false, twitter: true, ... }
│
├─ mediaFiles (array)
│  └─ [{ id, name, type, url }, ...]
│
├─ charCount (number)
│  └─ Length of content
│
├─ posts (array)
│  └─ History of posted content
│
├─ twitterConnected (boolean | null)
│  └─ true = connected, false = not connected, null = loading
│
├─ isAuthenticating (boolean)
│  └─ Show spinner during OAuth
│
├─ isPosting (boolean)
│  └─ Show spinner during post request
│
├─ error (string | null)
│  └─ Error message to display
│
└─ showSuccess (boolean)
   └─ Show success banner
```

## Database Schema

```
TwitterAccount Table
┌──────────────────────────────────────┐
│ id (Primary Key)                     │
│ userId (Unique, Foreign Key)         │
│ accessToken (String, Required)       │
│ refreshToken (String, Optional)      │
│ tokenExpiresAt (DateTime, Optional)  │
│ twitterUserId (String, Optional)     │
│ twitterUsername (String, Optional)   │
│ createdAt (DateTime)                 │
│ updatedAt (DateTime)                 │
└──────────────────────────────────────┘
         │
         └─► Used to look up and refresh tokens

Post Table
┌──────────────────────────────────────┐
│ id (Primary Key)                     │
│ userId (Foreign Key)                 │
│ content (String)                     │
│ platforms (String Array)             │
│ mediaCount (Number)                  │
│ twitterPostId (String, Optional)     │
│ createdAt (DateTime)                 │
└──────────────────────────────────────┘
         │
         └─► Track all posts published
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      ERROR SCENARIOS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Connection Errors                                          │
│     └─ "Please connect your Twitter account first"             │
│        └─ Show "Connect Twitter" button                        │
│                                                                 │
│  2. Validation Errors                                          │
│     ├─ "Please select at least one platform"                   │
│     └─ "Please add content or media to your post"              │
│                                                                 │
│  3. Authentication Errors                                      │
│     ├─ "Please allow pop-ups to connect Twitter"               │
│     └─ Token expired → Need to reconnect                       │
│                                                                 │
│  4. API Errors                                                 │
│     ├─ "Failed to post to Twitter"                             │
│     └─ Network errors → Retry option                           │
│                                                                 │
│  5. Database Errors                                            │
│     └─ Logged on backend, generic error to user                │
│                                                                 │
│  All errors displayed in red banner at top of form             │
└─────────────────────────────────────────────────────────────────┘
```

## Security Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    SECURITY MEASURES                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Token Storage (HTTP-only Cookie)                            │
│     ┌─ Not accessible via JavaScript                            │
│     ├─ Path: /                                                  │
│     ├─ SameSite: Lax (CSRF protection)                          │
│     └─ HttpOnly: true (XSS protection)                          │
│                                                                  │
│  2. Client Secret (Server-side only)                            │
│     ┌─ Never sent to frontend                                   │
│     ├─ Used only in OAuth callback                              │
│     └─ Stored in environment variables                          │
│                                                                  │
│  3. Token Exchange                                              │
│     ┌─ State parameter prevents CSRF                            │
│     ├─ Authorization code valid only once                       │
│     └─ Verified via server-to-server call                       │
│                                                                  │
│  4. Request Signing                                             │
│     ┌─ OAuth Bearer token required                              │
│     ├─ HTTPS required in production                             │
│     └─ Rate limiting recommended                                │
│                                                                  │
│  5. Database Storage                                            │
│     ┌─ Tokens encrypted at rest (recommended)                   │
│     ├─ Separate from user data                                  │
│     └─ Access logs for audit trail                              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## User Experience Timeline

```
Timeline View:
─────────────────────────────────────────────────────────────────

T=0s    User lands on page
        └─ Status: "Twitter Disconnected" (gray dot)
        └─ Button: "Connect Twitter"

T=1s    Click "Connect Twitter"
        └─ Button changes: "Connecting..." (spinner)
        └─ OAuth popup opens

T=2s    User authenticates in popup
        └─ Popup redirects to callback
        └─ Backend exchanges token
        └─ Token saved to DB & cookie

T=3s    Popup closes
        └─ Frontend detects and checks status
        └─ Status updates: "Twitter Connected" (green dot)
        └─ Button: "Disconnect"
        └─ Success message shows

T=4s    User can now post to Twitter
        └─ Compose tweet
        └─ Select platforms
        └─ Click "Post to Selected Platforms"

T=5s    Button shows spinner: "Publishing..."
        └─ Request sent to backend

T=6s    Twitter API receives tweet
        └─ Returns tweet ID & confirmation

T=7s    Success message displayed
        └─ Form clears
        └─ Post appears in history
        └─ Ready for next post

─────────────────────────────────────────────────────────────────
```
