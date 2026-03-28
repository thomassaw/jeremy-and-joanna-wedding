import { useState, useCallback, createContext, useContext } from 'react'

interface Notification {
  id: number
  message: string
  type: 'error' | 'success'
}

interface NotificationContextValue {
  notify: (message: string, type?: 'error' | 'success') => void
}

const NotificationContext = createContext<NotificationContextValue>({ notify: () => {} })

export function useNotification() {
  return useContext(NotificationContext)
}

let nextId = 0

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Notification[]>([])

  const notify = useCallback((message: string, type: 'error' | 'success' = 'error') => {
    const id = nextId++
    setItems((prev) => [...prev, { id, message, type }])
    setTimeout(() => setItems((prev) => prev.filter((n) => n.id !== id)), 4000)
  }, [])

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className="toast-container">
        {items.map((n) => (
          <div key={n.id} className={`toast toast-${n.type}`}>
            {n.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}
