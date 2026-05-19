import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Dashboard from './components/Dashboard'
import  Layout  from './components/Layout'
import Login from './pages/Login'
import Tournaments from './pages/Tournaments'
import Tournament from './pages/Tournament'
import Games from './pages/Games'
import Teams from './pages/Teams'



function App() {

  return (
    <BrowserRouter basename='/'>
      <Routes>
         <Route element={<Layout />} >
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/torneos" element={<Tournaments />} />
          <Route path='/torneo' element={<Tournament />} />
          <Route path='/partidos' element={<Games />} />
          <Route path='/equipos' element={<Teams />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
