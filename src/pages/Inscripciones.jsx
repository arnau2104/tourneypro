import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { refreshToken } from '../services/refreshToken'
import { Calendar, Trophy, Users, NotebookPen, Eye, Search } from 'lucide-react'
import { TbTournament } from 'react-icons/tb'
import { FaMapPin } from 'react-icons/fa6'

function Inscripciones() {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showInput, setShowInput] = useState(false)
  const [searchText, setSearchText] = useState('')

  const navigate = useNavigate()

  function ucFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  function statusClass(status) {
    if (status === 'próximamente') return 'proximamente'
    if (status === 'iniciado') return 'iniciado'
    if (status === 'en curso') return 'iniciado'
    if (status === 'finalizado') return 'finalizado'
    if (status === 'cerrado') return 'cancelado'
    return 'cancelado'
  }

  useEffect(() => {
    getMyInscriptions()
  }, [])

  function getMyInscriptions() {
    setLoading(true)

    fetch('/api/getMyInscriptions', {
      method: 'GET',
      credentials: 'include',
    })
      .then(async (res) => {
        if (res.status === 401) {
          const refreshOk = await refreshToken()

          if (!refreshOk) {
            navigate('/login')
            return
          }

          const retryFetch = await fetch('/api/getMyInscriptions', {
            method: 'GET',
            credentials: 'include',
          })

          return retryFetch.json()
        }

        return res.json()
      })
      .then((data) => {
        console.log('Data:', data)
        if (data.error) return console.log('No hay datos')

        setRegistrations(data.registrations || [])
      })
      .catch((error) => {
        console.log('Error al obtener las inscripciones:', error.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const filteredRegistrations = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase()

    return registrations.filter((registration) => {
      const tournamentName = String(registration.tournament_name || '').toLowerCase()
      const teamName = String(registration.team_name || '').toLowerCase()

      return normalizedSearch === '' || tournamentName.includes(normalizedSearch) || teamName.includes(normalizedSearch)
    })
  }, [registrations, searchText])

  return (
    <section className='torneos-section'>
      <div className='torneo-header'>
        <div>
          <h1>Mis Inscripciones</h1>
          <p>Consulta los torneos en los que tus equipos están inscritos</p>
        </div>
      </div>

      <div className='search-container'>
        <label htmlFor='search-inscription'>
          <Search onClick={() => setShowInput(!showInput)} />
          {showInput && (
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              id='search-inscription'
              name='search-inscription'
              type='text'
              placeholder='Buscar inscripción...'
            />
          )}
        </label>
      </div>

      {loading ? (
        <div className='empty-state'>
          <p>Cargando inscripciones...</p>
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className='empty-state'>
          <p>No tienes inscripciones disponibles.</p>
          <p>Inscribe a tu equipo en un torneo desde el apartado de Torneos para verlo aquí.</p>
        </div>
      ) : (
        <section className='tournaments-container'>
          {filteredRegistrations.map((registration) => (
            <div key={`${registration.tournament_id}-${registration.team_id}`} className='tournament-card'>
              <p className='tournament-title'>{registration.tournament_name}</p>
              <ul>
                <li><Users /> Equipo inscrito: <p>{registration.team_name}</p></li>
                <li><TbTournament /> {ucFirst(registration.tournament_type?.replace(',', ' \n +\n') || '')}</li>
                <li><NotebookPen /> {registration.inscription_price_per_team}€ (por equipo)</li>
                <li><FaMapPin /> {registration.location}</li>
                <li><Calendar /> {registration.start_date ? new Date(registration.start_date).toLocaleDateString() : '-'}</li>
                <li><Trophy /> {ucFirst(registration.tournament_prize || '')}</li>
              </ul>
              <div className='card-buttons'>
                <NavLink to={`/torneo/${registration.tournament_id}`}>
                  <button><Eye /></button>
                </NavLink>
                <p className={`game-status ${statusClass(registration.tournament_status)}`}>{ucFirst(registration.tournament_status || 'Sin estado')}</p>
              </div>
            </div>
          ))}
        </section>
      )}
    </section>
  )
}

export default Inscripciones
