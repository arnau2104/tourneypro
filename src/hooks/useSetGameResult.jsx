import React, { useEffect } from 'react'

export function useSetGameResult({e,match,bracket,setResultForm}) {
    
    e.preventDefault()

    const form = e.target;

    const localScore = [form.localScore.value];
    const guestScore = [form.guestScore.value];


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
                local : {contestantId: winnerId,scores: []}, // el ganador
                guest : {contestantId: guestTeam,scores: []}
            }
        }else if(!guestTeam) {
            nextGameData = {
                local : {contestantId: localTeam,scores: []}, // el ganador
                guest : {contestantId: winnerId,scores: []}
            }    
        }else if( guestTeam && localTeam) {
            nextGameData =sideIndex === 0 ? {
                local : {contestantId: winnerId,scores: []}, // el ganador
                guest : {contestantId: guestTeam,scores: []}
            } : {
                local : {contestantId: localTeam,scores: []}, // el ganador
                guest : {contestantId: winnerId,scores: []}
            }
        }

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

    setResultForm(' ')

} 


