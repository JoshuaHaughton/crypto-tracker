import Dexie from "dexie";

const db = new Dexie("CryptoTrackerDB");

// Define the database schema
db.version(1).stores({
  popularCoinsLists: "currency",
  coinDetails: "currency",
  currencyRates: "currency",
  globalCacheInfo: "key",
});

export default db;
