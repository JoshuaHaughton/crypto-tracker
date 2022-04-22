// File: lib/firebase.js

import admin from 'firebase-admin'
// import { fireConfig } from './fireConfig'

// var serviceAccount = require("path/to/serviceAccountKey.json");




// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

if (!admin.apps.length) {
  console.log('aaa', process.env.project_id)
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        "projectId": process.env.project_id,
        "private_key": process.env.private_key.replace(/\\n/g, '\n'),
        "clientEmail": process.env.client_email,
      })
    });
    console.log('Initialized.')
  } catch (error) {
    /*
     * We skip the "already exists" message which is
     * not an actual error when we're hot-reloading.
     */
    if (!/already exists/u.test(error.message)) {
      console.error('Firebase admin initialization error', error.stack)
    }
  }

}


export { admin }
