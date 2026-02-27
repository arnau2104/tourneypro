import React, {useEffect,useRef, useState} from 'react'
import {createBracket} from 'bracketry';
import { refreshToken } from '../services/refreshToken';
import { Navigate } from 'react-router-dom';
import { RiTeamLine } from 'react-icons/ri';


function Bracketry() {

    const bracketContainer = useRef(null);
    const games = useRef([])
    const teams = useRef([])
    const [tournamentData, setTournamentData] = useState({});
    const bracket  = useRef(null)
    const [resultForm,setResultForm] = useState('')

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
    leftNavButtonHTML: `< PREV ROUND`,
    rightNavButtonHTML: `NEXT ROUND >`,
    roundTitlesFontSize: 26,
    roundTitlesVerticalPadding: 4,
    matchFontSize: 14,
    matchHorMargin: 14,
    distanceBetweenScorePairs: 10,
    getEntryStatusHTML: () => '',
    disableHighlight: true,
    verticalScrollMode: 'mixed',
    scrollButtonPadding:'0px'
    // maxMatchWidth: 360
};

const options = {
     onMatchClick: match => {
        // const name1 = data.contestants[match.sides[0].contestantId].players[0].title
        // const name2 = data.contestants[match.sides[1].contestantId].players[0].title
        // displayPopup(`...Some details of the match between ${name1} and ${name2}`)
        console.log("Match:", match);
      setResultForm( 
      <div className='game-resullt-container'>
        <form>
            <p>Introduzca el resultado del partido</p>

            <div>
                <label > Leones del Norte
                <input type="number" />
                </label>
                <label > Dragones FC
                <input type="number" />
                </label>
            </div>
            <button>Guardar</button>
        </form>
       </div>
      )
        // setGameResult(match,bracket)
    }
}

    


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
        
       bracket.current = (createBracket(bracketData, bracketContainer.current,options)) // se puede añadir otro campo llamado options
    
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

function  test(match) {
    console.log(games);
}

function setGameResult(match,bracket) {

    const localScore = [1];
    const guestScore = [3];


    // console.log(match);
    const allData = bracket.current.getAllData();
     const nextRoundIndex = match.roundIndex + 1;
    const nextOrder = Math.floor(match.order / 2);
    const sideIndex = match.order % 2;
    

    function setScore (localScore,guestScore,match) {
        let localTeamScore = [];
        let guestTeamScore = [];
        let guestGoals = 0;
        let localGoals = 0;
       if(localScore.length === 0 || guestScore.length === 0 || (localScore.length !== guestScore.length)) return null;

       for(let i = 0; i < localScore.length; i++) {
            if(localScore[i] > guestScore[i]) {
                localTeamScore.push({
                    mainScore : `${localScore[i]}`,
                    isWinner: true
                })

                guestTeamScore.push({
                    mainScore : `${guestScore[i]}`
                })
            }else if(guestScore[i] > localScore[i]) {
                localTeamScore.push({
                    mainScore : `${localScore[i]}`
                })

                guestTeamScore.push({
                    mainScore : `${guestScore[i]}`,
                    isWinner: true
                })
            }

            localGoals = localGoals + localScore[i];
            guestGoals = guestGoals + guestScore[i];
       }

       let winnerId = localGoals > guestGoals ? match.sides[0].contestantId : match.sides[1].contestantId;

       return {localTeamScore, guestTeamScore, winnerId}
    }

    // console.log(setScore());
    
    const {localTeamScore, guestTeamScore, winnerId} = setScore (localScore,guestScore,match);

    console.log(localTeamScore, guestTeamScore, winnerId);
    // console.log(allData);

    // console.log("Next round", allData.rounds[match.roundIndex + 1]);

    const nextMatch = allData.matches.find( m => m.roundIndex == nextRoundIndex && m.order === nextOrder);
    let nextGameData = {};

    // console.log(nextMatch);

    if(nextMatch) {
        console.log("dins if");
        const localTeam = nextMatch.sides[0].contestantId ?? '';
    const guestTeam = nextMatch.sides[1].contestantId ?? '';
    
        if(!localTeam) {
            nextGameData = {
                local : {contestantId: match.sides[0].contestantId,scores: []}, // el ganador
                guest : {contestantId: guestTeam,scores: []}
            }
        }else if(!guestTeam) {
            nextGameData = {
                local : {contestantId: localTeam,scores: []}, // el ganador
                guest : {contestantId: match.sides[0].contestantId,scores: []}
            }    
        }

        console.log(nextGameData.local);
        console.log(nextGameData.guest);
    }

    

    
   

    bracket.current.applyMatchesUpdates([
        {
            roundIndex : match.roundIndex,
            order: match.order,
            sides: [
                {
                    contestantId: match.sides[0].contestantId,
                    scores: [
                        localTeamScore[0]
                    ],

                   isWinner: winnerId === match.sides[0].contestantId

                    
                },
                {
                    contestantId: match.sides[1].contestantId,
                    scores: [
                        guestTeamScore[0]

                    ],

                    isWinner: winnerId === match.sides[1].contestantId
                }
            ]

        },
        {
            roundIndex: nextRoundIndex,
            order: nextOrder,
            sides: Object.keys(nextGameData).length > 0 ? [
                    nextGameData.local,
                    nextGameData.guest
                ]    
                : sideIndex === 0 ? 
                [
                    {contestantId: winnerId,scores: []}, // el ganador
                    {contestantId:'',scores: []}
                ]:  
                    [ 
                    {contestantId: '',scores: []}, 
                    {contestantId:winnerId,scores: []}// el ganador
                ]
               
        }
        

    ])

}



  
    return (
         <div>
            <h2>Torneo - Eliminación Directa</h2>
            <div ref={bracketContainer} id='container'>
               
            </div>
            <div>
                 {resultForm}
            </div>
        </div>  
    )

};


export default Bracketry