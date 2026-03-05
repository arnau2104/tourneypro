import React, { useEffect } from 'react'
import { refreshToken } from '../services/refreshToken';
import { useNavigate } from 'react-router-dom';


export function useSetGameResult({e,match,bracket,gamesScore,setOpenForm,localTeam,guestTeam,tournamentId,navigate}) {
    


    // console.log("Games score", gamesScore);
    const scores = gamesScore.filter(s => s.roundIndex == match.roundIndex && s.order == match.order)
    // console.log("score filtred", scores);

    const form = e.target;

    let localScore = [];
    let guestScore = [];

    if(scores.length > 0) {
        for(let i = 0; i < scores.length; i++) {
            localScore.push(scores[i].localScore);
            guestScore.push(scores[i].guestScore)
        }
    }
    // console.log("local", localScore);
    // console.log("gueust",guestScore);


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
                    isWinner: true,
                },)

                guestTeamScore.push({
                    mainScore : `${guestScore[i]}`,
                },)
            }else if(guestScore[i] > localScore[i]) {
                localTeamScore.push({
                    mainScore : `${localScore[i]}`,
                },)

                guestTeamScore.push({
                    mainScore : `${guestScore[i]}`,
                    isWinner: true,
                },)
            }else {
                // Es un empate en este partido individual
                localTeamScore.push({
                    mainScore : `${localScore[i]}`,
                },)

                guestTeamScore.push({
                    mainScore : `${guestScore[i]}`,
                },)
            }

            localGoals += Number(localScore[i]);
            guestGoals += Number(guestScore[i]);
       }

       // Si no hay tieWinner definido, usar diferencia de goles
       let winnerId = localGoals > guestGoals ? match.sides[0].contestantId : (guestGoals > localGoals ? match.sides[1].contestantId : null);

       return {localTeamScore, guestTeamScore, winnerId}
    }

    // console.log(setScore());
    
    const {localTeamScore, guestTeamScore, winnerId: autoWinnerId} = setScore (localScore,guestScore,match);

    // Verificar si hay un empate total y un ganador seleccionado
    let winnerId = autoWinnerId;
    
    const tieWinnerSelected = scores.find(s => s.tieWinner)?.tieWinner;
    if(autoWinnerId === null && tieWinnerSelected) {
        // Hay empate total y se seleccionó un ganador
        winnerId = match.sides[0].contestantId === tieWinnerSelected || 
                   match.sides[0].contestantId === tieWinnerSelected ? 
                   match.sides[0].contestantId : match.sides[1].contestantId;
        
        // Comparar con el nombre del equipo para encontrar el ID correcto
        if(tieWinnerSelected === localTeam.players[0].title) {
            winnerId = match.sides[0].contestantId;
        } else if(tieWinnerSelected === guestTeam.players[0].title) {
            winnerId = match.sides[1].contestantId;
        }
    }

    console.log(localTeamScore, guestTeamScore, winnerId);
    // console.log(allData);

    // console.log("Next round", allData.rounds[match.roundIndex + 1]);

    const nextMatch = allData.matches.find( m => m.roundIndex == nextRoundIndex && m.order === nextOrder);
    let nextGameData = {};

    // console.log(nextMatch);

    if(nextMatch) {
        const localTeam = nextMatch.sides[0].contestantId ?? '';
        const guestTeam = nextMatch.sides[1].contestantId ?? '';


        // Siempre definimos el sideIndex: 0 = local, 1 = guest
        nextGameData = {
            local: { ...nextMatch.sides[0] },
            guest: { ...nextMatch.sides[1] }
        };
    
        if (sideIndex === 0) {
        // El ganador va al side "local"
        nextGameData.local.contestantId = winnerId;
        } else {
            // El ganador va al side "guest"
            nextGameData.guest.contestantId = winnerId;
        }

        // Inicializamos scores si quieres
        nextGameData.local.scores = nextGameData.local.scores || [];
        nextGameData.guest.scores = nextGameData.guest.scores || [];

            // console.log(nextGameData.local);
            // console.log(nextGameData.guest);
    }

    

    
   

    bracket.current.applyMatchesUpdates([
        {
            roundIndex : match.roundIndex,
            order: match.order,
            sides: [
                {
                    contestantId: match.sides[0].contestantId,
                    scores: localTeamScore,

                   isWinner: winnerId === match.sides[0].contestantId

                    
                },
                {
                    contestantId: match.sides[1].contestantId,
                    scores: guestTeamScore,

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

    const updatedData = bracket.current.getAllData();
   const matchResult =  updatedData.matches.find( m => m.roundIndex == match.roundIndex && m.order === match.order);
   const nextMatchData = updatedData.matches.find( m => m.roundIndex == nextRoundIndex && m.order === nextOrder);

   console.log("Updated data:", updatedData);
   console.log("Resultado del patido:", matchResult);
    console.log("Next match", nextMatchData);

    fetch('/api/updateGameData', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            tournamentId,
            match: matchResult,
            localScore : localTeamScore,
            guestScore: guestTeamScore,
            nextMatch: nextMatchData
        }),
        credentials: 'include'
    }).then(async res => {
         if(res.status == 401) {
            
            const refreshOk = await refreshToken();

            if(!refreshOk) {
                console.log("No se ha podido refrescar el token");
                navigate('/login');
                return
            }

            const retryFetch = await fetch('/api/updateGameData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tournamentId,
                    match: matchResult,
                    nextMatch: nextMatchData
                }),
                credentials: 'include'
            });

            return retryFetch.json();
        }

        return res.json();
    }).then(data => {
        console.log(data);
    }).catch(error => {
        console.log("Error durante la peticion", error.message);
    })
    
    
    setOpenForm(false)

} 


