import React, {useEffect,useRef, useState} from 'react'
import {createBracket} from 'bracketry';
import {useSetGameResult} from './useSetGameResult';
import { refreshToken } from '../services/refreshToken';
import { Navigate } from 'react-router-dom';
import { X } from 'lucide-react';

function Bracketry() {

    const bracketContainer = useRef(null);
    const games = useRef([])
    const teams = useRef([])
    const [tournamentData, setTournamentData] = useState({});
    const bracket  = useRef(null)
    const [resultForm,setResultForm] = useState('')
    const [windowWidth, setWindowWidth] = useState(window.innerWidth)

    // console.log(windowWidth);

      /* Entry Status : 
        1 => El participante está activo y esperando su primer match.
        2 => Ganó su último match (o se mueve al siguiente round).
        3 => Perdió su último match (en brackets de eliminación).
        4 => Estado especial, a veces se usa para simulación o equipo eliminado, o un participante “por default”.
    */ 
     
//703 pixels cambiar a movil
    const mobileOptions = {
    navButtonsPosition: 'beforeTitles',
    visibleRoundsCount: 1,
    leftNavButtonHTML: `< RONDA ANTERIOR`,
    rightNavButtonHTML: `SIGUIENTE RONDA >`,
    roundTitlesFontSize: 26,
    roundTitlesVerticalPadding: 4,
    matchFontSize: 14,
    matchHorMargin: 14,
    distanceBetweenScorePairs: 10,
     getEntryStatusHTML: () => '',
    disableHighlight: true,
    verticalScrollMode: 'mixed',
    scrollButtonPadding:'0px'
    //  maxMatchWidth: 360
};

const options = {
     onMatchClick: match => {
        console.log("Match:", match);
        const bracketData = Object.values(bracket.current.getAllData()); // lo pasamos a array
         console.log(bracketData);
        let localTeamName = match.sides[0].contestantId in bracketData[2] ?  bracketData[2][match.sides[0].contestantId].players[0].title : null;
        let guestTeamName = match.sides[1].contestantId in bracketData[2] ?  bracketData[2][match.sides[1].contestantId].players[0].title : null;
        // console.log(localTeamName,guestTeamName );
        if(localTeamName == null || guestTeamName == null) return;
      setResultForm(             
        <form onSubmit={(e)=> useSetGameResult({e,match, bracket, setResultForm})}>
            <X className='close' onClick={()=> setResultForm('')} />
            <p>INTRODUZCA EL RESULTADO DEL PARTIDO</p>
            <div>
                <label > {localTeamName}
                <input name='localScore' type="number" />
                </label>
                <label > {guestTeamName}
                <input name='guestScore' type="number" />
                </label>
            </div>
            <button>Guardar</button>
        </form>
      )
    }
}

    
window.addEventListener('resize',()=>  {
    setWindowWidth(window.innerWidth) 
    if(window.innerWidth <= 700) {
        bracket.current.app
    }

});

  useEffect(() => {

    fetch('/api/tournamentData', {
        method: 'GET',
        credentials: 'include'
    }).then(async res =>{
        if(res.status == 401) {
            
            const refreshOk = await refreshToken();

            if(!refreshOk) {
                console.log("No se ha podido refrescar el token");
                Navigate('/login');
                return
            }

            const retryFetch = await fetch('/api/tournamentData', {
                method: 'GET',
                 credentials: 'include'
            });

            return retryFetch.json();
        }

        return res.json();
    })
    .then(data => {
        console.log(data);

        if(data.games.length == 0) return console.log("No data");

       setTournamentData({games : data.games, teams: data.tournamentData});

    }).catch(error => {
        console.log("Error", error.message);
    });  
    
  }, []);

  useEffect(()=>{
      if(!tournamentData.teams || !tournamentData.games) return console.log("no data");;
   
        const tournamentTeams =  tournamentData.teams.reduce((acc,team) => {
           acc[team.team_id] = {
                entryStatus: `${team.team_id}`,
                players: [
                    {
                        title: team.team_name,
                        nationality: `<img class="team-shield" src= "${team.team_shield}">`
                    }
                ]
            }
        return acc;
        }, {})

       if(tournamentTeams) {
        teams.current = tournamentTeams;
       }

    
        const brakcetGames = generateGames(tournamentData.games)
        
        const bracketData = {
        rounds: [
                {name: "Ocatvos de final"},
                {name: "Quartos de Final"},
                {name: "Semi final"},
                {name: "Final"}     
        ],
        matches: brakcetGames ,
        contestants: tournamentTeams
        }  
        
       bracket.current = (createBracket(bracketData, bracketContainer.current, (windowWidth <= 700 ? mobileOptions : options))) // se puede añadir otro campo llamado options
    
  },[tournamentData]) 



  function generateGames(data) {
    if(data.length === 0) return;
    const matches = [];

    // Generamos los partidos de la primera ronda
    data.forEach((game,index) => {
      matches.push({
        roundIndex: 0,
        order: index,
        sides: [
          {contestantId: `${game.local_team_id}` ,scores: [] },
          {contestantId: `${game.guest_team_id}`,scores: []}             
        ]
      })
    });

    let round = 1;
    let previousRoundGames = games.length;

    // Creamos automáticamente las rondas rondas siguientes
    while(previousRoundGames > 1) {

        // Calculamos cuántos partidos tendrá la siguiente ronda.
        const currentRoundGames = previousRoundGames / 2;

         // Creamos los partidos vacíos de esta nueva ronda
         for (let i = 0; i < currentRoundGames; i++) {
            matches.push({
                roundIndex: round,
                order: i,
                sides: [
                    {contestantId: '', scores: [] },
                    {contestantId: '', scores: [] }
                ]
            })
        }
        // Ahora esta ronda pasa a ser la "anterior" para la siguiente iteración del while
        previousRoundGames = currentRoundGames
        round++ //avanzamos de ronda
    }
        games.current = matches;
        return matches;
}


  
    return (
         <div>
            <h2>Torneo - Eliminación Directa</h2>
            <div ref={bracketContainer} id='container'>
               
            </div>
            <div className='game-resullt-container'>
                 {resultForm}
            </div>
        </div>  
    )

};


export default Bracketry