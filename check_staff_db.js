const { marketConn } = require('./backend/db');
const mongoose = require('mongoose');

const checkStaff = async () => {
    try {
        const collections = await marketConn.db.listCollections().toArray();
        console.log('Collections in agro_market:', collections.map(c => c.name));
        
        // Try to find a staff collection
        const staffColl = collections.find(c => c.name.toLowerCase().includes('staff'));
        if (staffColl) {
            const data = await marketConn.db.collection(staffColl.name).find({}).toArray();
            console.log(`Data in ${staffColl.name}:`, data);
        } else {
            console.log('No staff collection found.');
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
};

setTimeout(checkStaff, 2000); // Wait for connection
