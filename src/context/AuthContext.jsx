import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        setUser(firebaseUser);
        setProfile(userSnap.exists() ? userSnap.data() : null);
      } catch (error) {
        console.error("Error loading user profile:", error);
        setUser(firebaseUser);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const timeoutMs = 20 * 60 * 1000;
    let timeoutId;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        signOut(auth);
      }, timeoutMs);
    };

    const events = ["click", "keydown", "mousemove", "scroll", "touchstart"];

    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [user]);


  async function logout() {
    await signOut(auth);
  }

  const value = {
    user,
    profile,
    loading,
    logout,
    isAdmin: profile?.role === "admin",
    isModerator: profile?.role === "moderator",
    isStaff: profile?.role === "admin" || profile?.role === "moderator",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}