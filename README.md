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

### Rooms

| Method | Endpoint       | Access        | Description |
| ------ | -------------- | ------------- | ----------- |
| POST   | `/rooms`       | Authenticated | Create a room. Creator becomes owner. |
| GET    | `/rooms`       | Authenticated | List active rooms with message and online counts. |
| GET    | `/rooms/:id`   | Authenticated | Room details, last 50 messages, online users. |
| DELETE | `/rooms/:id`   | Owner only    | Archive the room (soft delete). |

**Create room request body:**

```json
{
  "name": "Engineering Standup",
  "description": "Daily sync for the backend team"
}
```

**List rooms response** includes `messageCount` (PostgreSQL) and `onlineUserCount` (Redis).

**Room detail response** includes the last 50 messages (oldest first) and current online users from Redis.

### Admin (coming next)

- **Admin:** `GET /admin/archival-history`

## Redis Presence

Online presence is tracked in Redis (not PostgreSQL):

- `presence:room:{roomId}` — SET of user IDs currently in the room
- `presence:user:{userId}` — SET of room IDs the user is in (enables fast cleanup on disconnect)

REST endpoints read live counts from Redis. Socket.io join/leave handlers write to these keys.

## Socket.io

Connect with JWT in the handshake `auth` object:

```javascript
const socket = io("http://localhost:3000", {
  auth: { token: "<jwt>" },
});
```

Connections without a valid JWT are rejected at handshake.

| Event | Direction | Description |
| ----- | --------- | ----------- |
| `room:join` | Client → Server | Join a room. Updates Redis presence and broadcasts `room:user-joined`. |
| `room:leave` | Client → Server | Leave a room. Updates Redis and broadcasts `room:user-left`. |
| `room:message` | Client → Server | Send a message. Saved to DB; broadcasts `room:new-message`. |
| `room:typing` | Client → Server | Typing indicator. Broadcasts `room:typing-indicator` to others only. |
| `room:user-joined` | Server → Client | `{ roomId, user: { id, name } }` |
| `room:user-left` | Server → Client | `{ roomId, userId }` |
| `room:new-message` | Server → Client | `{ id, roomId, content, createdAt, user }` |
| `room:typing-indicator` | Server → Client | `{ roomId, user: { id, name } }` |
| `socket:error` | Server → Client | `{ message }` validation or business errors |

**Join / leave payload:**

```json
{ "roomId": "uuid" }
```

**Message payload:**

```json
{ "roomId": "uuid", "content": "Hello team" }
```

**Disconnect cleanup:** On unexpected disconnect, the server reads `presence:user:{userId}` from Redis, removes the user from all room sets, and broadcasts `room:user-left` to each affected room.

## License

ISC
