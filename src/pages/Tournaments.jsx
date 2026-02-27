import React, { useState,useEffect } from 'react'
import { useNavigate,NavLink } from 'react-router-dom'
import { refreshToken } from '../services/refreshToken';
import {X,Calendar, Trophy, Users, Clock, Plus,Minus,NotebookPen  } from 'lucide-react';
import { TbTournament  } from "react-icons/tb";
import { FaMapPin } from "react-icons/fa6";

function Tournaments() {

    const [openInsertForm, setOpenInsertForm] = useState(false)

    const [tournamentName, setTournamentName] = useState('');
    const [sport, setSport] = useState('');
    const [organizer, setOrganizer] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [location, setLocation] = useState('');
    const [totalTeams, setTotalTeams] = useState('');
    const [tournamentType, setTournamentType] = useState('playoffs');
    const [prize, setPrize] = useState('');
    const [inscriptionPrice, setInscriptionPrice] = useState('');
    const [requirements, setRequirements] = useState('');

    const [sportOptions, setSportOptions] = useState([]);
    const [tournaments, setTournaments] = useState([])
    const [responseText, setResponseText] = useState(["", 'error'])

    const navigate = useNavigate();

    function ucFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

   useEffect(() => {
        console.log("obteniendo datos");
        getTournamentPageData();

    },[])

    function getTournamentPageData() {
        fetch('/api/tournamentPageData', {
            method: 'GET',
            credentials: 'include' // para enviar las cookies al backend
        }).then(async res =>  {
             if(res.status === 401) {

                const refreshOk = await refreshToken(); // intentar refrescar el token

                if(!refreshOk) {
                    navigate('/login'); //redirigir al usuario a la página de login para que inicie sesión de nuevo
                    return;
                }

                   // 🔥 IMPORTANTE: volver a intentar la petición original
                   const retryFetch = await fetch('/api/tournamentPageData', {
                        method: 'GET',
                        credentials: 'include'
                    });

                    return retryFetch.json(); //devolvemos directamente el json
            }

            return res.json();
        })
        .then(data => {
             console.log("Data:", data);
            //  console.log("Sports", data.sports);
            //  console.log("torneos", data.tournaments);
            if(data.error) return console.log("no hay datos");

            setSportOptions(data.sports);

             if(data.sports.length > 0) {
            setSport(String(data.sports[0].sport_id));
            }

            if(data.tournaments.length > 0) {
                setTournaments(data.tournaments)
            }
           
        }).catch(error => {
            console.error("Error al obtener los deportes: ", error);
        })
    }

     function sendFormData(e) {
        e.preventDefault();

        const data = JSON.stringify({
                tournamentName,
                sport : Number(sport),
                organizer,
                startDate,
                endDate,
                location,
                totalTeams: Number(totalTeams),
                tournamentType : tournamentType.trim(),
                prize,
                inscriptionPrice: Number(inscriptionPrice),
                requirements
        });

        fetch('/api/createTournament', { 
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

                return fetch('/api/createTournament', {
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

            setResponseText(["Torneo creado correctamente", 'correcto']);
            setTimeout(()=>{

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
                    
            },1000)

        }).catch(error => {
            console.log("error en el insert", error.message);
        })

    }

  return (
    <section className='torneos-section'>

        <div className='torneo-header'>
            <div>
                <h1>Torneos</h1>
                <p>Gestiona los torneos en los que estas inscrito</p>
            </div>
            <button className={`icon-button ${openInsertForm ? "open" : ""}`} onClick={()=>setOpenInsertForm(!openInsertForm)} >
                 <Plus className='icon plus' />  
                 <Minus className='icon minus' />
                </button>

        </div>
    
    {/* <button onClick={()=>setOpenInsertForm(true)}>Crear Torneo</button>  */}
           

    {openInsertForm && (

        <div className='crear-torneo-container'>
            <div>
                <div className='cerrar-crear-torneo'><h3>Crear Torneo</h3> <X onClick={()=> setOpenInsertForm(false)} /></div>
                <p>Configura los detalles del torneo</p>
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

                <button type="submit">Crear Torneo</button>

            <p className={`response ${responseText[1]} `}>{responseText[0]}</p>

            </form>
            
        </div>
    )}

    {tournaments.length > 0 && (

        <section className="tournaments-container">
            {tournaments.map(tournament => {
                return <NavLink to="/torneo"  key={tournament.tournament_id}>
                                <div className='tournament-card'>
                                    <p className='tournament-title'>{tournament.tournament_name}</p>
                                    <ul>
                                        <li><TbTournament /> {ucFirst(tournament.tournament_type.replace(",", " \n +\n"))}</li>
                                        <li><NotebookPen   /> {tournament.inscription_price_per_team}€ (por equipo)</li>
                                        <li><Users /> {tournament.total_teams} equipos</li>
                                        <li><Clock /> 18:00</li>
                                        <li> <Trophy /> {ucFirst(tournament.tournament_prize)}</li>
                                    </ul>
                                    {/* <p><Trophy /> {ucFirst(tournament.tournament_prize)}</p> */}
                                    <div className='card-date-location'>
                                        <p><Calendar /> {new Date(tournament.start_date).toLocaleDateString()}</p>
                                        <p><FaMapPin /> {tournament.location}</p>
                                    </div>                            
                                </div>
                        </NavLink>
            })}
        </section>

    )}
    
    </section>
  )
} 

export default Tournaments