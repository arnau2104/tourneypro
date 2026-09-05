import React, { useEffect, useState } from 'react'
import { refreshToken } from '../services/refreshToken'
import { set } from 'zod'

function EditTeam({ team, onSave, onCancel }) {
const [responsetext,setResponseText] = useState('')
  const [formData, setFormData] = useState({
    team_name: '',
    team_description: '',
    max_players: '',
    team_shield: '',
  })

  useEffect(() => {
    if (!team) return

    setFormData({
      team_name: team.team_name || '',
      team_description: team.team_description || '',
      max_players: team.max_players || '',
      team_shield: team.team_shield || '',
    })
  }, [team])

  function handleChange(e) {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  function handleSubmit(e) {
    e.preventDefault()

    fetch('/api/updateTeam', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        team_id: team?.team_id,
        ...formData,
      }),
    })
      .then(async (res) => {
        if (res.status === 401) {
          const refreshOk = await refreshToken()

          if (!refreshOk) {
            console.log('Sesión expirada')
            return null
          }

          return fetch('/api/updateTeam', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              team_id: team?.team_id,
              ...formData,
            }),
          })
        }

        return res
      })
      .then(async (res) => {
        if (!res) return

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          setResponseText(errorData.error || 'No se pudo guardar el equipo');
          setTimeout(() => {
            setResponseText('')
          }, 1500);
          throw new Error(errorData.error || 'No se pudo guardar el equipo')
        }

        return res.json()
      })
      .then((data) => {
        if (!data) return
        setResponseText('Equipo actualizado correctamente')
        setTimeout(() => {
          setResponseText('')
                  onSave?.(data?.team ?? { team_id: team?.team_id, ...formData })

        }, 1500)
      })
      .catch((error) => {
        console.error('Error al actualizar el equipo:', error.message)
      })
  }

  return (
    <div className='tournaments-container'>
      <form onSubmit={handleSubmit} className='edit-team-form'>
        <h3>Editar equipo</h3>

        <label>
          Nombre del equipo
          <input
            type='text'
            name='team_name'
            value={formData.team_name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Descripción
          <textarea
            name='team_description'
            value={formData.team_description}
            onChange={handleChange}
            placeholder='Descripción del equipo'
          />
        </label>

        <label>
          Máximo de jugadores
          <input
            type='number'
            name='max_players'
            value={formData.max_players}
            onChange={handleChange}
            min='1'
            required
          />
        </label>
        <div className='edit-team-shield' >
          {formData.team_shield && 
            <img src={formData.team_shield} alt="Escudo del equipo" />
          }
        </div>


        <label>
          Escudo del equipo
          <input
            type='url'
            name='team_shield'
            value={formData.team_shield}
            onChange={handleChange}
            placeholder='https://...'
          />
        </label>

        <div className='card-buttons'>
          <button type='submit'>Guardar</button>
          <button style={{ backgroundColor: '#f22929' }} type='button' onClick={onCancel}>Cancelar</button>
        </div>

        <p>{responsetext}</p>
      </form>
    </div>
  )
}

export default EditTeam
