import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { socket } from '../socket/socket.js'

import {
  socketConnected,
  socketDisconnected,
  messageReceived,
  eventReceived,
  socketError
} from '../features/chat/chatSlice.js'

export const useSocket = active => {
  const dispatch = useDispatch()

  useEffect(() => {
    const handleConnect = () => {
      console.log('Socket connected: ', socket.id)
      dispatch(socketConnected(socket.id))
    }

    const handleDisconnect = reason => {
      console.log('Socket disconnected: ', reason)
      dispatch(socketDisconnected(reason))
    }

    const handleConnectError = error => {
      console.log('Connection error: ', error.message)
      dispatch(socketError(error.message))
    }

    const handleConnectFailed = error => {
      console.log('Connect failed: ', error)
      dispatch(socketError(error?.message || 'Connect failed'))
    }

    const handleNewMessage = message => {
      console.log('New message: ', message)
      dispatch(messageReceived(message))
    }

    const handleUserJoined = data => {
      console.log('User joined: ', data)
      dispatch(
        eventReceived({
          type: 'userJoined',
          text: `${data.username} вошёл в комнату`
        })
      )
    }

    const handleUserLeft = data => {
      console.log('User left: ', data)
      dispatch(
        eventReceived({
          type: 'userLeft',
          text: `${data.username} вышел из комнаты`
        })
      )
    }

    const handleMessageError = error => {
      console.error('Message error: ', error)
      dispatch(socketError(error.message || 'Ошибка отправки сообщения'))
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', handleConnectError)

    socket.on('messageReceived', handleNewMessage)
    socket.on('newMessage', handleNewMessage)
    socket.on('userJoined', handleUserJoined)
    socket.on('userLeft', handleUserLeft)
    socket.on('message_send_error', handleMessageError)
    socket.on('error', handleMessageError)

    if (active) {
      socket.connect()
    }

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('connect_error', handleConnectError)

      socket.off('messageReceived', handleNewMessage)
      socket.off('newMessage', handleNewMessage)
      socket.off('userJoined', handleUserJoined)
      socket.off('userLeft', handleUserLeft)
      socket.off('message_send_error', handleMessageError)
      socket.off('error', handleMessageError)

      if (active) {
        socket.disconnect()
      }
    }
  }, [dispatch, active])
}
