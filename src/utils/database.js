import Dexie from "dexie";

const db = new Dexie("CryptoTrackerDB");

// Define the database schema
db.version(1).stores({
  coinLists: "currency",
  coinDetails: "currency",
});

export default db;
