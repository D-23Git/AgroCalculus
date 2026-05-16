const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    mobile: String,
    role: String,
    accountType: String,
    mandiId: String,
    lastLogin: Date
}, { timestamps: true });

const AdminSchema = new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId, name: String, email: String, lastLogin: Date });
const OfficerSchema = new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId, name: String, staffId: String, mandiId: String, lastLogin: Date });
const LoginLogSchema = new mongoose.Schema({ name: String, role: String, timestamp: { type: Date, default: Date.now } });

async function deepRepair() {
    try {
        console.log('Connecting to agro_auth...');
        const conn = await mongoose.createConnection(uri, { dbName: 'agro_auth' });
        
        const User = conn.model('User', UserSchema);
        const Admin = conn.model('Admin', AdminSchema);
        const Officer = conn.model('Officer', OfficerSchema);
        const LoginLog = conn.model('LoginLog', LoginLogSchema);

        const users = await User.find({});
        console.log(`Found ${users.length} users. Processing...`);

        for (let u of users) {
            // 1. Fix Admin
            if (u.email === 'badhednyaneshwari23@gmail.com' || u.email === 'badhednyaneshwari2323@gmail.com') {
                u.name = 'Admin';
                u.role = 'superadmin';
                u.accountType = 'अॅडमिन';
                await u.save();
                await Admin.findOneAndUpdate({ email: u.email }, { userId: u._id, name: 'Admin', email: u.email, lastLogin: new Date() }, { upsert: true });
                console.log(`✅ Fixed Admin: ${u.email}`);
            } 
            // 2. Fix Officers
            else if (u.mandiId || u.role === 'officer') {
                u.role = 'officer';
                u.accountType = 'Mandai Prashak';
                if (!u.name || u.name === 'Farmer' || u.name === '—') u.name = 'मंडी अधिकारी';
                await u.save();
                await Officer.findOneAndUpdate({ userId: u._id }, { userId: u._id, name: u.name, mandiId: u.mandiId, lastLogin: new Date() }, { upsert: true });
                console.log(`✅ Fixed Officer: ${u.name}`);
            }
            // 3. Fix Farmers
            else {
                u.role = 'farmer';
                u.accountType = 'शेतकरी';
                if (!u.name || u.name === 'Farmer' || u.name === '—') u.name = 'शेतकरी युजर';
                await u.save();
                console.log(`✅ Fixed Farmer: ${u.name}`);
            }
        }

        // Force create collections
        await new LoginLog({ name: 'System Repair', role: 'system', timestamp: new Date() }).save();
        console.log('Deep Repair Complete!');
        process.exit(0);
    } catch (err) {
        console.error('Deep Repair Failed:', err);
        process.exit(1);
    }
}

deepRepair();
