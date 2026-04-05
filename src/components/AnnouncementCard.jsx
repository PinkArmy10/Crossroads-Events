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

function getGroupColors(group) {
  const colors = {
    Ward: {
    border: "#4169E1",
    badgeBg: "#DCE7FF",
    badgeText: "#1F4DB8",
    cardBg: "#EEF4FF",
    },

    "Elders Quorum": {
        border: "#334155",
        badgeBg: "#E2E8F0",
        badgeText: "#1E293B",
        cardBg: "#F1F5F9",
        },
    "Relief Society": {
      border: "#C06C84",
      badgeBg: "#F8DCE4",
      badgeText: "#8A3D58",
      cardBg: "#FDF1F5",
    },
    Youth: {
      border: "#2E86AB",
      badgeBg: "#D9EEF7",
      badgeText: "#1D5F7A",
      cardBg: "#EEF8FC",
    },
    Primary: {
      border: "#E3A53F",
      badgeBg: "#FCECCB",
      badgeText: "#8A5A00",
      cardBg: "#FFF8EA",
    },
    default: {
      border: "#64748B",
      badgeBg: "#E2E8F0",
      badgeText: "#334155",
      cardBg: "#F8FAFC",
    },
  };

  return colors[group] || colors.default;
}

function AnnouncementCard({ event }) {
  const groupColors = getGroupColors(event.group);

  return (
    <article
        className="announcement-card"
        style={{
            backgroundColor: groupColors.cardBg,
            borderTop: `6px solid ${groupColors.border}`,
        }}
    >
      <div className="announcement-card__header">
        <span
          className="announcement-card__group"
          style={{
            backgroundColor: groupColors.badgeBg,
            color: groupColors.badgeText,
          }}
        >
          {event.group}
        </span>

        <span
          className={`announcement-card__status ${
            event.approved ? "approved" : "pending"
          }`}
        >
          {event.approved ? "Approved" : "Pending Approval"}
        </span>
      </div>

      <h3 className="announcement-card__title">{event.title}</h3>

      <div className="announcement-card__details">
        <p><strong>Start:</strong> {formatDateTime(event.startDateTime)}</p>
        <p><strong>End:</strong> {formatDateTime(event.endDateTime)}</p>
        <p><strong>Location:</strong> {event.location || "Not provided"}</p>
        <p><strong>Description:</strong> {event.description || "Not provided"}</p>
        <p><strong>Created By:</strong> {event.postedBy?.name || "Not provided"}</p>
        <p><strong>Email:</strong> {event.postedBy?.email || "Not provided"}</p>
        <p><strong>Phone:</strong> {formatPhone(event.postedBy?.phone)}</p>
        <p><strong>Event Code:</strong> {event.code || "Not provided"}</p>
      </div>
    </article>
  );
}

export default AnnouncementCard;