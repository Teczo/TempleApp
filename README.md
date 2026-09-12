# Thiruppugazh Attendee App

A small web app for the Thiruppugazh class.
People join through a link. The organiser sees the list of people who joined.

This is the **finished app**. It has the join form, a login, the attendee
list grouped by city, the one-time command that brings in the old
spreadsheet, and the organiser's tools: search, edit, remove, copy numbers,
the Excel file, the join link and the picture code.

Every page is built for a phone screen first.

---

## What you need before you start

1. A computer with **Node.js version 20 or newer**. Download it from https://nodejs.org
2. A free **MongoDB Atlas** account. This is where the names are stored.
3. A free **Vercel** account. This is where the app lives on the internet.
4. A free **GitHub** account, so Vercel can read the code.

---

## Step 1 — Make your database

1. Go to https://www.mongodb.com/cloud/atlas and sign up.
2. Create a new project. Any name is fine.
3. Create a cluster. Choose the **free** option (M0).
4. On the left, click **Database Access**. Add a new user.
   Write down the username and the password. You will need both.
5. On the left, click **Network Access**. Click **Add IP Address**.
   Choose **Allow access from anywhere**. This lets Vercel reach the database.
6. Go back to **Database** and click **Connect**, then **Drivers**.
7. Copy the address it shows. It looks like this:

   ```
   mongodb+srv://USERNAME:PASSWORD@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
   ```

8. Replace `USERNAME` and `PASSWORD` with the ones you made in step 4.

You do not need to create the database or any tables. The app makes them itself.

---

## Step 2 — Run the app on your own computer

Open a terminal in this folder, then run these commands one at a time.

```bash
npm install
cp .env.example .env.local
```

Now open the new file called `.env.local` in a text editor. Fill in two lines:

1. After `MONGODB_URI=`, put your database address from Step 1.
2. After `JWT_SECRET=`, put a long random line of letters and numbers.
   Anything about 40 characters long is fine. Nobody needs to remember it.
   If you change it later, everyone gets logged out.

Save the file. Then make the login by following **Step 3** below.

After that, run:

```bash
npm run dev
```

Open your browser at http://localhost:3000/join and fill in the form.
Then open http://localhost:3000/login, log in, and you will see the name
you just added.

To stop the app, press `Ctrl` and `C` in the terminal.

---

## Step 3 — Make the organiser's login

There is no sign-up page. You create the login yourself with one command.

Run this in the terminal, in this folder:

```bash
npm run seed:user -- --email=her@email.com --password="a good password" --name="Her Name"
```

Change the three values to the real ones. Keep the quote marks around any
value that has a space in it.

It should say `Login created for her@email.com.`

To change the password later, run the same command again with a new password.
The old password stops working straight away.

**Rules:** the password must be at least 8 letters. There is only one login.
There is no "forgot password" page. If she forgets it, run the command again.

---

## Step 3b — Add the starting locations

Run this once:

```bash
npm run seed:cities
```

It adds 16 locations: 6 in Australia, 6 in India, 3 in Malaysia, 1 in Singapore.
It also sets up the database indexes.

It is safe to run again any time. It will not make copies.

If you add a location on the **New locations** page later, this command
leaves it alone.

---

## Step 3c — Bring in the old list of names

Do this once, after Step 3b. It reads the spreadsheet in `data/attendees.csv`
and adds those people to the app.

```bash
npm run import -- --file=./data/attendees.csv
```

It prints a short report, like this:

```
Rows read: 101
People added: 58
People already there, details refreshed: 0
Rows skipped because the name was blank: 41
Phone numbers that could not be read: 0
New locations to check: 4
  - Malaysia
  - India
  - Australia
  - Qatar
```

What the report means:

- **Rows read** — every line in the spreadsheet, including empty ones.
- **People added** — new people now in the app.
- **People already there** — the same phone number was already saved.
  Their details were refreshed. No copy was made.
- **Rows skipped** — lines with no name. The old spreadsheet has 47 of these.
- **Phone numbers that could not be read** — these people are still added,
  but with no number. Their names are listed so you can ask them.
- **New locations to check** — place names the app did not know.
  Open the yellow banner on the attendee list and sort them out.

It is safe to run this command again. People are matched on their phone
number, so nobody gets added twice.

Two people in the spreadsheet are written down twice with the same phone
number. The app keeps one of each. So 60 lines become 58 people.

Four lines give a country but no city: Malaysia, India, Australia and Qatar.
They show up as new locations to check. Open the yellow banner and either
accept them or join them to a city.

---

## Step 4 — Put the app on the internet

You only need **two** settings to deploy. The third one comes later.

1. Push this code to a GitHub repository, on the `main` branch.
2. Go to https://vercel.com and sign in with GitHub.
3. Click **Add New**, then **Project**. Choose your repository.
4. Open **Environment Variables** and add these two:

   | Name | Value |
   |---|---|
   | `MONGODB_URI` | your database address from Step 1 |
   | `JWT_SECRET` | any long random line of letters and numbers, about 40 characters |

   Leave everything else as it is. Vercel finds the right settings on its own.
5. Click **Deploy** and wait about two minutes.
6. Vercel now shows you the address, for example `https://temple-app.vercel.app`.
7. Open `https://your-address.vercel.app/join` on your phone and try it.

### About `NEXT_PUBLIC_BASE_URL`

You cannot know this value before the first deploy. Vercel decides the
address for you. So do it in this order:

1. Deploy first, with only the two settings above.
2. Copy the address Vercel gives you.
3. Go to **Settings**, then **Environment Variables**, and add
   `NEXT_PUBLIC_BASE_URL` with that address. Do not put a `/` at the end.
4. Go to **Deployments** and click **Redeploy** on the newest one.

If you skip this, the app still works. It works the address out from the
browser. But if you later add your own web address, fill this in so the
join link and the picture code always point at the right place.

### If Vercel deploys nothing

Vercel only puts the `main` branch on your live address. If your code sits
on another branch, the live address stays empty. Check this:

1. In Vercel, open **Deployments**. See which branch each one came from.
2. In **Settings**, then **Git**, check that **Production Branch** says `main`.
3. In GitHub, open your repository and make sure the code is on `main`.

---

## Step 5 — Switch on the live Google sheet (optional)

The app can write every new person straight into a Google Sheet. The sheet
fills itself in. Nobody has to download anything.

Skip this step if you do not want it. The app works fine without it.

### 5a. Make the sheet

1. Go to https://sheets.google.com and make a new blank sheet.
2. Name it, for example "Thiruppugazh attendees".
3. Look at the web address. It looks like this:
   `https://docs.google.com/spreadsheets/d/1AbCdEf.../edit`
4. Copy the long code between `/d/` and `/edit`. That is your sheet code.

### 5b. Make a robot Google account

The app cannot log in as you. It needs its own account, called a service
account. It is free.

1. Go to https://console.cloud.google.com and sign in.
2. At the top, click the project box, then **New Project**. Name it anything.
   Click **Create**, then pick that project.
3. In the search box at the top, type "Google Sheets API". Open it and click
   **Enable**.
4. In the search box, type "Service accounts". Open it.
5. Click **Create service account**. Give it a name, for example "temple-app".
   Click **Create and continue**, then **Done**.
6. You now see an email address ending in `.iam.gserviceaccount.com`.
   Copy it. This is the robot's email.
7. Click that account, open the **Keys** tab, then **Add key**, then
   **Create new key**. Choose **JSON** and click **Create**.
8. A file downloads. Keep it safe. Never put this file in GitHub.

### 5c. Let the robot into your sheet

1. Open your sheet from step 5a.
2. Click **Share**.
3. Paste the robot's email address.
4. Set it to **Editor**. Turn off "Notify people". Click **Share**.

If you skip this, the app cannot write anything.

### 5d. Tell the app about it

Open the downloaded JSON file in any text editor. You need two values from it:
`client_email` and `private_key`.

In Vercel, go to **Settings**, then **Environment Variables**, and add:

| Name | Value |
|---|---|
| `GOOGLE_SHEET_ID` | the long code from step 5a |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | the `client_email` from the file |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | the `private_key` from the file, copied whole |

Copy the private key exactly as it appears in the file. It starts with
`-----BEGIN PRIVATE KEY-----` and ends with `-----END PRIVATE KEY-----`.
The `\n` marks inside it are fine. Leave them alone.

Then go to **Deployments** and click **Redeploy** on the newest one.

### 5e. Check that it works

1. Log in and open **Settings** on your phone.
2. You should see a box called "The live Google sheet" with an
   **Open the sheet** button.
3. Tap **Update the sheet now**. It should say how many people are on it.
4. Open the sheet. You should see a tab called **Attendees** with the list.
5. Add a test person through the join link. They appear in the sheet in a
   few seconds.

### How the sheet stays right

- The app rewrites the whole list every time somebody joins, is edited, is
  taken off the list, or when two locations are merged.
- The first column, **No.**, counts the people: 1, 2, 3 and so on. The app
  writes those numbers itself, so they are always correct.
- Do not type into the sheet yourself. Your typing is wiped on the next
  change. The app is the real list.
- If Google is slow or down, joining still works. The sheet catches up on the
  next change, or when you tap **Update the sheet now**.

---

## The pages

| Page | Address | Who uses it |
|---|---|---|
| Join form | `/join` | Anyone. Share this link. No login needed. |
| Log in | `/login` | The organiser. |
| City list | `/dashboard` | The organiser, after logging in. |
| One city | `/dashboard/city/...` | Tap a city name to open it. |
| One person | `/dashboard/person/...` | Tap a person's name to edit them. |
| New locations | `/dashboard/locations` | Tap the yellow banner to open it. |
| Settings | `/dashboard/settings` | Tap **Settings** at the top right. |

Every button says **Please wait…** while it is working, so you know the tap
went through. Every message is in plain words.

If she opens `/dashboard` without logging in, the app sends her to `/login`.
Once she logs in, she stays logged in on that phone for 30 days.
The **Log out** button is at the top right, and also on the Settings page.

---

## What the organiser can do

**Find one person.** Type a name or part of a phone number in the box at the
top of the attendee list. Tap **Find**. Tap **Clear** to go back.

**Change someone's details.** Tap a city, then tap the person's name.
Change the name, country, phone number or city. Tap **Save changes**.

**Take someone off the list.** Open the person, tap **Take off the list**,
then tap **Yes, take off**. Nothing is deleted. They stop showing in the
counts and the lists. To put them back, open their link again and save.

**Copy all the numbers of one city.** Open the city, tap **Copy all numbers**.
The numbers go on the clipboard, separated by commas. Paste them straight
into WhatsApp or a text message.

**Share the join link.** Open **Settings**. Tap **Copy link** and paste it
anywhere. Or tap **Download the picture** to save the square picture code.
People point their phone camera at it and the form opens.

**Save the whole list.** Open **Settings**, tap **Download attendee list**.
You get a file that opens in Excel, with name, phone, city, region, country
and the date they joined.

### The live Google sheet

If it is switched on (Step 5), the Settings page shows a box called
"The live Google sheet". Tap **Open the sheet** to see the list in Google.
The sheet fills itself in. If somebody looks missing, tap
**Update the sheet now**.

---

## What stops junk sign-ups

You do not need to do anything. These work on their own.

1. A hidden box on the form that only automatic fillers type in.
   If it is filled in, nothing is saved.
2. The same internet connection can only send the form 5 times an hour.
3. If somebody joins twice with the same phone number, the app keeps one
   person and refreshes their details. They see "You are already registered."

---

## Common problems

**The list says "Could not load the list right now."**
The app cannot reach the database. Check that `MONGODB_URI` is correct,
and that you allowed access from anywhere in Step 1, point 5.

**The form says "Could not save. Please try again."**
Same cause as above. Check the database address.

**Logging in says "Email or password is not correct."**
Check the email and password. If you are not sure, make the login again with
the command in Step 3. That sets a new password.

**Logging in says "Could not log in right now."**
The app cannot reach the database. Check `MONGODB_URI`.

**The import says a name has no number.**
The old spreadsheet had something the app could not read in that box.
The person is still saved. Open their city, tap their name, type the
number in, and tap Save changes.

**The city box shows no suggestions.**
Run `npm run seed:cities`. The locations have not been added yet.

**The Copy button says it could not copy.**
Some older phone browsers do not allow it. Press and hold on the numbers
on the screen, then choose Copy.

**Settings says the Google sheet is "Not switched on yet."**
The three Google settings are missing. Go back to Step 5, point 5d, and
check them in Vercel. Redeploy after adding them.

**The sheet stays empty, or "Update the sheet now" fails.**
Two usual causes. First, the sheet was never shared with the robot email
address (Step 5, point 5c). Second, the private key was not copied whole.
It must start with `-----BEGIN PRIVATE KEY-----` and end with
`-----END PRIVATE KEY-----`.

**I typed into the Google sheet and my typing disappeared.**
That is normal. The app rewrites the sheet on every change. Make your
changes in the app instead. Tap a person's name to edit them.

**The Excel file will not download on my phone.**
Some phone browsers block a download from a page. Try it on a computer,
or use your phone's other browser.

**A city name looks wrong in the list.**
Open the yellow banner on the attendee list. Then either add the name, or
say it is the same as a name you already have. Everyone moves across.

**Vercel shows an error after I change a setting.**
Environment variables only take effect on a new deploy.
In Vercel, open **Deployments** and click **Redeploy**.

---

## Where things live

```
app/join/page.tsx            the join form page
app/login/page.tsx           the log in page
app/dashboard/page.tsx       the city list with counts
app/dashboard/city/[id]      the people in one city
app/dashboard/locations      new locations to check
app/api/attendees/route.ts   saves a new person
app/api/auth/login/route.ts  checks the password and starts the session
app/api/auth/logout/route.ts ends the session
app/api/attendees/[id]       changes or removes one person
app/api/cities/route.ts      the city names for the join box
app/api/cities/[id]/route.ts adds a location, or joins two together
app/api/export/route.ts      makes the Excel file
app/api/qr/route.ts          makes the picture code
app/api/sheet/route.ts       updates the Google sheet when asked
app/dashboard/person/[id]    change or remove one person
app/dashboard/settings       the link, the picture code and the Excel file
middleware.ts                sends people to /login if they are not logged in
lib/db/client.ts             connects to the database
lib/db/attendees.ts          reads and writes attendees
lib/db/users.ts              reads the organiser login
lib/db/cities.ts             reads and writes locations
lib/db/attendee-list.ts      search, and the rows for the Excel file
lib/db/rate-limit.ts         counts join tries so nobody can flood the form
lib/sheets/client.ts         the Google settings and the login for them
lib/sheets/sync.ts           writes the whole list into the Google sheet
lib/utils/countries.ts       the country list and dialling codes
lib/utils/phone.ts           turns a typed number into +61... form
lib/utils/base-url.ts        works out the join link
lib/auth/session.ts          makes and checks the login cookie
scripts/seed-user.ts         creates or updates the organiser login
scripts/seed-cities.ts       adds the starting locations
scripts/import-attendees.ts  brings in the old spreadsheet
lib/db/import.ts             saves the people from the spreadsheet
lib/utils/csv.ts             reads a spreadsheet file
lib/utils/import-city.ts     matches old place names to the real ones
lib/utils/import-phone.ts    cleans the old phone numbers
components/JoinForm.tsx      the form boxes and the Join button
components/LoginForm.tsx     the email and password boxes
components/CityBox.tsx       the city box that suggests as you type
components/PersonForm.tsx    the edit boxes for one person
components/RemovePerson.tsx  the two-tap "take off the list" button
components/CopyButton.tsx    copies text to the clipboard
components/SearchResults.tsx the people found by a search
components/SearchBox.tsx     the search box and the Find button
components/CityRow.tsx       one city and its count
components/PersonRow.tsx     one person's name and number
components/DownloadButton.tsx the Excel and picture downloads
app/icon.svg                 the small picture in the browser tab
data/attendees.csv           the old list of names
```
