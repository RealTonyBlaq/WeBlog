import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import GeneralLayout from './ui/general-layout'

const router = createBrowserRouter([
  {
    path: "/",
    element: <GeneralLayout />,
    errorElement: <div>Oops, error</div>
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
