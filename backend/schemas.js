import z from 'zod';

const userSchema = z.object( {
    name : z.string('El nombre no es valido'),
    lastname : z.string('El apellido no es valido'),
    birthdate: z.coerce.date("La fecha de nacimiento no es válida"),
    email: z.email('El email no es válido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')
});

const tournamentBaseSchema = z.object({
    tournamentId: z.number('El id del torneo no es válido').optional(),
    tournamentName: z.string('El nombre del torneo no es válido'),
    sport: z.number('El deporte no es válido'),
    organizer: z.string('El organizador no es válido'),
    startDate: z.coerce.date('La fecha de inicio no es válida'),
    endDate: z.coerce.date('La fecha de fin no es válida'),
    location: z.string('La ubicación no es válida'),
    totalTeams: z.number('El número de equipos no es válido'),
    roundsNames: z.array(z.string('El nombre de la ronda no es válido')),
    tournamentType: z.enum(['playoffs', 'league', 'playoffs,league'], 'El tipo de torneo no es válido'),
    prize: z.string('El premio no es válido').optional(),
    inscriptionPrice: z.number('El precio de inscripción no es válido').optional(),
    requirements: z.string('Los requisitos no son válidos').optional(),
    tournamentStatus: z.enum(['próximamente', 'iniciado', 'cerrado', 'en curso', 'finalizado'], 'El estado del torneo no es válido'),
    isActive: z.number('El estado del torneo no es válido').min(0).max(1).optional(),

});

// Con eliminatorias el número de equipos debe ser una potencia de 2 (4, 8, 16, 32...)
// para poder generar rondas completas (cuartos, semifinal, final...) sin equipos sobrantes.
function validTeamsForPlayoffs(data) {
    if (!data.tournamentType || data.totalTeams === undefined) return true;
    if (!data.tournamentType.includes('playoffs')) return true;

    return data.totalTeams >= 4 && Number.isInteger(Math.log2(data.totalTeams));
}

const teamsValidationOptions = {
    message: 'El número de equipos debe ser una potencia de 2 (4, 8, 16, 32...) para poder generar las eliminatorias',
    path: ['totalTeams']
};

const tournamentSchema = tournamentBaseSchema.refine(validTeamsForPlayoffs, teamsValidationOptions);
const shieldUrl = z
  .string()
  .max(2048)
  .url()
  .refine((u) => {
    try {
      return new URL(u).protocol === 'https:';
    } catch {
      return false;
    }
  }, 'El escudo debe ser una URL https válida');


const teamSchema = z.object({
    team_name: z.string().min(1),
    team_description: z.string().optional(),
    max_players: z.number().min(1),
    team_shield: shieldUrl.optional()
});



const updateTeamSchema = z.object({
    team_id: z.number().min(1),
    team_name: z.string().min(1),
    team_description: z.string().optional(),
    max_players: z.number().min(1),
    team_shield: shieldUrl.optional()
});





export function validateUserData(userData) {
    return userSchema.safeParse(userData);
}

export function validatePartialUserData(userData) {
    return userSchema.partial().safeParse(userData);
}

export function validateTournamentData(tournamentData) {
    return tournamentSchema.safeParse(tournamentData);
}

export function validatePartialTournamentData(tournamentData) {
    return tournamentBaseSchema.partial().refine(validTeamsForPlayoffs, teamsValidationOptions).safeParse(tournamentData);
}

export function validateTeamData(teamData) {
    return teamSchema.safeParse(teamData);
}

export function validateUpdateTeamData(teamData) {
    return updateTeamSchema.safeParse(teamData);
}