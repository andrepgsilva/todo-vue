import firebase from 'firebase';
import 'firebase/firestore';
import firebaseConfig from './firebase.config.js';

const firebaseApp = firebase.initializeApp(firebaseConfig);

const firestore = firebaseApp.firestore();
firestore.settings({
    timestampsInSnapshots: true
});


export default firestore;
