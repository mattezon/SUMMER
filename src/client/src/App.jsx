import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSocket } from './hooks/useSocket'
import { ConnectionStatus } from './components/ConnectionStatus'
import { ChatRoom } from './components/ChatRoom'
import { AuthPage } from './components/AuthPage'
import { setUser, clearUser, setError, setLoading } from './app/authSlice.js'

function App() {
  const dispatch = useDispatch()
  const { user, loading, error } = useSelector(state => state.auth)

  useSocket(!!user)

  useEffect(() => {
    const checkAuth = async () => {
      dispatch(setLoading(true))
      try {
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/check`, {
          method: 'GET',
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error('Not authenticated')
        }

        const data = await response.json()
        dispatch(setUser(data))
      } catch (err) {
        dispatch(clearUser())
        dispatch(setError(null))
      }
    }

    checkAuth()
  }, [dispatch])

  const handleLogout = async () => {
    await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    })
    dispatch(clearUser())
  }

  if (loading) {
    return <main>Загрузка...</main>
  }

  if (!user) {
    return (
      <main>
        <h1>Socket IO Chat</h1>
        <AuthPage />
      </main>
    )
  }

  return (
    <main>
      <h1>Socket IO Chat</h1>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <p>Пользователь: {user.username}</p>
          <button type='button' onClick={handleLogout}>Выйти</button>
        </div>
        <ConnectionStatus />
      </div>

      <hr />
      <ChatRoom />

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </main>
  )
}

export default App
