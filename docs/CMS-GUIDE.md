# CMS Admin Guide

How to manage the Australian Islamic Centre website using Sanity Studio.

**Access the CMS:** Go to your website URL and add `/studio` (e.g. `yoursite.com/studio`).

---

## Studio Sidebar

The left sidebar in Sanity Studio is organised into two sections:

### Settings (top of sidebar)
These are one-off settings that apply to the entire website:

| Setting | What it controls |
|---------|-----------------|
| **Prayer Times** | Daily iqamah times, Jumu'ah, Taraweeh, Eid prayers |
| **Donations** | FundraiseUp integration + donate page + campaigns |
| **Site Settings** | Organisation info, logos, social media, homepage content |
| **Forms** | Enable/disable forms, set recipient emails, customise text |

### Content (below the divider)
These are lists where you create and manage multiple items:

| Content Type | What it's for |
|-------------|---------------|
| **Events** | One-off events, multi-day events, and recurring programs |
| **Announcements** | News, notices, urgent alerts |
| **Services** | Mosque services (marriage, counselling, funeral, etc.) |
| **Team Members** | Imam and staff profiles |
| **Gallery Images** | Photo gallery |
| **FAQs** | Frequently asked questions |
| **Mosque Etiquette** | Visitor guidelines shown on the Visit page |
| **Tour Types** | Types of tours available for visitors |
| **Tour Requests** | Submitted tour bookings (read-only, managed by staff) |
| **Resources** | PDFs, videos, audio, external links |
| **Page Content** | Custom pages (About, History, etc.) |

---

## Common Tasks

### Update Prayer Times

1. Click **Prayer Times** in the sidebar
2. For each prayer (Fajr, Dhuhr, Asr, Maghrib, Isha), choose one of:
   - **Fixed Time** — select an exact time from the dropdown
   - **Minutes after Adhan** — select 5, 10, 15, 20, 25, or 30 minutes
3. Set the **Arabic Jumu'ah** and **English Jumu'ah** times
4. Click **Publish**

**During Ramadan:** Toggle **Taraweeh Active** to ON and set the time.

**During Eid:** Toggle **Show Eid al-Fitr on Site** or **Show Eid al-Adha on Site** to ON and set the prayer time. Turn these OFF after Eid is over.

> **Where it appears:** The /worshippers page and the prayer times card on the homepage.

---

### Create an Event

1. Click **Events** in the sidebar, then click **Create** (the + button)
2. Fill in the required fields:
   - **Title** — name of the event
   - **Event Type** — choose one:
     - **Single Day** — a one-off event (workshop, dinner, lecture)
     - **Multi-Day** — spans several days (camp, conference) — requires start and end date
     - **Recurring** — repeats weekly (Quran class, program) — choose which day it repeats
   - **Date** — when it happens (or select a day for recurring events)
   - **Street Address** — defaults to the AIC address, only change for off-site events
   - **Categories** — at least one (Prayer, Education, Community, Youth, Sports, Women, Charity, Special Event)
3. Add optional details:
   - **Hero Image** — banner at the top of the event page (recommended: 1200x500px)
   - **Short Description** — shown on event cards (max 150 characters)
   - **Full Description** — main content on the event detail page
   - **Key Features** — teal badges like "Free entry", "Halal catering", "Childcare available"
   - **What to Expect** — checklist items like "Guest speaker", "Q&A session"
   - **Venue / Room** — specific area (e.g. "Main Prayer Hall", "Youth Centre")
   - **Age Group** — shown as a blue badge (e.g. "Ages 5-12", "Adults")
   - **Contact Email & Phone** — shown on the event page
   - **Registration / RSVP Link** — adds a "Register / RSVP" button
   - **External Website** — adds a "Visit Website" button
   - **Embedded Form** — choose between the built-in contact form, an external form (JotForm, Google Forms), or no form
4. Make sure **Active** is ON
5. Optionally set **Featured on Homepage** to ON
6. Click **Publish**

**Important:** Events automatically hide from the website after their date passes. You don't need to manually deactivate them.

**Creating a Program (weekly class):** Select **Recurring** as the event type. If you also choose one of these categories — Education, Youth, Sports, or Women — the event automatically appears in the "Weekly Programs" section on the Events page.

---

### Create an Announcement

1. Click **Announcements** in the sidebar, then **Active**, then click **Create**
2. Fill in the required fields:
   - **Title** — headline of the announcement
   - **Excerpt** — short summary, max 200 characters (shown on cards and listing page)
   - **Publication Date** — when the announcement was published
   - **Category** — choose from: General, News, Prayer, Ramadan, Eid, Community, Education, Youth, Sisters, Volunteer, In Memoriam, Marriage, Lost & Found, Maintenance
3. Add optional details:
   - **Image** — hero banner at the top
   - **Full Content** — rich text (bold, italic, links, bullet lists)
   - **Priority** — controls how prominently it's displayed:
     - **Normal** — standard listing
     - **Important** — highlighted in lists
     - **Urgent** — shows as an alert banner at the top of the homepage
   - **Expires At** — the announcement automatically hides after this date
   - **Tags** — keywords shown as small pills
   - **Call to Action** — optional button linking to an internal page or external URL
4. Make sure **Active** is ON
5. Click **Publish**

**Tip:** Use **Urgent** priority for critical notices (prayer time changes, facility closures). Set an expiry date so it auto-hides when no longer relevant.

---

### Manage Services

1. Click **Services** in the sidebar
2. Click an existing service to edit, or click **Create** for a new one
3. Key fields:
   - **Title** — service name
   - **Icon** — choose from the icon list (shown on service cards)
   - **Short Description** — max 150 characters (shown on cards)
   - **Card Highlights** — 2-4 word bullet points for the service card
   - **Key Features** — detailed list of what's included
   - **Full Description** — rich text shown as "About This Service"
   - **Requirements** — prerequisites (e.g. "Valid ID", "Two witnesses")
   - **Process Steps** — step-by-step guide with descriptions
   - **Availability** — when offered (e.g. "By appointment", "Fridays after Jumu'ah")
   - **Fee** — free, fixed fee, suggested donation, or "Contact for pricing"
   - **Contact Email & Phone** — service-specific contact
   - **Display Order** — lower number = appears first in the list
4. Click **Publish**

---

### Add a Team Member

1. Click **Team Members** in the sidebar
2. Click **Create**
3. Fill in:
   - **Full Name** and **Role/Title**
   - **Category** — Imam, Teacher, Board, Admin, Volunteer, Youth Leader, Sisters Coordinator
   - **Photo** — professional headshot
   - **Short Bio** — max 150 characters (for cards)
   - **Full Biography** — rich text background
   - **Qualifications** and **Specializations**
   - **Contact Info** — email, phone, office hours (with toggle to show/hide publicly)
4. Set **Active** to ON, optionally set **Featured** for homepage display
5. Click **Publish**

---

### Post an Urgent Notice

For time-sensitive announcements (prayer time changes, facility closures, emergency notices):

1. Create an **Announcement**
2. Set **Priority** to **Urgent**
3. Set an **Expires At** date so it auto-hides
4. Click **Publish**

The announcement will appear as an alert banner at the top of the homepage until it expires.

---

### Enable/Disable a Form

1. Click **Forms** in the sidebar
2. Find the form you want to control:
   - **Contact Form Enabled** — the form on the /contact page
   - **Service Inquiry Enabled** — forms on individual service pages
   - **Event Inquiry Enabled** — forms on individual event pages
   - **Newsletter Enabled** — the subscribe form in the footer
3. Toggle ON or OFF
4. Click **Publish**

When disabled, the form completely disappears from the website.

**Changing where emails go:** Edit the **Recipient Email** field for each form. This is the email address that receives form submissions.

---

### Update Site Branding

1. Click **Site Settings** in the sidebar
2. Update any of:
   - **Organization Name**, **Short Name**, **Tagline**
   - **Logo** (main) and **Logo Light Version** (for dark backgrounds)
   - **Address**, **Phone**, **Email**
   - **Google Maps URL** — copy the link from Google Maps
   - **Operating Hours** (weekdays and weekends)
   - **Social Media** links (Facebook, Instagram, YouTube, Twitter/X, TikTok, WhatsApp, Telegram)
3. Click **Publish**

These appear across the entire website (header, footer, contact page).

---

### Edit the Homepage Carousel

1. Click **Site Settings** in the sidebar
2. Scroll down to **Hero Slides**
3. For each slide you can set:
   - **Title** and **Subtitle** — text overlay on the image
   - **Background Image** — the slide photo
   - **Overlay Darkness** — 0 (no dark overlay) to 100 (fully dark) — helps text readability
   - **Primary Button** — main call-to-action (label + URL)
   - **Secondary Button** — optional second button
   - **Active** — toggle individual slides on/off without deleting them
4. Add or remove slides as needed
5. Click **Publish**

---

### Set Up Donations

The donation page uses FundraiseUp. There are two settings documents:

**Donations > Settings** (the FundraiseUp integration):
- **Installation Script** — paste the full script from your FundraiseUp dashboard
- **Organization Key** — found inside the installation script (e.g. "AGUWBDNC")

**Donations > Donate Page** (the /donate page layout):
- **Goal Meter** — toggle ON/OFF, paste the FundraiseUp goal meter HTML snippet
- **Donation Form** — toggle ON/OFF, paste the FundraiseUp form HTML snippet
- **Campaigns** — add individual fundraising campaigns with their FundraiseUp snippets
- **Donor List** — toggle ON/OFF to show recent donations
- **Donation Map** — toggle ON/OFF to show the world map of donations

**Donations > Campaigns:**
- Create standalone donation campaign pages with their own goals and descriptions

> All element codes come from your FundraiseUp dashboard. You copy the HTML snippet and paste it into the corresponding field.

---

### Add a Gallery Photo

1. Click **Gallery Images** in the sidebar
2. Click **Create**
3. Upload the **Image** (you can adjust the crop by dragging the hotspot circle)
4. Fill in **Alt Text** (required — describes the image for screen readers)
5. Optionally add a **Caption** and select a **Category** (Prayer Hall, Architecture, Community, Events, Exterior, Interior)
6. Set **Featured** to ON if you want it on the homepage gallery strip
7. Click **Publish**

---

### Embed an External Form on an Event

If you want to embed a JotForm, Google Form, or Typeform on an event page:

1. **First**, add the form provider's domain to the allowed list:
   - Go to **Site Settings**
   - Scroll to **Allowed Embed Domains**
   - Add a new entry: domain = `form.jotform.com` (or `docs.google.com`, `typeform.com`, etc.), label = "JotForm"
   - Click **Publish**

2. **Then**, on the event:
   - Open the event document
   - Scroll to **Embedded Form**
   - Select **External form embed**
   - Paste the form URL (must be HTTPS)
   - Click **Publish**

> The domain must be in the allowed list or the form won't load (this is a security measure).

---

## Key Concepts

### Active vs Featured

Every content type has two toggles:

- **Active** — controls whether the content appears on the website at all. When OFF, the item is completely hidden.
- **Featured on Homepage** — controls whether the content appears in the featured section on the homepage. Only works when Active is also ON.

Think of it as: Active = "exists on the website", Featured = "highlighted on the homepage".

### Slugs (URL-friendly names)

When you create a title, a **slug** is automatically generated. The slug determines the URL:

- Title: "Quran Memorization Class"
- Slug: `quran-memorization-class`
- URL: `yoursite.com/events/quran-memorization-class`

You can edit the slug, but **don't change it after publishing** — this breaks any existing links people may have saved or shared.

### Image Hotspots

When uploading images, you'll see a hotspot tool (a draggable circle on the image). Move it to the most important part of the image — usually a face or focal point. This ensures the image crops well on all screen sizes (mobile, tablet, desktop).

### Rich Text Editor

In description and content fields, you can:
- **Bold**, *italic*, and underline text
- Create bullet lists and numbered lists
- Add links (both internal pages and external URLs)
- Embed images

### Publishing and Drafts

- Changes only appear on the website after you click **Publish**
- You can make edits without publishing — they stay as drafts
- Use the history panel (clock icon) to see previous versions and restore old content
- Changes typically appear on the website within a few seconds of publishing

---

## Where Each Form Goes

| Form | Appears on | Emails go to |
|------|-----------|-------------|
| Contact Form | /contact page | Contact Recipient Email (set in Forms) |
| Service Inquiry | /services/[service-name] pages | Service Inquiry Recipient Email (set in Forms) |
| Event Inquiry | /events/[event-name] pages | Event Inquiry Recipient Email (set in Forms) |
| Newsletter | Footer on all pages | Newsletter Recipient Email (set in Forms) |
| Tour Request | /visit page | Saved to Sanity Studio (check Tour Requests) |

---

## Event Views Explained

Events in the sidebar are organised into three views:

- **Live on Website** — active events with future dates (or recurring events that haven't ended)
- **Expired** — active events whose dates have passed (still in the system, just auto-hidden from the website)
- **Inactive** — events you've manually toggled Active to OFF

You don't need to move events between views — the system handles it automatically based on the date and the Active toggle.

---

## Quick Troubleshooting

**Content not appearing on the website?**
1. Check that **Active** is set to ON
2. Check that you clicked **Publish** (not just saved a draft)
3. For events, check the date hasn't passed
4. For announcements, check the **Expires At** date hasn't passed

**Form not showing on a page?**
1. Go to **Forms** and check the form is **Enabled**
2. For embedded external forms on events, make sure the domain is in **Site Settings > Allowed Embed Domains**

**Featured content not on the homepage?**
1. **Featured** only works when **Active** is also ON
2. Don't feature too many items — the homepage has limited space

**Changed a slug and old links broke?**
Unfortunately there's no way to redirect old slugs. Avoid changing slugs after publishing. If you must change one, share the new URL with anyone who had the old link.

**Prayer times not updating?**
1. Make sure you clicked **Publish** in Prayer Times
2. Changes typically appear within a few seconds, but can take up to 2 minutes

---

## Content Checklists

### Before Ramadan
- [ ] Update prayer times in **Prayer Times** settings
- [ ] Toggle **Taraweeh Active** to ON and set the time
- [ ] Create announcements for Ramadan schedule changes
- [ ] Create events for Iftar dinners, lectures, etc.
- [ ] Toggle **Show Eid al-Fitr on Site** to ON and set the time (closer to Eid)

### After Ramadan / Eid
- [ ] Toggle **Taraweeh Active** to OFF
- [ ] Toggle Eid settings to OFF
- [ ] Update prayer times back to standard schedule
- [ ] Set expiry dates on Ramadan-specific announcements

### Weekly Admin Tasks
- [ ] Check **Tour Requests** for new tour bookings — update status (New → Contacted → Confirmed)
- [ ] Review **Events > Expired** and deactivate anything no longer needed
- [ ] Check **Announcements** and remove or expire outdated ones
