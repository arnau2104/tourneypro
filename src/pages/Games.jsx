import React,{useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom';
import { refreshToken } from '../services/refreshToken';
import { MdStadium } from "react-icons/md";
import { FaMapPin } from "react-icons/fa6";
import {Search,Clock,Calendar,Timer,Pencil,Eye,Play  } from 'lucide-react';
import EditGame from '../components/EditGame';



function Games() {
    
    const [showInput, setShowInput] = useState(false);
    const [games, setGames] = useState([]);
    const [teams, setTeams] = useState([]);
    const [openEditGameForm, setOpenEditGameForm] = useState(false);
    const [selectedGame, setSelectedGame] = useState(null);

        const navigate = useNavigate();


    useEffect(() => {
        getGamesData();
    },[]);

    function getGamesData() {
        fetch('/api/getGames', {
            method: 'GET',
            credentials: 'include'
        }).then(async res => {
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
            }).then(data => {
                console.log("Data:", data);
                //  console.log("Sports", data.sports);
                //  console.log("torneos", data.tournaments);
                if(data.error) return console.log("no hay datos");
                setGames(data.games);
                setTeams(data.teams);
            }).catch(err => console.log("Error al obtener los partidos",err.message));
    }

    function firstUpper(palabra) {
        return palabra.charAt(0).toUpperCase() + palabra.slice(1);
    }


    
  return (
   <section className='torneos-section'>

        <div className='torneo-header'>
            <div>
                <h1>Partidos</h1>
                <p>Mira los partidos que tienes para jugar</p>
            </div>
            {/* <button className={`icon-button ${openInsertForm ? "open" : ""}`} onClick={()=>{setAction('insert'); setOpenInsertForm(!openInsertForm)}} >
                 <Plus className='icon plus' />  
                 <Minus className='icon minus' />
            </button> */}
           

        </div>
        <div className='search-container'>
            
            <select>
                    <option value="">Todos los partidos</option>
                    <option value="">Partidos por jugar</option>
                    <option value="">Partidos jugados</option>
            </select>
            <label htmlFor="search-tournament">
                <Search onClick={()=> setShowInput(!showInput)} />
                {showInput && <input onInput={console.log("buscando...")} id='search-tournament' name='search-tournament' type="text" /> }
            </label>
        </div>
    
    {/* <button onClick={()=>setOpenInsertForm(true)}>Crear Torneo</button>  */}

    {openEditGameForm &&
        <EditGame
        game = {selectedGame}
        teams = {teams}
        />
    }

    {games.length > 0 && teams.length > 0 &&
        <section className="tournaments-container games-container">
                {games.map((game) => {
                    const localTeam = teams.find(team => team.team_id === game.local_team_id);
                    const guestTeam = teams.find(team => team.team_id === game.guest_team_id);
                    const tournamentName = teams.find(t => t.tournament_id === game.tournament_id);
                    console.log("Tournament name", tournamentName.tournament_name);
                    return (
                        <div key={game.id} className="tournament-card">
                            <p className='tournament-title'><span>{localTeam.team_name}</span> <span> vs </span> <span>{guestTeam.team_name}</span></p>
                           <div className="teams-shield">
                            <div>
                                <img src={localTeam.team_shield} alt="" />
                                <div className="game-result">
                                    {game.local_team_score && JSON.parse(game.local_team_score).map((score, index) => {
                                        // console.log("score", score.mainScore);
                                       return <p className={score.isWinner ? "winner" : "looser"} key={index}>{score.mainScore}</p> 
                                    })}
                                </div>
                            </div>
                            <div>
                                <img src={guestTeam.team_shield} alt="" />
                                 <div className="game-result">
                                    {game.guest_team_score && JSON.parse(game.guest_team_score).map((score, index) => {
                                        // console.log("score", score.mainScore);
                                       return <p className={score.isWinner ? "winner" : "looser"} key={index}>{score.mainScore ?? '-'}</p> 
                                    })}
                                </div>
                            </div>
                           </div>
                           <div className='game-features'>
                                <p><FaMapPin />{game.location.length > 0 ? game.location : '-'}</p> 
                                <p><Calendar /> {game.game_start_date ? new Date(game.game_start_date).toLocaleDateString() : '-'} </p>
                                <p><Clock />{game.game_start_hour  ? game.game_start_hour : '-'}</p>
                                                                         
                           </div>
                           <div className="game-features">
                                <p><MdStadium />{game.game_field.length > 0 ? game.game_field : '-'} </p>
                                <p><MdStadium />{tournamentName ? tournamentName.tournament_name : '-'}</p>
                                <p><Timer />{game.game_duration ? `${game.game_duration} min` : '-' }</p>
                                
                           </div>

                            <div className='card-buttons'>
                              <div>
                                    {/* <button><Eye /> </button> */}
                                     {/* <button onClick={()=>{setSelectedGame(game);setOpenEditGameForm(!openEditGameForm);}}><Pencil /></button> */}
                              </div>
                                  {/* <button onClick={()=> console.log("inscribiendo...")}><Pencil />Inscribirse</button> */}
                                  <p className={`game-status ${game.game_status === 'próximamente' ? 'proximamente': game.game_status === 'iniciado' ? 'iniciado' : game.game_status === 'finalizado' ? 'finalizado' : 'cancelado'}`}> {firstUpper(game.game_status)}</p>
                            </div> 

                        </div>

                        
                    );
                })}
            </section>
    }
             
    </section>
  )
}

export default Games