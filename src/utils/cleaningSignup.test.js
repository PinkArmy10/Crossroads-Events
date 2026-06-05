// Run with: node --test src/utils/cleaningSignup.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cleanPhone,
  isValidPhone,
  nextSaturdays,
  formatSaturday,
  buildTemplateParams,
} from "./cleaningSignup.js";

test("cleanPhone strips non-digit characters", () => {
  assert.equal(cleanPhone("(555) 123-4567"), "5551234567");
  assert.equal(cleanPhone("+1 555.123.4567"), "15551234567");
  assert.equal(cleanPhone(""), "");
  assert.equal(cleanPhone("abc"), "");
});

test("isValidPhone accepts exactly 10 digits", () => {
  assert.equal(isValidPhone("5551234567"), true);
  assert.equal(isValidPhone("(555) 123-4567"), true);
  assert.equal(isValidPhone("555-123-456"), false);
  assert.equal(isValidPhone("555-123-45678"), false);
  assert.equal(isValidPhone(""), false);
  assert.equal(isValidPhone("+1 555 123 4567"), false); // 11 digits
});

test("nextSaturdays returns the requested count", () => {
  const dates = nextSaturdays(8);
  assert.equal(dates.length, 8);

  const five = nextSaturdays(5);
  assert.equal(five.length, 5);
});

test("nextSaturdays only returns Saturdays at 9:00 AM", () => {
  for (const d of nextSaturdays(8)) {
    assert.equal(d.getDay(), 6, `expected Saturday, got day ${d.getDay()} for ${d}`);
    assert.equal(d.getHours(), 9);
    assert.equal(d.getMinutes(), 0);
    assert.equal(d.getSeconds(), 0);
  }
});

test("nextSaturdays returns dates spaced exactly 7 days apart", () => {
  const dates = nextSaturdays(8);
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
  for (let i = 1; i < dates.length; i += 1) {
    assert.equal(dates[i].getTime() - dates[i - 1].getTime(), oneWeekMs);
  }
});

test("nextSaturdays returns only future Saturdays", () => {
  const now = new Date();
  for (const d of nextSaturdays(8, now)) {
    assert.ok(d.getTime() >= now.getTime() - 1000, `expected future date, got ${d}`);
  }
});

test("nextSaturdays from a Wednesday returns the upcoming Saturday first", () => {
  // 2026-05-06 is a Wednesday.
  const wed = new Date(2026, 4, 6, 12, 0, 0, 0);
  const [first, second] = nextSaturdays(2, wed);
  assert.equal(first.getDay(), 6);
  assert.equal(first.getDate(), 9); // Sat May 9
  assert.equal(first.getMonth(), 4);
  assert.equal(first.getFullYear(), 2026);
  assert.equal(second.getDate(), 16);
});

test("nextSaturdays from a Saturday before 9 AM uses today", () => {
  // 2026-05-09 is a Saturday. Caller is at 7 AM.
  const satEarly = new Date(2026, 4, 9, 7, 30, 0, 0);
  const [first] = nextSaturdays(1, satEarly);
  assert.equal(first.getDate(), 9);
  assert.equal(first.getHours(), 9);
});

test("nextSaturdays from a Saturday at/after 9 AM skips to next Saturday", () => {
  // 2026-05-09 Sat at 10 AM — too late, should jump to May 16.
  const satLate = new Date(2026, 4, 9, 10, 0, 0, 0);
  const [first] = nextSaturdays(1, satLate);
  assert.equal(first.getDate(), 16);
  assert.equal(first.getMonth(), 4);
});

test("nextSaturdays from a Sunday returns the following Saturday (6 days later)", () => {
  // 2026-05-10 is a Sunday.
  const sun = new Date(2026, 4, 10, 12, 0, 0, 0);
  const [first] = nextSaturdays(1, sun);
  assert.equal(first.getDay(), 6);
  assert.equal(first.getDate(), 16);
});

test("formatSaturday produces a human-readable label with the 9 AM suffix", () => {
  const sat = new Date(2026, 4, 9, 9, 0, 0, 0); // Sat May 9, 2026
  const label = formatSaturday(sat);
  assert.match(label, / — 9:00 AM$/);
  assert.match(label, /Sat/);
  assert.match(label, /May/);
  assert.match(label, /9/);
});

test("buildTemplateParams maps payload to EmailJS template variables", () => {
  const payload = {
    name: "Jane Doe",
    phone: "5551234567",
    cleaningDate: "2026-05-09T16:00:00.000Z",
    cleaningDateLabel: "Sat, May 9 — 9:00 AM",
    submittedAt: "2026-05-06T12:00:00.000Z",
  };
  const params = buildTemplateParams(payload, "cr.building.cleaning@gmail.com");
  assert.deepEqual(params, {
    to_email: "cr.building.cleaning@gmail.com",
    name: "Jane Doe",
    phone: "5551234567",
    cleaning_date: "2026-05-09T16:00:00.000Z",
    cleaning_date_label: "Sat, May 9 — 9:00 AM",
    submitted_at: "2026-05-06T12:00:00.000Z",
  });
});

test("buildTemplateParams falls back to cleaningDate when label missing", () => {
  const payload = {
    name: "Jane",
    phone: "5551234567",
    cleaningDate: "iso-string",
    submittedAt: "now",
  };
  const params = buildTemplateParams(payload, "to@example.com");
  assert.equal(params.cleaning_date_label, "iso-string");
});
