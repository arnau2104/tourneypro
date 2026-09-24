# TourneyPro

Aplicación web para crear y gestionar torneos deportivos: inscripción de equipos, generación de partidos, resultados, calendario y clasificación.

## Stack

- **Frontend**: React 19 + Vite, React Router, Tailwind CSS, [bracketry](https://github.com/moklick/bracketry) para el cuadro de eliminatorias.
- **Backend**: Node.js + Express 5, MySQL (mysql2), autenticación con JWT (access + refresh token en cookies), bcrypt para contraseñas, express-rate-limit en login/registro, validación con Zod.

## Estructura del proyecto

```
├── backend/              # API Express
│   ├── server.js         # rutas y middlewares
│   ├── db_connection.js  # conexión a MySQL
│   ├── schemas.js        # esquemas de validación (Zod)
│   └── querys/querys.js  # lógica de negocio / queries a la BD
├── src/
│   ├── pages/            # vistas: Login, Tournaments, Tournament, Games, Teams, Calendario, Inscripciones...
│   ├── components/       # Dashboard, Layout, Menu, formularios, etc.
│   ├── hooks/            # hooks propios (Bracketry, formularios, resultados)
│   ├── context/          # contexto de autenticación (AuthContext)
│   └── services/         # refresco de token
└── vite.config.js        # proxy de /api hacia el backend en dev
```

## Autenticación

- Login/registro devuelven un `access_token` (15 min) y un `refresh_token` (7 días) en cookies httpOnly.
- Las rutas protegidas de la API usan un middleware que valida el `access_token`; `src/services/refreshToken.js` se encarga de renovarlo desde el frontend.
- Login y registro están limitados a 5 intentos cada 15 minutos por IP.

## Rutas principales de la API

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/login` | Iniciar sesión |
| POST | `/api/register` | Registrar usuario |
| POST | `/api/refresh` | Renovar access token |
| POST | `/api/logout` | Cerrar sesión |
| GET | `/api/me` | Datos del usuario autenticado |
| GET | `/api/tournamentPageData` | Datos de la página de un torneo |
| POST | `/api/createTournament` / `/api/updateTournament` | Crear/editar torneo |
| POST | `/api/tournamentInscription` | Inscribir equipo a un torneo |
| POST | `/api/generateMatches` | Generar partidos del torneo |
| POST | `/api/updateGameData` | Actualizar resultado de un partido |
| GET | `/api/getTeams` / `/api/getAllTeams` / `/api/getUserTeams` | Consultar equipos |
| POST | `/api/createTeam` / `/api/joinTeam` | Crear equipo / unirse a un equipo |
| PUT | `/api/updateTeam` | Editar equipo |
| GET | `/api/getGames` / `/api/getAllGames` | Consultar partidos |
| GET | `/api/getMyInscriptions` | Inscripciones del usuario |
