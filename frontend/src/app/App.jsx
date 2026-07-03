
import './App.css'
import { RouterProvider } from 'react-router'
import { routes } from './app.routes'

function App() {

  return (
    <>
      <h1>Hello</h1>
      <h1>Hello world</h1>
      <RouterProvider router={routes} />
    </>
  )
}

export default App
