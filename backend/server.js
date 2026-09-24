import express from 'express';
import { Querys } from './querys/querys.js';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import cors from 'cors';


const port = process.env.PORT || 3000;


const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1); // necesario detrás de proxies como Vercel/Render para que express-rate-limit lea bien la IP

app.use(express.json()); // importante para leer req.body
app.use(cookieParser());

app.use(cors({
    origin: process.env.FRONTEND_URL, // ej: https://tourneypro-web.onrender.com
    credentials: true // imprescindible para que el navegador mande/reciba cookies cross-origin
}));


const authMiddleware = (req, res, next) => { //middleware para comprovar que hay acces token en las cookies, solo se aplica en rutas protegidas
  const token = req.cookies.access_token;

  if(!token) {
    return res.status(401).send({ error: 'No se ha proporcionado un token de acceso' });
  }

  try {

    const data = jwt.verify(token, process.env.SECRET_JWT_KEY); //verificar que el token es valido y no ha expirado, si es valido devuelve la data del token (en este caso el id del usuario)

    req.user_id = data.user_id; //agregar el id del usuario a la req para que pueda ser usado en las rutas protegidas

    next(); //continuar con la siguiente función middleware o ruta

  }catch (error) {  
     console.log("Error", error.message);
    return res.status(401).json({ error: "no se ha podido iniciar session" });
   
  }

};

const loginLimiterMiddleware = rateLimit({
   windowMs: 15 * 60 * 1000, // ventana de tiempo: 15 min
  max: 5,                   // nº máx de peticiones permitidas por IP en esa ventana
  standardHeaders: true,     // añade cabeceras RateLimit-Limit / -Remaining / -Reset
  legacyHeaders: false,      // desactiva las cabeceras antiguas X-RateLimit-*
  message: { error: 'Demasiados intentos, inténtalo más tarde' }, // body de la respuesta 429
}); 

const registerLimiterMiddleware = rateLimit({
   windowMs: 15 * 60 * 1000, // ventana de tiempo: 15 min
  max: 5,                   // nº máx de peticiones permitidas por IP en esa ventana
  standardHeaders: true,     // añade cabeceras RateLimit-Limit / -Remaining / -Reset
  legacyHeaders: false,      // desactiva las cabeceras antiguas X-RateLimit-*
  message: { error: 'Demasiados intentos, inténtalo más tarde' }, // body de la respuesta 429
}); 

app.get('/api', (req,res) => {
  res.send({message: 'Hello World!'});
  console.log('Hello World');
})


 //RUTAS PUBLICAS
 app.post('/api/login', loginLimiterMiddleware, Querys.login);
 app.post('/api/register',registerLimiterMiddleware, Querys.register);
 app.post('/api/refresh', Querys.refreshToken);
 app.post('/api/logout', Querys.logout);
app.get('/api/getDashboardData', Querys.getDashboardData);


 //RUTAS PROTEGIDAS
 app.get('/api/me',authMiddleware, Querys.me);
 app.get('/api/tournamentPageData', authMiddleware, Querys.tournamentPageData);
 app.post('/api/createTournament', authMiddleware, Querys.createTournament);
 app.post('/api/updateTournament', authMiddleware, Querys.updateTournament);
 app.post('/api/tournamentInscription', authMiddleware, Querys.tournamentInscription);
 app.post('/api/tournamentData', authMiddleware, Querys.tournamentData);
 app.post('/api/updateGameData', authMiddleware, Querys.updateGameData);
 app.post('/api/generateMatches', authMiddleware, Querys.generateMatches);
 app.post('/api/selectTournament', authMiddleware, Querys.selectTournament);
 app.post('/api/getTeams', authMiddleware, Querys.getTeams);
 app.put('/api/updateTeam', authMiddleware, Querys.updateTeam);
 app.post('/api/getUserTeams', authMiddleware, Querys.getUserTeams);
 app.get('/api/getAllTeams', authMiddleware, Querys.getAllTeams);
 app.get('/api/getGames',authMiddleware, Querys.getGames);
 app.get('/api/getAllGames',authMiddleware, Querys.getAllGames);
 app.post('/api/createTeam', authMiddleware, Querys.createTeam);
 app.post('/api/joinTeam', authMiddleware, Querys.joinTeam);
 app.get('/api/getMyInscriptions', authMiddleware, Querys.getMyInscriptions);

// En Vercel la app se invoca como función serverless (sin app.listen);
// fuera de Vercel (local, Render, etc.) sí levantamos el servidor HTTP.
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto http://localhost:${port}`);
  });
}

export default app;