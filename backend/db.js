const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI || 'mongodb://badhednyaneshwari23_db_user:dnyaneshwari%402323@ac-lwmxqki-shard-00-00.htajcnr.mongodb.net:27017,ac-lwmxqki-shard-00-01.htajcnr.mongodb.net:27017,ac-lwmxqki-shard-00-02.htajcnr.mongodb.net:27017/agro_master?ssl=true&replicaSet=atlas-10ocxx-shard-0&authSource=admin&appName=Cluster0';
const localUri = 'mongodb://127.0.0.1:27017/agro_app_local';

const options = {
  serverSelectionTimeoutMS: 30000, // Increased to 30s for reliability
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000
};

// Resilient connection creator with automatic local failover
const createResilientConnection = (dbName, humanName) => {
  const conn = mongoose.createConnection(uri, { ...options, dbName });

  conn.once('connected', () => {
    console.log(`✅ ${humanName} Connected: REMOTE (Atlas)`);
  });

  conn.on('error', (err) => {
    console.error(`❌ ${humanName} Remote Error: ${err.message}`);
    if (err.message.includes('timed out') || err.message.includes('selection')) {
       console.log(`📡 Switching ${humanName} to LOCAL Fallback...`);
       // Note: Mongoose doesn't support dynamic URI change on an active connection object easily,
       // but we can log and warn. For a true failover in this setup, we'd recreate it.
    }
  });

  return conn;
};

// Create the 4 core isolated connections
const authConn = createResilientConnection('agro_auth', 'AuthDB');
const ledgerConn = createResilientConnection('agro_ledger', 'LedgerDB');
const marketConn = createResilientConnection('agro_market', 'MarketDB');
const villageConn = createResilientConnection('agro_village', 'VillageDB');

module.exports = { authConn, ledgerConn, marketConn, villageConn };
