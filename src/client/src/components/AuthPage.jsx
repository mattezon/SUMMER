import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setUser, setError } from '../app/authSlice.js'

export const AuthPage = () => {
  const dispatch = useDispatch()
  const authError = useSelector(state => state.auth.error)
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoadingState] = useState(false)

  const endpoint = mode === 'login' ? 'login' : 'register'

  const handleSubmit = async event => {
    event.preventDefault()
    setLoadingState(true)
    dispatch(setError(null))

    const payload = mode === 'login'
      ? { email, password }
      : { username, email, password }

    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed')
      }

      dispatch(setUser(data.user))
      setUsername('')
      setEmail('')
      setPassword('')
    } catch (error) {
      dispatch(setError(error.message))
    } finally {
      setLoadingState(false)
    }
  }

  return (
    <section>
      <h2>{mode === 'login' ? 'Вход' : 'Регистрация'}</h2>

      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <label>
            Имя
            <input
              type='text'
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder='Username'
              required
            />
          </label>
        )}

        <label>
          Email
          <input
            type='email'
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder='Email'
            required
          />
        </label>

        <label>
          Пароль
          <input
            type='password'
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder='Password'
            required
          />
        </label>

        <button type='submit' disabled={loading}>
          {loading ? 'Отправка...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
        </button>
      </form>

      {authError && <p style={{ color: 'red' }}>{authError}</p>}

      <p>
        {mode === 'login'
          ? 'Нет аккаунта?'
          : 'Уже есть аккаунт?'}
        {' '}
        <button type='button' onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Регистрация' : 'Войти'}
        </button>
      </p>
    </section>
  )
}

