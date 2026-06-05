const admin = require('firebase-admin');
const path = require('path');

const credentialsPath = path.join(__dirname, 'firebase-credentials.json');
const serviceAccount = require(credentialsPath);

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
