# Email Verification Implementation Guide

## Overview
Complete email verification system has been implemented across your authentication flows. Users must verify their email before accessing dashboards.

## What Was Implemented

### Frontend Files Created/Modified:

1. **`utils/emailVerification.js`** (NEW)
   - `sendVerificationEmail(user)` - Sends Firebase verification email with custom link
   - `checkVerificationStatus()` - Checks if user's email is verified
   - `resendVerificationEmail()` - Resend verification email with countdown
   - `isEmailVerified()` - Promise-based verification check

2. **`components/EmailVerificationModal.jsx`** (NEW)
   - Modal that displays while waiting for email verification
   - Shows auto-checking status (polls every 3 seconds)
   - Resend email with 60-second countdown
   - Auto-closes and redirects when email is verified

3. **`components/ProtectedRoute.jsx`** (NEW)
   - Wrapper component for routes that require email verification
   - Redirects to login if not authenticated
   - Shows verification modal if email not verified
   - Usage: `<ProtectedRoute><Dashboard /></ProtectedRoute>`

4. **`pages/auth/UserSignup.jsx`** (MODIFIED)
   - Sends verification email after signup
   - Shows verification modal before allowing access to donor registration
   - Stores `emailVerified: false` in database

5. **`pages/auth/UserLogin.jsx`** (MODIFIED)
   - Checks email verification status on login
   - If not verified, shows verification modal instead of redirecting to dashboard
   - Updates `emailVerified` status in database

6. **`pages/auth/AdminLogin.jsx`** (MODIFIED)
   - Same verification checks as UserLogin
   - Blocks admin dashboard access until email is verified

### Backend Changes:

1. **`routes/auth.py`** - New/Modified Routes:
   - `/register` (POST) - Now accepts and stores `emailVerified` field
   - `/me` (GET) - Returns `emailVerified` status in user profile
   - `/verify-email` (POST) - Mark user email as verified
   - `/check-verification` (GET) - Check if current user's email is verified

2. **`routes/auth.py`** - Updated Database Schema:
   - Added `emailVerified` field to user documents (boolean, default: false)

## How It Works

### Signup Flow:
```
1. User enters email & password
2. Firebase user created
3. Verification email sent automatically
4. Modal appears showing email verification status
5. User clicks link in email
6. Modal auto-detects verification (polling)
7. Modal closes, user can access next step
```

### Login Flow:
```
1. User enters credentials
2. Firebase authentication succeeds
3. System checks if email is verified
4. If verified → Dashboard
5. If not verified → Verification modal shown
6. User clicks link in email to verify
7. Auto-detection closes modal and grants access
```

## How to Use ProtectedRoute Component

Wrap protected pages with the ProtectedRoute component:

```jsx
import ProtectedRoute from '../components/ProtectedRoute'
import Dashboard from './Dashboard'

// In your router config:
<Route 
  path="/dashboard/user" 
  element={
    <ProtectedRoute requireEmailVerification={true}>
      <UserDashboard />
    </ProtectedRoute>
  }
/>

// Without verification requirement:
<Route 
  path="/some-page" 
  element={
    <ProtectedRoute requireEmailVerification={false}>
      <SomePage />
    </ProtectedRoute>
  }
/>
```

## Email Verification Link

The verification email will contain a link to:
```
https://yourwebsite.com/verify-email?mode=verifyEmail&oobCode=...
```

This is handled automatically by Firebase. Users click the link and their email is marked as verified.

## Database Schema Update

User documents now include:
```javascript
{
  uid: "string",
  email: "string",
  name: "string",
  role: "user|admin",
  emailVerified: boolean,      // NEW
  profile_complete: boolean,
  created_at: datetime,
  updated_at: datetime
}
```

## API Endpoints

### Check User Verification Status
```
GET /api/auth/check-verification
Authorization: Bearer {idToken}

Response: { emailVerified: boolean }
```

### Mark Email as Verified
```
POST /api/auth/verify-email
Authorization: Bearer {idToken}

Response: { message: "Email verified successfully", emailVerified: true }
```

### Get User Profile (includes verification status)
```
GET /api/auth/me
Authorization: Bearer {idToken}

Response: { ..., emailVerified: boolean, ... }
```

## Features

✅ Automatic email verification link sending on signup
✅ Email verification check on login
✅ Real-time verification status polling (3-second interval)
✅ Resend email with rate limiting (60-second countdown)
✅ Auto-detection and redirect after verification
✅ Database persistence of verification status
✅ Google OAuth support (auto-verified since Google accounts are trusted)
✅ Protected route component for easy protection
✅ Mobile-friendly verification modal
✅ Responsive UI with clear messaging

## Customization

### Change Email Verification Link URL
Edit `utils/emailVerification.js`:
```javascript
await sendEmailVerification(user, {
  url: `${window.location.origin}/verify-email`,  // Change this
  handleCodeInApp: true,
});
```

### Change Polling Interval
Edit `components/EmailVerificationModal.jsx`:
```javascript
const interval = setInterval(poll, 3000) // Change from 3000ms to desired value
```

### Change Resend Countdown
Edit `components/EmailVerificationModal.jsx`:
```javascript
setResendCountdown(60) // Change from 60 seconds to desired value
```

## Notes

- Google OAuth users are considered auto-verified (Google handles verification)
- Verification status is checked every 3 seconds in the modal
- Users can close the modal and manually verify later (modal won't block forever)
- Firebase handles all email sending and link generation
- No additional email service configuration needed

## Troubleshooting

### Users not receiving emails:
1. Check email isn't in spam folder
2. Verify Firebase email is properly configured
3. Check Firebase Console > Authentication > Email Templates

### Modal not closing after verification:
1. Ensure user actually clicked the link in the email
2. Check browser console for errors
3. Verify Firebase project ID matches in config

### Database not updating verification status:
1. Ensure MongoDB has write permissions
2. Check backend logs for any update errors
3. Verify the user UID matches between Firebase and MongoDB
