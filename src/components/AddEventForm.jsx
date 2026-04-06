import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 4; i += 1) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function cleanPhone(phone) {
  return phone.replace(/\D/g, "");
}

function isValidPhone(phone) {
  return cleanPhone(phone).length === 10;
}

const initialFormData = {
  title: "",
  location: "",
  startDateTime: "",
  endDateTime: "",
  description: "",
  postedByName: "",
  postedByEmail: "",
  postedByPhone: "",
  group: "Ward",
};

function AddEventForm() {
  const [formData, setFormData] = useState(initialFormData);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const trimmedTitle = formData.title.trim();
    const trimmedLocation = formData.location.trim();
    const trimmedDescription = formData.description.trim();
    const trimmedPostedByName = formData.postedByName.trim();
    const trimmedEmail = formData.postedByEmail.trim();
    const trimmedPhone = formData.postedByPhone.trim();
    const cleanedPhone = cleanPhone(trimmedPhone);

    if (!trimmedTitle) {
      setMessage("Please enter an event title.");
      setIsSubmitting(false);
      return;
    }

    if (!trimmedPostedByName) {
      setMessage("Please enter your name.");
      setIsSubmitting(false);
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setMessage("Please enter a valid email address.");
      setIsSubmitting(false);
      return;
    }

    if (!isValidPhone(trimmedPhone)) {
      setMessage("Please enter a valid 10-digit phone number.");
      setIsSubmitting(false);
      return;
    }

    if (!formData.startDateTime || !formData.endDateTime) {
      setMessage("Please enter both the start and end date/time.");
      setIsSubmitting(false);
      return;
    }

    if (new Date(formData.endDateTime) <= new Date(formData.startDateTime)) {
      setMessage("End date and time must be after the start date and time.");
      setIsSubmitting(false);
      return;
    }

    try {
      const eventCode = generateCode();

      await addDoc(collection(db, "events"), {
        code: eventCode,
        title: trimmedTitle,
        location: trimmedLocation,
        startDateTime: formData.startDateTime,
        endDateTime: formData.endDateTime,
        description: trimmedDescription,
        group: formData.group,
        postedBy: {
          name: trimmedPostedByName,
          email: trimmedEmail,
          phone: cleanedPhone,
        },
        status: "pending",
        published: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setMessage(`Event submitted successfully. Your lookup code is ${eventCode}.`);
      setFormData(initialFormData);
    } catch (error) {
      console.error("Error adding event:", error);
      setMessage(`There was a problem submitting the event: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="event-form-section">
      <div className="event-form-section__header">
        <h2>Submit an Event</h2>
        <p className="event-form-section__intro">
          Fill out the form below to send your event for review. New submissions
          are automatically marked as pending approval.
          <br/>
          <b>All fields are required.</b>
        </p>
      </div>

      <form className="event-form" onSubmit={handleSubmit}>
        <label htmlFor="title">
          Event Title
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </label>

        <label htmlFor="group">
          Group
          <select
            id="group"
            name="group"
            value={formData.group}
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
            value={formData.location}
            onChange={handleChange}
            placeholder="Building, room, address, or meeting location"
          />
        </label>

        <label htmlFor="startDateTime">
          Start Date and Time
          <input
            id="startDateTime"
            name="startDateTime"
            type="datetime-local"
            value={formData.startDateTime}
            onChange={handleChange}
            required
          />
        </label>

        <label htmlFor="endDateTime">
          End Date and Time
          <input
            id="endDateTime"
            name="endDateTime"
            type="datetime-local"
            value={formData.endDateTime}
            onChange={handleChange}
            required
          />
        </label>

        <label htmlFor="description">
          Description
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Share event details, schedule, and what attendees should know"
          />
        </label>

        <label htmlFor="postedByName">
          Posted By
          <input
            id="postedByName"
            name="postedByName"
            type="text"
            value={formData.postedByName}
            onChange={handleChange}
            required
          />
        </label>

        <label htmlFor="postedByEmail">
          Email
          <input
            id="postedByEmail"
            name="postedByEmail"
            type="email"
            value={formData.postedByEmail}
            onChange={handleChange}
            required
          />
        </label>

        <label htmlFor="postedByPhone">
          Phone
          <input
            id="postedByPhone"
            name="postedByPhone"
            type="tel"
            value={formData.postedByPhone}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Event"}
        </button>

        {message && <div className="form-message">{message}</div>}
      </form>
    </section>
  );
}

export default AddEventForm;