import React, {useState} from 'react'
import ScoreForm from '../hooks/ScoreForm'
import { Plus,X } from 'lucide-react';

function EditGame({game,teams}) {
    // console.log("Edit game",game);
    // console.log("edit",teams);
    console.log("game", game);
    const localTeam = teams.find(team => team.team_id === game.local_team_id);
    const guestTeam = teams.find(team => team.team_id === game.guest_team_id);
    const tournamentName = teams.find(t => t.tournament_id === game.tournament_id);
    const [localTeamScore, setLocalTeamScore] = useState( game.local_team_score ? JSON.parse(game.local_team_score) : [] ); 
    const [guestTeamScore, setGuestTeamScore] = useState(game.guest_team_score ? JSON.parse(game.guest_team_score) : []);
    const totalLocalScore = localTeamScore.reduce((a, b) => a + +b.mainScore, 0) ?? 0; //sumamos todos los goles del equipo local
    const totalGuestScore = guestTeamScore.reduce((a, b) => a + +b.mainScore, 0) ?? 0; //sumamos todos los goles del equipo visitante

    console.log("local team", localTeam);

    let isTie = totalLocalScore === totalGuestScore;
     function addGame() {
      console.log("add game ");
      setLocalTeamScore(prev => [...prev, { mainScore: "" }]);
  setGuestTeamScore(prev => [...prev, { mainScore: "" }]);
  }

 

  return (
     <div className='game-resullt-container'>
        <form>
            <X className='close' onClick={()=> setOpenForm(false)} />
            <p>Introduzca el resultado de la eliminatoria</p>
          <div className='games-container'>
            <div className="score-div">
              {localTeamScore.length === guestTeamScore.length &&
                localTeamScore.map((localScore, index) => {
                  const guestScore = guestTeamScore[index];

                  return (
                    <>
                      <label>
                        {localTeam.team_name}
                        <input
                          type="number"
                          required
                          name="localScore"
                          value={localScore.mainScore}
                          onChange={(e) => handleChange(index, e)}
                        />
                      </label>

                      <label>
                        {guestTeam.team_name}
                        <input
                          type="number"
                          required
                          name="guestScore"
                          value={guestScore.mainScore}
                          onChange={(e) => handleChange(index, e)}
                        />
                      </label>
                    </>
                  );
            })}

                
            <Plus className="add-game" onClick={addGame} /> 
          </div>


            {isTie && (
                      <label>
                        🏆 Ganador del empate:
                        <select
                          name="tieWinner"
                          value={""}
                          onChange={(e) => handleChange(firstMatchIndex, e)}
                          required
                        >
                          <option value="">-- Selecciona ganador --</option>
                          <option value={localTeam.team_id}>
                            {localTeam.team_name}
                          </option>
                          <option value={guestTeam.team_id}>
                            {guestTeam.team_name}
                          </option>
                        </select>
                      </label>
              )}
        </div>
            <button>Guardar</button>
      </form>
    </div>
  );
}

export default EditGame