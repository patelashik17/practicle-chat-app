# API cURL Reference

Complete cURL commands for testing the Real-Time Collaboration Platform API with Postman or terminal.

**Base URL:** `http://localhost:8000` (change if your `PORT` in `.env` is different)

**Auth header for protected routes:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## Quick test order

1. Health check
2. Register → save `token`
3. Login (optional if you already registered)
4. Create room → save `roomId`
5. List rooms
6. Get room detail
7. Admin archival history
8. Archive room (owner only)

---

## 1. Health Check

```bash
curl -X GET http://localhost:8000/health
```

**Expected:** `200 OK`
```json
{ "status": "ok" }
```

---

## 2. Auth

### Register

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Ashik Patel\",\"email\":\"ashik@test.com\",\"password\":\"password123\"}"
```

**Postman**
- Method: `POST`
- URL: `http://localhost:8000/auth/register`
- Body (raw JSON):
```json
{
  "name": "Ashik Patel",
  "email": "ashik@test.com",
  "password": "password123"
}
```

**Expected:** `201 Created`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "Ashik Patel",
    "email": "ashik@test.com"
  }
}
```

---

### Login

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"ashik@test.com\",\"password\":\"password123\"}"
```

**Postman**
- Method: `POST`
- URL: `http://localhost:8000/auth/login`
- Body (raw JSON):
```json
{
  "email": "ashik@test.com",
  "password": "password123"
}
```

**Expected:** `200 OK` (same response shape as register)

---

### Register — duplicate email (error)

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Ashik Patel\",\"email\":\"ashik@test.com\",\"password\":\"password123\"}"
```

**Expected:** `409 Conflict`
```json
{ "error": "Email already registered" }
```

---

### Login — wrong password (error)

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"ashik@test.com\",\"password\":\"wrongpassword\"}"
```

**Expected:** `401 Unauthorized`
```json
{ "error": "Invalid email or password" }
```

---

### Register — validation error (short password)

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Ashik\",\"email\":\"bad@test.com\",\"password\":\"short\"}"
```

**Expected:** `400 Bad Request`
```json
{
  "error": "Validation failed",
  "details": [{ "field": "password", "message": "Password must be at least 8 characters" }]
}
```

---

## 3. Rooms

> All room endpoints require: `Authorization: Bearer YOUR_TOKEN_HERE`

### Create room

```bash
curl -X POST http://localhost:8000/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d "{\"name\":\"Engineering Standup\",\"description\":\"Daily backend sync\"}"
```

**Postman**
- Method: `POST`
- URL: `http://localhost:8000/rooms`
- Headers: `Authorization: Bearer YOUR_TOKEN_HERE`
- Body (raw JSON):
```json
{
  "name": "Engineering Standup",
  "description": "Daily backend sync"
}
```

**Expected:** `201 Created`
```json
{
  "id": "room-uuid",
  "name": "Engineering Standup",
  "description": "Daily backend sync",
  "status": "active",
  "createdAt": "2026-08-22T00:00:00.000Z",
  "lastActivityAt": "2026-08-22T00:00:00.000Z",
  "owner": { "id": "uuid", "name": "Ashik Patel", "email": "ashik@test.com" },
  "messageCount": 0,
  "onlineUserCount": 0
}
```

---

### List active rooms

```bash
curl -X GET http://localhost:8000/rooms \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Postman**
- Method: `GET`
- URL: `http://localhost:8000/rooms`
- Headers: `Authorization: Bearer YOUR_TOKEN_HERE`

**Expected:** `200 OK`
```json
{
  "rooms": [
    {
      "id": "room-uuid",
      "name": "Engineering Standup",
      "description": "Daily backend sync",
      "status": "active",
      "messageCount": 0,
      "onlineUserCount": 0,
      "owner": { "id": "uuid", "name": "Ashik Patel", "email": "ashik@test.com" }
    }
  ]
}
```

---

### Get room details (paginated messages)

```bash
curl -X GET "http://localhost:8000/rooms/ROOM_ID_HERE?page=1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Postman**
- Method: `GET`
- URL: `http://localhost:8000/rooms/ROOM_ID_HERE?page=1`
- Headers: `Authorization: Bearer YOUR_TOKEN_HERE`

**Expected:** `200 OK`
```json
{
  "id": "room-uuid",
  "name": "Engineering Standup",
  "description": "Daily backend sync",
  "status": "active",
  "messageCount": 0,
  "messages": [],
  "onlineUsers": [],
  "pagination": {
    "page": 1,
    "pageSize": 50,
    "totalMessages": 0,
    "totalPages": 0,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

---

### Get room — page 2

```bash
curl -X GET "http://localhost:8000/rooms/ROOM_ID_HERE?page=2" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### Get room — invalid page (error)

```bash
curl -X GET "http://localhost:8000/rooms/ROOM_ID_HERE?page=99" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected:** `404 Not Found`
```json
{ "error": "Page 99 does not exist" }
```

---

### Get room — invalid UUID (error)

```bash
curl -X GET http://localhost:8000/rooms/not-a-uuid \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected:** `400 Bad Request`
```json
{ "error": "Validation failed", "details": [{ "field": "id", "message": "Invalid room id" }] }
```

---

### Archive room (owner only)

```bash
curl -X DELETE http://localhost:8000/rooms/ROOM_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Postman**
- Method: `DELETE`
- URL: `http://localhost:8000/rooms/ROOM_ID_HERE`
- Headers: `Authorization: Bearer YOUR_TOKEN_HERE`

**Expected:** `200 OK`
```json
{
  "id": "room-uuid",
  "name": "Engineering Standup",
  "status": "archived",
  "archivedAt": "2026-08-22T00:00:00.000Z"
}
```

---

### Archive room — non-owner (error)

Use a different user's token (not the room owner):

```bash
curl -X DELETE http://localhost:8000/rooms/ROOM_ID_HERE \
  -H "Authorization: Bearer OTHER_USER_TOKEN"
```

**Expected:** `403 Forbidden`
```json
{ "error": "Only the room owner can archive this room" }
```

---

### Archive room — already archived (error)

```bash
curl -X DELETE http://localhost:8000/rooms/ROOM_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected:** `409 Conflict`
```json
{ "error": "Room is already archived" }
```

---

### Rooms without auth (error)

```bash
curl -X GET http://localhost:8000/rooms
```

**Expected:** `401 Unauthorized`
```json
{ "error": "Missing or invalid authorization header" }
```

---

## 4. Admin

### Archival history

```bash
curl -X GET http://localhost:8000/admin/archival-history \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Postman**
- Method: `GET`
- URL: `http://localhost:8000/admin/archival-history`
- Headers: `Authorization: Bearer YOUR_TOKEN_HERE`

**Expected:** `200 OK`
```json
{
  "history": [
    {
      "id": "uuid",
      "runDate": "2026-08-22T00:00:00.000Z",
      "roomsArchived": ["room-id-1"],
      "roomsArchivedCount": 1,
      "createdAt": "2026-08-22T00:00:05.000Z"
    }
  ]
}
```

---

## 5. Socket.io (real-time)

REST cURL cannot test Socket.io. Use **Postman Socket.io** or a client library.

**Server URL:** `http://localhost:8000`

**Handshake auth:**
```json
{
  "token": "YOUR_TOKEN_HERE"
}
```

### Connect (JavaScript example)

```javascript
const socket = io("http://localhost:8000", {
  auth: { token: "YOUR_TOKEN_HERE" },
});
```

### Join room

**Emit:** `room:join`
```json
{ "roomId": "ROOM_ID_HERE" }
```

**Listen:** `room:user-joined`
```json
{ "roomId": "ROOM_ID_HERE", "user": { "id": "uuid", "name": "Ashik Patel" } }
```

---

### Leave room

**Emit:** `room:leave`
```json
{ "roomId": "ROOM_ID_HERE" }
```

**Listen:** `room:user-left`
```json
{ "roomId": "ROOM_ID_HERE", "userId": "uuid" }
```

---

### Send message

**Emit:** `room:message`
```json
{ "roomId": "ROOM_ID_HERE", "content": "Hello team!" }
```

**Listen:** `room:new-message`
```json
{
  "id": "message-uuid",
  "roomId": "ROOM_ID_HERE",
  "content": "Hello team!",
  "createdAt": "2026-08-22T00:00:00.000Z",
  "user": { "id": "uuid", "name": "Ashik Patel" }
}
```

---

### Typing indicator

**Emit:** `room:typing`
```json
{ "roomId": "ROOM_ID_HERE" }
```

**Listen (other clients only):** `room:typing-indicator`
```json
{ "roomId": "ROOM_ID_HERE", "user": { "id": "uuid", "name": "Ashik Patel" } }
```

---

### Socket error

**Listen:** `socket:error`
```json
{ "message": "Invalid room join payload" }
```

---

### Invalid JWT at handshake (error)

Connect without token or with invalid token → connection rejected at handshake.

```
Authentication required   (missing token)
Authentication failed   (invalid token)
```

---

## Postman tips

1. Create collection variables:
   - `baseUrl` = `http://localhost:8000`
   - `token` = (set after register/login)
   - `roomId` = (set after create room)

2. Use `Authorization` → Type: **Bearer Token** → Token: `{{token}}`

3. Import any cURL above: **Import → Raw text → Paste cURL**

4. For Socket.io: New → **Socket.io** request → URL `http://localhost:8000` → Auth tab → add `token`

---

## Automated test script

Run all REST scenarios locally:

```bash
node scripts/test-api.mjs
```

Run Jest tests:

```bash
npm test
```
