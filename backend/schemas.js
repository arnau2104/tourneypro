import z from 'zod';

const userSchema = z.object( {
    name : z.string('El nombre no es valido'),
    lastname : z.string('El apellido no es valido'),
    birthdate: z.coerce.date("La fecha de nacimiento no es válida"),
    email: z.email('El email no es válido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 6 caracteres')
});

const tournamentSchema = z.object({
    tournamentName: z.string('El nombre del torneo no es válido'),
    sport: z.number('El deporte no es válido'),
    organizer: z.string('El organizador no es válido'),
    startDate: z.coerce.date('La fecha de inicio no es válida'),
    endDate: z.coerce.date('La fecha de fin no es válida'),
    location: z.string('La ubicación no es válida'),
    totalTeams: z.number('El número de equipos no es válido'),
    tournamentType: z.enum(['playoffs', 'league', 'playoffs,league'], 'El tipo de torneo no es válido'),
    prize: z.string('El premio no es válido').optional(),
    inscriptionPrice: z.number('El precio de inscripción no es válido').optional(),
    requirements: z.string('Los requisitos no son válidos').optional()

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
    return tournamentSchema.partial().safeParse(tournamentData);
}