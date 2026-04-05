import { useEffect, useState } from "react";
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
  group: "",
  contactName: "",
  startDateTime: "",
  endDateTime: "",
  code: "",
  approved: false,
};

function Admin() {
  const { user, profile, logout, isAdmin, isModerator } = useAuth();

  const [pendingEvents, setPendingEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [lookupCode, setLookupCode] = useState("");
  const [lookupMessage, setLookupMessage] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [loadingPending, setLoadingPending] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState(emptyForm);

  useEffect(() => {
    const eventsRef = collection(db, "events");
    const eventsQuery = query(eventsRef, orderBy("startDateTime", "asc"));

    const unsubscribe = onSnapshot(
      eventsQuery,
      (snapshot) => {
        const items = snapshot.docs
          .map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }))
          .filter((event) => !event.approved);

        setPendingEvents(items);
        setLoadingPending(false);
      },
      (error) => {
        console.error("Error loading pending events:", error);
        setLoadingPending(false);
      }
    );

    return () => unsubscribe();
  }, []);

  function loadEventIntoForm(event) {
    setSelectedEvent(event);
    setEditForm({
      title: event.title || "",
      description: event.description || "",
      location: event.location || "",
      group: event.group || "",
      contactName: event.contactName || "",
      startDateTime: event.startDateTime || "",
      endDateTime: event.endDateTime || "",
      code: event.code || "",
      approved: !!event.approved,
    });
    setActionMessage("");
  }

  function clearEditor() {
    setSelectedEvent(null);
    setEditForm(emptyForm);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleLookup(e) {
    e.preventDefault();
    setLookupMessage("");
    setActionMessage("");

    const trimmedCode = lookupCode.trim();

    if (!trimmedCode) {
      setLookupMessage("Enter a 4-digit event code.");
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

      const event = {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data(),
      };

      loadEventIntoForm(event);
      setLookupMessage("Event loaded.");
    } catch (error) {
      console.error("Error looking up event:", error);
      setLookupMessage("There was a problem finding that event.");
    }
  }

  async function handleSave(e) {
    e.preventDefault();

    if (!selectedEvent) return;

    setSaving(true);
    setActionMessage("");

    try {
      const eventRef = doc(db, "events", selectedEvent.id);

      await updateDoc(eventRef, {
        title: editForm.title,
        description: editForm.description,
        location: editForm.location,
        group: editForm.group,
        contactName: editForm.contactName,
        startDateTime: editForm.startDateTime,
        endDateTime: editForm.endDateTime,
        code: editForm.code,
        approved: editForm.approved,
        updatedAt: serverTimestamp(),
      });

      setActionMessage("Event updated successfully.");
    } catch (error) {
      console.error("Error updating event:", error);
      setActionMessage("There was a problem saving this event.");
    } finally {
      setSaving(false);
    }
  }

  async function handleApprove() {
    if (!selectedEvent) return;

    setSaving(true);
    setActionMessage("");

    try {
      const eventRef = doc(db, "events", selectedEvent.id);

      await updateDoc(eventRef, {
        approved: true,
        approvedBy: user.email,
        approvedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setEditForm((prev) => ({
        ...prev,
        approved: true,
      }));

      setActionMessage("Event approved.");
    } catch (error) {
      console.error("Error approving event:", error);
      setActionMessage("There was a problem approving this event.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedEvent || !isAdmin) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );

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

  return (
    <div className="admin-page">
      <section className="event-form-section">
        <h2>Admin Dashboard</h2>

        <div className="admin-meta-block">
          <p><strong>Signed in as:</strong> {user?.email}</p>
          <p><strong>Role:</strong> {profile?.role}</p>
        </div>

        <p className="admin-section-note">
          {isAdmin
            ? "You can approve, edit, and delete events. You will also be able to manage moderator accounts."
            : isModerator
            ? "You can approve and edit events."
            : "No staff role found."}
        </p>

        <div className="admin-actions-row">
          <button onClick={logout} className="admin-secondary-btn">
            Sign Out
          </button>
        </div>
      </section>

      <section className="event-form-section">
        <h2>Find Event by 4-Digit Code</h2>

        <form onSubmit={handleLookup} className="event-form">
          <label>
            Event Code
            <input
              type="text"
              value={lookupCode}
              onChange={(e) => setLookupCode(e.target.value)}
              maxLength={4}
              placeholder="Enter 4-digit code"
            />
          </label>

          <button type="submit" className="admin-primary-btn">
            Find Event
          </button>
        </form>

        {lookupMessage && <p className="form-message">{lookupMessage}</p>}
      </section>

      <section className="event-form-section">
        <h2>Pending Approvals</h2>

        {loadingPending ? (
          <p>Loading pending events...</p>
        ) : pendingEvents.length === 0 ? (
          <p>No pending events right now.</p>
        ) : (
          <div className="announcement-grid">
            {pendingEvents.map((event) => (
              <article key={event.id} className="announcement-card">
                <div className="admin-status-strip pending">Pending Approval</div>

                <h3 className="announcement-card__title">{event.title}</h3>

                <div className="announcement-card__details">
                  <p><strong>Code:</strong> {event.code}</p>
                  <p><strong>Group:</strong> {event.group || "N/A"}</p>
                  <p><strong>When:</strong> {event.startDateTime || "N/A"}</p>
                  <p><strong>Where:</strong> {event.location || "N/A"}</p>
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
            ))}
          </div>
        )}
      </section>

      <section className="event-form-section">
        <h2>Edit Event</h2>

        {!selectedEvent ? (
          <p>Select a pending event or search by 4-digit code.</p>
        ) : (
          <>
            <div className="admin-meta-block">
              <p><strong>Editing Event ID:</strong> {selectedEvent.id}</p>
              <p>
                <strong>Status:</strong>{" "}
                {editForm.approved ? "Approved" : "Pending"}
              </p>
            </div>

            <form onSubmit={handleSave} className="event-form">
              <label>
                Event Code
                <input
                  type="text"
                  name="code"
                  value={editForm.code}
                  onChange={handleChange}
                  maxLength={4}
                />
              </label>

              <label>
                Title
                <input
                  type="text"
                  name="title"
                  value={editForm.title}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Description
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleChange}
                />
              </label>

              <label>
                Location
                <input
                  type="text"
                  name="location"
                  value={editForm.location}
                  onChange={handleChange}
                />
              </label>

              <label>
                Group / Demographic
                <input
                  type="text"
                  name="group"
                  value={editForm.group}
                  onChange={handleChange}
                />
              </label>

              <label>
                Contact Name
                <input
                  type="text"
                  name="contactName"
                  value={editForm.contactName}
                  onChange={handleChange}
                />
              </label>

              <label>
                Start Date & Time
                <input
                  type="datetime-local"
                  name="startDateTime"
                  value={editForm.startDateTime}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                End Date & Time
                <input
                  type="datetime-local"
                  name="endDateTime"
                  value={editForm.endDateTime}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="admin-checkbox-row">
                <input
                  type="checkbox"
                  name="approved"
                  checked={editForm.approved}
                  onChange={handleChange}
                />
                Approved
              </label>

              <div className="admin-actions-row">
                <button
                  type="submit"
                  disabled={saving}
                  className="admin-primary-btn"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                {!editForm.approved && (
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={saving}
                    className="admin-secondary-btn"
                  >
                    Approve Event
                  </button>
                )}

                {isAdmin && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={saving}
                    className="admin-danger-btn"
                  >
                    Delete Event
                  </button>
                )}

                <button
                  type="button"
                  onClick={clearEditor}
                  disabled={saving}
                  className="admin-secondary-btn"
                >
                  Clear Selection
                </button>
              </div>
            </form>
          </>
        )}

        {actionMessage && <p className="form-message">{actionMessage}</p>}
      </section>

      {isAdmin && (
        <section className="event-form-section">
          <h2>Moderator Management</h2>
          <p className="admin-section-note">
            This section is admin-only. The safest next step is to create and
            manage moderator accounts with a Firebase Cloud Function.
          </p>
        </section>
      )}
    </div>
  );
}

export default Admin;