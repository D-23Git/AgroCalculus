const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const uri = "mongodb://badhednyaneshwari23_db_user:dnyaneshwari%402323@ac-lwmxqki-shard-00-00.htajcnr.mongodb.net:27017,ac-lwmxqki-shard-00-01.htajcnr.mongodb.net:27017,ac-lwmxqki-shard-00-02.htajcnr.mongodb.net:27017/agro_master?ssl=true&replicaSet=atlas-10ocxx-shard-0&authSource=admin&appName=Cluster0";

const UserSchema = new mongoose.Schema({ role: String, name: String, email: String });

async function check() {
    const conn = await mongoose.createConnection(uri, { dbName: 'agro_auth' });
    const User = conn.model('User', UserSchema);
    const users = await User.find({});
    console.log('ALL USERS IN DB:');
    users.forEach(u => {
        console.log(`- ${u.name} | Role: [${u.role}] | Email: ${u.email}`);
    });
    process.exit(0);
}
check();
