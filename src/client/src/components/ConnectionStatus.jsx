import { useSelector } from 'react-redux'

export const ConnectionStatus = () => {
  const { connected, socketId, disconnectReason } = useSelector(
    state => state.chat
  )

  return (
    <section>
      <h2>Подключение</h2>

      <p>
        Статус: <strong>{connected ? 'подключено' : 'отключено'}</strong>
      </p>

      {socketId && <p>Socket ID: {socketId}</p>}

      {disconnectReason && <p>Причина отключения: {disconnectReason}</p>}
    </section>
  )
}
