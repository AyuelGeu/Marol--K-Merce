require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken'); // Required for JWT verification

// --- Additional Imports for Social Login ---
const axios = require('axios');
const cookieParser = require('cookie-parser');

// --- Passport and Session Imports ---
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

// Import the updated Staff model
const Staff = require('./models/Staff');

// Import your Staff routes here once created
// const staffRoutes = require('./routes/staffRoutes'); 
const authRoutes = require('./routes/authRoutes');

const app = express();

// --- CRITICAL FIX FOR NGROK ---
// Tells Express to trust the Ngrok proxy so it allows 'secure: true' cookies to be sent over the tunnel.
app.set('trust proxy', 1);

// --- Middleware ---
// Strict CORS configuration to allow Session ID cookies to pass between React and Express
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Added for TikTok CSRF state token

// --- Session & Passport Middleware ---
app.use(session({
    secret: process.env.SESSION_SECRET || 'a_secure_random_string',
    resave: false,
    saveUninitialized: false,
    cookie: {
        // UPDATED: Must be true if your backend is running on an HTTPS URL (like Ngrok). 
        // If testing purely on localhost for both frontend and backend, you may need to switch this to false.
        secure: true,
        httpOnly: true, // Prevents client-side JS from accessing the session cookie
        // UPDATED: 'none' allows the browser to send cookies across different domains (e.g., localhost to ngrok)
        sameSite: 'none'
    }
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
            let existingStaff = await Staff.findOne({ googleId: profile.id });

            if (existingStaff) {
                return done(null, existingStaff);
            } else {
                const newStaff = await new Staff({
                    googleId: profile.id,
                    email: profile.emails[0].value,
                    name: profile.displayName,
                    isVerified: true
                }).save();

                return done(null, newStaff);
            }
        } catch (error) {
            console.error("Error during Google Authentication:", error);
            return done(error, null);
        }
    }
));

// --- Facebook OAuth Strategy Configuration ---
passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL,
        profileFields: ['id', 'displayName', 'emails']
    },
    async(accessToken, refreshToken, profile, done) => {
        try {
            let existingStaff = await Staff.findOne({ facebookId: profile.id });

            if (existingStaff) {
                return done(null, existingStaff);
            } else {
                const newStaff = await new Staff({
                    facebookId: profile.id,
                    email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : '',
                    name: profile.displayName,
                    isVerified: true
                }).save();

                return done(null, newStaff);
            }
        } catch (error) {
            console.error("Error during Facebook Authentication:", error);
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

connectDB();

// --- Double Layer Security Middleware ---
// This middleware intercepts requests and checks for BOTH the Session Cookie and the JWT.
const requireDoubleLayerAuth = (req, res, next) => {
    // 1. Check Layer 1: Is there a valid active server session (cookie)?
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized: Session missing or expired' });
    }

    // 2. Check Layer 2: Is there a valid JWT in the Authorization header?
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: JWT missing' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Ensure the Session User and the JWT User are the same entity
        if (decoded.id !== req.session.userId) {
            return res.status(403).json({ error: 'Forbidden: Token mismatch' });
        }

        // Attach the verified user payload to the request for the route to use
        req.user = decoded;
        next(); // Both layers passed, proceed to the requested route
    } catch (error) {
        return res.status(401).json({ error: 'Unauthorized: Invalid JWT' });
    }
};

// --- API Routes ---
// app.use('/api/staff', staffRoutes);
app.use('/api/auth', authRoutes);

// Endpoint for Dashboard Analytics
// Protected this route with the double layer security middleware
app.get('/api/users', requireDoubleLayerAuth, async(req, res) => {
    try {
        // Fetch users from the Staff model, selecting only name and email for the frontend chart
        const users = await Staff.find({}, 'name email');
        res.status(200).json(users);
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// --- Google OAuth Routes ---
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login` }),
    (req, res) => {
        res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    }
);

// --- Facebook OAuth Routes ---
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: `${process.env.FRONTEND_URL}/login` }),
    (req, res) => {
        res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    }
);

// --- TikTok OAuth Routes (Manual Implementation via Session) ---
app.get('/auth/tiktok', (req, res) => {
    const csrfState = Math.random().toString(36).substring(7);
    res.cookie('csrfState', csrfState, { maxAge: 60000 });

    const url = `https://www.tiktok.com/v2/auth/authorize/?client_key=${process.env.TIKTOK_CLIENT_KEY}&scope=user.info.basic&response_type=code&redirect_uri=${process.env.BACKEND_URL}/auth/tiktok/callback&state=${csrfState}`;
    res.redirect(url);
});

app.get('/auth/tiktok/callback', async(req, res) => {
    const { code } = req.query;

    try {
        // Exchange authorization code for token
        const tokenResponse = await axios.post('https://open.tiktokapis.com/v2/oauth/token/', {
            client_key: process.env.TIKTOK_CLIENT_KEY,
            client_secret: process.env.TIKTOK_CLIENT_SECRET,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: `${process.env.BACKEND_URL}/auth/tiktok/callback`
        }, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

        const accessToken = tokenResponse.data.access_token;

        // Fetch User Profile Data
        const userResponse = await axios.get('https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        const tiktokUser = userResponse.data.data.user;

        // Check if user exists or save to MongoDB
        let existingStaff = await Staff.findOne({ tiktokId: tiktokUser.open_id });

        if (!existingStaff) {
            existingStaff = await new Staff({
                tiktokId: tiktokUser.open_id,
                name: tiktokUser.display_name,
                isVerified: true
            }).save();
        }

        // Establish passport session login manually for TikTok
        req.login(existingStaff, (err) => {
            if (err) throw err;
            res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
        });

    } catch (error) {
        console.error("TikTok Auth Error:", error);
        res.redirect(`${process.env.FRONTEND_URL}/login`);
    }
});

// Basic health check route
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Arel Software System API is running...' });
});

// Catch-all route
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