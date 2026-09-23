import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { refreshToken } from '../services/refreshToken'
import { Trophy, Search } from 'lucide-react'

function Clasificacion() {
  const [games, setGames] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [showInput, setShowInput] = useState(false)
  const [searchText, setSearchText] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    getGamesData()
  }, [])

  function getGamesData() {
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
        setTeams(data.teams || [])
      })
      .catch((error) => {
        console.log('Error al obtener la clasificación:', error.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const standingsByTournament = useMemo(() => {
    const tournaments = {}

    teams.forEach((team) => {
      tournaments[team.tournament_id] = tournaments[team.tournament_id] || {
        tournament_id: team.tournament_id,
        tournament_name: team.tournament_name,
        teams: {},
      }

      tournaments[team.tournament_id].teams[team.team_id] = {
        team_id: team.team_id,
        team_name: team.team_name,
        team_shield: team.team_shield,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        points: 0,
      }
    })

    games.forEach((game) => {
      if (game.game_status !== 'finalizado') return

      const tournament = tournaments[game.tournament_id]
      if (!tournament) return

      const localRow = tournament.teams[game.local_team_id]
      const guestRow = tournament.teams[game.guest_team_id]
      if (!localRow || !guestRow) return

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

      localRow.played += 1
      guestRow.played += 1

      if (localTotal === guestTotal) {
        localRow.draws += 1
        guestRow.draws += 1
        localRow.points += 1
        guestRow.points += 1
      } else if (localTotal > guestTotal) {
        localRow.wins += 1
        guestRow.losses += 1
        localRow.points += 3
      } else {
        guestRow.wins += 1
        localRow.losses += 1
        guestRow.points += 3
      }
    })

    return Object.values(tournaments)
      .map((tournament) => ({
        ...tournament,
        teams: Object.values(tournament.teams).sort((a, b) => b.points - a.points || b.wins - a.wins),
      }))
      .filter((tournament) => tournament.tournament_name?.toLowerCase().includes(searchText.trim().toLowerCase()))
  }, [games, teams, searchText])

  return (
    <section className='torneos-section'>
      <div className='torneo-header'>
        <div>
          <h1>Clasificación</h1>
          <p>Consulta la tabla de posiciones de tus torneos</p>
        </div>
      </div>

      <div className='search-container'>
        <label htmlFor='search-standing'>
          <Search onClick={() => setShowInput(!showInput)} />
          {showInput && (
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              id='search-standing'
              name='search-standing'
              type='text'
              placeholder='Buscar torneo...'
            />
          )}
        </label>
      </div>

      {loading ? (
        <div className='empty-state'>
          <p>Cargando clasificación...</p>
        </div>
      ) : standingsByTournament.length === 0 ? (
        <div className='empty-state'>
          <p>No hay clasificaciones disponibles.</p>
          <p>Juega partidos en tus torneos para ver la tabla de posiciones aquí.</p>
        </div>
      ) : (
        <section className='tournaments-container'>
          {standingsByTournament.map((tournament) => (
            <div key={tournament.tournament_id} className='tournament-card'>
              <p className='tournament-title'>{tournament.tournament_name}</p>

              <ul className='standings-list'>
                {tournament.teams.map((team, index) => (
                  <li key={team.team_id} className='standings-row'>
                    <span className='standings-position'>{index === 0 ? <Trophy /> : index + 1}</span>
                    <div className='standings-team'>
                      <div className='team-shield-card standings-shield'>
                        {team.team_shield ? (
                          <img src={team.team_shield} alt={team.team_name} />
                        ) : (
                          <span>{String(team.team_name).slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <p>{team.team_name}</p>
                    </div>
                    <div className='standings-stats'>
                      <p>{team.played} <span>PJ</span></p>
                      <p className='wins'>{team.wins} <span>G</span></p>
                      <p>{team.draws} <span>E</span></p>
                      <p className='losses'>{team.losses} <span>P</span></p>
                      <p className='standings-points'>{team.points} <span>Pts</span></p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
    </section>
  )
}

export default Clasificacion
