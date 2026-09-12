# Thiruppugazh Attendee App

A small web app for the Thiruppugazh class.
People join through a link. The organiser sees the list of people who joined.

This is **Phase 1**. It has the join form and a plain list of attendees.
There is no login yet. That comes in Phase 2.

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

Now open the new file called `.env.local` in a text editor.
Put your database address from Step 1 inside the quotes after `MONGODB_URI=`.
Save the file.

Then run:

```bash
npm run dev
```

Open your browser at http://localhost:3000/join and fill in the form.
Then open http://localhost:3000/dashboard to see the name you just added.

To stop the app, press `Ctrl` and `C` in the terminal.

---

## Step 3 — Put the app on the internet

1. Push this folder to a GitHub repository.
2. Go to https://vercel.com and sign in with GitHub.
3. Click **Add New**, then **Project**. Choose your repository.
4. Before you click Deploy, open **Environment Variables** and add these three:

   | Name | Value |
   |---|---|
   | `MONGODB_URI` | your database address from Step 1 |
   | `JWT_SECRET` | any long random line of letters and numbers |
   | `NEXT_PUBLIC_BASE_URL` | the address Vercel gives you, for example `https://your-app.vercel.app` |

5. Click **Deploy** and wait.
6. Open `https://your-app.vercel.app/join` on your phone and try it.

---

## The two pages

| Page | Address | Who uses it |
|---|---|---|
| Join form | `/join` | Anyone. Share this link. |
| Attendee list | `/dashboard` | The organiser. **No password yet.** |

**Important:** in Phase 1 the attendee list has no password.
Anyone with the address can see it. A password is added in Phase 2.

---

## Common problems

**The list says "Could not load the list right now."**
The app cannot reach the database. Check that `MONGODB_URI` is correct,
and that you allowed access from anywhere in Step 1, point 5.

**The form says "Could not save. Please try again."**
Same cause as above. Check the database address.

**Vercel shows an error after I change a setting.**
Environment variables only take effect on a new deploy.
In Vercel, open **Deployments** and click **Redeploy**.

---

## Where things live

```
app/join/page.tsx            the join form page
app/dashboard/page.tsx       the attendee list page
app/api/attendees/route.ts   saves a new person
lib/db/client.ts             connects to the database
lib/db/attendees.ts          reads and writes attendees
components/JoinForm.tsx      the form boxes and the Join button
data/attendees.csv           the existing list, used later in Phase 4
```
