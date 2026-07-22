import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  connected: false,
  socketId: null,
  disconnectReason: null,
  roomId: '',
  messages: [],
  events: [],
  error: null
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    socketConnected(state, action) {
      state.connected = true
      state.socketId = action.payload
      state.disconnectReason = null
      state.error = null
    },
    socketDisconnected(state, action) {
      state.connected = false
      state.socketId = null
      state.disconnectReason = action.payload
    },
    roomJoined(state, action) {
      state.roomId = action.payload
      state.messages = []
      state.events = []
      state.error = null
    },
    roomLeft(state) {
      state.roomId = ''
      state.messages = []
      state.events = []
    },
    setMessages(state, action) {
      state.messages = action.payload
    },
    messageReceived(state, action) {
      state.messages.push(action.payload)
    },
    eventReceived(state, action) {
      state.events.push(action.payload)
    },
    socketError(state, action) {
      state.error = action.payload
    },
    clearError(state) {
      state.error = null
    }
  }
})

export const {
  socketConnected,
  socketDisconnected,
  roomJoined,
  roomLeft,
  messageReceived,
  eventReceived,
  socketError,
  clearError
} = chatSlice.actions

export default chatSlice.reducer
