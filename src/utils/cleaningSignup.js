export function cleanPhone(p) {
  return p.replace(/\D/g, "");
}

export function isValidPhone(p) {
  return cleanPhone(p).length === 10;
}

export function nextSaturdays(count = 8, now = new Date()) {
  const out = [];
  const d = new Date(now);
  d.setHours(9, 0, 0, 0);
  const daysUntilSat = (6 - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + (daysUntilSat === 0 && now.getHours() >= 9 ? 7 : daysUntilSat));
  for (let i = 0; i < count; i += 1) {
    out.push(new Date(d));
    d.setDate(d.getDate() + 7);
  }
  return out;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

export function formatSaturday(date) {
  return dateFormatter.format(date) + " — 9:00 AM";
}

export function buildTemplateParams(payload, notificationEmail) {
  return {
    to_email: notificationEmail,
    name: payload.name,
    phone: payload.phone,
    cleaning_date: payload.cleaningDate,
    cleaning_date_label: payload.cleaningDateLabel ?? payload.cleaningDate,
    submitted_at: payload.submittedAt,
  };
}
