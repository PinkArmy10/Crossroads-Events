import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import {
  cleanPhone,
  isValidPhone,
  nextSaturdays,
  formatSaturday,
  buildTemplateParams,
} from "../utils/cleaningSignup";

const saturdays = nextSaturdays(8);
const NOTIFICATION_EMAIL = "cr.building.cleaning@gmail.com";
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const initialFormData = {
  name: "",
  phone: "",
  cleaningDate: "",
};

function CleaningSignup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

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
    setIsSuccess(false);

    const trimmedName = formData.name.trim();
    const cleanedPhone = cleanPhone(formData.phone);

    if (!trimmedName) {
      setMessage("Please enter your name.");
      setIsSubmitting(false);
      return;
    }

    if (!isValidPhone(formData.phone)) {
      setMessage("Please enter a valid 10-digit phone number.");
      setIsSubmitting(false);
      return;
    }

    if (!formData.cleaningDate) {
      setMessage("Please choose a Saturday to help.");
      setIsSubmitting(false);
      return;
    }

    const chosenDate = new Date(formData.cleaningDate);
    const humanReadableDate = formatSaturday(chosenDate);

    const payload = {
      name: trimmedName,
      phone: cleanedPhone,
      cleaningDate: formData.cleaningDate,
      cleaningDateLabel: humanReadableDate,
      submittedAt: new Date().toISOString(),
    };

    const hasEmailConfig =
      EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY;

    try {
      if (hasEmailConfig) {
        await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          buildTemplateParams(payload, NOTIFICATION_EMAIL),
          { publicKey: EMAILJS_PUBLIC_KEY },
        );
      } else {
        console.warn(
          "[chapel-cleaning signup] EmailJS env vars missing — logging instead.",
        );
        console.log("[chapel-cleaning signup]", {
          ...payload,
          notificationEmail: NOTIFICATION_EMAIL,
        });
      }
    } catch (err) {
      console.error("[chapel-cleaning signup] email send failed", err);
      setMessage(
        "Something went wrong submitting your signup. Please try again or contact us directly.",
      );
      setIsSubmitting(false);
      return;
    }

    setMessage(`Thanks, ${trimmedName}! You're signed up for ${humanReadableDate}.`);
    setIsSuccess(true);
    setFormData(initialFormData);
    setIsSubmitting(false);

    redirectTimerRef.current = setTimeout(() => navigate("/serve"), 3000);
  }

  return (
    <section className="event-form-section">
      <div className="event-form-section__header">
        <h2>Sign Up to Clean the Chapel</h2>
        <p className="event-form-section__intro">
          Pick a Saturday morning and we'll add you to the volunteer list.
          Cleaning starts at 9:00 AM.
        </p>
      </div>

      <form className="event-form" onSubmit={handleSubmit}>
        <label htmlFor="name">
          Name
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </label>

        <label htmlFor="phone">
          Phone
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </label>

        <label htmlFor="cleaningDate">
          Cleaning Date
          <select
            id="cleaningDate"
            name="cleaningDate"
            value={formData.cleaningDate}
            onChange={handleChange}
            required
          >
            <option value="">— Select a Saturday —</option>
            {saturdays.map((date) => (
              <option key={date.toISOString()} value={date.toISOString()}>
                {formatSaturday(date)}
              </option>
            ))}
          </select>
        </label>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Sign Up"}
        </button>

        {message && (
          <div className={`form-message${isSuccess ? " form-message--success" : ""}`}>
            {message}
          </div>
        )}
      </form>
    </section>
  );
}

export default CleaningSignup;
