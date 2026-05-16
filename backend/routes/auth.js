const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { authConn } = require('../db');
const UserSchema = require('../models/User');
const User = authConn.model('User', UserSchema);
const router = express.Router();

const LoginLogSchema = require('../models/LoginLog');
const LoginLog = authConn.model('LoginLog', LoginLogSchema);

const { AdminSchema, OfficerSchema } = require('../models/RoleModels');
const AdminModel = authConn.model('Admin', AdminSchema);
const OfficerModel = authConn.model('Officer', OfficerSchema);

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
        
        // Force 'Admin' name for the superadmin email
        if (user.email === 'badhednyaneshwari23@gmail.com') {
            user.name = 'Admin';
            user.role = 'superadmin';
            user.accountType = 'अॅडमिन';
        } else {
            if (name) user.name = name;
            // Role & AccountType Logic
            if (role === 'admin') {
                user.role = 'farmer'; 
                user.accountType = 'शेतकरी';
            } else if (role === 'officer') {
                user.role = 'officer';
                user.accountType = 'Mandai Prashak';
            } else {
                user.role = 'farmer';
                user.accountType = 'शेतकरी';
            }
        }

        // 🛡️ SYNC TO SEPARATE ROLE COLLECTIONS
        if (user.role === 'superadmin' || user.email === 'badhednyaneshwari23@gmail.com') {
             user.name = 'Admin'; // Force update
             await AdminModel.findOneAndUpdate(
                { email: user.email },
                { userId: user._id, name: 'Admin', email: user.email, lastLogin: new Date() },
                { upsert: true }
             );
        } else if (user.role === 'officer' || user.mandiId) {
             await OfficerModel.findOneAndUpdate(
                { userId: user._id },
                { userId: user._id, name: user.name, mandiId: user.mandiId, lastLogin: new Date() },
                { upsert: true }
             );
        }

        await user.save();

        // RECORD LOGIN EVENT
        const log = new LoginLog({
            userId: user._id,
            name: user.name,
            role: user.role,
            accountType: user.accountType,
            timestamp: new Date(),
            ip: req.ip,
            userAgent: req.headers['user-agent']
        });
        await log.save();

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

const auth = require('../middleware/auth');

router.get('/analytics', auth, async (req, res) => {
    if (req.user.role !== 'superadmin') {
        return res.status(403).json({ msg: 'Access Denied: Super Admin only' });
    }
    try {
        // ONE-TIME DATA REPAIR: Fix missing roles or incorrect names
        const allUsers = await User.find({});
        for (let u of allUsers) {
            let changed = false;
            if (u.email === 'badhednyaneshwari23@gmail.com') {
                if (u.name !== 'Admin' || u.role !== 'superadmin') {
                    u.name = 'Admin';
                    u.role = 'superadmin';
                    u.accountType = 'अॅडमिन';
                    changed = true;
                }
            } else if (!u.role || u.role === 'farmer') {
                // If they have a mandiId or staffId, they are likely an officer
                if (u.mandiId || u.staffId) {
                    u.role = 'officer';
                    u.accountType = 'Mandai Prashak';
                    if (!u.name || u.name === '—') u.name = 'मंडी अधिकारी';
                } else {
                    u.role = 'farmer';
                    u.accountType = 'शेतकरी';
                    if (!u.name || u.name === 'Farmer' || u.name === '—') u.name = 'शेतकरी';
                }
                changed = true;
            }
            if (changed) await u.save();
        }

        const allUsersRaw = await User.find({}).lean();
        
        console.log(`Analytics: Found ${allUsersRaw.length} total users in DB`);

        // 100% Guaranteed Categorization
        const adminList = [];
        const officerList = [];
        const farmerList = [];

        allUsersRaw.forEach(u => {
            const role = (u.role || '').trim().toLowerCase();
            const email = (u.email || '').toLowerCase();
            
            if (role === 'superadmin' || role === 'admin' || email === 'badhednyaneshwari23@gmail.com' || email === 'badhednyaneshwari2323@gmail.com') {
                adminList.push(u);
            } else if (role === 'officer' || role === 'staff' || u.mandiId || u.staffId) {
                officerList.push(u);
            } else {
                farmerList.push(u);
            }
        });

        // Get the last 50 login events
        const recentActivity = await LoginLog.find({}).sort({ timestamp: -1 }).limit(50).lean();

        res.json({
            totalUsers: allUsersRaw.length,
            superAdmins: adminList.length,
            farmers: farmerList.length,
            officers: officerList.length,
            adminList,
            farmerList,
            officerList,
            recentActivity
        });
    } catch (err) {
        console.error('Analytics Error:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
