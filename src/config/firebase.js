const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);

const databaseURL = process.env.FIREBASE_DATABASE_URL
  // || `https://${serviceAccount.project_id}.firebaseio.com`;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: databaseURL
  });
}

const db = admin.database();

module.exports = {
  admin,
  db
};
