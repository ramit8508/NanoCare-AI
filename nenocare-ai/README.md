# NanoCare AI

A Next.js 14 app for a multi-role healthcare experience with real-time sessions, exercise guidance, and progress tracking.

## Highlights

- Multi-role flows for patients, doctors, and admins
- App Router architecture with server actions and API routes
- Real-time meeting experience (Zego UI kit integration)
- Pose/exercise tooling and progress visualization
- Prisma ORM for data access
- NextAuth-based authentication

## Tech Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Prisma
- NextAuth

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Create a `.env` file at the project root. Common variables for this codebase include:

```bash
DATABASE_URL=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
# Optional / integration-specific
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
ZEGO_APP_ID=
ZEGO_SERVER_SECRET=
```

> Adjust values to match your database and integrations.

### 3) Prisma setup

```bash
npm run prisma:generate
```

If you are running migrations locally, use your preferred Prisma workflow (e.g. `prisma migrate dev`).

### 4) Run the dev server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run start` - Run the production server
- `npm run lint` - Lint the project
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:studio` - Open Prisma Studio

## Project Structure

```
app/                Next.js App Router pages and routes
app/api/            API routes (auth, sessions, exercises, uploads)
app/doctor/         Doctor experience (appointments, exercises, reviews, slots)
app/patient/        Patient experience (appointments, doctors, exercises, progress)
app/meet/           Real-time meeting rooms
prisma/             Prisma schema
src/components/     Shared components
src/lib/            Auth, Prisma, utilities
```

## Notes

- The app uses App Router layouts and role-specific routes under `app/doctor`, `app/patient`, and `app/admin`.
- Real-time sessions are powered by Zego UI kit via the `/api/zego/token` route.

## License

Add your license here.
