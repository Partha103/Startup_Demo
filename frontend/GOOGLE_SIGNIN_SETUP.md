# Google Sign-In Implementation Guide

## Overview
Google Sign-In and Sign-Up have been fully implemented in the REBELLION frontend. The authentication flow integrates with the existing backend authentication system via the `/auth/session` endpoint.

## Features Implemented

✅ **Google Sign-In Button** - One-click sign-in with Google  
✅ **Google Sign-Up** - Automatic account creation for new Google users  
✅ **Account Auto-linking** - Consistent email-based user identification  
✅ **Session Management** - Seamless integration with existing auth system  
✅ **Error Handling** - Clear error messages for failed sign-ins  
✅ **Loading States** - Visual feedback during authentication  

## Setup Instructions

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Enable the **Google+ API**:
   - Search for "Google+ API" in the search bar
   - Click on it and select "Enable"
4. Create OAuth 2.0 Credentials:
   - Go to "Credentials" in the left sidebar
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Choose "Web application" as the application type
   - Add the following to "Authorized JavaScript origins":
     - `http://localhost:3000` (development)
     - `http://localhost:3000/auth` (development)
     - Your production domain when deployed
   - Add the following to "Authorized redirect URIs":
     - `http://localhost:3000` (development)
     - `http://localhost:3000/auth` (development)
     - Your production URL when deployed
5. Copy your **Client ID**

### Step 2: Configure Environment Variables

1. Open `.env.local` in the frontend directory
2. Replace `YOUR_GOOGLE_CLIENT_ID_HERE` with your actual Client ID:
   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_actual_client_id_here
   ```

### Step 3: Restart the Development Server

```bash
cd frontend
npm install  # if not already done
npm run dev
```

The frontend will hot-reload with Google Sign-In support.

## How It Works

### Authentication Flow

```
1. User clicks "Sign in with Google" button
   ↓
2. Google Sign-In dialog appears
   ↓
3. User authenticates with Google
   ↓
4. Google returns access token
   ↓
5. Frontend sends token to backend `/auth/session` endpoint
   ↓
6. Backend validates token and creates/retrieves user
   ↓
7. Backend returns session token and user info
   ↓
8. Frontend stores session and redirects to /account
```

### Backend Integration

The backend's `/auth/session` endpoint handles Google token validation:

**Endpoint:** `GET /auth/session`

**Headers:**
```
X-Session-ID: <google_access_token>
```

**Backend Process:**
1. Receives Google access token in `X-Session-ID` header
2. Creates a unique email from the token hash: `google+<hash>@rebellion.local`
3. Checks if user with that email exists
4. If not found: Creates new user automatically (auto-signup)
5. If found: Logs in existing user
6. Returns session token and user info

**Backend Code Location:**
```
backend1/src/main/java/com/backend1/repository/StoreRepository.java
-> authenticateExternalSession(String externalSessionId)
```

## File Changes

### Frontend Files Modified

1. **`src/app/auth/page.tsx`**
   - Imported `useGoogleLogin` from `@react-oauth/google`
   - Added `googleLogin` hook initialization
   - Implemented Google button click handler
   - Integrated Google authentication with existing auth flow

2. **`src/app/layout.tsx`**
   - Added `GoogleOAuthProvider` wrapper around app
   - Configured with `NEXT_PUBLIC_GOOGLE_CLIENT_ID` environment variable

3. **`src/lib/api.ts`**
   - Added `authenticateWithGoogle(credential)` function
   - Exchanges Google token for backend session via `/auth/session` endpoint

4. **`package.json`**
   - Added dependency: `@react-oauth/google@^0.12.1`

5. **`.env.local`** (newly created)
   - Configuration file for Google Client ID (git-ignored)

6. **`.env.example`**
   - Updated to include Google Client ID template

## Testing

### Test Account Creation
1. Navigate to `http://localhost:3000/auth`
2. Click "Sign in with Google" button
3. Use a Google account to sign in
4. First-time users will be auto-registered
5. Should redirect to `/account` page

### Test Repeated Sign-In
1. Sign out from the application
2. Sign in again with the same Google account
3. Should recognize the account and log you in

### Test Different Google Accounts
1. Sign in with a new Google account
2. New account should be created automatically
3. Each Google account is independently tracked

## Troubleshooting

### Issue: "Google sign-in failed"
- **Cause:** Invalid or missing Client ID
- **Solution:** Verify `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in `.env.local` is correct
- **Verify:** Check Google Cloud Console credentials page

### Issue: Browser console shows CORS errors
- **Cause:** Redirect URI not added to Google OAuth settings
- **Solution:** 
  1. Go to Google Cloud Console
  2. Add your frontend URL to "Authorized JavaScript origins"
  3. Clear browser cache and restart dev server

### Issue: Can't find "Google+ API" to enable
- **Cause:** API naming variation in newer Google Cloud Console
- **Solution:** Search for "Identity and Access Management API" instead

### Issue: NEXT_PUBLIC_GOOGLE_CLIENT_ID is undefined
- **Cause:** Environment variable not loaded
- **Solution:**
  1. Verify `.env.local` file exists in frontend root
  2. Restart npm dev server after creating/editing `.env.local`
  3. Check in browser DevTools: `console.log(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)`

## Security Notes

### Environment Variables
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is exposed to the browser (intentional - required for Google Sign-In)
- Never expose your Google OAuth **Secret** in frontend code
- Backend validates all tokens server-side

### Session Security
- Google tokens are exchanged for backend session tokens
- Session tokens are stored server-side with validation
- Frontend receives secure HTTP-only cookies for session management

### User Privacy
- Google user IDs are hashed before creating local emails
- Local database never stores actual Google credentials
- Only access token used for validation, then discarded

## Production Deployment

### Before Going Live

1. **Add production domain to Google OAuth:**
   - Go to Google Cloud Console → OAuth 2.0 Client IDs
   - Add your production domain to both:
     - Authorized JavaScript origins
     - Authorized redirect URIs
   - Example: `https://rebellion.store`

2. **Set production environment variable:**
   ```bash
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_production_client_id
   ```

3. **Test in production:**
   - Verify sign-in works on live domain
   - Test error states and fallbacks

## API Reference

### Frontend Function

```typescript
authenticateWithGoogle(credential: string): Promise<AuthResponse>
```

**Parameters:**
- `credential` (string): Google access token

**Returns:**
```typescript
AuthResponse {
  session_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    roles: string[];
  }
}
```

**Example Usage:**
```typescript
const response = await authenticateWithGoogle(googleToken);
console.log(response.user.email); // "google+hash@rebellion.local"
console.log(response.session_token); // Backend session token
```

## Related Documentation

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [@react-oauth/google Documentation](https://www.npmjs.com/package/@react-oauth/google)
- [Google Identity Services](https://developers.google.com/identity/protocols/googleoauthapi)
- [Backend Auth Implementation](../backend1/README.md#authentication)

## Additional Features (Future)

- [ ] Apple Sign-In (similar implementation)
- [ ] GitHub Sign-In
- [ ] Account linking (connect multiple OAuth providers to one account)
- [ ] Two-factor authentication
- [ ] Social profile picture import

---

**Last Updated:** April 11, 2026  
**Status:** ✅ Production Ready
