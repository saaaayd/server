const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { logAction } = require('../utils/logger');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role, studentProfile, studentId } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            studentId: role === 'student' ? studentId : undefined,
            studentProfile: role === 'student' ? studentProfile : undefined,
            status: role === 'admin' ? 'approved' : 'pending' // Admins auto-approved (if seeded), students pending
        });

        if (user) {
            // Do NOT generate token here for Pending users.
            // Just return success message.
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                message: 'Registration successful. Please wait for admin approval.'
            });

            await logAction(user.id, 'REGISTER', 'User registered (Pending Approval)', req);

        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {

            if (user.role !== 'admin' && user.status === 'pending') {
                return res.status(403).json({ message: 'Account is pending approval. Please wait for admin confirmation.' });
            }

            if (user.role !== 'admin' && user.status === 'rejected') {
                return res.status(403).json({ message: 'Account has been rejected. Contact admin.' });
            }

            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user.id),
            });

            await logAction(user.id, 'LOGIN', 'User logged in', req);
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    const { _id, name, email, role, studentProfile, status } = await User.findById(req.user.id);

    res.status(200).json({
        id: _id,
        name,
        email,
        role,
        studentProfile,
        status
    });
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        // If password is being updated
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        // Allow updating specific student profile fields if they exist
        if (req.body.studentProfile && user.studentProfile) {
            user.studentProfile.phoneNumber = req.body.studentProfile.phoneNumber || user.studentProfile.phoneNumber;
            user.studentProfile.emergencyContactName = req.body.studentProfile.emergencyContactName || user.studentProfile.emergencyContactName;
            user.studentProfile.emergencyContactPhone = req.body.studentProfile.emergencyContactPhone || user.studentProfile.emergencyContactPhone;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            token: generateToken(updatedUser.id), // Re-issue token if needed (optional)
            studentProfile: updatedUser.studentProfile
        });

        await logAction(updatedUser.id, 'UPDATE_PROFILE', 'User updated profile', req);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Google Login
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { name, email, picture } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (!user) {
            // Create a new user if one doesn't exist
            // Generate a random password since they login via Google
            const password = Math.random().toString(36).slice(-8);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            user = await User.create({
                name,
                email,
                password: hashedPassword,
                role: 'student', // Default role for NEW Google users
                status: 'pending',
                studentProfile: {
                    status: 'inactive' // Will be effectively inactive if user status is pending, but prepared
                }
            });

            await logAction(user.id, 'REGISTER_GOOGLE', 'User registered via Google (Pending Approval)', req);

            return res.status(201).json({
                message: 'Registration successful. Please wait for admin approval.',
                status: 'pending'
            });
        }

        // Allow Admins to bypass pending/rejected checks
        if (user.role !== 'admin') {
            if (user.status === 'pending') {
                return res.status(403).json({
                    message: 'Account is pending approval. Please wait for admin confirmation.',
                    code: 'PENDING_APPROVAL'
                });
            }

            if (user.status === 'rejected') {
                return res.status(403).json({ message: 'Account has been rejected. Contact admin.' });
            }
        }

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id),
        });

        // Log Google login
        await logAction(user.id, 'LOGIN_GOOGLE', 'User logged in via Google', req);
    } catch (error) {
        res.status(400).json({ message: 'Google login failed', error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    googleLogin,
    getMe,
    updateProfile
};
