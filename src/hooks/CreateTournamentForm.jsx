import React, {useEffect, useState} from 'react'
import { refreshToken } from '../services/refreshToken';
import { set } from 'zod';

function CreateTournamentForm({action,data,sportOptions,sport,setSport,ucFirst,navigate}) {

    const [tournamentName, setTournamentName] = useState('');
    const [organizer, setOrganizer] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [location, setLocation] = useState('');
    const [totalTeams, setTotalTeams] = useState('');
    const [tournamentType, setTournamentType] = useState('playoffs');
    const [prize, setPrize] = useState('');
    const [inscriptionPrice, setInscriptionPrice] = useState('');
    const [requirements, setRequirements] = useState('');
    const [roundsNames, setRoundsNames] = useState([]);
    const [isActive, setIsActive] = useState('') ;
    const [tournamentStatus, setTournamentStatus] = useState('');
    const [tournamentId, setTournamentId] = useState('');
    
    
    useEffect(() => {
        if (!data?.tournamentData) return;

        const t = data.tournamentData[0];

        setTournamentName(t.tournament_name || '');
        setOrganizer(t.tournament_organizer || '');
        setStartDate(t.start_date.split('T')[0] || '');
        setEndDate(t.end_date.split('T')[0] || '');
        setLocation(t.location || '');
        setTotalTeams(t.total_teams || '');
        setTournamentType(t.tournament_type || 'playoffs');
        setPrize(t.tournament_prize || '');
        setInscriptionPrice(t.inscription_price_per_team || '');
        setRequirements(t.tournament_requirements || '');
        setRoundsNames(t.rounds_names ? JSON.parse(t.rounds_names) : []);
        setIsActive(t.is_active || '1');
        setTournamentStatus(t.tournament_status || 'próximamente');
        setTournamentId(t.tournament_id || '');

}, [data]);
    
    
    const [responseText, setResponseText] = useState(["", 'error'])

    const requestUrl = action === 'insert' ? '/api/createTournament' : '/api/updateTournament';

 function sendFormData(e) {
        e.preventDefault();

        console.log("Round Names:", roundsNames);
        console.log("Tournament id:", tournamentId);
        console.log("Sport id", sport);
        console.log("Status", tournamentStatus);
        console.log("active", isActive);

        const data = JSON.stringify({
                tournamentId,
                tournamentName,
                sport : Number(sport),
                organizer,
                startDate,
                endDate,
                location,
                totalTeams: Number(totalTeams),
                roundsNames,
                tournamentType : tournamentType.trim(),
                prize,
                inscriptionPrice: Number(inscriptionPrice),
                requirements,
                tournamentStatus,
                isActive
        });

        fetch(requestUrl, { 
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

                return fetch(requestUrl, {
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
            // console.log(data.error);
            // console.log(data.message);

            if(data.error) {
                setResponseText([data.error, 'error']);
                return;
            }

            setResponseText([data.message, 'correcto']);
            setTimeout(()=>{

                if(action === 'insert') {
                    setTournamentName('');
                    setSport('');
                    setOrganizer('');
                    setStartDate('');
                    setEndDate('');
                    setLocation('');
                    setTotalTeams('');
                    setTournamentType('playoffs');
                    setPrize('');
                    setInscriptionPrice('');
                    setRequirements('')
                    setRoundsNames([]);
                } ;
                    
            },1000)

        }).catch(error => {
            console.log("error en el insert", error.message);
        })

    }
    
  return (
      <div className='crear-torneo-container'>
            <div>
                <div className='cerrar-crear-torneo'><h3>Crear Torneo</h3> </div>
                {/* <p>Configura los detalles del torneo</p> */}
            </div>

            <form onSubmit={(e) => sendFormData(e)}>
                <label htmlFor="tournament-name">Nombre del Torneo
                    <input type="text" id="tournament-name" name="tournament-name"  placeholder='Ej: Torneo de Vernao 2026' value={tournamentName} onChange={(e) => setTournamentName(e.target.value)} />
                </label>
                
                <div>
                    <label htmlFor="sport">Deporte
                        <select id="sport" name="sport" value={sport} onChange={(e) => setSport(e.target.value)}>
                            {sportOptions.length > 0 ? ( sportOptions.map(sport => {
                                return <option key={sport.sport_id} value={sport.sport_id}>{ucFirst(sport.sport_name)}</option>
                            })) : <option value="">No hay deportes disponibles</option>}
                        </select>
                    </label>

                    <label htmlFor="tournament-organizer">Organizador del Torneo
                        <input type="text" id="tournament-organizer" name="tournament-organizer" placeholder='Nombre del organizador' value={organizer} onChange={(e) => setOrganizer(e.target.value)} />
                    </label>
                    
                </div>

                <div>
                    <label htmlFor="start-date">Fecha de Inicio 
                        <input type="date" id="start-date" name="start-date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </label>
                
                    
                    <label htmlFor="end-date">Fecha de Fin
                        <input type="date" id="end-date" name="end-date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </label>
                    
                </div>

                <div>
                    <label htmlFor="location">Ubicación
                        <input type="text" id="location" name="location" placeholder='Ciudad, País' value={location} onChange={(e) => setLocation(e.target.value)} />
                    </label>
                    

                    <label htmlFor="total-teams">Número de Equipos
                        <input type="number" id="total-teams" name="total-teams" placeholder='Ej: 8' value={totalTeams} onChange={(e) => setTotalTeams(e.target.value)} />
                    </label>

                    <label htmlFor="total-teams">Nombre de las Rondas
                        <input type="text" id="rounds-names" name="rounds-names" placeholder='Introduze el nombre de las rondas, separado por comas' value={roundsNames.join(',')} onChange={(e) => setRoundsNames(e.target.value.split(','))} />
                    </label>
                    
                </div>

                <label htmlFor="tournament-type">Tipo de Torneo
                    <select id="tournament-type" name="tournament-type" value={tournamentType} onChange={(e) => setTournamentType(e.target.value)}>
                        <option value="playoffs">Eliminatorias</option>
                        <option value="league">Liga</option>
                        <option value="playoffs,league">Liga + Eliminatorias</option>
                    </select>
                </label>

                <div>
                    <label htmlFor="tournament-prize">Premio del Torneo (opcional)
                        <input type="text" id="tournament-prize" name="tournament-prize" placeholder='Ej: 1000€' value={prize} onChange={(e) => setPrize(e.target.value)} />
                    </label>
                    
                    <label htmlFor="inscription-price-per-team">Precio de Inscripción por Equipo 
                        <input type="number" id="inscription-price-per-team" name="inscription-price-per-team" placeholder='Ej: 50€' value={inscriptionPrice} onChange={(e) => setInscriptionPrice(e.target.value)} />
                    </label>
                    
                </div>

                    <label htmlFor="tournament-requirements">Requisitos del Torneo (opcional)
                        <input type="text" id="tournament-requirements" name="tournament-requirements" placeholder='Ej: Equipos deben tener mínimo 11 jugadores' value={requirements} onChange={(e) => setRequirements(e.target.value)} />
                    </label> 

                {data && (
                    <>
                        <label htmlFor="tournament-status">Estado del Torneo
                            <select id="tournament-status" name="tournament-status" value={tournamentStatus} onChange={(e) => setTournamentStatus(e.target.value)}>
                                <option value="próximamente">Próximamente</option>
                                <option value="iniciado">Iniciado</option>
                                <option value="en curso">En Curso</option>
                                <option value="finalizado">Finalizado</option>
                                <option value="cerrado">Cerrado</option>
                            </select>
                        </label>

                        <label htmlFor="isActive">Torneo Activo
                            <select id="isActive" name="isActive" value={isActive} onChange={(e) => setIsActive(e.target.value)}>
                                <option value="1">Activo</option>
                                <option value="0">Inactivo</option>
                                
                            </select>
                        </label>
                    </>

                )}

                <button type="submit">{action === 'insert' ?  'Crear Torneo' : 'Actualizar Torneo'}</button>

            <p className={`response ${responseText[1]} `}>{responseText[0]}</p>

            </form>
            
        </div>
  )
}

export default CreateTournamentForm