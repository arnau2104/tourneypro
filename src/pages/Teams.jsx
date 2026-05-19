import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { refreshToken } from '../services/refreshToken'
import { Search, Users } from 'lucide-react'

function Teams() {
  const [teams, setTeams] = useState([])
  const [filteredTeams, setFilteredTeams] = useState([])
  const [searchText, setSearchText] = useState('')
  const [filterOption, setFilterOption] = useState('all')
  const [showInput, setShowInput] = useState(false)
  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()

  useEffect(() => {
    getTeamsData()
  }, [])

  useEffect(() => {
    const normalizedSearch = searchText.trim().toLowerCase()
    const filtered = teams.filter((team) => {
      const name = String(team.team_name || '').toLowerCase()
      const matchesSearch = normalizedSearch === '' || name.includes(normalizedSearch)

      if (!matchesSearch) return false
      if (filterOption === 'withShield') return Boolean(team.team_shield)
      if (filterOption === 'withoutShield') return !team.team_shield
      return true
    })

    setFilteredTeams(filtered)
  }, [teams, searchText, filterOption])

  function getTeamsData() {
    setLoading(true)

    fetch('/api/getTeams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
      .then(async (res) => {
        if (res.status === 401) {
          const refreshOk = await refreshToken()

          if (!refreshOk) {
            navigate('/login')
            return
          }

          const retryFetch = await fetch('/api/getTeams', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          })

          return retryFetch.json()
        }

        return res.json()
      })
      .then((data) => {
        console.log('Data:', data)
        if (data.error) return console.log('No hay datos')

        setTeams(Array.isArray(data) ? data : [])
      })
      .catch((error) => {
        console.log('Error al obtener equipos:', error.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <section className='torneos-section'>
      <div className='torneo-header'>
        <div>
          <h1>Equipos</h1>
          <p>Explora tus equipos creados y administra su identidad</p>
        </div>
      </div>

      <div className='search-container'>
        <select value={filterOption} onChange={(e) => setFilterOption(e.target.value)}>
          <option value='all'>Todos los equipos</option>
          <option value='withShield'>Equipos con escudo</option>
          <option value='withoutShield'>Equipos sin escudo</option>
        </select>
        <label htmlFor='search-team'>
          <Search onClick={() => setShowInput(!showInput)} />
          {showInput && (
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              id='search-team'
              name='search-team'
              type='text'
              placeholder='Buscar equipo...'
            />
          )}
        </label>
      </div>

      {loading ? (
        <div className='empty-state'>
          <p>Cargando equipos...</p>
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className='empty-state'>
          <p>No hay equipos disponibles.</p>
          <p>Crealos desde el panel de gestión para verlos aquí.</p>
        </div>
      ) : (
        <section className='tournaments-container teams-container'>
          {filteredTeams.map((team) => (
            <div key={team.team_id} className='tournament-card team-card'>
              <div className='team-card-header'>
                <div className='team-shield-card'>
                  {team.team_shield ? (
                    <img src={team.team_shield} alt={team.team_name || 'Equipo'} />
                  ) : (
                    <span>{String(team.team_name || 'Equipo').slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <p className='tournament-title'>{team.team_name || 'Equipo'}</p>
                </div>
              </div>

              <ul>
                <li>
                  <Users /> Fundador: {team.founder_id|| 'Sin información'}
                </li>
                <li>
                  <Users /> {team.team_players_count ?? 0} jugadores
                </li>
              </ul>
            </div>
          ))}
        </section>
      )}
    </section>
  )
}

export default Teams