import { connection } from '../db_connection.js';
import dotenv from 'dotenv';
dotenv.config({ path: 'backend/.env' });
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validateUserData, validatePartialUserData, validateTournamentData, validatePartialTournamentData } from '../schemas.js';
export class Querys {

    static async login(req, res) {  
    
    try {
       const {email, password} = req.body;
       
       // Buscar usuario solo por email
       const [result] = await connection.query( "SELECT * FROM users WHERE email = ?", 
       [email]);

       console.log(result);
   
       // Si no existe el usuario
       if (result.length === 0 || !result) {
           return res.status(401).json({ error: 'Contraseña o email incorrectos' });
           console.log("error en el resullt", result);
       }

       // Verificar que la contraseña coincida con la encriptada
       const passwordValida = await bcrypt.compare(password, result[0].password);

       if (!passwordValida) {
           return res.status(401).json({ error: 'Contraseña o email incorrectos' });
       }

       const tokens = await generateAccessToken(result[0].user_id);

       if(tokens.error) {
        return res.status(500).json({ error: tokens.error });
        console.log(tokens.error);
       }

       res
        .cookie('access_token', tokens.accessToken, {
            httpOnly: true, // El token no es accesible desde JavaScript del lado del cliente, solo accesible desde el backend
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production', // false en desarrollo
            maxAge: 15 * 60 * 1000, //15 minutos
        })
        .cookie('refresh_token', tokens.refreshToken, {
            httpOnly: true, // El token no es accesible desde JavaScript del lado del cliente, solo accesible desde el backend
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production', // false en desarrollo
            maxAge: 7 * 24 * 60 * 60 * 1000, //7 dias
        })
       .send({ message: 'Inicio de sesión exitoso'});
   
     } catch (error) {
        res.status(500).json({ error: "Ha ocurrido un error insesperado, intentelo de nuevo" });
    // res.status(500).json({ error: error.message });
    //    console.error("error",error.message);

     }  
    
    }

    static async register (req,res) {
        try {

            const result = validatePartialUserData(req.body);

            // console.log(result);

            if(!result.success) return res.status(400).json({ error: result.error.issues[0].message });

            
            const [thisusersExists] = await connection.query("SELECT * FROM users WHERE email = ?", //comprovamos si el usuario ya existe
                [result.data.email]);

            if(thisusersExists.length > 0) { // si el usuario ya existe, no se puede registrar
                return res.status(400).json({ error: 'Este usuario ya existe, ponga otro email' });
            }

            const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS); // Obtener el número de rondas de salado desde la variable de entorno, o usar un valor predeterminado
            const encryptedPassword = await bcrypt.hash(result.data.password, saltRounds);

            // console.log("Encripted password", encryptedPassword);

            const [insertUser] = await connection.query( "INSERT INTO users (name, lastname, birthdate, email, password) VALUES (?, ?, ?, ?, ?)", 
                [result.data.name, result.data.lastname, result.data.birthdate, result.data.email, encryptedPassword]
              )
        
            // console.log("Insert user result", insertUser); 

            if(insertUser.affectedRows === 0) { // ha ocurrido un error en el insert, no se ha podido registrar el usuario
                return res.status(500).send({ error: 'No se ha podido registrar el usuario, intentelo de nuevo' });
            }

            if(insertUser.affectedRows > 0) { // el usuario se ha registrado correctamente
                const tokens = await generateAccessToken(insertUser.insertId); //generar el token de acceso y el refresh token para el nuevo usuario registrado
                if(tokens.error) return res.sendStatus(401);
                       
                res
                    .cookie('access_token', tokens.accessToken, {
                      httpOnly: true, // El token no es accesible desde JavaScript del lado del cliente, solo accesible desde el backend
                      sameSite: 'strict',
                    secure: process.env.NODE_ENV === 'production', // false en desarrollo
                      maxAge: 15 * 60 * 1000, //15 minutos

                    })
                    .cookie('refresh_token', tokens.refreshToken, {
                       httpOnly: true, // El token no es accesible desde JavaScript del lado del cliente, solo accesible desde el backend
                       sameSite: 'strict',
                       secure: process.env.NODE_ENV === 'production', // false en desarrollo
                        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días

                    })
                    .send({ message: 'Usuario registrado correctamente' });
            }
        
        }catch (error) {
            res.status(500).send({ error: "Ha ocurrido un error insesperado, intentelo de nuevo" });
        }

    }

    static async refreshToken (req,res) {

        const refreshToken = req.cookies.refresh_token; //miramos si existe el refresh token en las cookies

        if(!refreshToken) return res.sendStatus(401); //si no existe el refresh token, no se puede refrescar el token de acceso, el usuario tiene que iniciar sesión de nuevo

        try {

            const decoded = jwt.verify(refreshToken, process.env.SECRET_JWT_KEY); //verificar que el refresh token es valido y no ha expirado, si es valido devuelve la data del token (en este caso el id del usuario)

            const [userTokens] = await connection.query( "SELECT * FROM refresh_tokens WHERE user_id = ?  AND expiry_date > NOW()",
                [decoded.user_id]
            );

            // console.log("Refres tokens", userTokens)

            if(userTokens.length === 0) return res.sendStatus(403); //si el refresh token no existe en la base de datos o ha expirado, no se puede refrescar el token de acceso, el usuario tiene que iniciar sesión de nuevo

            let validToken = null; //para comparar con bcrypt

          for (const token of userTokens) {

            const match = await bcrypt.compare(refreshToken, token.refresh_token); //comparar el refresh token recibido con el refresh token encriptado de la base de datos

            if(match)  {
                validToken = token; 
                break;
            }

        };

        if(!validToken) return res.sendStatus(403);

        // console.log("Valid token:", validToken)
        // console.log("Valid token id:",validToken.refresh_token_id )
        
        //eliminar el refresh token antiguo de la base de datos, ya que se va a generar uno nuevo      
        const [deletOldTOken] = await connection.query("DELETE FROM refresh_tokens WHERE refresh_token_= ?",
            [validToken.refresh_token]);

        console.log("Filas afectadas",deletOldTOken.affectedRows);
            
        const newTokens = await generateAccessToken(decoded.user_id); //la funcion ya hace insert del nuevo refresh token en la bd
        
        res
            .cookie('access_token', newTokens.accessToken, {
                httpOnly: true,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 15 * 60 * 1000,

            })
            .cookie('refresh_token', newTokens.refreshToken, {
                httpOnly: true,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })
            .send({ message: 'Token actualizado correctamente' });

            
        } catch (error) {

            res.sendStatus(403); //si el refresh token no es valido o ha expirado, no se puede refrescar el token de acceso, el usuario tiene que iniciar sesión de nuevo
            console.error(error.message);
            
        }

    }

    static async logout (req,res) { 
        try {
         res.clearCookie("access_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // solo en producción
            sameSite: "strict",
        });

        // Opcional: también borrar refresh token
        res.clearCookie("refresh_token", {  
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        res.json({ message: "Sesión cerrada correctamente" });

        } catch (error) { 
            res.status(500).json({ error: "Ha ocurrido un error insesperado, intentelo de nuevo" });
        }
    }



    static async tournamentPageData (req,res) {
        
        try {

        const [sports] = await connection.query("SELECT * FROM sports WHERE is_active = 1"); //obtener todos los deportes activos de la base de datos

        if(sports.length === 0) return res.status(404).json({ error: 'No se han encontrado deportes' });

        const [tournaments] = await connection.query("SELECT * FROM tournaments WHERE is_active = 1"); //obtener todos los torneos activos  

        res.send({ sports: sports, tournaments });

        } catch (error) {
            res.status(500).json({ error: "Ha ocurrido un error insesperado, intentelo de nuevo" });
            // console.error(error.message);
        }
    }

    static async createTournament (req,res) { 
        try {
            const result = validateTournamentData(req.body);

            // if(!result.success) return res.status(400).json({ error: "Los datos del torneo no son válidos" });
            if(!result.success) return res.status(400).json({ error: result.error.issues[0].message });
            // console.log("sport id", result.data.sport);

            const [insertTorunament] = await connection.query( "INSERT INTO tournaments (sport_id, tournament_name, total_teams, tournament_organizer, location, start_date, end_date, tournament_prize, inscription_price_per_team, tournament_requirements, tournament_type, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)",
                [result.data.sport, result.data.tournamentName, result.data.totalTeams, result.data.organizer, result.data.location, result.data.startDate, result.data.endDate, result.data.prize, result.data.inscriptionPrice, result.data.requirements, result.data.tournamentType, req.user_id]
            );

            if(insertTorunament.affectedRows === 0) return res.status(500).send({ error: 'No se ha podido crear el torneo, intentelo de nuevo' });

            res.send({ message: 'Torneo creado correctamente' });

        }catch (error) {
        res.status(500).send({ error: "Ha ocurrido un error insesperado, intentelo de nuevo" });
        console.error(error.message);
        }
    }

    static async tournamentData( req,res) {
        try {

            const tournamentId = 26;

            const [games] = await connection.query( "SELECT * FROM games WHERE tournament_id = ? AND is_active = 1", 
            [tournamentId])

            if(games.length === 0) return res.send({message: "No hay partidos definidos"});

            const [tournamentData] = await connection.query("SELECT * FROM tournament_teams_view WHERE tournament_id = ?", 
                [tournamentId])

            if(tournamentData.length === 0) return res.send({message: "No hay equipos disponibles"})

             res.send({games, tournamentData })   
            
        } catch (error) {
            res.status(500).send({error : "Error obteniendo los datos"})
            console.log("Error al obtener los datos", error.message);
        }
    }
    


}


//FUNCTIONS

async function generateAccessToken(id) {
    
    if(!id) return {error: "Ha ocurrido un error insesperado, intentelo de nuevo" };

    try {
 // Generar un token JWT con la información del usuario
       const accessToken = jwt.sign({ user_id: id}, process.env.SECRET_JWT_KEY, { expiresIn: '15m' });
       const refreshToken = jwt.sign({ user_id: id}, process.env.SECRET_JWT_KEY, { expiresIn: '7d' });

    //    console.log("Token", token);
        const refreshTokenEncrypted = await bcrypt.hash(refreshToken, 10);

        const [insertRefreshToken] = await connection.query( "INSERT INTO refresh_tokens (user_id, refresh_token, expiry_date) VALUES (?, ?, ?)",
            [id, refreshTokenEncrypted,new Date(Date.now() + 7*24*60*60*1000)]
        );

         return { accessToken, refreshToken };

        } catch (error) {
            return {error: "Ha ocurrido un error insesperado, intentelo de nuevo" };
         }


}


