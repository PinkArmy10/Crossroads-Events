import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const staticResourceSections = [
  {
    id: "ward",
    title: "Ward",
    description: "Local ward resources, schedules, and signups.",
    links: [
      {
        label: "Crossroads Ward Page",
        url: "https://local.churchofjesuschrist.org/en/units/us/in/crossroads-ward",
      },
      {
        label: "Building Cleanup Signup Sheet",
        url: "https://example.com/building-cleanup-signup",
      },
    ],
  },
  {
    id: "ysa",
    title: "YSA",
    description: "Young single adult resources and local connections.",
    links: [
      {
        label: "YSA Page",
        url: "https://www.churchofjesuschrist.org/topics/young-single-adults",
      },
      {
        label: "Stake YSA Page",
        url: "https://example.com/stake-ysa",
      },
      {
        label: "Single Adult Resources",
        url: "https://www.churchofjesuschrist.org/topics/single-adults",
      },
    ],
  },
  {
    id: "study",
    title: "Study Tools",
    description: "Church study and gospel learning resources.",
    links: [
      {
        label: "Church of Jesus Christ",
        url: "https://www.churchofjesuschrist.org/",
      },
      {
        label: "Come, Follow Me",
        url: "https://www.churchofjesuschrist.org/study/come-follow-me",
      },
    ],
  },
  {
    id: "family-history",
    title: "Family History",
    description: "Temple and family history tools.",
    links: [
      {
        label: "FamilySearch",
        url: "https://www.familysearch.org/",
      },
      {
        label: "Family History Church Page",
        url: "https://www.churchofjesuschrist.org/topics/family-history",
      },
      {
        label: "Family History Signup Sheet",
        url: "https://example.com/family-history-signup",
      },
    ],
  },
];

const sectionOptions = [
  { value: "ward", label: "Ward" },
  { value: "ysa", label: "YSA / Single Adult" },
  { value: "study", label: "Study Tools" },
  { value: "family-history", label: "Family History" },
];

function Contact() {
  const leaders = [
    {
      title: "Executive Secretary",
      name: "Brother Name Here",
      email: "executivesecretary@example.com",
      phone: "(317) 555-0101",
      image: "https://via.placeholder.com/320x320?text=Executive+Secretary",
    },
    {
      title: "Clerk",
      name: "Brother Name Here",
      email: "clerk@example.com",
      phone: "(317) 555-0102",
      image: "https://via.placeholder.com/320x320?text=Clerk",
    },
    {
      title: "Elders Quorum President",
      name: "Brother Name Here",
      email: "eldersquorum@example.com",
      phone: "(317) 555-0103",
      image: "https://via.placeholder.com/320x320?text=EQ+President",
    },
    {
      title: "Relief Society President",
      name: "Sister Name Here",
      email: "reliefsociety@example.com",
      phone: "(317) 555-0104",
      image: "https://via.placeholder.com/320x320?text=RS+President",
    },
  ];

  const [approvedSuggestions, setApprovedSuggestions] = useState([]);
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

        setApprovedSuggestions(items);
      },
      (error) => {
        console.error("Error loading approved link suggestions:", error);
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

  const resourceSections = staticResourceSections.map((section) => {
    const extraLinks = approvedSuggestions
      .filter((item) => item.sectionId === section.id)
      .map((item) => ({
        label: item.title,
        url: item.url,
        suggested: true,
      }));

    return {
      ...section,
      links: [...section.links, ...extraLinks],
    };
  });

  return (
    <section className="contact-page">
      <header className="contact-page__hero">
        <h1>Contact & Resources</h1>
        <p>Reach ward leadership and open helpful church links from one page.</p>
      </header>

      <section className="contact-page__section">
        <div className="contact-page__section-header">
          <h2>Ward Leadership</h2>
          <p>
            Contact the right person for scheduling, records, quorum support,
            or Relief Society needs.
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
          <h2>Helpful Links</h2>
          <p>
            Resources are grouped so members can quickly find ward, YSA, study,
            and family history links.
          </p>
        </div>

        <div className="resource-section-grid">
          {resourceSections.map((section) => (
            <article className="resource-section-card" key={section.id}>
              <h3 className="resource-section-card__title">{section.title}</h3>
              <p className="resource-section-card__description">
                {section.description}
              </p>

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
            </article>
          ))}
        </div>
      </section>

      <section className="contact-page__section">
        <div className="contact-page__section-header">
          <h2>Suggest a Link</h2>
          <p>
            Know a helpful ward, stake, YSA, or Church resource we should include?
            Send it here for review.
          </p>
        </div>

        <div className="suggestion-box__note">
          <p>Helpful suggestions can include:</p>
          <ul>
            <li>Ward or stake pages.</li>
            <li>YSA or single adult resources.</li>
            <li>Signup sheets.</li>
            <li>Church study tools.</li>
            <li>Family history links.</li>
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
              placeholder="Example: Building Cleanup Signup"
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
              placeholder="Optional"
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