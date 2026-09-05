import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { refreshToken } from '../services/refreshToken'
import { Search, Users,Flame,Pen ,Crown,UserRoundPlus,Plus,Minus} from 'lucide-react'
import EditTeam from '../components/EditTeam'
import { useContext } from 'react'
import { AuthContext } from '../context/userContext'

function Teams() {
  const [teams, setTeams] = useState([])
  const [userTeams, setUserTeams] = useState([])
  const [players, setPlayers] = useState([])
  const [games, setGames] = useState([])
  const [filteredTeams, setFilteredTeams] = useState([])
  const [searchText, setSearchText] = useState('')
  const [filterOption, setFilterOption] = useState('all')
  const [showInput, setShowInput] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editTeam, setEditTeam] = useState(null)
  const { user } = useContext(AuthContext);

  const navigate = useNavigate()

  function handleEditTeam(team) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    setEditTeam(team)
  }

  function handleTeamSaved(updatedTeam) {
    setTeams((prevTeams) =>
      prevTeams.map((team) =>
        team.team_id === updatedTeam.team_id ? updatedTeam : team
      )
    )

    setUserTeams((prevTeams) =>
      prevTeams.map((team) =>
        team.team_id === updatedTeam.team_id ? updatedTeam : team
      )
    )

    setEditTeam(null)
  }

  useEffect(() => {
    getTeamsData();
    getGames();
    getAllTeams();

  }, [])


  useEffect(() => {
    const normalizedSearch = searchText.trim().toLowerCase()
    const filtered = teams.filter((team) => {
      const name = String(team.team_name || '').toLowerCase()
      const matchesSearch = normalizedSearch === '' || name.includes(normalizedSearch)

      if (!matchesSearch) return false

      if (filterOption === 'myTeams') {
        const isMyTeam = Number(team.founder_id) === Number(user?.user_id) ||
          userTeams.some((userTeam) => Number(userTeam.team_id) === Number(team.team_id))

        return isMyTeam
      }

      return true
    })

    setFilteredTeams(filtered)
  }, [teams, userTeams, searchText, filterOption, user?.user_id])

  function getTeamsData() {
    setLoading(true)

    fetch('/api/getUserTeams', {
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

          const retryFetch = await fetch('/api/getUserTeams', {
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

        setUserTeams(data.teams || [])
        setPlayers(data.players || [])
      })
      .catch((error) => {
        console.log('Error al obtener equipos:', error.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  function getGames() {
    setLoading(true)

    fetch('/api/getGames', {
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

          const retryFetch = await fetch('/api/getGames', {
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

        setGames(data.games || [])
      })
      .catch((error) => {
        console.log('Error al obtener partidos:', error.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }

   function getAllTeams() {
    setLoading(true)

    fetch('/api/getAllTeams', {
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

          const retryFetch = await fetch('/api/getAllTeams', {
            method: 'GET',
            credentials: 'include',
          })

          return retryFetch.json()
        }

        return res.json()
      })
      .then((data) => {
        console.log('AllTeamsdata:', data)
        if (data.error) return console.log('No hay datos')

        setTeams(data || [])
      })
      .catch((error) => {
        console.log('Error al obtener equipos:', error.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }    

  const teamRecords = useMemo(() => {
    const records = {}

    games.forEach((game) => {
      if (game.game_status !== 'finalizado') return

      const localId = game.local_team_id
      const guestId = game.guest_team_id
      if (!localId || !guestId) return

      let localScore = []
      let guestScore = []

      try {
        localScore = typeof game.local_team_score === 'string' ? JSON.parse(game.local_team_score) : game.local_team_score
      } catch (err) {
        localScore = []
      }

      try {
        guestScore = typeof game.guest_team_score === 'string' ? JSON.parse(game.guest_team_score) : game.guest_team_score
      } catch (err) {
        guestScore = []
      }

      if (!Array.isArray(localScore) || !Array.isArray(guestScore) || localScore.length === 0 || guestScore.length === 0) return

      const localTotal = localScore.reduce((sum, item) => sum + Number(item?.mainScore ?? item ?? 0), 0)
      const guestTotal = guestScore.reduce((sum, item) => sum + Number(item?.mainScore ?? item ?? 0), 0)

      if (localTotal === guestTotal) return

      records[localId] = records[localId] || { wins: 0, losses: 0 }
      records[guestId] = records[guestId] || { wins: 0, losses: 0 }

      if (localTotal > guestTotal) {
        records[localId].wins += 1
        records[guestId].losses += 1
      } else {
        records[guestId].wins += 1
        records[localId].losses += 1
      }
    })

    return records
  }, [games])

  return (
    <section className='torneos-section'>
      <div className='torneo-header'>
        <div>
          <h1>Equipos</h1>
          <p>Explora tus equipos creados y administra su identidad</p>
        </div>
          <button className='icon-button' >
                 <Plus className='icon plus' />  
                 <Minus className='icon minus' />
          </button>
      </div>

      <div className='search-container'>
        <select value={filterOption} onChange={(e) => setFilterOption(e.target.value)}>
          <option value='myTeams'>Mis Equipos</option>
          <option value='all'>Todos los equipos</option>
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

      {editTeam && (
        <EditTeam
          team={editTeam}
          onSave={handleTeamSaved}
          onCancel={() => setEditTeam(null)}
        />
      )}

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
                <section>
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
                </section>
                <div className='founder-container'>
                  {team.founder_id === user.user_id && <Crown className='founder-icon' />}
                </div>
              </div>

              <ul>
                <li>
                  <Crown />Fundador: <p>{team.name + ' ' + team.lastname || 'Sin información'}</p>
                </li>
                <li>
                  <Users /> Jugadores: <p>{players.filter((player) => player.team_id === team.team_id).length ?? 0}</p>
                </li>
                <li>
                  <Users /> Máximo de jugadores: <p>{team.max_players || 'Sin información'}</p>
                </li>
                
                <li>
                  <Pen /> <p>{team.team_description || 'Sin descripción'}</p>
                </li>
                <li className='team-record'>
                  <Flame /> Record: <p>{(teamRecords[team.team_id]?.wins ?? 0)}<span className='wins'>W</span></p> - <p>{(teamRecords[team.team_id]?.losses ?? 0)}<span className='losses'>L</span></p>
                </li>
              </ul>
              <div className='card-buttons'>
                {Number(team.founder_id) === Number(user?.user_id) && (
                  <button onClick={() => handleEditTeam(team)}><Pen /></button>
                )}

                {!userTeams.some((t) => Number(t.team_id) === Number(team.team_id)) && (
                  <button onClick={() => console.log('add user in the team')}><UserRoundPlus /></button>
                )}
              </div>
            </div>
          ))}
        </section>
      )}
    </section>
  )
}

export default Teams