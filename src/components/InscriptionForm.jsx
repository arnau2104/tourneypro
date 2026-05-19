import React, { useState} from 'react'
import {X} from 'lucide-react';
import { refreshToken } from '../services/refreshToken';


function InscriptionForm({teams,setOpenInscriptionForm,tournamentId,navigate}) {
    // console.log("equipos recibidos", teams);
    const [response, setResponse] = useState([null,""]); //0 == error message 1= okay
    const [teamSelected, setTeamSelected] = useState(null);
    function handleSubmit(e){
        e.preventDefault();
        console.log("team id", e.target[0].value);

        fetch('/api/tournamentInscription',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({teamId: e.target[0].value,tournamentId}),
            credentials: 'include'
        }).then(async res => {
                      if(res.status === 401) {
        
                        const refreshOk = await refreshToken(); // intentar refrescar el token
        
                        if(!refreshOk) {
                            navigate('/login'); //redirigir al usuario a la página de login para que inicie sesión de nuevo
                            return;
                        }
        
                           // 🔥 IMPORTANTE: volver a intentar la petición original
                           const retryFetch = await fetch('/api/tournamentInscription', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({teamId: e.target[0].value,tournamentId}),
                                credentials: 'include'
                            });
        
                            return retryFetch.json(); //devolvemos directamente el json
                    }
        
                    return res.json();
                })
        .then(data => {
            console.log("data", data);
            console.log("message", data.message);
            console.log("error", data.error);
            
            if(data.error) return setResponse([0,data.error]);
            
            setResponse([1,data.message]);

            setTimeout(()=>{
                setOpenInscriptionForm(false)
            },2000);
            
        })
    }


  return (
    <div className="container-inscription">
        <form onSubmit={(e)=>handleSubmit(e)} className='inscription-form'>
            <X onClick={()=>setOpenInscriptionForm(false)}/>
            <p className='title'>Inscripción al Torneo 🏆</p>
            <div>
                <label htmlFor="teams-select"> Seleccione Equipo </label>
                <select name="teams-select" onChange={(e)=>setTeamSelected(e.target.value)}>
                    {
                        teams.map(team => (
                        <option key={team.team_id} value={team.team_id}>{team.team_name}</option>
                        ))
                    }
                </select>
            </div>
            <button type='submit'>Inscribirse</button>
            <p className={`response ${response[0] === 0 ? "error" : "correcto"}`}>{response[1]}</p>
        </form>
    </div>
  )
}

export default InscriptionForm