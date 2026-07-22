import { configureStore } from '@reduxjs/toolkit'
import chatReducer from '../features/chat/chatSlice.js'
import authReducer from './authSlice.js'

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    auth: authReducer
  }
})
