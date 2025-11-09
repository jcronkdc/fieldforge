# 🔧 Landing Page Troubleshooting Guide

## Quick Fix Steps

### 1. Clear Browser Session
The most common issue is a stuck authentication session. To fix:

1. **Open Browser Console** (F12 or Cmd+Option+I)
2. **Run this command**:
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

### 2. Use Test Pages

We've added debug tools to help identify the issue:

- **http://localhost:5173/test** - Simple test page to verify routing works
- **http://localhost:5173/test-landing.html** - Debug tool with session management
- **http://localhost:5173** - Main landing page

### 3. Check Console Logs

Open browser console (F12) and look for these debug messages:
- `App.tsx: Initializing...`
- `App.tsx: Session check complete`
- `App.tsx: No session, showing landing page`
- `LandingPage: Component rendered`

### 4. Manual Session Clear

If the landing page still redirects to login:

1. Go to **http://localhost:5173/test**
2. Click the **"Clear Session & Reload"** button
3. Navigate back to **http://localhost:5173**

### 5. Incognito/Private Mode

Try opening the site in an incognito/private browser window:
- Chrome: Cmd+Shift+N (Mac) / Ctrl+Shift+N (Windows)
- Safari: Cmd+Shift+N
- Firefox: Cmd+Shift+P (Mac) / Ctrl+Shift+P (Windows)

## What Was The Issue?

The landing page wasn't showing because:
1. **Cached Session**: Browser had a stored Supabase session
2. **Auto-Redirect**: App was redirecting logged-in users to dashboard
3. **Loading State**: App might get stuck in loading state

## Debug Information Added

We've added console logging to track:
- Session initialization
- Auth state changes
- Component rendering
- Route decisions

## Permanent Fix

The app now includes:
- Better session handling
- Debug logging for troubleshooting
- Test pages for verification
- Clear error recovery

## Still Not Working?

If the landing page still doesn't show:

1. **Check Network Tab** in browser console
   - Look for failed requests to Supabase
   - Check for 404 errors on assets

2. **Verify Server is Running**
   ```bash
   ps aux | grep vite
   ```
   
3. **Restart Dev Server**
   ```bash
   pkill -f vite
   cd apps/swipe-feed
   npm run dev
   ```

4. **Check for JavaScript Errors**
   - Open browser console
   - Look for red error messages
   - Share any errors for debugging

## Expected Behavior

When working correctly, you should see:
- **BUILD THE IMPOSSIBLE** heading
- Animated background with floating particles
- Holographic display in center
- Login/Sign Up buttons
- Feature cards at bottom

---

*Debug tools are temporary and can be removed once the issue is resolved.*
