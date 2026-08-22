# Real-Time Collaboration Platform

Backend for a real-time collaboration platform. Users create rooms, join via Socket.io, send messages in real time, and track online presence via Redis. Inactive rooms are archived automatically via BullMQ.

## Tech Stack

- **Runtime:** Node.js + Express.js + TypeScript (strict mode)
- **Database:** PostgreSQL + Prisma ORM
- **Real-time:** Socket.io
- **Presence:** Redis
- **Job Queue:** BullMQ
- **Validation:** Zod
- **Auth:** JWT

## Prerequisites

- Node.js 20+
- PostgreSQL
- Redis

## Setup

1. Clone the repository and checkout the feature branch:

```bash
git clone <repo-url>
cd practicle-chat-app
git checkout feature/realtime-collab-api
```

2. Install dependencies:

```bash
npm install
```

3. Copy environment variables:

```bash
cp .env.example .env
```

4. Fill in `.env` with your values:

| Variable         | Description                          |
| ---------------- | ------------------------------------ |
| `PORT`           | Server port (default: 3000)          |
| `NODE_ENV`       | `development` or `production`        |
| `DATABASE_URL`   | PostgreSQL connection string         |
| `REDIS_URL`      | Redis connection string              |
| `JWT_SECRET`     | Secret key for signing JWT tokens    |
| `JWT_EXPIRES_IN` | Token expiry (default: `7d`)         |

5. Run database migrations:

```bash
npm run db:migrate
```

6. Start the development server:

```bash
npm run dev
```

## Scripts

| Command              | Description                    |
| -------------------- | ------------------------------ |
| `npm run dev`        | Start dev server with hot reload |
| `npm run build`      | Compile TypeScript             |
| `npm run start`      | Run compiled production build  |
| `npm run typecheck`  | Type-check without emitting    |
| `npm run db:generate`| Generate Prisma client         |
| `npm run db:migrate` | Run Prisma migrations          |

## Project Structure

```
src/
├── config/       # Environment and app configuration
├── lib/          # Shared clients (Prisma, Redis, etc.)
├── routes/       # Express REST route handlers
├── middleware/   # Auth and validation middleware
├── services/     # Business logic
├── socket/       # Socket.io event handlers
├── jobs/         # BullMQ workers and schedulers
├── app.ts        # Express app factory
└── index.ts      # Entry point
prisma/
└── schema.prisma # Database schema
```

## API Overview

### Auth

| Method | Endpoint         | Access | Description                    |
| ------ | ---------------- | ------ | ------------------------------ |
| POST   | `/auth/register` | Public | Register with name, email, password. Returns JWT. |
| POST   | `/auth/login`    | Public | Login with email and password. Returns JWT. |

**Register / Login request body:**

```json
{
  "name": "Ashik Patel",
  "email": "ashik@example.com",
  "password": "securepass123"
}
```

(`name` is only required for register)

**Response:**

```json
{
  "token": "<jwt>",
  "user": {
    "id": "uuid",
    "name": "Ashik Patel",
    "email": "ashik@example.com"
  }
}
```

Protected routes require header: `Authorization: Bearer <token>`

### Rooms (coming next)

- **Rooms:** `POST /rooms`, `GET /rooms`, `GET /rooms/:id`, `DELETE /rooms/:id`
- **Admin:** `GET /admin/archival-history`

## License

ISC
