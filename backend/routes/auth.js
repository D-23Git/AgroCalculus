const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { authConn } = require('../db');
const UserSchema = require('../models/User');
const router = express.Router();

const User = authConn.model('User', UserSchema);

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

router.post('/send-otp', async (req, res) => {
    const { email, mobile, name } = req.body;
    try {
        const otp = generateOTP();
        let query = email ? { email } : { mobile };
        console.log("🔍 Checking for existing user with query:", query);
        let user = await User.findOne(query);

        if (!user) {
            console.log("🆕 Creating new user for:", query);
            const fakeMobile = email ? `fake_m_${Date.now()}` : mobile;
            const fakeEmail = mobile ? `fake_e_${Date.now()}@agro.com` : email;
            
            user = new User({ 
                email: email || fakeEmail,
                mobile: mobile || fakeMobile,
                name: name || 'Farmer', 
                otp 
            });
        } else {
            console.log("🔄 Updating existing user:", user.email || user.mobile);
            user.otp = otp;
            if (name) user.name = name;
        }

        console.log("👤 Final User Object before save:", { id: user._id, email: user.email, otp: user.otp });
        try {
            await user.save();
            console.log("✅ User saved successfully to AuthDB");
        } catch (saveErr) {
            console.error("❌ Database Save Error:", saveErr.message);
            throw saveErr;
        }

        if (email) {
            console.log(`📧 Attempting to send email to ${email}...`);
            try {
                await transporter.sendMail({
                    from: `"AgroMaster" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: 'AgroMaster लॉगिन ओटीपी',
                    html: `<div style="font-family:sans-serif;padding:20px;border:2px solid #10b981;border-radius:12px;background:#f0fff4;">
                        <h2 style="color:#059669;">🌿 AgroMaster</h2>
                        <p>तुमचा लॉगिन ओटीपी: <b style="font-size:24px;background:white;padding:5px 10px;border-radius:5px;border:1px solid #10b981;">${otp}</b></p>
                    </div>`
                });
                console.log(`📧 OTP sent successfully to ${email}`);
            } catch (mailErr) {
                console.error("⚠️ Email Failed to send, but OTP is generated:", mailErr.message);
                console.log(`🔑 FALLBACK: Your OTP for ${email} is: ${otp} (Check this terminal)`);
            }
        } else {
            console.log(`📱 Mobile OTP for ${mobile} is: ${otp} (Check this terminal)`);
        }
        res.json({ msg: 'OTP processed', checkTerminal: true });
    } catch (err) {
        console.error("❌ Global OTP Error:", err);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

router.post('/verify-otp', async (req, res) => {
    const { email, mobile, otp, name, role } = req.body;
    try {
        let query = email ? { email } : { mobile };
        const user = await User.findOne(query);
        if (!user || !user.otp || String(user.otp) !== String(otp)) {
            return res.status(400).json({ msg: 'Invalid OTP' });
        }
        user.otp = undefined;
        user.lastLogin = new Date();
        if (name) user.name = name;

        // Role & AccountType Logic
        if (user.email === 'badhednyaneshwari23@gmail.com') {
            user.role = 'superadmin';
            user.accountType = 'अॅडमिन';
        } else if (role === 'admin') {
            // If they picked admin but email doesn't match superadmin email
            user.role = 'farmer'; 
            user.accountType = 'शेतकरी';
        } else if (role === 'officer') {
            user.role = 'officer';
            user.accountType = 'Mandai Prashak';
        } else {
            user.role = 'farmer';
            user.accountType = 'शेतकरी';
        }

        await user.save();
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

const auth = require('../middleware/auth');

router.get('/analytics', auth, async (req, res) => {
    try {
        if (req.user.role !== 'superadmin') {
            return res.status(403).json({ msg: 'Access denied. Super Admin only.' });
        }
        const totalUsers = await User.countDocuments();
        const recentLogins = await User.find({ lastLogin: { $exists: true } })
                                       .sort({ lastLogin: -1 })
                                       .limit(10)
                                       .select('name email mobile lastLogin role');
        
        const superAdmins = await User.countDocuments({ role: 'superadmin' });

        res.json({
            totalUsers,
            superAdmins,
            recentLogins
        });
    } catch (err) {
        console.error('Analytics Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
