# Thiruppugazh Attendee App

A small web app for the Thiruppugazh class.
People join through a link. The organiser sees the list of people who joined.

This is **Phase 5**. It has the join form, a login, the attendee list
grouped by city, the one-time command that brings in the old spreadsheet,
and the organiser's tools: search, edit, remove, copy numbers, the Excel
file, the join link and the picture code.

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
Rows read: 99
People added: 50
People already there, details refreshed: 0
Rows skipped because the name was blank: 47
Phone numbers that could not be read: 0
New locations to check: 1
  - Malaysia
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

Two people in the old spreadsheet are written down twice with the same phone
number. The app keeps one of each. So 52 lines become 50 people.

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
app/dashboard/person/[id]    change or remove one person
app/dashboard/settings       the link, the picture code and the Excel file
middleware.ts                sends people to /login if they are not logged in
lib/db/client.ts             connects to the database
lib/db/attendees.ts          reads and writes attendees
lib/db/users.ts              reads the organiser login
lib/db/cities.ts             reads and writes locations
lib/db/attendee-list.ts      search, and the rows for the Excel file
lib/db/rate-limit.ts         counts join tries so nobody can flood the form
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
data/attendees.csv           the old list of names
```
