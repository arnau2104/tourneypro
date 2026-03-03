import { useEffect, useState } from "react";
import {Plus } from 'lucide-react';


function ScoreForm({ localTeam, guestTeam, gamesScore,setGamesScore, match }) {

  const roundIndex = match.roundIndex;
  const order = match.order;
 

  useEffect(()=> {
     const exist = gamesScore.filter(game => game.roundIndex == roundIndex && game.order == order);

      if(exist.length == 0) { //no objeto creado para este partido
        setGamesScore([...gamesScore, {roundIndex, order, localScore: "", guestScore: "" }]) 
      }

  },[match])

 
  //  console.log("game selected",gameSelected,"match",match);
  function addGame() {
    console.log("add game ");
    setGamesScore(prevGames => [
  ...prevGames,
      {roundIndex, order, localScore: "", guestScore: "" }
    ]);
  }

  function handleChange(index, e) {
    const updatedGames = [...gamesScore];
    updatedGames[index][e.target.name] = e.target.value;
    setGamesScore(updatedGames);
  }

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
       )
    })}

    </>
  );
}

export default ScoreForm;