import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC5jTyOd4zKSiyzh8aZd2--M4jOkkdVaLY",
  authDomain: "mobilestart-4f6f1.firebaseapp.com",
  projectId: "mobilestart-4f6f1",
  storageBucket: "mobilestart-4f6f1.firebasestorage.app",
  messagingSenderId: "1001960896093",
  appId: "1:1001960896093:web:085be63261f4f01b66ffb4",
  measurementId: "G-3HRNESZFWK"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
