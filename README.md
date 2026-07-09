# Koude Library

Koude Library is a local-first personal reading dashboard built in the same restrained dark visual direction as Koude Cloud. It keeps books, reading progress, ratings and notes in a SQLite database on the computer where the app is running.

No Docker, no hosted database, no native SQLite addon and no required cloud services.

## Stack

- React 19
- TypeScript
- Vite
- Node.js
- Express
- SQLite via Node.js built-in `node:sqlite`
- Zod
- JWT
- bcryptjs
- Vitest
- Supertest

## Features

- Local account registration and sign-in
- Password hashing
- JWT session
- Personal library per user
- Add, edit and delete books
- Reading statuses: Want to read, Reading, Finished
- Reading progress
- 0–5 rating
- Year, genre and private notes
- Search by title, author or genre
- Status filtering
- Library statistics
- Responsive dark Koude interface
- Local SQLite persistence
- API tests

## Local setup

Requirements:

- Node.js 22.5+ (Node.js 24 recommended)
- npm

Install dependencies:

```bash
npm install
```

Start the client and API together:

```bash
npm run dev
```

On Windows you can also double-click `START-KOUDE-LIBRARY.bat`. It installs dependencies on the first run and then starts both parts of the app.

Open:

```text
http://localhost:5173
```

The API runs on:

```text
http://localhost:4000
```

On the first launch, create a local account from the registration screen.

## Production build

```bash
npm run build
npm run start
```

The `start` command starts the compiled API. For a fully packaged deployment later, the Vite output can be served by the API or moved into a desktop shell, but the current version intentionally stays local and development-focused.

## Tests

```bash
npm test
```

The tests cover health checks, registration, protected routes, book creation, listing and statistics.

## Local data

By default the database is created here:

```text
server/data/koude-library.db
```

The directory is ignored by Git, so your personal library is not committed.

Optional environment variables can be copied from `server/.env.example` into `server/.env`.

## Project structure

```text
koude-library/
├─ client/
│  ├─ src/
│  │  ├─ components/
│  │  ├─ lib/
│  │  ├─ App.tsx
│  │  ├─ main.tsx
│  │  ├─ styles.css
│  │  └─ types.ts
│  └─ vite.config.ts
├─ server/
│  └─ src/
│     ├─ lib/
│     ├─ middleware/
│     ├─ routes/
│     ├─ tests/
│     ├─ app.ts
│     └─ index.ts
├─ START-KOUDE-LIBRARY.bat
└─ package.json
```

## Commit history

The repository contains staged development history instead of one giant commit:

```text
chore: initialize local Koude Library workspace
feat: add SQLite API foundation
feat: add local authentication
feat: implement library CRUD and statistics endpoints
feat: build Koude authentication and dashboard shell
feat: add book management interface
test: cover authentication and library routes
chore: keep the interface fully offline
docs: document local setup and project structure
```

To inspect it:

```bash
git log --oneline --decorate
```

To publish the existing history to a new GitHub repository:

```bash
git remote add origin git@github.com:YOUR_USERNAME/koude-library.git
git push -u origin main
```
