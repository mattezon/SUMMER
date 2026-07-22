# Chat Application - Complete Testing Guide

## Setup Instructions

### 1. Navigate to server directory
```bash
cd src/server
```

### 2. Install dependencies (if not already done)
```bash
npm install
```

### 3. Verify MongoDB connection
- Your `.env` file already contains MongoDB Atlas connection string
- MongoDB is ready to use

### 4. Start the server
```bash
npm run dev
```
Expected output:
```
MongoDB connected successfully
Server is running on PORT: 5000
```

---

## Testing with Postman

### Step 1: Register a User

**Request:**
```
POST http://localhost:5000/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Response (201):**
```json
{
  "user": {
    "_id": "66a1b2c3d4e5f6g7h8i9j0k1",
    "username": "john_doe",
    "email": "john@example.com",
    "avatar": ""
  }
}
```

**Note:** Cookies will be automatically set (accessToken, refreshToken)

---

### Step 2: Login (if needed)

**Request:**
```
POST http://localhost:5000/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Response (200):**
```json
{
  "user": {
    "_id": "66a1b2c3d4e5f6g7h8i9j0k1",
    "username": "john_doe",
    "email": "john@example.com",
    "avatar": ""
  }
}
```

---

### Step 3: Create a Message (requires authentication)

**Request:**
```
POST http://localhost:5000/messages
Content-Type: application/json

{
  "content": "Hello everyone! This is my first message.",
  "emotion": "happy",
  "room": "general"
}
```

**Note:** Postman will automatically send cookies with authentication

**Expected Response (201):**
```json
{
  "_id": "66a1b2c3d4e5f6g7h8i9j0k1",
  "sender": {
    "_id": "66a1b2c3d4e5f6g7h8i9j0k1",
    "username": "john_doe",
    "email": "john@example.com",
    "avatar": ""
  },
  "content": "Hello everyone! This is my first message.",
  "emotion": "happy",
  "room": "general",
  "createdAt": "2026-07-17T10:30:00.000Z",
  "updatedAt": "2026-07-17T10:30:00.000Z"
}
```

---

### Step 4: Get All Messages

**Request:**
```
GET http://localhost:5000/messages?room=general&limit=50&skip=0
```

**Expected Response (200):**
```json
{
  "messages": [
    {
      "_id": "66a1b2c3d4e5f6g7h8i9j0k1",
      "sender": {
        "_id": "66a1b2c3d4e5f6g7h8i9j0k1",
        "username": "john_doe",
        "email": "john@example.com",
        "avatar": ""
      },
      "content": "Hello everyone!",
      "emotion": "happy",
      "room": "general",
      "createdAt": "2026-07-17T10:30:00.000Z",
      "updatedAt": "2026-07-17T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

---

### Step 5: Update Message Emotion

**Request:**
```
PUT http://localhost:5000/messages/66a1b2c3d4e5f6g7h8i9j0k1/emotion
Content-Type: application/json

{
  "emotion": "love"
}
```

**Expected Response (200):**
```json
{
  "_id": "66a1b2c3d4e5f6g7h8i9j0k1",
  "sender": {
    "_id": "66a1b2c3d4e5f6g7h8i9j0k1",
    "username": "john_doe",
    "email": "john@example.com",
    "avatar": ""
  },
  "content": "Hello everyone!",
  "emotion": "love",
  "room": "general",
  "createdAt": "2026-07-17T10:30:00.000Z",
  "updatedAt": "2026-07-17T10:30:00.000Z"
}
```

---

### Step 6: Delete a Message

**Request:**
```
DELETE http://localhost:5000/messages/66a1b2c3d4e5f6g7h8i9j0k1
```

**Expected Response (200):**
```json
{
  "message": "Message deleted successfully"
}
```

---

## Testing Socket.IO (Real-time Chat & Emotions)

### Option 1: Use Socket.IO Test Client

1. Visit: https://socket.io/docs/v4/socket-io-client-tool/

### Option 2: JavaScript/Node.js Test Script

Create a file `test-socket.js`:

```javascript
import { io } from 'socket.io-client';

const accessToken = 'YOUR_ACCESS_TOKEN_HERE'; // Get from login response

const socket = io('http://localhost:5000', {
  auth: {
    token: accessToken
  }
});

// Connection handlers
socket.on('connect', () => {
  console.log('Connected to server');
  
  // Join room
  socket.emit('joinRoom', { room: 'general' });
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

socket.on('userJoined', (data) => {
  console.log('User joined:', data);
});

socket.on('messageReceived', (message) => {
  console.log('New message:', message);
});

socket.on('emotionReceived', (emotion) => {
  console.log('Emotion received:', emotion);
  // emotion = { username, userId, emotion, messageId, timestamp }
});

socket.on('userTyping', (data) => {
  console.log('User typing:', data);
});

socket.on('userLeft', (data) => {
  console.log('User left:', data);
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
});

// Send a message after 2 seconds
setTimeout(() => {
  socket.emit('sendMessage', {
    content: 'Hello from socket test!',
    emotion: 'happy'
  });
}, 2000);

// Send an emotion reaction after 5 seconds
setTimeout(() => {
  socket.emit('emotion', {
    emotion: 'love',
    messageId: 'message-id-from-first-response'
  });
}, 5000);

// Typing indicator
socket.emit('typing', { isTyping: true });

// After 3 seconds stop typing
setTimeout(() => {
  socket.emit('typing', { isTyping: false });
}, 3000);
```

Run it:
```bash
node test-socket.js
```

---

## Testing Emotion Broadcasting

The emotion system broadcasts to ALL participants in a room:

1. **User A sends message** → Message saved to DB
2. **User B receives message** via Socket → via `messageReceived` event
3. **User B reacts with emotion** → Emits `emotion` event
4. **All users in room receive emotion** → via `emotionReceived` event with:
   - `emotion`: The emotion type (love, happy, etc.)
   - `userId`: Who reacted
   - `username`: Username of reactor
   - `messageId`: Which message was reacted to
   - `timestamp`: When reaction occurred

---

## Emotion Types Available

```
- happy
- sad
- angry
- surprised
- neutral (default)
- love
```

---

## Expected Chat Flow

```
1. User connects with Socket.IO (authenticated with JWT token)
2. User joins a room: joinRoom({ room: 'general' })
3. All users in that room see: userJoined event
4. User sends message: sendMessage({ content, emotion })
5. All users receive: messageReceived event with full message data
6. User reacts: emotion({ emotion, messageId })
7. All users receive: emotionReceived event with reaction data
8. User types: typing({ isTyping: true })
9. Other users see: userTyping event
10. User leaves: disconnect or leaveRoom
11. All users see: userLeft event
```

---

## Troubleshooting

### "You are not authorized" error
- Make sure you're including authentication cookies in requests
- Postman should auto-send cookies if they were set during login

### Socket connection fails
- Check that the token is valid (not expired)
- Verify CORS settings match CLIENT_URL in .env
- Check MongoDB connection is active

### Message not saving
- Verify MongoDB Atlas connection string in .env
- Check that user exists in database
- Check console logs for specific error

### Emotion not broadcasting
- Ensure all users are in the same room
- Check socket connection is active for all users
- Verify messageId is valid

---

## MongoDB Collections Created

After running the server, you'll have these collections in MongoDB:

1. **users** - Stores user accounts
2. **messages** - Stores chat messages with emotion and room info

You can verify in MongoDB Atlas:
- Go to Database → Collections
- Should see two collections: `users` and `messages`

---

## Next Steps

1. **Connect Frontend**: Use socket.io-client library in your React/Vue frontend
2. **Add User Avatars**: Implement image upload for avatars
3. **Enhance UI**: Display emotions visually
4. **Add More Features**:
   - Direct messaging between users
   - Room creation/management
   - Message search
   - User profiles
   - Message editing

All endpoints and socket events are now fully functional!
