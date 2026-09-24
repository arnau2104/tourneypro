import { connection } from '../db_connection.js';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { validateUserData, validatePartialUserData, validateTournamentData, validatePartialTournamentData,validateTeamData,validateUpdateTeamData } from '../schemas.js';
export class Querys {

    static async getDashboardData(req, res) {
        try {
            const [games] = await connection.query("SELECT COUNT(*) AS games FROM games WHERE is_active = 1 AND game_status = 'próximamente'");
            const [teams] = await connection.query("SELECT COUNT(*) AS teams FROM teams");
            const [tournaments] = await connection.query("SELECT COUNT(*) AS tournaments FROM tournaments");

            res.send({ games: games[0].games, teams: teams[0].teams, tournaments: tournaments[0].tournaments });
        } catch (error) {
            console.error("Error en getDashboardData", error.message);
            res.status(500).json({ error: "Ha ocurrido un error inesperado" });
        }
    }

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

    //    console.log(result);
   
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

       // Limpiar refresh tokens caducados de este usuario antes de generar uno nuevo
       await connection.query("DELETE FROM refresh_tokens WHERE user_id = ? AND expiry_date <= NOW()",
           [result[0].user_id]);

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
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            secure: process.env.NODE_ENV === 'production', // false en desarrollo
            maxAge: 15 * 60 * 1000, //15 minutos
        })
        .cookie('refresh_token', tokens.refreshToken, {
            httpOnly: true, // El token no es accesible desde JavaScript del lado del cliente, solo accesible desde el backend
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
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

            const result = validateUserData(req.body);

            // console.log(result);

            if(!result.success) return res.status(400).json({ error: result.error.issues[0].message });

            
            const [thisusersExists] = await connection.query("SELECT * FROM users WHERE email = ?", //comprovamos si el usuario ya existe
                [result.data.email]);

            if(thisusersExists.length > 0) { // si el usuario ya existe, no se puede registrar
                return res.status(400).json({ error: 'No se ha podido completar el registro. Si ya tienes una cuenta, inicia sesión o recupera tu contraseña' });
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
                      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                    secure: process.env.NODE_ENV === 'production', // false en desarrollo
                      maxAge: 15 * 60 * 1000, //15 minutos

                    })
                    .cookie('refresh_token', tokens.refreshToken, {
                       httpOnly: true, // El token no es accesible desde JavaScript del lado del cliente, solo accesible desde el backend
                       sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
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
            //   console.log("Comparando con:", token.refresh_token_id);
            // console.log("Match:", match);
    
            if(match)  {
                // console.log("TOKEN ENCONTRADO");
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


        // console.log("Filas de tokens afectadas",deletOldTOken.affectedRows);
            
        
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
        
        const [registeredTournamentTeams] = await connection.query("SELECT COUNT(team_id) AS registered_teams, total_teams,tournament_id FROM tournament_teams_view GROUP BY tournament_id"); //obtener todos los equipos inscritos en los torneos

        const [tournamentsWithGames] = await connection.query("SELECT DISTINCT tournament_id FROM games WHERE is_active = 1"); //torneos que ya tienen encuentros generados

        const [userRegisteredTournaments] = await connection.query("SELECT DISTINCT tt.tournament_id FROM tournament_teams tt JOIN team_players tp ON tp.team_id = tt.team_id WHERE tp.user_id = ?",
            [req.user_id]
        ); //torneos en los que el usuario tiene algun equipo inscrito

        res.send({ sports: sports, tournaments, registeredTournamentTeams, tournamentsWithGames, userRegisteredTournaments });

        } catch (error) {
            res.status(500).json({ error: "Ha ocurrido un error insesperado, intentelo de nuevo" });
            // console.error(error.message);
        }
    }

    static async createTournament (req,res) { 
        try {
            const {tournamentId, ...tournamentData} = req.body; // Desestructurar para separar tournamentId del resto de los datos
            const result = validatePartialTournamentData(tournamentData);
            // console.log("Rounds Names", result.data.roundsNames);
            console.log("result",result)

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

            if(!result.success) return res.status(400).json({ error: result.error.issues[0].message });

            
            console.log("tournament Id:", result.data.tournamentId);
            console.log("tournament status:", result.data.tournamentStatus);
            console.log("active:", result.data.isActive);

            const [tournamentOwner] = await connection.query("SELECT created_by FROM tournaments WHERE tournament_id = ?", 
                [result.data.tournamentId]);

            if (tournamentOwner.length === 0)  return res.status(404).send({ error: 'No se ha encontrado el torneo' });

            if(tournamentOwner[0].created_by !== req.user_id) return res.status(403).send({ error: 'No tienes permisos para editar este torneo' });
            

            const [updateTournament] = await connection.query("UPDATE tournaments SET sport_id=?, tournament_name=?, rounds_names=? ,total_teams=?, tournament_organizer=?, location=?, start_date=?, end_date=?, tournament_prize=?, inscription_price_per_team=?, tournament_requirements=?, tournament_type=?, tournament_status=?, is_active=? WHERE tournament_id = ?",
                [result.data.sport, result.data.tournamentName,JSON.stringify(result.data.roundsNames), result.data.totalTeams,result.data.organizer,result.data.location, result.data.startDate, result.data.endDate,result.data.prize, result.data.inscriptionPrice, result.data.requirements, result.data.tournamentType, result.data.tournamentStatus, result.data.isActive, result.data.tournamentId]
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


            const [teamOwner] = await connection.query("SELECT founder_id FROM teams WHERE team_id = ?",
                [teamId]);

            if(teamOwner.length === 0 || teamOwner[0].founder_id !== Number(req.user_id)) return res.status(403).send({ error: "No tienes permisos para inscribir este equipo" });


            const [registeredTeam] = await connection.query("SELECT * FROM tournament_teams WHERE tournament_id = ? AND team_id = ?", 
                [tournamentId, teamId]);

            if(registeredTeam.length !== 0) return res.status(400).send({ error: "El equipo ya se encuentra inscrito en el torneo" });

            const [registeredTeams] = await connection.query("SELECT COUNT(*) AS registered_teams FROM tournament_teams WHERE tournament_id = ?", 
                [tournamentId]);
            const [totalTeams] = await connection.query("SELECT total_teams AS total FROM tournaments WHERE tournament_id = ?",
                [tournamentId]);

            if (totalTeams.length === 0) return res.status(404).send({ error: "El torneo no existe" });

            if(registeredTeams[0].registered_teams >= totalTeams[0].total) return res.status(400).send({ error: "El torneo ya ha alcanzado el número máximo de equipos" });

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

           
            const { tournamentId } = req.body;

            console.log("tournament id", tournamentId)

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

            const [canEditGame] = await connection.query( "SELECT created_by FROM tournaments WHERE tournament_id = ? AND created_by = ?",
            [tournamentId, req.user_id]);

            if(canEditGame.length === 0) return res.status(403).send({ error: 'No tienes permisos para editar este partido' });

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
                    const [insertNextGame] = await connection.query( "INSERT INTO games (sport_id,tournament_id, round_index, game_order, local_team_id, guest_team_id,game_field,location) VALUES (?,?, ?, ?, ?, ?, ? ,? )", 
                    [sport_id,tournamentId, nextMatch.roundIndex, nextMatch.order, nextGameLocalTeamId,nextGameGuestTeamId, 'Pendiente de definir', 'Pendiente de definir']);

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

    static async generateMatches(req,res) {
        try {
            const { tournamentId, gameField, gameStartHour, gameLocation } = req.body;

            if (!tournamentId) return res.status(400).send({ error: 'El torneo no es válido' });

            if (!gameField) return res.status(400).send({ error: 'El estadio no es válido' });

            if (!gameStartHour) return res.status(400).send({ error: 'La hora no es válida' });

            const [tournamentRows] = await connection.query("SELECT created_by, total_teams, sport_id, tournament_type FROM tournaments WHERE tournament_id = ?",
                [tournamentId]
            );

            if (tournamentRows.length === 0) {
                return res.status(404).send({ error: 'No se ha encontrado el torneo' });
            }

            const tournament = tournamentRows[0];

            if (tournament.created_by !== req.user_id) {
                return res.status(403).send({ error: 'No tienes permisos para generar los encuentros de este torneo' });
            }

            if (tournament.tournament_type !== 'playoffs') {
                return res.status(400).send({ error: 'Solo se pueden generar encuentros automáticamente para torneos de tipo playoffs' });
            }

            const [existingGames] = await connection.query(
                "SELECT game_id FROM games WHERE tournament_id = ?",
                [tournamentId]
            );

            if (existingGames.length > 0) {
                return res.status(400).send({ error: 'Los encuentros de este torneo ya han sido generados' });
            }

            const [registeredTeams] = await connection.query(
                "SELECT team_id FROM tournament_teams WHERE tournament_id = ?",
                [tournamentId]
            );

            if (registeredTeams.length < 2) {
                return res.status(400).send({ error: 'El torneo necesita al menos 2 equipos inscritos para generar los encuentros' });
            }

            if (registeredTeams.length < tournament.total_teams) {
                return res.status(400).send({ error: 'El torneo todavía no tiene todos los equipos inscritos' });
            }

            // Emparejamiento aleatorio
            const teamIds = shuffleTeams(registeredTeams.map(team => team.team_id));

            const bracketSize = Math.pow(2, Math.ceil(Math.log2(teamIds.length)));
            const byes = bracketSize - teamIds.length;
            const numMatches = bracketSize / 2;

            const byeTeams = teamIds.slice(0, byes);
            const remainingTeams = teamIds.slice(byes);

            const round0Matches = [];

            for (let order = 0; order < numMatches; order++) {
                if (order < byes) {
                    round0Matches.push({ order, localTeamId: byeTeams[order], guestTeamId: null, isBye: true });
                } else {
                    const localTeamId = remainingTeams.shift();
                    const guestTeamId = remainingTeams.shift();
                    round0Matches.push({ order, localTeamId, guestTeamId, isBye: false });
                }
            }

            for (const match of round0Matches) {
                await connection.query(
                    "INSERT INTO games (sport_id, tournament_id, round_index, game_order, local_team_id, guest_team_id, game_status, game_field, game_start_hour, location) VALUES (?, ?, 0, ?, ?, ?, ?, ?, ?, ?)",
                    [tournament.sport_id, tournamentId, match.order, match.localTeamId, match.guestTeamId, match.isBye ? 'próximamente' : 'próximamente', gameField, gameStartHour, gameLocation]
                );

                // Si el partido es un bye, el equipo pasa directamente a la siguiente ronda
                if (match.isBye) {
                    const nextRoundOrder = Math.floor(match.order / 2);
                    const isLocalSide = match.order % 2 === 0;

                    const [nextGameRows] = await connection.query(
                        "SELECT game_id FROM games WHERE tournament_id = ? AND round_index = 1 AND game_order = ?",
                        [tournamentId, nextRoundOrder]
                    );

                    if (nextGameRows.length === 0) {
                        await connection.query(
                            "INSERT INTO games (sport_id, tournament_id, round_index, game_order, local_team_id, guest_team_id, game_field, game_start_hour, location) VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?)",
                            [tournament.sport_id, tournamentId, nextRoundOrder, isLocalSide ? match.localTeamId : null, isLocalSide ? null : match.localTeamId, gameField, gameStartHour, gameLocation]
                        );
                    } else {
                        await connection.query(
                            `UPDATE games SET ${isLocalSide ? 'local_team_id' : 'guest_team_id'} = ? WHERE game_id = ?`,
                            [match.localTeamId, nextGameRows[0].game_id]
                        );
                    }
                }
            }

            res.send({ message: 'Encuentros generados correctamente' });

        } catch (error) {
            res.status(500).send({ error: 'Ha ocurrido un error insesperado, intentelo de nuevo' });
            console.error(error.message);
        }
    }

    static async updateTeam(req,res) {
        try {

            const result = validateUpdateTeamData(req.body);

            if(!result.success) return res.status(400).json({ error: result.error.issues[0].message });

            const { team_id, team_name, team_description, max_players, team_shield } = result.data;
 

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



    static async createTeam(req,res) {
        try {
            const result = validateTeamData(req.body);

            if(!result.success) return res.status(400).json({ error: result.error.issues[0].message });

            const { team_name, team_description, max_players, team_shield } = result.data;

            const [insertTeam] = await connection.query(
                "INSERT INTO teams (team_name, team_description, max_players, team_shield, founder_id) VALUES (?, ?, ?, ?, ?)",
                [team_name, team_description || '', max_players, team_shield || '', req.user_id]
            );

            if (insertTeam.affectedRows === 0) {
                return res.status(500).send({ error: 'No se ha podido crear el equipo, intentelo de nuevo' });
            }

            const [insertFounderAsPlayer] = await connection.query(
                "INSERT INTO team_players (team_id, user_id) VALUES (?, ?)",
                [insertTeam.insertId, req.user_id]
            );

            const [newTeam] = await connection.query(
                "SELECT * FROM teams_view WHERE team_id = ?",
                [insertTeam.insertId]
            );

            res.send({ message: 'Equipo creado correctamente', team: newTeam[0] || null });
        } catch (error) {
            res.status(500).send({ error: 'Ha ocurrido un error insesperado, intentelo de nuevo' });
            console.error(error.message);
        }
    }

    static async joinTeam(req,res) {
        try {
            const { teamId } = req.body;
            const userId = req.user_id;

            if (!teamId) return res.status(400).send({ error: 'El equipo no es válido' });

            const [team] = await connection.query("SELECT * FROM teams WHERE team_id = ?", [teamId]);

            if (team.length === 0) return res.status(404).send({ error: 'No se ha encontrado el equipo' });

            const [alreadyInTeam] = await connection.query(
                "SELECT * FROM team_players WHERE team_id = ? AND user_id = ?",
                [teamId, userId]
            );

            if (alreadyInTeam.length > 0) return res.status(400).send({ error: 'Ya formas parte de este equipo' });

            const [teamPlayersCount] = await connection.query(
                "SELECT COUNT(*) AS total FROM team_players WHERE team_id = ?",
                [teamId]
            );

            const maxPlayers = team[0].max_players;

            if (maxPlayers != null && teamPlayersCount[0].total >= maxPlayers) {
                return res.status(400).send({ error: 'El equipo ya tiene el máximo de jugadores' });
            }

            const [insertPlayer] = await connection.query(
                "INSERT INTO team_players (team_id, user_id) VALUES (?, ?)",
                [teamId, userId]
            );

            if (insertPlayer.affectedRows === 0) {
                return res.status(500).send({ error: 'No se ha podido unir al equipo, intentelo de nuevo' });
            }

            res.send({ message: 'Te has unido al equipo correctamente' });
        } catch (error) {
            res.status(500).send({ error: 'Ha ocurrido un error insesperado, intentelo de nuevo' });
            console.error(error.message);
        }
    }

    static async getMyInscriptions(req,res) {
        try {
            const userId = req.user_id;

            const [userTeams] = await connection.query("SELECT * FROM team_players WHERE user_id = ?",
                [userId]);

            if(userTeams.length === 0) return res.send({ message: "No estas inscrito en ningun equipo" });

            const placeholder = userTeams.map(() => '?').join(', ');
            const userTeamsFormated = userTeams.map(team => team.team_id);

            const [registrations] = await connection.query( `SELECT * FROM tournament_teams_view WHERE team_id IN (${placeholder})`,
                [...userTeamsFormated]);

            if(registrations.length === 0) return res.send({ message: "No hay inscripciones disponibles" });

            res.send({ registrations });

        }catch(error) {
            console.log("error", error.message);
            res.status(500).send({ error: "Ha ocurrido un error insesperado, intentelo de nuevo" });
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

    static async getAllGames(req,res) {
        try {
            const [games] = await connection.query("SELECT * FROM games WHERE is_active = 1");

            if(games.length === 0) return res.send({ message: "No hay partidos disponibles" });

            // devuelve todos los id de los equipos, eliminando los dupplicados
            const teamsId = games.map(game => game.local_team_id).concat(games.map(game => game.guest_team_id)).filter((teamId,index,arr) => arr.indexOf(teamId) === index);
            const teamsPlaceholder = teamsId.map(()=> '?').join(', ');

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

function shuffleTeams(teamIds) {
    const shuffled = [...teamIds];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

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


