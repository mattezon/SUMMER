# Chat Application - API Reference

## Base URL
```
http://localhost:5000
```

## Authentication
Most endpoints require JWT authentication. Tokens are automatically set as cookies during login/register.

---

## AUTH ENDPOINTS

### Register User
```
POST /auth/register
Content-Type: application/json

Request:
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}

Response: 201
{
  "user": {
    "_id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "avatar": ""
  }
}

Cookies Set: accessToken, refreshToken
```

### Login User
```
POST /auth/login
Content-Type: application/json

Request:
{
  "email": "john@example.com",
  "password": "password123"
}

Response: 200
{
  "user": {
    "_id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "avatar": ""
  }
}

Cookies Set: accessToken, refreshToken
```

### Refresh Token
```
POST /auth/refresh
(No body needed - uses refreshToken cookie)

Response: 200
{
  "_id": "user_id",
  "username": "john_doe",
  "email": "john@example.com",
  "avatar": ""
}

Cookies Updated: accessToken, refreshToken
```

### Check Auth Status
```
GET /auth/check
(Protected - requires authentication)

Response: 200
{
  "_id": "user_id",
  "username": "john_doe",
  "email": "john@example.com",
  "avatar": ""
}
```

### Logout
```
POST /auth/logout
(Clears cookies)

Response: 200
{
  "message": "You have successfully logged out"
}
```

---

## CHAT ENDPOINTS

### Create Message
```
POST /messages
Content-Type: application/json
(Protected - requires authentication)

Request:
{
  "content": "Hello everyone!",
  "emotion": "happy",
  "room": "general"
}

Note: emotion is optional (default: "neutral")
      room is optional (default: "general")

Response: 201
{
  "_id": "message_id",
  "sender": {
    "_id": "user_id",
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
```

### Get Messages
```
GET /messages?room=general&limit=50&skip=0
(Public - no authentication required)

Query Parameters:
- room (optional, default: "general") - Chat room name
- limit (optional, default: 50) - Max messages to return
- skip (optional, default: 0) - Pagination offset

Response: 200
{
  "messages": [
    {
      "_id": "message_id",
      "sender": {
        "_id": "user_id",
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

### Get Single Message
```
GET /messages/:messageId
(Public - no authentication required)

URL Parameters:
- messageId (required) - Message ID

Response: 200
{
  "_id": "message_id",
  "sender": {
    "_id": "user_id",
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
```

### Update Message Emotion
```
PUT /messages/:messageId/emotion
Content-Type: application/json
(Protected - requires authentication)

URL Parameters:
- messageId (required) - Message ID

Request:
{
  "emotion": "love"
}

Emotion Options:
- happy
- sad
- angry
- surprised
- neutral
- love

Response: 200
{
  "_id": "message_id",
  "sender": { ... },
  "content": "Hello everyone!",
  "emotion": "love",
  "room": "general",
  "createdAt": "2026-07-17T10:30:00.000Z",
  "updatedAt": "2026-07-17T10:30:00.000Z"
}
```

### Delete Message
```
DELETE /messages/:messageId
(Protected - requires authentication)
(Only message owner can delete)

URL Parameters:
- messageId (required) - Message ID

Response: 200
{
  "message": "Message deleted successfully"
}
```

---

## ERROR RESPONSES

### 400 Bad Request
```json
{
  "message": "Username, email and password are required"
}
```

### 401 Unauthorized
```json
{
  "message": "You are not authorized"
}
```

### 403 Forbidden
```json
{
  "message": "You can only delete your own messages"
}
```

### 404 Not Found
```json
{
  "message": "User not found"
}
```

### 409 Conflict
```json
{
  "message": "User with this email or username already exists"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

---

## SOCKET.IO EVENTS

### Client → Server

**joinRoom**
```javascript
socket.emit('joinRoom', { room: 'general' })
```

**sendMessage**
```javascript
socket.emit('sendMessage', {
  content: 'Hello world!',
  emotion: 'happy' // optional, default: 'neutral'
})
```

**emotion** (broadcast to all users in room)
```javascript
socket.emit('emotion', {
  emotion: 'love',
  messageId: 'message_id'
})
```

**typing**
```javascript
socket.emit('typing', { isTyping: true })
```

**leaveRoom**
```javascript
socket.emit('leaveRoom', { room: 'general' })
```

### Server → Client

**messageReceived**
```javascript
socket.on('messageReceived', (message) => {
  // {
  //   _id, sender, content, emotion, room, createdAt, updatedAt
  // }
})
```

**emotionReceived** (broadcasted to all room members)
```javascript
socket.on('emotionReceived', (emotionData) => {
  // {
  //   username: 'john_doe',
  //   userId: 'user_id',
  //   emotion: 'love',
  //   messageId: 'message_id',
  //   timestamp: '2026-07-17T10:30:00.000Z'
  // }
})
```

**userJoined**
```javascript
socket.on('userJoined', (userData) => {
  // {
  //   username: 'john_doe',
  //   userId: 'user_id',
  //   message: 'john_doe joined the chat'
  // }
})
```

**userLeft**
```javascript
socket.on('userLeft', (userData) => {
  // {
  //   username: 'john_doe',
  //   userId: 'user_id',
  //   message: 'john_doe left the chat'
  // }
})
```

**userTyping**
```javascript
socket.on('userTyping', (data) => {
  // {
  //   username: 'john_doe',
  //   isTyping: true
  // }
})
```

**error**
```javascript
socket.on('error', (error) => {
  // { message: 'error message' }
})
```

---

## STATUS CODES

| Code | Meaning |
|------|---------|
| 200 | OK - Success |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required or failed |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error - Server error |

---

## Example Client Implementation (React)

```javascript
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

function ChatApp() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [accessToken, setAccessToken] = useState(null);

  // Connect to socket when component mounts
  useEffect(() => {
    if (accessToken) {
      const newSocket = io('http://localhost:5000', {
        auth: {
          token: accessToken
        }
      });

      newSocket.on('connect', () => {
        console.log('Connected');
        newSocket.emit('joinRoom', { room: 'general' });
      });

      newSocket.on('messageReceived', (message) => {
        setMessages(prev => [...prev, message]);
      });

      newSocket.on('emotionReceived', (emotion) => {
        console.log('Emotion received:', emotion);
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      setSocket(newSocket);

      return () => newSocket.disconnect();
    }
  }, [accessToken]);

  // Send message function
  const sendMessage = (content, emotion = 'neutral') => {
    if (socket) {
      socket.emit('sendMessage', { content, emotion });
    }
  };

  // Send emotion reaction
  const sendEmotion = (emotion, messageId) => {
    if (socket) {
      socket.emit('emotion', { emotion, messageId });
    }
  };

  return (
    <div className="chat-app">
      {/* Your UI here */}
    </div>
  );
}

export default ChatApp;
```
