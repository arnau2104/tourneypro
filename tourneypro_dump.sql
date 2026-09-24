-- MySQL dump 10.13  Distrib 8.0.44, for macos12.7 (arm64)
--
-- Host: 127.0.0.1    Database: tourneypro
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `games`
--

DROP TABLE IF EXISTS `games`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `games` (
  `game_id` int NOT NULL AUTO_INCREMENT,
  `sport_id` int NOT NULL,
  `tournament_id` int DEFAULT NULL,
  `round_index` int NOT NULL DEFAULT '0',
  `game_order` int DEFAULT NULL,
  `local_team_id` int DEFAULT NULL,
  `guest_team_id` int DEFAULT NULL,
  `game_field` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `game_start_date` date DEFAULT NULL,
  `game_start_hour` time DEFAULT NULL,
  `game_duration` int DEFAULT NULL,
  `local_team_score` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `guest_team_score` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `game_status` enum('próximamente','iniciado','finalizado','cancelado') COLLATE utf8mb4_general_ci DEFAULT 'próximamente',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`game_id`),
  UNIQUE KEY `tournament_id` (`tournament_id`,`round_index`,`game_order`),
  KEY `fk_game_sport_id` (`sport_id`),
  KEY `fk_guest_team_id` (`guest_team_id`),
  KEY `fk_local_team_id` (`local_team_id`),
  CONSTRAINT `fk_game_sport_id` FOREIGN KEY (`sport_id`) REFERENCES `sports` (`sport_id`),
  CONSTRAINT `fk_game_tournament_id` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments` (`tournament_id`),
  CONSTRAINT `fk_guest_team_id` FOREIGN KEY (`guest_team_id`) REFERENCES `teams` (`team_id`),
  CONSTRAINT `fk_local_team_id` FOREIGN KEY (`local_team_id`) REFERENCES `teams` (`team_id`),
  CONSTRAINT `games_chk_1` CHECK (json_valid(`guest_team_score`))
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `games`
--

LOCK TABLES `games` WRITE;
/*!40000 ALTER TABLE `games` DISABLE KEYS */;
INSERT INTO `games` VALUES (1,1,26,0,0,2,1,'Campo A','Estadio Central','2026-03-01','15:00:00',90,'[{\"mainScore\":\"4\",\"isWinner\":true},{\"mainScore\":\"5\",\"isWinner\":true}]','[{\"mainScore\":\"1\"},{\"mainScore\":\"1\"}]','finalizado',1),(2,1,26,0,1,4,3,'Campo B','Estadio Central','2026-03-01','17:00:00',90,'[{\"mainScore\":\"4\",\"isWinner\":true}]','[{\"mainScore\":\"2\"}]','finalizado',1),(3,1,26,0,2,6,5,'Campo C','Estadio Central','2026-03-02','15:00:00',90,'[{\"mainScore\":\"1\"}]','[{\"mainScore\":\"1\"}]','finalizado',1),(4,1,26,0,3,8,7,'Campo D','Estadio Central','2026-03-02','17:00:00',90,'[{\"mainScore\":\"2\"}]','[{\"mainScore\":\"3\",\"isWinner\":true}]','finalizado',1),(5,1,26,0,4,10,9,'Campo A','Estadio Central','2026-03-03','15:00:00',90,'[{\"mainScore\":\"4\",\"isWinner\":true}]','[{\"mainScore\":\"1\"}]','finalizado',1),(6,1,26,0,5,12,11,'Campo B','Estadio Central','2026-03-03','17:00:00',90,'[{\"mainScore\":\"0\"},{\"mainScore\":\"4\",\"isWinner\":true}]','[{\"mainScore\":\"3\",\"isWinner\":true},{\"mainScore\":\"0\"}]','finalizado',1),(7,1,26,0,6,14,13,'Campo C','Estadio Central','2026-03-04','15:00:00',90,'[{\"mainScore\":\"1\",\"isWinner\":true}]','[{\"mainScore\":\"0\"}]','finalizado',1),(8,1,26,0,7,16,15,'Campo D','Estadio Central','2026-03-04','17:00:00',90,'[{\"mainScore\":\"1\",\"isWinner\":true}]','[{\"mainScore\":\"0\"}]','finalizado',1),(11,1,26,1,0,2,4,'','',NULL,NULL,NULL,'[{\"mainScore\":\"2\",\"isWinner\":true}]','[{\"mainScore\":\"1\"}]','finalizado',1),(12,1,26,1,1,6,7,'','',NULL,NULL,NULL,'[{\"mainScore\":\"2\"}]','[{\"mainScore\":\"3\",\"isWinner\":true}]','finalizado',1),(13,1,26,1,2,10,12,'','',NULL,NULL,NULL,'[{\"mainScore\":\"4\",\"isWinner\":true}]','[{\"mainScore\":\"2\"}]','finalizado',1),(14,1,26,1,3,14,16,'','',NULL,NULL,NULL,'[{\"mainScore\":\"2\",\"isWinner\":true}]','[{\"mainScore\":\"1\"}]','finalizado',1),(15,1,26,2,1,10,14,'','',NULL,NULL,NULL,'[{\"mainScore\":\"1\"}]','[{\"mainScore\":\"2\",\"isWinner\":true}]','finalizado',1),(16,1,26,2,0,2,7,'','',NULL,NULL,NULL,'[{\"mainScore\":\"1\",\"isWinner\":true}]','[{\"mainScore\":\"0\"}]','finalizado',1),(17,1,26,3,0,2,10,'','',NULL,NULL,NULL,'[{\"mainScore\":\"4\",\"isWinner\":true}]','[{\"mainScore\":\"2\"}]','finalizado',1),(19,1,26,4,0,10,NULL,'','',NULL,NULL,NULL,NULL,NULL,'próximamente',1),(20,1,34,0,0,7,13,'Campo A','Valencia','2026-04-10','16:00:00',90,'[{\"mainScore\":\"5\",\"isWinner\":true}]','[{\"mainScore\":\"4\"}]','finalizado',1),(21,1,34,0,1,12,15,'Campo B','Valencia','2026-04-10','18:00:00',90,'[{\"mainScore\":\"2\",\"isWinner\":true}]','[{\"mainScore\":\"1\"}]','finalizado',1),(22,1,34,0,2,2,9,'Campo C','Valencia','2026-04-10','20:00:00',90,'[{\"mainScore\":\"4\",\"isWinner\":true}]','[{\"mainScore\":\"2\"}]','finalizado',1),(23,1,34,0,3,19,29,'Campo D','Valencia','2026-04-10','16:00:00',90,'[{\"mainScore\":\"4\",\"isWinner\":true}]','[{\"mainScore\":\"3\"}]','finalizado',1),(24,1,34,1,0,7,12,'Campo A','Valencia','2026-04-17','16:00:00',90,'[{\"mainScore\":\"0\"}]','[{\"mainScore\":\"5\",\"isWinner\":true}]','finalizado',1),(25,1,34,1,1,2,19,'Campo B','Valencia','2026-04-17','18:00:00',90,'[{\"mainScore\":\"5\",\"isWinner\":true}]','[{\"mainScore\":\"4\"}]','finalizado',1),(26,1,34,2,0,12,2,'Campo A','Valencia','2026-04-24','16:00:00',90,'[{\"mainScore\":\"2\"}]','[{\"mainScore\":\"3\",\"isWinner\":true}]','finalizado',1),(27,1,35,0,0,3,19,'Campo A','Alicante','2026-05-02','16:00:00',90,'[{\"mainScore\":\"3\",\"isWinner\":true}]','[{\"mainScore\":\"0\"}]','finalizado',1),(28,1,35,0,1,18,15,'Campo B','Alicante','2026-05-02','18:00:00',90,'[{\"mainScore\":\"5\",\"isWinner\":true}]','[{\"mainScore\":\"3\"}]','finalizado',1),(29,1,35,0,2,14,11,'Campo C','Alicante','2026-05-02','20:00:00',90,'[{\"mainScore\":\"1\"}]','[{\"mainScore\":\"4\",\"isWinner\":true}]','finalizado',1),(30,1,35,0,3,10,17,'Campo D','Alicante','2026-05-02','16:00:00',90,'[{\"mainScore\":\"5\",\"isWinner\":true}]','[{\"mainScore\":\"0\"}]','finalizado',1),(31,1,35,1,0,3,18,'Campo A','Alicante','2026-05-09','16:00:00',90,NULL,NULL,'próximamente',1),(32,1,35,1,1,11,10,'Campo B','Alicante','2026-05-09','18:00:00',90,NULL,NULL,'próximamente',1),(33,1,35,2,0,3,11,'Campo A','Alicante','2026-05-16','16:00:00',90,NULL,NULL,'próximamente',1),(34,1,36,0,0,14,24,'Campo A','Sevilla','2026-03-15','16:00:00',90,'[{\"mainScore\":\"0\"}]','[{\"mainScore\":\"4\",\"isWinner\":true}]','finalizado',1),(35,1,36,0,1,1,30,'Campo B','Sevilla','2026-03-15','18:00:00',90,'[{\"mainScore\":\"5\",\"isWinner\":true}]','[{\"mainScore\":\"4\"}]','finalizado',1),(36,1,36,0,2,18,10,'Campo C','Sevilla','2026-03-15','20:00:00',90,'[{\"mainScore\":\"1\"}]','[{\"mainScore\":\"5\",\"isWinner\":true}]','finalizado',1),(37,1,36,0,3,13,8,'Campo D','Sevilla','2026-03-15','16:00:00',90,'[{\"mainScore\":\"3\"}]','[{\"mainScore\":\"5\",\"isWinner\":true}]','finalizado',1),(38,1,36,1,0,24,1,'Campo A','Sevilla','2026-03-22','16:00:00',90,NULL,NULL,'próximamente',1),(39,1,36,1,1,10,8,'Campo B','Sevilla','2026-03-22','18:00:00',90,NULL,NULL,'próximamente',1),(40,1,36,2,0,24,10,'Campo A','Sevilla','2026-03-29','16:00:00',90,NULL,NULL,'próximamente',1),(41,1,37,0,0,8,27,'Campo A','Zaragoza','2026-06-01','16:00:00',90,NULL,NULL,'próximamente',1),(42,1,37,0,1,23,13,'Campo B','Zaragoza','2026-06-01','18:00:00',90,NULL,NULL,'próximamente',1),(43,1,37,0,2,26,30,'Campo C','Zaragoza','2026-06-01','20:00:00',90,NULL,NULL,'próximamente',1),(44,1,37,0,3,12,20,'Campo D','Zaragoza','2026-06-01','16:00:00',90,NULL,NULL,'próximamente',1),(45,1,37,1,0,8,23,'Campo A','Zaragoza','2026-06-08','16:00:00',90,NULL,NULL,'próximamente',1),(46,1,37,1,1,26,12,'Campo B','Zaragoza','2026-06-08','18:00:00',90,NULL,NULL,'próximamente',1),(47,1,37,2,0,8,26,'Campo A','Zaragoza','2026-06-15','16:00:00',90,NULL,NULL,'próximamente',1),(58,1,27,0,0,5,3,'San Mames','Bilbao',NULL,'11:00:00',NULL,'[{\"mainScore\":\"3\",\"isWinner\":true},{\"mainScore\":\"4\",\"isWinner\":true}]','[{\"mainScore\":\"2\"},{\"mainScore\":\"1\"}]','finalizado',1),(59,1,27,0,1,24,6,'San Mames','Bilbao',NULL,'11:00:00',NULL,'[{\"mainScore\":\"1\"}]','[{\"mainScore\":\"5\",\"isWinner\":true}]','finalizado',1),(60,1,27,0,2,10,8,'San Mames','Bilbao',NULL,'11:00:00',NULL,NULL,NULL,'próximamente',1),(61,1,27,0,3,27,13,'San Mames','Bilbao',NULL,'11:00:00',NULL,NULL,NULL,'próximamente',1),(62,1,27,0,4,17,4,'San Mames','Bilbao',NULL,'11:00:00',NULL,NULL,NULL,'próximamente',1),(63,1,27,0,5,1,18,'San Mames','Bilbao',NULL,'11:00:00',NULL,NULL,NULL,'próximamente',1),(64,1,27,0,6,19,2,'San Mames','Bilbao',NULL,'11:00:00',NULL,NULL,NULL,'próximamente',1),(65,1,27,0,7,16,12,'San Mames','Bilbao',NULL,'11:00:00',NULL,NULL,NULL,'próximamente',1),(66,1,27,1,0,5,6,'Pendiente de definir','Pendiente de definir',NULL,NULL,NULL,NULL,NULL,'próximamente',1),(67,1,38,0,0,2,6,'Son marçall','Ciutadella',NULL,'10:00:00',NULL,'[{\"mainScore\":\"3\",\"isWinner\":true}]','[{\"mainScore\":\"1\"}]','finalizado',1),(68,1,38,0,1,5,4,'Son marçall','Ciutadella',NULL,'10:00:00',NULL,'[{\"mainScore\":\"1\"}]','[{\"mainScore\":\"1\"}]','finalizado',1),(69,1,38,0,2,1,3,'Son marçall','Ciutadella',NULL,'10:00:00',NULL,'[{\"mainScore\":\"2\",\"isWinner\":true}]','[{\"mainScore\":\"1\"}]','finalizado',1),(70,1,38,0,3,8,7,'Son marçall','Ciutadella',NULL,'10:00:00',NULL,'[{\"mainScore\":\"1\"}]','[{\"mainScore\":\"3\",\"isWinner\":true}]','finalizado',1),(71,1,38,1,0,2,5,'Pendiente de definir','Pendiente de definir',NULL,NULL,NULL,'[{\"mainScore\":\"1\"}]','[{\"mainScore\":\"3\",\"isWinner\":true}]','finalizado',1),(72,1,38,1,1,1,7,'Pendiente de definir','Pendiente de definir',NULL,NULL,NULL,'[{\"mainScore\":\"4\",\"isWinner\":true}]','[{\"mainScore\":\"2\"}]','finalizado',1),(73,1,38,2,0,5,1,'Pendiente de definir','Pendiente de definir',NULL,NULL,NULL,'[{\"mainScore\":\"0\"}]','[{\"mainScore\":\"7\",\"isWinner\":true}]','finalizado',1);
/*!40000 ALTER TABLE `games` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `refresh_token_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `refresh_token` text COLLATE utf8mb4_general_ci NOT NULL,
  `expiry_date` date NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`refresh_token_id`),
  KEY `fk_user_id` (`user_id`),
  CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=498 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
INSERT INTO `refresh_tokens` VALUES (418,6,'$2b$10$MqTME/ChSV.vdGvl4fM9LO5ldRlFD2wMyNU4SwROhZxGDGSFsDzDq','2026-09-25','2026-09-18 16:07:26'),(424,6,'$2b$10$OzldHWUfkBfSujxzLHbGaOzdsr.6LhPbN8eYVqxHivVWuJzjDKnZ2','2026-09-26','2026-09-19 14:31:20'),(425,6,'$2b$10$/o2nwbnTMTElfOeJ2Z2yweIPYSxgwamR71dM0tTXAA5R6iK1ZX4GO','2026-09-26','2026-09-19 14:31:20'),(432,6,'$2b$10$ggJY3SiNDve7zMUvg9AmW.3djyoPfLqQRUZ5pXFxs/vvhqRN93Xg2','2026-09-28','2026-09-21 17:28:04'),(434,6,'$2b$10$RZo.PgomI3giMlNbaoOxP.JY.INRZ/EX8CJ5XewHMrxjn69woDzia','2026-09-28','2026-09-21 17:46:01'),(438,6,'$2b$10$gNeqR2qatv6PzXyM7AbLI.9p2r5.cKbLJX.wLUzZob0qbZvqBNVOC','2026-09-28','2026-09-21 20:29:16'),(441,6,'$2b$10$izAtFMrdYOEqfsrFLfkyje6kO2q.Hu4SNA2fH7Apc0aegjM7hf4ou','2026-09-29','2026-09-22 10:40:21'),(444,6,'$2b$10$tloET0pk3yt7d4iyES3m5O7dBbZryFU/szec9eIpsRQr1pqXR61FG','2026-09-29','2026-09-22 16:17:40'),(446,6,'$2b$10$cn0yqZrVWdLLuW3A/4e44uXZ2wIKekGFEtA1mUKXrh9cwG2cxt/NK','2026-09-29','2026-09-22 16:35:52'),(448,6,'$2b$10$v/0WrNL73oCozDZmBRmore26NkS2TAHD6iZCqvbvZVwZYXcMTbwFS','2026-09-29','2026-09-22 16:51:23'),(452,6,'$2b$10$63RT1UbYU3nKh3iADg8pEeEVbbDZUY07lJ8Fxcs/U7cDh86/dXYK.','2026-09-29','2026-09-22 18:40:26'),(453,6,'$2b$10$HzIiFrVHa28Zv3wigo4YOe12p/fVNv56Sd/4VeS6HPA4lzwBooq66','2026-09-29','2026-09-22 18:40:26'),(455,6,'$2b$10$wXTkeJDCCp62wenGbO0WS.ieF/QNTW7VOUJC/WPdpte17NGOMA3oC','2026-09-29','2026-09-22 18:40:26'),(456,6,'$2b$10$5hwrE3StAmxgOGSaua/JxOJ53sLqK5uUXms7kqfE4JYWd3MIRKOca','2026-09-29','2026-09-22 18:40:26'),(457,6,'$2b$10$ixyTr4sm8KZaTHBWvbXCmulMTTFlCzIAWAW8FkJF8cuRgJbgCFnA2','2026-09-29','2026-09-22 18:40:26'),(458,6,'$2b$10$yBVZ81RRLDDV2sqsdukfIu82UJzjxCQyGhkhOzAfXX.Un6YizB2pK','2026-09-29','2026-09-22 18:56:50'),(459,6,'$2b$10$8KSg9xgMV3tkioLOGNeA4.DYlLRNtaQCPjc7x2JVEwX0wGzNz0.2W','2026-09-29','2026-09-22 18:56:50'),(460,6,'$2b$10$UqSualaEFlLBEZypmY3knOoL8iY/jDxgXnkf31JTLX9ruGCjkzSvO','2026-09-29','2026-09-22 18:56:50'),(461,6,'$2b$10$tQc1NW53SIT1r5wYodPXw.v9vswLJzRbhw1PZ66DGnXXm65fIisRK','2026-09-29','2026-09-22 18:56:50'),(462,6,'$2b$10$5ShkLk49Z.BzYaAiKIhKTeH4p7VuLxDoZQEXQISqGcewYna00N4Pm','2026-09-29','2026-09-22 18:56:50'),(463,6,'$2b$10$8vSFbcT.IVD8ZWcJ5BbQ9erjHha43O0AXh/peyUDOQKZCpMH0Y3h.','2026-09-29','2026-09-22 18:56:50'),(465,6,'$2b$10$wPFxGhk8PwwHp1vY.kGvv.XWKxAY/Qpl.3pKl5bWZpXqP5tAJV.8C','2026-09-29','2026-09-22 18:56:51'),(467,6,'$2b$10$49st6euw7Nyqd9delL4dm.ErlXbhQLVUSYilBv1IKlZrsB1sxK31e','2026-09-30','2026-09-23 00:44:03'),(469,6,'$2b$10$8zjfubneNq1y6dEYlNtdlOqWfOTQREIl1h1URlcjRRL/T9fdpXtC6','2026-09-30','2026-09-23 12:53:36'),(473,24,'$2b$10$aRgvPgq/9m6.U7cshToqeeoQ1Vg84ptNPpT44zs5SjR0xjZksaBZe','2026-09-30','2026-09-23 14:33:29'),(475,24,'$2b$10$UIIxlHM5FrCYEN9NAi7dtOuGOcog./QDr8mV1Yr3pSnwC.479C8Su','2026-09-30','2026-09-23 14:51:03'),(477,24,'$2b$10$z2KWH/AEPopbOw3V.h2xGeIw/R9yqMBu3/QXPT5tTeRCDEW2YzuZW','2026-09-30','2026-09-23 15:06:08'),(482,25,'$2b$10$JDna/EyFrQ9OQFYsYRULSuJNwDkv4Yh/67ugsy2aNNy19fdogapFG','2026-09-30','2026-09-23 16:47:17'),(483,24,'$2b$10$G7ZWlgpzRpSHwYwBen.nqelr17XAUTHFr2tZvvE5mkephYsdlUtHa','2026-09-30','2026-09-23 16:56:10'),(484,24,'$2b$10$.Ibhq03qWCoUV93ra5k.AeW.ow9KRucOhDNWbVkPAl.NbUnIw3ZKq','2026-09-30','2026-09-23 16:56:10'),(485,24,'$2b$10$37YuYOPC/10nZPsZuiUJfeF/SsurCUvHVytvsCe84TpgI431OduFW','2026-09-30','2026-09-23 16:56:10'),(487,25,'$2b$10$GKhkcfiD2us0.2KYUbc6.eSey7Rzk.8vHcnm6xR5zEI.Qtd9/i/IW','2026-09-30','2026-09-23 17:07:18'),(488,6,'$2b$10$Hf2fwgHq1HWr9dh.B6Lkkuh8Pae8k87NEhSeyQHM01gSTUWxhTllK','2026-09-30','2026-09-23 17:14:03'),(489,6,'$2b$10$rHgKF1hsNCGiXn2A3d.eHONxMS4rFrOJIT0auocrpRw0PmWQ/xkGi','2026-09-30','2026-09-23 17:14:19'),(490,6,'$2b$10$iyGLljCf4Xnpm8g4C0pHj.OUiashQSysG6ztNasfCLMDa3D9fzyq2','2026-09-30','2026-09-23 17:14:31'),(493,25,'$2b$10$5nOOaUYmHHZSifQ/aqrhReeuqUgqHuTBkQVKGAjWDV15hwHZLmA2y','2026-09-30','2026-09-23 17:25:14'),(494,25,'$2b$10$MvAa9IP5DpqS4Lqtwa98kewO7Fxztf8pXGv32FWx.DMLikUyIJqqm','2026-09-30','2026-09-23 17:42:18'),(495,25,'$2b$10$S62an8lSUtWokDvhJQwG6emLq8mB5VgDqnbWsmvyceZOCxWKgOmqi','2026-09-30','2026-09-23 17:42:18'),(496,24,'$2b$10$LiLPFuaALZWCyiEam1czIOits.W9M.JuPXRg8cXnC2KOmLEDYkoOq','2026-09-30','2026-09-23 17:42:18'),(497,24,'$2b$10$4IsqFrlrbgWrt0Ed4cd3Je3OEp/dnbHciHa8yuGp11jwXSeu2l/8e','2026-09-30','2026-09-23 17:42:18');
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sports`
--

DROP TABLE IF EXISTS `sports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sports` (
  `sport_id` int NOT NULL AUTO_INCREMENT,
  `sport_name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `is_active` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`sport_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sports`
--

LOCK TABLES `sports` WRITE;
/*!40000 ALTER TABLE `sports` DISABLE KEYS */;
INSERT INTO `sports` VALUES (1,'fútbol',1),(2,'baloncesto',1);
/*!40000 ALTER TABLE `sports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_players`
--

DROP TABLE IF EXISTS `team_players`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_players` (
  `team_id` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`team_id`,`user_id`),
  UNIQUE KEY `team_id` (`team_id`,`user_id`),
  KEY `fk_team_users_user_id` (`user_id`),
  CONSTRAINT `fk_team_users_team_id` FOREIGN KEY (`team_id`) REFERENCES `teams` (`team_id`),
  CONSTRAINT `fk_team_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_players`
--

LOCK TABLES `team_players` WRITE;
/*!40000 ALTER TABLE `team_players` DISABLE KEYS */;
INSERT INTO `team_players` VALUES (1,1),(2,1),(6,1),(7,1),(13,1),(17,1),(18,1),(19,1),(24,1),(26,1),(28,1),(5,2),(7,2),(8,2),(12,2),(14,2),(17,2),(18,2),(20,2),(23,2),(24,2),(27,2),(28,2),(30,2),(3,3),(4,3),(9,3),(11,3),(12,3),(14,3),(19,3),(23,3),(28,3),(29,3),(2,4),(3,4),(8,4),(10,4),(18,4),(30,4),(4,5),(5,5),(6,5),(7,5),(8,5),(14,5),(15,5),(16,5),(19,5),(23,5),(24,5),(30,5),(1,6),(2,6),(3,6),(6,6),(12,6),(19,6),(26,6),(27,6),(29,6),(30,6),(2,7),(4,7),(9,7),(12,7),(13,7),(15,7),(17,7),(25,7),(26,7),(1,12),(2,12),(3,12),(4,12),(5,12),(6,12),(13,12),(15,12),(17,12),(20,12),(25,12),(3,13),(5,13),(10,13),(12,13),(15,13),(17,13),(18,13),(20,13),(28,13),(29,13),(2,14),(3,14),(9,14),(10,14),(12,14),(13,14),(14,14),(15,14),(18,14),(20,14),(27,14),(28,14),(30,14),(3,15),(6,15),(7,15),(9,15),(10,15),(13,15),(15,15),(16,15),(19,15),(20,15),(25,15),(1,16),(2,16),(3,16),(5,16),(6,16),(8,16),(11,16),(13,16),(16,16),(19,16),(20,16),(25,16),(27,16),(1,17),(9,17),(12,17),(23,17),(24,17),(25,17),(26,17),(27,17),(29,17),(30,17),(1,18),(2,18),(8,18),(9,18),(16,18),(17,18),(20,18),(29,18),(1,19),(8,19),(9,19),(14,19),(16,19),(18,19),(24,19),(28,19),(6,20),(10,20),(11,20),(12,20),(17,20),(25,20),(28,20),(29,20),(3,21),(4,21),(5,21),(10,21),(11,21),(25,21),(30,21),(1,22),(2,22),(4,22),(7,22),(9,22),(10,22),(11,22),(19,22),(23,22),(1,23),(2,23),(7,23),(14,23),(15,23),(18,23),(24,23),(25,23),(26,23),(30,23),(35,24);
/*!40000 ALTER TABLE `team_players` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `team_players_view`
--

DROP TABLE IF EXISTS `team_players_view`;
/*!50001 DROP VIEW IF EXISTS `team_players_view`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `team_players_view` AS SELECT 
 1 AS `team_id`,
 1 AS `user_id`,
 1 AS `name`,
 1 AS `lastname`,
 1 AS `birthdate`,
 1 AS `email`,
 1 AS `team_name`,
 1 AS `team_description`,
 1 AS `max_players`,
 1 AS `founder_id`,
 1 AS `team_shield`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `teams`
--

DROP TABLE IF EXISTS `teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teams` (
  `team_id` int NOT NULL AUTO_INCREMENT,
  `team_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `team_description` varchar(1000) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `max_players` int DEFAULT NULL,
  `founder_id` int DEFAULT NULL,
  `team_shield` text COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`team_id`),
  KEY `fk_founder_id` (`founder_id`),
  CONSTRAINT `fk_founder_id` FOREIGN KEY (`founder_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teams`
--

LOCK TABLES `teams` WRITE;
/*!40000 ALTER TABLE `teams` DISABLE KEYS */;
INSERT INTO `teams` VALUES (1,'Dragones FC','Equipo competitivo con enfoque en disciplina táctica y juego ofensivo dinámico.',18,1,'https://i.pinimg.com/1200x/87/8f/8f/878f8f4273d29d45eeb8e1131a6fdad9.jpg'),(2,'Leones del Norte','Fundado por amigos del barrio, enfocados en trabajo en equipo y constancia.',20,2,'https://www.clipartmax.com/png/middle/468-4682371_accesorios-para-ligas-2013-escudos-ineditos-by-facu-real-madrid-logo.png'),(3,'Atlético Horizonte','Club joven con proyección regional y formación de talento local.',16,3,'https://images.unsplash.com/photo-1517649763962-0c623066013b'),(4,'Titanes United','Equipo experimentado con jugadores veteranos y juveniles combinados.',22,4,'https://download.logo.wine/logo/Manchester_United_F.C./Manchester_United_F.C.-Logo.wine.png'),(5,'Real Centuriones','Club enfocado en estrategia defensiva sólida y contraataques rápidos.',18,5,'https://images.unsplash.com/photo-1494173853739-c21f58b16055'),(6,'Guerreros del Sur','Equipo apasionado que prioriza la intensidad y la presión alta.',20,6,'https://images.unsplash.com/photo-1518604666860-9ed391f76460'),(7,'Estrellas Rojas','Proyecto deportivo enfocado en jóvenes talentos y crecimiento colectivo.',17,7,'https://logodownload.org/wp-content/uploads/2017/02/manchester-city-fc-logo-escudo-badge.png'),(8,'Halcones FC','Equipo veloz con gran capacidad de transición ofensiva.',19,1,'https://images.unsplash.com/photo-1471295253337-3ceaaedca402'),(9,'Unión Deportiva Atlas','Combinación de experiencia y juventud con metas competitivas claras.',21,2,'https://images.unsplash.com/photo-1517649763962-0c623066013b'),(10,'Spartanos Futbol Club','Inspirados en la disciplina y el esfuerzo constante.',18,3,'https://static.wikia.nocookie.net/futbol/images/b/b2/Liverpool_FC_logo.png/revision/latest?cb=20070112035844'),(11,'Racing Élite','Equipo técnico con enfoque en posesión y control del partido.',20,4,'https://images.unsplash.com/photo-1494173853739-c21f58b16055'),(12,'Toros FC','Juego físico y fuerte presencia en el mediocampo.',22,5,'https://images.unsplash.com/photo-1518604666860-9ed391f76460'),(13,'Panteras Unidas','Equipo ofensivo con mentalidad ganadora.',18,6,'https://images.unsplash.com/photo-1471295253337-3ceaaedca402'),(14,'Cruzados Deportivos','Fundado con el objetivo de competir a nivel nacional.',20,7,'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Santos_Logo.png/250px-Santos_Logo.png'),(15,'Lobos del Este','Equipo compacto con defensa organizada y ataque rápido.',19,1,'https://images.unsplash.com/photo-1494173853739-c21f58b16055'),(16,'Academia Fénix','Formación y desarrollo de jugadores jóvenes con proyección.',16,2,'https://images.unsplash.com/photo-1517649763962-0c623066013b'),(17,'Imperio FC','Club con aspiraciones de dominar la liga local.',21,3,'https://img.magnific.com/vector-premium/emblema-equipo-futbol-azul_1249027-853.jpg?semt=ais_hybrid&w=740&q=80'),(18,'Deportivo Valkiria','Equipo competitivo con identidad fuerte y liderazgo sólido.',18,4,'https://images.unsplash.com/photo-1471295253337-3ceaaedca402'),(19,'Olympus Team','Proyecto ambicioso con metas a mediano y largo plazo.',20,5,'https://images.unsplash.com/photo-1518604666860-9ed391f76460'),(20,'Fortaleza FC','Equipo equilibrado que combina técnica, táctica y resistencia.',22,6,'https://png.pngtree.com/png-vector/20240921/ourmid/pngtree-thats-the-football-logo-vector-png-image_13885485.png'),(23,'Vikingos FC','Equipo combativo con fuerte identidad de vestuario.',20,21,'https://images.unsplash.com/photo-1508098682722-e99c43a406b2'),(24,'Marea Azul FC','Club costero con estilo de juego asociativo y técnico.',18,19,'https://images.unsplash.com/photo-1522778119026-d647f0596c20'),(25,'Cóndores FC','Equipo de altura con gran juego aéreo y físico.',19,16,'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9'),(26,'Fénix Renacer FC','Proyecto deportivo que se reinventa cada temporada.',20,4,'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c'),(27,'Norte Extremo FC','Equipo de carácter fuerte y clima adverso favorable.',18,1,'https://images.unsplash.com/photo-1550881111-7cfde14b8073'),(28,'Furia Roja FC','Equipo intenso con gran presión tras pérdida.',19,12,'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a'),(29,'Águilas Doradas FC','Club con gran juego por bandas y velocidad.',18,7,'https://images.unsplash.com/photo-1571056642829-86df31946ec9'),(30,'Muralla FC','Equipo con defensa férrea y pocos goles encajados.',20,22,'https://images.unsplash.com/photo-1553778263-73a83bab9b0c'),(31,'Equipo Suplente 29-1','Equipo generado automaticamente para completar el bracket',NULL,NULL,NULL),(32,'Equipo Suplente 29-2','Equipo generado automaticamente para completar el bracket',NULL,NULL,NULL),(33,'Equipo Suplente 29-3','Equipo generado automaticamente para completar el bracket',NULL,NULL,NULL),(34,'Equipo Suplente 29-4','Equipo generado automaticamente para completar el bracket',NULL,NULL,NULL),(35,'Equipo de prueba','equipo creado de prueba',16,24,'https://template.canva.com/EAF8UJhUieQ/2/0/1600w-Iox2YGejVTU.jpg');
/*!40000 ALTER TABLE `teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `teams_view`
--

DROP TABLE IF EXISTS `teams_view`;
/*!50001 DROP VIEW IF EXISTS `teams_view`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `teams_view` AS SELECT 
 1 AS `team_id`,
 1 AS `team_name`,
 1 AS `team_description`,
 1 AS `max_players`,
 1 AS `founder_id`,
 1 AS `team_shield`,
 1 AS `user_id`,
 1 AS `name`,
 1 AS `lastname`,
 1 AS `birthdate`,
 1 AS `email`,
 1 AS `password`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `tournament_teams`
--

DROP TABLE IF EXISTS `tournament_teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tournament_teams` (
  `tournament_id` int NOT NULL,
  `team_id` int NOT NULL,
  PRIMARY KEY (`tournament_id`,`team_id`),
  KEY `fk_team_id` (`team_id`),
  CONSTRAINT `fk_team_id` FOREIGN KEY (`team_id`) REFERENCES `teams` (`team_id`),
  CONSTRAINT `fk_tournament_id` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments` (`tournament_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tournament_teams`
--

LOCK TABLES `tournament_teams` WRITE;
/*!40000 ALTER TABLE `tournament_teams` DISABLE KEYS */;
INSERT INTO `tournament_teams` VALUES (26,1),(27,1),(29,1),(30,1),(31,1),(36,1),(38,1),(26,2),(27,2),(29,2),(30,2),(31,2),(34,2),(38,2),(26,3),(27,3),(28,3),(29,3),(30,3),(31,3),(35,3),(38,3),(26,4),(27,4),(29,4),(30,4),(31,4),(38,4),(26,5),(27,5),(29,5),(30,5),(31,5),(38,5),(7,6),(26,6),(27,6),(29,6),(30,6),(31,6),(38,6),(26,7),(29,7),(30,7),(31,7),(34,7),(38,7),(26,8),(27,8),(28,8),(29,8),(30,8),(31,8),(36,8),(37,8),(38,8),(26,9),(29,9),(30,9),(34,9),(26,10),(27,10),(29,10),(30,10),(35,10),(36,10),(26,11),(29,11),(30,11),(33,11),(35,11),(26,12),(27,12),(29,12),(30,12),(34,12),(37,12),(7,13),(26,13),(27,13),(29,13),(30,13),(34,13),(36,13),(37,13),(26,14),(29,14),(30,14),(31,14),(35,14),(36,14),(26,15),(28,15),(29,15),(31,15),(34,15),(35,15),(26,16),(27,16),(28,16),(29,16),(27,17),(28,17),(29,17),(31,17),(35,17),(27,18),(28,18),(29,18),(31,18),(33,18),(35,18),(36,18),(27,19),(29,19),(31,19),(33,19),(34,19),(35,19),(7,20),(29,20),(37,20),(28,23),(29,23),(31,23),(37,23),(27,24),(29,24),(31,24),(36,24),(28,25),(29,25),(30,25),(29,26),(37,26),(27,27),(29,27),(31,27),(37,27),(29,28),(29,29),(34,29),(29,30),(30,30),(36,30),(37,30),(29,31),(29,32),(29,33),(29,34),(33,35);
/*!40000 ALTER TABLE `tournament_teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `tournament_teams_view`
--

DROP TABLE IF EXISTS `tournament_teams_view`;
/*!50001 DROP VIEW IF EXISTS `tournament_teams_view`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `tournament_teams_view` AS SELECT 
 1 AS `tournament_id`,
 1 AS `sport_id`,
 1 AS `tournament_name`,
 1 AS `rounds_names`,
 1 AS `total_teams`,
 1 AS `tournament_organizer`,
 1 AS `location`,
 1 AS `start_date`,
 1 AS `end_date`,
 1 AS `tournament_prize`,
 1 AS `inscription_price_per_team`,
 1 AS `tournament_requirements`,
 1 AS `tournament_type`,
 1 AS `created_by`,
 1 AS `tournament_status`,
 1 AS `is_active`,
 1 AS `team_id`,
 1 AS `team_name`,
 1 AS `team_shield`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `tournaments`
--

DROP TABLE IF EXISTS `tournaments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tournaments` (
  `tournament_id` int NOT NULL AUTO_INCREMENT,
  `sport_id` int NOT NULL,
  `tournament_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `rounds_names` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `total_teams` int NOT NULL,
  `tournament_organizer` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `location` text COLLATE utf8mb4_general_ci NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `tournament_prize` text COLLATE utf8mb4_general_ci,
  `players_per_team` int DEFAULT '11',
  `inscription_price_per_team` decimal(10,2) NOT NULL DEFAULT '0.00',
  `tournament_requirements` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `tournament_type` set('playoffs','league') COLLATE utf8mb4_general_ci NOT NULL,
  `created_by` int NOT NULL,
  `tournament_status` enum('próximamente','iniciado','cerrado','en curso','finalizado') COLLATE utf8mb4_general_ci DEFAULT 'próximamente',
  `is_active` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`tournament_id`),
  KEY `fk_tournament_sport` (`sport_id`),
  KEY `fk_created_by` (`created_by`),
  CONSTRAINT `fk_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`),
  CONSTRAINT `fk_tournament_sport` FOREIGN KEY (`sport_id`) REFERENCES `sports` (`sport_id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tournaments`
--

LOCK TABLES `tournaments` WRITE;
/*!40000 ALTER TABLE `tournaments` DISABLE KEYS */;
INSERT INTO `tournaments` VALUES (7,1,'Torneo de Verano 2026','[]',8,'Alpargata Menorca','Ciutadella, Menorca','2026-02-24','2026-02-25','500€ + cena gratis',11,100.00,'','playoffs',6,'iniciado',1),(26,1,'Copa Invierno 2026','[\"Ocatvos de Final\", \"Quartos de Final\", \"Semi Final\", \"Final\"]',16,'Liga Deportiva Central','Madrid','2026-01-10','2026-02-20','5000.00',11,250.00,'Equipo mínimo 7 jugadores, seguro médico obligatorio','playoffs',1,'próximamente',1),(27,1,'Liga Primavera 2026','[\"Octavos de Final\", \"Cuartos de Final\", \"Semi Final\", \"Final\"]',16,'Asociación Deportiva Norte','Barcelona','2026-03-05','2026-06-30','3000.00',11,150.00,'Uniforme oficial y lista de buena fe obligatoria','playoffs',6,'próximamente',1),(28,1,'Torneo Relámpago Verano','',8,'Club Atlético Sur','Valencia','2026-07-01','2026-07-15','2000.00',11,100.00,'Máximo 10 jugadores por equipo','playoffs',2,'cerrado',1),(29,1,'Superliga Nacional','',32,'Federación Nacional','Sevilla','2025-09-01','2026-05-30','15000.00',11,500.00,'Licencia federativa obligatoria','playoffs',1,'',1),(30,1,'Copa Campeones','',16,'Organización Elite Sports','Bilbao','2025-04-01','2025-04-30','8000.00',11,300.00,'Solo equipos campeones regionales','playoffs',3,'finalizado',0),(31,1,'Liga Otoño Amateur','',16,'Asociación Amateur Local','Zaragoza','2025-10-01','2025-12-15','2500.00',11,120.00,'Edad mínima 18 años','playoffs',2,'iniciado',1),(33,1,'Champions League','[\"Semi Final\",\"Final\"]',4,'UEFA','menorca','2026-03-11','2026-03-12','500€ + cena gratis',11,48.00,'no hay reglas','playoffs',6,'próximamente',1),(34,1,'Copa Metropolitana 2026','[\"Cuartos de Final\",\"Semifinal\",\"Final\"]',8,'Federación Metropolitana','Valencia','2026-04-10','2026-04-20','2000€ + trofeo',11,120.00,'Lista de buena fe de 15 jugadores máximo','playoffs',6,'finalizado',1),(35,1,'Liga Costa Este','[\"Cuartos de Final\",\"Semifinal\",\"Final\"]',8,'Club Deportivo Costa Este','Alicante','2026-05-02','2026-05-16','1500€',11,90.00,'Seguro médico obligatorio','playoffs',15,'en curso',1),(36,1,'Liga Sur Amateur','[\"Cuartos de Final\",\"Semifinal\",\"Final\"]',8,'Asociación Deportiva del Sur','Sevilla','2026-03-15','2026-04-05','1800€ + trofeo',11,110.00,'Mínimo 15 jugadores en plantilla','playoffs',4,'iniciado',1),(37,1,'Copa Juvenil Nacional','[\"Cuartos de Final\",\"Semifinal\",\"Final\"]',8,'Escuela Municipal de Fútbol','Zaragoza','2026-06-01','2026-06-10','Medallas y trofeo',11,50.00,'Categoría sub-18','playoffs',3,'próximamente',1),(38,1,'Torneo de prueba','[\"Quartos de final\",\" Semi final\",\" FInal\"]',8,'Prueba','Menorca','2026-09-21','2026-10-21','1000€',11,50.00,'','playoffs',24,'próximamente',1);
/*!40000 ALTER TABLE `tournaments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `lastname` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `birthdate` date NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `password` text COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Ana','Garcia','1990-05-12','ana.garcia@email.com','password123'),(2,'Luis','Martinez','1985-09-30','luis.martinez@email.com','qwerty456'),(3,'María','Lopez','1992-02-18','maria.lopez@email.com','abc12345'),(4,'Carlos','Perez','1988-12-01','carlos.perez@email.com','pass9876'),(5,'Sofía','Rodriguez','1995-07-22','sofia.rodriguez@email.com','sofiapass'),(6,'Arnau','Marques','2005-04-21','armarquesabello@gmail.com','$2b$10$WKymPfwYMhH/gzsF3WbpD.LMD7mCUTCzETd69opAYaFM2saZyR5Ki'),(7,'Marc','Pons','2005-02-07','marcpons@gmail.com','$2b$10$81sVY2jEnxn2Cd1tuLczt.bWhKFUhAZUusi1fJoCNi2KYcwcXIbW.'),(12,'Elena','Fernandez','1994-03-12','elena.fernandez@email.com','$2b$10$yWa9TjMCHFk/5aG0OTA9SethQ8BUdooMKTyYHFgGcgBaQZMFaYghS'),(13,'Javier','Ruiz','1992-07-22','javier.ruiz@email.com','$2b$10$yWa9TjMCHFk/5aG0OTA9SethQ8BUdooMKTyYHFgGcgBaQZMFaYghS'),(14,'Laura','Moreno','1997-01-30','laura.moreno@email.com','$2b$10$yWa9TjMCHFk/5aG0OTA9SethQ8BUdooMKTyYHFgGcgBaQZMFaYghS'),(15,'Pablo','Jimenez','1989-11-05','pablo.jimenez@email.com','$2b$10$yWa9TjMCHFk/5aG0OTA9SethQ8BUdooMKTyYHFgGcgBaQZMFaYghS'),(16,'Claudia','Navarro','1996-06-18','claudia.navarro@email.com','$2b$10$yWa9TjMCHFk/5aG0OTA9SethQ8BUdooMKTyYHFgGcgBaQZMFaYghS'),(17,'Diego','Ortega','1991-09-09','diego.ortega@email.com','$2b$10$yWa9TjMCHFk/5aG0OTA9SethQ8BUdooMKTyYHFgGcgBaQZMFaYghS'),(18,'Nuria','Serrano','1995-04-27','nuria.serrano@email.com','$2b$10$yWa9TjMCHFk/5aG0OTA9SethQ8BUdooMKTyYHFgGcgBaQZMFaYghS'),(19,'Alex','Vidal','1993-12-14','alex.vidal@email.com','$2b$10$yWa9TjMCHFk/5aG0OTA9SethQ8BUdooMKTyYHFgGcgBaQZMFaYghS'),(20,'Marta','Castro','1998-02-08','marta.castro@email.com','$2b$10$yWa9TjMCHFk/5aG0OTA9SethQ8BUdooMKTyYHFgGcgBaQZMFaYghS'),(21,'Hugo','Romero','1990-08-19','hugo.romero@email.com','$2b$10$yWa9TjMCHFk/5aG0OTA9SethQ8BUdooMKTyYHFgGcgBaQZMFaYghS'),(22,'Irene','Delgado','1994-10-02','irene.delgado@email.com','$2b$10$yWa9TjMCHFk/5aG0OTA9SethQ8BUdooMKTyYHFgGcgBaQZMFaYghS'),(23,'Sergio','Iglesias','1992-05-25','sergio.iglesias@email.com','$2b$10$yWa9TjMCHFk/5aG0OTA9SethQ8BUdooMKTyYHFgGcgBaQZMFaYghS'),(24,'Test','Prova','2026-09-23','test@gmail.com','$2b$10$nyPUxNJ.A67d1FMbdvK6Puv8pie1ChXeytC9Nmtj/eoMXoEQcZmQq'),(25,'Test','Claude','2000-01-01','test.claude.tourneypro@example.com','$2b$10$C2EpDsVuvzSByCE2hRRQKe16ibPYB88oxVgIHBqjzlpNUqbPQJa2a');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `team_players_view`
--

/*!50001 DROP VIEW IF EXISTS `team_players_view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50001 VIEW `team_players_view` AS select `tc`.`team_id` AS `team_id`,`tc`.`user_id` AS `user_id`,`u`.`name` AS `name`,`u`.`lastname` AS `lastname`,`u`.`birthdate` AS `birthdate`,`u`.`email` AS `email`,`t`.`team_name` AS `team_name`,`t`.`team_description` AS `team_description`,`t`.`max_players` AS `max_players`,`t`.`founder_id` AS `founder_id`,`t`.`team_shield` AS `team_shield` from ((`team_players` `tc` join `users` `u` on((`tc`.`user_id` = `u`.`user_id`))) join `teams` `t` on((`tc`.`team_id` = `t`.`team_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `teams_view`
--

/*!50001 DROP VIEW IF EXISTS `teams_view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50001 VIEW `teams_view` AS select `t`.`team_id` AS `team_id`,`t`.`team_name` AS `team_name`,`t`.`team_description` AS `team_description`,`t`.`max_players` AS `max_players`,`t`.`founder_id` AS `founder_id`,`t`.`team_shield` AS `team_shield`,`u`.`user_id` AS `user_id`,`u`.`name` AS `name`,`u`.`lastname` AS `lastname`,`u`.`birthdate` AS `birthdate`,`u`.`email` AS `email`,`u`.`password` AS `password` from (`teams` `t` join `users` `u` on((`t`.`founder_id` = `u`.`user_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `tournament_teams_view`
--

/*!50001 DROP VIEW IF EXISTS `tournament_teams_view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50001 VIEW `tournament_teams_view` AS select `t`.`tournament_id` AS `tournament_id`,`t`.`sport_id` AS `sport_id`,`t`.`tournament_name` AS `tournament_name`,`t`.`rounds_names` AS `rounds_names`,`t`.`total_teams` AS `total_teams`,`t`.`tournament_organizer` AS `tournament_organizer`,`t`.`location` AS `location`,`t`.`start_date` AS `start_date`,`t`.`end_date` AS `end_date`,`t`.`tournament_prize` AS `tournament_prize`,`t`.`inscription_price_per_team` AS `inscription_price_per_team`,`t`.`tournament_requirements` AS `tournament_requirements`,`t`.`tournament_type` AS `tournament_type`,`t`.`created_by` AS `created_by`,`t`.`tournament_status` AS `tournament_status`,`t`.`is_active` AS `is_active`,`tm`.`team_id` AS `team_id`,`tm`.`team_name` AS `team_name`,`tm`.`team_shield` AS `team_shield` from ((`tournaments` `t` join `tournament_teams` `tt` on((`t`.`tournament_id` = `tt`.`tournament_id`))) join `teams` `tm` on((`tt`.`team_id` = `tm`.`team_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-23 18:51:32
