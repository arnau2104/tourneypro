import express from 'express';
import { connection } from './db_connection.js';
import { Querys } from './querys/querys.js';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';


const port = process.env.PORT || 3000;



const app = express();

app.disable('x-powered-by');

app.use(express.json()); // importante para leer req.body
app.use(cookieParser());

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
    return res.status(401).json({ error: "no se ha podido iniciar session" });
    console.log("Error", error.message);
  }

};

app.get('/api', (req,res) => {
  res.send({message: 'Hello World!'});
  console.log('Hello World');
})


  //RUTAS PUBLICAS
 app.post('/api/login', Querys.login);
 app.post('/api/register', Querys.register);
 app.post('/api/refresh', Querys.refreshToken);
 app.post('/api/logout', Querys.logout);

 //RUTAS PROTEGIDAS
 app.get('/api/tournamentPageData', authMiddleware, Querys.tournamentPageData);
 app.post('/api/createTournament', authMiddleware, Querys.createTournament);
 app.get('/api/tournamentData', authMiddleware, Querys.tournamentData);

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto http://localhost:${port}`);
});