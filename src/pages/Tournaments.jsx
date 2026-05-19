import React, { useState,useEffect, useContext } from 'react'
import { useNavigate,NavLink } from 'react-router-dom'
import { refreshToken } from '../services/refreshToken';
import {X,Calendar, Trophy, Users, Clock, Plus,Minus,NotebookPen,Eye,Pencil,Search  } from 'lucide-react';
import { TbTournament  } from "react-icons/tb";
import { FaMapPin } from "react-icons/fa6";

import CreateTournamentForm from '../hooks/CreateTournamentForm';
import InscriptionForm from '../components/InscriptionForm';
import {AuthContext} from '../context/userContext'

function Tournaments() {
  
    const { user, setUser } = useContext(AuthContext);

    const [openInsertForm, setOpenInsertForm] = useState(false);
    const [openInscriptionForm, setOpenInscriptionForm] = useState(false);
    const [teams, setTeams] = useState([]);
    const [sport, setSport] = useState('');
    const [sportOptions, setSportOptions] = useState([]);
    const [tournaments, setTournaments] = useState([])
    const [filteredTournaments, setFilteredTournaments] = useState([]);

    const [selectedTournament, setSelectedTournament] = useState(null);
    const [ action,setAction] = useState('insert');
    const [tournamentId, setTournamentId] = useState(null);
    const [showInput, setShowInput] = useState(false);

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
                setFilteredTournaments(data.tournaments)
            }
           
        }).catch(error => {
            console.log("Error al obtener los deportes: ", error.message);
        })
    }

    function handleInscription(tournamentId) {
        setTournamentId(tournamentId);
        console.log("inscripcion");
        fetch('/api/getTeams', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        }).then(async res => {
              if(res.status === 401) {

                const refreshOk = await refreshToken(); // intentar refrescar el token

                if(!refreshOk) {
                    navigate('/login'); //redirigir al usuario a la página de login para que inicie sesión de nuevo
                    return;
                }

                   // 🔥 IMPORTANTE: volver a intentar la petición original
                   const retryFetch = await fetch('/api/getTeams', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        credentials: 'include'
                    });

                    return retryFetch.json(); //devolvemos directamente el json
            }

            return res.json();
        }).then(data => {
            console.log("Data:", data);

            if(data.error) return console.log(data.error);
            setTeams(data);
            setOpenInscriptionForm(true);
        }).catch(error => {
            console.log("Error:", error.message);
        })

    }

    function updateTournament(tournamentId) {
        console.log("update tournament", tournamentId);

        fetch('/api/selectTournament', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({tournamentId}),
            credentials: 'include'
        }).then(async res => {
                if(res.status === 401) { 
                    const refreshOk = await refreshToken();

                    if(!refreshOk) {
                        navigate('/login');
                        return;
                    }

                    return fetch('/api/selectTournament', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                         body: JSON.stringify({tournamentId}),
                        credentials: 'include'
                    })
                }
            
            if(!res) return;
            return res.json();
        }).then(data => {
            console.log("Data:", data);

            if(data.error) return console.log(data.error);

           setSelectedTournament(data);
           setAction('update');
           setOpenInsertForm(true);
           window.scrollTo({top: 0, behavior: 'smooth'});

        }).catch(error => {
            console.log("error", error.message);
        })
    }

    function searchTournament(text) {
        // console.log("Text", text);
      const searchedTournament =  tournaments.filter(tournament => tournament.tournament_name.toLowerCase().includes(text.toLowerCase()));
      setFilteredTournaments(searchedTournament);
        // console.log(searchedTournament);
    }

  return (
    <section className='torneos-section'>

        <div className='torneo-header'>
            <div>
                <h1>Torneos</h1>
                <p>Explora Torneos, apuntate y gestionalos</p>
            </div>
            <button className={`icon-button ${openInsertForm ? "open" : ""}`} onClick={()=>{setAction('insert'); setOpenInsertForm(!openInsertForm)}} >
                 <Plus className='icon plus' />  
                 <Minus className='icon minus' />
            </button>
           

        </div>
        <div className='search-container'>
            
            <select>
                    <option value="">Todos los torneos</option>
                    <option value="">Torneos en los que estas inscrito</option>
                    <option value="">Torneos para inscribirte</option>
            </select>
            <label htmlFor="search-tournament">
                <Search onClick={()=> setShowInput(!showInput)} />
                {showInput && <input onInput={(e)=> searchTournament(e.target.value)} id='search-tournament' name='search-tournament' type="text" /> }
            </label>
        </div>
    
    {/* <button onClick={()=>setOpenInsertForm(true)}>Crear Torneo</button>  */}
           

    {openInsertForm && (
        <CreateTournamentForm 
            action={action}
            {...(selectedTournament && { data: selectedTournament })}
            sportOptions={sportOptions}
            sport={sport}
            setSport={setSport}
            ucFirst={ucFirst}
            navigate={navigate}
        />
        )}
    {openInscriptionForm && (
        <InscriptionForm teams = {teams} setOpenInscriptionForm={setOpenInscriptionForm} tournamentId={tournamentId} navigate={navigate}/>
    )}

    {tournaments.length > 0 && (

        <section className="tournaments-container">
            {filteredTournaments.map(tournament => {
                return (
                                <div key={tournament.tournament_id} className='tournament-card'>
                                    <NavLink to="/torneo"  >
                                    <p className='tournament-title'>{tournament.tournament_name}</p>
                                    </NavLink>
                                    <ul>
                                        <li><TbTournament /> {ucFirst(tournament.tournament_type.replace(",", " \n +\n"))}</li>
                                        <li><NotebookPen   /> {tournament.inscription_price_per_team}€ (por equipo)</li>
                                        <li><Users /> {tournament.total_teams} equipos</li>
                                        <li><Clock /> 18:00</li>
                                        <li><FaMapPin /> {tournament.location}</li>
                                        <li><Calendar /> {new Date(tournament.start_date).toLocaleDateString()}</li>
                                        <li> <Trophy /> {ucFirst(tournament.tournament_prize)}</li>
                                    </ul>
                                    <div className='card-buttons'>
                                        <div>
                                             <NavLink to="/torneo"  ><button><Eye /> </button></NavLink>
                                            {tournament.created_by === user?.user_id && <button onClick={()=> updateTournament(tournament.tournament_id)}><Pencil /></button>}
                                        </div>
                                        <button onClick={()=> handleInscription(tournament.tournament_id)}><Pencil />Inscribirse</button>
                                    </div>                            
                                </div>)
            })}
        </section>

    )}
    
    </section>
  )
} 

export default Tournaments