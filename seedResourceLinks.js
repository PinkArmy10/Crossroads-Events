import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD48J0ze6ELCHI-kXa4xr_vhQcJkF9KGtk",
  authDomain: "crossroads-announcements.firebaseapp.com",
  projectId: "crossroads-announcements",
  storageBucket: "crossroads-announcements.firebasestorage.app",
  messagingSenderId: "574537748006",
  appId: "1:574537748006:web:95ec9aea961f66857860e7",
  measurementId: "G-YBS0VGNN0E",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "crossroads-announcements");

const links = [
  {
    sectionId: "ward",
    title: "Crossroads Ward Page",
    url: "https://local.churchofjesuschrist.org/en/units/us/in/crossroads-ward",
    reason: "Official local ward page for announcements and information.",
    submittedBy: "Database Seed",
    status: "approved",
    reviewed: true,
  },
  {
    sectionId: "ysa",
    title: "Indianapolis YSA Branch Page",
    url: "https://sites.google.com/view/indyysabranch/home?authuser=0",
    reason: "Official young single adult resources.",
    submittedBy: "Database Seed",
    status: "approved",
    reviewed: true,
  },
  {
    sectionId: "ysa",
    title: "Stake YSA Page",
    url: "https://pinkarmy10.github.io/Indy-Stake-YSA/#/",
    reason: "Local stake YSA page and calendar.",
    submittedBy: "Database Seed",
    status: "approved",
    reviewed: true,
  },
  {
    sectionId: "family-history",
    title: "FamilySearch",
    url: "https://www.familysearch.org/",
    reason: "Official family history resource.",
    submittedBy: "Database Seed",
    status: "approved",
    reviewed: true,
  },
  {
    sectionId: "family-history",
    title: "Family History Page",
    url: "https://www.churchofjesuschrist.org/topics/family-history",
    reason: "Official Church family history page.",
    submittedBy: "Database Seed",
    status: "approved",
    reviewed: true,
  },
];

async function seedLinks() {
  try {
    for (const link of links) {
      await addDoc(collection(db, "linkSuggestions"), {
        ...link,
        createdAt: serverTimestamp(),
        reviewedAt: serverTimestamp(),
        reviewedBy: "Database Seed",
      });
      console.log(`Added: ${link.title}`);
    }

    console.log("Finished seeding approved resource links.");
  } catch (error) {
    console.error("Error seeding resource links:", error);
  }
}

seedLinks();


// run using: node output/seedResourceLinks.js