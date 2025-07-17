# Baby Tracker

A comprehensive baby tracking application that supports multiple babies and users. Track feeding sessions, diaper changes, sleep patterns, medications, baths, and more for each individual baby.

## Features

- **Multi-Baby Support**: Each user is linked to a specific baby
- **User Registration & Authentication**: Secure user accounts with baby information
- **Comprehensive Tracking**:
  - Breastfeeding sessions (left/right/both breasts)
  - Diaper changes (pee/poo/both)
  - Sleep tracking (bedtime/waketime)
  - Vitamin D administration
  - Bath tracking
  - Belly button cleaning
  - Mom's medication tracking
- **Real-time Status Panel**: Overview of recent activities
- **Data Persistence**: All data is stored locally in JSON format

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd baby-tracker
```

2. Install dependencies for both frontend and backend:

```bash
npm install
cd backend && npm install && cd ..
```

3. Create a `.env` file in the backend directory:

```bash
cd backend
echo "SESSION_SECRET=your-secret-key-here" > .env
echo "INVITATION_CODE=your-invitation-code-here" >> .env
cd ..
```

4. Build the application:

```bash
npm run build
cd backend && npm run build && cd ..
```

5. Start the server:

```bash
cd backend && npm start
```

The application will be available at `http://localhost:3001`

### First Time Setup

1. When you first start the application, a default admin user will be created:

   - Username: `admin`
   - Password: `admin`
   - Baby: "Default Baby"

2. You can either:
   - Use the default admin account
   - Register a new account with your own baby information

### User Registration

1. Click "Need an account? Register" on the login page
2. Fill in:
   - Username (must be unique)
   - Password
   - Baby's name
   - Baby's date of birth
   - Invitation code (provided by the administrator)
3. Click "Register"
4. After successful registration, you'll be redirected to login

**Note**: Registration requires a valid invitation code. Only users with the correct invitation code can create accounts.

### Using the Application

Once logged in, you'll see:

- Your baby's name and date of birth in the header
- A status panel showing recent activities
- Individual tracking sections for different activities

Each user can only see and modify data for their own baby. All data is automatically associated with the logged-in user's baby.

## API Endpoints

### Authentication

- `POST /api/register` - Register a new user and baby
- `POST /api/login` - Login user
- `POST /api/logout` - Logout user
- `GET /api/check-session` - Check authentication status

### Baby Management

- `GET /api/baby` - Get current baby information
- `PUT /api/baby` - Update baby information

### Data Endpoints (all require authentication)

- `GET/POST/PUT/DELETE /api/feedings` - Feeding sessions
- `GET/POST/PUT/DELETE /api/diapers` - Diaper changes
- `GET/POST/PUT/DELETE /api/sleep` - Sleep records
- `GET/POST/PUT/DELETE /api/medications` - Medications
- `GET/POST/PUT/DELETE /api/vitamin-d` - Vitamin D records
- `GET/POST /api/baths` - Bath tracking
- `GET/POST/PUT /api/belly-button` - Belly button cleaning
- `GET /api/status` - Combined status overview

## Data Structure

All data is stored in `backend/data/db.json` with the following structure:

```json
{
  "users": [
    {
      "id": "user-id",
      "username": "username",
      "passwordHash": "hashed-password",
      "babyId": "baby-id",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ],
  "babies": [
    {
      "id": "baby-id",
      "name": "Baby Name",
      "dateOfBirth": "YYYY-MM-DD",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ],
  "feedings": [...],
  "diapers": [...],
  "sleep": [...],
  "medications": [...],
  "vitaminD": [...],
  "baths": [...],
  "bellyButton": [...]
}
```

## Security

- Passwords are hashed using SHA-256
- Sessions are managed with express-session
- All data is filtered by baby ID to ensure users only see their own data
- CSRF protection through session-based authentication
- **Invitation Code System**: Registration is restricted to users with valid invitation codes

### Managing Invitation Codes

To control who can register for your baby tracker:

1. Set the `INVITATION_CODE` environment variable in your `.env` file
2. Share this code only with friends you want to invite
3. To change the code, update the environment variable and restart the server
4. Old invitation codes will no longer work after being changed

**Security Tips**:

- Use a strong, unique invitation code
- Share the code securely (not in public repositories)
- Consider changing the code periodically
- Keep the code separate from your main password

## Development

### Backend Development

```bash
cd backend
npm run dev  # Start with nodemon for auto-reload
```

### Frontend Development

```bash
npm start  # Start React development server
```

## License

This project is licensed under the MIT License.
