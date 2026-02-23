/**
 * Sanity Schema: Prayer Settings (singleton)
 *
 * Configuration document for daily prayer iqamah times, Jumuah
 * (Friday prayer) settings, Taraweeh, and Eid prayer overrides.
 * Each prayer supports a mode of "delay after adhan" or "fixed time"
 * with 5-minute-increment time options. Consumed by the prayer
 * timetable on the homepage and /prayer-times page.
 *
 * @module sanity/schemas/prayerSettings
 */
import { defineField, defineType } from "sanity";

// Generate time options in 5-minute increments
function generateTimeOptions() {
  const times: { title: string; value: string }[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let min = 0; min < 60; min += 5) {
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const ampm = hour < 12 ? "AM" : "PM";
      const timeStr = `${hour12}:${min.toString().padStart(2, "0")} ${ampm}`;
      times.push({ title: timeStr, value: timeStr });
    }
  }
  return times;
}

const delayOptions = [
  { title: "5 minutes", value: 5 },
  { title: "10 minutes", value: 10 },
  { title: "15 minutes", value: 15 },
  { title: "20 minutes", value: 20 },
  { title: "25 minutes", value: 25 },
  { title: "30 minutes", value: 30 },
];

const timeOptions = generateTimeOptions();

export default defineType({
  name: "prayerSettings",
  title: "Prayer Settings",
  type: "document",
  fields: [
    // ── Daily Prayers ──

    // Fajr
    defineField({
      name: "fajrIqamahMode",
      title: "Fajr Iqamah",
      type: "string",
      options: {
        list: [
          { title: "Fixed Time", value: "fixed" },
          { title: "Minutes after Adhan", value: "calculated" },
        ],
        layout: "radio",
      },
      initialValue: "fixed",
    }),
    defineField({
      name: "fajrFixedTime",
      title: "Fajr Fixed Iqamah Time",
      type: "string",
      options: { list: timeOptions },
      hidden: ({ document }) => document?.fajrIqamahMode !== "fixed",
      initialValue: "5:15 AM",
    }),
    defineField({
      name: "fajrDelay",
      title: "Fajr Minutes after Adhan",
      type: "number",
      options: { list: delayOptions },
      hidden: ({ document }) => document?.fajrIqamahMode !== "calculated",
      initialValue: 15,
    }),

    // Dhuhr
    defineField({
      name: "dhuhrIqamahMode",
      title: "Dhuhr Iqamah",
      type: "string",
      options: {
        list: [
          { title: "Minutes after Adhan", value: "calculated" },
          { title: "Fixed Time", value: "fixed" },
        ],
        layout: "radio",
      },
      initialValue: "calculated",
    }),
    defineField({
      name: "dhuhrFixedTime",
      title: "Dhuhr Fixed Iqamah Time",
      type: "string",
      options: { list: timeOptions },
      hidden: ({ document }) => document?.dhuhrIqamahMode !== "fixed",
    }),
    defineField({
      name: "dhuhrDelay",
      title: "Dhuhr Minutes after Adhan",
      type: "number",
      options: { list: delayOptions },
      hidden: ({ document }) => document?.dhuhrIqamahMode !== "calculated",
      initialValue: 10,
    }),

    // Asr
    defineField({
      name: "asrIqamahMode",
      title: "Asr Iqamah",
      type: "string",
      options: {
        list: [
          { title: "Minutes after Adhan", value: "calculated" },
          { title: "Fixed Time", value: "fixed" },
        ],
        layout: "radio",
      },
      initialValue: "calculated",
    }),
    defineField({
      name: "asrFixedTime",
      title: "Asr Fixed Iqamah Time",
      type: "string",
      options: { list: timeOptions },
      hidden: ({ document }) => document?.asrIqamahMode !== "fixed",
    }),
    defineField({
      name: "asrDelay",
      title: "Asr Minutes after Adhan",
      type: "number",
      options: { list: delayOptions },
      hidden: ({ document }) => document?.asrIqamahMode !== "calculated",
      initialValue: 10,
    }),

    // Maghrib
    defineField({
      name: "maghribIqamahMode",
      title: "Maghrib Iqamah",
      type: "string",
      options: {
        list: [
          { title: "Minutes after Adhan", value: "calculated" },
          { title: "Fixed Time", value: "fixed" },
        ],
        layout: "radio",
      },
      initialValue: "calculated",
    }),
    defineField({
      name: "maghribFixedTime",
      title: "Maghrib Fixed Iqamah Time",
      type: "string",
      options: { list: timeOptions },
      hidden: ({ document }) => document?.maghribIqamahMode !== "fixed",
    }),
    defineField({
      name: "maghribDelay",
      title: "Maghrib Minutes after Adhan",
      type: "number",
      options: { list: delayOptions },
      hidden: ({ document }) => document?.maghribIqamahMode !== "calculated",
      initialValue: 5,
    }),

    // Isha
    defineField({
      name: "ishaIqamahMode",
      title: "Isha Iqamah",
      type: "string",
      options: {
        list: [
          { title: "Minutes after Adhan", value: "calculated" },
          { title: "Fixed Time", value: "fixed" },
        ],
        layout: "radio",
      },
      initialValue: "calculated",
    }),
    defineField({
      name: "ishaFixedTime",
      title: "Isha Fixed Iqamah Time",
      type: "string",
      options: { list: timeOptions },
      hidden: ({ document }) => document?.ishaIqamahMode !== "fixed",
    }),
    defineField({
      name: "ishaDelay",
      title: "Isha Minutes after Adhan",
      type: "number",
      options: { list: delayOptions },
      hidden: ({ document }) => document?.ishaIqamahMode !== "calculated",
      initialValue: 10,
    }),

    // ── Jumu'ah (Friday) ──
    defineField({
      name: "jumuahArabicTime",
      title: "Arabic Jumu'ah",
      type: "string",
      options: { list: timeOptions },
      initialValue: "1:00 PM",
    }),
    defineField({
      name: "jumuahEnglishTime",
      title: "English Jumu'ah",
      type: "string",
      options: { list: timeOptions },
      initialValue: "2:15 PM",
    }),

    // ── Taraweeh ──
    defineField({
      name: "taraweehEnabled",
      title: "Taraweeh Active",
      type: "boolean",
      description: "Toggle on during Ramadan",
      initialValue: false,
    }),
    defineField({
      name: "taraweehTime",
      title: "Taraweeh Time",
      type: "string",
      options: { list: timeOptions },
      hidden: ({ document }) => !document?.taraweehEnabled,
      initialValue: "8:30 PM",
    }),

    // ── Eid Prayers ──
    defineField({
      name: "eidFitrActive",
      title: "Show Eid al-Fitr on Site",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "eidFitrTime",
      title: "Eid al-Fitr Prayer Time",
      type: "string",
      options: { list: timeOptions },
      hidden: ({ document }) => !document?.eidFitrActive,
      initialValue: "7:00 AM",
    }),
    defineField({
      name: "eidAdhaActive",
      title: "Show Eid al-Adha on Site",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "eidAdhaTime",
      title: "Eid al-Adha Prayer Time",
      type: "string",
      options: { list: timeOptions },
      hidden: ({ document }) => !document?.eidAdhaActive,
      initialValue: "7:00 AM",
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Prayer Settings",
        subtitle: "Iqamah times, Jumu'ah, Taraweeh & Eid",
      };
    },
  },
});
