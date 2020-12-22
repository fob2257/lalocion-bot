const admin = require('firebase-admin');
const serviceAccount = require('../../lalocion-bot-firebase-adminsdk.json');

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const appFirestore = app.firestore();

const refs = {
  movies: appFirestore.collection('movies')
};

module.exports = {
  appFirestore,
  refs
};
