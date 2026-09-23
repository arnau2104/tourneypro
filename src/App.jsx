import { Routes, Route } from 'react-router-dom'
import './App.css'
import Dashboard from './components/Dashboard'
import  Layout  from './components/Layout'
import Login from './pages/Login'
import Tournaments from './pages/Tournaments'
import Tournament from './pages/Tournament'
import Games from './pages/Games'
import Teams from './pages/Teams'
import Calendario from './pages/Calendario'
import Clasificacion from './pages/Clasificacion'
import Inscripciones from './pages/Inscripciones'



function App() {

  return (
    <Routes>
       <Route element={<Layout />} >
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/torneos" element={<Tournaments />} />
        <Route path='/torneo/:tournamentId' element={<Tournament />} />
        <Route path='/partidos' element={<Games />} />
        <Route path='/equipos' element={<Teams />} />
        <Route path='/calendario' element={<Calendario />} />
        {/* <Route path='/clasificacion' element={<Clasificacion />} /> */}
        <Route path='/inscripciones' element={<Inscripciones />} />
      </Route>
    </Routes>
  )
}

export default App
