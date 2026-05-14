const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = "mongodb://badhednyaneshwari23_db_user:dnyaneshwari%402323@ac-lwmxqki-shard-00-00.htajcnr.mongodb.net:27017,ac-lwmxqki-shard-00-01.htajcnr.mongodb.net:27017,ac-lwmxqki-shard-00-02.htajcnr.mongodb.net:27017/agro_master?ssl=true&replicaSet=atlas-10ocxx-shard-0&authSource=admin&appName=Cluster0";

const newsConn = mongoose.createConnection(MONGO_URI, { dbName: 'schemes_db' });

const NewsSchema = new mongoose.Schema({
  title: { en: String, mr: String },
  type: { type: String, default: 'scheme' },
  active: { type: Boolean, default: true }
}, { timestamps: true });

const News = newsConn.model('News', NewsSchema);

async function seed() {
    console.log("🌱 Seeding News...");
    const initialNews = [
        { title: { en: "Namo Shetkari 4th installment to be credited soon!", mr: "नमो शेतकरी सन्मान योजनेचा चौथा हप्ता लवकरच जमा होणार!" } },
        { title: { en: "New registrations for PM KUSUM are now open.", mr: "पीएम कुसुम योजनेसाठी नवीन अर्ज नोंदणी सुरू झाली आहे." } },
        { title: { en: "Bhavantar scheme benefits announced for Soybean growers.", mr: "सोयाबीन उत्पादकांसाठी भावांतर योजनेचा लाभ जाहीर." } },
        { title: { en: "New drip irrigation subsidy portal launched.", mr: "ठिबक सिंचन अनुदानासाठी नवीन पोर्टल सुरू झाले आहे." } }
    ];
    
    await News.deleteMany({});
    const inserted = await News.insertMany(initialNews);
    console.log(`✅ Seeded ${inserted.length} news items.`);
    process.exit(0);
}

seed();
