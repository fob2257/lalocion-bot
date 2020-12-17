const admin = require('firebase-admin');
const serviceAccount = require('../../lalocion-bot-firebase-adminsdk.json');

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FB_DATABASE_URL
});

const appDatabase = app.database();

const refs = {
  movies: appDatabase.ref('movies')
};

module.exports = {
  appDatabase,
  refs
};
