const { marketConn } = require('./backend/db');
const mongoose = require('mongoose');

const dropIndex = async () => {
    try {
        // Wait for connection
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const collections = await marketConn.db.listCollections().toArray();
        if (collections.find(c => c.name === 'mandistaffs')) {
            console.log('Dropping staffId_1 index from mandistaffs...');
            await marketConn.db.collection('mandistaffs').dropIndex('staffId_1').catch(e => console.log('Index staffId_1 not found or already dropped.'));
            console.log('Index dropped successfully (or not found).');
        } else {
            console.log('Collection mandistaffs not found.');
        }
    } catch (e) {
        console.error('Error dropping index:', e);
    } finally {
        process.exit();
    }
};

dropIndex();
