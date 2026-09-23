import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { refreshToken } from '../services/refreshToken'
import { MdStadium } from 'react-icons/md'
import { FaMapPin } from 'react-icons/fa6'
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, Timer, Star } from 'lucide-react'

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function Calendario() {
  const [games, setGames] = useState([])
  const [teams, setTeams] = useState([])
  const [myGameIds, setMyGameIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [filterOption, setFilterOption] = useState('mine')
  const [viewDate, setViewDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)

  const navigate = useNavigate()

  function firstUpper(palabra) {
    return palabra.charAt(0).toUpperCase() + palabra.slice(1)
  }

  useEffect(() => {
    getGamesData()
    getMyGamesData()
  }, [])

  function getGamesData() {
    setLoading(true)

    fetch('/api/getAllGames', {
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

          const retryFetch = await fetch('/api/getAllGames', {
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
        setTeams(data.teams || [])
      })
      .catch((error) => {
        console.log('Error al obtener los partidos:', error.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  function getMyGamesData() {
    fetch('/api/getGames', {
      method: 'GET',
      credentials: 'include',
    })
      .then(async (res) => {
        if (res.status === 401) {
          const refreshOk = await refreshToken()

          if (!refreshOk) return

          const retryFetch = await fetch('/api/getGames', {
            method: 'GET',
            credentials: 'include',
          })

          return retryFetch.json()
        }

        return res.json()
      })
      .then((data) => {
        console.log('MyGamesData:', data)
        if (!data || data.error) return

        setMyGameIds(new Set((data.games || []).map((game) => game.game_id)))
      })
      .catch((error) => {
        console.log('Error al obtener tus partidos:', error.message)
      })
  }

  const displayedGames = useMemo(() => {
    if (filterOption === 'mine') return games.filter((game) => myGameIds.has(game.game_id))

    return games
  }, [games, myGameIds, filterOption])

  const gamesByDay = useMemo(() => {
    const map = {}

    displayedGames.forEach((game) => {
      if (!game.game_start_date) return
      const key = new Date(game.game_start_date).toDateString()
      map[key] = map[key] || []
      map[key].push(game)
    })

    return map
  }, [displayedGames])

  const monthDays = useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const firstOfMonth = new Date(year, month, 1)
    const startOffset = (firstOfMonth.getDay() + 6) % 7 // lunes = 0
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const days = []

    for (let i = 0; i < startOffset; i++) {
      days.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }, [viewDate])

  function changeMonth(offset) {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1))
    setSelectedDay(null)
  }

  const selectedDayGames = selectedDay ? gamesByDay[selectedDay.toDateString()] || [] : []

  const monthLabel = firstUpper(
    viewDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  )

  const today = new Date()

  return (
    <section className='torneos-section'>
      <div className='torneo-header'>
        <div>
          <h1>Calendario</h1>
          <p>Consulta cuándo se juegan los partidos</p>
        </div>
      </div>

      <div className='search-container'>
        <select value={filterOption} onChange={(e) => { setFilterOption(e.target.value); setSelectedDay(null) }}>
          <option value='mine'>Mis partidos</option>
          <option value='all'>Todos los partidos</option>
        </select>
      </div>

      <div className='search-container calendar-nav'>
        <button className='calendar-nav-btn' onClick={() => changeMonth(-1)}>
          <ChevronLeft />
        </button>
        <p className='calendar-month-label'>{monthLabel}</p>
        <button className='calendar-nav-btn' onClick={() => changeMonth(1)}>
          <ChevronRight />
        </button>
      </div>

      {loading ? (
        <div className='empty-state'>
          <p>Cargando calendario...</p>
        </div>
      ) : (
        <>
          <section className='calendar-container'>
            <div className='calendar-grid calendar-weekdays'>
              {WEEKDAYS.map((day) => (
                <div key={day} className='calendar-weekday'>{day}</div>
              ))}
            </div>

            <div className='calendar-grid'>
              {monthDays.map((day, index) => {
                if (!day) return <div key={`empty-${index}`} className='calendar-day calendar-day-empty' />

                const dayGames = gamesByDay[day.toDateString()] || []
                const hasMyGame = dayGames.some((game) => myGameIds.has(game.game_id))
                const isToday = day.toDateString() === today.toDateString()
                const isSelected = selectedDay && day.toDateString() === selectedDay.toDateString()

                return (
                  <button
                    key={day.toISOString()}
                    className={`calendar-day ${isToday ? 'calendar-day-today' : ''} ${isSelected ? 'calendar-day-selected' : ''}`}
                    onClick={() => setSelectedDay(day)}
                  >
                    <span>{day.getDate()}</span>
                    {dayGames.length > 0 && (
                      <span className={`calendar-day-badge ${hasMyGame ? 'calendar-day-badge-mine' : ''}`}>{dayGames.length}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </section>

          {selectedDay && (
            selectedDayGames.length === 0 ? (
              <div className='empty-state'>
                <p>No hay partidos el {selectedDay.toLocaleDateString()}.</p>
              </div>
            ) : (
              <section className='tournaments-container games-container'>
                {selectedDayGames.map((game) => {
                  const localTeam = teams.find((team) => team.team_id === game.local_team_id)
                  const guestTeam = teams.find((team) => team.team_id === game.guest_team_id)
                  const tournamentName = teams.find((t) => t.tournament_id === game.tournament_id)
                  const isMyGame = myGameIds.has(game.game_id)

                  if (!localTeam || !guestTeam) return null

                  return (
                    <div key={game.game_id} className={`tournament-card ${isMyGame ? 'my-game-card' : ''}`}>
                      {isMyGame && filterOption === 'all' && (
                        <p className='my-game-badge'><Star /> Juegas este partido</p>
                      )}
                      <p className='tournament-title'><span>{localTeam.team_name}</span> <span> vs </span> <span>{guestTeam.team_name}</span></p>
                      <div className='teams-shield'>
                        <div>
                          <img src={localTeam.team_shield} alt='' />
                        </div>
                        <div>
                          <img src={guestTeam.team_shield} alt='' />
                        </div>
                      </div>
                      <div className='game-features'>
                        <p><FaMapPin />{game.location?.length > 0 ? game.location : '-'}</p>
                        <p><CalendarIcon /> {game.game_start_date ? new Date(game.game_start_date).toLocaleDateString() : '-'} </p>
                        <p><Clock />{game.game_start_hour ? game.game_start_hour : '-'}</p>
                      </div>
                      <div className='game-features'>
                        <p><MdStadium />{game.game_field?.length > 0 ? game.game_field : '-'} </p>
                        <p><MdStadium />{tournamentName ? tournamentName.tournament_name : '-'}</p>
                        <p><Timer />{game.game_duration ? `${game.game_duration} min` : '-'}</p>
                      </div>
                      <div className='card-buttons'>
                        <div></div>
                        <p className={`game-status ${game.game_status === 'próximamente' ? 'proximamente' : game.game_status === 'iniciado' ? 'iniciado' : game.game_status === 'finalizado' ? 'finalizado' : 'cancelado'}`}> {firstUpper(game.game_status)}</p>
                      </div>
                    </div>
                  )
                })}
              </section>
            )
          )}
        </>
      )}
    </section>
  )
}

export default Calendario
