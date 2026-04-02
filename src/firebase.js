import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD48J0ze6ELCHI-kXa4xr_vhQcJkF9KGtk",
  authDomain: "crossroads-announcements.firebaseapp.com",
  projectId: "crossroads-announcements",
  storageBucket: "crossroads-announcements.firebasestorage.app",
  messagingSenderId: "574537748006",
  appId: "1:574537748006:web:95ec9aea961f66857860e7",
  measurementId: "G-YBS0VGNN0E"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "crossroads-announcements");

export { db };