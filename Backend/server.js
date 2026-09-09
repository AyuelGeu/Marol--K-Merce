require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// --- Passport and Session Imports ---
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Import the updated Staff model
const Staff = require('./models/Staff');

// Import your Staff routes here once created
// const staffRoutes = require('./routes/staffRoutes'); 
const authRoutes = require('./routes/authRoutes');

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Session & Passport Middleware ---
app.use(session({
    secret: process.env.SESSION_SECRET || 'a_secure_random_string',
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// --- Google OAuth 2.0 Strategy Configuration ---
passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`
    },
    async(accessToken, refreshToken, profile, done) => {
        try {
            const userEmail = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

            // Check if user exists by either Google ID or Email address
            let existingStaff = await Staff.findOne({
                $or: [
                    { googleId: profile.id },
                    { email: userEmail }
                ]
            });

            if (existingStaff) {
                // Link googleId if the user previously registered via email/password
                if (!existingStaff.googleId) {
                    existingStaff.googleId = profile.id;
                    existingStaff.isVerified = true;
                    await existingStaff.save();
                }
                return done(null, existingStaff);
            } else {
                // User does not exist, create a new record
                const newStaff = await new Staff({
                    googleId: profile.id,
                    email: userEmail,
                    name: profile.displayName,
                    isVerified: true // Google users are inherently verified
                }).save();

                return done(null, newStaff);
            }
        } catch (error) {
            console.error("Error during Google Authentication:", error);
            return done(error, null);
        }
    }
));

// Serialize user ID into the session
passport.serializeUser((user, done) => done(null, user.id));

// Deserialize user from the database using the ID in the session
passport.deserializeUser(async(id, done) => {
    try {
        const user = await Staff.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// --- Database Connection ---
const connectDB = async() => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`[Database] MongoDB Connected successfully on host: ${conn.connection.host}`);
    } catch (error) {
        console.error(`[Database] Connection Error: ${error.message}`);
        process.exit(1);
    }
};

// Initialize connection
connectDB();

// --- API Routes ---
// Mount your staff routes to a specific endpoint path
// app.use('/api/staff', staffRoutes);

// Mount the auth routes to handle login and register requests
app.use('/api/auth', authRoutes);

// --- Google OAuth Routes ---
// Route that sends the user to Google's consent screen
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Route Google redirects back to after successful authentication
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login` }),
    (req, res) => {
        // Redirect user into the React application dashboard upon success
        res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    }
);

// Basic health check route to verify server is up
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Arel Software System API is running...' });
});

// Catch-all route for undefined endpoints
app.use((req, res, next) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// --- Server Initialization ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`[Server] Running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});