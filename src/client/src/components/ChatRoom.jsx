import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { socket } from '../socket/socket.js'

import {
  roomJoined,
  roomLeft,
  setMessages,
  messageReceived,
  eventReceived,
  socketError
} from '../features/chat/chatSlice.js'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'

export const ChatRoom = () => {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const { connected, roomId, messages, events, error } = useSelector(
    state => state.chat
  )

  const [users, setUsers] = useState([])
  const [chats, setChats] = useState([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [text, setText] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingChats, setLoadingChats] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)

  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const response = await fetch(`${SERVER_URL}/users`, {
        credentials: 'include'
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Не удалось загрузить пользователей')
      }
      setUsers(data.users || [])
    } catch (fetchError) {
      dispatch(socketError(fetchError.message))
    } finally {
      setLoadingUsers(false)
    }
  }

  const fetchChats = async () => {
    setLoadingChats(true)
    try {
      const response = await fetch(`${SERVER_URL}/chats`, {
        credentials: 'include'
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Не удалось загрузить чаты')
      }
      setChats(data.chats || [])
    } catch (fetchError) {
      dispatch(socketError(fetchError.message))
    } finally {
      setLoadingChats(false)
    }
  }

  const fetchMessages = async chatId => {
    if (!chatId) return
    setLoadingMessages(true)
    try {
      const response = await fetch(`${SERVER_URL}/chats/${chatId}/messages`, {
        credentials: 'include'
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Не удалось загрузить сообщения')
      }
      dispatch(setMessages(data.messages || []))
    } catch (fetchError) {
      dispatch(socketError(fetchError.message))
    } finally {
      setLoadingMessages(false)
    }
  }

  useEffect(() => {
    if (!user) return
    fetchUsers()
    fetchChats()
  }, [user])

  const openChat = async chatId => {
    if (!connected || !chatId) return

    if (roomId) {
      socket.emit('leaveRoom', { room: roomId })
      dispatch(roomLeft())
    }

    socket.emit('joinRoom', { room: chatId })
    dispatch(roomJoined(chatId))
    await fetchMessages(chatId)
  }

  const startChatWithUser = async otherUserId => {
    if (!otherUserId || !user) return

    try {
      const response = await fetch(`${SERVER_URL}/chats`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: otherUserId })
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Не удалось создать чат')
      }
      await fetchChats()
      openChat(data._id)
    } catch (fetchError) {
      dispatch(socketError(fetchError.message))
    }
  }

  const handleSendMessage = event => {
    event.preventDefault()
    if (!text.trim() || !roomId) return

    socket.emit('sendMessage', {
      content: text,
      emotion: 'neutral',
      chatId: roomId,
      room: roomId
    })

    setText('')
  }

  return (
    <section>
      <h2>Чат</h2>

      <div style={{ display: 'grid', gap: '1rem' }}>
        <div>
          <strong>Пользователь:</strong> {user?.username}
        </div>
        <div>
          <strong>Статус:</strong> {connected ? 'Онлайн' : 'Отключено'}
        </div>
        <div>
          <strong>Комната:</strong> {roomId || 'Не выбрана'}
        </div>
      </div>

      <hr />

      <section>
        <h3>Список пользователей</h3>
        {loadingUsers ? (
          <p>Загрузка пользователей...</p>
        ) : (
          <ul>
            {users.map(other => (
              <li key={other._id} style={{ marginBottom: '0.5rem' }}>
                {other.username} ({other.email})
                <button
                  type='button'
                  onClick={() => startChatWithUser(other._id)}
                  style={{ marginLeft: '0.5rem' }}
                >
                  Начать чат
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3>Мои чаты</h3>
        {loadingChats ? (
          <p>Загрузка чатов...</p>
        ) : (
          <ul>
            {chats.map(chat => (
              <li key={chat._id}>
                <button type='button' onClick={() => openChat(chat._id)}>
                  {chat.title || `Чат ${chat._id.slice(0, 6)}`}
                </button>
                <span style={{ marginLeft: '0.5rem' }}>
                  {chat.members.map(member => member.username).join(', ')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <hr />

      <section>
        <h3>Сообщения</h3>
        {loadingMessages && <p>Загрузка сообщений...</p>}
        <ul>
          {messages.map(message => (
            <li key={message._id}>
              <strong>{message.sender?.username || 'Unknown'}:</strong>{' '}
              {message.content}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>События</h3>
        <ul>
          {events.map((event, index) => (
            <li key={index}>{event.text}</li>
          ))}
        </ul>
      </section>

      <form onSubmit={handleSendMessage} style={{ marginTop: '1rem' }}>
        <input
          type='text'
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={roomId ? 'Введите сообщение...' : 'Выберите чат'}
          disabled={!roomId}
          style={{ width: '70%' }}
        />
        <button type='submit' disabled={!roomId || !text.trim()}>
          Отправить
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </section>
  )
}
