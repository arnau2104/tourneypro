import React, {useEffect,useRef, useState} from 'react'
import {createBracket} from 'bracketry';
import {useSetGameResult} from './useSetGameResult';
import ScoreForm from './ScoreForm'
import { refreshToken } from '../services/refreshToken';
import { useNavigate } from 'react-router-dom';
import { X,Plus } from 'lucide-react';

function Bracketry() {

        const navigate = useNavigate();
    const bracketContainer = useRef(null);
    const games = useRef([])
    const teams = useRef([])
    const [tournamentData, setTournamentData] = useState({});
    const bracket  = useRef(null)
    const [resultForm,setResultForm] = useState('')
    const [windowWidth, setWindowWidth] = useState(window.innerWidth)
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [localTeam, setLocalTeam] = useState('');
    const [guestTeam, setGuestTeam] = useState('')
    const [openForm, setOpenForm] = useState(false);
    const [gamesScore, setGamesScore] = useState([ 
    { roundIndex : 0, order : 0, localScore: "", guestScore: "" }
  ]);

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
    leftNavButtonHTML: `<div style="padding: 10px;"> <= RONDA ANTERIOR </div>`,
    rightNavButtonHTML: `<div style="padding: 10px;"> SIGUIENTE RONDA => </div>`,
    roundTitlesFontSize: 26,
    roundTitlesVerticalPadding: 10,
    matchFontSize: 14,
    matchHorMargin: 14,
    distanceBetweenScorePairs: 10,
     getEntryStatusHTML: () => '',
    disableHighlight: true,
    verticalScrollMode: 'mixed',
    scrollButtonPadding:'0px', 
    highlightedConnectionLinesColor: 'hsl(152 76% 42%)',
    highlightedPlayerTitleColor: 'hsl(152 76% 42%)',
    onMatchClick: match => onMatchClickFunc(match)
    //  maxMatchWidth: 360
};

function onMatchClickFunc(match) {
    //  console.log("Match:", match);
        const bracketData = Object.values(bracket.current.getAllData()); // lo pasamos a array
        //  console.log(bracketData);
        setLocalTeam(match.sides[0].contestantId in bracketData[2] ?  bracketData[2][match.sides[0].contestantId] : null);
        setGuestTeam(match.sides[1].contestantId in bracketData[2] ?  bracketData[2][match.sides[1].contestantId] : null);
        // console.log(localTeamName,guestTeamName );
        if(localTeam == null || guestTeam == null) return;
        // console.log(bracketData[2][match.sides[0].contestantId]);
        setSelectedMatch(match);
        setOpenForm(true);

}

const options = {
     onMatchClick: match => onMatchClickFunc(match),
     highlightedConnectionLinesColor: 'hsl(152 76% 42%)',
    highlightedPlayerTitleColor: 'hsl(152 76% 42%)',
    disableHighlight: false,
    visibleRoundsCount: 0,
    width: 'calc(100vw - 100px)'
   
}

    
window.addEventListener('resize',()=>  {
    setWindowWidth(window.innerWidth) 
    // if(window.innerWidth <= 700) {
    //     bracket.current.app
    // }

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
                navigate('/login');
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
        
       bracket.current = createBracket(bracketData, bracketContainer.current, (windowWidth <= 700 ? mobileOptions : options)) // se puede añadir otro campo llamado options
    
  },[tournamentData]) 



  function generateGames(data) {
    if(data.length === 0) return;
    const matches = [];
    

    // Generamos los partidos de la primera ronda
    data.forEach((game,index) => {
        if(game.round_index == 0) {
            const localScore = game.local_team_score ? JSON.parse(game.local_team_score) : [];
            const guestScore = game.guest_team_score ? JSON.parse(game.guest_team_score) : [];
            matches.push({
                roundIndex: 0,
                order: index,
                sides: [
                {contestantId: `${game.local_team_id}` ,scores: localScore  },
                {contestantId: `${game.guest_team_id}`,scores: guestScore }             
                ]
            })
    }
    });

    let round = 1;
    let previousRoundGames = matches.length;

    // Creamos automáticamente las rondas rondas siguientes
    while(previousRoundGames > 1) {
        const nextRoundGames = data.filter(g => g.round_index == round);
        console.log("Next round games",nextRoundGames);
        // console.log("rounnd index", nextRoundGames[0].round_index);
        // Calculamos cuántos partidos tendrá la siguiente ronda.
        const currentRoundGames = Math.ceil(previousRoundGames / 2);

         // Creamos los partidos vacíos de esta nueva ronda
         for (let i = 0; i < currentRoundGames; i++) {
            const localId = nextRoundGames[i] && nextRoundGames[i].round_index == round && nextRoundGames[i].game_order == i && nextRoundGames[i].local_team_id ? nextRoundGames[i].local_team_id?.toString() : ''; 
            const guestId = nextRoundGames[i] && nextRoundGames[i].round_index == round && nextRoundGames[i].game_order == i && nextRoundGames[i].guest_team_id ? nextRoundGames[i].guest_team_id?.toString() : ''; 
            const localScore = nextRoundGames[i] && nextRoundGames[i].round_index == round && nextRoundGames[i].game_order == i && nextRoundGames[i].local_team_score ? JSON.parse(nextRoundGames[i].local_team_score) : [];
            const guestScore = nextRoundGames[i] && nextRoundGames[i].round_index == round && nextRoundGames[i].game_order == i && nextRoundGames[i].guest_team_score ? JSON.parse(nextRoundGames[i].guest_team_score) : [];
            matches.push({
                roundIndex: round,
                order: i,
                sides: [
                    {contestantId: localId, scores: localScore },
                    {contestantId: guestId, scores: guestScore }
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
         <div className='bracket-container'>
            <h2>Copa Invierno 2026</h2>
            <div ref={bracketContainer} id='container'>
               
            </div>
            <div className='game-resullt-container'>
                {selectedMatch && openForm && (
                    <form onSubmit={(e)=> useSetGameResult({e, match: selectedMatch, bracket, gamesScore, setOpenForm, localTeam, guestTeam,tournamentId: 26,navigate})}>
                        <X className='close' onClick={()=> setOpenForm(false)} />
                        <p>Introduzca el resultado de la eliminatoria</p>

                        <div className='games-container'>
                        <ScoreForm
                            localTeam={localTeam}
                            guestTeam={guestTeam}
                            gamesScore={gamesScore}
                            setGamesScore={setGamesScore}
                            match={selectedMatch}
                        />
                        </div>

                        <button>Guardar</button>
                    </form>
                )}
            </div>
        </div>  
    )

};


export default Bracketry