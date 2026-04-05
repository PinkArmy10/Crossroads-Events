import React from "react";

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
      border: "#1D4ED8",
      badgeBg: "#DBEAFE",
      badgeText: "#1E40AF",
      cardBg: "#EFF6FF",
    },
    "Elders Quorum": {
      border: "#334155",
      badgeBg: "#E2E8F0",
      badgeText: "#0F172A",
      cardBg: "#F1F5F9",
    },
    "Relief Society": {
      border: "#BE185D",
      badgeBg: "#FCE7F3",
      badgeText: "#9D174D",
      cardBg: "#FDF2F8",
    },
    Youth: {
      border: "#0F766E",
      badgeBg: "#CCFBF1",
      badgeText: "#115E59",
      cardBg: "#F0FDFA",
    },
    Primary: {
      border: "#D97706",
      badgeBg: "#FEF3C7",
      badgeText: "#92400E",
      cardBg: "#FFFBEB",
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

function getStatusConfig(status, approved) {
  const normalizedStatus = status
    ? status.toLowerCase()
    : approved === true
    ? "approved"
    : "pending";

  const statuses = {
    pending: {
      label: "Pending Approval",
      className: "pending",
    },
    approved: {
      label: "Approved",
      className: "approved",
    },
    rejected: {
      label: "Rejected",
      className: "rejected",
    },
    needs_changes: {
      label: "Needs Changes",
      className: "needs-changes",
    },
  };

  return statuses[normalizedStatus] || statuses.pending;
}

function renderLinkedText(text) {
  if (!text) return "Not provided";

  const regex =
    /(?:https?:\/\/[^\s]+)|(?:www\.[^\s]+)|(?:[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi;

  const matches = [...text.matchAll(regex)];

  if (matches.length === 0) {
    return text;
  }

  const elements = [];
  let lastIndex = 0;

  matches.forEach((match, index) => {
    const matchText = match[0];
    const start = match.index ?? 0;
    const end = start + matchText.length;

    if (start > lastIndex) {
      elements.push(
        <React.Fragment key={`text-${index}`}>
          {text.slice(lastIndex, start)}
        </React.Fragment>
      );
    }

    const isEmail = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(matchText);
    const href = isEmail
      ? `mailto:${matchText}`
      : matchText.startsWith("http://") || matchText.startsWith("https://")
      ? matchText
      : `https://${matchText}`;

    elements.push(
      <a
        key={`link-${index}`}
        href={href}
        target={isEmail ? undefined : "_blank"}
        rel={isEmail ? undefined : "noopener noreferrer"}
        className="announcement-card__link"
      >
        {matchText}
      </a>
    );

    lastIndex = end;
  });

  if (lastIndex < text.length) {
    elements.push(
      <React.Fragment key="text-final">
        {text.slice(lastIndex)}
      </React.Fragment>
    );
  }

  return elements;
}

function renderPhone(phone) {
  if (!phone) return "Not provided";

  const formatted = formatPhone(phone);
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10) {
    return (
      <a href={`tel:${digits}`} className="announcement-card__link">
        {formatted}
      </a>
    );
  }

  return formatted;
}

function AnnouncementCard({ event }) {
  const groupColors = getGroupColors(event.group);
  const statusConfig = getStatusConfig(event.status, event.approved);

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
          {event.group || "General"}
        </span>

        <span
          className={`announcement-card__status ${statusConfig.className}`}
        >
          {statusConfig.label}
        </span>
      </div>

      <h3 className="announcement-card__title">
        {event.title || "Untitled Event"}
      </h3>

      <div className="announcement-card__details">
        <p><strong>Start:</strong> {formatDateTime(event.startDateTime)}</p>
        <p><strong>End:</strong> {formatDateTime(event.endDateTime)}</p>
        <p><strong>Location:</strong> {renderLinkedText(event.location)}</p>
        <p><strong>Description:</strong> {renderLinkedText(event.description)}</p>
        <p><strong>Event Code:</strong> {event.code || "Not provided"}</p>
      </div>
    </article>
  );
}

export default AnnouncementCard;