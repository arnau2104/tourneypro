import { useEffect, useState } from "react";
import {Plus } from 'lucide-react';


function ScoreForm({ localTeam, guestTeam, gamesScore,setGamesScore, match }) {

  const roundIndex = match.roundIndex;
  const order = match.order;
 

  useEffect(()=> {
     const exist = gamesScore.filter(game => game.roundIndex == roundIndex && game.order == order);

      if(exist.length == 0) { //no objeto creado para este partido
        setGamesScore([...gamesScore, {roundIndex, order, localScore: "", guestScore: "", tieWinner: "" }]) 
      }

  },[match])

 
  //  console.log("game selected",gameSelected,"match",match);
  function addGame() {
    console.log("add game ");
    setGamesScore(prevGames => [
  ...prevGames,
      {roundIndex, order, localScore: "", guestScore: "", tieWinner: "" }
    ]);
  }

    function handleChange(index, e) {
  setGamesScore(prev => {
    const updated = [...prev];
    updated[index] = { ...updated[index], [e.target.name]: e.target.value };
    return updated;
  });
}

    // Calcular total de goles
        let totalLocalGoals = 0;
        let totalGuestGoals = 0;
        const matchGames = gamesScore.filter(g => g.roundIndex == roundIndex && g.order == order);
        matchGames.forEach(g => {
          if(g.localScore) totalLocalGoals += Number(g.localScore);
          if(g.guestScore) totalGuestGoals += Number(g.guestScore);
        });

        // Mostrar selector solo si: hay empate en este partido Y (es el único partido O hay diferencia de goles totales)
        const isTie = totalGuestGoals == totalLocalGoals;
        // const isOnlyGame = indexes.length === 1;
        // const hasDifference = totalLocalGoals !== totalGuestGoals;
        const shouldShowSelector = isTie;
        
        const matchIndexes = gamesScore
  .map((g, i) => (g.roundIndex == roundIndex && g.order == order ? i : -1))
  .filter(i => i !== -1);

const firstMatchIndex = matchIndexes[0];

  return (
    <>

      {gamesScore.map((game, index) => {
        if(game.roundIndex !== roundIndex || game.order !== order) {return null} // si el roundINdex y el order no coiniciden no enesñar

        let indexes = gamesScore.reduce((acc,game,index) => {
          if(game.roundIndex == roundIndex && game.order == order) acc.push(index);
          return acc;
        },[]);

      

        // console.log("Reduced", indexes);
       
        return (
          <>
          <div className="score-div" key={index}>
              <label>
                {localTeam.players[0].title}
                <input
                  type="number"
                  required
                  name="localScore" 
                  value={game.localScore}
                  onChange={(e) => handleChange(index, e)}
                />
              </label>

              <label>
                {guestTeam.players[0].title}
                <input
                  type="number"
                  required
                  name="guestScore"
                  value={game.guestScore}
                  onChange={(e) => handleChange(index, e)}
                />
              </label>
                        {indexes[indexes.length - 1] == index ? <Plus className="add-game" onClick={addGame} /> : ''} 

            </div>

          

        </>
       )
      
    })}

      {isTie && (
                <label>
                  🏆 Ganador del empate:
                  <select
                    name="tieWinner"
                    value={matchGames[0]?.tieWinner || ""}
                    onChange={(e) => handleChange(firstMatchIndex, e)}
                    required
                  >
                    <option value="">-- Selecciona ganador --</option>
                    <option value={localTeam.players[0].title}>
                      {localTeam.players[0].title}
                    </option>
                    <option value={guestTeam.players[0].title}>
                      {guestTeam.players[0].title}
                    </option>
                  </select>
                </label>
        )}

    </>
  );
}

export default ScoreForm;