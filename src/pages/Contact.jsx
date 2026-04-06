import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const staticStudyToolsLinks = [
  {
    label: "The Church of Jesus Christ of Latter-day Saints",
    url: "https://www.churchofjesuschrist.org/",
  },
  {
    label: "Come, Follow Me",
    url: "https://www.churchofjesuschrist.org/study/come-follow-me",
  },
  {
    label: "Gospel Library",
    url: "https://www.churchofjesuschrist.org/study/lib",
  },
];

const sectionOptions = [
  { value: "ward", label: "Ward" },
  { value: "ysa", label: "YSA" },
  { value: "single-adults", label: "Single Adults (SA)" },
  { value: "study", label: "Study Tools" },
  { value: "family-history", label: "Family History" },
];

const sectionMeta = {
  ward: {
    title: "Ward",
    description: "Ward pages, schedules, cleanup signups, and local resources.",
  },
  ysa: {
    title: "YSA",
    description: "Young single adult pages, events, and resources.",
  },
  "single-adults": {
    title: "Single Adults (SA)",
    description: "Single adult links, groups, signups, and support resources.",
  },
  study: {
    title: "Study Tools",
    description: "Official study tools from The Church of Jesus Christ of Latter-day Saints, plus approved added resources.",
  },
  "family-history": {
    title: "Family History",
    description: "FamilySearch, family history support, and related signup links.",
  },
};

function Contact() {
  const leaders = [
    {
      title: "Executive Secretary",
      name: "Brother Liam Fordham",
      email: "N/A",
      phone: "(317) 473-7801",
      image: "/images/Fordham.jpg",
    },
    {
      title: "Clerk",
      name: "Brother Paul Scholl",
      email: "plusone5272@sbcglobal.net",
      phone: "(317) 908-5272",
      image: "/images/Scholl.png",
    },
    {
      title: "Elders Quorum President",
      name: "Brother Jeffrey Arnold",
      email: "jsarnold85@gmail.com",
      phone: "(317) 874-6847",
      image: "/images/Arnold.jpg",
    },
    {
      title: "Relief Society President",
      name: "Sister Katherine Griesemer",
      email: "kathygriesemer@yahoo.com",
      phone: "(317) 903-7048",
      image: "/images/Griesemer.png",
    },
    {
      title: "Primary President",
      name: "Sister Hannah Bradfield",
      email: "hannah.l.orr@gmail.com",
      phone: "(502) 640-2029",
      image: "/images/Bradfield.jpg",
    },
  ];

  const [approvedLinks, setApprovedLinks] = useState([]);
  const [suggestionForm, setSuggestionForm] = useState({
    sectionId: "ward",
    title: "",
    url: "",
    reason: "",
    submittedBy: "",
  });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const suggestionsRef = collection(db, "linkSuggestions");
    const suggestionsQuery = query(suggestionsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      suggestionsQuery,
      (snapshot) => {
        const items = snapshot.docs
          .map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }))
          .filter((item) => item.status === "approved");

        setApprovedLinks(items);
      },
      (error) => {
        console.error("Error loading approved links:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  function formatPhone(phone) {
    if (!phone) return "Not provided";

    const cleaned = phone.replace(/\D/g, "");

    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }

    return phone;
  }

  function phoneHref(phone) {
    if (!phone) return "#";
    return `tel:${phone.replace(/\D/g, "")}`;
  }

  function handleSuggestionChange(event) {
    const { name, value } = event.target;

    setSuggestionForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function isValidUrl(url) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }

  async function handleSuggestionSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const trimmedTitle = suggestionForm.title.trim();
    const trimmedUrl = suggestionForm.url.trim();
    const trimmedReason = suggestionForm.reason.trim();
    const trimmedSubmittedBy = suggestionForm.submittedBy.trim();

    if (!trimmedTitle || !trimmedUrl || !trimmedReason || !suggestionForm.sectionId) {
      setMessage("Please fill out the section, title, link, and reason fields.");
      setIsSubmitting(false);
      return;
    }

    if (!isValidUrl(trimmedUrl)) {
      setMessage("Please enter a valid full link that starts with http:// or https://.");
      setIsSubmitting(false);
      return;
    }

    try {
      await addDoc(collection(db, "linkSuggestions"), {
        sectionId: suggestionForm.sectionId,
        title: trimmedTitle,
        url: trimmedUrl,
        reason: trimmedReason,
        submittedBy: trimmedSubmittedBy || "Anonymous",
        status: "pending",
        reviewed: false,
        createdAt: serverTimestamp(),
      });

      setMessage("Link suggestion submitted successfully for review.");
      setSuggestionForm({
        sectionId: "ward",
        title: "",
        url: "",
        reason: "",
        submittedBy: "",
      });
    } catch (error) {
      console.error("Error submitting link suggestion:", error);
      setMessage("There was a problem submitting your link suggestion.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const resourceSections = useMemo(() => {
    const sectionIds = ["ward", "ysa", "single-adults", "study", "family-history"];

    return sectionIds.map((sectionId) => {
      const firestoreLinks = approvedLinks
        .filter((item) => item.sectionId === sectionId)
        .map((item) => ({
          id: item.id,
          label: item.title,
          url: item.url,
        }));

      const links =
        sectionId === "study"
          ? [...staticStudyToolsLinks, ...firestoreLinks]
          : firestoreLinks;

      return {
        id: sectionId,
        title: sectionMeta[sectionId].title,
        description: sectionMeta[sectionId].description,
        links,
      };
    });
  }, [approvedLinks]);

  return (
    <section className="contact-page">
      <header className="contact-page__hero">
        <h1>Ward Leadership Moderators</h1>
        <p>
          Contact ward leadership and review approved resources from
          The Church of Jesus Christ of Latter-day Saints in one place.
        </p>
      </header>

      <section className="contact-page__section">
        <div className="contact-page__section-header">
          <h2>Leadership Contacts</h2>
          <p>
            Reach the right leader for scheduling, records, quorum support,
            Primary, or Relief Society needs.
          </p>
        </div>

        <div className="contact-grid">
          {leaders.map((leader) => (
            <article className="contact-card" key={leader.title}>
              <div className="contact-card__image-wrap">
                <img
                  src={leader.image}
                  alt={leader.name}
                  className="contact-card__image"
                  loading="lazy"
                />
              </div>

              <div className="contact-card__body">
                <span className="contact-card__title">{leader.title}</span>
                <h3 className="contact-card__name">{leader.name}</h3>

                <div className="contact-card__details">
                  <p>
                    <strong>Email:</strong>{" "}
                    <a href={`mailto:${leader.email}`}>{leader.email}</a>
                  </p>
                  <p>
                    <strong>Phone:</strong>{" "}
                    <a href={phoneHref(leader.phone)}>
                      {formatPhone(leader.phone)}
                    </a>
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="contact-page__section">
        <div className="contact-page__section-header">
          <h2>Helpful Resource Links</h2>
          <p>
            Browse approved ward, YSA, single adult, study, and family history resources.
          </p>
        </div>

        <div className="resource-section-grid">
          {resourceSections.map((section) => (
            <article className="resource-section-card" key={section.id}>
              <h3 className="resource-section-card__title">{section.title}</h3>
              <p className="resource-section-card__description">
                {section.description}
              </p>

              {section.links.length === 0 ? (
                <p className="resource-section-card__empty">
                  No approved links in this section yet.
                </p>
              ) : (
                <div className="resource-sub-links">
                  {section.links.map((link, index) => (
                    <a
                      key={`${section.id}-${link.label}-${index}`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resource-sub-link"
                    >
                      <span className="resource-sub-link__label">{link.label}</span>
                      <span className="resource-sub-link__url">{link.url}</span>
                    </a>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="contact-page__section">
        <div className="contact-page__section-header">
          <h2>Suggest a Link</h2>
          <p>
            Suggest approved resources for The Church of Jesus Christ of Latter-day Saints,
            ward pages, YSA pages, single adult resources, signup sheets, study tools,
            or family history links.
            <br/>
            <b>All fields are mandatory.</b>
          </p>
        </div>

        <div className="suggestion-box__note">
          <p>Helpful suggestions can include:</p>
          <ul>
            <li>Ward or stake pages.</li>
            <li>YSA resources.</li>
            <li>Single adult resources.</li>
            <li>Signup sheets.</li>
            <li>Church study tools.</li>
            <li>Family history links.</li>
            <li>Socials</li>
          </ul>
        </div>

        <form className="suggestion-box" onSubmit={handleSuggestionSubmit}>
          <label htmlFor="sectionId">
            Link Section
            <select
              id="sectionId"
              name="sectionId"
              value={suggestionForm.sectionId}
              onChange={handleSuggestionChange}
            >
              {sectionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label htmlFor="title">
            Link Title
            <input
              id="title"
              name="title"
              type="text"
              value={suggestionForm.title}
              onChange={handleSuggestionChange}
              placeholder="Example: Ward Building Cleanup Signup"
            />
          </label>

          <label htmlFor="url">
            Link URL
            <input
              id="url"
              name="url"
              type="url"
              value={suggestionForm.url}
              onChange={handleSuggestionChange}
              placeholder="https://..."
            />
          </label>

          <label htmlFor="reason">
            Why is this helpful?
            <textarea
              id="reason"
              name="reason"
              value={suggestionForm.reason}
              onChange={handleSuggestionChange}
              placeholder="Share who this helps and why it should be added."
            />
          </label>

          <label htmlFor="submittedBy">
            Your Name
            <input
              id="submittedBy"
              name="submittedBy"
              type="text"
              value={suggestionForm.submittedBy}
              onChange={handleSuggestionChange}
              placeholder="Bill Smith"
            />
          </label>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Suggestion"}
          </button>
        </form>

        {message && <div className="form-message">{message}</div>}
      </section>
    </section>
  );
}

export default Contact;