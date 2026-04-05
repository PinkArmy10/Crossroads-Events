import { useEffect, useRef, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import "./Admin.css";

const emptyForm = {
  title: "",
  description: "",
  location: "",
  group: "Ward",
  startDateTime: "",
  endDateTime: "",
  code: "",
  status: "pending",
};

function getEventStatus(event) {
  if (event.status) return event.status;
  if (event.approved === true) return "approved";
  if (event.approved === false) return "pending";
  return "pending";
}

function getStatusLabel(status) {
  const labels = {
    pending: "Pending Approval",
    approved: "Approved",
    rejected: "Rejected",
    needs_changes: "Needs Changes",
  };

  return labels[status] || "Pending Approval";
}

function getStatusClass(status) {
  if (status === "needs_changes") return "needs-changes";
  return status || "pending";
}

function getStatusStyles(status) {
  const styles = {
    pending: {
      backgroundColor: "#fff8dc",
      color: "#8a6500",
      borderColor: "#e5cc7a",
    },
    approved: {
      backgroundColor: "#dff5e4",
      color: "#1f6a38",
      borderColor: "#75bf8a",
    },
    rejected: {
      backgroundColor: "#fde2e2",
      color: "#9b1c1c",
      borderColor: "#dd7c7c",
    },
    needs_changes: {
      backgroundColor: "#e0e7ff",
      color: "#3730a3",
      borderColor: "#9aa5ff",
    },
  };

  return styles[status] || styles.pending;
}

function formatDateTime(dateTimeString) {
  if (!dateTimeString) return "Not provided";

  const date = new Date(dateTimeString);

  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatPhone(phone) {
  if (!phone) return "Not provided";

  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  return phone;
}

function Admin() {
  const { user, profile, logout, isAdmin, isModerator } = useAuth();

  const [pendingEvents, setPendingEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [lookupCode, setLookupCode] = useState("");
  const [lookupMessage, setLookupMessage] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingAllEvents, setLoadingAllEvents] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState(emptyForm);

  const logoutStartedRef = useRef(false);
  const inactivityTimeoutRef = useRef(null);

  useEffect(() => {
    const eventsRef = collection(db, "events");
    const eventsQuery = query(eventsRef, orderBy("startDateTime", "asc"));

    const unsubscribe = onSnapshot(
      eventsQuery,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        const pendingOnly = items.filter(
          (event) => getEventStatus(event) === "pending"
        );

        setPendingEvents(pendingOnly);
        setLoadingPending(false);

        if (isAdmin) {
          setAllEvents(items);
        } else {
          setAllEvents([]);
        }

        setLoadingAllEvents(false);
      },
      (error) => {
        console.error("Error loading events:", error);
        setLoadingPending(false);
        setLoadingAllEvents(false);
      }
    );

    return () => unsubscribe();
  }, [isAdmin]);

  useEffect(() => {
    const safeLogout = async () => {
      if (logoutStartedRef.current) return;
      logoutStartedRef.current = true;

      try {
        await logout();
      } catch (error) {
        console.error("Error logging out:", error);
      }
    };

    const INACTIVITY_LIMIT = 20 * 60 * 1000;

    function resetInactivityTimer() {
      clearTimeout(inactivityTimeoutRef.current);
      inactivityTimeoutRef.current = setTimeout(() => {
        safeLogout();
      }, INACTIVITY_LIMIT);
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        safeLogout();
      } else {
        resetInactivityTimer();
      }
    }

    function handlePageHide() {
      safeLogout();
    }

    const activityEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetInactivityTimer);
    });

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);

    resetInactivityTimer();

    return () => {
      clearTimeout(inactivityTimeoutRef.current);

      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetInactivityTimer);
      });

      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [logout]);

  function loadEventIntoForm(event) {
    setSelectedEvent(event);
    setEditForm({
      title: event.title || "",
      description: event.description || "",
      location: event.location || "",
      group: event.group || "Ward",
      startDateTime: event.startDateTime || "",
      endDateTime: event.endDateTime || "",
      code: event.code || "",
      status: getEventStatus(event),
    });
    setActionMessage("");
  }

  function clearEditor() {
    setSelectedEvent(null);
    setEditForm(emptyForm);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleLookup(event) {
    event.preventDefault();
    setLookupMessage("");
    setActionMessage("");

    const trimmedCode = lookupCode.trim().toUpperCase();

    if (!trimmedCode) {
      setLookupMessage("Enter an event code.");
      return;
    }

    try {
      const eventsRef = collection(db, "events");
      const lookupQuery = query(eventsRef, where("code", "==", trimmedCode));
      const snapshot = await getDocs(lookupQuery);

      if (snapshot.empty) {
        clearEditor();
        setLookupMessage("No event found with that code.");
        return;
      }

      const foundEvent = {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data(),
      };

      loadEventIntoForm(foundEvent);
      setLookupMessage("Event loaded into the editor.");
    } catch (error) {
      console.error("Error looking up event:", error);
      setLookupMessage("There was a problem finding that event.");
    }
  }

  async function handleSave(event) {
    event.preventDefault();

    if (!selectedEvent) return;

    setSaving(true);
    setActionMessage("");

    try {
      const eventRef = doc(db, "events", selectedEvent.id);

      await updateDoc(eventRef, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        location: editForm.location.trim(),
        group: editForm.group,
        startDateTime: editForm.startDateTime,
        endDateTime: editForm.endDateTime,
        code: editForm.code.trim().toUpperCase(),
        status: editForm.status,
        approved: editForm.status === "approved",
        reviewedBy: user?.email || "Unknown reviewer",
        reviewedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSelectedEvent((prev) =>
        prev
          ? {
              ...prev,
              ...editForm,
              approved: editForm.status === "approved",
            }
          : prev
      );

      setActionMessage("Event updated successfully.");
    } catch (error) {
      console.error("Error updating event:", error);
      setActionMessage("There was a problem saving this event.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedEvent || !isAdmin) return;

    const confirmed = window.confirm("Are you sure you want to delete this event?");
    if (!confirmed) return;

    setSaving(true);
    setActionMessage("");

    try {
      await deleteDoc(doc(db, "events", selectedEvent.id));
      clearEditor();
      setActionMessage("Event deleted.");
    } catch (error) {
      console.error("Error deleting event:", error);
      setActionMessage("There was a problem deleting this event.");
    } finally {
      setSaving(false);
    }
  }

  const statusClass = `status-select ${getStatusClass(editForm.status)}`;
  const statusStyle = getStatusStyles(editForm.status);

  return (
    <section className="admin-page">
      <section className="event-form-section">
        <h2>Admin Event Review</h2>

        <p><strong>Signed in as:</strong> {user?.email || "Unknown user"}</p>
        <p><strong>Role:</strong> {profile?.role || "No role found"}</p>

        <p className="admin-section-note">
          {isAdmin
            ? "You can review, edit, approve, reject, request changes, delete events, and access the full event list."
            : isModerator
            ? "You can review, edit, approve, reject, and request changes for pending events."
            : "No staff role found."}
        </p>

        <div className="admin-actions-row">
          <button type="button" className="admin-secondary-btn" onClick={logout}>
            Log Off
          </button>
        </div>
      </section>

      <section className="event-form-section">
        <h3>Find Event by Code</h3>

        <form className="event-form" onSubmit={handleLookup}>
          <label htmlFor="lookupCode">
            Event Code
            <input
              id="lookupCode"
              name="lookupCode"
              type="text"
              value={lookupCode}
              onChange={(event) => setLookupCode(event.target.value.toUpperCase())}
              placeholder="Enter event code"
            />
          </label>

          <button type="submit" className="admin-secondary-btn">
            Load Event
          </button>
        </form>

        {lookupMessage && <div className="form-message">{lookupMessage}</div>}
      </section>

      <section className="event-form-section">
        <h3>Pending Events</h3>
        <p className="admin-section-note">Review pending submissions here.</p>

        {loadingPending ? (
          <p>Loading pending events...</p>
        ) : pendingEvents.length === 0 ? (
          <p>No pending events right now.</p>
        ) : (
          <div className="announcement-grid">
            {pendingEvents.map((event) => {
              const eventStatus = getEventStatus(event);
              return (
                <article key={event.id} className="announcement-card">
                  <div className={`admin-status-strip ${getStatusClass(eventStatus)}`}>
                    {getStatusLabel(eventStatus)}
                  </div>

                  <h4 className="announcement-card__title">
                    {event.title || "Untitled Event"}
                  </h4>

                  <div className="announcement-card__details">
                    <p><strong>Code:</strong> {event.code || "Not provided"}</p>
                    <p><strong>Group:</strong> {event.group || "Not provided"}</p>
                    <p><strong>When:</strong> {formatDateTime(event.startDateTime)}</p>
                    <p><strong>Where:</strong> {event.location || "Not provided"}</p>
                  </div>

                  <div className="admin-actions-row">
                    <button
                      type="button"
                      className="admin-primary-btn"
                      onClick={() => loadEventIntoForm(event)}
                    >
                      Review Event
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="event-form-section">
        <h3>Event Editor</h3>

        {!selectedEvent ? (
          <p>Select a pending event, search by event code, or use the full event list below if you are an admin.</p>
        ) : (
          <>
            <div className="admin-meta-block">
              <p><strong>Current Status:</strong> {getStatusLabel(editForm.status)}</p>
              <p><strong>Submitted By:</strong> {selectedEvent.postedBy?.name || "Not provided"}</p>
              <p><strong>Email:</strong> {selectedEvent.postedBy?.email || "Not provided"}</p>
              <p><strong>Phone:</strong> {formatPhone(selectedEvent.postedBy?.phone)}</p>
            </div>

            <form className="event-form" onSubmit={handleSave}>
              <label htmlFor="title">
                Event Title
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={editForm.title}
                  onChange={handleChange}
                />
              </label>

              <label htmlFor="group">
                Group
                <select
                  id="group"
                  name="group"
                  value={editForm.group}
                  onChange={handleChange}
                >
                  <option value="Ward">Ward</option>
                  <option value="Elders Quorum">Elders Quorum</option>
                  <option value="Relief Society">Relief Society</option>
                  <option value="Youth">Youth</option>
                  <option value="Primary">Primary</option>
                </select>
              </label>

              <label htmlFor="location">
                Location
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={editForm.location}
                  onChange={handleChange}
                />
              </label>

              <label htmlFor="startDateTime">
                Start Date and Time
                <input
                  id="startDateTime"
                  name="startDateTime"
                  type="datetime-local"
                  value={editForm.startDateTime}
                  onChange={handleChange}
                />
              </label>

              <label htmlFor="endDateTime">
                End Date and Time
                <input
                  id="endDateTime"
                  name="endDateTime"
                  type="datetime-local"
                  value={editForm.endDateTime}
                  onChange={handleChange}
                />
              </label>

              <label htmlFor="code">
                Event Code
                <input
                  id="code"
                  name="code"
                  type="text"
                  value={editForm.code}
                  onChange={handleChange}
                />
              </label>

              <label htmlFor="status">
                Status
                <select
                  id="status"
                  name="status"
                  value={editForm.status}
                  onChange={handleChange}
                  className={statusClass}
                  style={statusStyle}
                >
                  <option value="pending">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </label>

              <label htmlFor="description">
                Description
                <textarea
                  id="description"
                  name="description"
                  value={editForm.description}
                  onChange={handleChange}
                />
              </label>

              {actionMessage && <div className="form-message">{actionMessage}</div>}

              <div className="admin-actions-row">
                <button type="submit" className="admin-primary-btn" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  className="admin-secondary-btn"
                  onClick={clearEditor}
                  disabled={saving}
                >
                  Clear Editor
                </button>

                {isAdmin && (
                  <button
                    type="button"
                    className="admin-danger-btn"
                    onClick={handleDelete}
                    disabled={saving}
                  >
                    Delete Event
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </section>

      {isAdmin && (
        <section className="event-form-section">
          <h3>All Events</h3>
          <p className="admin-section-note">
            This section is visible only to the admin account and shows every event regardless of status.
          </p>

          {loadingAllEvents ? (
            <p>Loading all events...</p>
          ) : allEvents.length === 0 ? (
            <p>No events found.</p>
          ) : (
            <div className="announcement-grid">
              {allEvents.map((event) => {
                const eventStatus = getEventStatus(event);
                return (
                  <article key={event.id} className="announcement-card">
                    <div className={`admin-status-strip ${getStatusClass(eventStatus)}`}>
                      {getStatusLabel(eventStatus)}
                    </div>

                    <h4 className="announcement-card__title">
                      {event.title || "Untitled Event"}
                    </h4>

                    <div className="announcement-card__details">
                      <p><strong>Code:</strong> {event.code || "Not provided"}</p>
                      <p><strong>Group:</strong> {event.group || "Not provided"}</p>
                      <p><strong>When:</strong> {formatDateTime(event.startDateTime)}</p>
                      <p><strong>Where:</strong> {event.location || "Not provided"}</p>
                    </div>

                    <div className="admin-actions-row">
                      <button
                        type="button"
                        className="admin-primary-btn"
                        onClick={() => loadEventIntoForm(event)}
                      >
                        Open Event
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}
    </section>
  );
}

export default Admin;