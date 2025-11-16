# Twitter Integration - Deployment Checklist

## Pre-Deployment Checklist

### Development Environment
- [x] Code compiles without errors
- [x] API routes created and tested
- [x] Frontend component updated
- [x] Database schema created
- [ ] Test with actual Twitter credentials
- [ ] Test error scenarios
- [ ] Test on multiple browsers

### Twitter Setup
- [ ] Create Twitter Developer Account
- [ ] Create Twitter App
- [ ] Enable OAuth 2.0
- [ ] Add redirect URI: `http://localhost:3000/api/auth/twitter/callback`
- [ ] Copy API Key & Secret
- [ ] Configure app permissions (tweet.read, tweet.write, users.read, offline.access)

### Local Testing
- [ ] Install dependencies: `npm install @prisma/client prisma`
- [ ] Create `.env.local` file
- [ ] Add all environment variables
- [ ] Run `npx prisma migrate dev --name init`
- [ ] Run `npm run dev`
- [ ] Test Twitter connection flow
- [ ] Test posting functionality
- [ ] Test disconnection
- [ ] Test error scenarios

### Database
- [x] Schema created
- [ ] Local PostgreSQL running
- [ ] Migrations applied
- [ ] Tables created successfully
- [ ] Test data can be written

## Pre-Production Changes

### Before Deploying to Production

#### 1. HTTPS Configuration
```env
# Production redirect URI must use HTTPS
TWITTER_REDIRECT_URI=https://yourdomain.com/api/auth/twitter/callback
```

#### 2. Cookie Security
In `app/api/auth/twitter/callback/route.ts`, update:
```typescript
// Add Secure flag for HTTPS
"Set-Cookie": `twitter_access_token=${tokenData.access_token}; HttpOnly; Path=/; Secure; SameSite=Lax`
```

#### 3. Environment Variables
Create secrets in your hosting platform:
- TWITTER_CLIENT_ID
- TWITTER_CLIENT_SECRET
- TWITTER_REDIRECT_URI
- DATABASE_URL
- TWITTER_CODE_CHALLENGE (consider rotating)
- TWITTER_CODE_VERIFIER (consider rotating)

#### 4. Implement Token Refresh
- [ ] Add token expiration checking
- [ ] Implement refresh token logic
- [ ] Handle token rotation

#### 5. Update Twitter App Settings
- [ ] Change redirect URI to production domain
- [ ] Update app description/URL
- [ ] Review app permissions
- [ ] Enable rate limiting if needed

#### 6. Add Rate Limiting
```typescript
// Consider adding to /api/auth/twitter/post
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

export const POST = limiter((req) => {
  // Your handler
});
```

#### 7. Implement Proper User Authentication
Replace temp user ID:
```typescript
// OLD (in callback route)
const userId = "temp-user";

// NEW (with authentication)
import { getSession } from "@supabase/auth-helpers-nextjs";
const session = await getSession();
const userId = session?.user?.id;
```

#### 8. Add Error Logging
```typescript
// Add to all API routes
import * as Sentry from "@sentry/nextjs";

try {
  // your code
} catch (err) {
  Sentry.captureException(err);
  // handle error
}
```

#### 9. Database Connection Pool
Update production DATABASE_URL:
```env
# Add connection pooling parameters
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require&connection_limit=5
```

#### 10. Implement Audit Logging
```typescript
// Log all authentication events
await prisma.auditLog.create({
  data: {
    userId,
    action: "TWITTER_CONNECTED",
    timestamp: new Date(),
    ipAddress: req.headers.get("x-forwarded-for"),
  },
});
```

## Hosting Platform Setup

### For Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Configure environment variables
vercel env add TWITTER_CLIENT_ID
vercel env add TWITTER_CLIENT_SECRET
vercel env add TWITTER_REDIRECT_URI
vercel env add DATABASE_URL

# Deploy
vercel --prod
```

### For AWS
- [ ] Set up RDS PostgreSQL
- [ ] Configure Lambda/EC2
- [ ] Set environment variables in Lambda
- [ ] Configure API Gateway
- [ ] Set up CloudFront (optional)

### For Docker
```dockerfile
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

## Production Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] No secrets in code
- [ ] Rate limiting implemented
- [ ] CORS configured properly
- [ ] CSRF protection enabled
- [ ] Input validation added
- [ ] Error messages don't leak info
- [ ] Logging implemented
- [ ] Monitoring set up

## Testing Checklist

### Manual Testing
- [ ] Connect Twitter account
- [ ] Post a tweet
- [ ] Disconnect account
- [ ] Try posting without connection
- [ ] Test with invalid token
- [ ] Test with expired token
- [ ] Test character limits
- [ ] Test media uploads
- [ ] Test all error messages

### Automated Testing
- [ ] Unit tests for API routes
- [ ] Integration tests for OAuth flow
- [ ] E2E tests for user flow
- [ ] Load testing with multiple users
- [ ] Error scenario testing

## Monitoring Setup

### Logs to Monitor
- [ ] OAuth callback errors
- [ ] Token exchange failures
- [ ] Post failures
- [ ] Database errors
- [ ] Rate limiting hits

### Metrics to Track
- [ ] Connection success rate
- [ ] Post success rate
- [ ] Average response time
- [ ] Error rates by type
- [ ] Token refresh frequency

### Alerts to Set Up
- [ ] High error rate (>5%)
- [ ] Service down
- [ ] Slow responses (>2s)
- [ ] Database connection issues
- [ ] Out of quota alerts

## Post-Deployment Monitoring

### Daily Checks
- [ ] All services running
- [ ] No critical errors
- [ ] Connection rate normal
- [ ] Database healthy

### Weekly Checks
- [ ] Review error logs
- [ ] Check token refresh working
- [ ] Verify backup running
- [ ] Update documentation

### Monthly Review
- [ ] Analyze usage patterns
- [ ] Check security logs
- [ ] Update dependencies
- [ ] Review performance metrics

## Rollback Plan

If something goes wrong in production:

1. **Immediate Actions**
   - [ ] Disable Twitter posting via feature flag
   - [ ] Alert team
   - [ ] Check error logs

2. **Investigation**
   - [ ] Check recent changes
   - [ ] Review error patterns
   - [ ] Check Twitter API status

3. **Rollback Steps**
   ```bash
   # Revert to last working version
   git revert <commit>
   npm run build
   vercel --prod
   
   # If database issue
   npx prisma migrate resolve --rolled-back <migration_name>
   ```

4. **Communication**
   - [ ] Notify users if needed
   - [ ] Post status update
   - [ ] Document incident

## Success Metrics

After deployment, measure:
- Connection success rate: **Target >95%**
- Post success rate: **Target >99%**
- Average response time: **Target <500ms**
- Error rate: **Target <1%**
- User satisfaction: **Target >4.5/5**

## Documentation Updates

- [ ] Update README with production info
- [ ] Document API endpoints
- [ ] Create troubleshooting guide
- [ ] Add FAQ section
- [ ] Update deployment docs

## Support & Handoff

- [ ] Create runbook for ops team
- [ ] Document common issues
- [ ] Set up escalation process
- [ ] Schedule training if needed
- [ ] Archive old documentation

---

## Quick Deployment Command

```bash
# Once everything is tested locally

# 1. Ensure all env vars are set
echo $TWITTER_CLIENT_ID

# 2. Push code
git add .
git commit -m "chore: add twitter integration"
git push origin main

# 3. Deploy
# (Platform-specific command)
vercel --prod    # or your deployment command

# 4. Run migrations in production
npx prisma migrate deploy

# 5. Monitor
# Check logs and error tracking service
```

---

**Deployment estimated time: 30-45 minutes**

Need help? See:
- TWITTER_SETUP.md for detailed configuration
- ARCHITECTURE.md for system design
- .env.example for environment variables
