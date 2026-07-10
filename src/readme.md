# CHAT APP

## Features

- Обмен сообщениями в режиме реального времени через socket.io
- JWT аутентификация с автоматическим обновлением токена
- Тёмная / светлая тема (через React Context) `useContext()`
- Работа с изображениями через Cloudinary
- Пагинация для чатов / для списка пользователей
- React Portal modals для модальных окон
- Redux Toolkit в качестве стейт-менеджера
- Protected Routes через React Router

## Tech Stack

### FrontEnd

- React
- ReduxToolkit
- ReactRouter
- Context API
- Socket.io - client
- Custom Hooks
- React Portal modals

### BackEnd

- Node.js
- Express
- MongoDB with Mongoose
- Socket.io - server (webSocket)
- JWT
- Cloudinary
- Bcrypt

## Project Structure

chat app

server

- controllers # route controllers
- middlewares # custom middlewares
- models # MongoDB models
- routes # API routes
- services # business logic
- socket # Socket.io handlers
- utils # utility functions
- index.js
