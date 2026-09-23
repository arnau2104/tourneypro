import React, { useState } from 'react'
import { X } from 'lucide-react';
import { refreshToken } from '../services/refreshToken';

function GenerateMatchesForm({ tournamentId, setOpenGenerateMatchesForm, onGenerated, navigate }) {

    const [gameField, setGameField] = useState('');
    const [gameStartHour, setGameStartHour] = useState('');
    const [gameLocation, setGameLocation] = useState('');
    const [response, setResponse] = useState([null, ""]); //0 == error message 1= okay

    function handleSubmit(e) {
        e.preventDefault();

        fetch('/api/generateMatches', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tournamentId, gameField, gameStartHour, gameLocation }),
            credentials: 'include'
        }).then(async res => {
            if (res.status === 401) {
                const refreshOk = await refreshToken();

                if (!refreshOk) {
                    navigate('/login');
                    return;
                }

                const retryFetch = await fetch('/api/generateMatches', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ tournamentId, gameField, gameStartHour, gameLocation }),
                    credentials: 'include'
                });

                return retryFetch.json();
            }

            return res.json();
        }).then(data => {
            if (data.error) return setResponse([0, data.error]);

            setResponse([1, data.message]);
            onGenerated();

            setTimeout(() => {
                setOpenGenerateMatchesForm(false);
            }, 2000);

        }).catch(error => {
            console.log("error", error.message);
        })
    }

    return (
        <div className="container-inscription">
            <form onSubmit={(e) => handleSubmit(e)} className='generate-matches-form'>
                <X onClick={() => setOpenGenerateMatchesForm(false)} />
                <p className='title'>Generar Encuentros 🏆</p>

                <div>
                    <label htmlFor="game-field">Estadio para los partidos</label>
                    <input
                        id='game-field'
                        name='game-field'
                        type='text'
                        placeholder='Nombre del estadio'
                        value={gameField}
                        onChange={(e) => setGameField(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="game-location">Ubicación del partido</label>
                    <input
                        id='game-location'
                        name='game-location'
                        type='text'
                        placeholder='Ubicación del partido'
                        value={gameLocation}
                        onChange={(e) => setGameLocation(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="game-start-hour">Hora</label>
                    <input
                        id='game-start-hour'
                        name='game-start-hour'
                        type='time'
                        value={gameStartHour}
                        onChange={(e) => setGameStartHour(e.target.value)}
                        required
                    />
                </div>

                <button type='submit'>Generar encuentros</button>
                <p className={`response ${response[0] === 0 ? "error" : "correcto"}`}>{response[1]}</p>
            </form>
        </div>
    )
}

export default GenerateMatchesForm
