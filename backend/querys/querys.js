import { connection } from '../db_connection.js';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { validateUserData, validatePartialUserData, validateTournamentData, validatePartialTournamentData } from '../schemas.js';
export class Querys {

    static async me(req, res) {
        const token = req.cookies.access_token;
        if (!token) return res.status(500).send({ message: "No session" });
        // console.log("req user", req.user_id);

        try {
            const decoded = jwt.verify(token, process.env.SECRET_JWT_KEY);
            const [user] = await connection.query("SELECT user_id,name,lastname, email, birthdate FROM users WHERE user_id = ?", [req.user_id]);

            // console.log("user", user);

            if (user.length === 0) return res.status(401).send({ message: "Invalid token" });

            const userResponse = {
        user_id: user[0].user_id,
        name: user[0].name,
        lastname: user[0].lastname,
        email: user[0].email,
        birthdate: user[0].birthdate
        };

            res.send({ user: userResponse });
        } catch(error) {
            console.log("Error en me", error.message);
            res.status(401).json({ message: "Invalid token" });
        }
    }

    static async login(req, res) {  
    
    try {
       const {email, password} = req.body;
       
       // Buscar usuario solo por email
       const [result] = await connection.query( "SELECT * FROM users WHERE email = ?", 
       [email]);

       console.log(result);
   
       // Si no existe el usuario
       if (result.length === 0 || !result) {
        console.log("error en el resullt", result);
           return res.status(401).json({ error: 'Contraseña o email incorrectos' });
           
       }

       // Verificar que la contraseña coincida con la encriptada
       const passwordValida = await bcrypt.compare(password, result[0].password);

       if (!passwordValida) {
           return res.status(401).json({ error: 'Contraseña o email incorrectos' });
       }

       const tokens = await generateAccessToken(result[0].user_id);

       if(tokens.error) {
        console.log(tokens.error);
        return res.status(500).json({ error: tokens.error });
       }

       const userResponse = {
        user_id: result[0].user_id,
        name: result[0].name,
        lastname: result[0].lastname,
        email: result[0].email,
        birthdate: result[0].birthdate
        };

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
       .send({ message: 'Inicio de sesión exitoso', user: userResponse });
   
     } catch (error) {
         console.error("ERROR REAL: ",error);
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

            const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
          for (const token of userTokens) {

            const match = await bcrypt.compare(tokenHash, token.refresh_token); //comparar el refresh token recibido con el refresh token encriptado de la base de datos
              console.log("Comparando con:", token.refresh_token_id);
            console.log("Match:", match);
    
            if(match)  {
                console.log("TOKEN ENCONTRADO");
                validToken = token; 
                break;
            }

        };

        if(!validToken) return res.sendStatus(403);

        const newTokens = await generateAccessToken(decoded.user_id); //la funcion ya hace insert del nuevo refresh token en la bd


        // console.log("Valid token:", validToken)
        // console.log("Valid token id:",validToken.refresh_token_id )
        
        //eliminar el refresh token antiguo de la base de datos, ya que se va a generar uno nuevo      
        const [deletOldTOken] = await connection.query("DELETE FROM refresh_tokens WHERE refresh_token_id= ?",
            [validToken.refresh_token_id]);


        console.log("Filas de tokens afectadas",deletOldTOken.affectedRows);
            
        
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
            const result = validatePartialTournamentData(req.body);
            // console.log("Rounds Names", result.data.roundsNames);

            // if(!result.success) return res.status(400).json({ error: "Los datos del torneo no son válidos" });
            if(!result.success) return res.status(400).json({ error: result.error.issues[0].message });
            // console.log("sport id", result.data.sport);

            const [insertTorunament] = await connection.query( "INSERT INTO tournaments (sport_id, tournament_name, rounds_names, total_teams, tournament_organizer, location, start_date, end_date, tournament_prize, inscription_price_per_team, tournament_requirements, tournament_type, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)",
                [result.data.sport, result.data.tournamentName,JSON.stringify(result.data.roundsNames), result.data.totalTeams, result.data.organizer, result.data.location, result.data.startDate, result.data.endDate, result.data.prize, result.data.inscriptionPrice, result.data.requirements, result.data.tournamentType, req.user_id]
            );

            if(insertTorunament.affectedRows === 0) return res.status(500).send({ error: 'No se ha podido crear el torneo, intentelo de nuevo' });

            res.send({ message: 'Torneo creado correctamente' });

        }catch (error) {
        res.status(500).send({ error: "Ha ocurrido un error insesperado, intentelo de nuevo" });
        console.error(error.message);
        }
    }

    static async updateTournament (req,res) {
        try {
            const result = validateTournamentData(req.body);

            console.log("tournament Id:", result.data.tournamentId);
            console.log("tournament status:", result.data.tournamentStatus);
            console.log("active:", result.data.isActive);

            if(!result.success) return res.status(400).json({ error: result.error.issues[0].message });

            const [updateTournament] = await connection.query("UPDATE tournaments SET sport_id=?, tournament_name=?, rounds_names=? ,total_teams=?, tournament_organizer=?, location=?, start_date=?, end_date=?, tournament_prize=?, inscription_price_per_team=?, tournament_requirements=?, tournament_type=?, created_by=?, tournament_status=?, is_active=? WHERE tournament_id = ?",
                [result.data.sport, result.data.tournamentName,JSON.stringify(result.data.roundsNames), result.data.totalTeams,result.data.organizer,result.data.location, result.data.startDate, result.data.endDate,result.data.prize, result.data.inscriptionPrice, result.data.requirements, result.data.tournamentType, req.user_id, result.data.tournamentStatus, result.data.isActive, result.data.tournamentId]
            )

            if(updateTournament.affectedRows === 0) return res.status(400).send({ error: 'No se ha podido actualizar el torneo, intentelo de nuevo' });

            return res.send({ message: 'Torneo actualizado correctamente' });

        }catch (error) {
            res.status(500).send({ error: "Ha ocurrido un error insesperado, intentelo de nuevo" });
            console.error(error.message);
        }
    }

    static async selectTournament (req,res) {
        try {
            const tournamentId = req.body.tournamentId;

            // console.log("Tournament Id", tournamentId);

            if(!tournamentId) return res.status(400).send({ error: "El id del torneo no es valido" });

            const [tournamentData] = await connection.query("SELECT * FROM tournaments WHERE tournament_id = ?", 
                [tournamentId]);

            if(tournamentData.length === 0) return res.status(404).send({ error: "No se ha encontrado el torneo" });

            const [tournamentTeams] = await connection.query("SELECT * FROM tournament_teams_view WHERE tournament_id = ?", 
                [tournamentId]);

            return res.send({ tournamentData, tournamentTeams });


        }catch (error) {
            res.status(500).send({ error: "Ha ocurrido un error insesperado, intentelo de nuevo" });
            console.error(error.message);
        }
    }

    static async tournamentInscription (req,res) {
        try {
            const { teamId, tournamentId } = req.body;
            // console.log("Team id", teamId, "Tournament id", tournamentId);

            if(!teamId || !tournamentId) return res.status(400).send({ error: "Los datos del torneo no son válidos" });

            const [registeredTeam] = await connection.query("SELECT * FROM tournament_teams WHERE tournament_id = ? AND team_id = ?", 
                [tournamentId, teamId]);

            if(registeredTeam.length !== 0) return res.status(400).send({ error: "El equipo ya se encuentra inscrito en el torneo" });

            const [insertInscription] = await connection.query("INSERT INTO tournament_teams (tournament_id, team_id ) VALUES (?, ?)", 
                [tournamentId, teamId]);

            if(insertInscription.affectedRows === 0) return res.status(500).send({ error: "No se ha podido inscribir el equipo al torneo, intentelo de nuevo" });

            res.send({ message: "Equipo inscrito correctamente!!" });

        }catch (error) {
            console.error(error.message);
            res.status(500).send({ error: "Ha ocurrido un error insesperado, intentelo de nuevo" });
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

    static async updateGameData(req,res) {
        try {

            const {tournamentId,match,localScore,guestScore,nextMatch,nextMatchExists} = req.body;
            const sport_id = 1;
            
            if(!tournamentId || !match || !nextMatch || !localScore || !guestScore) return res.status(400).json({ error: "Los datos del partido no son válidos" });

            const nextGameLocalTeamId = nextMatch.sides[0].contestantId ?  nextMatch.sides[0].contestantId : null ;
            const nextGameGuestTeamId = nextMatch.sides[1].contestantId ?  nextMatch.sides[1].contestantId : null ;


            const [updateGameResult] = await connection.query( "UPDATE games SET local_team_score = ?, guest_team_score = ?, game_status = 'finalizado' WHERE tournament_id = ? AND round_index = ? AND game_order = ?", 
            [JSON.stringify(localScore),JSON.stringify(guestScore),tournamentId,match.roundIndex,match.order]);

            if(updateGameResult.affectedRows === 0) return res.status(400).send({ error: 'No se ha podido actualizar el partido, intentelo de nuevo' });

            if(nextMatchExists) {
                const [nextGameExist] = await connection.query( "SELECT * FROM games WHERE tournament_id = ? AND round_index = ? AND game_order = ?", 
                [tournamentId, nextMatch.roundIndex, nextMatch.order]);

                let nextGameResult; // variable fuera del bloque

                if(nextGameExist.length === 0) {
                    const [insertNextGame] = await connection.query( "INSERT INTO games (sport_id,tournament_id, round_index, game_order, local_team_id, guest_team_id ) VALUES (?,?, ?, ?, ?, ? )", 
                    [sport_id,tournamentId, nextMatch.roundIndex, nextMatch.order, nextGameLocalTeamId,nextGameGuestTeamId]);

                    nextGameResult = insertNextGame;

                }else if(nextGameExist.length === 1) {
                    const [updateNextGame] = await connection.query( "UPDATE games SET local_team_id = ?, guest_team_id = ? WHERE tournament_id = ? AND round_index = ? AND game_order = ?", 
                    [nextGameLocalTeamId, nextGameGuestTeamId, tournamentId, nextMatch.roundIndex, nextMatch.order]);

                    nextGameResult = updateNextGame;
                }

                if(nextGameResult.affectedRows === 0) return res.status(500).send({error: 'No se ha podido actualizar el siguiente partido, intentelo de nuevo',data: {updateGameResult, insertNextGame}} )
            }   
            res.send({ message: 'Partido actualizado correctamente' });

        }catch(error) {
            // res.status(500).send({ error: "Ha ocurrido un error insesperado, intentelo de nuevo" });
            res.status(500).send({ error: error.message });
        }
    }

    static async updateTeam(req,res) {
        try {
            const { team_id, team_name, team_description, max_players, team_shield } = req.body;

            if (!team_id || !team_name || !max_players) {
                return res.status(400).send({ error: 'Los datos del equipo no son válidos' });
            }

            const [teamOwner] = await connection.query(
                "SELECT founder_id FROM teams WHERE team_id = ?",
                [team_id]
            );

            if (teamOwner.length === 0) {
                return res.status(404).send({ error: 'No se ha encontrado el equipo' });
            }

            if (teamOwner[0].founder_id !== req.user_id) {
                return res.status(403).send({ error: 'No tienes permisos para editar este equipo' });
            }

            const [updateTeam] = await connection.query(
                "UPDATE teams SET team_name = ?, team_description = ?, max_players = ?, team_shield = ? WHERE team_id = ?",
                [team_name, team_description || '', max_players, team_shield || '', team_id]
            );

            if (updateTeam.affectedRows === 0) {
                return res.status(400).send({ error: 'No se ha podido actualizar el equipo, intentelo de nuevo' });
            }

            const [updatedTeam] = await connection.query(
                "SELECT * FROM teams_view WHERE team_id = ?",
                [team_id]
            );

            return res.send({
                message: 'Equipo actualizado correctamente',
                team: updatedTeam[0] || null,
            });
        } catch (error) {
            res.status(500).send({ error: 'Ha ocurrido un error insesperado, intentelo de nuevo' });
            console.error(error.message);
        }
    }

    static async getTeams(req,res) {
        try {
            const userId = req.user_id;
            const [teams] = await connection.query( "SELECT * FROM teams_view WHERE founder_id = ?",
                [userId]);      
            
            res.send( teams);
        } catch (error) {
            res.status(500).send({ error: "Ha ocurrido un error insesperado, intentelo de nuevo" });
            console.error(error.message);
        }

    }

    static async getAllTeams(req,res) {
        try {
            const [allTeams] = await connection.query( "SELECT * FROM teams_view");
            
            res.send( allTeams);
        } catch (error) {
            res.status(500).send({ error: "Ha ocurrido un error insesperado, intentelo de nuevo" });
            console.error(error.message);
        }

    }
    
    static async getUserTeams(req,res) {
        try {
            const userId = req.user_id;
            const [teams] = await connection.query( "SELECT team_id,team_name,team_description, max_players,founder_id,team_shield FROM team_players_view WHERE user_id = ?",
                [userId]);

                if (teams.length === 0) {
            return res.send({ teams: [], players: [] });
        }

        // Extraer los IDs de los equipos obtenidos (usar la key `team_id` consistente con la vista)
        const teamIds = teams.map(team => team.team_id);

        // Preparar el placeholder para la consulta
        const placeholder = teamIds.map(() => '?').join(', ');
        const teamIdsFormated = teamIds;

            const [playerTeams] = await connection.query( `SELECT * FROM team_players_view WHERE team_id IN (${placeholder})`,
                [...teamIdsFormated]);
            
            res.send({ teams, players: playerTeams });
        } catch (error) {
            res.status(500).send({ error: "Ha ocurrido un error insesperado, intentelo de nuevo" });
            console.error(error.message);
        }
    }



    static async getGames(req,res) {
        try {
            const userId = req.user_id;
            if(!userId) return res.status(500).send({ error: "Ha ocurrido un error insesperado, intentelo de nuevo" });

            const [userTeams] = await connection.query( "SELECT * FROM team_players WHERE user_id = ?",
                [userId]);

            if(userTeams.length === 0) return res.send({ message: "No estas inscrito en ningun equipo" });

            const placeholder = userTeams.map(()=> '?').join(', ');
            const userTeamsFormated = userTeams.map(team => team.team_id);

            console.log(userTeams);

            const [games] = await connection.query( `SELECT * FROM games WHERE local_team_id IN (${placeholder}) OR guest_team_id IN (${placeholder})`,
                [...userTeamsFormated,...userTeamsFormated]);

            if(games.length === 0) return res.send({ message: "No hay partidos disponibles" });
             
            // devuelve todos los id de los equipos, eliminando los dupplicados
            const teamsId = games.map(game => game.local_team_id).concat(games.map(game => game.guest_team_id)).filter((teamId,index,arr) => arr.indexOf(teamId) === index); 
            const teamsPlaceholder = teamsId.map(()=> '?').join(', ');
            console.log(teamsId);

            const [teams] = await connection.query( `SELECT * FROM tournament_teams_view WHERE team_id IN (${teamsPlaceholder})`,
            [...teamsId]);

            res.send({games,teams});

        }catch(error) {
            console.log("error", error.message);
            res.status(500).send({ error: "Ha ocurrido un error insesperado, intentelo de nuevo" });
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
        // ✅ Hashea el SHA-256 del token (siempre 64 chars, dentro del límite de bcrypt)
        const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        const refreshTokenEncrypted = await bcrypt.hash(tokenHash, 10);

        const [insertRefreshToken] = await connection.query( "INSERT INTO refresh_tokens (user_id, refresh_token, expiry_date) VALUES (?, ?, ?)",
            [id, refreshTokenEncrypted,new Date(Date.now() + 7*24*60*60*1000)]
        );

         return { accessToken, refreshToken };

        } catch (error) {
            console.log("ERROR EN GENERATE ACCES TOKEN", error)
            return {error: "Ha ocurrido un error insesperado, intentelo de nuevo" };
         }


}


