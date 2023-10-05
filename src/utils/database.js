import Dexie from "dexie";

const db = new Dexie("CryptoTrackerDB");

// Define the database schema
db.version(1).stores({
  coinLists: "currency",
  coinDetails: "currency",
  currencyRates: "currency",
});

export default db;
