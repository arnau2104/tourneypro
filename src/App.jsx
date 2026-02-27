import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Dashboard from './components/Dashboard'
import  Layout  from './components/Layout'
import Login from './pages/Login'
import Tournaments from './pages/Tournaments'
import Tournament from './pages/Tournament'



function App() {

  return (
    <BrowserRouter basename='/'>
      <Routes>
         <Route element={<Layout />} >
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/torneos" element={<Tournaments />} />
          <Route path='/torneo' element={<Tournament />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
