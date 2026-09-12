# CLAUDE.md — Thiruppugazh Attendee App

## 0. How to use this file

This file is the project contract. It does not mean "build everything now".

**Rules for you, the coding agent:**

1. Build only the phase the owner names in his message. Do not start the next phase.
2. If the owner does not name a phase, ask which phase to build. Then stop.
3. Never change anything listed in "Locked decisions" or "Out of scope".
4. If you get stuck, stop and report. Do not retry the same fix more than twice.
5. After each phase, write a status report in plain language. Format is in Section 11.

---

## 1. What this app is

A small web app to manage the attendees of a Thiruppugazh class.

- Attendees join by clicking a public link. They enter name, phone, and location.
- The class organiser logs in and sees all attendees grouped by city.
- There are about 52 attendees today. Expect 100 to 500 over time.

**Who uses it:**

- **Public users** — people joining the class. Mostly on mobile phones.
- **The organiser** — one person. She is not technical. She will use a phone, not a laptop.

**Design rule that beats all others:** the organiser must never see a technical word.
No "database", "record ID", "API", "sync", "schema", "null", "500 error".
Error messages must be plain, for example "Could not save. Please try again."

---

## 2. Tech stack

| Part | Choice |
|---|---|
| Framework | Next.js 15, App Router, TypeScript |
| Hosting | Vercel |
| Database | MongoDB Atlas (free tier) |
| DB driver | Official `mongodb` Node driver. No Mongoose. |
| Styling | Tailwind CSS |
| Password hashing | `bcryptjs` |
| Session | JWT in an httpOnly cookie, using `jose` |
| Fuzzy city match | `fuse.js` |
| Excel export | `xlsx` (SheetJS) |
| QR code | `qrcode` |

**Do not add:** NextAuth, Auth0, Prisma, Redux, a component library, an email service, a payment service, an analytics service.

---

## 3. Locked decisions

Do not change these without asking the owner.

1. Location is chosen as **Country dropdown first, then City**.
2. The city field allows typing. It filters the list as the user types (autocomplete).
3. If the typed city is not in the list, still accept it. Save it as `pending`.
4. The public join link is **open**. No OTP, no email check, no approval to join.
5. There is **no attendance marking** per class. Not in any phase of this file.
6. Login is **one email and one password**, stored in MongoDB, seeded by a script.
   There is no sign-up page and no password reset page.
7. The app is **mobile first**. Design for a 390px wide screen, then scale up.

---

## 4. Data model (MongoDB)

Database name: `thiruppugazh`

### Collection: `attendees`

```
{
  _id:          ObjectId,
  name:         string,          // as typed, trimmed
  phone:        string,          // clean format, e.g. "+61432807888"
  phoneRaw:     string,          // exactly what the user typed
  countryCode:  string,          // e.g. "AU"
  cityId:       ObjectId | null, // links to cities collection
  cityRaw:      string,          // exactly what the user typed
  status:       "active" | "removed",
  source:       "link" | "import",
  createdAt:    Date,
  updatedAt:    Date
}
```

- Index on `phone` (unique).
- Index on `cityId`.

### Collection: `cities`

```
{
  _id:        ObjectId,
  name:       string,    // "Perth"
  region:     string,    // "WA"  (may be empty)
  country:    string,    // "Australia"
  countryCode:string,    // "AU"
  status:     "approved" | "pending",
  createdAt:  Date
}
```

### Collection: `users`

```
{
  _id:          ObjectId,
  email:        string,   // lowercase
  passwordHash: string,   // bcrypt
  name:         string,
  createdAt:    Date
}
```

### Seed data for `cities` (status: approved)

**Australia (AU):** Perth (WA), Melbourne (VIC), Sydney (NSW), Brisbane (QLD), Canberra (ACT), Adelaide (SA)

**India (IN):** Chennai (Tamil Nadu), Coimbatore (Tamil Nadu), Madurai (Tamil Nadu), Salem (Tamil Nadu), Puducherry (Puducherry), Bengaluru (Karnataka)

**Malaysia (MY):** Kuala Lumpur, Penang, Johor Bahru

**Singapore (SG):** Singapore

### Countries list for the dropdown

Australia (+61), India (+91), Malaysia (+60), Singapore (+65), United Kingdom (+44), United States (+1), Canada (+1), New Zealand (+64), United Arab Emirates (+971), Sri Lanka (+94).
Sort Australia and India to the top. Most attendees are in those two.

---

## 5. Screens

### 5.1 Join page — `/join` (public, no login)

One screen. No scrolling on a phone if possible.

- Title: "Join the Thiruppugazh Class"
- Field 1: Full name (required)
- Field 2: Country (dropdown, required, default Australia)
- Field 3: Phone number (required). Show the country dialling code as a fixed prefix next to the box. The user types only the local number.
- Field 4: City (required). A text box that filters a list as the user types. Shows only cities for the chosen country. If no match, the user can keep their typed text.
- Big submit button: "Join"
- After submit: a simple thank-you screen. "Thank you, [Name]. You have joined the class." No link back to the form.

**Hidden guards (the user never sees these):**

- Honeypot field named `website`, hidden with CSS. If it has any value, silently return success and save nothing.
- Rate limit: maximum 5 submits per IP address per hour.
- Duplicate phone: if the phone already exists, update the existing record instead of creating a new one. Show "You are already registered."

### 5.2 Login page — `/login`

- Email box, password box, "Log in" button. Nothing else.
- Wrong details message: "Email or password is not correct."

### 5.3 Dashboard — `/dashboard` (login required)

Default view is the city list.

- Header: total attendee count. Example: "52 attendees".
- A list of cities, each with a count. Example: "Perth — 26". Sorted by count, highest first.
- Tap a city to open that city's people list.
- Search box at the top. Searches name and phone across all cities.
- If there are pending cities, show a banner: "3 new locations to check". Tap to open `/dashboard/locations`.

### 5.4 City detail — `/dashboard/city/[id]`

- List of people: name, phone.
- Tap a person to edit or remove them.
- Button: "Copy all numbers" — copies the phone numbers of this city, comma separated.

### 5.5 Locations review — `/dashboard/locations`

For each pending city, show the typed text and two buttons:

- "Add as new location" — sets status to approved.
- "Same as…" — opens a list of approved cities. Picking one moves all attendees to that city and deletes the pending one.

This is how typos get fixed. The organiser never sees the word "typo".

### 5.6 Settings — `/dashboard/settings`

- Show the join link with a "Copy link" button.
- Show a QR code of the join link, with a "Download" button.
- Button: "Download attendee list" — exports an Excel file.
- "Log out" button.

---

## 6. Phases

Build one phase per session. Stop at the end of each phase.

### Phase 1 — Base app, deployed

**Goal:** something live on Vercel that saves and shows a record.

**Build:**

1. Next.js project with TypeScript and Tailwind.
2. MongoDB connection helper with connection reuse (avoid new connections on every request).
3. `/join` page with plain fields only: name, phone, city as a plain text box. No dropdowns yet.
4. `POST /api/attendees` — saves to the `attendees` collection.
5. `/dashboard` page with no login yet. Shows a plain list of all attendees.
6. `.env.example` file with `MONGODB_URI`, `JWT_SECRET`, `NEXT_PUBLIC_BASE_URL`.
7. `README.md` with setup steps in plain language.

**Done when:**

- `npm run build` passes with no errors.
- Submitting the join form adds a row that shows on `/dashboard`.
- The owner can deploy to Vercel and open both pages on a phone.

**Do not build:** login, dropdowns, autocomplete, export, QR code, styling beyond basic readable layout.

---

### Phase 2 — Login

**Build:**

1. `users` collection and a seed script: `npm run seed:user -- --email=x --password=y --name=z`.
   The script hashes the password with bcrypt and creates or updates the user.
2. `/login` page.
3. `POST /api/auth/login` — checks the password, sets an httpOnly JWT cookie, 30 day expiry.
4. `POST /api/auth/logout` — clears the cookie.
5. Middleware that protects every route under `/dashboard`. Not logged in goes to `/login`.

**Done when:**

- The seed script creates a user.
- That email and password logs in and reaches the dashboard.
- Visiting `/dashboard` in a private browser window redirects to `/login`.
- `/join` still works with no login.

---

### Phase 3 — Location system

**Build:**

1. `cities` collection and a seed script for the list in Section 4.
2. Country dropdown and dialling code prefix on `/join`.
3. City autocomplete using Fuse.js, filtered by the chosen country, allowing unmatched text.
4. Phone cleaning: store E.164 in `phone`, keep the typed value in `phoneRaw`.
5. Dashboard grouped by city with counts.
6. `/dashboard/city/[id]` page.
7. `/dashboard/locations` review page with Approve and Merge.

**Done when:**

- Typing "perht" suggests Perth.
- Typing a city that does not exist saves it and it appears on the locations review page.
- Merging a pending city moves its people to the chosen city, and the pending city disappears.
- Counts on the dashboard match the number of people in each city.

---

### Phase 4 — Import the existing list

**Build:**

1. A one-time script: `npm run import -- --file=./data/attendees.csv`.
2. It must skip rows with a blank name. The source file has 47 blank rows out of 99.
3. It must map spelling variants to the seeded cities. Known variants to handle:
   - `Perth, WA, Australia` / `Perth.WA.Australia` / `Perth wa` / `Perth WA` / `perth, WA` / `Perth, Western Australia` / `Perth, WA` → Perth
   - `Mlebourne, Australia` / `Melbourne,VIC,Australia` / `Melbourne, Vic , Australia` / `Melbourne Australia` / `Victoria, Australia` → Melbourne
   - `Sydney, NSW Australia` / `Sydney,  Australia` → Sydney
   - `Chennai  India` / `Chennai, Tamil Nadu, India` → Chennai
   - `Coimbatore,India` → Coimbatore, `Madurai. India` → Madurai, `Salem, India` → Salem, `Puducherry, India` → Puducherry
   - `Malaysia` with no city → leave `cityId` null and mark it pending for review
4. Phone cleaning rules:
   - Starts with `61` and is 11 digits → `+61…`
   - 9 digits starting with `4` → assume Australia mobile, `+61…`
   - 10 digits starting with `6`/`7`/`8`/`9` → assume India, `+91…`
   - Anything that does not fit a rule → import the person, leave `phone` empty, and list them in the report.
5. Set `source: "import"` on every imported record.
6. The script must be safe to run twice. Running it again must not create duplicates.

**Done when:**

- The script prints: rows read, people imported, rows skipped, phones that could not be cleaned.
- The dashboard shows about 52 people.
- Perth shows about 26.

---

### Phase 5 — Organiser tools

**Build:**

1. Search box on the dashboard (name and phone).
2. Edit and remove a person. Remove sets `status: "removed"`, it does not delete the row.
3. "Copy all numbers" button.
4. Excel export.
5. `/dashboard/settings` with the join link, copy button, and QR code.
6. Honeypot field, rate limit, and duplicate-phone handling on `/join`.

**Done when:**

- All buttons work on a phone browser.
- Submitting the same phone twice does not create two people.

---

### Phase 6 — Polish

1. Mobile layout check at 390px width on every page.
2. Loading states on every button.
3. Plain-English error messages everywhere. No technical words.
4. Favicon and page titles.

---

## 7. Out of scope — do not build

- Attendance marking, class schedules, calendars.
- Donations or payments.
- Sending emails, SMS, or WhatsApp messages from the app.
- Multiple organiser accounts, roles, or permissions.
- Sign-up page, password reset, forgot password.
- Charts or analytics graphs.
- Dark mode.
- Multi-language support.
- Tests, unless the owner asks for them.
- Docker, CI pipelines, staging environments.

---

## 8. Code rules

1. TypeScript everywhere. No `any` unless there is no other option.
2. Server-side validation on every API route. Never trust the browser.
3. All database code in `/lib/db/`. No database calls inside React components.
4. Keep files under 200 lines. Split them if they grow.
5. No `console.log` left in the final code.
6. Never commit `.env`. Only commit `.env.example`.
7. Comments only where the reason is not obvious. Do not comment every line.

---

## 9. Folder structure

```
/app
  /join/page.tsx
  /login/page.tsx
  /dashboard
    /page.tsx
    /city/[id]/page.tsx
    /locations/page.tsx
    /settings/page.tsx
  /api
    /attendees/route.ts
    /auth/login/route.ts
    /auth/logout/route.ts
    /cities/route.ts
/lib
  /db/client.ts
  /db/attendees.ts
  /db/cities.ts
  /db/users.ts
  /auth/session.ts
  /utils/phone.ts
/scripts
  seed-user.ts
  seed-cities.ts
  import-attendees.ts
/components
```

---

## 10. When to stop and ask

Stop and report instead of guessing if any of these happen.

1. The same error appears twice after two different fixes.
2. A task needs a package that is not listed in Section 2.
3. A task needs a change to a locked decision in Section 3.
4. A task needs a credential or key you do not have.
5. The phase instructions are unclear or contradict this file.
6. You are about to build something in the Out of scope list.

Do not keep trying. Do not build a workaround that changes the design. Stop and write the report.

---

## 11. Status report format

At the end of every phase, or when you stop, write this. Use plain language. No technical jargon.

```
WHAT I FINISHED
- (short sentences, one per item)

WHAT IS NOT WORKING
- (what is broken, and what I tried)

WHAT I NEED FROM YOU
- (a decision, a key, a file, or nothing)

HOW TO TEST IT
- (numbered steps the owner can follow on his phone)
```
