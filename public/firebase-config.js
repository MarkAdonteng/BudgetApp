// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDLO6LxCZnYRY0ZZGwQZocEQPIr7GFiShs",
  authDomain: "infotechnexus-47b53.firebaseapp.com",
  projectId: "infotechnexus-47b53",
  storageBucket: "infotechnexus-47b53.firebasestorage.app",
  messagingSenderId: "70691322233",
  appId: "1:70691322233:web:61c491e839e3c94eb497a8",
  measurementId: "G-KF3Z6X8VPF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db }; 