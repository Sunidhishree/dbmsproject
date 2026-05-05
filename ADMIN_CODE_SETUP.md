# Admin Code Verification System

## Overview
A secure admin registration system that requires a valid admin code before allowing new administrators to create accounts and access the admin dashboard.

## Admin Codes (Valid Codes)
```
HP098
HP067
HP214
HP543
HP879
HP302
HP761
HP455
HP128
HP906
```

## What Was Implemented

### Backend Changes

1. **`routes/auth.py` - New Endpoint:**
   - **POST `/api/auth/validate-admin-code`**
     - Accepts: `{ "code": "HP098" }`
     - Returns: `{ "valid": true, "message": "Admin code is valid" }` (200) or `{ "valid": false, "error": "Invalid admin code..." }` (401)
     - No authentication required
     - Case-insensitive code validation (codes are converted to uppercase)

2. **Admin Codes List:**
   - Stored in `backend/routes/auth.py` as `ADMIN_CODES` list
   - Can be updated in the `ADMIN_CODES` variable at the top of the file

### Frontend Changes

1. **`pages/auth/AdminSignup.jsx` (NEW)**
   - Two-step registration process:
     - **Step 1: Code Verification** - User enters admin code
     - **Step 2: Account Creation** - User fills in name, email, password
   - Features:
     - Code input with uppercase conversion
     - Real-time validation via backend
     - Error messages for invalid codes
     - Back button to retry code
     - Email verification after signup
     - Google OAuth signup support
     - Beautiful UI matching your design system

2. **`pages/auth/AdminLogin.jsx` (MODIFIED)**
   - Added link to admin signup page
   - Text: "New admin? Register here"

3. **`App.jsx` (MODIFIED)**
   - Imported `AdminSignup` component
   - Added route: `<Route path="/signup/admin" element={<AdminSignup />} />`

## Registration Flow

```
1. Admin clicks "Register here" on Admin Login page
   ↓
2. Navigate to /signup/admin
   ↓
3. Enter admin code (e.g., HP098)
   ↓
4. Backend validates code via /api/auth/validate-admin-code
   ↓
5. If valid → Show signup form
   If invalid → Show error, allow retry
   ↓
6. Fill in name, email, password
   ↓
7. Create Firebase account
   ↓
8. Send verification email
   ↓
9. Show verification modal
   ↓
10. User verifies email by clicking link
    ↓
11. Auto-redirect to admin dashboard
```

## Usage

### For New Admins
1. Go to `/login/admin`
2. Click "Register here"
3. Enter one of the valid admin codes
4. Complete the signup form
5. Verify email
6. Access admin dashboard

### For Existing Admins
1. Go to `/login/admin`
2. Enter email and password
3. Verify email (if needed)
4. Access admin dashboard

## Security Features

✅ Code validation on backend (not just frontend)
✅ Case-insensitive code handling
✅ Secure code storage in backend (not in frontend code)
✅ Email verification required after signup
✅ Firebase authentication
✅ MongoDB persistence
✅ Protected admin routes

## Customization

### Add or Change Admin Codes

Edit `backend/routes/auth.py`:

```python
ADMIN_CODES = [
    "HP098", "HP067", "HP214",  # existing codes
    "NEW001", "NEW002"           # add new codes here
]
```

Then restart the backend server.

### Change Code Format

The system accepts any format. To customize:
- Codes are case-insensitive
- Input is converted to uppercase
- Can be any alphanumeric format (HP098, NEW001, ABC123, etc.)

### Modify Admin Signup UI

Edit `frontend/src/pages/auth/AdminSignup.jsx`:
- Change input placeholder
- Adjust styling
- Modify validation messages
- Add additional fields (organization name, etc.)

### Update Code Validation Message

Edit the error message in `backend/routes/auth.py`:

```python
return jsonify({
    "valid": False,
    "error": "Your custom error message here"
}), 401
```

## API Reference

### Validate Admin Code
```
POST /api/auth/validate-admin-code
Content-Type: application/json

Request:
{
    "code": "HP098"
}

Response (Success - 200):
{
    "valid": true,
    "message": "Admin code is valid"
}

Response (Failure - 401):
{
    "valid": false,
    "error": "Invalid admin code. Please check and try again."
}
```

## Database

No database changes needed. Admin codes are stored in the backend code, not in MongoDB. When an admin registers, they're stored in the `users` collection with `role: "admin"` and `emailVerified: false` (initially).

## File Structure

```
backend/
  routes/
    auth.py          # Contains ADMIN_CODES list and validation endpoint

frontend/
  src/
    pages/
      auth/
        AdminSignup.jsx    # New two-step signup form
        AdminLogin.jsx     # Updated with signup link
    App.jsx           # Updated with new route
```

## Testing

### Test Valid Code
1. Go to `/signup/admin`
2. Enter "HP098"
3. Click "Verify Code"
4. Should proceed to signup form

### Test Invalid Code
1. Go to `/signup/admin`
2. Enter "INVALID"
3. Click "Verify Code"
4. Should show error: "Invalid admin code. Please check and try again."

### Test Code Case-Insensitivity
1. Go to `/signup/admin`
2. Enter "hp098" (lowercase)
3. Click "Verify Code"
4. Should still work (converted to uppercase)

## Troubleshooting

### "Invalid admin code" error
- Double-check the code spelling (codes are case-insensitive)
- Verify the code is in the `ADMIN_CODES` list in `backend/routes/auth.py`
- Ensure backend server is running

### Signup form doesn't appear after code validation
- Check browser console for errors
- Verify backend response is 200 status
- Check network tab to see API response

### Code endpoint returns error
- Verify backend is running
- Check `VITE_API_URL` environment variable is correct
- Ensure `/api/auth/validate-admin-code` endpoint exists

## Future Enhancements

Possible additions:
- Rate limiting on code validation attempts
- Code expiration dates
- Usage tracking (which code created which admin)
- Multiple code tiers (different permissions)
- Admin code management interface
- Email-based code delivery system
- Two-factor authentication for admins

## Security Notes

- Codes are stored in plaintext in the code - consider hashing if needed
- No rate limiting on code validation - consider adding for production
- Anyone with a code can create an admin account
- Keep codes confidential and only share with trusted people
