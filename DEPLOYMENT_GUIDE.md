# EdTech Platform - Production Deployment Guide

## ✅ Production-Ready Improvements Implemented

### Backend Enhancements
- ✅ **Input Validation**: Email format validation, password strength validation (min 6 chars)
- ✅ **Improved Error Handling**: Specific error messages (email not found vs wrong password)
- ✅ **Flexible CORS Configuration**: Support for production domain via `FRONTEND_URL` env var
- ✅ **Request Size Limits**: Max 10MB for JSON payloads
- ✅ **Logging**: Error logging middleware for debugging
- ✅ **404 Handler**: Proper route not found responses
- ✅ **Global Error Handler**: Catches and logs unhandled errors
- ✅ **Token Enhancements**: 7-day expiry instead of 1 hour, includes user name in payload
- ✅ **Test Submission Validation**: Validates test exists and submission data is valid

### Frontend Enhancements
- ✅ **Auth Context**: Centralized authentication state management (no localStorage scattered)
- ✅ **Error States**: All API calls have try-catch and user-friendly error messages
- ✅ **Loading States**: Loading indicators on all async operations
- ✅ **Empty States**: Proper "no data" messages when lists are empty
- ✅ **Form Validation**: Password confirmation, email format, required fields
- ✅ **Submission Confirmation**: Warning before test submission
- ✅ **User Feedback**: Error displays in UI instead of browser alerts
- ✅ **Layout Wrapper**: All pages properly wrapped with navigation
- ✅ **Consistent Navigation**: Logout button in navbar, no manual localStorage access
- ✅ **Progress Indicators**: Shows question progress during test attempt

## 📋 Pre-Deployment Checklist

### 1. Environment Configuration

**Backend (.env)**
```
PORT=5000
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]
JWT_SECRET=[generate-strong-secret] # Use: openssl rand -hex 32
OPENAI_API_KEY=[your-openai-api-key]
FRONTEND_URL=https://yourdomain.com  # IMPORTANT: Add your production domain
```

**Frontend (.env)**
```
VITE_API_BASE=https://your-backend-domain.com # IMPORTANT: Update to production backend URL
```

### 2. Database Setup

Run the following SQL to initialize your database:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tests (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE content_chunks (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_test_id ON submissions(test_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
```

### 3. Security Hardening

**Before Deployment:**

1. **Rotate Secrets**
   ```bash
   # Generate new JWT secret
   openssl rand -hex 32
   
   # Update .env with new values
   ```

2. **Verify No Sensitive Data in Git**
   ```bash
   git log --all -p | grep -i "password\|secret\|key\|token" | head -20
   ```

3. **Update CORS**
   - Ensure `FRONTEND_URL` matches your production domain
   - Remove `localhost` references

4. **Use HTTPS Only**
   - API_BASE should be `https://`
   - Set secure cookies in production

### 4. Database Security

- Use strong password for database user
- Restrict database access by IP if possible
- Enable SSL for database connections (already configured)
- Regular backups automated

### 5. Deployment Steps

#### Option A: Deploy to Render

**Backend:**
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repo
4. Set environment variables in Render dashboard:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `OPENAI_API_KEY`
   - `FRONTEND_URL=https://your-frontend-domain.com`
5. Deploy

**Frontend:**
1. Build: `npm run build`
2. Deploy `dist/` folder to Vercel, Netlify, or static hosting
3. Set `VITE_API_BASE` to your backend API URL
4. Ensure `.env` is in `.gitignore` (already done)

#### Option B: Deploy to Your Own Server

**Backend:**
```bash
# SSH into server
ssh user@server.com

# Install dependencies
cd /var/www/edtech-backend
npm install --production

# Create .env file with production values
vi .env

# Start with PM2 or systemd
pm2 start src/server.js --name "edtech-api"
# or
sudo systemctl start edtech-backend
```

**Frontend:**
```bash
# Build locally or on server
npm run build

# Deploy dist folder using nginx
sudo cp -r dist/* /var/www/edtech-frontend/

# Update nginx config
sudo systemctl reload nginx
```

### 6. Testing Before Production

- [ ] Test login/register flow
- [ ] Test test taking and submission
- [ ] Test analytics loading
- [ ] Test AI tutor (if enabled)
- [ ] Test admin dashboard
- [ ] Load test with multiple users
- [ ] Test error scenarios (wrong email, wrong password, etc.)
- [ ] Verify CORS is working
- [ ] Check browser console for errors
- [ ] Test on mobile devices

### 7. Monitoring & Logging

**Backend**: Monitor these in production
```javascript
// Already implemented
- DB connection errors
- API errors
- Failed authentications
- Invalid submissions
```

**Frontend**: Monitor these
- Network errors
- API timeouts
- Session expirations
- Error boundary issues

### 8. Performance Optimization

**Optional - Future Improvements:**
- [ ] Code splitting for React bundle
- [ ] Image compression
- [ ] CDN for static assets
- [ ] Database query optimization
- [ ] Caching layer (Redis)
- [ ] Rate limiting on API

## 🚀 Post-Deployment

1. **Monitor First 24 Hours**
   - Check error logs
   - Verify analytics are collecting
   - Test all user flows

2. **Set Up Backups**
   - Database backups every 6 hours
   - Test restore procedure

3. **Update DNS**
   - Point domain to your deployment
   - Wait for DNS propagation

4. **SSL Certificate**
   - Obtain SSL cert (LetsEncrypt is free)
   - Set up auto-renewal

## 🆘 Troubleshooting

**Backend won't start:**
- Check DATABASE_URL is valid
- Verify JWT_SECRET is set
- Check port isn't already in use

**Login failing:**
- Verify database tables exist
- Check CORS is configured correctly
- Verify JWT_SECRET matches

**Tests won't load:**
- Ensure test and question data exists in database
- Check API endpoint is accessible
- Verify user has required permissions

**AI Tutor not working:**
- Verify OPENAI_API_KEY is valid
- Check content_chunks table has data
- Run indexing endpoint first

## 📞 Support

If issues arise, check:
1. Server error logs: `pm2 logs` or `/var/log/syslog`
2. Browser console: F12 → Console tab
3. Network tab: F12 → Network tab
4. Verify all environment variables are set correctly

---

**Status**: ✅ Production Ready  
**Last Updated**: March 2026  
**Version**: 1.0.0
