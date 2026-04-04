import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 4; i++) {
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

function AddEventForm() {
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    startDateTime: "",
    endDateTime: "",
    description: "",
    postedByName: "",
    postedByEmail: "",
    postedByPhone: "",
    group: "Ward",
  });

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
        approved: false,
        published: false,
        createdAt: serverTimestamp(),
      });

      setMessage(
        `Event submitted successfully. Your lookup code is ${eventCode}.`
      );

      setFormData({
        title: "",
        location: "",
        startDateTime: "",
        endDateTime: "",
        description: "",
        postedByName: "",
        postedByEmail: "",
        postedByPhone: "",
        group: "Ward",
      });
    } catch (error) {
      console.error("Error adding event:", error);
      setMessage(`There was a problem submitting the event: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="event-form-section">
      <h2>Submit an Event</h2>

      <form className="event-form" onSubmit={handleSubmit}>
        <label>
          Event Title
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Location
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Start Date and Time
          <input
            type="datetime-local"
            name="startDateTime"
            value={formData.startDateTime}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          End Date and Time
          <input
            type="datetime-local"
            name="endDateTime"
            value={formData.endDateTime}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Description
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
            required
          />
        </label>

        <label>
          Posted By
          <input
            type="text"
            name="postedByName"
            value={formData.postedByName}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            name="postedByEmail"
            value={formData.postedByEmail}
            onChange={handleChange}
            autoComplete="email"
            required
          />
        </label>

        <label>
          Phone
          <input
            type="tel"
            name="postedByPhone"
            value={formData.postedByPhone}
            onChange={handleChange}
            autoComplete="tel"
            pattern="[0-9\-\(\)\s\+]{10,20}"
            placeholder="317-555-1234"
            required
          />
        </label>

        <label>
          Group
          <select
            name="group"
            value={formData.group}
            onChange={handleChange}
            required
          >
            <option value="Ward">Ward</option>
            <option value="Elders Quorum">Elders Quorum</option>
            <option value="Relief Society">Relief Society</option>
            <option value="Youth">Youth</option>
            <option value="Primary">Primary</option>
          </select>
        </label>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Event"}
        </button>
      </form>

      {message && <p className="form-message">{message}</p>}
    </section>
  );
}

export default AddEventForm;