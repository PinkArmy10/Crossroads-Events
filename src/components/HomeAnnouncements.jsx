import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../firebase";
import AnnouncementSection from "./AnnouncementSection";

function HomeAnnouncements() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const eventsRef = collection(db, "events");
    const eventsQuery = query(eventsRef, orderBy("startDateTime", "asc"));

    const unsubscribe = onSnapshot(
      eventsQuery,
      (snapshot) => {
        const now = new Date();

        const liveEvents = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((event) => {
            if (!event.endDateTime) return false;

            const endOfEventDay = new Date(event.endDateTime);
            endOfEventDay.setHours(23, 59, 59, 999);

            return endOfEventDay > now;
          })
          .sort(
            (a, b) =>
              new Date(a.startDateTime) - new Date(b.startDateTime)
          );

        setEvents(liveEvents);
        setLoading(false);
      },
      (err) => {
        console.error("Error loading events:", err);
        setError("There was a problem loading events.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const now = new Date();
  const oneWeekFromNow = new Date();
  oneWeekFromNow.setDate(now.getDate() + 7);

  const upcomingWeekEvents = events.filter((event) => {
    const endOfEventDay = new Date(event.endDateTime);
    endOfEventDay.setHours(23, 59, 59, 999);

    return endOfEventDay >= now && endOfEventDay <= oneWeekFromNow;
  });

  const futureEvents = events.filter((event) => {
    const endOfEventDay = new Date(event.endDateTime);
    endOfEventDay.setHours(23, 59, 59, 999);

    return endOfEventDay > oneWeekFromNow;
  });

  if (loading) {
    return <p className="announcement-feedback">Loading events...</p>;
  }

  if (error) {
    return <p className="announcement-feedback">{error}</p>;
  }

  return (
    <div className="home-announcements">
      <AnnouncementSection title="Within 7 Days" events={upcomingWeekEvents} />
      <AnnouncementSection title="Future Events" events={futureEvents} />
    </div>
  );
}

export default HomeAnnouncements;