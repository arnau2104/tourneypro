import React from 'react'

function Create_Tournamwnt_Form() {
  return (
   <div className='crear-torneo-container'>
            <div>
            <div className='cerrar-crear-torneo'><h3>Crear Torneo</h3> <X onClick={()=> setOpenInsertForm(false)} /></div>
                <p>Configura los detalles del torneo</p>
            </div>

            <form onSubmit={(e) => sendFormData(e)}>
                <label htmlFor="tournament-name">Nombre del Torneo
                    <input type="text" id="tournament-name" name="tournament-name"  placeholder='Ej: Torneo de Vernao 2026' value={tournamentName} onChange={(e) => setTournamentName(e.target.value)} />
                </label>
                
                <div>
                    <label htmlFor="sport">Deporte
                        <select id="sport" name="sport" value={sport} onChange={(e) => setSport(e.target.value)}>
                            {sportOptions.length > 0 ? ( sportOptions.map(sport => {
                                return <option key={sport.sport_id} value={sport.sport_id}>{ucFirst(sport.sport_name)}</option>
                            })) : <option value="">No hay deportes disponibles</option>}
                        </select>
                    </label>

                    <label htmlFor="tournament-organizer">Organizador del Torneo
                        <input type="text" id="tournament-organizer" name="tournament-organizer" placeholder='Nombre del organizador' value={organizer} onChange={(e) => setOrganizer(e.target.value)} />
                    </label>
                    
                </div>

                <div>
                    <label htmlFor="start-date">Fecha de Inicio 
                        <input type="date" id="start-date" name="start-date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </label>
                
                    
                    <label htmlFor="end-date">Fecha de Fin
                        <input type="date" id="end-date" name="end-date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </label>
                    
                </div>

                <div>
                    <label htmlFor="location">Ubicación
                        <input type="text" id="location" name="location" placeholder='Ciudad, País' value={location} onChange={(e) => setLocation(e.target.value)} />
                    </label>
                    

                    <label htmlFor="total-teams">Número de Equipos
                        <input type="number" id="total-teams" name="total-teams" placeholder='Ej: 8' value={totalTeams} onChange={(e) => setTotalTeams(e.target.value)} />
                    </label>
                    
                </div>

                <label htmlFor="tournament-type">Tipo de Torneo
                    <select id="tournament-type" name="tournament-type" value={tournamentType} onChange={(e) => setTournamentType(e.target.value)}>
                        <option value="playoffs">Eliminatorias</option>
                        <option value="league">Liga</option>
                        <option value="playoffs,league">Liga + Eliminatorias</option>
                    </select>
                </label>

                <div>
                    <label htmlFor="tournament-prize">Premio del Torneo (opcional)
                        <input type="text" id="tournament-prize" name="tournament-prize" placeholder='Ej: 1000€' value={prize} onChange={(e) => setPrize(e.target.value)} />
                    </label>
                    
                    <label htmlFor="inscription-price-per-team">Precio de Inscripción por Equipo 
                        <input type="number" id="inscription-price-per-team" name="inscription-price-per-team" placeholder='Ej: 50€' value={inscriptionPrice} onChange={(e) => setInscriptionPrice(e.target.value)} />
                    </label>
                    
                </div>

                    <label htmlFor="tournament-requirements">Requisitos del Torneo (opcional)
                        <input type="text" id="tournament-requirements" name="tournament-requirements" placeholder='Ej: Equipos deben tener mínimo 11 jugadores' value={requirements} onChange={(e) => setRequirements(e.target.value)} />
                    </label> 

                <button type="submit">Crear Torneo</button>

            <p className={`response ${responseText[1]} `}>{responseText[0]}</p>

            </form>
            
        </div>
  )
}

export default Create_Tournamwnt_Form