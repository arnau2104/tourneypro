import React, {useState} from 'react'
import { refreshToken } from '../services/refreshToken';

function CreateTeamForm({navigate,onCreated}) {

    const [teamName, setTeamName] = useState('');
    const [teamDescription, setTeamDescription] = useState('');
    const [maxPlayers, setMaxPlayers] = useState('');
    const [teamShield, setTeamShield] = useState('');

    const [responseText, setResponseText] = useState(["", 'error'])

    function sendFormData(e) {
        e.preventDefault();

        const data = JSON.stringify({
            team_name: teamName,
            team_description: teamDescription,
            max_players: Number(maxPlayers),
            team_shield: teamShield
        });

        fetch('/api/createTeam', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: data,
            credentials: 'include'
        }).then(async res => {
            if(res.status === 401) {
                const refreshOk = await refreshToken();

                if(!refreshOk) {
                    navigate('/login');
                    return;
                }

                return fetch('/api/createTeam', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: data,
                    credentials: 'include'
                })
            }

            if(!res) return;
            return res.json();
        })
        .then(data => {
            console.log(data);

            if(data.error) {
                setResponseText([data.error, 'error']);
                return;
            }

            setResponseText([data.message, 'correcto']);
            setTimeout(()=>{
                setTeamName('');
                setTeamDescription('');
                setMaxPlayers('');
                setTeamShield('');
                onCreated?.(data.team);
            },1000)

        }).catch(error => {
            console.log("error en el insert", error.message);
        })

    }

  return (
      <div className='crear-torneo-container'>
            <div>
                <div className='cerrar-crear-torneo'><h3>Crear Equipo</h3> </div>
            </div>

            <form onSubmit={(e) => sendFormData(e)}>
                <label htmlFor="team-name">Nombre del Equipo
                    <input type="text" id="team-name" name="team-name" placeholder='Ej: Dragones FC' value={teamName} onChange={(e) => setTeamName(e.target.value)} required />
                </label>

                <label htmlFor="team-description">Descripción (opcional)
                    <input type="text" id="team-description" name="team-description" placeholder='Descripción del equipo' value={teamDescription} onChange={(e) => setTeamDescription(e.target.value)} />
                </label>

                <label htmlFor="max-players">Máximo de Jugadores
                    <input type="number" id="max-players" name="max-players" placeholder='Ej: 11' min="1" value={maxPlayers} onChange={(e) => setMaxPlayers(e.target.value)} required />
                </label>

                <label htmlFor="team-shield">Escudo del Equipo (opcional)
                    <input type="url" id="team-shield" name="team-shield" placeholder='https://...' value={teamShield} onChange={(e) => setTeamShield(e.target.value)} />
                </label>

                <button type="submit">Crear Equipo</button>

            <p className={`response ${responseText[1]} `}>{responseText[0]}</p>

            </form>

        </div>
  )
}

export default CreateTeamForm
