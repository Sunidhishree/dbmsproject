# RitConnect - Blood Donation Platform 🩸

RitConnect is a comprehensive full-stack blood donation platform that connects blood donors with patients in need. Built with React, Flask, Firebase, and MongoDB.

## Features

- **User Authentication**: Firebase email/password authentication with role-based access
- **Donor Registration**: Multi-step registration form with medical questionnaire
- **Blood Request Management**: Create, track, and manage blood requests
- **Admin Dashboard**: Analytics, request management, and donor database querying
- **Real-time Updates**: Auto-refresh for blood requests and status updates
- **Email Notifications**: Welcome emails on successful donor registration
- **Data Analytics**: Charts for blood type distribution, locations, request trends, and status breakdown
- **Advanced Querying**: Filter donors by blood type, location, age, health status, and consent

## Tech Stack

### Frontend
- **React 18.2.0** - UI framework
- **Vite 5.0.0** - Build tool
- **React Router v6** - Client-side routing
- **Tailwind CSS 3.4.0** - Styling
- **Firebase SDK 10.7.0** - Authentication
- **Recharts 2.10.0** - Data visualization

### Backend
- **Flask 2.3.0** - Web framework
- **Flask-CORS 4.0.0** - Cross-origin requests
- **Flask-Mail 0.9.1** - Email notifications
- **PyMongo 4.6.0** - MongoDB driver
- **Firebase Admin SDK 6.2.0** - Token verification
- **Python 3.9+**

### Database & Services
- **MongoDB** - NoSQL database
- **Firebase** - Authentication service
- **Gmail SMTP** - Email service (configurable)

## Prerequisites

- Node.js 16+ and npm
- Python 3.9+
- MongoDB Atlas account
- Firebase project
- Gmail account (for email notifications)

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ritconnect
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file with your credentials
```

**Update `backend/.env` with your credentials:**

```env
# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
FRONTEND_URL=http://localhost:5173

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=ritconnect

# Mail Configuration (Gmail SMTP)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

**Firebase Admin SDK Setup:**
1. Go to Firebase Console → Your Project → Settings (gear icon)
2. Service Accounts tab → "Generate New Private Key"
3. Save as `backend/serviceAccountKey.json`

**Gmail App Password Setup:**
1. Enable 2-Factor Authentication on your Gmail account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Copy the generated password to `MAIL_PASSWORD` in `.env`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file with Firebase config
```

**Update `frontend/.env` with Firebase credentials:**

```env
VITE_API_URL=http://localhost:5000

# Get these from Firebase Console → Your Project → Settings → Your apps
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Get Firebase Credentials:**
1. Firebase Console → Your Project → Settings (gear icon)
2. Your apps → Web app → Copy firebaseConfig object
3. Fill values from the config into the .env file

## Running the Application

### Start Backend Server

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python app.py
```

Backend runs at: `http://localhost:5000`

### Start Frontend Development Server

In a new terminal:

```bash
cd frontend
npm run dev
```

Frontend runs at: `http://localhost:5173`

## Sample Data for Testing

To populate the database with realistic test data, insert the following documents:

### Sample Donors (10 records)

```javascript
// Insert into MongoDB 'donors' collection
[
  {
    "uid": "donor_001",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "age": 28,
    "gender": "Male",
    "blood_type": "O+",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "pin_code": "10001",
    "locality": "Manhattan",
    "weight": 75,
    "hemoglobin": 14.5,
    "diseases": [],
    "smoker": false,
    "alcohol_consumer": false,
    "recent_tattoos": false,
    "last_donation": "2026-03-27T10:30:00Z",
    "consent": true,
    "created_at": "2026-04-27T10:30:00Z"
  },
  {
    "uid": "donor_002",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "9876543211",
    "age": 32,
    "gender": "Female",
    "blood_type": "A+",
    "address": "456 Oak Ave",
    "city": "Los Angeles",
    "state": "CA",
    "pin_code": "90001",
    "locality": "Downtown LA",
    "weight": 65,
    "hemoglobin": 13.2,
    "diseases": [],
    "smoker": false,
    "alcohol_consumer": false,
    "recent_tattoos": false,
    "last_donation": "2026-04-07T10:30:00Z",
    "consent": true,
    "created_at": "2026-04-27T10:30:00Z"
  },
  // ... 8 more donors with varying blood types (B+, AB+, O-, A-, B-, AB-) and locations
]
```

### Sample Blood Requests (5 records)

```javascript
// Insert into MongoDB 'blood_requests' collection
[
  {
    "uid": "donor_001",
    "patient_name": "Patient One",
    "contact_number": "5551234567",
    "blood_type": "O+",
    "units_required": 2,
    "hospital_name": "City General Hospital",
    "hospital_location": "New York",
    "urgency": "Critical",
    "notes": "Emergency surgery required",
    "status": "approved",
    "created_at": "2026-04-27T10:00:00Z",
    "updated_at": "2026-04-27T11:00:00Z"
  },
  {
    "uid": "donor_002",
    "patient_name": "Patient Two",
    "contact_number": "5559876543",
    "blood_type": "A+",
    "units_required": 1,
    "hospital_name": "Los Angeles Medical Center",
    "hospital_location": "Los Angeles",
    "urgency": "High",
    "notes": "Post-surgery recovery",
    "status": "pending",
    "created_at": "2026-04-27T08:00:00Z",
    "updated_at": "2026-04-27T08:00:00Z"
  },
  // ... 3 more blood requests with different statuses and locations
]
```

## Project Structure

```
ritconnect/
├── backend/
│   ├── app.py                      # Flask application entry
│   ├── db.py                       # MongoDB connection
│   ├── mailer.py                   # Email configuration & HTML emails
│   ├── firebase_admin_init.py      # Firebase admin SDK initialization
│   ├── routes/
│   │   ├── auth.py                 # Authentication routes
│   │   ├── donors.py               # Donor management routes
│   │   ├── requests.py             # Blood request routes
│   │   └── admin.py                # Admin analytics & query routes
│   ├── requirements.txt            # Python dependencies
│   ├── .env                        # Environment variables (user-configured)
│   └── serviceAccountKey.json      # Firebase admin key (user-provided)
│
└── frontend/
    ├── src/
    │   ├── App.jsx                 # Main app with router
    │   ├── firebase.js             # Firebase configuration
    │   ├── index.css               # Global Tailwind styles + animations
    │   ├── components/
    │   │   ├── Navbar.jsx          # Persistent navigation with logout
    │   │   ├── BloodCellBackground.jsx  # Animated SVG background
    │   │   └── LoadingSpinner.jsx  # Reusable loading indicator
    │   ├── pages/
    │   │   ├── Landing.jsx         # Home page
    │   │   ├── AuthSelect.jsx      # User/Admin role selection
    │   │   ├── NotFound.jsx        # 404 error page
    │   │   ├── auth/
    │   │   │   ├── UserLogin.jsx
    │   │   │   ├── UserSignup.jsx
    │   │   │   ├── AdminLogin.jsx
    │   │   │   └── AdminSignup.jsx
    │   │   ├── DonorRegister.jsx   # 3-step donor registration form
    │   │   └── dashboard/
    │   │       ├── UserDashboard.jsx    # Donor profile + blood requests
    │   │       └── AdminDashboard.jsx   # Analytics + management + queries
    │   └── index.html
    ├── package.json
    ├── tailwind.config.js          # Custom colors & fonts
    ├── vite.config.js
    ├── .env                        # Firebase & API URL config
    └── .env.example                # Environment variables template
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (Firebase + MongoDB)
- `GET /api/auth/me` - Get current user profile

### Donors
- `POST /api/donors/register` - Register as blood donor
- `GET /api/donors/me` - Get own donor profile
- `GET /api/donors/` - List all donors
- `GET /api/donors/<id>` - Get donor details

### Blood Requests
- `POST /api/requests/create` - Create new blood request
- `GET /api/requests/mine` - Get user's requests
- `GET /api/requests/all` - Get all requests (admin only)
- `PATCH /api/requests/<id>` - Update request status (admin only)

### Admin Analytics
- `GET /api/admin/stats/bloodtypes` - Blood type distribution (pie chart)
- `GET /api/admin/stats/locations` - Donors by location (bar chart)
- `GET /api/admin/stats/requests-over-time` - Request trends (line chart)
- `GET /api/admin/stats/status-breakdown` - Request status distribution (donut)
- `GET /api/admin/areas` - List all unique areas/cities
- `GET /api/admin/query` - Query donors with filters (blood type, area, age, smoker, consent)

## Design System

- **Primary Color**: Crimson Red (#C0152A)
- **Secondary Color**: White (#FFFFFF)
- **Font Header**: Bebas Neue (Google Fonts)
- **Font Body**: System fonts (-apple-system, BlinkMacSystemFont, etc.)
- **Button Style**: 
  - Background: Crimson
  - Hover: Dark Red (#C0152A)
  - Text: White
  - Border Radius: 8px
  - Font Weight: Bold
- **Card Style**: 
  - Background: White
  - Shadow: xl (drop shadow)
  - Border: 2px red-100
  - Border Radius: 16px
- **Animations**: 
  - Floating blood cells with pulse glow effect
  - Smooth transitions (200-300ms)
  - Bounce animation for icons

## Security Features

- ✅ Firebase email/password authentication
- ✅ Token-based authorization (Bearer tokens in Authorization header)
- ✅ Role-based access control (user vs admin)
- ✅ Password validation & confirmation
- ✅ Secure token storage in localStorage
- ✅ CORS configured for development
- ✅ Firebase Admin SDK for server-side token verification

## User Flows

### Donor Registration Flow
1. User visits `/` and clicks "Get Started"
2. Selects "User" role at `/auth-select`
3. Creates account at `/signup/user` → Firebase creates user
4. Redirected to `/register/donor` → Multi-step registration
5. On completion → Redirected to `/dashboard/user` → Welcome email sent
6. Dashboard shows donor profile + blood request form

### Blood Request Flow
1. Donor logs in → Goes to `/dashboard/user`
2. Fills blood request form (patient info, urgency, hospital)
3. Submits → Request saved with "pending" status
4. Auto-refreshes every 30 seconds to show updates
5. Admin approves/rejects → Status updates in real-time

### Admin Dashboard Flow
1. Admin logs in → Directed to `/dashboard/admin`
2. **Tab 1 - Analytics**: Views 4 charts from MongoDB aggregations
3. **Tab 2 - Manage Requests**: Filters & approves/rejects pending requests
4. **Tab 3 - Query Database**: Advanced filters to find specific donors

## Troubleshooting

### MongoDB Connection Issues
```
Error: connect ECONNREFUSED
Solution: Check MONGODB_URI in .env, verify IP whitelist in MongoDB Atlas
```

### Firebase Authentication Failing
```
Error: Failed to register user
Solution: Verify firebaseConfig in frontend/.env, check service account key exists
```

### Email Not Sending
```
Error: SMTP connection timeout
Solution: Verify Gmail App Password (not regular password), enable 2FA on Gmail
```

### CORS Errors
```
Error: Cross-origin request blocked
Solution: Verify FRONTEND_URL in backend/.env, check backend is running on port 5000
```

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Make your changes
3. Test thoroughly
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

MIT License - See LICENSE file for details

## Support

For issues or questions:
- 📧 Email: support@ritconnect.com
- 🐛 Bug Reports: GitHub Issues
- 💡 Feature Requests: GitHub Discussions

---

**Made with ❤️ to save lives, one drop at a time.**

*Every drop counts. Every donor matters. Every life saved is a victory.*

🩸 **RitConnect - Connecting Lives Through Compassion** 🩸

    │   ├── components/
    │   │   ├── Navbar.jsx      # Reusable navbar
    │   │   └── BloodCellBackground.jsx  # Animated blood cell SVG
    │   ├── pages/
    │   │   ├── Landing.jsx     # Hero landing page
    │   │   └── AuthSelect.jsx  # Role selection page
    │   ├── firebase.js         # Firebase config (fill in credentials)
    │   ├── App.jsx             # Main React app
    │   ├── main.jsx            # React DOM entry point
    │   └── index.css           # Global styles with animations
    ├── index.html              # HTML entry point
    ├── package.json            # Node dependencies
    ├── vite.config.js          # Vite configuration
    ├── tailwind.config.js      # Tailwind configuration
    └── .env                    # Frontend environment variables
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure `.env` file with:
   - MongoDB URI (from MongoDB Atlas)
   - SMTP credentials (Gmail or other email provider)
   - Firebase credentials path (optional, for backend verification)

5. Run the Flask server:
   ```bash
   python app.py
   ```
   The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure `.env` file with Firebase credentials:
   - Get your Firebase config from Firebase Console → Project Settings
   - Fill in all the credential fields

4. Run the development server:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

## Features

### Landing Page
- Full viewport hero section with animated crimson red logo ("RitConnect" in Bebas Neue font)
- Animated background with 12 floating blood cells with SVG radial gradients
- Tagline: "Every Drop Saves a Life"
- Call-to-action button to get started

### Authentication Select Page
- Two role cards: Administrator and User
- Each card has Login and Sign Up options
- Same animated blood cell background
- Routes to respective login/signup pages

### Backend Routes

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

#### Donors
- `GET /api/donors` - List all donors
- `GET /api/donors/<donor_id>` - Get donor details
- `POST /api/donors` - Create/update donor profile

#### Blood Requests
- `GET /api/requests` - List all blood requests
- `POST /api/requests` - Create blood request

#### Admin
- `GET /api/admin/dashboard` - Admin dashboard stats
- `PATCH /api/admin/requests/<request_id>/status` - Update request status

## Environment Variables

### Backend (.env)
```
FLASK_ENV=development
FLASK_DEBUG=True
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://...
MONGODB_DB=ritconnect
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=...
MAIL_PASSWORD=...
```

### Frontend (.env)
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_API_URL=http://localhost:5000/api
```

## Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Email/Password authentication
3. Get your config credentials from Project Settings
4. Fill in the credentials in:
   - `frontend/src/firebase.js`
   - `frontend/.env`

## Design Details

- **Primary Color**: Deep Crimson Red (#C0152A)
- **Background**: White (#FFFFFF)
- **Logo Font**: Bebas Neue (Google Fonts) - Weight 900
- **Animations**: Floating and pulsing blood cells with 8-12 second animation cycles
- **Responsive**: Mobile-first design with Tailwind CSS

## Development

To start both servers in development mode:

```bash
# Terminal 1 - Backend
cd backend
python app.py

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Visit `http://localhost:5173` to see the application.

## Future Implementation

Pages to implement:
- `/login/user` - User login
- `/signup/user` - User registration
- `/login/admin` - Admin login
- `/signup/admin` - Admin registration
- `/dashboard/user` - User dashboard
- `/dashboard/admin` - Admin dashboard
- `/donors` - Donor search and listing
- `/requests` - Blood request listing and creation
- `/profile` - User profile page

## Notes

- All API endpoints expect JSON payloads
- CORS is configured to allow requests from the frontend URL
- Firebase credentials should be filled in before running the app
- MongoDB connection is required for the backend to function
