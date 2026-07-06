import './App.css'
import { RouterProvider } from 'react-router'
import { routes } from './app.routes'
import { useSelector } from 'react-redux'
import { useAuth } from '../features/auth/hook/useAuth'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'


function App() {


  const { handleGetMe } = useAuth()

  const user = useSelector(state => state.auth.user)

  console.log(user)

  useEffect(() => {
    handleGetMe()
  }, [])

  return (
    <>
      <Toaster 
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#1b1c1a',
            color: '#C9A96E',
            fontFamily: "'Inter', sans-serif",
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            borderRadius: '0px',
            border: '1px solid #C9A96E'
          },
          success: {
            iconTheme: {
              primary: '#C9A96E',
              secondary: '#1b1c1a',
            },
          },
        }}
      />
      <RouterProvider router={routes} />
    </>
  )
}

export default App