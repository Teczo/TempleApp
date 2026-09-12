# Thiruppugazh Attendee App

A small web app for the Thiruppugazh class.
People join through a link. The organiser sees the list of people who joined.

This is **Phase 2**. It has the join form, a login, and a list of attendees.
The attendee list is now behind a password.

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

Nothing in the app uses this setting yet. It is only needed in Phase 5,
for the join link and the QR code. So you can skip it for now.

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
| Attendee list | `/dashboard` | The organiser, after logging in. |

If she opens `/dashboard` without logging in, the app sends her to `/login`.
Once she logs in, she stays logged in on that phone for 30 days.
The **Log out** button is at the top of the attendee list.

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

**Vercel shows an error after I change a setting.**
Environment variables only take effect on a new deploy.
In Vercel, open **Deployments** and click **Redeploy**.

---

## Where things live

```
app/join/page.tsx            the join form page
app/login/page.tsx           the log in page
app/dashboard/page.tsx       the attendee list page
app/api/attendees/route.ts   saves a new person
app/api/auth/login/route.ts  checks the password and starts the session
app/api/auth/logout/route.ts ends the session
middleware.ts                sends people to /login if they are not logged in
lib/db/client.ts             connects to the database
lib/db/attendees.ts          reads and writes attendees
lib/db/users.ts              reads the organiser login
lib/auth/session.ts          makes and checks the login cookie
scripts/seed-user.ts         creates or updates the organiser login
components/JoinForm.tsx      the form boxes and the Join button
components/LoginForm.tsx     the email and password boxes
data/attendees.csv           the existing list, used later in Phase 4
```
