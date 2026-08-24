/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.4.9-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: majuu_portal
-- ------------------------------------------------------
-- Server version	11.4.9-MariaDB-ubu2404

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES
('21a85332-2cb5-41db-aba5-282e74abd83e','88d3a705d40449c850a9528ea9e792ee7ac3051def3dcfc2fa49932538a4fccc','2026-07-22 06:56:29.951','20260722100000_add_user_auth',NULL,NULL,'2026-07-22 06:56:29.684',1),
('2a9006c3-1e7c-4a84-9ac2-3e8fecaa4fb5','fa02535555b427f57e9502e8a546e613a2314ce7bf25ab9a444c0db599008ceb','2026-07-22 08:03:05.731','20260722110000_add_cluster_other',NULL,NULL,'2026-07-22 08:03:05.652',1),
('52681b78-e402-4bf0-b527-e69c4503d1a7','65e53c06c4ae2370d5d6c7cf5fae9b181e9622b087de0e7d5cc7c719298d380e','2026-07-21 10:25:29.041','20260720175000_replace_next_of_kin_with_guarantors','',NULL,'2026-07-21 10:25:29.041',0),
('a43e15d1-85d6-11f1-ac8d-56da0e9657a3','','2026-07-22 14:07:14.967','20260722130000_fix_member_otp_column_names',NULL,NULL,'2026-07-22 14:07:14.967',1),
('b0190182-2457-4ad5-9d79-9b1b922651d2','11f49d185186da997c501afb027c40e0c7e3f853f1b47204d41a2d81ccf199e0','2026-07-21 10:25:32.296','20260721100000_credit_history_loans','',NULL,'2026-07-21 10:25:32.296',0),
('b1891199-9d89-4ad0-bc8d-a1356dcaf545','54cef01061177ee0a5f41dec7ffe61ee62ccce48e07b6d7631a62cb62d2b1ef8','2026-07-21 10:25:35.319','20260721120000_tripartite_data','',NULL,'2026-07-21 10:25:35.319',0),
('dce77868-4cff-45d1-a582-9a681f978b5e','0d1d54baa834e4fc3efff62b01586117dcfaf363327dc72232b1e09ed1610109','2026-07-22 10:31:14.392','20260722120000_member_consent_otp',NULL,NULL,'2026-07-22 10:31:14.222',1),
('ea69e755-8d7a-4245-aae6-78ef9b7c6890','531c64a8c6589339af28ec97823ffcd514b46fd3e3e9a4d0bc197f244e82ed9b','2026-07-21 10:25:26.071','20260716145200_init','',NULL,'2026-07-21 10:25:26.071',0);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `application_documents`
--

DROP TABLE IF EXISTS `application_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `application_documents` (
  `id` varchar(191) NOT NULL,
  `groupApplicationId` varchar(191) DEFAULT NULL,
  `individualApplicationId` varchar(191) DEFAULT NULL,
  `category` varchar(191) NOT NULL,
  `fileName` varchar(191) NOT NULL,
  `storagePath` varchar(191) NOT NULL,
  `mimeType` varchar(191) DEFAULT NULL,
  `uploadedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `application_documents_groupApplicationId_idx` (`groupApplicationId`),
  KEY `application_documents_individualApplicationId_idx` (`individualApplicationId`),
  CONSTRAINT `application_documents_groupApplicationId_fkey` FOREIGN KEY (`groupApplicationId`) REFERENCES `group_applications` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `application_documents_individualApplicationId_fkey` FOREIGN KEY (`individualApplicationId`) REFERENCES `individual_applications` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `application_documents`
--

LOCK TABLES `application_documents` WRITE;
/*!40000 ALTER TABLE `application_documents` DISABLE KEYS */;
INSERT INTO `application_documents` VALUES
('cmrwba6pe0001s601qbpeo7bt','cmrvsdh34000bok011o5uwsb9',NULL,'group-certificate','1784738601829-AGREEMENT_PAGE.jpg','groups/RA-6790/group-certificate/1784738601829-AGREEMENT_PAGE.jpg','image/jpeg','2026-07-22 16:43:21.842'),
('cmrwba6pn0003s601k1gqct0c','cmrvsdh34000bok011o5uwsb9',NULL,'group-kra','1784738601845-AGREEMENT_PAGE.jpg','groups/RA-6790/group-kra/1784738601845-AGREEMENT_PAGE.jpg','image/jpeg','2026-07-22 16:43:21.851'),
('cmrwba6q60005s601qa6lmyiw','cmrvsdh34000bok011o5uwsb9',NULL,'expression-of-interest','1784738601860-AGREEMENT_PAGE.jpg','groups/RA-6790/expression-of-interest/1784738601860-AGREEMENT_PAGE.jpg','image/jpeg','2026-07-22 16:43:21.871'),
('cmrwba6qd0007s6012nheg058','cmrvsdh34000bok011o5uwsb9',NULL,'member-id','1784738601874-AGREEMENT_PAGE.jpg','groups/RA-6790_members_26447696/member-id/1784738601874-AGREEMENT_PAGE.jpg','image/jpeg','2026-07-22 16:43:21.877'),
('cmrwba6r60009s601eiej6eta','cmrvsdh34000bok011o5uwsb9',NULL,'member-id','1784738601881-Change_Request_Form_1.jpg','groups/RA-6790_members_26447696/member-id/1784738601881-Change_Request_Form_1.jpg','image/jpeg','2026-07-22 16:43:21.906'),
('cmrwba6ri000bs601hb52edve','cmrvsdh34000bok011o5uwsb9',NULL,'member-passport','1784738601909-passport.jpg','groups/RA-6790_members_26447696/member-passport/1784738601909-passport.jpg','image/jpeg','2026-07-22 16:43:21.918'),
('cmrwba6tz000ds60100ca8ol8','cmrvsdh34000bok011o5uwsb9',NULL,'member-kra','1784738601951-Chris_ESTDEV.jpg','groups/RA-6790_members_26447696/member-kra/1784738601951-Chris_ESTDEV.jpg','image/jpeg','2026-07-22 16:43:22.007'),
('cmrwba6v6000fs601h3leek5o','cmrvsdh34000bok011o5uwsb9',NULL,'member-id','1784738602014-AGREEMENT_PAGE.jpg','groups/RA-6790_members_26447699/member-id/1784738602014-AGREEMENT_PAGE.jpg','image/jpeg','2026-07-22 16:43:22.051'),
('cmrwba6y7000hs601pdo00awc','cmrvsdh34000bok011o5uwsb9',NULL,'member-passport','1784738602058-Change_Request_Form_1.jpg','groups/RA-6790_members_26447699/member-passport/1784738602058-Change_Request_Form_1.jpg','image/jpeg','2026-07-22 16:43:22.160'),
('cmrwba6zd000js601ugfec8d8','cmrvsdh34000bok011o5uwsb9',NULL,'member-kra','1784738602179-AGREEMENT_PAGE.jpg','groups/RA-6790_members_26447699/member-kra/1784738602179-AGREEMENT_PAGE.jpg','image/jpeg','2026-07-22 16:43:22.201'),
('cmrwba6zm000ls601dktcck79','cmrvsdh34000bok011o5uwsb9',NULL,'member-id','1784738602205-AGREEMENT_PAGE.jpg','groups/RA-6790_members_67222222/member-id/1784738602205-AGREEMENT_PAGE.jpg','image/jpeg','2026-07-22 16:43:22.211'),
('cmrwba6zx000ns601h1sfjksa','cmrvsdh34000bok011o5uwsb9',NULL,'member-passport','1784738602212-passport.jpg','groups/RA-6790_members_67222222/member-passport/1784738602212-passport.jpg','image/jpeg','2026-07-22 16:43:22.222'),
('cmrwba704000ps601n58pdciy','cmrvsdh34000bok011o5uwsb9',NULL,'member-kra','1784738602226-AGREEMENT_PAGE.jpg','groups/RA-6790_members_67222222/member-kra/1784738602226-AGREEMENT_PAGE.jpg','image/jpeg','2026-07-22 16:43:22.229'),
('cmrxpoz160001s101xgbbss38','cmrxll0l0000xpf019go2mlvb',NULL,'group-kra','1784823272521-test-doc.pdf','groups/RA-bidii/group-kra/1784823272521-test-doc.pdf','application/pdf','2026-07-23 16:14:32.539'),
('cmrxpp1ji0003s101sdl56lxm','cmrxll0l0000xpf019go2mlvb',NULL,'group-certificate','1784823275783-test-doc.pdf','groups/RA-bidii/group-certificate/1784823275783-test-doc.pdf','application/pdf','2026-07-23 16:14:35.790'),
('cmrxpp1lk0005s1015z9pr4vd','cmrxll0l0000xpf019go2mlvb',NULL,'expression-of-interest','1784823275858-test-doc.pdf','groups/RA-bidii/expression-of-interest/1784823275858-test-doc.pdf','application/pdf','2026-07-23 16:14:35.864'),
('cmrxpp1nn0007s101lrimji6o','cmrxll0l0000xpf019go2mlvb',NULL,'member-id','1784823275938-test-doc.pdf','groups/RA-bidii_members_11111111/member-id/1784823275938-test-doc.pdf','application/pdf','2026-07-23 16:14:35.939'),
('cmrxpp1os0009s101e598cvnw','cmrxll0l0000xpf019go2mlvb',NULL,'member-passport','1784823275979-test-doc.pdf','groups/RA-bidii_members_11111111/member-passport/1784823275979-test-doc.pdf','application/pdf','2026-07-23 16:14:35.981'),
('cmrxpp1pw000bs101z4fkqfgp','cmrxll0l0000xpf019go2mlvb',NULL,'member-kra','1784823276019-test-doc.pdf','groups/RA-bidii_members_11111111/member-kra/1784823276019-test-doc.pdf','application/pdf','2026-07-23 16:14:36.021'),
('cmrxpp1r6000ds1019aq1exfe','cmrxll0l0000xpf019go2mlvb',NULL,'member-id','1784823276065-test-doc.pdf','groups/RA-bidii_members_22222222/member-id/1784823276065-test-doc.pdf','application/pdf','2026-07-23 16:14:36.066'),
('cmrxpp1se000fs101g9dlnnnp','cmrxll0l0000xpf019go2mlvb',NULL,'member-passport','1784823276109-test-doc.pdf','groups/RA-bidii_members_22222222/member-passport/1784823276109-test-doc.pdf','application/pdf','2026-07-23 16:14:36.111'),
('cmrxpp1ti000hs101hpafp6zy','cmrxll0l0000xpf019go2mlvb',NULL,'member-kra','1784823276149-test-doc.pdf','groups/RA-bidii_members_22222222/member-kra/1784823276149-test-doc.pdf','application/pdf','2026-07-23 16:14:36.150'),
('cmrxpp1ur000js1011xpb8oyx','cmrxll0l0000xpf019go2mlvb',NULL,'member-id','1784823276194-test-doc.pdf','groups/RA-bidii_members_33333333/member-id/1784823276194-test-doc.pdf','application/pdf','2026-07-23 16:14:36.195'),
('cmrxpp1w0000ls1017x7feygu','cmrxll0l0000xpf019go2mlvb',NULL,'member-passport','1784823276239-test-doc.pdf','groups/RA-bidii_members_33333333/member-passport/1784823276239-test-doc.pdf','application/pdf','2026-07-23 16:14:36.241'),
('cmrxpp1x1000ns1010i5btnd5','cmrxll0l0000xpf019go2mlvb',NULL,'member-kra','1784823276276-test-doc.pdf','groups/RA-bidii_members_33333333/member-kra/1784823276276-test-doc.pdf','application/pdf','2026-07-23 16:14:36.278'),
('cmryjybmp0043mm01zxb4gt9m','cmrvyvf3i0005mt01ldfa9dq8',NULL,'group-kra','1784874097224-Adobe_Scan_15_Jul_2026.pdf','groups/RA-23456/group-kra/1784874097224-Adobe_Scan_15_Jul_2026.pdf','application/pdf','2026-07-24 06:21:37.250'),
('cmryjyin40045mm01pncv61jh','cmrvyvf3i0005mt01ldfa9dq8',NULL,'group-certificate','1784874106306-WhatsApp_Image_2026-07-23_at_12.11.04.jpeg','groups/RA-23456/group-certificate/1784874106306-WhatsApp_Image_2026-07-23_at_12.11.04.jpeg','image/jpeg','2026-07-24 06:21:46.337'),
('cmryjyw590047mm01f3kgokh4','cmrvyvf3i0005mt01ldfa9dq8',NULL,'expression-of-interest','1784874123831-Shampoo.PNG','groups/RA-23456/expression-of-interest/1784874123831-Shampoo.PNG','image/png','2026-07-24 06:22:03.838'),
('cmryjzd6d0049mm016187iq1k','cmrvyvf3i0005mt01ldfa9dq8',NULL,'member-id','1784874145899-Adobe_Scan_15_Jul_2026.pdf','groups/RA-23456_members_31757880/member-id/1784874145899-Adobe_Scan_15_Jul_2026.pdf','application/pdf','2026-07-24 06:22:25.909'),
('cmryjzjov004bmm01adi3t6kg','cmrvyvf3i0005mt01ldfa9dq8',NULL,'member-passport','1784874154350-WhatsApp_Image_2026-07-23_at_12.11.04.jpeg','groups/RA-23456_members_31757880/member-passport/1784874154350-WhatsApp_Image_2026-07-23_at_12.11.04.jpeg','image/jpeg','2026-07-24 06:22:34.352'),
('cmryjztru004dmm01ve5utdls','cmrvyvf3i0005mt01ldfa9dq8',NULL,'member-kra','1784874167410-WhatsApp_Image_2026-07-23_at_12.10.32.jpeg','groups/RA-23456_members_31757880/member-kra/1784874167410-WhatsApp_Image_2026-07-23_at_12.10.32.jpeg','image/jpeg','2026-07-24 06:22:47.418'),
('cmryk02v3004fmm01hrc5ang1','cmrvyvf3i0005mt01ldfa9dq8',NULL,'member-id','1784874179195-WhatsApp_Image_2026-07-23_at_12.11.04.jpeg','groups/RA-23456_members_37018798/member-id/1784874179195-WhatsApp_Image_2026-07-23_at_12.11.04.jpeg','image/jpeg','2026-07-24 06:22:59.199'),
('cmryk08u1004hmm01nquqfvpq','cmrvyvf3i0005mt01ldfa9dq8',NULL,'member-passport','1784874186936-WhatsApp_Image_2026-07-23_at_12.10.32.jpeg','groups/RA-23456_members_37018798/member-passport/1784874186936-WhatsApp_Image_2026-07-23_at_12.10.32.jpeg','image/jpeg','2026-07-24 06:23:06.937'),
('cmryk0mmv004jmm01g019qrjv','cmrvyvf3i0005mt01ldfa9dq8',NULL,'member-id','1784874204821-WhatsApp_Image_2026-07-23_at_12.11.04.jpeg','groups/RA-23456_members_41826151/member-id/1784874204821-WhatsApp_Image_2026-07-23_at_12.11.04.jpeg','image/jpeg','2026-07-24 06:23:24.823'),
('cmryk0ur8004lmm017lzb5qgb','cmrvyvf3i0005mt01ldfa9dq8',NULL,'member-kra','1784874215345-Adobe_Scan_15_Jul_2026.pdf','groups/RA-23456_members_37018798/member-kra/1784874215345-Adobe_Scan_15_Jul_2026.pdf','application/pdf','2026-07-24 06:23:35.349'),
('cmryk0z2p004nmm01hok3vab8','cmrvyvf3i0005mt01ldfa9dq8',NULL,'member-passport','1784874220940-WhatsApp_Image_2026-07-23_at_12.10.32.jpeg','groups/RA-23456_members_41826151/member-passport/1784874220940-WhatsApp_Image_2026-07-23_at_12.10.32.jpeg','image/jpeg','2026-07-24 06:23:40.946'),
('cmryk1qte004rmm01u3gnjimh','cmrvyvf3i0005mt01ldfa9dq8',NULL,'member-kra','1784874256876-Adobe_Scan_15_Jul_2026.pdf','groups/RA-23456_members_41826151/member-kra/1784874256876-Adobe_Scan_15_Jul_2026.pdf','application/pdf','2026-07-24 06:24:16.899');
/*!40000 ALTER TABLE `application_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `budget_items`
--

DROP TABLE IF EXISTS `budget_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `budget_items` (
  `id` varchar(191) NOT NULL,
  `applicationId` varchar(191) NOT NULL,
  `item` varchar(191) NOT NULL,
  `cost` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `budget_items_applicationId_idx` (`applicationId`),
  CONSTRAINT `budget_items_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `individual_applications` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `budget_items`
--

LOCK TABLES `budget_items` WRITE;
/*!40000 ALTER TABLE `budget_items` DISABLE KEYS */;
INSERT INTO `budget_items` VALUES
('cmruhdjhu000aszi6dpravs07','cmrqv44b70009sz4zqcexj0i2','Travelling',100000.00),
('cmruhdjhu000bszi6tnbdw27v','cmrqv44b70009sz4zqcexj0i2','Agency Fees',60000.00),
('cmruhdjhu000cszi62q2ykukl','cmrqv44b70009sz4zqcexj0i2','Medical Checkup',50000.00),
('cmruhdjhu000dszi65m4sc4l8','cmrqv44b70009sz4zqcexj0i2','Clothing',40000.00),
('cmruhdjhu000eszi643x91vsn','cmrqv44b70009sz4zqcexj0i2','Food',20000.00),
('cmrwcz8tp000cru01v99uvu11','cmrwbl9lx000rs601s101xv8i','Medical',30000.00),
('cmrwcz8tp000dru01x1i2ljer','cmrwbl9lx000rs601s101xv8i','Transport',20000.00),
('cmrwcz8tp000eru01x3sgrx76','cmrwbl9lx000rs601s101xv8i','Upkeep',40000.00),
('cmrwcz8tp000fru01lps94y90','cmrwbl9lx000rs601s101xv8i','Drinking',10000.00),
('cmrwcz8tp000gru01tczacggq','cmrwbl9lx000rs601s101xv8i','Eating',15000.00),
('cmrwcz8tp000hru01jm4ppwdb','cmrwbl9lx000rs601s101xv8i','Clothes',30000.00),
('cmrwdl069000es2012d4nsin7','cmrwd2knx0001s201jre4f6lx','Hot dog',20000.00),
('cmrwdl069000fs201ihjdgwbe','cmrwd2knx0001s201jre4f6lx','Food',30000.00),
('cmrwdl069000gs201bgbu37kk','cmrwd2knx0001s201jre4f6lx','Clothes',45000.00),
('cmrwdl069000hs201siwd3e1h','cmrwd2knx0001s201jre4f6lx','Computer',10000.00),
('cmrwdl069000is201zh2ema5n','cmrwd2knx0001s201jre4f6lx','Transport',40000.00),
('cmrwe798s000ote01f6lmsf8p','cmrwdx3e90009te01415ct2t1','hkjhkjhkhj',23000.00),
('cmrwe798s000pte01ivdh8e8u','cmrwdx3e90009te01415ct2t1','dfdfsdsdfd',34000.00),
('cmrwe798s000qte01ia39h8mj','cmrwdx3e90009te01415ct2t1','fdfdfssdfd',45000.00),
('cmrwe798s000rte01n2yu63rj','cmrwdx3e90009te01415ct2t1','gfgfgdfgfdg',6700.00),
('cmrwe798s000ste01em4b4y32','cmrwdx3e90009te01415ct2t1','scccdcsd',12000.00),
('cmrxqgl790016mm01ugtmzei0','cmrxpw8xp0001mm01vrjt7arg','Food',20000.00),
('cmrxqgl790017mm01i2z5skps','cmrxpw8xp0001mm01vrjt7arg','Transport',30000.00),
('cmrxqgl790018mm01iswn591x','cmrxpw8xp0001mm01vrjt7arg','Medicals',20000.00),
('cmrxqgl790019mm01ryj4mnse','cmrxpw8xp0001mm01vrjt7arg','Beddings',15000.00),
('cmrxqgl79001amm018pdg16g0','cmrxpw8xp0001mm01vrjt7arg','Miscellaneous ',15000.00),
('cmrxqkjig001lmm01g7dxlx6x','cmrxpw8y60003mm01oyokwfig','Gas cooker',30000.00),
('cmrxqkjig001mmm01lg7aq8hx','cmrxpw8y60003mm01oyokwfig','Fridge',30000.00),
('cmrxqkjig001nmm01sxga7h4w','cmrxpw8y60003mm01oyokwfig','Pan',20000.00),
('cmrxqkjig001omm0128nqg68i','cmrxpw8y60003mm01oyokwfig','Microwave',2000.00),
('cmrxqkjig001pmm010saknttm','cmrxpw8y60003mm01oyokwfig','Oven',18000.00),
('cmrxqrtjk002amm01a48vds07','cmrxpw8yk0005mm01igiz87jg','Food',20000.00),
('cmrxqrtjk002bmm01cyxtwk98','cmrxpw8yk0005mm01igiz87jg','Drinks',20000.00),
('cmrxqrtjk002cmm01hj2fsmmh','cmrxpw8yk0005mm01igiz87jg','Transport ',20000.00),
('cmrxqrtjk002dmm01leh2254k','cmrxpw8yk0005mm01igiz87jg','Goodies',20000.00),
('cmrxqrtjk002emm01x0r7ghrd','cmrxpw8yk0005mm01igiz87jg','Miscellaneous ',20000.00),
('cmrykq4um005ymm01s7gxost8','cmryk2p77004vmm01b8howvu7','Transport ',80000.00),
('cmrykq4um005zmm01ut9v29cq','cmryk2p77004vmm01b8howvu7','Accomodation',20000.00),
('cmrykq4um0060mm01c06dtrtr','cmryk2p77004vmm01b8howvu7','Loan',30000.00),
('cmrykq4um0061mm01ix6ox4j0','cmryk2p77004vmm01b8howvu7','Farmily',20000.00),
('cmrykq4um0062mm01zqkbs3kj','cmryk2p77004vmm01b8howvu7','Other',10000.00),
('cmryktme0006fmm01sewobokw','cmryk2p5p004tmm01n52btn8a','travelling',20000.00),
('cmryktme0006gmm0157gu3znc','cmryk2p5p004tmm01n52btn8a','Air tickket',20000.00),
('cmryktme0006hmm0118xm85mn','cmryk2p5p004tmm01n52btn8a','Medical documents',20000.00),
('cmryktme0006imm015359yqyl','cmryk2p5p004tmm01n52btn8a','Agency fee',50000.00),
('cmryktme0006jmm01slbqlowq','cmryk2p5p004tmm01n52btn8a','rent and food',50000.00),
('cmrykvljv006smm01iu88u3md','cmryk2p8j004xmm013223q5kq','Air ticket',70000.00),
('cmrykvljv006tmm01ejg3wzv0','cmryk2p8j004xmm013223q5kq','Fare',24999.99),
('cmrykvljv006umm01pqeylzwu','cmryk2p8j004xmm013223q5kq','Jama',20000.00),
('cmrykvljv006vmm01r4ynbr03','cmryk2p8j004xmm013223q5kq','wdd',6000.00),
('cmrykvljv006wmm014pqpxg0p','cmryk2p8j004xmm013223q5kq','iiww',44990.00);
/*!40000 ALTER TABLE `budget_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `constituencies`
--

DROP TABLE IF EXISTS `constituencies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `constituencies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `countyId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `constituencies_countyId_name_key` (`countyId`,`name`),
  CONSTRAINT `constituencies_countyId_fkey` FOREIGN KEY (`countyId`) REFERENCES `counties` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=290 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `constituencies`
--

LOCK TABLES `constituencies` WRITE;
/*!40000 ALTER TABLE `constituencies` DISABLE KEYS */;
INSERT INTO `constituencies` VALUES
(1,'CHANGAMWE',1),
(2,'JOMVU',1),
(3,'KISAUNI',1),
(5,'LIKONI',1),
(6,'MVITA',1),
(4,'NYALI',1),
(10,'KINANGO',2),
(8,'LUNGA LUNGA',2),
(9,'MATUGA',2),
(7,'MSAMBWENI',2),
(15,'GANZE',3),
(13,'KALOLENI',3),
(11,'KILIFI NORTH',3),
(12,'KILIFI SOUTH',3),
(17,'MAGARINI',3),
(16,'MALINDI',3),
(14,'RABAI',3),
(20,'BURA',4),
(19,'GALOLE',4),
(18,'GARSEN',4),
(21,'LAMU EAST',5),
(22,'LAMU WEST',5),
(25,'MWATATE',6),
(23,'TAVETA',6),
(26,'VOI',6),
(24,'WUNDANYI',6),
(28,'BALAMBALA',7),
(30,'DADAAB',7),
(31,'FAFI',7),
(27,'GARISSA TOWNSHIP',7),
(32,'IJARA',7),
(29,'LAGDERA',7),
(37,'ELDAS',8),
(35,'TARBAJ',8),
(34,'WAJIR EAST',8),
(33,'WAJIR NORTH',8),
(38,'WAJIR SOUTH',8),
(36,'WAJIR WEST',8),
(40,'BANISSA',9),
(44,'LAFEY',9),
(43,'MANDERA EAST',9),
(41,'MANDERA NORTH',9),
(42,'MANDERA SOUTH',9),
(39,'MANDERA WEST',9),
(48,'LAISAMIS',10),
(45,'MOYALE',10),
(46,'NORTH HORR',10),
(47,'SAKU',10),
(49,'ISIOLO NORTH',11),
(50,'ISIOLO SOUTH',11),
(57,'BUURI',12),
(58,'CENTRAL IMENTI',12),
(52,'IGEMBE CENTRAL',12),
(53,'IGEMBE NORTH',12),
(51,'IGEMBE SOUTH',12),
(56,'NORTH IMENTI',12),
(59,'SOUTH IMENTI',12),
(55,'TIGANIA EAST',12),
(54,'TIGANIA WEST',12),
(60,'MAARA',13),
(61,'THARAKA',13),
(62,'MANYATTA',14),
(65,'MBEERE NORTH',14),
(64,'MBEERE SOUTH',14),
(63,'RUNYENJES',14),
(71,'KITUI CENTRAL',15),
(72,'KITUI EAST',15),
(70,'KITUI RURAL',15),
(73,'KITUI SOUTH',15),
(69,'KITUI WEST',15),
(68,'MWINGI CENTRAL',15),
(66,'MWINGI NORTH',15),
(67,'MWINGI WEST',15),
(76,'KANGUNDO',16),
(78,'KATHIANI',16),
(80,'MACHAKOS TOWN',16),
(74,'MASINGA',16),
(77,'MATUNGULU',16),
(79,'MAVOKO',16),
(81,'MWALA',16),
(75,'YATTA',16),
(84,'KAITI',17),
(87,'KIBWEZI EAST',17),
(86,'KIBWEZI WEST',17),
(83,'KILOME',17),
(85,'MAKUENI',17),
(82,'MBOONI',17),
(88,'KINANGOP',18),
(89,'KIPIPIRI',18),
(92,'NDARAGWA',18),
(91,'OL JOROK',18),
(90,'OL KALOU',18),
(94,'KIENI',19),
(95,'MATHIRA',19),
(97,'MUKURWEINI',19),
(98,'NYERI TOWN',19),
(96,'OTHAYA',19),
(93,'TETU',19),
(100,'GICHUGU',20),
(102,'KIRINYAGA CENTRAL',20),
(99,'MWEA',20),
(101,'NDIA',20),
(109,'GATANGA',21),
(108,'KANDARA',21),
(103,'KANGEMA',21),
(106,'KIGUMO',21),
(105,'KIHARU',21),
(107,'MARAGWA',21),
(104,'MATHIOYA',21),
(111,'GATUNDU NORTH',22),
(110,'GATUNDU SOUTH',22),
(115,'GITHUNGURI',22),
(112,'JUJA',22),
(118,'KABETE',22),
(117,'KIAMBAA',22),
(116,'KIAMBU',22),
(119,'KIKUYU',22),
(121,'LARI',22),
(120,'LIMURU',22),
(114,'RUIRU',22),
(113,'THIKA TOWN',22),
(125,'LOIMA',23),
(124,'TURKANA CENTRAL',23),
(127,'TURKANA EAST',23),
(122,'TURKANA NORTH',23),
(126,'TURKANA SOUTH',23),
(123,'TURKANA WEST',23),
(130,'KACHELIBA',24),
(128,'KAPENGURIA',24),
(131,'POKOT SOUTH',24),
(129,'SIGOR',24),
(134,'SAMBURU EAST',25),
(133,'SAMBURU NORTH',25),
(132,'SAMBURU WEST',25),
(139,'CHERANGANY',26),
(136,'ENDEBESS',26),
(138,'KIMININI',26),
(135,'KWANZA',26),
(137,'SABOTI',26),
(143,'AINABKOI',27),
(144,'KAPSERET',27),
(145,'KESSES',27),
(142,'MOIBEN',27),
(140,'SOY',27),
(141,'TURBO',27),
(148,'KEIYO NORTH',28),
(149,'KEIYO SOUTH',28),
(146,'MARAKWET EAST',28),
(147,'MARAKWET WEST',28),
(151,'ALDAI',29),
(153,'CHESUMEI',29),
(154,'EMGWEN',29),
(155,'MOSOP',29),
(152,'NANDI HILLS',29),
(150,'TINDERET',29),
(158,'BARINGO CENTRAL',30),
(157,'BARINGO NORTH',30),
(159,'BARINGO SOUTH',30),
(161,'ELDAMA RAVINE',30),
(160,'MOGOTIO',30),
(156,'TIATY',30),
(163,'LAIKIPIA EAST',31),
(164,'LAIKIPIA NORTH',31),
(162,'LAIKIPIA WEST',31),
(173,'BAHATI',32),
(168,'GILGIL',32),
(170,'KURESOI NORTH',32),
(169,'KURESOI SOUTH',32),
(165,'MOLO',32),
(167,'NAIVASHA',32),
(175,'NAKURU TOWN EAST',32),
(174,'NAKURU TOWN WEST',32),
(166,'NJORO',32),
(172,'RONGAI',32),
(171,'SUBUKIA',32),
(177,'EMURUA DIKIRR',33),
(176,'KILGORIS',33),
(179,'NAROK EAST',33),
(178,'NAROK NORTH',33),
(180,'NAROK SOUTH',33),
(181,'NAROK WEST',33),
(183,'KAJIADO CENTRAL',34),
(184,'KAJIADO EAST',34),
(182,'KAJIADO NORTH',34),
(186,'KAJIADO SOUTH',34),
(185,'KAJIADO WEST',34),
(189,'AINAMOI',35),
(191,'BELGUT',35),
(190,'BURETI',35),
(187,'KIPKELION EAST',35),
(188,'KIPKELION WEST',35),
(192,'SIGOWET/SOIN',35),
(196,'BOMET CENTRAL',36),
(195,'BOMET EAST',36),
(194,'CHEPALUNGU',36),
(197,'KONOIN',36),
(193,'SOTIK',36),
(206,'BUTERE',37),
(209,'IKOLOMANI',37),
(207,'KHWISERO',37),
(199,'LIKUYANI',37),
(198,'LUGARI',37),
(201,'LURAMBI',37),
(200,'MALAVA',37),
(205,'MATUNGU',37),
(204,'MUMIAS EAST',37),
(203,'MUMIAS WEST',37),
(202,'NAVAKHOLO',37),
(208,'SHINYALU',37),
(214,'EMUHAYA',38),
(212,'HAMISI',38),
(213,'LUANDA',38),
(211,'SABATIA',38),
(210,'VIHIGA',38),
(218,'BUMULA',39),
(217,'KABUCHAI',39),
(219,'KANDUYI',39),
(222,'KIMILILI',39),
(215,'MT. ELGON',39),
(216,'SIRISIA',39),
(223,'TONGAREN',39),
(220,'WEBUYE EAST',39),
(221,'WEBUYE WEST',39),
(230,'BUDALANGI',40),
(228,'BUTULA',40),
(229,'FUNYULA',40),
(227,'MATAYOS',40),
(226,'NAMBALE',40),
(224,'TESO NORTH',40),
(225,'TESO SOUTH',40),
(233,'ALEGO USONGA',41),
(235,'BONDO',41),
(234,'GEM',41),
(236,'RARIEDA',41),
(231,'UGENYA',41),
(232,'UGUNJA',41),
(239,'KISUMU CENTRAL',42),
(237,'KISUMU EAST',42),
(238,'KISUMU WEST',42),
(242,'MUHORONI',42),
(243,'NYAKACH',42),
(241,'NYANDO',42),
(240,'SEME',42),
(248,'HOMA BAY TOWN',43),
(245,'KABONDO KASIPUL',43),
(246,'KARACHUONYO',43),
(244,'KASIPUL',43),
(249,'NDHIWA',43),
(247,'RANGWE',43),
(250,'SUBA NORTH',43),
(251,'SUBA SOUTH',43),
(253,'AWENDO',44),
(259,'KURIA EAST',44),
(258,'KURIA WEST',44),
(257,'NYATIKE',44),
(252,'RONGO',44),
(254,'SUNA EAST',44),
(255,'SUNA WEST',44),
(256,'URIRI',44),
(263,'BOBASI',45),
(262,'BOMACHOGE BORABU',45),
(264,'BOMACHOGE CHACHE',45),
(260,'BONCHARI',45),
(267,'KITUTU CHACHE NORTH',45),
(268,'KITUTU CHACHE SOUTH',45),
(266,'NYARIBARI CHACHE',45),
(265,'NYARIBARI MASABA',45),
(261,'SOUTH MUGIRANGO',45),
(272,'BORABU',46),
(269,'KITUTU MASABA',46),
(271,'NORTH MUGIRANGO',46),
(270,'WEST MUGIRANGO',46),
(274,'DAGORETTI NORTH',47),
(275,'DAGORETTI SOUTH',47),
(283,'EMBAKASI CENTRAL',47),
(284,'EMBAKASI EAST',47),
(282,'EMBAKASI NORTH',47),
(281,'EMBAKASI SOUTH',47),
(285,'EMBAKASI WEST',47),
(287,'KAMUKUNJI',47),
(279,'KASARANI',47),
(277,'KIBRA',47),
(276,'LANGATA',47),
(286,'MAKADARA',47),
(289,'MATHARE',47),
(278,'ROYSAMBU',47),
(280,'RUARAKA',47),
(288,'STAREHE',47),
(273,'WESTLANDS',47);
/*!40000 ALTER TABLE `constituencies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `counties`
--

DROP TABLE IF EXISTS `counties`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `counties` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `counties_name_key` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `counties`
--

LOCK TABLES `counties` WRITE;
/*!40000 ALTER TABLE `counties` DISABLE KEYS */;
INSERT INTO `counties` VALUES
(30,'Baringo'),
(36,'Bomet'),
(39,'Bungoma'),
(40,'Busia'),
(28,'Elgeyo/Marakwet'),
(14,'Embu'),
(7,'Garissa'),
(43,'Homa Bay'),
(11,'Isiolo'),
(34,'Kajiado'),
(37,'Kakamega'),
(35,'Kericho'),
(22,'Kiambu'),
(3,'Kilifi'),
(20,'Kirinyaga'),
(45,'Kisii'),
(42,'Kisumu'),
(15,'Kitui'),
(2,'Kwale'),
(31,'Laikipia'),
(5,'Lamu'),
(16,'Machakos'),
(17,'Makueni'),
(9,'Mandera'),
(10,'Marsabit'),
(12,'Meru'),
(44,'Migori'),
(1,'Mombasa'),
(21,'Murang\\a'),
(47,'Nairobi City'),
(32,'Nakuru'),
(29,'Nandi'),
(33,'Narok'),
(46,'Nyamira'),
(18,'Nyandarua'),
(19,'Nyeri'),
(25,'Samburu'),
(41,'Siaya'),
(6,'Taita Taveta'),
(4,'Tana River'),
(13,'Tharaka - Nithi'),
(26,'Trans Nzoia'),
(23,'Turkana'),
(27,'Uasin Gishu'),
(38,'Vihiga'),
(8,'Wajir'),
(24,'West Pokot');
/*!40000 ALTER TABLE `counties` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `credit_history_data`
--

DROP TABLE IF EXISTS `credit_history_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `credit_history_data` (
  `id` varchar(191) NOT NULL,
  `applicationId` varchar(191) NOT NULL,
  `hasLoanHistory` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `credit_history_data_applicationId_key` (`applicationId`),
  CONSTRAINT `credit_history_data_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `individual_applications` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `credit_history_data`
--

LOCK TABLES `credit_history_data` WRITE;
/*!40000 ALTER TABLE `credit_history_data` DISABLE KEYS */;
INSERT INTO `credit_history_data` VALUES
('cmruefqez0001szjhk2emog17','cmrqv44b70009sz4zqcexj0i2',0),
('cmrwcznq9000lru01vg1hteyr','cmrwbl9lx000rs601s101xv8i',0),
('cmrwdlowd000ms2014mpjb4y7','cmrwd2knx0001s201jre4f6lx',0),
('cmrwe7is5000wte01w12chgw1','cmrwdx3e90009te01415ct2t1',0),
('cmrxqh79c001emm01sk9xy3km','cmrxpw8xp0001mm01vrjt7arg',0),
('cmrxqlk34001vmm01qrnm2amg','cmrxpw8y60003mm01oyokwfig',0),
('cmrxqsirh002imm01ofu3y7t1','cmrxpw8yk0005mm01igiz87jg',0),
('cmrykqopv0068mm01l5xx3paj','cmryk2p77004vmm01b8howvu7',0),
('cmrykv860006rmm017x852tat','cmryk2p5p004tmm01n52btn8a',0),
('cmrykxdrz0072mm01yn160kzj','cmryk2p8j004xmm013223q5kq',0);
/*!40000 ALTER TABLE `credit_history_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `credit_history_loans`
--

DROP TABLE IF EXISTS `credit_history_loans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `credit_history_loans` (
  `id` varchar(191) NOT NULL,
  `applicationId` varchar(191) NOT NULL,
  `lender` varchar(191) NOT NULL,
  `loanDate` datetime(3) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `duration` varchar(191) NOT NULL,
  `monthlyInstallment` decimal(12,2) NOT NULL,
  `outstandingAmount` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `credit_history_loans_applicationId_idx` (`applicationId`),
  CONSTRAINT `credit_history_loans_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `individual_applications` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `credit_history_loans`
--

LOCK TABLES `credit_history_loans` WRITE;
/*!40000 ALTER TABLE `credit_history_loans` DISABLE KEYS */;
/*!40000 ALTER TABLE `credit_history_loans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ecitizen_pkce_states`
--

DROP TABLE IF EXISTS `ecitizen_pkce_states`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ecitizen_pkce_states` (
  `id` varchar(191) NOT NULL,
  `state` varchar(191) NOT NULL,
  `codeVerifier` text NOT NULL,
  `callbackUrl` varchar(191) NOT NULL,
  `expiresAt` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ecitizen_pkce_states_state_key` (`state`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ecitizen_pkce_states`
--

LOCK TABLES `ecitizen_pkce_states` WRITE;
/*!40000 ALTER TABLE `ecitizen_pkce_states` DISABLE KEYS */;
INSERT INTO `ecitizen_pkce_states` VALUES
('cmrvqqiun0000ns014hqcpnut','FCTvh_S8w6KVB0s3ylPEYV5_gJkmbPZ7','mdv1vo~060cfBodGGIDUJHJuObpiJqiLkqKyNoMBTu1vCrAznMLgAAdq9RzzxOuZ','/apply','2026-07-22 07:18:12.141','2026-07-22 07:08:12.144'),
('cmrvre2bi0001p601y0mocfb5','oHzVNdzKmdVtpORoa4s4YEbCfdOyaFak','5uNhJrCqpfzKqy~S3IDZTKMJk3tXfsFwGwFNe5V2A0HEwR2ED~Bz4EL1GNQooB2E','/apply','2026-07-22 07:36:30.457','2026-07-22 07:26:30.462'),
('cmrvrebjb0002p601qq140bdg','DW3uIxTL7oJtZlPKkoTWy0tzgQExZO5F','fzlY4zl5Q.SFIgi~1rOP-w5M5zUOLclkrKXFzaD_j21A7a2coy2bPoC_cbEPdmT~','/apply','2026-07-22 07:36:42.376','2026-07-22 07:26:42.407'),
('cmryis31f002qmm018w7lnsby','rrJYPjiMSUCHXdLl6B~6hmP6cW3uFh2V','kto-QXgUe3ogYvESnVh5tLzUTiRaQQKkSUAx00ZFpjeSWjWIn26yC55mzSon.c0m','/dashboard','2026-07-24 05:58:46.561','2026-07-24 05:48:46.563'),
('cmryiu8lx002rmm01b58gswgg','Ywtnm4MdCjwx4O8SY8x580iPDV3P1RQR','ZTiJRtDPgIOrIvqJWlPeF3g0GTrGqgvQQ.vRJ55FXGtVMYoKcTww-njKPZr6D2pz','/dashboard','2026-07-24 06:00:27.092','2026-07-24 05:50:27.093'),
('cmryj4qm3002ymm01isrlbftv','TRGSAwlEI~nF-7lExUik8GobbPMMa.OK','qDzf~a6ixD-JSRROuaDoW7aS.40PYV0UU1Ae10gS~tdeSSYxP3UJ-i.pNpGUyivL','/dashboard','2026-07-24 06:08:36.986','2026-07-24 05:58:36.987'),
('cmryjagp30036mm01gwp179yy','w5wJ.Ml-JBVpiHQVgcUoqtvoar1TTP3g','_YbDrm_jrxiAX1q_QIQvrd8_504TLNwFOtZXRUX1a4rgoqknnua2GrIRiDG4Zk16','/dashboard','2026-07-24 06:13:04.001','2026-07-24 06:03:04.043'),
('cmryjn90r003xmm01r7hy7in3','Ygd_IG8iJ.TorxFLNMiAImxve2gQo8PF','WTP4PvGM5qMwECyWcjf2z7_GFdPK3yX8qeXuIHSFronf2FOWdg~Zuq42_siHKEK0','/dashboard','2026-07-24 06:23:00.640','2026-07-24 06:13:00.652'),
('cmryjnip7003ymm01tf5ch7gg','asm_IsE9QSpAspuh9lQs7d3eg0XS2fI1','nocUctClR1H3OcclssS0j2lBxW96vqBa7lfQr4ivln8wmeAs4rnGTyeLhmpwIUjo','/dashboard','2026-07-24 06:23:13.194','2026-07-24 06:13:13.195'),
('cmryjnqra003zmm01z12uj600','ie~e4I3pHNbOdg7yq3IumOrYLwwpJ1HR','S0tjAlRpJvL.Zwvd5j-iwoVzV3Hs1gp1U3L~P270mGmqGDGdGSYjMNEVDLUoWF_A','/dashboard','2026-07-24 06:23:23.631','2026-07-24 06:13:23.632'),
('cmrylrhcd007bmm01lvamj9hh','QIpJ9YOUJjQXlo7EcCo6kDnwpZyTiHiO','Prefaz08JK03AlwU~xAueKSlMrb0za3Ah8w0qMPQjCxmwDrKnDW-OKBbQhETc0Sq','/dashboard','2026-07-24 07:22:17.291','2026-07-24 07:12:17.293'),
('cmryltnzp007cmm01md9cjyw5','BoPusUxkwYoK2w.0cBo.eVqGMBimXRRc','j2SIJeDq.B0yk-zx01qw6tFoQr-47-5gQDrXOHmaCMEtxhSQVyLywuhJk4RgWu~R','/dashboard','2026-07-24 07:23:59.220','2026-07-24 07:13:59.221'),
('cmrylvj30007dmm01j3h4227r','bcNRuAjm~8lV~RcqMLIkUkIpD8JP~sPy','YJcXZVOC7WKNpQ3FxkOuNOZElU6kZ45lp3vqTLxPFO4rbgJwp~1SsTWlTwJhEl0y','/dashboard','2026-07-24 07:25:26.168','2026-07-24 07:15:26.172'),
('cmrz8b6kc0000mq01cz3s92mn','u3Tig4T-mAQJTvejroOpvQIPnNhjirzo','EADDABhP5PPPbBlAdX2hn56cVhCPXqtDMP0gvy5rVwR4jJEVw8MpF55gJBv9mMBq','/dashboard','2026-07-24 17:53:27.945','2026-07-24 17:43:27.996'),
('cmrz8bp880001mq012m0aq2q0','~rj0E5zOlaAcLf~j53kOxxe~O8Amf.--','MJdDbKiAOxwytovAqLj~2AQTQuAaKR0apXGXVx~M00_bMk_R0yNvtaC-RPMpnhKK','/dashboard','2026-07-24 17:53:52.177','2026-07-24 17:43:52.184'),
('cmrz8m4yk0000po01di6q1y9o','1CHmzx8yiXBssMYsNDpqZAwiMutuTrEP','akrz8CPZPt-LZt8Bmi7GysSz~.I0mWF_wX5diWtaaW1mjoj_Q5mVFo0OMjs9QDE~','/dashboard','2026-07-24 18:01:59.130','2026-07-24 17:51:59.132'),
('cmrz8m9yn0001po018m8omalw','HkZAXi5ad6ZQ5CX0QUuj4PFiyJlydajn','XypYJ28gdOCjw3a5.Wz85a1QEBZuBYo4qiMtbN1zdbREKG_6rXmxKVwsJIdj3WpC','/dashboard','2026-07-24 18:02:05.605','2026-07-24 17:52:05.615');
/*!40000 ALTER TABLE `ecitizen_pkce_states` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group_applications`
--

DROP TABLE IF EXISTS `group_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_applications` (
  `id` varchar(191) NOT NULL,
  `acknowledgmentNumber` varchar(191) NOT NULL,
  `status` enum('DRAFT','GROUP_SUBMITTED','INDIVIDUAL_IN_PROGRESS','SUBMITTED','UNDER_REVIEW','APPROVED','REJECTED') NOT NULL DEFAULT 'DRAFT',
  `phase` enum('GROUP','INDIVIDUAL') NOT NULL DEFAULT 'GROUP',
  `progress` int(11) NOT NULL DEFAULT 1,
  `submittedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `termsAccepted` tinyint(1) NOT NULL DEFAULT 0,
  `userId` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `group_applications_acknowledgmentNumber_key` (`acknowledgmentNumber`),
  KEY `group_applications_status_idx` (`status`),
  KEY `group_applications_acknowledgmentNumber_idx` (`acknowledgmentNumber`),
  KEY `group_applications_userId_idx` (`userId`),
  CONSTRAINT `group_applications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_applications`
--

LOCK TABLES `group_applications` WRITE;
/*!40000 ALTER TABLE `group_applications` DISABLE KEYS */;
INSERT INTO `group_applications` VALUES
('cmrnmmcx70000sz368z5ni2zy','UWZ-1784213449578','DRAFT','GROUP',1,NULL,'2026-07-16 14:50:49.963','2026-07-16 14:50:49.963',0,NULL),
('cmrnmoxv90000szatae0mr1he','UWZ-1784213570361','DRAFT','GROUP',1,NULL,'2026-07-16 14:52:50.422','2026-07-16 14:52:50.422',0,NULL),
('cmrnmuaup0001szatwrq7p40w','UWZ-1784213820519','DRAFT','GROUP',1,NULL,'2026-07-16 14:57:00.529','2026-07-16 14:57:00.529',0,NULL),
('cmrnnlgts0000szgjkf4zh6zm','UWZ-1784215087627','DRAFT','GROUP',1,NULL,'2026-07-16 15:18:07.985','2026-07-16 15:18:07.985',0,NULL),
('cmrnnzdep0000szasjlxlgakd','UWZ-1784215736724','DRAFT','GROUP',1,NULL,'2026-07-16 15:28:56.737','2026-07-16 15:28:56.737',0,NULL),
('cmrnogn1c0000szp5sas70z5s','UWZ-1784216542014','DRAFT','GROUP',1,NULL,'2026-07-16 15:42:22.368','2026-07-16 15:42:22.368',0,NULL),
('cmrnopp670000szg82s1fclhu','UWZ-1784216964801','DRAFT','GROUP',1,NULL,'2026-07-16 15:49:25.039','2026-07-16 15:49:25.039',0,NULL),
('cmrnox90p0000szl0v3uc6a0a','UWZ-1784217317301','DRAFT','GROUP',1,NULL,'2026-07-16 15:55:17.353','2026-07-16 15:55:17.353',0,NULL),
('cmrnoxoie0001szl0tthy03r8','UWZ-1784217337417','DRAFT','GROUP',1,NULL,'2026-07-16 15:55:37.430','2026-07-16 15:55:37.430',0,NULL),
('cmrnq1a700000sz4bkvke1aax','UWZ-1784219184988','DRAFT','GROUP',1,NULL,'2026-07-16 16:26:25.117','2026-07-16 16:26:25.117',0,NULL),
('cmrnq7hxl0000szoqwil7tsql','UWZ-1784219475047','DRAFT','GROUP',1,NULL,'2026-07-16 16:31:15.081','2026-07-16 16:31:15.081',0,NULL),
('cmrnq839j0001szoq35rpccwj','UWZ-1784219502686','DRAFT','GROUP',1,NULL,'2026-07-16 16:31:42.728','2026-07-16 16:31:42.728',0,NULL),
('cmrnq8j3k0000sz6mf4ur3wel','UWZ-1784219523123','DRAFT','GROUP',1,NULL,'2026-07-16 16:32:03.248','2026-07-16 16:32:03.248',0,NULL),
('cmrouqdde0000szah6uz4oejg','UWZ-1784287540131','DRAFT','GROUP',1,NULL,'2026-07-17 11:25:40.275','2026-07-17 11:25:40.275',0,NULL),
('cmrp8l44q0000szlcyv2cpozi','UWZ-1784310809491','DRAFT','GROUP',1,NULL,'2026-07-17 17:53:29.643','2026-07-17 17:53:29.643',0,NULL),
('cmrp8uwt20000szma5is0hxdy','UWZ-1784311266560','DRAFT','GROUP',1,NULL,'2026-07-17 18:01:06.710','2026-07-17 18:01:06.710',0,NULL),
('cmrp9163r0000szobde4dn8wc','UWZ-1784311558686','DRAFT','GROUP',4,NULL,'2026-07-17 18:05:58.696','2026-07-17 18:10:40.442',0,NULL),
('cmrp96tc70000szlmug913hit','UWZ-1784311821932','DRAFT','GROUP',1,NULL,'2026-07-17 18:10:22.087','2026-07-17 18:10:22.087',0,NULL),
('cmrp9bkhr0000szstgdn20da1','UWZ-1784312043793','DRAFT','GROUP',1,NULL,'2026-07-17 18:14:03.903','2026-07-17 18:14:03.903',0,NULL),
('cmrp9hudf0000szp4avs8yz06','UWZ-1784312336492','DRAFT','GROUP',1,NULL,'2026-07-17 18:18:56.644','2026-07-17 18:18:56.644',0,NULL),
('cmrp9nhm70000szavu1nlz9ml','UWZ-1784312599939','DRAFT','GROUP',1,NULL,'2026-07-17 18:23:20.047','2026-07-17 18:23:20.047',0,NULL),
('cmrp9w9oj0000szwnyoxjcui0','UWZ-1784313009628','DRAFT','GROUP',2,NULL,'2026-07-17 18:30:09.667','2026-07-17 18:30:44.272',0,NULL),
('cmrp9xxoe0000sz48i6zkm8wg','UWZ-1784313087285','DRAFT','GROUP',1,NULL,'2026-07-17 18:31:27.422','2026-07-17 18:31:27.422',0,NULL),
('cmrpa11ao0000szrhu2x9yuvk','UWZ-1784313231829','DRAFT','GROUP',1,NULL,'2026-07-17 18:33:52.080','2026-07-17 18:33:52.080',0,NULL),
('cmrpa1trw0000szvofc3zlmxw','UWZ-1784313268857','DRAFT','GROUP',1,NULL,'2026-07-17 18:34:28.989','2026-07-17 18:34:28.989',0,NULL),
('cmrpa3xfr0000szize2sto8ix','UWZ-1784313367006','GROUP_SUBMITTED','INDIVIDUAL',9,'2026-07-18 21:10:35.711','2026-07-17 18:36:07.048','2026-07-18 21:10:35.712',1,NULL),
('cmrpa61qm0000szq6mcnh0cui','UWZ-1784313465779','DRAFT','GROUP',1,NULL,'2026-07-17 18:37:45.934','2026-07-17 18:37:45.934',0,NULL),
('cmrpaayxz0000sz5dxfgj7qqx','UWZ-1784313695435','DRAFT','GROUP',1,NULL,'2026-07-17 18:41:35.591','2026-07-17 18:41:35.591',0,NULL),
('cmrpaeig80000szorofkei43f','UWZ-1784313860703','DRAFT','GROUP',1,NULL,'2026-07-17 18:44:20.840','2026-07-17 18:44:20.840',0,NULL),
('cmrqswx5h0000sz9bgyfue0d8','UWZ-1784405418827','DRAFT','GROUP',1,NULL,'2026-07-18 20:10:18.965','2026-07-18 20:10:18.965',0,NULL),
('cmrqttrkd0000szibzl48lu7f','UWZ-1784406951228','DRAFT','GROUP',1,NULL,'2026-07-18 20:35:51.373','2026-07-18 20:35:51.373',0,NULL),
('cmrqu5gf00000szc2u9p1xc3o','UWZ-1784407496652','DRAFT','GROUP',1,NULL,'2026-07-18 20:44:56.797','2026-07-18 20:44:56.797',0,NULL),
('cmrqukhjz0000szwgd3zrs1cr','UWZ-1784408197984','DRAFT','GROUP',1,NULL,'2026-07-18 20:56:38.112','2026-07-18 20:56:38.112',0,NULL),
('cmrqus1f70000szgoskqx9hly','UWZ-1784408550321','DRAFT','GROUP',1,NULL,'2026-07-18 21:02:30.451','2026-07-18 21:02:30.451',0,NULL),
('cmrqux79v0000szn14ngxs0p4','UWZ-1784408791240','DRAFT','GROUP',1,NULL,'2026-07-18 21:06:31.316','2026-07-18 21:06:31.316',0,NULL),
('cmrqv8sq70000szq6azpjozqe','UWZ-1784409332265','DRAFT','GROUP',1,NULL,'2026-07-18 21:15:32.336','2026-07-18 21:15:32.336',0,NULL),
('cmrrgfzrp0000sz3u0trvk29j','UWZ-1784444939813','DRAFT','GROUP',1,NULL,'2026-07-19 07:08:59.989','2026-07-19 07:08:59.989',0,NULL),
('cmrthgodb0000szn83leyxw2d','UWZ-1784567583641','DRAFT','GROUP',1,NULL,'2026-07-20 17:13:03.839','2026-07-20 17:13:03.839',0,NULL),
('cmrti9h990000szfkk52diy50','UWZ-1784568927538','DRAFT','GROUP',1,NULL,'2026-07-20 17:35:27.645','2026-07-20 17:35:27.645',0,NULL),
('cmrtiwzkk0000szxzafjpa738','UWZ-1784570024312','DRAFT','GROUP',1,NULL,'2026-07-20 17:53:44.469','2026-07-20 17:53:44.469',0,NULL),
('cmrtj9fpy0000sz1cr0zfs00m','UWZ-1784570605073','DRAFT','GROUP',1,NULL,'2026-07-20 18:03:25.271','2026-07-20 18:03:25.271',0,NULL),
('cmrtjt7jh0000szz8n0p8o6a2','UWZ-1784571527655','DRAFT','GROUP',1,NULL,'2026-07-20 18:18:47.789','2026-07-20 18:18:47.789',0,NULL),
('cmrtkdn670000szs0n00l7gzm','UWZ-1784572480956','DRAFT','GROUP',1,NULL,'2026-07-20 18:34:41.167','2026-07-20 18:34:41.167',0,NULL),
('cmrtl2v5z0000szl33mt1bnas','UWZ-1784573657788','DRAFT','GROUP',1,NULL,'2026-07-20 18:54:17.927','2026-07-20 18:54:17.927',0,NULL),
('cmrtlfuo20000sz010yss8998','UWZ-1784574263652','DRAFT','GROUP',1,NULL,'2026-07-20 19:04:23.810','2026-07-20 19:04:23.810',0,NULL),
('cmrtltuoy0000szw2t1qm34im','UWZ-1784574916871','DRAFT','GROUP',1,NULL,'2026-07-20 19:15:17.027','2026-07-20 19:15:17.027',0,NULL),
('cmru9fe720000sztl27abw27m','UWZ-1784614553077','DRAFT','GROUP',1,NULL,'2026-07-21 06:15:53.246','2026-07-21 06:15:53.246',0,NULL),
('cmruapc8n0000sz0w2xgwb9t7','UWZ-1784616696740','DRAFT','GROUP',1,NULL,'2026-07-21 06:51:36.887','2026-07-21 06:51:36.887',0,NULL),
('cmrufl6ml0000sz2t20dpxvy7','UWZ-1784624900852','DRAFT','GROUP',1,NULL,'2026-07-21 09:08:21.070','2026-07-21 09:08:21.070',0,NULL),
('cmrufn0bv0000szwmlikhqhyt','UWZ-1784624985961','DRAFT','GROUP',1,NULL,'2026-07-21 09:09:46.219','2026-07-21 09:09:46.219',0,NULL),
('cmrufyx1f0000sz7i7b1d5rlt','UWZ-1784625541641','DRAFT','GROUP',1,NULL,'2026-07-21 09:19:01.827','2026-07-21 09:19:01.827',0,NULL),
('cmrughvy10000szm7hzwsnd1w','UWZ-1784626426720','DRAFT','GROUP',1,NULL,'2026-07-21 09:33:46.873','2026-07-21 09:33:46.873',0,NULL),
('cmrugnncv0000szm9v4l3k819','UWZ-1784626695491','DRAFT','GROUP',1,NULL,'2026-07-21 09:38:15.679','2026-07-21 09:38:15.679',0,NULL),
('cmrvp6ipe0000o901kl6ct1kb','UWZ-1784701478953','DRAFT','GROUP',1,NULL,'2026-07-22 06:24:39.218','2026-07-22 06:24:39.218',0,NULL),
('cmrvp7hqd0001o901lhoy14p4','UWZ-1784701524607','DRAFT','GROUP',2,NULL,'2026-07-22 06:25:24.613','2026-07-22 06:29:34.553',0,NULL),
('cmrvpv01w000co901l26smlwv','UWZ-1784702621437','DRAFT','GROUP',1,NULL,'2026-07-22 06:43:41.444','2026-07-22 06:43:41.444',0,NULL),
('cmrvql8sa000do901w3ds36xe','UWZ-1784703845773','DRAFT','GROUP',1,NULL,'2026-07-22 07:04:05.818','2026-07-22 07:04:05.818',0,NULL),
('cmrvrv5t30001ru01m7hu0r80','UWZ-1784705988126','DRAFT','GROUP',9,NULL,'2026-07-22 07:39:48.135','2026-07-22 14:30:07.414',1,'cmrvrgm4o0003p60167xosy70'),
('cmrvsdh34000bok011o5uwsb9','UWZ-1784706842550','GROUP_SUBMITTED','INDIVIDUAL',9,'2026-07-22 16:43:22.232','2026-07-22 07:54:02.561','2026-07-22 16:43:22.233',1,'cmrvsaj8r0003ok016ep2tmwp'),
('cmrvyvf3i0005mt01ldfa9dq8','UWZ-1784717757484','GROUP_SUBMITTED','INDIVIDUAL',9,'2026-07-24 06:25:01.337','2026-07-22 10:55:57.487','2026-07-24 06:25:01.347',1,'cmrvyp2ua0001mt01dedwwcre'),
('cmrvz1bnc000bmt01d1iain7q','UWZ-1784718032946','DRAFT','GROUP',2,NULL,'2026-07-22 11:00:32.952','2026-07-24 05:58:52.787',0,'cmrvz17di0007mt012h55o8yo'),
('cmrxlh5v8000rpf01011t904y','UWZ-1784816189682','DRAFT','GROUP',4,NULL,'2026-07-23 14:16:29.684','2026-07-24 07:43:41.726',0,'cmrvsaj8r0003ok016ep2tmwp'),
('cmrxll0l0000xpf019go2mlvb','UWZ-1784816369458','GROUP_SUBMITTED','INDIVIDUAL',9,'2026-07-23 16:20:11.928','2026-07-23 14:19:29.460','2026-07-23 16:20:11.929',1,'cmrxlkxev000tpf011hc48bie'),
('cmryim5bh002omm01o46cjw3m','UWZ-1784871849566','DRAFT','GROUP',1,NULL,'2026-07-24 05:44:09.569','2026-07-24 05:44:09.569',0,'cmrxlkxev000tpf011hc48bie'),
('cmryj89k40035mm01rf9osa79','UWZ-1784872881490','DRAFT','GROUP',1,NULL,'2026-07-24 06:01:21.509','2026-07-24 06:01:21.509',0,'cmryj84uy0031mm016kxogdkx'),
('cmryjfcck003kmm01o4aye2qj','UWZ-1784873211700','DRAFT','GROUP',1,NULL,'2026-07-24 06:06:51.717','2026-07-24 06:06:51.717',0,'cmryjf8hs003gmm01nxmn88bw'),
('cmrynd2900005qh01s3ce5h4t','UWZ-1784879823776','DRAFT','GROUP',5,NULL,'2026-07-24 07:57:03.780','2026-07-24 08:32:57.007',0,'cmrynckat0001qh01c1wz9brr'),
('cmrzc1d5a0003k7017nmg1ryh','UWZ-1784921268425','DRAFT','GROUP',1,NULL,'2026-07-24 19:27:48.430','2026-07-24 19:27:48.430',0,'cmrzbz1160000tg013w1ofufd');
/*!40000 ALTER TABLE `group_applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group_background`
--

DROP TABLE IF EXISTS `group_background`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_background` (
  `id` varchar(191) NOT NULL,
  `applicationId` varchar(191) NOT NULL,
  `purpose` text NOT NULL,
  `proposedActivities` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `group_background_applicationId_key` (`applicationId`),
  CONSTRAINT `group_background_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `group_applications` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_background`
--

LOCK TABLES `group_background` WRITE;
/*!40000 ALTER TABLE `group_background` DISABLE KEYS */;
INSERT INTO `group_background` VALUES
('cmrp94rix0007szuf4y4ecwji','cmrp9163r0000szobde4dn8wc','Travelling abroad','Travelling'),
('cmrpa7y8c0003szasv0k23xus','cmrpa3xfr0000szize2sto8ix','Travelling abroad','Travelling'),
('cmrvwbv2e0005o101couz6t1r','cmrvrv5t30001ru01m7hu0r80','Travelling abroad','Travelling'),
('cmrw6xexi0009lc01evxoea61','cmrvsdh34000bok011o5uwsb9','Travelling abroad','Travelling'),
('cmrxb7dhg0005pf01wkp799uh','cmrvyvf3i0005mt01ldfa9dq8','Employment','Self employment'),
('cmrxm19pb0013pf01yjyc91gl','cmrxll0l0000xpf019go2mlvb','bee farming','selling honey'),
('cmrymvvd20005mr01e5piung4','cmrxlh5v8000rpf01011t904y','Travelling abroad','Travelling'),
('cmrynu4c6000bqh01o9zt4evs','cmrynd2900005qh01s3ce5h4t','To identify, pursue, and secure employment opportunities outside Kenya for the economic empowerment and improved livelihoods of its members','1. Identifying and applying for overseas job opportunities 2. Facilitating recruitment and placement of members in foreign employment markets 3. Processing travel documents, visas, and work permits 4. Providing members with information, training, and support related to overseas employment 5. Mobilizing resources to facilitate members\' relocation and settlement for employment abroad');
/*!40000 ALTER TABLE `group_background` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group_bank_accounts`
--

DROP TABLE IF EXISTS `group_bank_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_bank_accounts` (
  `id` varchar(191) NOT NULL,
  `applicationId` varchar(191) NOT NULL,
  `bankName` varchar(191) NOT NULL,
  `branchName` varchar(191) DEFAULT NULL,
  `accountName` varchar(191) NOT NULL,
  `accountNumber` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `group_bank_accounts_applicationId_key` (`applicationId`),
  CONSTRAINT `group_bank_accounts_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `group_applications` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_bank_accounts`
--

LOCK TABLES `group_bank_accounts` WRITE;
/*!40000 ALTER TABLE `group_bank_accounts` DISABLE KEYS */;
INSERT INTO `group_bank_accounts` VALUES
('cmrqv0s5n0007sz4zjzcvg5bq','cmrpa3xfr0000szize2sto8ix','Equity ','Meru','Lenga and Company Ltd','0110167890432'),
('cmrw6i5vz0001p101w4xs1ozi','cmrvrv5t30001ru01m7hu0r80','Equity Bank','Archers Post','Benedict and Brothers LTD','464664644646'),
('cmrw8uao1000dpa01jafk9nzi','cmrvsdh34000bok011o5uwsb9','Equity Bank','Bungoma','Benedict and Brothers LTD','6160090065663'),
('cmrxmwep2000jof01grb123lr','cmrxll0l0000xpf019go2mlvb','Family Bank','Kayole Branch','ashley','063489'),
('cmryjtbuy0041mm015w0e5g6y','cmrvyvf3i0005mt01ldfa9dq8','KCB Bank','Buruburu','test group','1234567890');
/*!40000 ALTER TABLE `group_bank_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group_data`
--

DROP TABLE IF EXISTS `group_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_data` (
  `id` varchar(191) NOT NULL,
  `applicationId` varchar(191) NOT NULL,
  `groupName` varchar(191) NOT NULL,
  `registrationDate` datetime(3) DEFAULT NULL,
  `registrationNumber` varchar(191) NOT NULL,
  `county` varchar(191) NOT NULL,
  `constituency` varchar(191) NOT NULL,
  `ward` varchar(191) NOT NULL,
  `location` varchar(191) DEFAULT NULL,
  `subLocation` varchar(191) DEFAULT NULL,
  `clusterCategory` varchar(191) DEFAULT NULL,
  `clusterCounty` varchar(191) DEFAULT NULL,
  `clusterConstituency` varchar(191) DEFAULT NULL,
  `destinationRegion` varchar(191) DEFAULT NULL,
  `destinationCountry` varchar(191) DEFAULT NULL,
  `agency` varchar(191) DEFAULT NULL,
  `agentNumber` varchar(191) DEFAULT NULL,
  `localAgentName` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `clusterOther` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `group_data_applicationId_key` (`applicationId`),
  CONSTRAINT `group_data_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `group_applications` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_data`
--

LOCK TABLES `group_data` WRITE;
/*!40000 ALTER TABLE `group_data` DISABLE KEYS */;
INSERT INTO `group_data` VALUES
('cmrp93tbh0001szufax02tgm0','cmrp9163r0000szobde4dn8wc','Big 55','2026-07-14 00:00:00.000','RA-6790','Baringo','BARINGO CENTRAL','Kabarnet','','',NULL,NULL,NULL,NULL,'Saudi Arabia','Palma','REA-7888383','PALMA RECRUITING AGENT LTD','2026-07-17 18:08:02.093','2026-07-17 18:08:54.051',NULL),
('cmrp9x0ca0002szwnp8hwmgxm','cmrp9w9oj0000szwnyoxjcui0','Lenga and Company','2026-07-15 00:00:00.000','RA-6790','Baringo','BARINGO CENTRAL','Kabarnet','','',NULL,NULL,NULL,NULL,'Saudi Arabia','Palma','RA/2024/04/6','PALMA RECRUITING AGENT LTD','2026-07-17 18:30:44.219','2026-07-17 18:30:44.219',NULL),
('cmrpa4rcd0002szizr4mjacif','cmrpa3xfr0000szize2sto8ix','Lenga and Company','2026-07-15 00:00:00.000','RA-6790','Baringo','BARINGO CENTRAL','Tenges','','',NULL,NULL,NULL,NULL,'Saudi Arabia','Palma','RA/2024/04/8','PALMA RECRUITING AGENT LTD','2026-07-17 18:36:45.805','2026-07-17 18:36:45.805',NULL),
('cmrvp9mdg0003o901mezehnkr','cmrvp7hqd0001o901lhoy14p4','Halleluyah','2026-07-03 00:00:00.000','H1','Machakos','KATHIANI','Upper Kaewa/iveti','Iveti','Kilimani',NULL,NULL,NULL,NULL,'Russia','SALSABIL RECRUITING AGENCY','RA/2025/06/3','SALSABIL RECRUITING AGENCY','2026-07-22 06:27:03.940','2026-07-22 06:29:34.550',NULL),
('cmrvwb9d90001o101durosjo7','cmrvrv5t30001ru01m7hu0r80','Benedict And Brother Ltd','2026-06-30 00:00:00.000','RA-6790','Isiolo','ISIOLO SOUTH','Garbatulla',NULL,NULL,'agency',NULL,NULL,NULL,NULL,'RECRUITCARE LIMITED','RA/2022/09/36','RECRUITCARE LIMITED','2026-07-22 09:44:17.709','2026-07-22 09:44:17.709',NULL),
('cmrw6wh8g0005lc01cpa7fx0q','cmrvsdh34000bok011o5uwsb9','Benedict And Brother Ltd','2026-06-29 00:00:00.000','RA-6790','Isiolo','ISIOLO SOUTH','Garbatulla',NULL,NULL,'agency',NULL,NULL,NULL,NULL,'RECRUITCARE LIMITED','RA/2022/09/36','RECRUITCARE LIMITED','2026-07-22 14:40:43.840','2026-07-22 14:40:43.840',NULL),
('cmrx3hnl50001pf01fq0qbp09','cmrvyvf3i0005mt01ldfa9dq8','Test Group','2025-09-01 00:00:00.000','RA-23456','Bungoma','SIRISIA','Lwandanyi','Lwandanyi','Lwandanyi','agency',NULL,NULL,NULL,NULL,'World Solidarity Recruitment Limited','RA/2023/11/23','World Solidarity Recruitment Limited','2026-07-23 05:52:59.558','2026-07-24 06:05:08.140',NULL),
('cmrxm062n000zpf013eb689pb','cmrxll0l0000xpf019go2mlvb','Bidii SHG','2025-09-01 00:00:00.000','RA-bidii','Machakos','KATHIANI','Upper Kaewa/iveti','Kaani','Kitunduni','geographical','Machakos',NULL,NULL,NULL,NULL,NULL,NULL,'2026-07-23 14:31:16.413','2026-07-23 14:50:47.220',NULL),
('cmrxq4jsw000bmm01so1gtrzz','cmrxlh5v8000rpf01011t904y','CHEPKUMIA WAITRESS GROUP','2025-09-01 00:00:00.000','RA-NNSRDM','Bomet','BOMET EAST','Kembu',NULL,NULL,'destination',NULL,NULL,'Asia','Macao',NULL,NULL,NULL,'2026-07-23 16:26:39.293','2026-07-24 07:41:53.836',NULL),
('cmryj52sr0030mm01ymsnizvf','cmrvz1bnc000bmt01d1iain7q','thank go','2025-06-24 00:00:00.000','RA-27827s','Nairobi City','EMBAKASI WEST','Umoja I','Mulolongo','Kasinga','destination',NULL,NULL,'Europe','Montenegro',NULL,NULL,NULL,'2026-07-24 05:58:52.779','2026-07-24 05:58:52.779',NULL),
('cmryngq680007qh012uqt0yux','cmrynd2900005qh01s3ce5h4t','MUALE FARMERS GROUP','2026-06-16 00:00:00.000','WYG-5NC6A6','Kajiado','KAJIADO NORTH','Oloolua','Ngong','Embulmbul','destination',NULL,NULL,'Europe','Russia',NULL,NULL,NULL,'2026-07-24 07:59:54.752','2026-07-24 07:59:54.752',NULL);
/*!40000 ALTER TABLE `group_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group_members`
--

DROP TABLE IF EXISTS `group_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_members` (
  `id` varchar(191) NOT NULL,
  `applicationId` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `idNo` varchar(191) NOT NULL,
  `gender` varchar(191) DEFAULT NULL,
  `dob` datetime(3) DEFAULT NULL,
  `passportNo` varchar(191) DEFAULT NULL,
  `kraPin` varchar(191) DEFAULT NULL,
  `educationLevel` varchar(191) DEFAULT NULL,
  `poBox` varchar(191) DEFAULT NULL,
  `postalCode` varchar(191) DEFAULT NULL,
  `town` varchar(191) DEFAULT NULL,
  `dependants` int(11) DEFAULT NULL,
  `mobile` varchar(191) NOT NULL,
  `email` varchar(191) DEFAULT NULL,
  `subLocation` varchar(191) DEFAULT NULL,
  `purpose` varchar(191) DEFAULT NULL,
  `amount` decimal(12,2) DEFAULT NULL,
  `loanStatus` enum('PENDING','INDIVIDUAL_DRAFT','INDIVIDUAL_SUBMITTED','DISBURSED') NOT NULL DEFAULT 'PENDING',
  `signature` text DEFAULT NULL,
  `amountRepaid` decimal(12,2) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `otpCode` varchar(191) DEFAULT NULL,
  `otpStatus` enum('PENDING','SENT','VERIFIED','EXPIRED') NOT NULL DEFAULT 'PENDING',
  `otpVerified` tinyint(1) NOT NULL DEFAULT 0,
  `otpSentAt` datetime(3) DEFAULT NULL,
  `otpVerifiedAt` datetime(3) DEFAULT NULL,
  `consentAmount` decimal(12,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `group_members_applicationId_idNo_key` (`applicationId`,`idNo`),
  KEY `group_members_applicationId_idx` (`applicationId`),
  KEY `group_members_idNo_idx` (`idNo`),
  CONSTRAINT `group_members_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `group_applications` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_members`
--

LOCK TABLES `group_members` WRITE;
/*!40000 ALTER TABLE `group_members` DISABLE KEYS */;
INSERT INTO `group_members` VALUES
('cmrquync30001sz4zt27vlkpb','cmrpa3xfr0000szize2sto8ix','Bdgfdfgdfgdfgdfgdfgf','11111111','Male',NULL,'AK7846664','A004634461X','KCPE','490','20300','Nyahururu',9,'0711111111','gedion.njrg@gmail.com',NULL,'Travelling',900000.00,'INDIVIDUAL_SUBMITTED','signed',900000.00,'2026-07-18 21:07:38.787','2026-07-21 10:34:49.750',NULL,'PENDING',0,NULL,NULL,NULL),
('cmrquync60003sz4z8ulxhvwd','cmrpa3xfr0000szize2sto8ix','Cfgfgfgfgfgfgf','22222222',NULL,NULL,'AK7846664',NULL,NULL,NULL,NULL,NULL,NULL,'0722222222','gedion.njrg@gmail.com',NULL,'Cooking',100000.00,'PENDING','accepted',100000.00,'2026-07-18 21:07:38.790','2026-07-18 21:10:20.234',NULL,'PENDING',0,NULL,NULL,NULL),
('cmrquync80005sz4zw1l7gwyn','cmrpa3xfr0000szize2sto8ix','Agfgfgfgfgf','26447696',NULL,NULL,'AK7846664',NULL,NULL,NULL,NULL,NULL,NULL,'0720501239','a@b.com',NULL,'Eating',200000.00,'PENDING','accepted',200000.00,'2026-07-18 21:07:38.792','2026-07-18 21:10:20.237',NULL,'PENDING',0,NULL,NULL,NULL),
('cmrvxxely000djz01waf26hmp','cmrvrv5t30001ru01m7hu0r80','Gedion Njoroge','22222222',NULL,NULL,'AK7846664',NULL,NULL,NULL,NULL,NULL,NULL,'0720501239','gedion.njrg@gmail.com',NULL,'Cooking',166667.00,'PENDING','accepted',166667.00,'2026-07-22 10:29:30.551','2026-07-22 14:30:07.402',NULL,'VERIFIED',1,'2026-07-22 14:08:31.771','2026-07-22 14:09:15.463',166667.00),
('cmrvxxen0000fjz01igvsuhoh','cmrvrv5t30001ru01m7hu0r80','Gedion Njoroge','26447696',NULL,NULL,'AK7846664',NULL,NULL,NULL,NULL,NULL,NULL,'0720501239','gedion.njrg@gmail.com',NULL,'Travelling',166666.00,'PENDING','accepted',166666.00,'2026-07-22 10:29:30.588','2026-07-22 14:30:07.407',NULL,'VERIFIED',1,'2026-07-22 14:09:22.106','2026-07-22 14:09:35.946',166666.00),
('cmrvxxen1000hjz019gn6lhhg','cmrvrv5t30001ru01m7hu0r80','Gedion Njoroge','67222222',NULL,NULL,'AK7846664',NULL,NULL,NULL,NULL,NULL,NULL,'0720501239','gedion.njrg@gmail.com',NULL,'Eating',166667.00,'PENDING','accepted',166667.00,'2026-07-22 10:29:30.590','2026-07-22 14:30:07.410',NULL,'VERIFIED',1,'2026-07-22 14:09:40.149','2026-07-22 14:09:53.650',166667.00),
('cmrw8mtl10001pa011wfii964','cmrvsdh34000bok011o5uwsb9','Gedion Njoroge','26447696','Male','1998-06-09 00:00:00.000','AK7846664','A004634461X','Home education','490','20300','Nyahururu',9,'0720501239','gedion.njrg@gmail.com',NULL,'Travelling',160000.00,'INDIVIDUAL_SUBMITTED','signed',NULL,'2026-07-22 15:29:12.517','2026-07-22 17:31:30.312',NULL,'VERIFIED',1,'2026-07-22 15:29:45.741','2026-07-22 15:30:38.107',160000.00),
('cmrw8mtmm0003pa01ru8s9lcb','cmrvsdh34000bok011o5uwsb9','Samuel Muli','26447699','Male','2007-02-02 00:00:00.000','AK7846664','A004634461X','KCPE','490','00100','Nairobi',9,'0720501239','gedion.njrg@gmail.com',NULL,'Cooking',166666.00,'INDIVIDUAL_SUBMITTED','signed',NULL,'2026-07-22 15:29:12.574','2026-07-22 18:05:32.818',NULL,'VERIFIED',1,'2026-07-22 15:30:21.855','2026-07-22 15:30:33.153',166666.00),
('cmrw8mtms0005pa0139muv73b','cmrvsdh34000bok011o5uwsb9','Philex Fundia','67222222','Male','2026-07-23 00:00:00.000','AK7846664','A004634461X','KCSE','490','20300','Nyahururu',7,'0720501239','gedion.njrg@gmail.com',NULL,'Eating',150000.00,'INDIVIDUAL_SUBMITTED','signed',NULL,'2026-07-22 15:29:12.581','2026-07-22 17:48:53.490',NULL,'VERIFIED',1,'2026-07-22 15:30:50.662','2026-07-22 15:31:44.599',150000.00),
('cmrxmtonm0007of01qs7va3qx','cmrxll0l0000xpf019go2mlvb','Samuel Mumo','11111111','Male','1993-07-21 00:00:00.000','p1','A2625253','University','899','90100','Nairobi',4,'0706026689','mumosamuel2018@gmail.com',NULL,'bee farming',100000.00,'INDIVIDUAL_SUBMITTED','signed',NULL,'2026-07-23 14:54:13.522','2026-07-23 16:37:16.545',NULL,'VERIFIED',1,'2026-07-23 14:54:22.561','2026-07-23 14:55:14.755',100000.00),
('cmrxmtonq0009of01f4qua1k5','cmrxll0l0000xpf019go2mlvb','Ashley','22222222','Female','2000-07-23 00:00:00.000','p2','','College','','','',0,'0708409919','qqqq2018@gmail.com',NULL,'bee farming',149999.00,'INDIVIDUAL_SUBMITTED','signed',NULL,'2026-07-23 14:54:13.527','2026-07-23 16:40:33.580',NULL,'VERIFIED',1,'2026-07-23 14:54:25.227','2026-07-23 14:55:24.319',149999.00),
('cmrxmtonu000bof01dkg89zqa','cmrxll0l0000xpf019go2mlvb','veronicah kimani','33333333','Female','1994-07-15 00:00:00.000','p3','A57373','KCSE','544','5858','Kericho',2,'0706026689','aaa2018@gmail.com',NULL,'bee farming',150000.00,'INDIVIDUAL_SUBMITTED','signed',NULL,'2026-07-23 14:54:13.530','2026-07-23 16:45:36.760',NULL,'VERIFIED',1,'2026-07-23 14:54:28.287','2026-07-23 14:55:12.453',150000.00),
('cmryjiftr003mmm0146ca4ivk','cmrvyvf3i0005mt01ldfa9dq8','CHEPKEMBOI JACKLINE','31757880','Female','1996-10-11 00:00:00.000','123456','1234567890','KCSE','00100','00100-40300','Nairobi',0,'0706721223','ayooveroaloo@gmail.com',NULL,'Self Employment',166000.00,'INDIVIDUAL_SUBMITTED','signed',NULL,'2026-07-24 06:09:16.191','2026-07-24 06:49:37.819',NULL,'VERIFIED',1,'2026-07-24 06:09:30.001','2026-07-24 06:10:29.341',166000.00),
('cmryjiftw003omm01t4vyfh6j','cmrvyvf3i0005mt01ldfa9dq8','DORIS CHEPKORIR','37018798','Male','1992-07-24 00:00:00.000','33456789','A6888','None','66','60000','Kericho',2,'0706026689','doris@gmail.com',NULL,'self employment',166000.00,'INDIVIDUAL_SUBMITTED','signed',NULL,'2026-07-24 06:09:16.197','2026-07-24 06:46:41.999',NULL,'VERIFIED',1,'2026-07-24 06:09:40.895','2026-07-24 06:10:46.563',166000.00),
('cmryjifua003qmm0138h4zjzw','cmrvyvf3i0005mt01ldfa9dq8','EDWIN KIPCHIRCHIR','41826151','Male','2002-06-12 00:00:00.000','3456789','A016038857C','KCPE','104825','90137','Kibwezi',5,'0703530884','edwin@gmail.com',NULL,'self employment',166000.00,'INDIVIDUAL_SUBMITTED','signed',NULL,'2026-07-24 06:09:16.211','2026-07-24 06:49:28.270',NULL,'VERIFIED',1,'2026-07-24 06:11:01.214','2026-07-24 06:12:10.582',166000.00),
('cmryon7of000lqh01ggzwb688','cmrynd2900005qh01s3ce5h4t','MUSA MULAA MUTIMBA','26638666',NULL,NULL,'CK244570',NULL,NULL,NULL,NULL,NULL,NULL,'0703530884','mosesmulla@gmail.com',NULL,'Air ticket, visa processing, and upkeep',166000.00,'PENDING',NULL,NULL,'2026-07-24 08:32:56.991','2026-07-24 08:32:56.991',NULL,'PENDING',0,NULL,NULL,NULL),
('cmryon7oh000nqh01zbxbx2xo','cmrynd2900005qh01s3ce5h4t','ALFRED KIPCHUMBA BETT','32647995',NULL,NULL,'BK1072525',NULL,NULL,NULL,NULL,NULL,NULL,'+254748718067','alfredbett68@gmail.com',NULL,'Air ticket, visa processing, and upkeep',166000.00,'PENDING',NULL,NULL,'2026-07-24 08:32:56.993','2026-07-24 08:32:56.993',NULL,'PENDING',0,NULL,NULL,NULL),
('cmryon7oj000pqh01kyromd15','cmrynd2900005qh01s3ce5h4t','EZRA KIPKOECH','38704902',NULL,NULL,'BK1124777',NULL,NULL,NULL,NULL,NULL,NULL,'+254707690530','kipkoechezra915@gmail.com',NULL,'Air ticket, visa processing, and upkeep',166000.00,'PENDING',NULL,NULL,'2026-07-24 08:32:56.995','2026-07-24 08:32:56.995',NULL,'PENDING',0,NULL,NULL,NULL);
/*!40000 ALTER TABLE `group_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `group_membership`
--

DROP TABLE IF EXISTS `group_membership`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `group_membership` (
  `id` varchar(191) NOT NULL,
  `applicationId` varchar(191) NOT NULL,
  `totalMales` int(11) NOT NULL DEFAULT 0,
  `totalFemales` int(11) NOT NULL DEFAULT 0,
  `totalDisabledMales` int(11) NOT NULL DEFAULT 0,
  `totalDisabledFemales` int(11) NOT NULL DEFAULT 0,
  `totalMembers` int(11) NOT NULL DEFAULT 0,
  `totalDisabled` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `group_membership_applicationId_key` (`applicationId`),
  CONSTRAINT `group_membership_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `group_applications` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `group_membership`
--

LOCK TABLES `group_membership` WRITE;
/*!40000 ALTER TABLE `group_membership` DISABLE KEYS */;
INSERT INTO `group_membership` VALUES
('cmrp945z30003szufeh2ggajv','cmrp9163r0000szobde4dn8wc',2,1,0,0,3,0),
('cmrpa4xk10004szizzm9jn562','cmrpa3xfr0000szize2sto8ix',3,0,0,0,3,0),
('cmrvpb53r0009o9013mdyibt2','cmrvp7hqd0001o901lhoy14p4',3,0,0,0,3,0),
('cmrvwbq0u0003o101ygqi1n3q','cmrvrv5t30001ru01m7hu0r80',3,0,0,0,3,0),
('cmrw6wnt40007lc01voik6t6g','cmrvsdh34000bok011o5uwsb9',3,0,0,0,3,0),
('cmrx3wrvu0003pf01uhq17b61','cmrvyvf3i0005mt01ldfa9dq8',1,2,0,0,3,0),
('cmrxm0nxh0011pf01bc49vr29','cmrxll0l0000xpf019go2mlvb',3,0,0,0,3,0),
('cmrymvp900003mr01vb2mut8v','cmrxlh5v8000rpf01011t904y',3,2,0,0,5,0),
('cmrynh8uv0009qh017si1lm90','cmrynd2900005qh01s3ce5h4t',3,0,0,0,3,0);
/*!40000 ALTER TABLE `group_membership` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guarantor_data`
--

DROP TABLE IF EXISTS `guarantor_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `guarantor_data` (
  `id` varchar(191) NOT NULL,
  `applicationId` varchar(191) NOT NULL,
  `guarantorNumber` int(11) NOT NULL,
  `name` varchar(191) NOT NULL,
  `gender` varchar(191) NOT NULL,
  `kraPin` varchar(191) NOT NULL,
  `county` varchar(191) NOT NULL,
  `constituency` varchar(191) NOT NULL,
  `ward` varchar(191) NOT NULL,
  `location` varchar(191) DEFAULT NULL,
  `subLocation` varchar(191) DEFAULT NULL,
  `nationalId` varchar(191) NOT NULL,
  `phone` varchar(191) NOT NULL,
  `otpCode` varchar(191) DEFAULT NULL,
  `otpStatus` enum('PENDING','SENT','VERIFIED','EXPIRED') NOT NULL DEFAULT 'PENDING',
  `otpVerified` tinyint(1) NOT NULL DEFAULT 0,
  `otpSentAt` datetime(3) DEFAULT NULL,
  `otpVerifiedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `guarantor_data_applicationId_guarantorNumber_key` (`applicationId`,`guarantorNumber`),
  KEY `guarantor_data_applicationId_idx` (`applicationId`),
  CONSTRAINT `guarantor_data_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `individual_applications` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guarantor_data`
--

LOCK TABLES `guarantor_data` WRITE;
/*!40000 ALTER TABLE `guarantor_data` DISABLE KEYS */;
INSERT INTO `guarantor_data` VALUES
('cmrtizwul0001szj3mekzt91q','cmrqv44b70009sz4zqcexj0i2',1,'Gedion Njoroge','Male','AK8999888798','Baringo','ELDAMA RAVINE','Koibatek',NULL,NULL,'26447696','254720501239',NULL,'VERIFIED',1,'2026-07-20 18:20:47.215','2026-07-20 18:21:55.298','2026-07-20 17:56:00.909','2026-07-21 09:55:12.466'),
('cmrtjxu6b0003szj3ef2bjehe','cmrqv44b70009sz4zqcexj0i2',2,'Gedion Njoroge','Male','B6777777777','Bomet','BOMET EAST','Kembu',NULL,NULL,'26447696','254720501239',NULL,'VERIFIED',1,'2026-07-20 18:22:23.754','2026-07-20 18:22:54.493','2026-07-20 18:22:23.747','2026-07-21 09:55:12.471'),
('cmrwcscwu0003ru01e57w2n5m','cmrwbl9lx000rs601s101xv8i',1,'Gedion Njoroge','Male','AK8999888798','Isiolo','ISIOLO SOUTH','Garbatulla',NULL,NULL,'26447696','254720501239',NULL,'VERIFIED',1,'2026-07-22 17:25:29.341','2026-07-22 17:25:56.706','2026-07-22 17:25:29.310','2026-07-22 17:26:37.768'),
('cmrwctc780005ru01my6e0p10','cmrwbl9lx000rs601s101xv8i',2,'Gedion Njoroge','Male','B6777777777','Homa Bay','HOMA BAY TOWN','Homa Bay Arujo',NULL,NULL,'26447696','254720501239',NULL,'VERIFIED',1,'2026-07-22 17:26:15.058','2026-07-22 17:26:33.815','2026-07-22 17:26:15.036','2026-07-22 17:26:37.783'),
('cmrwdg5ki0005s201wjcho4u0','cmrwd2knx0001s201jre4f6lx',1,'Gedion Njoroge','Male','AK8999888798','Elgeyo/Marakwet','KEIYO NORTH','Kamariny',NULL,NULL,'26447696','254720501239',NULL,'VERIFIED',1,'2026-07-22 17:43:59.590','2026-07-22 17:45:05.885','2026-07-22 17:43:59.538','2026-07-22 17:45:31.282'),
('cmrwdhrra0007s201aqcdmjog','cmrwd2knx0001s201jre4f6lx',2,'Gedion Njoroge','Male','B6777777777','Bungoma','KANDUYI','Musikoma',NULL,NULL,'26447696','254720501239',NULL,'VERIFIED',1,'2026-07-22 17:45:14.960','2026-07-22 17:45:28.775','2026-07-22 17:45:14.950','2026-07-22 17:45:31.302'),
('cmrwe0gl6000dte011pa8syn3','cmrwdx3e90009te01415ct2t1',1,'Gedion Njoroge','Male','AK8999888798','Garissa','DADAAB','Liboi',NULL,NULL,'26447696','254720501239',NULL,'VERIFIED',1,'2026-07-22 17:59:46.969','2026-07-22 18:01:34.124','2026-07-22 17:59:46.938','2026-07-22 18:03:28.589'),
('cmrwe35mw000fte01dsghpia1','cmrwdx3e90009te01415ct2t1',2,'Gedion Njoroge','Male','B6777777777','Bungoma','KABUCHAI','Kabuchai/chwele',NULL,NULL,'26447696','254720501239',NULL,'VERIFIED',1,'2026-07-22 18:02:50.033','2026-07-22 18:03:26.800','2026-07-22 18:01:52.713','2026-07-22 18:03:28.593'),
('cmrxqa200000lmm01a4bw1ney','cmrxpw8xp0001mm01vrjt7arg',1,'Muli mwilu','Male','A262733','Machakos','KATHIANI','Lower Kaewa/kaani','Kaani','Kaani','444444','254706026689',NULL,'VERIFIED',1,'2026-07-23 16:30:56.172','2026-07-23 16:31:53.758','2026-07-23 16:30:56.160','2026-07-23 16:32:52.206'),
('cmrxqbv3k000pmm01nocoq9cq','cmrxpw8y60003mm01oyokwfig',1,'Nas eddy','Female','Ao124567g','Nairobi City','EMBAKASI EAST','Mihango',NULL,NULL,'4444444','254708409919',NULL,'VERIFIED',1,'2026-07-23 16:32:20.545','2026-07-23 16:33:08.505','2026-07-23 16:32:20.529','2026-07-23 16:34:24.640'),
('cmrxqc580000rmm01578o2wzm','cmrxpw8xp0001mm01vrjt7arg',2,'Susan waweru','Female','A22673','Embu','MBEERE SOUTH','Mavuria','Keaa','Uswoi','33333','254706026689',NULL,'VERIFIED',1,'2026-07-23 16:32:33.651','2026-07-23 16:32:50.329','2026-07-23 16:32:33.648','2026-07-23 16:32:52.210'),
('cmrxqdzcc000zmm01ahwljmig','cmrxpw8y60003mm01oyokwfig',2,'Ashley','Female','A345678f','Nairobi City','EMBAKASI EAST','Utawala',NULL,NULL,'55555','254708409919',NULL,'VERIFIED',1,'2026-07-23 16:33:59.349','2026-07-23 16:34:19.227','2026-07-23 16:33:59.340','2026-07-23 16:34:24.645'),
('cmrxqm22e001xmm01qhziqeaq','cmrxpw8yk0005mm01igiz87jg',1,'Veronicah waweru','Female','A3773373','Embu','MBEERE SOUTH','Makima','Kalulu','Hudei','555666','254706026689',NULL,'VERIFIED',1,'2026-07-23 16:40:16.124','2026-07-23 16:40:34.033','2026-07-23 16:40:16.118','2026-07-23 16:41:54.451'),
('cmrxqnmxc0023mm01td76tp8m','cmrxpw8yk0005mm01igiz87jg',2,'Kioko mulasa','Male','A47474','Garissa','IJARA','Masalani','Gusaa','Buloi','463663','254706026689',NULL,'VERIFIED',1,'2026-07-23 16:41:29.820','2026-07-23 16:41:51.003','2026-07-23 16:41:29.808','2026-07-23 16:41:54.455'),
('cmrykejji0055mm01s82trank','cmryk2p77004vmm01b8howvu7',1,'Kelele','Male','H677888','Isiolo','ISIOLO SOUTH','Kinna','Tuu','Tuu','6787','254706026689',NULL,'VERIFIED',1,'2026-07-24 06:34:14.026','2026-07-24 06:34:31.254','2026-07-24 06:34:13.998','2026-07-24 06:35:35.144'),
('cmrykfo9w0057mm01kzu66yzo','cmryk2p77004vmm01b8howvu7',2,'Mingi','Male','H677777','Uasin Gishu','SOY','Segero/barsombe','Sombe','Sombe','6784','254706026689',NULL,'VERIFIED',1,'2026-07-24 06:35:06.792','2026-07-24 06:35:31.100','2026-07-24 06:35:06.788','2026-07-24 06:35:35.149'),
('cmrykjx9c005hmm017y5rvyqa','cmryk2p8j004xmm013223q5kq',1,'PHILEX FUNDIA','Female','367482782','Busia','FUNYULA','Namboboto Nambuku','gtjvh','uikkj','67467829','254703530884',NULL,'VERIFIED',1,'2026-07-24 06:38:25.061','2026-07-24 06:39:36.689','2026-07-24 06:38:25.054','2026-07-24 06:41:18.627'),
('cmrykk7xi005lmm01fjsbwgi0','cmryk2p5p004tmm01n52btn8a',1,'Aloo','Female','456789','Bungoma','BUMULA','Khasoko','bumula','bumula','12345','254706721223',NULL,'VERIFIED',1,'2026-07-24 06:38:38.891','2026-07-24 06:39:35.024','2026-07-24 06:38:38.886','2026-07-24 06:41:00.191'),
('cmrykmp6l005nmm01wundyugk','cmryk2p5p004tmm01n52btn8a',2,'Awino','Female','567890','Elgeyo/Marakwet','KEIYO SOUTH','Kaptarakwa','Bumula','bumula','8678956','254706721223',NULL,'VERIFIED',1,'2026-07-24 06:40:34.561','2026-07-24 06:40:56.457','2026-07-24 06:40:34.557','2026-07-24 06:41:00.200'),
('cmrykmz13005pmm01qyuvhefj','cmryk2p8j004xmm013223q5kq',2,'PHILEX FUNDIA','Male','37848272','Bungoma','KABUCHAI','Bwake/luuya','uytug','jkuhjvg','27892811','254703530884',NULL,'VERIFIED',1,'2026-07-24 06:40:47.324','2026-07-24 06:41:13.976','2026-07-24 06:40:47.319','2026-07-24 06:41:18.636');
/*!40000 ALTER TABLE `guarantor_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `individual_applications`
--

DROP TABLE IF EXISTS `individual_applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `individual_applications` (
  `id` varchar(191) NOT NULL,
  `memberId` varchar(191) NOT NULL,
  `acknowledgmentNumber` varchar(191) NOT NULL,
  `status` enum('DRAFT','GROUP_SUBMITTED','INDIVIDUAL_IN_PROGRESS','SUBMITTED','UNDER_REVIEW','APPROVED','REJECTED') NOT NULL DEFAULT 'DRAFT',
  `progress` int(11) NOT NULL DEFAULT 1,
  `submittedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `tripartiteAccepted` tinyint(1) NOT NULL DEFAULT 0,
  `awardAmount` decimal(12,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `individual_applications_memberId_key` (`memberId`),
  UNIQUE KEY `individual_applications_acknowledgmentNumber_key` (`acknowledgmentNumber`),
  KEY `individual_applications_acknowledgmentNumber_idx` (`acknowledgmentNumber`),
  CONSTRAINT `individual_applications_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `group_members` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `individual_applications`
--

LOCK TABLES `individual_applications` WRITE;
/*!40000 ALTER TABLE `individual_applications` DISABLE KEYS */;
INSERT INTO `individual_applications` VALUES
('cmrqv44b70009sz4zqcexj0i2','cmrquync30001sz4zt27vlkpb','UWZ-1784313367006-11111111','SUBMITTED',9,'2026-07-21 10:34:49.743','2026-07-18 21:11:54.068','2026-07-21 10:34:49.744',1,270000.00),
('cmrwbl9lx000rs601s101xv8i','cmrw8mtl10001pa011wfii964','UWZ-1784706842550-26447696','SUBMITTED',9,'2026-07-22 17:31:30.261','2026-07-22 16:51:58.822','2026-07-22 17:31:30.262',1,145000.00),
('cmrwd2knx0001s201jre4f6lx','cmrw8mtms0005pa0139muv73b','UWZ-1784706842550-67222222','SUBMITTED',9,'2026-07-22 17:48:53.476','2026-07-22 17:33:25.917','2026-07-22 17:48:53.477',1,145000.00),
('cmrwdx3e90009te01415ct2t1','cmrw8mtmm0003pa01ru8s9lcb','UWZ-1784706842550-26447699','SUBMITTED',9,'2026-07-22 18:05:32.801','2026-07-22 17:57:09.874','2026-07-22 18:05:32.802',1,120700.00),
('cmrxpw8xp0001mm01vrjt7arg','cmrxmtonm0007of01qs7va3qx','UWZ-1784816369458-11111111','SUBMITTED',9,'2026-07-23 16:37:16.540','2026-07-23 16:20:11.966','2026-07-23 16:37:16.541',1,100000.00),
('cmrxpw8y60003mm01oyokwfig','cmrxmtonq0009of01f4qua1k5','UWZ-1784816369458-22222222','SUBMITTED',9,'2026-07-23 16:40:33.572','2026-07-23 16:20:11.983','2026-07-23 16:40:33.573',1,100000.00),
('cmrxpw8yk0005mm01igiz87jg','cmrxmtonu000bof01dkg89zqa','UWZ-1784816369458-33333333','SUBMITTED',9,'2026-07-23 16:45:36.754','2026-07-23 16:20:11.996','2026-07-23 16:45:36.754',1,100000.00),
('cmryk2p5p004tmm01n52btn8a','cmryjiftr003mmm0146ca4ivk','UWZ-1784717757484-31757880','SUBMITTED',9,'2026-07-24 06:49:37.808','2026-07-24 06:25:01.405','2026-07-24 06:49:37.811',1,160000.00),
('cmryk2p77004vmm01b8howvu7','cmryjiftw003omm01t4vyfh6j','UWZ-1784717757484-37018798','SUBMITTED',9,'2026-07-24 06:46:41.986','2026-07-24 06:25:01.459','2026-07-24 06:46:41.988',1,160000.00),
('cmryk2p8j004xmm013223q5kq','cmryjifua003qmm0138h4zjzw','UWZ-1784717757484-41826151','SUBMITTED',9,'2026-07-24 06:49:28.262','2026-07-24 06:25:01.502','2026-07-24 06:49:28.263',1,165989.99);
/*!40000 ALTER TABLE `individual_applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `individual_bank_accounts`
--

DROP TABLE IF EXISTS `individual_bank_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `individual_bank_accounts` (
  `id` varchar(191) NOT NULL,
  `applicationId` varchar(191) NOT NULL,
  `bankName` varchar(191) NOT NULL,
  `branchName` varchar(191) DEFAULT NULL,
  `accountName` varchar(191) NOT NULL,
  `accountNumber` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `individual_bank_accounts_applicationId_key` (`applicationId`),
  CONSTRAINT `individual_bank_accounts_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `individual_applications` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `individual_bank_accounts`
--

LOCK TABLES `individual_bank_accounts` WRITE;
/*!40000 ALTER TABLE `individual_bank_accounts` DISABLE KEYS */;
INSERT INTO `individual_bank_accounts` VALUES
('cmruag8os0001szdsainnek5m','cmrqv44b70009sz4zqcexj0i2','Equity Bank','Busia','Bdgfdfgdfgdfgdfgdfgf','0110167890432'),
('cmrwczkh8000jru01lx2czknq','cmrwbl9lx000rs601s101xv8i','Equity Bank','Awendo','Gedion Njoroge','12678934'),
('cmrwdllzv000ks201czrmneij','cmrwd2knx0001s201jre4f6lx','Co-operative Bank','\"United Mall, Kisumu\"','Philex Fundia','12678934'),
('cmrwe7gu4000ute01f5o18cr4','cmrwdx3e90009te01415ct2t1','Family Bank','Banana Branch','Samuel Muli','12678934'),
('cmrxqh054001cmm01cw4cknjy','cmrxpw8xp0001mm01vrjt7arg','Equity Bank','Machakos','Samuel Mumo','36373737'),
('cmrxqlgw8001tmm01yzwjy9qg','cmrxpw8y60003mm01oyokwfig','Family Bank','Kayole Branch','Ashley','11124444478'),
('cmrxqs55q002gmm01ocr79oa5','cmrxpw8yk0005mm01igiz87jg','Faulu Microfinance Bank Limited','Homabay Branch','veronicah kimani','798387363'),
('cmrykqg3b0064mm01i0tnostp','cmryk2p77004vmm01b8howvu7','Faulu Microfinance Bank Limited','Homabay Branch','DORIS CHEPKORIR','6678'),
('cmrykuk17006nmm01vlnfi50t','cmryk2p5p004tmm01n52btn8a','Co-operative Bank','Bungoma','CHEPKEMBOI JACKLINE','123456789'),
('cmrykvu8h006ymm01siawz3s7','cmryk2p8j004xmm013223q5kq','Equity Bank','Bungoma','EDWIN KIPCHIRCHIR','2883492829');
/*!40000 ALTER TABLE `individual_bank_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `location_data`
--

DROP TABLE IF EXISTS `location_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `location_data` (
  `id` varchar(191) NOT NULL,
  `applicationId` varchar(191) NOT NULL,
  `county` varchar(191) NOT NULL,
  `constituency` varchar(191) NOT NULL,
  `ward` varchar(191) NOT NULL,
  `location` varchar(191) DEFAULT NULL,
  `subLocation` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `location_data_applicationId_key` (`applicationId`),
  CONSTRAINT `location_data_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `individual_applications` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `location_data`
--

LOCK TABLES `location_data` WRITE;
/*!40000 ALTER TABLE `location_data` DISABLE KEYS */;
INSERT INTO `location_data` VALUES
('cmrtif1l60001szzyyyxquiev','cmrqv44b70009sz4zqcexj0i2','Turkana','TURKANA EAST','Katilia','',''),
('cmrwcrvre0001ru01wez7sta8','cmrwbl9lx000rs601s101xv8i','Isiolo','ISIOLO SOUTH','Garbatulla','',''),
('cmrwdfpc40003s2012gmoe9pe','cmrwd2knx0001s201jre4f6lx','Garissa','DADAAB','Dadaab','',''),
('cmrwdywt0000bte01tfplywle','cmrwdx3e90009te01415ct2t1','Bungoma','KABUCHAI','Kabuchai/chwele','',''),
('cmrxq8j6g000jmm01ypxkydlv','cmrxpw8xp0001mm01vrjt7arg','Machakos','KATHIANI','Upper Kaewa/iveti','Iveti','Kitunduni'),
('cmrxqa6ht000nmm01e26w87n4','cmrxpw8y60003mm01oyokwfig','Nairobi City','EMBAKASI EAST','Mihango','',''),
('cmrxqkwa8001rmm01yq55ak72','cmrxpw8yk0005mm01igiz87jg','Elgeyo/Marakwet','KEIYO SOUTH','Kaptarakwa','Guu','Salesi'),
('cmrykcirg0053mm01j97mwop2','cmryk2p77004vmm01b8howvu7','Bomet','CHEPALUNGU','Sigor','Sigor','Sigor'),
('cmrykgfxu005dmm0150vc6sg0','cmryk2p5p004tmm01n52btn8a','Bungoma','BUMULA','Bumula','Bumula','Bumula'),
('cmrykgjmw005fmm018zhy9y4y','cmryk2p8j004xmm013223q5kq','Busia','BUTULA','Marachi East','Mumbuni','Kosachei');
/*!40000 ALTER TABLE `location_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `member_consent_otp_sends`
--

DROP TABLE IF EXISTS `member_consent_otp_sends`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `member_consent_otp_sends` (
  `id` varchar(191) NOT NULL,
  `memberId` varchar(191) NOT NULL,
  `phoneNumber` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  KEY `member_consent_otp_sends_memberId_createdAt_idx` (`memberId`,`createdAt`),
  KEY `member_consent_otp_sends_phoneNumber_createdAt_idx` (`phoneNumber`,`createdAt`),
  CONSTRAINT `member_consent_otp_sends_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `group_members` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `member_consent_otp_sends`
--

LOCK TABLES `member_consent_otp_sends` WRITE;
/*!40000 ALTER TABLE `member_consent_otp_sends` DISABLE KEYS */;
INSERT INTO `member_consent_otp_sends` VALUES
('cmrw5r2g20005m101c04ety8v','cmrvxxely000djz01waf26hmp','254720501239','2026-07-22 14:08:31.778'),
('cmrw5s5a70007m101d8jn7am7','cmrvxxen0000fjz01igvsuhoh','254720501239','2026-07-22 14:09:22.111'),
('cmrw5sj7h0009m101jbmq48ay','cmrvxxen1000hjz019gn6lhhg','254720501239','2026-07-22 14:09:40.158'),
('cmrw8nj8c0007pa01njlarjwo','cmrw8mtl10001pa011wfii964','254720501239','2026-07-22 15:29:45.757'),
('cmrw8ob3e0009pa01ruaagjr9','cmrw8mtmm0003pa01ru8s9lcb','254720501239','2026-07-22 15:30:21.867'),
('cmrw8oxbg000bpa010a24b1k0','cmrw8mtms0005pa0139muv73b','254720501239','2026-07-22 15:30:50.668'),
('cmrxmtvmy000dof0153olnz2s','cmrxmtonm0007of01qs7va3qx','254706026689','2026-07-23 14:54:22.571'),
('cmrxmtxp4000fof0159zujtio','cmrxmtonq0009of01f4qua1k5','254708409919','2026-07-23 14:54:25.240'),
('cmrxmu01z000hof01z680vw30','cmrxmtonu000bof01dkg89zqa','254706026689','2026-07-23 14:54:28.295'),
('cmryjiqhl003smm01q7zxunwc','cmryjiftr003mmm0146ca4ivk','254706721223','2026-07-24 06:09:30.010'),
('cmryjiywo003umm012fd8aabh','cmryjiftw003omm01t4vyfh6j','254706026689','2026-07-24 06:09:40.920'),
('cmryjkova003wmm01nbuqtsuz','cmryjifua003qmm0138h4zjzw','254703530884','2026-07-24 06:11:01.223');
/*!40000 ALTER TABLE `member_consent_otp_sends` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otp_requests`
--

DROP TABLE IF EXISTS `otp_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `otp_requests` (
  `id` varchar(191) NOT NULL,
  `requestId` varchar(191) NOT NULL,
  `phoneNumber` varchar(191) NOT NULL,
  `otpHash` varchar(191) NOT NULL,
  `attempts` int(11) NOT NULL DEFAULT 0,
  `expiresAt` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `userId` varchar(191) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `otp_requests_requestId_key` (`requestId`),
  KEY `otp_requests_phoneNumber_createdAt_idx` (`phoneNumber`,`createdAt`),
  KEY `otp_requests_userId_fkey` (`userId`),
  CONSTRAINT `otp_requests_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otp_requests`
--

LOCK TABLES `otp_requests` WRITE;
/*!40000 ALTER TABLE `otp_requests` DISABLE KEYS */;
INSERT INTO `otp_requests` VALUES
('cmrvrar8b0000p601kryfrda2','d8089f3f47128b1c9af13eea3391ea19','254720501239','3c0109d4dc3077260740d5772130024b54faa2de7e2a31b0771546d2f39d1384',0,'2026-07-22 07:28:56.100','2026-07-22 07:23:56.123',NULL),
('cmrvs729w0000szz9z15tt9ha','53998430602190604d804127e4fb4bb4','254712345678','1da3048d9375a8c8c58d78da7d13d488ffa56bf89065164ce9fcbee05507fe2e',0,'2026-07-22 07:54:03.426','2026-07-22 07:49:03.428',NULL),
('cmryiqquv002pmm01gyxm81u1','be78274701120b2fb327f93f4095cc54','254706721223','fe36b0275bfe40f31a20bde359941cfe777fdf4ffe834b5610953d5899d2408f',0,'2026-07-24 05:52:44.115','2026-07-24 05:47:44.119',NULL),
('cmrza6d1q0000mn01hph2knhb','bd323e3be3c035dc879d21ca713ab2a4','254703530884','7140a5f7305dd00a95aaebd3b916bddd300c74acfb2f81635f957b2287d1f73c',0,'2026-07-24 18:40:42.348','2026-07-24 18:35:42.350',NULL);
/*!40000 ALTER TABLE `otp_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recruitment_data`
--

DROP TABLE IF EXISTS `recruitment_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `recruitment_data` (
  `id` varchar(191) NOT NULL,
  `applicationId` varchar(191) NOT NULL,
  `localAgentName` varchar(191) DEFAULT NULL,
  `agentNumber` varchar(191) DEFAULT NULL,
  `employerAbroad` varchar(191) DEFAULT NULL,
  `recruiterCode` varchar(191) DEFAULT NULL,
  `countryOfDestination` varchar(191) DEFAULT NULL,
  `natureOfWork` varchar(191) DEFAULT NULL,
  `durationType` varchar(191) DEFAULT NULL,
  `workDuration` varchar(191) DEFAULT NULL,
  `currency` varchar(191) DEFAULT NULL,
  `monthlyRemuneration` decimal(12,2) DEFAULT NULL,
  `convertedKesAmount` decimal(12,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `recruitment_data_applicationId_key` (`applicationId`),
  CONSTRAINT `recruitment_data_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `individual_applications` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recruitment_data`
--

LOCK TABLES `recruitment_data` WRITE;
/*!40000 ALTER TABLE `recruitment_data` DISABLE KEYS */;
INSERT INTO `recruitment_data` VALUES
('cmrtlid280001szkpdoyqwifz','cmrqv44b70009sz4zqcexj0i2','EPIC MANPOWER LIMITED','RA/2022/11/59','Omar','56565','Dubai','Cooking','years','2','KWD',100.00,41869.83),
('cmrwcuvzk000bru013mg1pb0o','cmrwbl9lx000rs601s101xv8i','EPIC MANPOWER LIMITED','RA/2022/11/59','Omar','56565','Dubai','Cooking','years','2','AED',35000.00,1233053.50),
('cmrwdjlae000ds201ihdea5si','cmrwd2knx0001s201jre4f6lx','EPIC MANPOWER LIMITED','RA/2022/11/59','Omar','56565','Dubai','Cooking','years','2','RUB',45000.00,73989.00),
('cmrwe5w7d000nte01hzdlnp0i','cmrwdx3e90009te01415ct2t1','Lantern Overseas Skilled Workers Export (LOSWE) Co','RA/2023/01/28','Omar','56565','Dubai','Husbandry','years','2','KWD',100.00,41839.13),
('cmrxqea520011mm01tqj9whco','cmrxpw8xp0001mm01vrjt7arg','TASNIM AGENT LIMITED','RA/2022/09/51','Transmara','30003','Saudi arabia','Foreman ','years','2','AED',1000.00,35215.60),
('cmrxqhra0001gmm01qz6ff12w','cmrxpw8y60003mm01oyokwfig','RECRUITCARE LIMITED','RA/2022/09/36','WHO','100400','Los Angeles ','Cateress','months','9','RUB',65000.00,107087.50),
('cmrxqpxo20029mm01hipsie57','cmrxpw8yk0005mm01igiz87jg','BELJAN ENTERPRISES LIMITED','RA/2022/10/30','Gagaga','477474','Russia','Butcher ','years','3','AED',1050.00,36976.38),
('cmrykk3m1005jmm01qpi2gue8','cmryk2p77004vmm01b8howvu7','Lantern Overseas Skilled Workers Export (LOSWE) Co','RA/2023/01/28','Kolongo','5884944u','South africa','Water man','years','5','RUB',50000.00,82375.00),
('cmrykqn9x0066mm01ybizrj9a','cmryk2p8j004xmm013223q5kq','Mwiyo Planners Limited','RA/2022/07/40','RUSAGRO','1417','RUSSIA','Meat Processing','years','1','RUB',50000.00,82375.00),
('cmrykrghn006amm01d2is6gjw','cmryk2p5p004tmm01n52btn8a','RECRUITCARE LIMITED','RA/2022/09/36','yumna','123456','Russia','Self employment','years','4','KWD',20000.00,32950.00);
/*!40000 ALTER TABLE `recruitment_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `tokenHash` varchar(255) NOT NULL,
  `expiresAt` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `refresh_tokens_tokenHash_key` (`tokenHash`),
  KEY `refresh_tokens_userId_idx` (`userId`),
  CONSTRAINT `refresh_tokens_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
INSERT INTO `refresh_tokens` VALUES
('cmrvs9bjr0001ok012xftc7jq','cmrvrgm4o0003p60167xosy70','6db1b7265abb3572b40fa1c9bd9326890982bdeafb4b9107d5818cd7eba0cb08','2026-07-29 07:50:48.728','2026-07-22 07:50:48.747'),
('cmrvsvnm50001oi01w3a953of','cmrvsaj8r0003ok016ep2tmwp','eef9058888aecd9d0f088b8b902a51b07b2c505e01b895f0d95e12bfbd30cc44','2026-07-29 08:08:10.826','2026-07-22 08:08:10.829'),
('cmrw3t8t40003m1010pvr261u','cmrvsaj8r0003ok016ep2tmwp','39ce6b80bb7984d6c96633e71886216b1cb3d3e6000cc7a5068062a26baf33da','2026-07-29 13:14:14.104','2026-07-22 13:14:14.105'),
('cmrwe94kf0014te01wh6jmm0g','cmrvsaj8r0003ok016ep2tmwp','c1d345f3342e338fabe985a8746cfcd082aa1ed3126d0ee7f9d53738749ddfd1','2026-07-29 18:06:31.262','2026-07-22 18:06:31.263'),
('cmrxq29q40009mm01qaagonqv','cmrxlkxev000tpf011hc48bie','0cb25a262b5f8242527b8b52ea5f42c7d0c1dd2f8e10484cdcbfa1fa6675ab81','2026-07-30 16:24:52.924','2026-07-23 16:24:52.925'),
('cmrxq7a67000fmm01vd9iej6n','cmrxq7a5g000dmm01oakcxxe3','c7b4638f01b1774b97d526b961f791f3e33617782967e848378e531ed1c078a4','2026-07-30 16:28:46.783','2026-07-23 16:28:46.784'),
('cmryiz4mf002vmm01puchqdx3','cmrvyp2ua0001mt01dedwwcre','60f4118a690e6cba5888bf49a9078963f004309f644f7af96f37ec94de1d1706','2026-07-31 05:54:15.207','2026-07-24 05:54:15.207'),
('cmrynckb60003qh012xk8ly5u','cmrynckat0001qh01c1wz9brr','85db94589fd53e0973ac2923c81144315b8b74362078e21ffbd6c1be28eed25f','2026-07-31 07:56:40.529','2026-07-24 07:56:40.530'),
('cmrzc13jv0001k701saiyg5rb','cmrzbz1160000tg013w1ofufd','d00397172c4dd8369844077d421605faccc06a8e5da907c8d6c56c6935a5b654','2026-07-31 19:27:35.995','2026-07-24 19:27:35.996');
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `signature_data`
--

DROP TABLE IF EXISTS `signature_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `signature_data` (
  `id` varchar(191) NOT NULL,
  `applicationId` varchar(191) NOT NULL,
  `digitalSignature` longtext NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `signature_data_applicationId_key` (`applicationId`),
  CONSTRAINT `signature_data_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `individual_applications` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `signature_data`
--

LOCK TABLES `signature_data` WRITE;
/*!40000 ALTER TABLE `signature_data` DISABLE KEYS */;
INSERT INTO `signature_data` VALUES
('cmrufsfei0001sznbkg1wqx3v','cmrqv44b70009sz4zqcexj0i2','data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABK0AAAIaCAYAAADiJr4lAAAQAElEQVR4AezdCYAbZ3n4/+cZrZMASSxtbK/WCeAER9rE4UxazlKn5W5Dgdb5l6skHAkNR0k4S4/Y/RXacKUcSUkKJIVy1KYcgUK5alMoaYBwhByrtQNuSbxa21nJOSDHSu//ebWHR9Lo2F1Jq+Mrz7sz877vvPO+n9Gud56dGQXCCwEEEEAAAQQQQCBaQKOzyUVgqQK8pZYqx3YIINACAZpAoOcECFr13CGjwwgggAACCCDQMQHXsT2xowER4C3VTweasSCAAAIItFuAoFW7hWkfAQQQQAABBBBAoLEANRBAAAEEEEAAgQoBglYVIKwigAACCCDQDwKMAQEEEEAAAQQQQACBXhcgaNXrR5D+I4BAJwTYBwIIIIAAAggggAACCCCAQIcFCFp1GJzdeQESAggggAACCCCAAAIIIIAAAgj0v8DyRkjQanl+bI0AAggggAACCCCAAAIIIIBAZwTYCwIDJkDQasAOOMNFAAEEEEAAAQQQQACBWQG+IoAAAgh0twBBq+4+PvQOgcEV0MEdOiNHAAEEelSAbiOAAAIIIIAAAi0VIGjVUk4aQ6DFAoMcuHEttqQ5BHpOgA4jgAACCCCAAAIIIDDYAgStBvv4M/puFyBw07ojREsIIIAAAgggsPICg/wHuZXXpwcIIIBAzwkQtOq5Q9YdHaYXCCCAAAIIIIAAAggsWoA/yC2ajA0QQACBlRZYyf0TtFpJffaNAAIIIIAAAggggAACCCAwSAKMFQEEFiFA0GoRWFRFAAEEEEAAAQQQQACBbhKgLwgggAAC/SxA0Kqfjy5jQwABBBBAAAEEFiNAXQQQQAABBBBAoIsECFp10cGgKwgggAAC/SXAaFoowMObW4hJUwgggAACCCCAQG8IELTqjeNELxFAQAQDBBAYZIGueXgz0bNBfhsydgQQQAABBBDorABBq856d9He6AoCCCCAAAIILF6ga6Jni+86WyCAAAIIIIDAgAr07rAJWvXusaPnCCCAAAIIIIAAAggggAACnRZgfwgg0DEBglbtpuYugnYL0z4CCCCAAAIIIIBADwvQdQQQQAABBGoJELSqJdOqfO4iaJUk7SCAAAIIIIBAYwFqIIAAAggggAACfSNA0KpvDiUDQQABBFZCoN8vJ10JU/aJAAIIIIAAAggggAACXoCglVcgIYBAZwTYSx8KcDlpHx5UhoQAAggggAACCCCAQFcIELTqisOwtE6wFQIIIIAAAggggAACCCCAAAII9L/AoI6QoNWgHnnGjQACCCCAAAIIIIAAAggMpgCjRgCBHhEgaNUjB4puIoAAAggggAACCCDQnQL0CgEEEEAAgfYIELRqjyutIoAAAggggAACSxNgKwQQQAABBBBAAIGSAEGrEgNfEEAAAQT6VYBxIYAAAggggAACCCDQuwLau11vQc8JWrUAkSa6XWCwv8lbfHRoDgEEEEAAAQQQQAABBBBAoGMCg/1p3QStOvZGi9oReZ0RGOxv8s4YsxcEEEAAAQQQQAABBBBAAIHaApQsRYCg1VLU2AYBBBBAAAEEEEAAAQQQQGDlBNgzAggMhABBq4E4zAwSAQQQQAABBBBAAIHaApQggAACCCDQjQIErbrxqNAnBBBAAAEEEOhlAfqOAAIIIIAAAggg0AIBglYtQKQJBBBAAIF2CtA2AggggAACCCCAAAIIDKIAQatBPOqMebAFGD0CCCCAAAIIIIAAAggggAACyxbQZbfQqAGCVo2EGpRTjAACCCCAAAIIIIAAAggggAAC/S/ACCsFXGVGy9cJWrWclAYRQAABBBBAAAEEEEBg8QLt/4v94vvEFm0UoGkEEECgoQBBq4ZEVEAAAQQQQAABBBBAoNsF+qF/7f+LfT8oMQYEEEBgkAQIWg3S0e7TsfI3uT49sAwLAQQQWEkB9o0AAggggAACCCCw4gIErVb8ENCB5QrwN7nlCrI9Au0XYA8IIIAAAggggAACCCCAwGIFCFotVoz6CKy8AD1AAAEEEEAAAQQQQAABBBBAoO8FCFpJ3x9jBogAAggggAACCCCAAAIIIIAAAgJBrwkQtOq1I0Z/EUAAAQQQQAABBBBAAIFuEKAPCCCAQJsFCFq1GZjmEUAAAQQQQAABBBBoRoA6CCCAAAIIIFAuQNCq3IM1BBBAAAEEEOgPAUaBAAIIIIAAAggg0OMCBK16/ADSfQQQQKAzAuwFAQQQQAABBBBAAAEEEOisAEGrznqzNwRmBfiKAAIIIIAAAggggAACCCCAAAJ1BfoiaFV3hBQigAACCCCAAAIIIIAAAggggEBfCDCIwRIgaDVYx5vRIoAAAggggAACCCCAAALzAswRQACBrhYgaNXVh4fOIYAAAggggAACCPSOAD1FAAEEEEAAgVYKELRqpSZtIYAAAggggEDrBGgJAQQQQAABBBBAYKAFCFoN9OFn8AggMEgCjBUBBBBAAAEEEEAAAQQQ6CUBgla9dLToazcJ0BcEEEAAAQQQQAABBBBAAAEEBk5AOzjiLgladXDE7AoBBBBYpEAnfygvsmtURwABBBBAAAEEEECgxwTobq8LuA4OgKBVB7HZFQII9KZAJ38o96YQvUYAAQQQQACBFRNgxwgggEAfCxC06uODy9AQQAABBBBAAAEEFidAbQQQQAABBBDoHgGCVt1zLOgJAggggAAC/SbAeBBAAIG2CnALf1t5aRwBBBBYcQGCVit+COgAAggg0KwA9RBAAAEEEEAgLMAt/GENlhFAAIH+EyBo1X/HlBE1K1BWj7/TlXGwggACCCCAAAIIIIAAAggggMAKC7QsaLXC42D3CCxTgL/TLROQzRFAAAEEEEAAAQQQQGBABBgmAp0SIGjVKWn2gwACCCCAAAIIIIAAAghUC5CDAAIIIFBDgKBVDRiyEUAAAQQQQAABBHpRgD4jgAACCCxGgAelLEaLup0WIGjVaXH2hwACCCCAQC8J0FcEEEAAAQQQ6GsBHpTiDy+hO6/QjYmgVTceFfqEAAJ9K8DAEEAAAQQQQAABBBBAoNsECN112xGZ7w9Bq3kJ5r0oQJ8RQAABBBBAAAEEEEAAAQQQQKBPBUJBqz4dIcNCAAEEEEAAAQQQQAABBBBAAIGQAIsI9IYAQaveOE70EgEEEEAAAQQQQAABBLpVgH4hgAACCLRFgKBVW1hpFAEEEOg/gaOTG9f6UQ0n01viybHNiWTqgngytTWRTF+SWD92li8jIYAAAq0QoA0EEEAAAQQQQMALELTyCiQEEEAAgUiB1SMnn+QDU/HRsW+skljGAlTOiWxXcTtF9DIVvVhE3iJFd42V/SIxkroiMTp23urRsdMtn6k7BOgFAggggAACCCCAAAI9KUDQqicPG51GAIGVE+jtPfsrpGZTaqvNz/HJB5ks4LRzOJm6KpFMfcDSjYlk+lZL+wPVW31gSp17mo08YanetEFUzxPnrgic+6Ft79PO+Nr0uYl16UfV25AyBBBAAAEEEECg2wW02ztI/xDoQwGCVn14UHtqSHQWAQTaIrDm+LHUcDL9RxY42jmbUj4Q9UN/hdRs0ottfpVPPshkndjsRM8R0ddZ2iQiJ1laK6KyjJe/2mqzxuRjEshPEyPpnKXPJ+ZuKzzm+LHjltE2myKAAAIIIIAAAh0VcB3dGztDoA8FljAkglZLQGMTBBBAoBsE4smxzf7WvUQyPReYSrtEshSc2lkouIz9YrXD+rl5NqkPRPkgkq2u0KQStxjY82TutsKhovtWYrbvX02MjP2+BdlKz8oSXggggAACCCCAAAINBaiAwCAIELQahKPMGBFAoC8EZoNUPlCVvs6CPU7F7dTZZ0rNBab8MEvBKb/uV7o7OXm0ddD39Vmi7ksWZCs9K8vGtjOeTG+PJ1P+FkYLzI1tsHpMCCCAAAIItFOAthFAAAEEulCAoFUXHhS6hAACCHiBdetOG/GBGwviXBMfTd87G6TygSr5TV++lGSBoUVvZvvdbxvtcqrfdOK22fIlKnK2c3Jh4IpPF3HPcaJnWjrRp1KZ1ZurK6L6fyLyM0vNTputjS1qATnbtwXm3C/M4IfxkbH3xdelnnfM+tSaZhuiHgIIrJQA+0UAAQQQQAABBJYvQNBq+Ya0gAACCLRMIJ4c22DpnMRI6ooHggeyPnBjjZ+lTo60+WKm26zyzy2Js2CTzXdZAOhqFdklc2l23V3tRPxthLuc6LmWzrQg0/m5bEZnAre26IqPKN57fzqXzZyZnxx/ej47sdWW3zadzezIT2X+4Y6p3d/MZSe+ms+O77K016dpX2b15upqbnL84bbNo6ztEzVWeKjNLcDltrlSYKv4betPM9Ppqu5CDfTzQ0U9kBhNfWp4JPXK+PqNj21m456vwwAQQAABBBBAAIE+ELDfRftgFAyhkwIErTqpzb4QQKArBLqxE/H4hri/qsoCSd+3dJUFjs6TiJcFeiJypRSIsrJtFhzS2Iwca/OHWnqEJfXBJpufOZ2dODdnwaf5NG3rPuWzmbNzlp/Pjl9taZcFma4Ue921b+LgoandP8/n9+ZtddmTtb13+vY9t9ncAlwTW31QK5/dvTk2E6y3QJa/Sutc24kFz0pBtAO2XHty+kKn+k9ajP0okRz7WSKZ/sf4SPoPam9ACQIIIIAAAggggMBKC7iV7gD77zkBglY9d8i6rsN0CAEEliEwnNx4anwkda0edeRtKnqxNbXWUs3J6og4+YIrXaWkZ1qwSS35+Zn57MRWv+HBg5m7/LxX0sGDt0xaIMtfpXW1H0t+Noi2TqWwSf1tiKUrwEqBrBpDcqdZwatV5QuJpH8Y/dinjxs5+fGWx4QAAggggAACCCCAAAKtE+h4SwStOk7ODhFAAAGReHJsswVYLnNu6DpVfYKZPMRSrel6Ufdpp8Fvl66imso83weo8tlxf4VVrW16Pn86u+fm2VsN/RVgmbM1VnioOD1LnCtdCVZ7gO6Pixr8j/k6S99LJFMXJEbGHlm7PiUIIIAAAggggMBKCLBPBBBoJEDQqpEQ5QgMooAO4qA7N+bhZHqLinun7fECC0YdbfOo6W4r+7ST0tVUZ+QmJ16Un7zlv3rtKqqogS01z99amJsa/3JuaqL0zK3AFZ9gb9WPibhDddp8ooheZpY3JJLpX1v6x8T61FOEFwIIIIBA/wkwIgQQQACBvhMgaNV3h5QBIdACAdeCNmiiSmD1wx6Z8AEr491uhRZMsa/V01518spcNnNMKVDV51dTVQ+/+Zw7pnZfN53NvCKXnYhb8Or/sy3/w1K96SgrfLUU9TsWvHLxZPqzwyOn+KvcLJsJAQQqBVhHAAEEEEAAAQRWWoCg1UofAfaPAAJ9IGAhk2ZGcf+9n/YBKyf2NaK+tfKfrlB8/vRU5qMRxWTVEZjOZrZboO/Zct8DcRH3Wqv6VUuTlmpO5v2HTovXJpKpG+PJsfcOD288tmbl5RfQAgIIIIAAAggggAACCCxSgKDVIsGoeflxWgAAEABJREFUjgAC3SDQbX2IDkLN93L1yMknJZLpywIJnunzVNTPwul6LeqTVrkjn5s/sPsn4QKWFyeQy/38UC47cZkFsJ5zhDvyZHHuhcb9xfqt6CYVd5E7InbIjtN/Dq875en167e3tOrd0d7d0ToCCCCAQDsF+KHeTl3aRgCBARAgaDUAB7nhEKmAAAJtEzhu5OSnBRrcaju4wFLVZL/Lnm0BljOm949fOzV1wz1VFchYsoD3zE1NfCY3mXme3l9YLaKvs/DiD6T+60wXFL+eSKZuHB5JvXLt2lNrPXOsfivLKLU+LmNrNkUAAQQQ6CoBfqh31eGgMwggICI9hkDQqscOGN1FAIHeEUgk039f1OAbtXrsnHx0OpvZUauc/NYJTE/vuTOXHf9QPpv5TSd6orX8YUv/a6nGpJuc6j8VYoVb7Thetnr0lMfVqEj2EgQsWLuErdgEAQQQQACB7hOgRwgMukC7f68jaDXo7zDGjwACLRdYPTp2ugU6rrGG32opcnIi/5afyrwyspDMtgrks+N7c9nMn8Zm5Elzz7+6odYO7Tits7ILAle8PjGS/sTwujHbxnKYliVgrsvano0RQKBvBRgYAggggECPCbT79zqCVj32hqC7CCDQ3QL+0wED5z5ovTzLUuTknPxBPpv5o8hCMjsmcPBgZl9u9vlXj3ZB4XEiepk4yUutl8pLXOC+mkiOfXnN8WOpWtXIR6B7BOgJAggggAACCCDQ2wIErXr7+NF7BBDoIoHEyNjvF0W2WJeeaClyKqqekZ/K+KuwIsvJXBmB/L49P85lx1+rsZlHOZW/sl78n6XyaXbtWBH3e4WCy1iA8i5/9VU8mfrrxMgpp80W8xUBBBBAAAEEEEAAAQRaJUDQqlWStIMAAosS6LfKx56wadip+xOdDVpFDe/6QmHo5EOT49dHFZLXHQLT+279ZX4y87e5bObhPjg198mDv4rqnRM52spfoqLbRIs/SyTTu+KjqZeuWZM+Jqo+eQgggAACCCCAAAIIILA4AYJWi/Pq1tr0CwEEVlAgnhzbEMzMfFhrBaxUz7cgyBl3Hrhpzwp2k10vUiCXnfiK/+RBCdwzbdN/tdRo+m11+vHCkNyZSKauHU6m/yi+YUNceCGAAAIIIIAAAggg0DqBgWqJoNVAHW4GiwACrRY4OrlxrYr7m6iAlRPZYfln5ybHr2z1fmmvcwK5fRPftaDjHw8VYqN2TP/a0oHGe9cnWL0deu+Re4eTY9tWr9v4iMbbUAMBBBBAAAEEOi/AHhFAoJsFCFp189Ghbwgg0PUCQzL0e9bJl1qanSxS4RdstsNfdTOdzezw66TeFzhw4OZsPpv5f4eymXXOyRtEJPK2QcsPT6uduL8OgtgNwyPp/5dInLQ6XMgyAggg0HcCDAgBBBBAAIEWChC0aiEmTSGAwGAJJEbGXqji3lU2ai2t7RLRt+Smxr8svPpOwAKSkp/KvF+c/rGo/LTJAT7YqfylHLHqpkQy9ZoTTjjhQU1uR7UBF2D4XSww+/O+iztI1xBAAAEEEOh9AYJWvX8MGQECCKyAwJrjx1Ki7p2267WWwtN3nei5+ez43nAmy10h0NJOWFDyS7nJzGMseHWWnbvub6pxleNF9EP3zDz4P1ePjp0uvBBAoHcFXO92nZ4jgAACCCDQSQH7XXnJuyNotWQ6NkRg0AUGe/yFmeIbTWCDpYXJzl92ONGXErBaIBmIBQtefXl6OPZQG+wllpqc9AmBc9+Lj4y9b3h447FNbkQ1BBBoUmA5vxw3uQuqIYAAAggggECTAq7JelHVCFpFqaxEHvtEAIGeEShdIaN6XrjD9oN4h4q7ioBVWGWAlm+++f5cNvM2de6PbdQHLDUzHaHqLnRHxPYlkqlnN7MBdRBAoDkB+5ncXEVqIYAAAgggsBIC7LNpAYJWTVNREQEEEJgVCIrFsoCVz7Ufpjty2Ymv+mXS4ApMT0386xHuyBPFuReawm2WmpkeIqJfSSTTO9esSR8jvBBAAAEEEEBgUQJURgCB/hWw86z+HRwjQwABBFotMDxyyhMk4iqraT4lsNXUPdve1NQN9+SmJj4Tmwl+04l81gaSs9TMtLkQ09uOGz35lGYqUwcBBBBokwDNIoAAAggg0DUCBK265lC0vyM836H9xuyh/wWKWnxV5SjtB+mOyjzWETh48JbJfDazRZ37U9O4y1LjSd2xRRfcmBhNvYNPGGzM1Rs16CUCCCCAAAIIIIDAUgXsXGupm7JdrwnYX/x7rcv0F4GuEhgeSb/cgr8vr+jUNFdZVYi0c7UH2/a3DOayo8PW9bfY+6eZTxkMxOnb75l5yOcS6099mG3HhAACCCCwKAH7abuo+lRGAAEEEOhWAYJW3XpkBr1f/K7RkXcAO1mcQFHlOZVbOHFXVeaxjkC1wK6ZXDbz7kKx8CQr+66lZqZnSbHw9cT69JObqUwdBBBAAIF5Af5UOy/BHAEEEOh1AYJWrTuCtNRKAX7XaKUmbbVAYDi58VSLpf5hZVMzrvCuyjzWEaglcGj/nluHCrFni5N31KpTkZ+WouxMjKb/oiKfVQQQQAABBBBAAIGVE2DPHRIgaNUhaHaDAAK9LhC8uXIETty2u6dubeZ2r8pNWW+HgEUV29Fsq9s8cODmu3NTmb+0YNSjnZOPWIz+jgb7WGVBrr9NJNOXjYw86iEN6lKMAAIIIIBADwrQZQQQWLJAj/wOvNTxEbRaqhzbIYDAwAgkRsZe6ETPqRjwPSLBroo8VldSwK3kzhe/79z+zA35qcyrVN3zVeQ/rYW7LdWbLrhf7/tqfMOGuPBCAAEE6glQhgACCCAwOAI99jvwYg9MsNgNqI8AAggMmoCzoELlmNXJP+Wz4wStKmFYX7RAbnLiO9PZzO+K0/PFSV7qv35L7z3y56tHx06vX43SVgrQFgIIIIAAAggggMDKCBC0Whl39ooAAj0iMJxMb1GRLeHu2h8zfjA9lbkwnMdy0wJUrCGQmxr/VKwgm5y4rTWqzGcnAue+Gx8de8F8BnMEEEAAAQQQQAABBPpRgKBVPx5VxjRAAgy13QLFioCV35+qfsTPSQi0WuDgwcy+fHZiW+CKTxAnP5Har6PUuX9LJFMf5DlXtZEoQQABBBBAAAEEEOhtAYJW4ePHMgIIIBASOG59aqzyKisrvi03OX6lzZkQaJvAHVO7r8tNZc4Q0X+Xui997f163541x4+l6lajEAEEEEAAAQQQQKBcgLWeECBo1ROHiU4igMBKCBQLEnUL4IdWoi/scyAFCrns+Fk28rdYqjclCwV30/Bo6lVWyeKs9pUJAQQQGHABfhh2/g3AHhFAAIF2CBC0aocqbSKAQM8LJNannyyq51UOpKj6zco81hFoo4DLZTPvVomdJrNXXf1aol9DzumV8dGxr1sx52qGwIRAjwvQ/WUKuGVuz+YIIIAAAt0hQNCqO44DvUAAgS4TcEX5s8ouOXHvPTQ5fn1lPusItFtgOnvzTbnsQ55v+7nMUs1JnXtaYuSUTTUrDGwBA0cAAQQQQAABBBDoRQGCVr141OgzAgi0VeDo5Ma1KuJvyyrbz1As4FlWXoS0QgLXP5DLZt4sTl9kHZixFDkFMpOMLCATgR4WsJ/JPdx7uo4AAggggAACSxUgaLVUObZDoEUCNNN9AkMSu8R6dZSlhclfZXXw9vGJhQwWEFghgdzU+KdjgZzm1H0jqgsWzfp5VD55CPSyALd69fLRo+8IIIAAAggsXaDfglZLl2BLBBBAwATiybENKu43bTE83ZrPTrwpnMEyAispcHBfJpOfnHiGOH17RT/efWhqN0GrChRWEUAAAQQQQKAvBRjUAAgQtBqAg8wQEUCgeYFA3F+LaNkzgZyTq4UXAl0okJsa/zst6pOd6JnqgifmsplGnzTYhaOgSwgggAAC3SFALxBAAIHuEyBo1X3HhB4hgMAKCQwfv/EEJ3JuePe2vkPuu+9D4TyWEegmgen949/LZ8d3TU/d8j/d1C/6gsDACwCAAAIIIIAAAssWIGi1bEIaQACBfhEoFoJXVo3Fyb/k83vzVflkIIBARwXYGQIIIIAAAggggMDgCRC0GrxjzogRWEGB7v38p3gytVVFLw7jqMi38lOZa8J5fbLMMBBAoBMC9kOkE7thHwgg0BkBvqU748xeEEAAgbAAQauwBssILEmAjZoXcM1X7WDNeHJss4q+tGKXt0mg76rIYxUBBBBoXqA7f+Q1339qIoBAmQDf0mUcrCCAAAIdEei+oFVHhs1OEEAAgcMCKu49tnaSpfD06el9418PZ7CMAAIIIIAAAggggAACLRSgKQQaCBC0agBEMQII9LeAvy3QRni6pbKJT2Er42AFAQQQQAABBHpAgC4igAAC/SZA0KrfjijjQQCBRQmo6CuqNlB5SVUeGQgggAACgybAeBFAAAEEEEBghQUIWq3wAWD3CCCwcgKJ0bG/s72fYGlhUnFX5yYzn1zIYAEBBFokQDMIIIAAAggggAACCCxOgKDV4ryojQAC/STg3NvCw3EiO4oSbAvnde0yHUMAAQQQQAABBBBAAAEE+lyAoFWfH2CG15wAtQZPYO5ZVmUDV3FX5bPje8syWUEAAQQQQAABBBBAAAEEEFgRgXYErVZkIOwUAQQQWIyAir6qov7lsRn9bkUeqwgggAACCCCAAAIIIFBbgBIE2ipA0KqtvDSOAALdKDCcTG+xfq23tDCtKq76m4MHM3ctZLCAAAIIIIAAAgh0XIAdIoAAAgiEBXomaKXhXrOMAAIILEvAPad8c/fB/ftvnCrPYw0BBBBAoOcFGAACCCCAAAII9LRAzwStXE8z03kEEOgmgaLIOWIvJ7M/WVSDf7dVJgQQaCBAMQIIIIAAAgh0XoALODpvzh67R6BnglbdQ0ZPEECglwWG1489Q0VLQ1A/d/Kz6cnxr5UyOvuFvSGAAAIIIIAAAggg0FBg9s+sDatRAYG+FCBo1ZeHdRAHxZgRaE7AFd3Ty2pqcEXZOisIIIAAAggggAACCCBQU0BrlrSioL2tt6KHtNFZgeigVWf7wN4QQACBTgqcHdrZ3sJQ8OnQOosIIIAAAggggAACCAyWwCJH294rv9rb+iKHSvUuECBo1QUHgS4ggEBnBBLrU0+xPT3M0vz0sztvu2l6foU5AggggAACCCCwXAG2RwABBBBonQBBq9ZZ0hICCHS5gCvK08JdVHF3hNdZRgABBBDoOgE6hAACCCCAAAIDLEDQaoAPPkNHYNAEVPS3w2MuSvDP4XWW+01A+21ALRgPTSCAAAIIzArwf8SsA18RQACB7hYgaNXdx4feIYBASwXc2orm9lasL26V2l0u4Lq8f3QPAQQQQGDlBPg/YuXs2TMCCCDQvABBq+atqNlmAZpHoN0C9uvpmtA+rs9nxwlahUBYRAABBBBAAAEEEEAAAQQ6IdDsPghaNStFPQQQ6GmB1SMnn6SiIy6ND/0AABAASURBVKFB3B9aZhEBBBBAAAEEEECg3wS03wZUczwUINC3AgSt+vbQMjAEEAgLqMaK4XVbHrXEhAACCCCAAAIIVAiw2jcCrm9GwkAQGFgBglYDe+gZOAIDLuDc1wdcgOEjgAACnRFgLwgggAACCCCAwBIFCFotEY7NEECgtwVU5YjeHgG9H1QBxo0AAggsCHDr0wIFCwgggAAC/SkQ9OewGBUCCCDQlACVEEAAAQQQ6F0Bbn3q3WNHzxFAAAEEmhIgaNUUE5WaE6AWAt0rEHOFjeHeFUX+N7zOMgIIIIAAAggggAACCCCAQLMCnalH0KozzuwFAQRWWKCgsZlwF1T01+F1lhFAAAEEEEAAAQQQWDGBAd+xDvj4GX5tAYJWtW0oQQCB/hLYUDYc1VzZOisIIIAAAggg0DcCDAQBBHpLgLude+t4dbK3BK06qc2+EEBgBQWKp4V3npscvzK8zjICCCCAQE0BChBAAAEEEEAAgRURIGi1IuzsFAEEOi0QOHlyeJ/HnrBpOLzOMgKdE2BPCCCAAAIIIIAAAggg0IwAQatmlKiDAALdK9Bkz4oanLhQVSV/5203Tft17p/3CiQEEEAAAQQQQAABBLpPgN/Vu++YdLpHBK06Ld7l+6N7CPSvgDu0MDYn35lf5v75eQnmCCCAAAIIIIAAAgh0lwC/q7f3ePRC6wSteuEo0UcEEFiWQDw5ttn+SpMKNXJMaJlFBBBAAAEEEEAAAQSWK8D2CCDQBgGCVm1ApUkEEOguAftBd3q4R0Un/y+8vtLLFlBb6S6wfwQQQAABBLpMgO70ggC/w/TCUaKPCPS2gJ3L9fYA6D0CCCDQWKD8kwNXFYJbGm9DDQQQQKCPBBgKAggg0AYBbt1qAypNIoBAmQBBqzIOVhBAoB8FnOgjQ+M6cPDgLZOh9RVfdCveAzqwWAHqI4AAAggggAACCCCAQPsFCFq135g9IIBAfYG2lq4eHfO3BvpU2o8FiHaVFviCAAIIIIAAAggggEBdAW6ArMtDIQIdECBo1QHkzu6CvSGAQFjAfsgtBKx8voojaOUhSAgggAACCCCAAAINBFyDcooRWGmB/t+/nc/1/yAZIQIIDLBAsVgWtBIXfGeANRg6AggggAACCCCAQC0B8hFAoOsECFp13SGhQwgg0FIB1XDQ6kBuavxnLW2fxhBAAAEEEEAgUoBMBBBAAAEElitA0Gq5gmyPAAJdK3DcyMlPs84tBK2cCLcGCi8EEOhRAbqNAAIIILAkAZ5LtSQ2NkKgSwQIWnXJgaAbCCDQeoGC6lPCrfI8q7DGoC8zfgQQQAABBBAYDAH7s+VgDJRRItCXAgSt+vKwMigEOizQpbtT0ceFuxao2xleZxmBRQnoompTGQEEEEAAAQQQQAABBJYpQNBqmYDt2Jw2EUCgZQKPDLV0/R2Tu28JrbOIwOIE+EPt4ryojQACCCCAAAIIINBQgAr1BQha1fehFAEEelTguNGTT7Gub7BUmize8PPSAl8QQAABBBBAAAEE+lWAcSGAQJ8JELTqswPKcBBAYFagKPrS2aXZr4G4e2aX+IoAAmUC3PZYxsEKAgiEBVhGAAEEEEBgZQUIWq2sP3tHAIE2CTjRteGmdUj+MrzOMgIIzAm4uTmz9guwBwQQQAABBBBAAIFFCRC0WhQXlRFAoFcE1MlDw32947aJ28PrLPe+ACNAAAEEEEAAAQQQQACB/hYgaNXfx5fRIdCsQF/ViyfHNtuAnmmJCQEEEEAAAQQQQAABBBBAoEcFCFq15cDRKAIIrKRAIK7s1kDryy5LTAgggAACCCCAAAIIIIBAiwVorp0CBK3aqUvbCCCwIgJO5ILwjp24b4fXWUYAAQQQQAABBBDoUgG6hQACCIQECFqFMFhEAIG+EdgsFrkqpb4ZEgNBAAEEEEBg8QJsgUDPCGjP9JSOIoBABwUIWnUQm10hgED7BeJrT35MaS/+Fx+fSivB3tKMLwgggMDyBNgaAQQQQKBdAv4Pju1qm3YRQKBnBYKe7TkdRwABBCIE3FAsVpntnP66Mo/1bhCgDwgggAACCCCAAAIIIIBAbQGCVrVtKEGgtwTobUlAXfGs0kLoi2rhlNAqiwgsWyCeTG1NJNPOz5fdGA0ggAACCHSHwMIV2t3RHXqBAAIIICBC0KrGu4BsBBDoTYFA9KbKnkflVdZhHYFGAqtHx05PjKY+5YNVKnqxr+/n8WT6s36ZhAACCCDQ4wLcntbjB5DuI7B0AbbsXoGge7tGzxBAAIHFCxRFD1RuFZVXWYd1BKIE4qOp58dnr6q6PXDuh+L0hZX1VOQPj05uXFuZzzoCCCCAAAIDKsCwEUAAgZYJELRqGSUNIYBANwiouNIVMN3QF/rQuwLDydRViWT6bnX6OZ29qmp9vdEM3TvzQL1yyhBAAIGlC7AlAgggYAJqiQmBARQgaDWAB50hI9DPAk6k6kqrQGb29/OYGVvrBBIjqT+2YNVOJ3qOtfoQSxGTE/9vvsCWP5fP783PrzPvcgG6hwACCCCAQC8KuF7sNH1GYPkCBK2Wb0gLCCDQRQKBuHsqu1OUoV9V5rHeGoF+aWX4+I0nWMDqClH9tI1ps6W6k4oulKvoC+LJ9Pb4aOqlC5ksIIAAAggggAACCCCAwLIFCFotm5AGEGiZAA21QMCJbohoJiovohpZgygwnExvcYXYL0X1vObGr1XVLGeLOv14Ipn6YFUhGQgggAACCCCAAAIdFrDfzjq8R3bXHoE+Dlq1B4xWEUCguwWcuG93dw/pXbcJOJHtzfZJVSbq19XXJpJptzqZumzDhg1H1a9LKQIIIIAAAggggEBrBCpbsd/wKrNY70kBglY9edjoNAIILE6g2PB2r8W1R+1+EYgnU80978zJjKo+y8b9VUsNp0D0gkO/PvLnq0dSv9uwMhUQQAABBBDoNgH6gwACCHSJQNAl/aAbCCCAQIsEgr3VDUXlVdciZ7AEhpPpm1V0beNRu5vU6VOnJ8e/5lR2NK4/V0NlNFD98vDI2OdWr9v4iLlcZgggMIACDBkBBBBAAAEEliYQLG0ztkIAAQS6ViAiaCVRecJrcAXiI+k3OJFTGggcFNXzc9mJ06b3j1/r6+b2Zf5bAnmKLV9jqZnpKKfu+UEQ7EwkU69tZgPqNBSgAgIIIIAAAggggMCACBC0GpADzTARGCCBqIeuR+UNEEm9oQ5eWTw5do6qXFpv5M7ppTELTuUmx6+srOcDV7ls5g+cuG1W1mRAVB8qoh9MJNPNBruEFwIIIIAAAggggAACgy5A0GrQ3wGMv7UCtNYNArsiOhGVF1GNrEEQUHEvqzdOFTk7PzV+0cF9mUy9evnsxNZisfA0dfr5evUqys6Kj6Q+V5HHKgIIIIAAAggggAACCEQIdHXQKqK/ZCGAQEMBO+VuWKd/K+Sz41VXvszIzD39O2JGthiB1aNjp1v9mg/md+K+PJ3NNP3cqkP799w6PTX+ApXCJmv3F5YaTqr6/Ll+NKxLBQQQWK7AYP+fuFw9tkcAAQQ6KcC+EIgSIGgVpUIeAj0t4Hq698vtfDyZ2lrZxpAM+YBCZTbrAyigrnhWnWG/J5+dqFdec9Pp7J6bc9nMSU70XKvU8BMGA+e2x5NjNYNn1gZTnwoQQun0gXWd3iH7Q6BbBOgHAggg0BcCBK364jAyCAQQOCwQVF1pZWVReZbNNEgCq5Pps1X04ugxu5ss6PTm6LLmc/PZ8autnefo7JVXH66z5Ukq7ll1yvusSPtsPEsfDiGUpdut7JbsHQEEEEAAAQRWQiBYiZ2yTwQQQKB9Au45FW1fb4EEglYVKIO2euwJm4ZjIjWDUhZI+GwrTeauvPpTN/uw9lpNv6ZWQWvzaweMape0tgciJhxukmUEEEAAAQQQQAABBJoQIGjVBBJVBkOgcydvg+G5UqMMxFU+v+q4lepLp/bLfuoLHLM+tSaYmfmwhU3OiKqp4vbnsxNbo8qWm+fbVecusn0fjGjr6MRo+icR+S3Osr3XaLF2SY0NyEYAAQQQQAABBBBAoIMCBK06iM2uultg7uStuztJ7xoKONGnNqxEhYERSKxPP3moqLdZUHpLrUEXJah3G1+tzZrOn56auNT+s70gcgMnjx5Opm6MLCMTAQQQQAABBBBAAIEBF7Dfo9spQNsIIIBAhwXUXVd2J5KTDfHk2IYO94LddYHAcHLjqVKU71pXjrQUPan7r3x2/OLowtbllj6R0Lkro1p0opsSyfQvEsnUs6PKyUMAAQRWTMAi/iu2b3aMAAI9KECXEWi9AEGr1pvSIgIIrKCAumC3hH/JVikOzbjaQYsV7Cu7bq+Ak2B7/T3odYWZVa+oX6d1pbmpifNFNCfRLwus6v+LLiIXAQQQWCEBt0L7ZbezAnxFAAEEEBCCVrwJEECgrwSKxWKhYkDBzJA+sSKP1T4XiCdTW+1ca9P8MJ3Y2vzK7HxaVS6+88BNe2ZXO/PVSfHCOns63fe7TjlFCCCwDAE2RQABBBBAAIHeEyBo1XvHjB4jgEAdARcL/r262D1nzZpTRqvzyelXAfvP7U81dMldeNnGvEul8FvTk+Nfs+WOTvnsxD9b/OwLtXeqf7JmTfqY2uVdU0JHEOhJAe3JXtNpBBBAAAEEBlfAfq8f3MEzcgQQaEKgx37DPzQ5fr2Nap+lhcmGsKU4VHjnQkbXLdChVgoMr3/EQ53ouqg2nbqPaKzw0unsnpujyjuRp7GZ1zuRHVH7svfqicUheXNUGXkIILB8AfveW34jtIAAAggggAACHRMY4KCVnRp0jJkddVSAnc0KtOot3oO/4Ttx/zSLcPirEz2HW68Oe/T1UlFrXqkUK+qnp2/fc9tKjn96362/FNHLpcbL3r+vr1FENgIIIIAAAggggAACAyXQMGjVvxquf4fGyBDwAgP9Fg+uNoKyq61sXVT0Yj6hzUsMbrpjKvOf3TD6fHZ8l4j71+i+6Or4yNjrosvIRQABBBBAAAEE2idAywh0m0DQbR2iPwgggMByBSwgsFdF3iClV2X0LvhwPL4hLrz6VqCgQw+qNbj42pMfU6us0/nBkLu0cp9O5t6v6n6rsoz1WQH73p5d4CsCCCDQ/QL0EAEEEEBgmQIErZYJyOYIINCdAsGM/If17BKRylNc9zA56oi5gJbw6kOBVQ9o1VV288PUQJ81v1w9r3yvVNdoZc4dt+2+LhD3iXCbOvd+VZEtifXpJ4fLWJ4VmAvrza7wdcAEGC4CCCCAAAIIDJoAQatBO+KMF4EBETh4MHOXE/WBq72VQ1bRi4eT6S2V+az3h8DBg7dMiribIkejen5kfinTlb528ktBgo/V3F9R2hu0qrljChBAAAEEEEAAAQQQ6A4BglbdcRya7IU2WY9qCCDgBfLZ8V1OdJtfrkxFkZYGrSrbZ31lBZzIZ2v0YENiZOz3a5R1PNu/R22nuyxVTSrulKpMMhBAAIFBEOBGwiRfAAAQAElEQVRX3kE4yis0Rt5cKwTPbhFYsgBBqyXTrcSGdhq2Ervt/D7ZIwItE7CgwNXOadWzg+xXli2rR8dOb9mOaKirBPLZia3i3JWHO+XmFm2uLjKQOVdhJWb+isCq/VpPf6MqkwwEEEBgEATsB+AgDJMxroQAb66VUGefCDQQqFtM0KouD4UIINAfAs5fyXJb5VgC5z5Ymcd6/wioC64+PBoLU5ZWbO7cY4aHNx5bWu2CL87JfZHdcHp8ZD6ZCCCAAAIIIIBATQEKEOgvgaC/hsNoEEAAgWqB/FTmGsv9tKXK6YnxkbHXVWay3h8Cq/SIG2wkGUvlk2ogRw49vTxz5dYCldsj967uYGQ+mQgggAACnRNgTwgggAACKypA0GpF+dk5Agh0SiCXzbwl6uHcqu6FneoD++mswNTUDfeo6Eei9uqK7vlR+SuRVxR9QvR+dTQ6n1wEeleAniOAAAIIINB5Ae38LtljywQIWrWMkoYQQKDrBVzwjog+PnGYTxKMYOmPrKLIDyNHovLiyPx6me36fce5/43arRN3ICo/lMciAggggAACCCCAQEMB17AGFbpXgKBV9x4beoYAAi0WyE2N+1sE/fOtylq2/8YujCfHNpdlstIXAvns+C47vhNRg4mvPfkxUfk186yhmmXLKFB150VtrqJ7o/LJQwABBBBAAAEEEEBgUAQIWg3Kke70ONkfAl0q4Iru/RFde6K6Yo1btCJqk9VTAqr6uagOa0yfFJXfybx4MrVVRDdJ5MvdGJlNJgIIIIAAAggggAAC3STQxr4QtGojLk0jgED3CeT3T3xBRc6u6pnq360eTZ9RlU9GzwsExcK3Dg/CXy41mwKnzzqcvzJL9l78o1p7Vin+Y60y8hFAAAEEul/AfsZ3fyfpYVcK0KmVFuC7d6WPQHj/BK3CGiwjgMBACAQz8h820EsslU32A/GzIyOPekhZJis9L+AecN+3QeyzNDf5X0QsJKTurPi6TY+ey+z4bHj92DOkxlVWTty26eyem4UXAj0h4L+neqKjdHIwBVZs1P5PJCu2c3aMAALLEOC7dxl4Ld/UztFa3iYNIoAAAl0tcPBg5i4n6gNX15Z11MnD75P7frcsj5WeF5ie3nOnqH58diDhk2uVIJhJyQq9nIu8VbXUm0CK20sLfEGg6wSiOuSiMslDAAEEEEAAAQSWLUDQatmENIAAAr0oUHpAt0rotrHZUajKF9esT6dn1/jaLwKxB9w7o8Zip9rb48nOP4S/9BB4J2MS0SkVdzVXWUXAkIUAAggggAACCCAwcAIErQbukDNgBPpXYLEjy09m/sq2Kb/ayjJmivIOm4UvybFVpl4W8FfXqRTfHDUGFXdVYmTshVFl7coLguBxtdr2gbRaZeQjgAACCCCAAAIIIDBIAgStBuloL26s1EZgMASK8mob6EFLC5NFq/5wOJn+w4UMFvpDICj+qwWEdkQMZoNT9/yI/LZluUCT0Y27W3LZia9Gl5GLAAIIIIAAAggggEBbBLq2UYJWXXto6BgCCHRCILc/c4OofsT2VbS0MDkn/5RYf+rDFjJY6HmB6X23/tL+04sKWokFKrckkukfDq8be2JHBuqcv5qvaldOgguqMslAAAEEEEAAgR4ToLsIINAqAfv9vVVN0Q4CCCDQmwK5yfE/t57/2NLhSSUuxcKHTzjhhAcJr74RmM5mLGjlPhgekBM3v3p6MSi+a36lXfN4MrW1Vtv+WWu1yshHAAEEBlaAgSOAAAIIDKwAQauBPfQMHAEEygSC2AtsvWApPD37nsJDXlbK0NJXvvSBQC478XoVd/X8UNRfZzW3YstPSSRTvzW32vLZcDK9xfZR42qq8mBay3fe0ga1pa3RWGcF2BsCCCCAAAIIINArAgSteuVI0U8EEGirQG7fzf8nzv1l1U6cvHvdutNGDl+MU1WDjB4UmM5OnGvdvsRSxKT/FZFZK6vp/OH16Zc7p5+0DdZaKp+c5IcKQ+8sz+zmNdfNnaNvYQHii2ENlhFAAAEEEECgxwSCHusv3UUAgb4WWNnBPaDFj1oPfmYpPB39QPDAx8IZLPeHQC6beZuK+1zUaBIjqSui8peaFx8Ze50ryEdF3aqoNlTdFw4cuDkbVUYeAssSIL64LD42RgABBBBAAIGVFSBotbL+7d07rSOAwKIE7s7uORC44kW20d2WwtNzEqPpV4czWO4PgQcCOd9GsstS+aR63vBo6sLyzMWvxZNjmxPJ1AcsKPWB0F2IFQ3pddOzV35V5LOKAAIIIIAAAggggECTAn1ajaBVnx5YhoUAAksTuGNq9zeduPdUbe3kH49Zn1pTlU9GTwvctW/ioErhNfODsGM/vyjO6fviyfS3/HOo4iPp564eTV0xnBx77/BI+uU+GLVmzSmjC5XnFtavX//g+PqNj7V6b7RA53+ruJ0i+jqp/TqYy44/oXYxJQgggAACCCCwEgLsEwEEukOAoFV3HAd6gQACXSSg9838gxP5QWWXVhWCKy0vZompjwSms3tudqrf9EPSisuhVOR37L2wXVW+GDg9z4JaFzmVj/pgVGGouC+RTDtLv7C00wJcv/x18Zi7tBj7kdV7jzh5km+zVrJ2p1cVV51Wq5x8BBBAoI8EGAoCAyJgvzkMyEgZJgKdEiBo1Slp9oMAAj0jkMv9/JBosMU6fJelhcmpe358feqshQwW+kZAXfHSZQxmg2272X5NPcHmzf6/ussCXy/Zv//GKduGCYFFClAdAQQQQKA7BexPUt3ZMXqFQM8KNPvLdc8OkI4jgAACSxHIT97yvyrqAxmF8PZa0A+tWZ9Oh/NY7nEB634uO/EVcc5fSWdrbZ+uj80EL7J9frXte2IHCCCAAAIIIIAAAgj0sABBqx4+eHQdgW4U6Kc+TWfH/8bG81+WDk8qxxeL7m2HM1jqF4Hc1MT54uSLbR2P6vm5bOaMgwdvmWzrfmgcAQQQQAABBBBAAIE+ECBo1d0Hkd4hgMDKChQ0mHmZdeEXlhYmJ3rO8LpTnr6QwULfCOSmMs8TdU+1AVV/oqBlLmVyIhPO6estWKW5yfFOXc21lK6yDQIIIIAAAggggMDKCbDnCAGCVhEoZCGAAALzAtP7bv2luOC58+vzcxcU/2l+mXl/CeQmJ75jAaYzneiZKvqmudsGr13MKNVp1onb5tvIZzPp/NT4BxezPXURQAABBBBAYLkCbI/AYAlonw6XoFWfHliGhQACrRPITd1yoxP5HXGSl8OvhydGU586vMpSvwnks+O7prPj7/W3DVoQ60mWNBbI2ANSWOcKxcdaMOvPVdzVNm5/VdYue3/8i3NyoRaDZ0xPjY/msxNbfRtWzoQAAgj0vgAj6GKBfj1V7WJyujawAt383eb69KgQtOrTA8uwEECgtQL5bGanqF5T1qrTsyxw9Vtleaz0tcDBfZnM3dk9B/IHdv8kNzXx99PZiXNz2cyZpTSVeWl+KvMP0/tv+UZfIzC4lgjQCAIIINA6gX49VW2dEC0h0CoBvttaJdl8OwStmreiJgIIDLhA7uiZ81TcP4cYjhan/xBaZ3FlBNgrAggggAACCCCAAAII9KEAQas+PKgMCYHlCbB1TYE9e+5b5Y56jZX/wsnC31keNzyautDymBBAAAEEEEAAAQQQQAABBFooQNCqhZiRTZGJAAJ9JTA1dcM9KvJWFV0Yl3N6UTyZ2rqQwQICCCCAAAIIIIAAAggMngAjbrkAQauWk9IgAgj0u8B0NrNDVM+3cU5b8tMJFsL6o3hybINfISGAAAIIIIAAAggsX4AWEEAAAYJWvAcQQACBJQjkJsevVOfeenhT3RRI8eLD6ywhgAACCCDQVQKL6Iz9KWYRtamKAAIIIIBAuwQIWrVLlnYRQKDvBYoa7LFBXmupNDnRcxLJ9LtLK3xBoN0CnFO2W7hB+xQj0M8Crp8Hx9gQQAABBHpIgKBVDx0suooAAt0lkM+O79JA/bOsbgv17E3x5Njm0DqLzQj0ex1twwA5p2wDKk0igAACCCCAAAIIdEaguV+QCVp15miwFwQ6KsDOOicwvW/8607cR8N7VHHXhNdZRuDwh01igQACCCCAAAIIIIAAAtLkL8gErRq/V6iBAAII1BXIZye2OqeXhiodE0+mt69bd9pIKI9FBHpCYP369Q+Or9/4WH/FoE+rR04+qSc6TicRQAABBBBAAIHlC9BClwkQtOqyA0J3EECgNwWGCvpuJ7JjvvcqsuWB4P6/mF9njkA3CiRGTjlteCT1/yWS6Uss3To8kp76dfGYe7QY+5GK2+lToMGtVnYgMZK6ohvHQJ8QQAABBLpZgL4hgAACyxMgaLU8P7ZGAAEESgIHD94ymc9mzraVn1uam/R1drJ/2dwKMwS6QmA4md5i78svWjogWvyZU/2Mdewtlk5yKutsHjWtEdXz4snU1qjCfsk7OrlxrU/9Mh7G0YcCDAkBBBBAAIEBEyBoFT7gGl5hGQEEEFi8gP0YeVvFVlv6/US/YrxVq378FiBxPvnlqgpkdETA3+qXGEl/14lstx0+19IaS4uaVPRia2fDojbq4srhrsWT6R+skth+n+y9+pVj127aGC5nGQEEEEAAAQQQQKDzAgStwub2m3x4lWUEEEBgsQLT2cwOJ25baLu1dqL/qsTI2AtDef24GDmm4WR6i43/4vlCv5xIpm6M9/kVO/Pj7Za5HYdb/K1+ovLk5fYp5gp996y2RDL97ypyRsjm2UFs5p2hdRYRQAABBBBAAAEEVkCAoNUKoLNLBBoLUKOXBYZmYldYDHzh+VY2lvVO3fMH8YHWRZEtNv6KSTep6MUWKPjecHLsjRWFrLZQYDi58VQLEO639+NYq5p9YNURu1vVVre045w8vbIvau/dNevT6cp81hFAAAEEEEAAAQQ6JzAYQavOebInBBBAQPzzrUT0chHxyWYi/gRYVf9EBuylzv2ozpCf6MS9x4JXLjGSuuK4kZMfX6cuRUsQcBK7SUXXLmHTyE1U5Ow7b7tpOrKwhzNVZVVU92eKbiCvkIyyIA8BBBBAAIGeEaCjfSVA0KqvDieDQQCBbhHIZ8d35bKZ11h/DloqTSp6cTw5dk5pZUC+DBWHrrah7rJUf1I9r6jB/wwn0x9LrE8v+xa2+jsbjNL4om/BdD64OqkiP7Rg4rb5JOo+reKuFtXz/e2vfap3W9S4VPRVUfnkIYAAAoMkwFgbCWijCpQjgMAyBAhaLQOPTRFAAIFGAlpU/8DrhWrq3KXx+Ia4DMjrwIGbsxa8O9MHQGzI11qqOzmRc6Uo3x1ePxZ+LljdbSiMFlALkkaXLOReb0tvlcD9lh0jzWUndDqbWW/pN/LZia3zKTc58aLp7MS5ucnxK61+X072/vxojYGtt0DzhhplZCOwFAG2QaB3BbR3u97enttvL+3dAa0jMNACBK0G+vAzeAQQaLfA9P7xa+13vLMX9qMSD4464j8WcmRtFwAAEABJREFU1gdkwQdAnOjbVd1FNuSfW6o7uaL760Qy/ZW6lfqwML725MckkqkL/FVS8ZH061ePjp13zPrUoj/lb/VI6h1hHgvKhFfFSfFjuWzmDEvvyu2b+G5ZYU+ttL+zgXO/2/69sAcEEECgBwRcD/SRLiKAQN8JELTqu0PKgBBAoNsE7pfCLvs97wfz/XKij09YMGJ+vWvmbe6Iv2VyenLiUhv/K2xXl1jKWao3PdsCN2+oV6FfyhIjY7/vA1UaBDtF9DIRuVhV3m8BkyuGinogMZr+pH/PDB+/8QQrqzsNj2x8RaD69nAlFV1YVSevyGd3+2OwkMeCnlrLoKjyzFpl5COAAAIIIIAAAgi0V4CgVXt9aX2ABRg6AvMCd2f3HHBHHFF+4uvcFcPJdMQn681v1b9zH7zKZTNvs+DVC5xI+FMWqwatKpf6YE1VQR9krF+//sHx9enXD4+kPifqvqT+dj6V0q2jtixlLycvEnvPuELslz64VVYWWvFlTmMfCWVVLu6ansp8rDJz0NcD0etqGajIlqVc7VarPfIRQAABBBBAAAEEmhcImq+6ojVbu3P7DbS1DdIaAgggUF/g0P/9LKdFfVK4lhN3cXh90JZ98CqfzZytTvbVHbsFa/yVSHXr9FhhIpn6wK/dsbdpUd7vVJ+/mO6rBbcSybSz9JbwdonR9Kt9WTivatksq/LIkKIUj5llsDDq7ELZ11hB/6osgxUEEEAAAQQQaKcAbSOwIDCYQavo30kXUFhAAAEE2iHgn2/lnF56uG3dFB8Ze9/h9cFcUnXPazhydV/q9SvT4smxzfFkersFm5yIvk6cS8jyXpfE5z4hcN2600bEyZ/Wbc65K3NTE5+pW2dAC50GX5odus7OKr5a7m9XZLGKAAII9JAAXUUAAQR6V2Awg1a9e7zoOQII9LiAavGbNoSFB5GrugstmHGO5Q3sdEd24gdO3DYDqHvFVVFki9XpyWl4JP1yFbfTgh8Nx2AWTY9R/VVXI6kr7teZt9pGj7IUOTkpXm8Bq/MjC8kUdcWz6jKoPLpuOYWDJcBoEUAAAQQQQKBjAgStOkbNjhBAAAGRXHbiK87pP4QtLJhx1dq1px4dzhu05Xx2Yquo+sBVzaGrBa16McCXSKavcSofrTmwigIVrchpsKp6XqDFF9Wu5f6nOHTEM2qXr2xJN+y9EAs+1agfa9an043qUI4AAggggAACCCDQWgGCVq31pDUEEECgoUB+avyD4uQnEnrNxGZuGx4dK39Ye6i8ycWerpabHL/SzV5xVXMcFuDrmeeAxUfTn7WAlbPB1L+KxyqEpoyonq+xwkOduheIc1da2bSlupMTHYmq4ER2WKD0iXfedlPDNqK2H5S8B88ccbt9T95db7wzM+6UeuWULU9gOLnxVB+UtrTZ3/bKw++X58nWCCCAAAII9IsAQat+OZKMow0CNIlAGwUC93oL0IR2oKudK/5eKGMgF/0VV+ZS74qrDd3+aYL+ihwLVt2qTv6w6YPonAVNii/OZTNjPng3ffue2/KTE5/3t/TFZoLTnOiZ1tb1lhY1BVLYuqgNBrTy1NQN94jK5+sNXzU4tV45ZYsX8AGqRDJ1gaUbncRuEileZYHpnSp68VBRf5pIpncmkqnXLr5ltkAAAQQQQACBfhHoXNCqX8QYBwIIINACgdzkxHfsxOzG8qb0dcMj6VeU5w3e2mzgSnbUGrm64hNrla10vr9apFBwF1k/TrLUzHS9qJ7/oNjdqdzU7shb1A4evGUynx3fZQGtM1RLbTfTbqnOdHbPzaUFvjQWUP1u3UrqHl+3nMKmBI49YdNwYjT94ngy/VkfoBLRyyxtEnvZz0T7ujCtt6XNIvrBRDL9Qx/gEl4IIIAAAr0jQE8RaJEAQasWQdIMAgggsGgB595RuY1T+ciaNaeMVuYP3HqxZHMwatxO5Dei8lc6bzg59iYnse9aEOq8JvtSCkT5K6v27dv3q2a2mZ6cuNTa9w9Uv9uJSdTZyDn5xZo16WPqVKEoLFAsnh5ejVg+NiKPrCYEfMApPpJ+Q2Ik/YlgZmafvXX/RWURVyKKnO4DXL6dJnZHlV4VsDdFr3a9E/2e3wdM8xJLnSO4VDm2Q2ClBAharZQ8+0UAgYEXyE1NfEbEvaYSojBU+Maa48dSlfmDtJ7fP/FTC8q8MXrMuslf0RRd1vlcO5HekEimd1p/3217T1hqODnRc3PZjL/lr2Hdygo5/+yvoPBUccHnK8vC66pyYmHI/Uk4j+VogeHhjceq6kuiSxdyNywssdBQwL4vNtv3xWWWfugDTqpiAVd5iZ0uHtlw4xoVVIrbh9c/4qE1iheTTd1uFHDd2Knu6xNMyz0mCC5XkO0R6LQAQatOi7M/BBBAICSQy05cbsGOimc46aZCQT4eqjaQi/nsxMftBPfsqME7jV0Zld/pvHgy9R4V9wvb72ZLDSd18g9O9Mx8dvzqhpXrVMjv2/Pj/NT4C5zIVXWqWZF+yAcPbKGNU+83rav0N83ywQ1GQtCqAZB/r1mQygeqnH1f7LTqF1hqcAWb2+OvHnQWyLWfhf9s9W+1VGPSta4w9K81CslGAAEEEEAAgT4UIGjVhweVISGAQG8JBBpcaz3ea0lk4Yt7vAVEti6sDujCdDazwzm9tGr4zj2uKq+DGYnkyb+XSKZ2q2iNq8F8Z5z/UkrqZFLEvW56KnOhBax2lTJb8CWfzbzcmql471hOaLLgwfbQKosRAsVAf8dnO/HHzCe/RmpGwF8V6p9RlUiO/Y+91+YDVY03de7TqvLsXHbiZH/1YN4CuRaoPieXzWx0Fti17603RzaiMja8bqxrn2sX2WcyEeghAe2hvtJVBBAYDAGCVoNxnAd2lAwcgV4QmJ4c/5qdpJ1b2VcVvTgxMvb7lfkDtx5zEUEefdBwMv03K2ahwYtEdKPUfem1qu4iFxQeZ8Gq9XZy/qG61ZdaqPK9BpuuTYye/LcN6gxscekZck5L33/2PWdhK52oheE/GbJW2SDmx5OprYWC+5qh/YsFZZt5UP21FhjcVigMnZybmnjR9GTmP6LcLIC1azo7/h7nJOp9mygG7sJj125q8P0X1TJ5CCDQSMA1qtDqcm11g7SHAAL9JrCYoFW/jZ3x9J0A/+v13SEdoAH5kzQXdUWRun8cIIbIoeb3Za6RiMCM/WL9srVrTz06cqN2ZzqxoFX0TmaPo3tObEaeOT05cam/lS+6Zmty1ckXpNHLBX8xfPxGrk6JcCrEnL99LTlfpIHbPb9cOX/A6cq83yo7ssLrFkx/YSKZulEtsG5daea2yZzVu8SJvj2fndh654Gb9th6wyk/lfkr59w3KyuqyJYgKDy7Mp91BBDoQQHXg30enC4zUgS6QoCgVVccBjrRGgH+12uNI62slEB+avwiexfvqNj/CfGRsfdV5A3eakH+1AZ9r6Xw9LCZoPj6cEbHlp2LeqbWV+xk+mx/HHPZia8ePJi5qxP9KTo5vpn9uELwZ83UG7g66sqem6ZF9c9V+lKUw6HJ8euj8gclLzGa+q3ESPpfRN2nRHSTNH7dZlV8sOoFuWzmbT44b+uLmgLVqO81UXUErRYlSeWVF6AHCCCAAAJLESBotRQ1tkEAAQTaJFAsDL3dmvZXJdhsdrKTs1f623Bm1wbza25/5gYb+X9aKp/U/cXw8MZjyzPbv+Y0+DsVN/8w9b1OSp8G+HvT2Uxl0LH9nZFiscmdPKnJeoNW7aXhARdFf+DERd4ieHRy49pw3UFaToykrhCn/yUqL248bneTGW57QAqPayZY5W/1SyTTl1jaaemScPv+eyr0vXa4SOTZ/sHv4QyWEUAAgXYI2B+k2tEsbSKAQJMCBK2ahKIaAggg0AkBf9uMneQNV+zrGBV9RSKZek5F/kCtOi2WnczODf7BcsTQRXPLHZvls+N7p7MT51qw6sRcNnOirc8HsDrWh/kdBUPuByJufjU093k+zWfpQxOj6ciAw3yNQZtXB4P143Ys94oEX46yGJKhZq4uitq0Z/PWjJ7yuEQy7UT1vGYGYcGq98ZmYk/3twHend1zoNE2q0fHTo/FZvwtmW+xupstvaW0P1uYn4oSfHt+uWzu3GPK1llBAAEE2iDg2tAmTSKAQPMCBK2at6ImAggg0IxAS+rYid+2ioZOcC54WkXeQK3mJ3f/lw34u5bKJrN6xfr1pz+4LLNDK7MBjg7trMZujnK/+qmISvXL5/kUKnHy/4XWBnpx+PiNJ6ho2VVWFvsrXSlnx9U//L/qVsAZmblpUNC8z3AyvaXgilUOUQb+aqhYTNMWrHrTwYO3TEbVicrTokQGUsO3RTuVn0Vuq+6ZUfnkIYAAAggggED/CBC06p9j2acjYVgIDKaAnfht9SeB4dGrugvjybFzwnnRyxqd3Qe5qvoPEcM44VeFe14RkT8QWfv27fuVxay+19RgnfxWU/UGoVIh5h9Mf1JoqD/PTY2Hr7DaHyorLa66r/ig0kKff/EPWi8WYu9zItsbDdWCxtuc6InT2YlzD94+HnlbZb027OfaY6PKw/kuFvuFvcerq6mOVmeSgwACCCCAAAK9K1Ddc4JW1SbkIIAAAl0hUJRgm4i7Sdzh7gRSvKTxM5xCGxzetC+WpifHP28mVZ88Zie4b96wYcNRfTHIJQzCOfeNWptZUOFwkUpceMmxJ2waLopsCVOY0yfC6yL6c6l4uaOG/CcNVuT212oimXq2U/d8rfCpHqX9bFL3VB9gz2fH91aXN51T6wMLFvLvvO2mafs5eF9Vi01+CEHVdmQggAACgyLAOBHoAwGCVn1wEBkCAksRsBOSpWzGNh0U8CeCKsWyTzZzouvkiNgzR0Ye9ZAOdqWbdmWxBon6FLyHHrrvyD/spo52tC8qP621PxUtK1pz/FiqLGMAV4KZB15vKuGg1fU++FJG4fTDZet+xWlfB/2OOyF1vIhervUDVvdagG9bLjtxWm5y4juy/NcxkU04V3mL4dcj6t0fj2/o62MivLpKgM4ggAACCHRegKBV583ZIwJdIeC6ohd0opHAdHbPzRrIheF6duy2P+Duf1Q4b5CW7WT5K+Lkv6vG7PR1VXkDkjGkenOzQ50pyPpm6/ZjPX8lkYqW3U6q6j5ZOdbc1Mi45d1raWGy7Z6xsNKHC4UZeZUNa4OlqklV/k+dvD+XzTyoKsBXVbupjFIl+3kW+bB2p1IWtFJxd5Q2KP+yXo466jHlWawhgAACCCCAQK8IaBMdJWjVBBJVEEAAgZUUmJ7M+Oc4XR7ugwvcv4TXB205kOLW6jG7xx+79pSTq/O7M6eZ/6Sb7fnBfZmM1b3HUtXkLMJXlTnIGS7wQY4TQgTXTk9OXBpan1vcNWN05Q8hd66vnwmmoi+bG3zZzN5D2wrF4pnTU5k3lBW0YEVFfiOqmZhzXw3nF2t8gqBqsalPNQy3xTICCCCAAAIIdIeAa6IbQRN1qLj7KRcAABAASURBVIIAAggMlkAXjtbde99fVHTrpOFkOnx7U0Vxf6/eMbX7WzbCjKWyKTbkXl6W0cUrzfwnvajuO/l8VH0VjcoeyLzh5MZTRd07w4PXor4xvF6x/IuydZV1I316a+7cz5PKq6xy5vMkf2XVoandVc/4KrNZ8oqLCrYemDnyqLKHurtanyDopPpZV0vuCxsigAACCCCAQLcJELTqtiPSh/1hSAggsHyBfH5v3lopv9pK5KWWN6iTxXz0Q1WDd25gA3lO3a1VHhEZQzHZF5Hd91nx+Ia4k9hlEnqpuKun949fG8oqX1Sp/FTGVffH7vNXapXX64M1+4Yquw15bkg/reszV2mps3hyzIJkuili+7X663sfHs639cj3t3M68M9oCzv5ZR9YPS6Z+g3z3bx65OTwJ2T6YhICCCCAAAJtFWh14wStWi1KewgggECbBIqqH6to+qx4MrW1Im9gVnPZ8cuk+tlWj4gff3JfBhVadWAP3j5edgVLq9rt+naOOOK51sfNlg5PseJfHV6JWArkhqrcont0VV4fZFjQaqhyGJZXrMxr5br/sAlrL+pKq3vyB3b/xMpK0/C6k5+uRx3xN6WV0BdnPwBE5Yn2c/C6RDL17FDRii7GR9LPtT5t9fNOd8Tv936978ai6PctKLsz0ODWxEh6JpFMX5MYTb962F9t2OlOsT8EEFiOANsiMPACBK0G/i0AAAII9IrAocnx6+0k5Opwf1X0GcPHbww/nydc3O/LTlX8874k/NJC8MLw+uAsB7sajbV0kt+oUp+Wa6D/HB6aipw9ffue28J5lcux+6X89kBfwUlfBq1U9Qt+eOGkIr8TT46dE85r9bIFxn5d2WY4LzE6dp4Lgq+LVH/QglrESkTU5r9ps6/Ek+ntvr6s0Mt/+mJ8NPV169AXrU8X+3kimdrtb71cv379g1vZrQ0bNhzlA1B2fDYPJ8e22th3JpJp5/dr+9lg6fCkEhORs8TJPzoJtg+PpC89Lpn6DcsbwIkhI4AAAgj0mkDQax2mvwgggMAgCzhV/yynMMETizOxvwtnDNJyMCNfs/GWfcqYrZ9laRCn8hPVCAE7oZVj1qfWRBT1dZad0H/fD3A+aOec++J0NrPD59VLBw9m/K2UB8vqqD6pbL1fVop6TdRQLFD+AR8YiSqTFmSqyN2Vzczn+WCPOHdFZXmtddtui6+fGEk1vU2ttpaS72bkA+r06eXb6kYLwm3/dfHo7x6d3Li2vGzxa/FkaqsFp3YeuvfIXzuJ3SRS3Gnv64tt7OVXEdZsWjc5lTcURb/v26pZjQIEEEAAAQS6RICgVZccCLqBAAIINCOQm8z4Tw0su6LG/pr/EjuJeXMz2/dbHQsq3GUnbP4E1c4LF0Z3ytq1pyYX1npkYbndzB8982lrY6+lulOsGJxWt0KfFfoAhp3Ql64qUVE/ur1DQ8Fb/EIzyd5YZd9vts1p/plBNl/RyQJJ59j3/V5LX4yPnPy6xMjY2xPJ1AXHHZc6fikdy03dcqN9L703YttjLHB1cUR+i7JcxO2B7h4by7PNfnvUTqyfUdmH81TPiyfTkdsertT8kllvTiTT/kqmnX651pZO9Bm1+6aPHap4plqtdqLy47PBKos3qT8WCwEqnX1PR23SMM+2fdXq0bHTG1akAgIIIIAAAisoQNBqBfHZNQIItE2grxuOzQQvihjgq4fXjT0xIr/vs7So/lPzNDzQmaHiH4TXB2J5z5777KT5TAswXG3j/T9LAz+VrtSxAEYYwoy2HVzMc71U/ju8vV++L/j1ip7ox0fGXmfH+Srri39Y+XNVgw+IuneI6GXFVXqbBVj2+CBHfP3Gx8qiXoH/cIMvRWyyOd7CIFC4fTseN4fX/bJ9M2dE9cN+OSqpaFR2WZ7V2BK3QE9Z5hJWjhs5+fFmvdM29YGizX7Z59l62RSPb4iLyFFap28qsqQ+DSfTH1NRH6yyXbR0Wh8498Nj127a2NJWaQwBBBBAAIEWChC0aiFm/zbFyBBAoJsEDh68ZVKc+/OKPp1UDNyFqx/2yERFft+v5vZnbnDqvhEeqHPud8Prg7LsH2w9nZ04N5fN+GCGv7Wtauh20n1KVWYfZiSSKX+lzvvKhubclWbkg3pl2fVWYs59r7o8eFx1XmdyhpMbT9XART+U/HAXHuGDHFqMfdcCN00HO8xmr713nmvNlH1Sqa37UIwPuLzHL7cy2fuxUNleUfQEcfKwyvzFrnuD5V5JVNTgBZX7jcpzRxz5Qqs3ZKnuZL94/1HdChWFiWT6eidybkV2S1djsULLrkpracdorOcEtOd6TIcRQCBaoLty7f/O7uoQvUEAAQQQaCxQFLfdTmTKnsljvyxuCe6//3Nrjh9LNW6hv2poUT5mI5qxVJrMwl8V4R8+XFof0C81PiXQndrvHrOBCvWBl/CHFOzKTU2cv9ix35E95se2zf2WFiZ1usgrmBY2XdaCD1g5/xwjJ/6qHgm/VDS8Or/8YBXdutiHk1vg6jVO5aPzjczPbdxvnF9u1bwocmxlW4G48HGrLF7UelB071zUBqHKw8Mbfd+qgkxOXNXPllggVQ+st3pS+XKim+Jrx15WmR+1bgErfxvr46LKGue5PSLuE07k23YsD8zXj+qT1Xvs6mTqsvk6zBFYqoC935a6aX9vx+gQQGBZAgStlsXHxggggMDKCBya2v1z+wFeFrSa68nmQsFl4snUB+MjaX/FxFx2p2fa0R0+oMVv2R6nQztdO5w8dSy0PnCLdnIaEZzypxTa18+08oGdwDn/SXgb5g+6E9lhgZgz59cXN7/+ATup/1H5Nm6JgYTyVha75iQoXRFjx3Zxmzp3hb+lcFEbzRT9rYLlm9g3WaLFDzkPVEbLd+JHp+vL85axpvKMxMjY78+3MJxMb7Fg0CWWfmpp5+rkKT4wNF9cPj9yyN9yfVJ5pl8Lvuy/hpO9x6oCWRodSBSNudeFt41aHl435h/4/1dRZZV5XkycFC3/LnHuSqfuBbnsxMmW/iSfzWwOdOZ0ew/747mvVp9iqk+z7XtiopMIIIAAAoMlYOc8gzVgRosAAgj0i8B06dPP3AejxmMnJq9VlY8kkqkPJJLpt8aTY+dY8lcfRVVvQ56dwrWh1VpN3p3dc8BOyr4SLi9qoeJTvMKl/b3sj7W9B9ZVj1J9VsNbmHylXkwWrN3q/JVIIuErda4tFobeXj6ekkN5Vp01Vb2uotgCf6evqshr66oFXl4kopvEXlojGGJFpclZBKO0EPqi6j4QWp1frDnPH9j9E2vn41UV1D/kPLW1Kn+pGU4PlW3qNLQa/jnil92docKmF23L1/vvCftZuNOWtztxPlD1KGtgcyDFSyyQdZ2lLbZeNhWde0VZxuzK9fnseOXD+X2J/1AIP28mrbfXg+tVLAbFZ1j50ZaiJ5WfiOhnnNMPidM/E3W/b8sfUZUjbP01iWTq28etT5fGPb3v1l/mshOvUyd/JTVezknK3mMLwb0a1chGAAEEEECg4wJBx/fIDhFAAAEEWiZgJyKvt8aiTqAsW9aKqP+L/t+ruKss+U+/OpQYTd9m6cXSZy/ngn8LD8lO0Fp3tUa44ZrL3VGwdu2pR9ux9iflkR2yE/ZbIwt6PNMHrFT0VRXD+FIum3nSnQdu2lOeb6GL8oy6a67o/qeywnHJuzp2i6AFVM62oETZ7Xp2HCu7tLBuDgvL4QVvFF5vtBxz7hNRdaz9lx57wqbhqLJl52m4hbIVK9Dr7cuiJ/t+CD9M3UJ+5e3au+E3LW23QM9uS8/2O/APJ7daVYEsK6sMYFrW7KTW8uxSw6+jv5IHp6Nq+eBafOTk91tbF0eVL+QV3Ukqxd+xYKT/A8X7RfQrtnyhEz1HRX7X1p9aLIq143bGk2l/9e1WUblLnISvSJXwywJekX0K12EZAQQQQACBTgsQtOq0OPtDAIHmBKjVtICdlPvbnj5sGxQtNZqOtZOW4y39SyKZviORTH2gX56BlZt6yNds8HstzU6qL59dGJyv/llOM7HCXTbi0om3zSOmYFEPIo9ooOuy/DObVPQC69jhQKVzV9r3RktukZ2JyTet7bLJggP+Yfdlee1Yia89+THO6Ues7aMsLWsKnPzZYhq4Y2q3H/c9EducFMw84APmEUXtytI7VaR0pVntPbjoIpVjowsqc3WjiF5uPxefHRuaebxEvJxo1G3ZvuYG/6XpVBxaPV83MTL2wsRI+hOJZPqHKm6natCErR5rfYm4mnK+1cNzc0up6MVOZLuo1Aw2FqV4zOGtWEIAAQQQQKA7BILu6Aa9aLcA7SOAQH8L2Mn5n9oJx3tF3C8XMVI7edHX+Wdg2cnSztUjKfvr/CK27rqq/tlDcvNCt5w7cs2a9MCchA2vG3ti4Mo/RXHBYmHB/fjBwZ3fX1jtg4X4utTzxLkrbChrLc1Ozr3dafDp2ZXlf71r38RBa6Xse8s5ebTltXXynwaqMf0XUVf1PrYgRL193x1V6FTjq0dOjnhGU3XtRDL17EQy/QsreYilqsn2f7EPtlQVLDKj6KqvYotqwoI5v7agS1mQxonllFXWsrUlrmywY3uhFNX/ISCqicOB8fLSKqfq/h3eoBi4R8WTqa3xZPr7dnw/ZcGkl1jp6Zaam1ox1Io21Ml4czunFgIIIIBAtwv0U/8IWvXT0WQsCCAw0AKHsrvfkstOPMxOlLYZRMUtgxVnJ1ahYtocqH4zkRz7n3gy9Z41a06peDhyRe2uXS17QPLRM0Pa/Elg146pcccS69NPdoH7ntVMWKo1/coFxVfs27fvV7Uq9Fq+D9RpoJ8P91tF35ybmvi7fPRzh8JVF7es8p2yDVQ2lq23YUXvv9+Ccdrg6qKIHavUfG6ZauxhEVtEZfmr9epfPaTFv1izzJ8VMdGmHmrvREcqO2nH2mdFBuh8wVKTqj7dAkmRz5Oy91WtoNXhoOncjuf6N7dWPouVbt3Ti1XkN8pLml9zzuXnar/H5pdbYO9qy/uyOH3A1htPrryKavGG8hzWEEBgToAZAgisoABBqxXEZ9cIIIBAOwTy2YmtuWzmTDsZOtvav1zE3WTJFpuZ3ONV9I2FoeJPLXi19ejkxqoTsWZaWak6uewt/2j7Dj33xr3W1vt/Krr3Vg7SgpdlWbb+7vy+PT8uy+zhFX9LoJsN1B0ehXNfns6O+xP4w3ktWtKi21nelNYP6JRXXvTa8GjqQhXZUnvDiohDuKKTo8KrZcvBTPmDz8sKwyvqn4cXzohY1k3FocK3Gj1UPGLDhSwXiL+KbWF9sQvOybfC29j7PLy6rOXKtux43FunwVrBrDqbRBfZfrK+xO9/Pvn1cLI6k/mpiYT9rFdLb7b0munsxLmWd5a77951Frh6kdW/xFJzU+ntFHtfPL4hLm1/sQMEEEAAAQSaFyBo1bwVNRFAAIGeEpjOZnbkspnX5LITpwUx9zQ7JwkFcxoOZa2UwrhmAAAQAElEQVSKXrxKYt8fTo69qWHtbqrg5Jb57qjIifPL/TofHh17pohWPX9HRWXhpfIpH8xcWO/xBR9Qda74N2XDcPLJ3NTEWWV5LVwpuGJF0Mo90poPIdtai6bZ8en76jVXdO4d9j09IfUqVZW5mx4sv8pUZUdkWLDEX7EZUVKe5URPubd49EHf5/KS5tacc7ubqWn9iao2GdPiF8IFGn7fhwtCy07E/2xUJ3puKLtqsbItJxKrqrTEjKrxOHels/7Yz2wtSul2VxuJLqSF3bjZJadS86rKfH5vPjc1/mlr622WVFzwSFF9tdg+7A8Y0UFLtRKRZ+qRR+70D4Nfu/bUyCvNZvfOVwQQQAABBDonQNCqc9bsCQEEEFgxgTtun/hWPps5IzccO9I68VZxcrvNm5k2OHHvTiTTP/RXtjSzwUrXsXO6cHDucf7h5M32qRfrFYtiQavaPXdOX5+bzLy4do3eKhleP/YMtYCqpZFQz7+Um8r4ZwKFslq7eGj/nlutxX2W5qejjk5uXDO/0qp5PL4hrk7/QOq87Hty26Gp3X+p6sLv9bItrE7Zul+x743PNnt7qPmu9ds0k5zog6z+xfZzwlmyoId/VlNqazPb+u2arFdVzfb7omIx+FFVQYMMp1q6AimfHb9aRfwVqQ22mC/WegG2vfO1mpmrWCxJ5ICIftDGcaIFXM/3/RF7adGF32eWE5p0btnJUcPrH/HQubW6s9zULTfmJsev8PvQYvAKZ/8B1NxA5THWs50PxAofG06mtwgvBBBAAAEEVliAoNUKHwB2j0AfCzC0bhS4+eb77S/v77IT/BPsROnM2b+8N9XR063uFfFkenvXn8io/iQ8InXFtl19E97PSi3bCab/9Mjo3Tu5Jj81/sHowt7L9e89V3T+UyIXOu9EdjjRJj5tbWGTJS9YsOPwg/5FglhRjl1yYzU2DI468ukWz3hMjWKx78Mr56+ac04mataLKJjfLqKoKsuJNB20qth4s5aCimJBrJSLJ1MXV5SXrdr7d6mfZnm9BXl25fZnbihr0FbqBWVUCpsOTY4vBPums5kd2nTgyu235mtN4fdGrTqz+So56+O2fDazLpcdf30+O14e8Ar0ttmK9b86t8o/d6x+pYrSYiDHqL3BKrKrVlVki70HtlsQ8rKqQjIQQAABBBDooABBqw5iL29XbI0AAgi0VsBOlHb5v7wXVc/wJ1Aiep00eC2cyIykvxtfv/GxDaqvSLEfl+144UH06rTtn/Jm+1u5SaVmgKMYaPktdNK7L3/Lkp1Ev6tsBE5+ks9mzs5XnvSXVWrdihbddeHWgljsCeH1VixbIOrtNduZvQXy/Ply1aD2FTnzlebmzumlc4tNzVT1m76i/Wzws1IqLass3H5byqz5xX5aiPp/bxlObjy1VjUnusQPBnB/VatNv9eqMuu87evM6eyequCSD1xZR79Xtc3iMmqOMdyMdUPESaJeAHEmkO+Ht6m5XCwu/4MmnO9O6cudNfZzgQWuLPg4tjmq3F/5mEimLjg62VvPP4waC3kIIIBAdwnQm3kBglbzEswRQACBARXwVx34Eyj7i/8TnKi/aufyhhQqT9Zi7EeJkdQVdsLynIb1O1zBlW67mdup9XVuaeBm/tj2w6B9wErF+WdKbQiN59rcVKajgVOnEn7ot1tVWFUK7IT6tPzFUhBSI9ux8ZbdAhkUCz+PrGiZalEYmx2eVK45vNJ4yc1dxRVuxy9b/ohzbuHqplIQpn5zD3YS+8Fxo+m/iKpm2x+Iym+Q96VcduKrDeqUF6t82IKbC8Hs8sJS4ObDlXlV607iUuvlpGbwWEIvb+hX46PpvbVu77tr38RB10yQUTXl21pcKoa/h8S/TXyfnLpL7Xus5lVvVrZzOJm66tgTNg3L3CuRTO+cvfJRL1slsf+Krz25KYO5zZkh0FkB9oYAAj0rQNCqZw8dHUcAAQRaL+BP6nLZzGtWFVcl7UTmzbYHf3JafuuKZS5MqueJ6L/bycuvEsmx146MPOoh0hUvF76aYm29Kz26ortt6sQx61Mtf+ZSm7pas9l4MrXVTpi3hytYUNLf0rWoK4fC2y91ecbN3BTaVu8PHnhnaL2FizbCitbcbEC5LPeOqd3fFCd5iXq5w5kWGLrDf28fzmm8pMVC5LOeVGRYVR8134L6qMf8Su35g4tO/jYxevLfVlax7R9Xmddg/Vb7GfXcijoNrzhzomXvoYrtJT858QkLXX2oMj+8bkHL08LrZcsqZbclS8XLjkFZjjp5uCsMfaAsM7zSTJDR6WLtRFSPl6iX5U9nJ841pzOdyI6oKk70nGBm5sPDyfQWH0gWkfDVV2NBLPa7wgsBBBBAAIEWCxC0ajFo65vT1jdJiwgggEADgf37b5yazo6/J5fNPDo2I48Spy+yTWpepWBlD7ITvg/er/ftSYym3rnyt4oEZYG2ogwt8RYkG1m3T07+23cxfFI8vxwrBrVPsv1GXZ78ybGKvsK6WfF8Jb18OpuJPLG2um2b7p66db/Z/tf8DgJxTd0SNl+/xnwh2wIBGxZWKhYKQfHGiqzZVZXo29osKjJbQcQW/00W+dJYcN8iN2lc3QV/4YOQ4YrmuagHqVvg5JXh7eeWF57tZe3NZZXPmgnaaVB4l/0cCwcmyxpRkaHEaLrWhxo8qta+fSMq6mflSeV5iZGx3y/PnF3z/XVzt2jO5kR8VXfs8LqTnx5RUjMrVix+JKpwPt/vd2gm+DMbyzarV/VsLRtF6VlXVlb1XrVtTrJ8JgQQ6HsB+0nQ92NkgN0kEHRTZ+hLlICLylzBPH5IrSA+u0ZgRQQOHszclZv9+PQzNZh5sgWw/sk64j9JzWZVU9LK/3yVxPYmkulLVj/skTU/lr1qy5ZkLDRSFrRSKXbdLYwLPV3ugspPfRMq6melpKHlUkYPfokn09vtf0B/dcwJoe7fpiJn+xPrUF5nF12w8BBv2/G4pZZNNq694uSBygYt6HS7v2VsPn/Dhg1H+asHE6Nj54mrFTgzqfkNVL4gi30V5WdNbWIHyfrcVFVfSUUvjidTW/1ydKrVYCn/O2ZUL3hu73ytalbVfaMqMyJjet+tv3QSvDai6HCWc39+eGV2ae42v2G1vc/mHP7qGuGoe8vh2hVLTj5ZkVO1WtCh367KrJNxx9Ru/1w2fyvk3XPV/PzDc/mlrIMHb5n0t4y7onudZUR6B1IsfQKjlS9MzmnrA50LrbOAAALdI+B/Hi+hN7qEbdgEARMgaGUITIsRWOIPqcXsgrrdI0BPEKgQsJO671kA67zc0YVNzskf2O8ftT5N68G26VuC+++ftuDVu49du2mjrXdyKgta2Ylo/15pVSe4MKRyVyfRW7Evf3WVvWe+aO+tLRXt7RNx563EFVbhflgAZOE5Wk70nHBZS5YtGlDZjlM5Pp5MfzY+mvq3xGj6vw/de+QBJ7GbLGB1hahWXfFSsf01uUbPf9KKLWy1qFrzeVlWfHjy2/pkOU7kelH3Y1usO6kFrmpXUCvyyWahyQwutXE8NZQVXvzhwop1YmHZFqyle4oin7DFpqa5oNi9tSvrJnt/lj0frFhY9aZa9VW0VtF8/m/Zsd0+vxKeW1+utq0jb9Ocr2d/SKjT1/la5fNcNvOnxWLhMRZQ2+bnfr28xuxafv/EF6zsTBfxfC0nus5qGa19nZtU3G/OLTJDAAEEqgVcdRY5CDQj0Pmglf3v20zH+rEOY0IAAQT6RmDPnvvyU5lrprOZEVE934IJNW+psTG/KRabuTGeHHtv+CG+ls/UAgE7mZ+s1cyMk2NqlXVjfjyZ2mq/0/oT+MpnFu1yok/ONQq+dGBQ1g9/29T8ng7MLyxnbt8bG4aTqassGPIL5+Seqracz3F/qE5fIE6eZGtHW2puCuRdDSuW2m9Yq1GFG/LZzBlDM0NPtWDIy6zy/Zbmpuod2FirrtSZq7wwe0AK65zomX6en5y4aKGgYqFQGLpiISv0e6Zt+zdF0dNs26aDVnNXTR210F70wlmrR8dOT6zb+JJEcux/LZD5+uhqZbk1g4DW5S3+PVBWe25levY22OvnVitnDwyJ+0plZjPrh/bvudVfTeXnjeoPFdzF4vQsEam8XbD8PELlxHh8Q+2H1QsvBBBAYLAEGG1rBMr/s2lNm/VbcfWLKUUAAQQQ6C2B3OT4lbns+sdIUR6tKu+33hcsVU5H2l/hL4rNzPyfnaz+/dEjj/B/pa+s07L1fHa87Eor2/dYyxrvtobuu+/btbo0I2UPDq9VbcXzfTDT3hc7tfoKnGkLgLzXX+1ReUxXqtNBIEeE992KW2Dt/fltN3vV1gZbXvh0toX9qIjaP1nsywLKuX2Z0jPPFrvp0Ixm5rexYzC/GDl3qt+0Y/RoX3jgwM13WzDk44WhoVEn8gOfJ9F9b3RVzt67s3sO2HHf5edS53XngZv2FFXPcLNXBO3yc79u215sqexnQZ1mSkXFmdjppQX74sRGYPOoKXDu2xLELBjmHhZVHs6zVnZooH8azqtctuN+QWXe/HoskBfbHwYqg1MW3HQXHpzcs6hngs23uZj5wdlbxL/sRF/aYLv17kFHPaJBHYoRWKoA2yGAwIAKdD5oNaDQDBsBBBDob4FdM7n9mRumJzNv0PsLw6Lu72y8UbetPMTy37pKhyYTo6lPDY+mLly//nR/K6Flt26qfBC8nXxG9aV1O1zJlo44IvwJXmU9ielQwxPqsg1WYMVfXWXBzDts1xXj0B/bSfIbLQBS89Yr26bjkyuWPdNord7/wKOX04nhZNrfBhk6TrrI5lyt+rt8QLlWYaN8/1wjca4UgNbooFOpCfve2pafHK96GPidt900nc9mftOCMf9Tqlj9Zf4TPovVRaWcDaWvTX45NDl+fX5q/CILnp3p5369yU3LqwXyGJl71Ru3VfE/y2xWezIbMbr/Noezp/eNf92OVOSHB5TqOfkNqfE6uC+TyWUnfi8W6HPVB+ac/sVM4DZY3mU1Nmkie/FV8tnxXeartuUuS5GTBfPeEVlAJgIIIIAAAksUIGi1RDg2QwABBBCIFpie3nNnbnLi7Q+4mYfb2c3/s1o5S5VTIE5f6Jy+79fu7lwimf7HNcePpSorLXV9SIYqTii1pZ/yttR+tWW70El2ZfuqM7UCApVVO77un3Nmxz3q6iqx98bbNTbzXDtJvrrjHVvkDq2Pu2SR24SrF4uu6sHr4fLGy/Zd1rjSomvEk2ObRTVWc0PnbpdAnmJBxa0161iBBWpOsVnV5Jwrfb9b7yPLbYNat8RZUfsmCwqVBSGd2AgqdheVV1GltKoqP85NZp5SWrEv+WzGP5+qKuCjYqE9ld+yKnWng/vGvzTtA3NT4+8MP5i/7kZtKLTA1ZmmEhmAM65HxblFUHghgAACCLROgKBV6yxpCQEEEEAgJHD31K37p7OZv37I0D3Hq5NXWFH0Sagr3W716kLBf4zTYAAAEABJREFUZRIj6dss/cvqkfTvWP0l/x+Vn709cFG3Bdn++m7K79vT8KHYKzFoC1a9Oxab2W373mypNM0HAmy+LTc1/nfTt++5rVTQ71+C4Cc2xP+1VJps/KV5+EtUXri8xvLslUpao7RBtoVRLOBsoYla9VSPLzwwNFWr2OcPJ1NX2Xy1papJndszl/nkuXnlbGU+RECl7JlM6gNKFomR0MvnhVZrLvrne1UWWqD+c5V5fl1FYvGRdOWz3HxRV6a8BeDsfbnNUnn/VEb1qCPfWZ7JGgIIIIAAAksXCJa+KVsigEAPCNBFBFZc4Lbbbvv19FTmY/bX+TO0qHaCqh+3Tv3aUvWkcrydI744UPlWIpn+cWI0/RerR04+qbpi4xxVWbiCxZaPb7xFf9XwJ5Nr1pwy2i2jGk5uPDWRTF2QSKb9J71V3fKnotdqoM9sdOXOyo/HrQ31YVmBUR/UseDQL6y9hzvR+0XcTZZmn1HmLNcnm9WZ/PfRLqsWddWLv+XSmquzdf2iR4t9M0qdVyz2wJ/VKrbj/Peu9JwujaxiuZ+bfR6YPjSqgrksyzaqzWby/H799064rjZwCNddWHbySf98r4X1uYX81PgH5xarZ+oeV53ZvTml71XnPhnRwz+Nj4y9LyKfLAQQQAABBBYtQNBqUWRURgABBBBYjsD0/vHv5bLjL1t91H3DLnDPt3PBL9Zp71Hi5G8DDTJ2AjyeSI7983EjJz++Tv2yIudkZCGjKH17e6AWXeRD7f2JdmHVzB8sGKzQwvD6sWfY8fu4k5gFZNQ/g+f0yq6ouosswPF2/9yfyrJuW7d+zj+LacldiyfHzkkkUzdaW+fMN2LBkiNsfZWIzt4+piL2/SH+pfMLfqU8PchWN9h237d55XS67WdDZWYz62tmb9U9pnFdfa0F3m6y/WyOxzfEh9eNPSmRTH/FkhORt1qqNe2a3r/7G8H9959Xq4LT4NpaZe3ML0rw7TreTe/aBRp5RdVcA1+am1fMtOd+TqkGhyoGUVq17+kL7b3hr7QrrfMFAQQQ6E0Bet0NAj0StNJusKIPCCCAAAItEti7d++9+X0TX8hNZp5XGBo6zgJMz7Omv2MpahqyzLSI+5OiBv9jJ8T74sn0R4dnH2Bd8/8xCwIcPmlU8bdgST++NBbcV2tcgca8Xa3ituXHR09+gR2nnZZud0X3NdtR9KeOOXdlUfWM6cmJS/PZ8dlgjVXu5ikQd0+ofxv8FWSh9ZqL/hMS48nU1oQFq+y9aSfzuqmysv22k9LqT1CsrFa5vsH69O7KTL8eyMySPuSgMCNVgUXfXlRyoqfaeHbqUUfmXOD8JxU+O6peWZ6T2xPJ9DWW9/eWIifVB74aWdDmTHsf+ueo+avflrOn22Kx4nW1GnDifhRVps5FPf8vqmo35dUMtNl745y5n9OL768ufhO26AEBuogAAggsQaDmL/tLaKuNm7g2tk3TCCCAAAIrKVD6lLGpzBdz2cxTfQBLVF8tTvzJb61ujdr5zMvtf4btduJbsPSzRHLsQ/H1qeeFbyUsioYfxl4VIKjVeM/lF+VntfpcLLrIW69q1V9qfulKm+SYnaCmrrLjcae64N+sLf+8qvU2j5r22jE8Ozc1cf6SP+UtqtUO5BVFFp4/5XdXdLGaVwv5cp+GR9L/EMzM7NdSQErrvBfdTb5+VVKXr8prkGGBkQY1ahc7LVqQuHb5MkucqLzY2jjLUvSk7sfT+279ZXRh+3O1/lViDTtg9h+947aJ22tWdMHsrZs1KzRX0Au1nMh2//Nh0X21DRe9DRsggAACCPSlQI8ErfrSnkEhgAACCFQI+ABWbnL8itxU5inigkeKc39uVaIf4G4Fc9NpIu41WtTPBxrcakGTey19xcpOtDQ/rT06uTH8LKL5/J6fF1V/XmcQv1mnbFlF/gqj+Gj6DYmR1BWlK23EXeVKzzCSmreVOZGPWUDgbAtQnjidzUQ9h2lZfVrGxovYNCi7IkwD97KojePxDXF7H77ZknPq/szGXfuT+MTewarfNB//vC9bq5ic/sS+F66syK27qhYZchJ8cXj2isS6dasKnVYEyaxn4lNVzaVkaOVGFuRZyLLlu1YVjmh8tdbCFq1f8O9Ne4+q9WVbqfUaQ7fyUnHFl0tKz3qqyAyvqrroK+Dqfy+Hm+iaZTOYfQZbRY8sfyHHfj68Z/j4jScsZLAwcAJV3/QDJ8CAEUBgOQLBcjZmWwQQQAABBKoFWpOTm7rlxtzUxN/byeMZUpRHOyf+xP8/rfUHLNWbjrRCO+l1Z9h8YTpCgncNJ1NX+Vu0/F/+a6QNPrjlHxDty/3GNl/Sc4H8tp1IhaB4Y539WECvTmlE0fx4S0Gp5NjmYQt6WN45sym9fdgMLRAz7SR2k53VXyqqja40+pKdpF/0gBTW5bOZV/iAQMRueyYrnx3fpSqHr6JxGo8n0/5qknOGR1PfSCRT1yaSaadHHfl/Nqh3WbKp/imbc3qpuuKlIoG/Nc3qV0/2vXC+s++B6pJ6ObrR4i3bE8nUjcMj6Vc0+2D+wBUrrvhS24lPNlviFA5iVDahogtZ6oLz9++/cWohYwUXfPBpJnBr7Xh/NqIbXwpE/sap/EicfNICM1c70RPt59XbIuqWZdk2kR+QYNvXvKWwrIEeWNHQMbXunu4KwTtszjSgAm5Ax82wEUCgNQL2/21rGqIVBBBokwDNIoCA5PZnbshPZT5gAY/fdUfdt06cnmUnwe8VUX+Sd79EvCpOmsSJnuOT5V+s4nbWSL9YJbFMcP/9GV8+nEz/2ua/8Cf9synt5uY75+ZWlp5Plpe2lLoxkUz7vP0292lnfCSVs+WDlubzrV7al1kq1d+ZGE3vtPIaqVTH6pa28XUmLQixz9cfKup1TuRABIHPWmMBlY/Gk6mt4WTbXRYvBVrSPqDxAVuftLHe7PNmx5v+ZSkoZU7W9nbLu2o2yRZnjtZwwlKtyX/q23fs+GxbVVyVzGUzz52enLj07uyeWn2s1U7X5pvB34Q7pyJbvI9z+jQRfYLMvmpecTZbLAesnfdZOjE/NX5RLjvxFZGiv6Vyrrh6lrfvgaJztg+p8SDv6m1mc3STBUo+Uhgq/tCO9c7ESPq24eTYG2fLqr9O79/9DcuNfO6SHVcrWvykFsSos+0us3u9vVc0NzX+6cW33r4tjrw/tsqJ/FHlHpzo56azExfnJzOn56YyL7Hlcy2g6d/7lVWr1rUokZ+IWizEbquq3PUZQdmVh7W7q3/CJwrW1qEEAQQQQKC2QFC7qD9LGBUC/Smg/TksRoVAhEB+7958bmr8y/nsxJty2fEn5I4uHFtU+Q1Vd56dSL7Pvhu+ZZvda2mpkw/IrPUbO5Gj/FzEP4fIJ7FXaW7BhdLcX4U1nyxPLC3k+zZ82qyqcRE5zpKvW8qzZT+3VKq/WZzYtrVSqY7VFZ98vaQFIfzVGn75JJVSvkS9rOzlKmqBusPJ6l2gIhZokS0i+joRSdpYT/F5tuynE/yXxSTn5P1O9NxcNnOipafa8dnaLVfMLGYczdTNTY77W/W+2kzdiDr3ibgPxmaCR1uQ442Wmgp0zLdzaGriW+b7XG9teddYWxVXRVlu7ck/Y2yzxY+Od+LeYwGsz9SqWnBB5MPd1TautU0439oPr5aWq7Z18smi6hk2njPzU+MfLFXqsi8zQzNRQbSv2HGreVVcwyGoVH0CpYpM3Hngpj0Nt+2yCuawq9ku2c/oFx43crIPuja7CfUQQACBZQvQQO8LELTq/WPICBAwAWeJCYEBFdiz575Dk5kfTk9O/JOdQL1xOpt52hHuyDV2EvhvYRH7LvmBrTd6PpZVmZ2iTrpnSwb+q78axJ+ovseCcc+KxTRtQQfNT2XeYP5LP5HvNVanl9t7anHP5XL6GbM6KpedeP3Bg7dMLmfI3tra+gOV4tnq5BX2fs9WttfEe/h5cuqpR1Ru59fvnLrlM6IaFbDxxRXJJEqTfZkrUdG5peqZBVy/qDH5/3JTmZccmhxv+nuyuqX256gEPtAs4ZeK+tuUw1mLWjalqiutLC8VT45V7WtRDa9c5VrH8LsVXUoWNfibHh5nxXAGcpVBI4AAAh0XCDq+R3aIAAIIIIBAmwWmpm64R8TdFd5NsTD0IjvJP8OJnmkn89vmk9XxAZhSUnE+6HK55V2uIv+jKt+z5f9zIjtk4RMNnb+yxeqX5v4qmfk0l1fKn1uWT/j9WBt+/b98+74tnzc7t3ZFLPjhFvozW1a+bttbHdkxu43bZn2zgJx+ebauz3f+gdH3Wb3qyYl/BpjtX0Kp1Ed/u94BG9cnzeq2+bb93No/2/JeM9u+nutEz/VXxNjcX0X1UHM809KbpyfHv3bw9vEJGcBXbmr8yzNSeM2slTS6Xe/Xvl6s4M5bItXmWttNZ/fcPD2V+ZgTGa9Vp07+kYmDhbFa5bnJh7zM2vXB3lpV5vJtdKXJvliOvW/sa+S0y9n3X34y87zp2zPbI2t0UWYimXq2defhlsqmokitIE1ZvcYrZTX2WiDS/ywpy+yFFQuafqdGP0+xfP9zx2YL0xPt5+Cb16xJN7p9dmEDFhBAAAEEBluAoNVgH39GjwACCAyMQBArzPjB2onhLn/r2nyy4IsPwJTSdHbC3972mlw2Y2niidOTmSfb8sPz2czZuanMU2xZc9mJ02xu9UtzH8SZT3N5pfy55cyf+P3M1f/taWvft+XzZufWru1rdn1ia615rlQnc/bsNhNbp7OZP8plx8+are/zJ7ZaoODv/fiqksqqWCCvzmUz1qf5VOrjOstbZ+N6SS478dD5tv18OpvZkctOXD7b/vjV+ez41f6KGJt370l11cDbn+Gf0zVdsso81yzt3F3fJM79ne3ZP6PpUjsm29S5V1nZg329gwczZYFUq1c2BaI+IFqWN7tSCjLOLi7mq5NvWvV6wazrc/szN1idGtP1FvDUs50P2taoEZWtoausDOW/RfV8M7DvncyZ9h6qDGJENdEdeU5fvNARQ7AAr8Vy3ZXLHYOK+IDxQtOzC84C7bNLvfbV3uf+2YJR3T5OXHCFFVSO94LikDzL8pkQQAABBBBoKBA0rEEFBBBAAIGBE+iHATsnkQ9o74exRY1BA/UPz44qElco+mdqRZaR2ToBC2a8Nzc18XYL0JyZnxq/yAf9pqcmPtL0Hpy09uoTDd5hfTnFgiQWeCpdjRcOmn3Vgg1fbtQ3G9PevAVtLVrzGqt7jaVbLTUzfUmcnjXtg72zzwBrZpvuqqPyjIUOGaJYUpUjFvKWuGDulUEca0kj8iy7B6bc1MRnrJs1rj4r/nngii+y8rKpqHpeInHS6rJMVhBAAAEEEIgQCCLyyEIAgdYK0BoCCKyEgOrhE07bv3OFvv4/L7cv8982zMipoOpvc4osI7N7BOxE/ufRvdFN0fnN5fqrvHwALXd0Ya0FsbRQGDrZ5s/xec21IJLLTul2CDIAABAASURBVFxu2/yBpY3BA+4ElcImnyw4/AoLwvhbVkuBMVu/UIvFZ1i95+amxhsGxZrd/wrV69mrnzru5eSXkftUeZTTYFic/ETmXvZ+EfWfgnnk0JPnspghgAACCCBQU6AHf4GvORYKEEAAAQQQqCVw4NDU7hoBgVqb9GC+yhejeh0L9MdR+e3OW7M+nR5Opr6ZSKbdXLo+PjL2Ph7EXEP+3nsXTuwrawyvf8RDK/MWvb5nz31+m+V+St0dd0zcXnqWVnbPzfmpzMd88Gs6m9nh57b+D9P7d9e86s/vn9R/AoEUo29PtqEWxZ2v4i73wSpbFbV/fm6zd5TmfEGgTEDL1lhBQASDQRcgaDXo7wDGjwACCPSvwODdelJ0/xN1OAtFTUTltzMvMTp2XqEg1znR3w3t53Gq7kI7gf3FcDK9JZTPognoEUc+zGaRk5sZanQMb67ccEZmajwjq7Im65ECTvJS8bL38yMrspawqqdWbuQin3NVWat71++Y2n2dU4n8UAYV/Z2CiBVr+QCKmizPYK0jAl2/E/tu6Po+0kEEEOikAEGrTmqzLwQQGByBit/NB2fgXTXSn4Z6Mxgn7yp3hsa8sBhI8bcXVjqwkBhNv1icu0JUagYO7bRkezyZ2tqB7vTMLnL7Sw9Fj3wWW2xISldJ1RlM+fOwnM4M3TvzQJ36FDUUcN+PqHJ6Yl36UfP5i537T82z/x5+q3o7VxV0rK7T3TmuoO+r1UM74fiDqjKVZDw5trkqnwwEEEAAAQRCAvZ/SGiNRQQQQACB1gjYGXlrGmpfK3bi1L7Gu6Bl59xjFrqhoeWFzP5bcBJEnvgWRf63k6N1TqpPUCM6oKIXx5Pp7XNFzGYFJmdn5V9nCpIuzylfs/d7+VUr6oaCo4bWl9dibVECQRD9cPGYPmFR7YQq33eEO95WQ8fK2aqzGK/7uC309HRo//gVNoBrLVVPqr8v4qr+eOBUwh8OUL0dOQgggAACAy9A0Grg3wIAIIBAfwo0HpU/VWpcq4drqCxcZWJBlIXlHh5Rw64H4tZGVVIXNLpKJ2qzJeepyOOa3djqbhnmVsEw18PDKwvL6uqaBqr/tFB3duF6/9yp2UW+LkUgN/uph1WBKy26rUtpz2+zqqgVtxfad4DIdw71yTP3nLiv+3FGJ60KvJplxFVn0VuTiwACCCAwmAIErQbzuDPqxQpQHwEEek7ATgX3z3c6vDyfN0hzpxJ59U4bDY6t3barKrKc7Ylkes/qdRsfUVU4cBmu6moUTxCIRub7Mp8sWFAZsDx99ejY6b6MtCyBqiuB7PtpdKktWgD9RdXb6veq83ozxz+M33q+y1LUNFSZGajcXpnHOgIIIIAAAmGBILzSqWX2gwACCCCAQPsFdNPhfYSXD+f225LT6AeuB+Lu6fBYKwMood1bCDG0Flp8RBCLXTc8mrowlDeAi/qgqEHXOrbzdVX0wPzy/Nx+ySNoNY+xxLkFmSI/kTO+hOexlZ7fpPI8qXjlspm3VWT19GpR9U3NDsA5/XWzdamHAAK9K0DPEViOgP0+s5zN2RYBBBBAAIGuFdgb6ll4OZTdZ4vOPTpqREXRH0Tlty/P1b0qqOZ+nRznnL5vKQGBmm32XsFJUV12rlj3+VSFmNxRuZ1z7mmVeawvTiA/lfkHifgUwUCCqiuwGrWszv15VR3nrqzK6/GMQ5Pj15vZJxsPw4lTubtxPWpUCLCKAAIIDJQAQauBOtwMFgEEEOgzAY0ez9HJjf5Kn/An162ey4veoG9yDweL7HRwYVTOFTr8/330FV+iklvoVJ0FFb342LWbNtapQlGFQFBwFVe3OON2oQd+V2zA6pxA45mq+0JlraK48yrz6q2XbtVUeUZlnUDlo5V5/bCem8q8xMYxban2ZBGrfHa81q2EtbejBAEEEEBgoAQ6/EvsQNkyWAQQQACBdgu46B3cnd3jb5VKhEoTc3mhrP5bNI5186OywM/8ohzq1EOeF/YoVQ+vLhUV5dta1CeJcz8vrdf5EovNfKBO8eAVuaDOc8JEVCT8fhcRFS3Kt4TXsgXs+2pHZSMqkird7ldZELEej2+Iq3NvlerXrjuyE9+vzu6PnFw2c1zdkQTuK3XLKUQAAQQQQMAECFoZAhMCCCDQjQL0CYHFCgQyVHVyLSKHRE5fZfOOTXay+lyRw1d9+R07dd/Q2Mzrp/ePX/ug2N2PdM7lff5scrOz8q/PtqDAOeVZA7Dm5L+jRqnqHhuV7/MSI2O/70Sf4JfLksp42TorSxO4b8Yfk6pAqzp5YqMG16xJH6NHHXm+Bbm2VNV12ne3BlaOUX2QWiTiaiq9Jzc58XvCCwEEEEAAgQYCBK0aAFHcNwIMBIGOCdjJScf2xY6iBaJuBYzKi966d3ODWPGBiN6vjifvOT4iv61ZuezEabaDt1jaJarn5ycnnjG979Zf2rrs27fvV/mpiYQTmQuy1fqucc/x9QcpOdFaV95stiDe5kqLNSMbz5LAvaYy39b3Tk9N/KvNmZYpkMv9/JAT94mqZtRV3e5XWac4JM+yvL+3VDntyk2Nf7oys9/WfZDagthn2vv6TKfyUSfyfefcR2MzenK/jZXxIIAAAgi0R2CJQav2dIZWEUAAgX4QsF/K+2EYPT2GqFsBo/J6epARnT94+/iEZe+yVDapuDf7Kz7KMjuwYier77Z0Zm5yPPKKknw2c7Z9v8wFrqo7ZKGsLceesGm4uqR/cwJ119YenXvP+vWnP9g/HymRTH0gkUyPFzR2jbhSYKR8M5WPlGewthyBWCCfidh+c2Jk7IUR+aWsxLr0o5zoFXZ8SuuhLz/33xeh9b5fzGfHd+UnM6/MZzOPt4D1Kw8evGWy7wfNABHoKwEGg8DKCRC0Wjl79owAAggg0CaB1es2PqKy6ai8yjr9sK7OfSpiHBfMXfERUbSyWXYSe7ZT8c8gi+xI7IGZiyIL+jSzUCz8qNbQLIh3+q8Kd2UD534ooq8TkbSlyMk59be0RZaRuXiBO/ZN+FstL6/aUt071xw/lqrM94FFVf2aiEuIHbhweeRVW+EKLPe/ACNEoG8EKn7A9c24GEg3CRC06qajQV8QQAABBFoioMFQobKhqLzKOv2w/kBMPm/juM1S2eRU31OW0U0rTm6u3Z3iibXL+q/k0P49t9qoPmwpcrJAyDGRBaFMJ7Ijnx2vuuIuVKWvFjs1GC3qv0Tsa8NMofiicL6/FdkCix906pLhfL9sAatt+ezEVr9MQgABBHpfwP7H6f1BMIIuFyBo1eUHiO4hgAACCCxeYEZm7qncyk7i91bm9eP6XfsmDtq4qp+V49zD4qOpf7KyetOKlAXiah8bDdavSKdWcKe5bOZPbffftbT4SeU/1OnHF78hWzQS8M9nchYQrKynohfHR8be5/OHj994wpAb+nNbrnpIu3NyIQErk2FCAAEEEEBgEQIErRaBRVUEEEBgcQLLqa3L2Xjgtx2SoU2VCPFkamCubojFNPJ5RoHTEypdumHdueCz3dCPruqDavWDvxt0UMX9UlT+Njc1/uUGVSleooBTvSRqU1V3YXw0fb0rxL7ilyvrOHHb8lOZf6jMZx0BBBBAAAEE6gsQtKrvQ2k3CdAXBAZKwP6eP1Djbflgq67cUaePbvleurTBuQeyV/XO3lX+k8yq8lud4T/lLpFM7/TJLzdq32nxjEZ1Bq3cP7xeRbc1M24LiEyJc58pSvDU3L4Mz7JqBm2JdQ5Njl8vqudHba5OHmf5j7RUMbkPcoVVBQmrCCCAAAIINBKYKydoNQfBDAEEEECgfwTmbgW8PjwiVZcPr/f9snORn9i3JuKh0a208EEqFbfT2tzsk1/2D6W25ZqTBWd+u2ahyPfrlPV10XR2fKsE7rfEyU8k+uXf4++xgEgyNzXxwrn3fXRNclsm4AOKFijc2mSDl7t77//rJutSDQEEEGibAA0j0KsCbQlaaa9q0G8EEEAAgX4SOM5O9qWUbFRO9Kk2G5jJqUxGDbbWVVhRdZeSp+K2VG4XuOI/J0bGHlmZ79eHR8eeaXMf4LJZ9WS/U/ywOndwcnL7Jr6bm8o81hzOduK2+eSXVQqbctnMGZbePDga3TNSCxRuUyeNbvezgNV9f5HP7x2sgLkMxItBIoAAAm0WsP/t27yHXmm+LUEr1yuj79V+8v7t1SNHvxFAoLMCx4j/eelTab/u16UZX9oq4MQdqN6BbhJ1UZ+8JkVXrHpgdXj7QrHwo/D6oC5PZzM7LFCy1Se/PJ3dU+cTF3tNqTf7Oz2VudDe79ssLbznbdkPZp/92Dk7NiNvyxOwEl4IIIAAAggsR6AtQavldIhtmxAgKtgEElUQQGCQBfwtajb+4ywdnjS44/BKHy/ND02DJ88vdnIeC+QzNfb3qEQy7RKjY+8Il6vo68Lr5cvug4f277m1PI81BLpHwAcR5d77U87JX1mvdlmyIJY+2QcWDx7M3GXrTAgggAACCCxBgJP+eTSCVvMSzBFAAIEIAbJ6VcBdUNlzVyzmKvP6eV2Lbk3U+I5Oblwbld+qvDv2TYyLutq3Yjr3dgsqnuP3l0im/HEa9stRyUnAVVZRMOR1lYC/mio/lfnbXDZzpg9i8Wyxrjo8dAYBBBBAoMcFCFr1+AHsse7TXQQQQKDtAhYQ2awiVc9VGirE/rTtO++mHaimoroTFGPPiMpvZV5ucuI7Iu6DtdpUcVf54+RE6z3LKmMn/1fXaoN8BBBAAAEEEEAAga4WaEnnCFq1hJFGEEAAAQS6QcAHQixY4q/eqezOlw4evCXyweSVFfthffXDHpkQVzwyaiyxQP4lkUx9IKqslXmqwb/XbU/dizUiuDi/jQW0rptfZo4AAggggAACCCAwmAIErQbzuDNqBBBAoO8EfKBGXfGFUYEQC4B8ru8G3GhAqnfXrqIvrl3WmpLpyfGvWUv3WIqenHtldMFsbuAKn5hd4isCCCDQBgGaRAABBBDoCQGCVj1xmOgkAggggEAjgdj99z9NVM+rrqfXDdptZnr/A482h9WWak3Dx42c/LRahS3Mv6xWWypaq0icuG13TO3+Zs0KFHSdAB1CAAEEEEAAAQTaIUDQqh2qtIkAAssSqH0qu6xm2biPBeLJ1MucSNSVObdZBOT9PTb0VnR3b6NGihKUHobeqN5yynPZzFtte/+JajZrfnIafKn52tREAAEEEKgS4JepKhIyEECgNwWC3uw2vUYAgX4WcC0dHI0NgoA6faeNc+4ZTv4d5JNYvMp9NDc1/mkrG+jJmUQVgMqLj1uf/oOq/BZnOHWLe36Wk68fmhy/vsXdoDkEEEBgsARm/xscrDEzWgQQ6EsBglZ9eVjbOKhWN81fgVotSnsIDJTAmjWnjCaS6WtEZf3hgc/+YLFAzbZ8dmLr4fzBXVIDihp9sSjb4yPp50aVtSovPznxeWur2autfuVihbdZfSYEEEAAAQQQQACBlRbogv34dXJAAAAQAElEQVQTtOqCgzDQXeCvQAN9+Bk8AssVKA4V/BVWZ1W240R3Dc3ErqjMZ71K4AiLZ30svvbkx1SVtDDDift2M81ZvXfn9+35cTN1qYMAAggggECvCdDfLhXQLu0X3SoJELQqMfAFAQQQQKDXBOLJ1FYLTlU9l0lVvpfPZs48ePCWyV4bU6v6u6oQHBQntzbTnv2edpwGwc5EMrW42/iaaXyuTjNXvFk/zm6m3lyTzBBAoE0C/mdrIpl2PvnlNu1modnhZHpLYiR1he3vF5ZK+7X5L+PJ9Pa4/ZxPrE+9Np4c2+zTcHLsjT7Pp8To2HnxkfTrV4+OlT6Awwffjzl+7LiFhllAAAEEmhVwzVak3koIELRaCXX2iQACCCCwLAF/cqKiF1c2Yr9z/GB6MvPkyvxBWz9w4Oa7XSDHhMftLIoVXi9bVomL6OsSydRuadMrl82oNf0uS+WTyk+d6JnT2cyO8gLWlipgJ/cbhpOpqxLJtA8CXGZzn3Ym7OTeyjYPW5DAJ1veYCf8p8/uR+To5Ma1Pq+U5q6+Wz2aPmONpeOSqd8YHjnlCRZAeMpxIyc/fs2adNn7a74N5r0tYMf2aRr62eqX/XulHaNKjKSviSfTM05ku6j6wNOG0H5OUJEt6vtS1A+quJ0+2c+x9/g8n8S5K+yPFO8PbG7vcaex4MdDM26PLd9ubf/Y2v5o3IJe/j2+du2pR4faZhEBBBBAoIcECFr10MGiqwgggAACInZCvdlOTi6PsgiK+mdR+R3P64IdBk4eEu6GneSFV2ss60Y74ftejcJlZ1vg6q0qhU1FKb7bGrvgASmsy01mHpPPjjf7zCvbjKmRgJ3cf9uJnmP1fBDgApv7tLl0km8n/86CBD5ZvV/YCf8P7ZiXrm5ZJbH9Pq+ULADg8+199IOCkx8URb/vtHitFPU7RQ3+pzAkd1r5tKXSthHz++PJdMbyfftfsflb/FUywyOpVyZGxh6ZGDnltJGRR5W9R62fTCsocNzIyU+zY/uNyi4ULXhUmbfUddvH4+19sd3eD86pO0tFYkttK3K7UgBe1ovKY1Tk5WpBL/8en4kV/8sCWbdZyg8n037/O4ctsBu3oJb15a3+/5X5NGxB3UQydYEvW7M+nRZeCCCAAAIrKkDQakX52TkCCDQjsLJ1dGV3z97LBOLxDXE7oX6WiDzRUuV0ySo94obKzEFddypVV03ZSeL9TXg8cXUydVkT9ZZUZTq75+ZD2d1vsQDWP96d3XNgSY2wUU0Bf8JthQ+z1IkpUWcnq+ynZ8rK/ZVcz7b5Jf4qGaf6T6LuBtHiz+7X++5KJNN3W9pv6VdzyQfBfm3Lt1jaa+kOSwctTVq63dJBCzzkbH7Ikt/eB898G/fYul/2+Xlb9gG12xOjqU8lRtOfjCfTOyx91nw+ZmW74qOpr9v8iz7P2vu8zf2taP+WGBm70q/7bSx9wepcY+nf46Nj37Btv2XL37F0vdX5sc1/lkimdieS6f+zdLsl30/fJ99/P45ayY/V99GPbZ9td6slG+/YTdaP7yeSqWsTyfR3/D5tP1+z5Wvm+vLFRHLsn62OH8cfmWlLp4IGkd/3FvSpCmQtZcf+Sr+iBTztfbHFb68WWfLzziT3WNvd8ZZWW8DW73+zEz1HLahl+/97+3+ldCWXnzuR7SJ6mS8rFGXc/CNdhBcCCCCAQEcECFp1hLmrdkJnEEBgUQL26+ui6lO5XQJxH7A66sh3iMhbLVVONzjR/5iauuGeyoKBXXduVeXY1ekRIu7nlfmV64HoBf6qmMp81rtfoFh0D3R/Lxd6qLbkr7Zaa/MHzSWbyVH2ZczSwy0NW/LPKUrafL2l4yzwELf5sZaOtuRvU/RtPHhu2eevtmUfUFsvTl8oTl5kO/ojS3/oRM61st+274Wn2/y5Pk9UnmdzfyvaC0Tdq/y638bSH4iI/6CH56hzT7Ntf8fWn2LpcVbnMTY/TUQ3ishDLc32TcT3yfffsmpOfqy+j35so1brJEs2Xneq9eM3RPQJIvIUv0/bzzNs+ay5vjzXvn//xOr4cWw/Zn1qjZW1ZIonU1ut3VRlYzbmHQ/ExH8CaGVRxbptXZETXvW36Pkr/cJ5PbS8RU499Yge6i9dRQABBMICPb8c9PwIGAACCCCAQN8L+Ns25KijPmoD9bc52Sw8uZty2cyj89xiFkaxZY28islOQj+h4q62CnUnJ8VzSyeadWtR2G0C+f0TX7A+XW+Jqb8FNHCxh7ViiLMBK704ui29/K59Ewejy8K5LrxStrz6YY9MBM59uSyzt1bWJu4ocptgbx2zNvaWphFAoNMCBK06Lc7+EECgBQL1/6Lbgh3QRJcJBFp8rAVaXlDZLTtN2uEkeG1lfi+tJ0ZSfxwfSb9heN3J/sqP1nXdib8aRaJe09mJc524bVa2y+Y2i5p0U1AsnhdVQl53C+SymTOcqB1jse8Pt82OsT/WvtP+KrvIYKYvHPB0X2+NX//r0OQtP1punxPJ9D+q6BtrtHNJK/4YENx/n3//+SvlqndTneOfb2c/l2TCFzknD6jIvba815Kf5ue2rP/rRDpx3HblpsZ/ZjtkQgABBBBYAQGCViuAzi4RQGC5AvZr6nKbYPueEfBXATin76vusLtJRL/SipMqWaGXnTDeLqqfVpVLXRD4Z+xc07KuBG5Dvbby2YmtFtw4U4ryMufkJxL1Uj0vsS79qKgi8rpPINwj+764Op/NnO2Ps092rNXSI4pHHJG2uTrRE4uqZ9j773zb7m0+sGXBgatsORQUsLXWTfeL6HUisst2/re2v4s10GcWZ4LTHxQc/RCV2GnBkDthVXFVMhD3m9a/M5eb5L4H4n6sTaajmqznHbsgjf+2LPO1eiTlb7d+tTXjb2m0mYgdl9LcvlxvHm+z+bKmDRs2HCWifyj1X9NO5LMzgVtr+zzTJ3vvlt6n+anMEdPZzIMs70RL3n1+bsvjG6xe6bhpMPMwJzr3nrGAvBN/xaEPgIm9/Hv6FzY/ZMlPt/kvDdJ8cPdd9vPx0gZ1KUYAAQQQaKMAQas24tI0AggggMDyBCyos1NnH5Rb2VDWzq7+Np8dv7qyoEXrbW8mnkxvt5345+DYbGE6K5FM3biwtsSFxPrUU8Rp5JVWKjJ/MlZqPb9/4uOq7u22Enki5wL5Sytj6hOBQ//3s5wfin3v7D00OX59bnL8SgsGXOIDWxYceLktn/ig4K6HuKDwOFuOico7xLl3qui2ZpO1/xZVfVYpiFB0j8llR1dZW0fmsuNPyGUzZ05PZf7K9vc30/vGv37o4C0/2rfv+l9NZ2++6Y7bJm7fv//GqTuyEz+w/u1absrlfj4fpLAuMYUFjkumfiNQ9d/34Ww73Dq7rnrl7MLyvt5579BJ1kLlzznLmptUz7f3xHH5bGZLc7chzm1XMZved+sv89nxufeMBeSnMs+3dn0AzIJbGR/oOsnW48ViYWNsRk71702VwibLUxvx2YErPt0v+xSbCdbbfJ0lv+1bLXDWuj8mVPSbVQQQQACBxgIErRobUQMBBJYtQAMILF4gkUzvtK02Wyqb1OnntagvyE1NfKasoMdW7ETpmdFd1k029l8u53lSrihPi25bpFgs/kdlWS478VXL+7Slqsn6ucUCbP7h1VVlZPSnwL59+36V37fnxza6Ym4y85f2vfYX09nxrc0mO9l/9/Tk+NdKQYT9Ez8V2TVjbTF1kUBB9M31ulMszHyrXnmzZUEQK9StWyz6T5esW6WVhYf277n14MHMXf69OZ3dc7Nvezqb2XHH1O5v+mWfDh68ZdLPSQgggAAC3SFA0Ko7jsPiekFtBBBAoO8ELDQyN6Z4cmxzfGTM3w5YFbCyKuNBQV8zvX/8Wlvu8cn9ss4ATgic+2F8JP3+OnUii7yfRl+dJqLyH/6kTSJesZnA3wITebVVoPKhxMjY70dsRhYCCPSYgAXFnYpsqd1td1OtnxO1t4kuObgvk7F9ZaNLLVf1vOFkyt+WaitMCCCAAAKRAgOeSdBqwN8ADB+BwROwX58Hb9A9MGIX6qO7QNVdGMqYX9yVy2ZO6Ze/gquofzjx/Ngi56ry+uGRsU8du3bTxsgKFZnD68feFEjxQxXZC6vO6SULKxUL3tWJ85/QKBbckvDLOXmwU/cnPiAWzmcZAQR6S8AHrBr1WIuRP38bbVanPLhcpOxnvNU9vO5Ez+Fni5EwdUyAHSGAQG8JELTqreNFbxFAYNkCbtkt0EB7BIaT6S12QrVTo68A8AGrM9uz55Vp1d+SYkEiH7iKvLppvlcWLHphLDaz2wJSz5jPq5z7Ez6zu8EV3bud6KbK8tl1vc7fEjO7HP11aCZ2hRPZUXZ+OVe1dFycPHdulRkCCPSYQDyZ2tpEl782vX/3N5qoN1+l4Xw6e8v/s0oftBSa7CdK2Zq7OLTKIgIIIIAAAgsCBK0WKFhAAAEEEFgpgcRIygdL/IPJq24JdE4vzWUzXROwKj/VWp5YPjux1Ym+1PlAUYOmLCD1tfho+l4L7k0OJ1Pb/Qno8Gj6HyxYdY2K88//emS9JqzOe+uV+zJ/tZU6/bj1J/IB1v4KOL9fbhX0Wu1ItDnwAq38ARPCHF538tNV9GIXFZFeqOd+/KDgrhcsrLZwIZedeL069ypr8lqpvJRTRJyTh9qMCQEEEEAAgSoBglZVJGQggAACCHRKwD9s3IIuO0X1vKh9WvBkh6gs7ZObohpsQZ71qQWtHG7CX/2Uz2bOtpwvWSqbKk8w1cmRtv+kE91SOgF18me2wVmWGk37prOZHY0q+fLc1PiXbR51e6Zlix0OvVjUfSm+LvU84YUAAq0VcK1tbr61ogalKzDt58Z8Vtnc2R8HHpDiM/1D+MsKWrgyPTXxEfsDxJOsyTsslU2qOlSWwQoCCCCAAAJzAgSt5iCYIYBAfQFKEWi1wOqR1JXqij+0dquurrI8+8u7XuqDOfns+C6/3u/JTuaeayeUW8PjtPXw6pKXNVZ4/GI2zmczV4m419TbRgN9S73yFSnTFdkrO0Wg+wXUxet10r51XrjKxSYSI+nP2x8Srpm9ojL9eT8fTqbeY/P3JkZSf+xvRfZpzZpTRuu1V6vMb2tlzlLZ5MQdKMtgBQEEEEAAgTkBglZzEB2esTsEEEBgYAUSydSz48n09kD1VSoa5bBXnL4oPzV+UVRhP+dNZ8e3OdGmboW0k7yGFPaf/OUWDNPp2/fUfW5WVEO57MTlFjm8MqpsLu+Jc/Pumbnu6Qo9QaCrBJz+qG5/1CXtx3Hckr+C8iwVf0Wl+OWLnegbbf0iUf20itvpU2GouC+RTLu59IvEaPq79nP9Vlu/YTiZ3mHznYnRsfN8kMrShkQydcFwMvXvflsRWWOpbLL8vy7LYAUBBBDoLwFGswwB+312GVuzKQIIIIAAAk0KJJLpSxLJMTtx0q9o9MPWcxaI2VZU2ZKbGv90k832XbV8LgrlNQAAEABJREFUdnyX+fjbBQ/WG5yK1isWVXfRHdlM3aul6jZghU4Dfxyut8Wo6dqoTPIQQKD7BPJTmWtE3KHF9kxFm9lkgzj3ZKt5klV+pBP5I5tvtrwrdDbI9QsRvcyJPkeiX9dakPyr0UXkIhAlQB4CCAySAEGrQTrajBUBBPpOIJ5MbU3M3s7x7mPXbtrYbQO0v7Bvtj5ebAErZ317i500PdbmVZMV7tCi/p5/MPmhyYy/ZbCqziBlTGczO2KBPMUH8RY9btW/K6qeMT05cemit63YwAfQAlf0ga+vVRTZqWzhlZV5rCOAQPcKxGKF50f2riWZFrJaWju32c+5qp8vS2uqjVsteXht7BNNI4AAAgMiQNBqOQea/8CWo8e2CCCwTAELBP1QD9/C8aZYbGa3f7D5Mptd9uaJZOo5iWR6pyU3+1d23Vqn0Z9LUR6dz2bOnt4/zpU7IaiD+zIZH8SbCdxaV7pl0H1InWQt8HevVQs/5+tOW/cnfe/2twLmJsfffmhyvNbVUVZ1cdMdU7uvs3af5cRtEydfsP1/yPdnOrvnZuFVJUAGAt0qcPD2W3eK07PESV664OVEdtjPk7+zn3PbuqA79btgna1fgVIEEEAAgXYJELRajiz/gS1Hj20RQGAZAsPJ9Bbb/HRLZVPg3HvKMjqwsub4sVR8NP2GeDJ9nQ9Uiei/i0jkw9Vl/qXyE3Xujy0Y8ojc/swNEv0i1wTu2jdxMJ8d35XLTrxueiozavMHmduZlnQurbb5syy9xaq3bbITy625qczzbf+v8/1p245oGAEE2iaQmxr/sisWzywFoUXq3oLctk5Yw87ppUGscJH9PLncVpkQQAABBBCoKUDQqiYNBQj0mwDj6SeBorhNNcbjb8fbumaJn+xUo82q7PhI+g2JkdTbLEi1s1BwGXVyqYr8ZlXF6oxrrd7ZucnMY6enJv61upgcBBBAAIF2CuQP7P5JKQidzayVQJ5if0A4z/Z3uVP9ps13qbirxclPLOWdyF4RV5D6r+vt5/pVVv8KceqvCH2FVd9l6ecWHJuyuZ/22pdxa+s7TvTE/NT4RdNL+IAIa4MJAQQQQGDABAhaLfWAsx0CCCCwggKB6E21dq+iF88MFd/vnydVq85S8n17w8nUVYnR1KdU5VJR/Ttrp/4VVVbBT3biUvpUvNiMPHM6m9nh80hNCmiT9azaIqpabSYEEBh0gdy+zH/bHxD+KZfNvCY/Of50m585nZ04NzeVeaylRD6bOfFBwd3HuqDwOHfvfQkLOJ3pn5nn5z755Vw2c4b9XH+51X91bmrcXxH6McvzV4M+woJjSZXCJvvZ/yjLOyWXnXhqPjvuA1iDTs/4EUCg1wTo74oJBCu2Z3aMAAIIILBkgenZwE/N5xZZ8GKL/bX8ExZoeq+lDfM7iq89+TF+efXIyf5TnvxiZPLbWCpdteWvprLkrL2ddpJyjjh9YeRG5Zm75gNVdqKiduKy1U5Udh08mLmrvBprDQVcwxoLFRZRdWEbFhBAAIF6Avv27ftVft+eH+fze/P+57h/Zp6f++SX623ry/zz7/jZ7yVIYQGWEUAAgWYFCFo1K0U9BBBAoMsELBh0hoirecWVdfcECzRdZOkXPujkk8aCH/t5oMGtiWTq18PJ1I3xZHp7PJna6lMimXaJkfT9fhtLO1X0Ymun0dVUPnj2Hat/tRP1f133z1o6cz5QZdszNS2gTdekIgIdFeCt2VHuRe6M6ggggAACCPStAEGrvj20DAwBBAZBwEnw+zZOHzSy2WInPcqCTJvsXHSLWnDKp1ILKqucuNJivS/OFd8vquf74Jmlp05nJ871f3mvtw1ljQQauzdqgfLlCrB9pABvzUgWMhFAAAEEEECgvQIErdrrS+sIIIBAWwUsSLQ3l82cIc5d2codWQArsjnLf7MTPdH2qfmp3W/ITY7X329kK2QigAACCCDQKQHt1I7YDwIIIIBAGwQIWrUBlSYRaJcA7SJQSyA3NXG+OnmllftPbLJZy6ayZ1NNZ8ff4wNlLWudhhBAAAEEEGirgGtr6zSOAAIIINBegUEOWrVXltYRQACBDgtMT2U+mstmzrS/KZ8t4m6ts/v/s7JDlu4WJz8RER/oWkhOgpe5QvGx1pZaGrxnUxmg8EIAAQQQQAABBPpdYLB+52nd0cStdZZNtETQqgkkqiCAwCAL9N7/StPZzI5cdmKjC+TPVPSf7eiVAlJO3Lai6hkWiHq4pbilY3JTGR+c8g9PX0j57C0fzx/Y7YNZtukATvxRfgAPOkNGAAEEEFicALX7QoDfeZZ2GHFbmtsStyJotUQ4NkMAgUER6N3/lfL7Mh+Yzo6fY8GpUkDKf5rfocnx6wflyDFOBBBAoGcE6CgCCCCAAAIIRAoQtIpkIRMBBBBAAAEEelWAfiOAAAIIIIAAAgj0hwBBq/44jowCAQQQaJcA7SKAAAIIIIAAAggggAACKyJA0GpF2Nnp4AowcgQQQAABBBBAAAEEEOhKAe3KXtEpBAZaoLeDVgN96Bg8AggggAACCCCAAAIIIIBAywR691GmLSPo6obo3EAKELQayMPOoBFAAAEEekuAP/321vGitwgggED3C9BDBBBAoBcECFr1wlGijwgggAACAy7An34H/A3A8LtfgB4igAACCCDQcYFB+LMmQauOv63YIQIIIIAAAgjUF6AUAQQQQAABBBBAoJHAIPxZk6BVo3cB5QgggECvC9B/BBBAAAEEEEAAAQQQQKAHBQha9eBBo8srK8DeEUAAAQQQQAABBBBAAAEEEECg/QIrHbRq/wjZAwIIIIAAAggg0PMCg/DUip4/SAwAAQQQQKC+AKUILFqAoNWiydgAAQQQQAABBBDotMAgPLWi06bsD4FeF6D/CCCAQP8LELTq/2PcXyPkD839dTwZDQIIIIAAAt0iQD8QQAABBBBAoOsECFp13SGhQ3UF+ENzXR4KEUAAgW4RoB8IIIAAAggggAACCCxXgKDVcgV7cnsuV+rJw0anB1mAsSOAAAIIIIAAAggggAACAyfQI0ErgiytfWcO+uVKrdWkNQQQQAABBBBAAAEEEEAAAQQQaL3A8oNWre9TRIsEWSJQyEIAAQQQQAABBBBAAAEEEOhrgS67gKOvrRlcNwr0SNCqG+noEwIIIIAAAggggAACCCCwdAG2RKCxABdwNDaiRj8LELTq56PL2BBAAAEEEEAAgcERaMlIuaahJYw0ggACCCCAQEsECFq1hJFGEEAAAQQQ6DcBxoPAYApwTcNgHndGjQACCCDQnQIErbrzuNArBBDoNwHGgwACCCCAAAIIIIAAAgggsCgBglaL4qJytwjQDwQQQAABBBBAAAEEEEAAAQQQ6G8BH7Tq7xEyOgQQQAABBBBAAAEEEGijAE8CayMuTQ+kQFu/pwZSlEH3rgBBq949dvQcAQQQQAABBBBAAIEuEBjkJ4F1AT9d6EMBvqf68KAypCUKELRaIhybIYAAAggggAACCLRYgOYQQAABBBBAAIGQAEGrEAaLCCCAAAII9JMAY0EAAQQQQAABBBBAoJcFCFr18tGj7wgg0EkB9oUAAggggAACCCCAAAIIINBBAYJWHcRmV2EBlhFAAAEEEEAAAQR6V4AHRffusaPnCCCAQKcFlr4/glZLt2NLBBBAAAEEEEAAAQQGVIAHRQ/ogWfY3SBAHxAYIAGCVgN0sBkqAggggAACCCCAAAIIlAuwhgACCCDQvQIErbr32NAzBBBAoLYAd2XUtqEEAQRWUoB9I4AAAggggAACLRMgaNUyShpCoM0CBCnaDNxjzXNXRo8dsKV2l+0QQAABBBBAAAEEEBhcAYJWg3vsGXmvCRCkWP4RowUEEGifAIH19tnSMgIIINDNAvz87+ajQ98Q6HmBLgha8VOuV99F9BsBBBBAAIEFAQLrCxQsIIAAAgMlwM//gTrcDHZwBVZq5F0QtOKn3EodfPaLAAIIIIAAAggggMCKCfC36xWjZ8crLkAHEECgSYEuCFo12VOqIYAAAggggAACCCCAQP8ItOxv1/1DwkgQQAABBMoFCFqVe7CGAAIIIIAAAggMtgCjRwABBBBAAAEEukSAoFWXHAi6gQACCCDQnwKMCgEEEEAAAQQQQAABBJYmQNBqaW5shQACKyPAXhFAAAEEEEAAAQQQQAABBAZEgKBVOw50zzxUsh2Dp00EEEAAAQQQaKkAv1e0lJPGEEAAAQQQGEyB3hw1Qat2HDceKtkOVdpEAAEEEEBgMAX4vWIwj3tp1EQsSwx8QaAbBegTAgh0RICgVUeY2QkCCCCAAAI9JsC5co8dsG7vLm+opR2hwYlYLs2HrRDoJwF+TvbT0WQsrRMgaNU6S1pCAAEEEECgfwQ4V+7osWzxqUpH+97cznhDNedELQQQCAv0xs/GVvWSn5PhY88yAvMCBK3mJZgjgAACCCAQKUAmAu0X4FSl/cbsAQEEek+gN3429kYve+/o02MEZgUIWs068BUBBDolwH4QQAABBBBAAAEEEEAAAQQQaEKAoFUTSP8/e/eiHLcNQwF08/8fnTiOPeNxbK8eIAkQp9MmjS2RwMF2srmStg4hQIAAAQIECBAgQIAAAQIE9hfQYS4BoVWueayrJupR7HUd2JkAAQIECBAgQIAAgVwCqiFAgMAtAaHVLb6NTvYo9kbD1AoBAgQIECCwp4CuCBAgQOCzgPsvPovs9Wuh1V7z1A0BAgQIECBwVMBxBAgQIECAQHkB91+UH+GPDQitfuTxTQIECBA4KuA4AgQIECBAgAABAgQIRAoIrSI1rUUgTsBKBAgQIECAAAECBAgQIECgtUCT0Kr1jDVPgAABAgQIECBAgAABAgSaCGhzJwGh1U7T1AsBAgQIECAwR8Cnvs5xtgsBAusFVECAAIGFAkKrhfi2JkCAAAECBIoK+NTXooNbX7YKCBAgQIAAgeMCQqvjVo4kQKC9gFsr2r8EAGQTUA8BAgQIECBAgMDGAkKrjYerNQIEogV2v7Ui2st6BAgQIECAAAECBAgQuC4gtLpu50wCPwv4LgECBAgQaCjgntSGQ9cyAQIECBAYJFAmtBrUv2ULCXgTXGhYSiVAgACBtgLuSW07eo0TIEAgTMBCBN4FhFbvEn5OL+BNcPoRKZAAAQIECPQRcDWtz6zrd6oDAgQIlBUQWpUdncIJECBAgAABAgTmC7zt6GraG4SfCBAgQIDAOAGh1ThbKxMgQIAAAQLPBHyfAAECBAgQIECAwDcCx0Mrt0B/Q+jLBAgQyCOgEgK7C3g7svuE9UeAAAECBCYLeHMxGfzcdsdDK7dAn5N19A4CeiAQKOB3w0BMSzUW8Hak8fC1ToAAAQIERgh4czFCNWzN46HV7S0tQIAAgc4CfjfsPH29EyBAgAABAgR6CeiWQIyA0CrG0SoECBAgQIAAgYsC7sS8COc0An0EdEqAAIGmAkKrpoPXNgECBAgQIO5yw58AAAv4SURBVJBFwJ2YsydhPwIECBAgQKCGgNCqxpxUSYAAAQIEsgqoiwABAgQIECBAgMAQAaHVEFaLEiBA4KqA8wgQIECglYCnQ1uNW7MECBAgcE5AaHXOy9HVBNRLgAABAgQIEMgs4OnQzNNRGwECBHIKNLrgcSq0yjktVREgQIAAAQIECBAgQIAAAQKRAtZKLNDogofQKvHrUGkEugo0unDQdcT6JkCAAAEC3QT0S4AAAQIXBIRWF9CcQoDAWIFGFw7GQlqdAAEC2wpojAABAgQIEOggILTqMGU9EiBAgACBnwR8jwABAgQIECBAgEBCAaFVwqEoiQCB2gKqJ0CAAAECBAgQqCvgoyrqzk7l+wkIrfab6W4d6YcAAQIECBAgQIAAAQLTBHxUxTRqGxH4LPDfr4VW/5H4AgECBAgQIECAAAECBAgQqC6gfgL1BYRW9WeoAwIECBAgQIAAAQIERgtYn0BaAQ80ph2Nwm4LCK1uE1qAAAECBAgQIEDgrIDjCRAgQCBKwAONUZLWyScgtMo3ExURIECAAIGzAo4nQIAAAQIECBAgsJ2A0Gq7kWqIAIH7AlYgQIAAAQIECBAgUEDAk4EFhqTEOwJCqzt6zj0m4CgCBAgQIECAAAECBAgQiBfwZGC8qRXvCQSfLbQKBrUcAQIECBAgQOC6gEvm1+2cSYAAgf0EdESgu4DQqvsrQP8ECBAgQIBAIgGXzBMNQyn7CeiIAAECBIoJCK2KDUy5BAgQIECAAIEcAqogQIAAAQJZBdy5nHUyZ+sSWp0VczwBAgQIEBghYE0CBAgQIECAAIEgAXcuB0EuX0ZotXwECiBAYISANQkQIECAAAECBAgQIFBHwN1hX81KaPWViq99FvBrAgQIECBAgAABAgQIECBAYJhAmrvDhnV4ZWGh1RU15xAgQIAAAQIECBAgkFbA/QppR9OwMC0TIHBHQGh1R8+5BAgQIECAAAECBAjMEzi4k/sVDkI5jAABAskFhFbJB6Q8AgQIECBAgMAoAesSIECAAAECBDILCK0yT0dtBAgQIFBJQK0ECBAgQIAAAQIECAQKCK0CMS1FgECkQLO1fPhGs4FrlwABAgQIECBAgACBZwJCq2dCu3xfHwQI5Bbw4Ru556M6AgQIECBAgAABAlUENqpTaLXRMLXSWcBtOp2nr3cCBAgQIECAAIFxAlYmQGCdgNBqnb2dCQQKuE0nENNSBAgQIECAwDgBKxO4LuA67XU7ZxIoKiC0Kjo4ZRMgQIAAAQIEHg8GBAgQaCTgOm2jYWu1tkBcwiy0qv1KUD0BAgQIRApYiwABAgQIECBAgACBmwJRCfOvh9Dq4S8CBEYJWJcAAQIECBAgQIAAAQIECFwT+C20uga35CybEiBAgAABAgQIECBAgAABAvsL6PBNwJ1WbxB+6ikQ96RtTz9dE3g8/Ff08BcBAgQIECCQXEB5BAhUFRBaVZ2cukMEop60DSnGIgRKCvivqOTYFE2AAIE7As4lQIAAAQKTBIRWk6BtQ4AAAQIECBD4SsDXCBAgQIAAAQJzBeo8LSG0mvvKsBsBAgQIjBWwOgECBAgQIECAAAECPwrUeVpCaPXjIH2TQHcB/RMgQIAAAQIECBAgQIAAgTUCQquZ7vYiQIAAAQIECBAgQIAAAQIE9hfQYYiA0OqVsc7znK/l+oEAAQIECBAgQIAAAQKNBLRKgEBPAaHV69zrPM/5Wq4fCBAgQIAAAQIECFwXcCYBAgQIECghILQqMSZFEiBAgAABAnkFVEaAAAECBAgQIDBCQGg1QtWaBAgQGCiw/QPNA+0sTYAAAQIECBAgQIBAHQGhVZ1Z9ap01z+VL+ir1wunR7ceaO4xZ10SIECAAAECBAgQ6C4gtDr3CnD0LIFd/1S+a1+zXhf2IUCAAAECBAgQIECAwBwBuyQQEFolGIISCBAgQIAAAQIECBAgsLeA7ggQIHBeQGh13swZBAgQIECAAAECBNYK2J0AAQIECDQQEFo1GPJ+LfpgqP1mqiMCBAisFbA7AQIECBAgQIBAPgGhVb6ZqOipgA+GekrkAAJrBexOgAABAgQIECBAgACB2wJCq9uEFiAwWsD6BAgQIECAAAECBAgQIECgn0C/0KrfjHVMgAABAgQIECBAgAABAgT6Cei4vIDQqvwINUCAAAECBAgQIECAAIHxAnYgQIDAbAGh1Wxx+xEgQIAAAQIECBB4PBgQIECAAAECTwSEVk+AfJsAAQIECBCoIKBGAgQIECBAgACB3QSEVrtNVD8ECBCIELAGAQIECBAgQIAAAQIEFgsIrRYPwPY9BHRJgAABAgQIECBAgAABAgQInBOoGFqd69DRBAgQIECAAAECjQR+NepVqwQIENheQIPNBQaHVt40NH99aZ8AAQIECBAgMFng9+T9bEegkoBaCRAgUEtgcGjlTUOtl4NqCRAgQIAAAQIEDgs4kAABAgQIEBgqMDi0Glq7xQkQIECAAIGNBLRCgAABAgQIECBA4KOA0Oqjhn8nQIDAPgI6IUCAAAECBAgQIECAQGkBoVXp8Sl+noCdCBAgQIAAAQIECBAgQIAAgZkCa0KrmR3aiwABAgQIECBAgECYgP/RUBilhQgQ6CGgSwI3BIRWN/CcSoAAAQIECBAg0E3A/2io28Sz9aseAgQIdBIQWnWatl4JECBAgAABAgQ+Cvh3AgQIECBAILGA0CrxcJRGgAABAgRqCaiWAAECBAgQIECAQJyA0CrO0koECBCIFbAaAQIECBAgQIAAAQIEGgsIrRoPv1Prfz8ytVO/eiVAgAABAgQIECBAgAABAtUFroZW1ftWfzMBH5nabODaJUCAAAECBAgQIEAgSsA6BJYJCK2W0duYAAECBAgQIECAAIF+AjomQIAAgaMCQqujUo4jQIAAAQIECBCYJnD40f5pFdmIAAECBAgQmC0gtJotbj8CBAgQIJBYQGkEsgh4tD/LJNRBgAABAgTWCQit1tnbmQCBKwK1Lr1f6dA5BAgQIECAAAECBAgQIPAiILR6QfB3FQF1EngRcOn9BcHfBAgQIECAAAECBN4FXNV9l/DzTgL/ehFa/XPwIwECBAgQIEAgVsCfIWI9rUaAAAEC3wgcuKr7zZm+TCC7gNAq+4TUR4AAAQIECNQU8GeImnNTNYEDAg4hQIAAgTkCQqs5znbpLOBKe+fp650AAQIEngs4ggABAgQIECDwpYDQ6ksWXyQQKOBKeyCmpQgQeC7giFICLmyUGpdiCRAgQIAAgbkCQqu53nYjQKCagHoJECAwUsCFjZG61iZAgAABAgSKCwitig+wWvnqJUCAAAECBAgQIECAAAECBPYXiOhQaBWhaA0CBAiEC3hmKJzUggQIECBAgACBugIqJ9BSQGjVcuyaJkAgv4BnhvLPSIUECBAgUFdA5QQIECBQQUBoVWFKaiRAgAABAgQIZBZYWZsbU1fq25sAAQIECAwVEFoN5bU4AQIECBA4L+AMAgROCLgx9QSWQwkQIECAQC0BoVWteamWAIHzAs4gQIAAAQIECBAgQIAAgYICQquCQ1tbst0JECBAgAABAgQIEGgh4PHbFmPWJIHvBdZ/R2i1fgYqIECAAAECBAgQIECAQD4Bj9/GzsRqBAicFhBanSZzAgECBAgQIECAAAECqwXsT4AAAQL7Cwit9p+xDgkQIECAAAECzwR8nwABAgQIECCQTkBolW4kCiJAgACB+gI6IECAAAECBAgQIEDgroDQ6q6g8wkQGC9gBwIECBAgQIBAIgGfT55oGEohQGBrAaHV1uP9ujlfJUCAAAECBAgQIEDguoDPJ79u50wCBOYKVN9NaFV9guonQIAAAQIECBAgQIAAgRkC9iBAYLKA0GoyuO0IECBAgAABAgQIEPgr4B8CBAgQWCNQ5yFnodWaV4hdCRAgQIDAOoE671PWGVXcWc0ECBAgQIAAgUMCdR5yFlodGqiDCBAgQKCbwNb91nmfsvUYNEdgioCQegqzTQgQIEBgzG84QiuvLAIEZgjYgwABAgQIEFghIKReoW5PAgQINBQY8xuO0KrkS0nRBAgQIECAAAECBAgQIECAwP4CvTv8AwAA///xs1mtAAAABklEQVQDACyAOLqBmIYBAAAAAElFTkSuQmCC'),
('cmrwczuib000nru014tn67ttx','cmrwbl9lx000rs601s101xv8i','data:image/png;base64,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'),
('cmrwdm2ne000os201varc2o5p','cmrwd2knx0001s201jre4f6lx','data:image/png;base64,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'),
('cmrwe7peu000yte01n6jfo0u8','cmrwdx3e90009te01415ct2t1','data:image/png;base64,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'),
('cmrxqhra5001imm01fefo2emh','cmrxpw8xp0001mm01vrjt7arg','data:image/png;base64,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'),
('cmrxqm3br001zmm01xd44snyg','cmrxpw8y60003mm01oyokwfig','data:image/png;base64,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'),
('cmrxqsqsn002kmm01rj3gc5b2','cmrxpw8yk0005mm01igiz87jg','data:image/png;base64,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'),
('cmrykshaz006emm01fea4v4e5','cmryk2p77004vmm01b8howvu7','data:image/png;base64,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'),
('cmrykvwwx0070mm01ozeb4f0x','cmryk2p5p004tmm01n52btn8a','data:image/png;base64,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'),
('cmrykxkts0074mm01407fhbl3','cmryk2p8j004xmm013223q5kq','data:image/png;base64,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');
/*!40000 ALTER TABLE `signature_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tripartite_data`
--

DROP TABLE IF EXISTS `tripartite_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tripartite_data` (
  `id` varchar(191) NOT NULL,
  `applicationId` varchar(191) NOT NULL,
  `migrantName` varchar(191) NOT NULL,
  `idNumber` varchar(191) NOT NULL,
  `passportNumber` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tripartite_data_applicationId_key` (`applicationId`),
  CONSTRAINT `tripartite_data_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `individual_applications` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tripartite_data`
--

LOCK TABLES `tripartite_data` WRITE;
/*!40000 ALTER TABLE `tripartite_data` DISABLE KEYS */;
INSERT INTO `tripartite_data` VALUES
('cmruh7a0n0001szi6jvjx32pd','cmrqv44b70009sz4zqcexj0i2','Bdgfdfgdfgdfgdfgdfgf','11111111','AK7846664'),
('cmrwd03e1000pru01utkgjp1e','cmrwbl9lx000rs601s101xv8i','Gedion Njoroge','26447696','AK7846664'),
('cmrwdmg9q0001te010ittgpyx','cmrwd2knx0001s201jre4f6lx','Philex Fundia','67222222','AK7846664'),
('cmrwe7vfw0010te01m25iu1pg','cmrwdx3e90009te01415ct2t1','Samuel Muli','26447699','AK7846664'),
('cmrxqi7hv001kmm01ibiq3xhw','cmrxpw8xp0001mm01vrjt7arg','Samuel Mumo','11111111','p1'),
('cmrxqmfiw0021mm017wfvp10u','cmrxpw8y60003mm01oyokwfig','Ashley','22222222','p2'),
('cmrxqsxgm002mmm01swzqebfh','cmrxpw8yk0005mm01igiz87jg','veronicah kimani','33333333','p3'),
('cmryktoln006lmm01egfw43hj','cmryk2p77004vmm01b8howvu7','DORIS CHEPKORIR','37018798','33456789'),
('cmryky4zd0078mm01hklywal1','cmryk2p8j004xmm013223q5kq','EDWIN KIPCHIRCHIR','41826151','3456789'),
('cmrykycci007amm01g89nkpls','cmryk2p5p004tmm01n52btn8a','CHEPKEMBOI JACKLINE','31757880','123456');
/*!40000 ALTER TABLE `tripartite_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(191) NOT NULL,
  `email` varchar(191) DEFAULT NULL,
  `phoneNumber` varchar(191) DEFAULT NULL,
  `passwordHash` varchar(191) DEFAULT NULL,
  `name` varchar(191) DEFAULT NULL,
  `idNumber` varchar(191) DEFAULT NULL,
  `kraPin` varchar(191) DEFAULT NULL,
  `ecitizenId` varchar(191) DEFAULT NULL,
  `identifierType` enum('EMAIL','PHONE','ECITIZEN') NOT NULL DEFAULT 'EMAIL',
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`),
  UNIQUE KEY `users_phoneNumber_key` (`phoneNumber`),
  UNIQUE KEY `users_idNumber_key` (`idNumber`),
  UNIQUE KEY `users_ecitizenId_key` (`ecitizenId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
('cmrvrgm4o0003p60167xosy70','gedion.njrg@gmail.com',NULL,'$2b$12$kbaLNUDktwq94HF/Oommy.rRPPWv7nsK8P6z.9cV4e.LDCq.3vtFy',NULL,NULL,NULL,NULL,'EMAIL','2026-07-22 07:28:29.448','2026-07-22 07:28:29.448'),
('cmrvsaj8r0003ok016ep2tmwp',NULL,'254720501239',NULL,NULL,NULL,NULL,NULL,'PHONE','2026-07-22 07:51:45.388','2026-07-24 19:13:44.904'),
('cmrvyp2ua0001mt01dedwwcre',NULL,'254706721223',NULL,NULL,NULL,NULL,NULL,'PHONE','2026-07-22 10:51:01.667','2026-07-24 05:54:15.156'),
('cmrvz17di0007mt012h55o8yo',NULL,'254703530884',NULL,NULL,NULL,NULL,NULL,'PHONE','2026-07-22 11:00:27.414','2026-07-24 06:31:19.521'),
('cmrxlkxev000tpf011hc48bie',NULL,'254706026689',NULL,NULL,NULL,NULL,NULL,'PHONE','2026-07-23 14:19:25.351','2026-07-23 16:24:52.912'),
('cmrxq7a5g000dmm01oakcxxe3',NULL,'254708409919',NULL,NULL,NULL,NULL,NULL,'PHONE','2026-07-23 16:28:46.757','2026-07-23 16:28:46.757'),
('cmryj84uy0031mm016kxogdkx','mumosamuel2018@gmail.com',NULL,'$2b$12$ifFjYw5Ae79oqiWBWvNLNuqHwCRAH20uqFLS71UcimZySGUn8Nz3a',NULL,NULL,NULL,NULL,'EMAIL','2026-07-24 06:01:15.419','2026-07-24 06:01:15.419'),
('cmryjf8hs003gmm01nxmn88bw',NULL,'254758894746',NULL,NULL,NULL,NULL,NULL,'PHONE','2026-07-24 06:06:46.720','2026-07-24 06:06:46.720'),
('cmrynckat0001qh01c1wz9brr',NULL,'254748718067',NULL,NULL,NULL,NULL,NULL,'PHONE','2026-07-24 07:56:40.517','2026-07-24 07:56:40.517'),
('cmrzbz1160000tg013w1ofufd','kiumijoe@gmail.com','254701782205',NULL,'JOSEPH GIKUHI KIUMI','31097067','A007559264N','158324','ECITIZEN','2026-07-24 19:25:59.419','2026-07-24 19:27:35.986');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wards`
--

DROP TABLE IF EXISTS `wards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `wards` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) NOT NULL,
  `constituencyId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `wards_constituencyId_name_key` (`constituencyId`,`name`),
  CONSTRAINT `wards_constituencyId_fkey` FOREIGN KEY (`constituencyId`) REFERENCES `constituencies` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1422 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wards`
--

LOCK TABLES `wards` WRITE;
/*!40000 ALTER TABLE `wards` DISABLE KEYS */;
INSERT INTO `wards` VALUES
(3,'AIRPORT',1),
(5,'CHAANI',1),
(4,'CHANGAMWE',1),
(2,'KIPEVU',1),
(1,'PORT REITZ',1),
(6,'JOMVU KUU',2),
(8,'MIKINDANI',2),
(7,'MIRITINI',2),
(11,'BAMBURI',3),
(10,'JUNDA',3),
(14,'MAGOGONI',3),
(9,'MJAMBERE',3),
(13,'MTOPANGA',3),
(12,'MWAKIRUNGE',3),
(15,'SHANZU',3),
(16,'FRERE TOWN',4),
(19,'KADZANDANI',4),
(18,'KONGOWEA',4),
(17,'MKOMANI',4),
(22,'BOFU',5),
(23,'LIKONI',5),
(20,'MTONGWE',5),
(21,'SHIKA ADABU',5),
(24,'TIMBWANI',5),
(29,'MAJENGO',6),
(25,'MJI WA KALE/MAKADARA',6),
(28,'SHIMANZI/GANJONI',6),
(27,'TONONOKA',6),
(26,'TUDOR',6),
(30,'GOMBATO BONGWE',7),
(32,'KINONDO',7),
(33,'RAMISI',7),
(31,'UKUNDA',7),
(35,'DZOMBO',8),
(36,'MWERENI',8),
(34,'PONGWE/KIKONENI',8),
(37,'VANGA',8),
(41,'KUBO SOUTH',9),
(42,'MKONGANI',9),
(40,'TIWI',9),
(38,'TSIMBA GOLINI',9),
(39,'WAA',9),
(47,'CHENGONI/SAMBURU',10),
(49,'KASEMENI',10),
(45,'KINANGO',10),
(46,'MACKINNON ROAD',10),
(48,'MWAVUMBO',10),
(43,'NDAVAYA',10),
(44,'PUMA',10),
(53,'DABASO',11),
(52,'KIBARANI',11),
(54,'MATSANGONI',11),
(56,'MNARANI',11),
(51,'SOKONI',11),
(50,'TEZO',11),
(55,'WATAMU',11),
(60,'CHASIMBA',12),
(57,'JUNJU',12),
(61,'MTEPENI',12),
(58,'MWARAKAYA',12),
(59,'SHIMO LA TEWA',12),
(64,'KALOLENI',13),
(63,'KAYAFUNGO',13),
(62,'MARIAKANI',13),
(65,'MWANAMWINGA',13),
(68,'KAMBE/RIBE',14),
(66,'MWAWESA',14),
(69,'RABAI/KISURUTINI',14),
(67,'RURUMA',14),
(71,'BAMBA',15),
(70,'GANZE',15),
(72,'JARIBUNI',15),
(73,'SOKOKE',15),
(76,'GANDA',16),
(74,'JILORE',16),
(75,'KAKUYUNI',16),
(77,'MALINDI TOWN',16),
(78,'SHELLA',16),
(82,'ADU',17),
(83,'GARASHI',17),
(81,'GONGONI',17),
(80,'MAGARINI',17),
(79,'MARAFA',17),
(84,'SABAKI',17),
(88,'GARSEN CENTRAL',18),
(90,'GARSEN NORTH',18),
(86,'GARSEN SOUTH',18),
(89,'GARSEN WEST',18),
(85,'KIPINI EAST',18),
(87,'KIPINI WEST',18),
(93,'CHEWANI',19),
(91,'KINAKOMBA',19),
(92,'MIKINDUNI',19),
(94,'WAYU',19),
(97,'BANGALE',20),
(95,'CHEWELE',20),
(96,'HIRIMANI',20),
(99,'MADOGO',20),
(98,'SALA',20),
(102,'BASUBA',21),
(100,'FAZA',21),
(101,'KIUNGA',21),
(109,'BAHARI',22),
(105,'HINDI',22),
(107,'HONGWE',22),
(104,'MKOMANI',22),
(106,'MKUNUMBI',22),
(103,'SHELLA',22),
(108,'WITU',22),
(112,'BOMANI',23),
(110,'CHALA',23),
(111,'MAHOO',23),
(114,'MATA',23),
(113,'MBOGHONI',23),
(118,'MWANDA/MGANGE',24),
(116,'WERUGHA',24),
(117,'WUMINGU/KISHUSHE',24),
(115,'WUNDANYI/MBALE',24),
(120,'BURA',25),
(121,'CHAWIA',25),
(119,'MWATATE',25),
(122,'WUSI/KISHAMBA',25),
(125,'KALOLENI',26),
(127,'KASIGAU',26),
(126,'MARUNGU',26),
(123,'MBOLOLO',26),
(128,'NGOLIA',26),
(124,'SAGALLA',26),
(130,'GALBET',27),
(132,'IFTIN',27),
(131,'TOWNSHIP',27),
(129,'WABERI',27),
(133,'BALAMBALA',28),
(134,'DANYERE',28),
(135,'JARA JARA',28),
(136,'SAKA',28),
(137,'SANKURI',28),
(143,'BARAKI',29),
(139,'BENANE',29),
(140,'GOREALE',29),
(141,'MAALIMIN',29),
(138,'MODOGASHE',29),
(142,'SABENA',29),
(149,'ABAKAILE',30),
(145,'DADAAB',30),
(147,'DAMAJALE',30),
(144,'DERTU',30),
(146,'LABASIGALE',30),
(148,'LIBOI',30),
(150,'BURA',31),
(151,'DEKAHARIA',31),
(153,'FAFI',31),
(152,'JARAJILA',31),
(154,'NANIGHI',31),
(155,'HULUGHO',32),
(157,'IJARA',32),
(158,'MASALANI',32),
(156,'SANGAILU',32),
(163,'BATALU',33),
(160,'BUTE',33),
(164,'DANABA',33),
(165,'GODOMA',33),
(159,'GURAR',33),
(161,'KORONDILE',33),
(162,'MALKAGUFU',33),
(168,'BARWAGO',34),
(169,'KHOROF/HARAR',34),
(167,'TOWNSHIP',34),
(166,'WAGBERI',34),
(170,'ELBEN',35),
(171,'SARMAN',35),
(172,'TARBAJ',35),
(173,'WARGADUD',35),
(176,'ADAMASAJIDE',36),
(174,'ARBAJAHAN',36),
(177,'GANYURE/WAGALLA',36),
(175,'HADADO/ATHIBOHOL',36),
(179,'DELLA',37),
(178,'ELDAS',37),
(181,'ELNUR/TULA TULA',37),
(180,'LAKOLEY SOUTH/BASIR',37),
(182,'BENANE',38),
(183,'BURDER',38),
(184,'DADAJA BULLA',38),
(188,'DIIF',38),
(185,'HABASSWEIN',38),
(187,'IBRAHIM URE',38),
(186,'LAGBOGHOL SOUTH',38),
(192,'DANDU',39),
(193,'GITHER',39),
(191,'LAGSURE',39),
(190,'TAKABA',39),
(189,'TAKABA SOUTH',39),
(194,'BANISSA',40),
(195,'DERKHALE',40),
(196,'GUBA',40),
(198,'KILIWEHIRI',40),
(197,'MALKAMARI',40),
(199,'ASHABITO',41),
(200,'GUTICHA',41),
(201,'MOROTHILE',41),
(202,'RHAMU',41),
(203,'RHAMU-DIMTU',41),
(207,'ELWAK NORTH',42),
(206,'ELWAK SOUTH',42),
(205,'KUTULO',42),
(208,'SHIMBIR FATUMA',42),
(204,'WARGADUD',42),
(209,'ARABIA',43),
(212,'KHALALIO',43),
(213,'LIBEHIA',43),
(211,'NEBOI',43),
(210,'TOWNSHIP',43),
(218,'ALANGO GOF',44),
(215,'FINO',44),
(216,'LAFEY',44),
(214,'SALA',44),
(217,'WARANQARA',44),
(219,'BUTIYE',45),
(222,'GOLBO',45),
(221,'HEILLU/MANYATTA',45),
(223,'MOYALE TOWNSHIP',45),
(225,'OBBU',45),
(220,'SOLOLO',45),
(224,'URAN',45),
(226,'DUKANA',46),
(230,'ILLERET',46),
(227,'MAIKONA',46),
(229,'NORTH HORR',46),
(228,'TURBI',46),
(232,'KARARE',47),
(233,'MARSABIT CENTRAL',47),
(231,'SAGANTE/JALDESA',47),
(235,'KARGI/SOUTH HORR',48),
(236,'KORR/NGURUNIT',48),
(238,'LAISAMIS',48),
(237,'LOGO LOGO',48),
(234,'LOIYANGALANI',48),
(240,'BULLA PESA',49),
(244,'BURAT',49),
(241,'CHARI',49),
(242,'CHERAB',49),
(243,'NGARE MARA',49),
(245,'OLDO/NYIRO',49),
(239,'WABERA',49),
(246,'GARBATULLA',50),
(247,'KINNA',50),
(248,'SERICHO',50),
(252,'AKACHIU',51),
(251,'ATHIRU GAITI',51),
(253,'KANUNI',51),
(250,'KIEGOI/ANTUBOCHIU',51),
(249,'MAUA',51),
(254,'ATHIRU RUUJINE',52),
(255,'IGEMBE EAST',52),
(257,'KANGETA',52),
(256,'NJIA',52),
(262,'AMWATHI',53),
(258,'ANTUAMBUI',53),
(260,'ANTUBETWE KIONGO',53),
(261,'NAATHU',53),
(259,'NTUNENE',53),
(264,'AKITHII',54),
(263,'ATHWANA',54),
(265,'KIANJAI',54),
(267,'MBEU',54),
(266,'NKOMO',54),
(272,'KARAMA',55),
(270,'KIGUCHWA',55),
(269,'MIKINDURI',55),
(271,'MUTHARA',55),
(268,'THANGATHA',55),
(273,'MUNICIPALITY',56),
(274,'NTIMA EAST',56),
(275,'NTIMA WEST',56),
(277,'NYAKI EAST',56),
(276,'NYAKI WEST',56),
(286,'KIBIRICHIA',57),
(280,'KIIRUA/NAARI',57),
(279,'KISIMA',57),
(281,'RUIRI/RWARERA',57),
(278,'TIMAU',57),
(283,'ABOTHUGUCHI CENTRAL',58),
(284,'ABOTHUGUCHI WEST',58),
(285,'KIAGU',58),
(282,'MWANGANTHIA',58),
(290,'ABOGETA EAST',59),
(291,'ABOGETA WEST',59),
(288,'IGOJI EAST',59),
(289,'IGOJI WEST',59),
(287,'MITUNGUU',59),
(292,'NKUENE',59),
(297,'CHOGORIA',60),
(296,'GANGA',60),
(293,'MITHERU',60),
(294,'MUTHAMBI',60),
(295,'MWIMBI',60),
(301,'CHIAKARIGA',61),
(298,'GATUNGA',61),
(302,'MARIMANTI',61),
(299,'MUKOTHIMA',61),
(300,'NKONDI',61),
(308,'GATURI SOUTH',62),
(307,'KIRIMARI',62),
(304,'KITHIMU',62),
(306,'MBETI NORTH',62),
(305,'NGINDA',62),
(303,'RUGURU/NGANDORI',62),
(311,'CENTRAL WARD',63),
(309,'GATURI NORTH',63),
(312,'KAGAARI NORTH',63),
(310,'KAGAARI SOUTH',63),
(313,'KYENI NORTH',63),
(314,'KYENI SOUTH',63),
(319,'KIAMBERE',64),
(316,'MAKIMA',64),
(318,'MAVURIA',64),
(317,'MBETI SOUTH',64),
(315,'MWEA',64),
(322,'EVURORE',65),
(321,'MUMINJI',65),
(320,'NTHAWA',65),
(324,'KYUSO',66),
(325,'MUMONI',66),
(323,'NGOMENI',66),
(327,'THARAKA',66),
(326,'TSEIKURU',66),
(331,'KIOMO/KYETHANI',67),
(328,'KYOME/THAANA',67),
(330,'MIGWANI',67),
(329,'NGUUTANI',67),
(332,'CENTRAL',68),
(333,'KIVOU',68),
(336,'MUI',68),
(334,'NGUNI',68),
(335,'NUU',68),
(337,'WAITA',68),
(339,'KAUWI',69),
(341,'KWA MUTONGA/KITHUMULA',69),
(340,'MATINYANI',69),
(338,'MUTONGUNI',69),
(345,'KANYANGI',70),
(342,'KISASI',70),
(344,'KWAVONZA/YATTA',70),
(343,'MBITINI',70),
(350,'KYANGWITHYA EAST',71),
(348,'KYANGWITHYA WEST',71),
(346,'MIAMBANI',71),
(349,'MULANGO',71),
(347,'TOWNSHIP',71),
(353,'CHULUNI',72),
(355,'ENDAU/MALALANI',72),
(356,'MUTITO/KALIKU',72),
(352,'NZAMBANI',72),
(354,'VOO/KYAMATU',72),
(351,'ZOMBE/MWITIKA',72),
(362,'ATHI',73),
(357,'IKANGA/KYATUNE',73),
(360,'IKUTHA',73),
(361,'KANZIKO',73),
(359,'MUTHA',73),
(358,'MUTOMO',73),
(365,'EKALAKALA',74),
(363,'KIVAA',74),
(364,'MASINGA CENTRAL',74),
(366,'MUTHESYA',74),
(367,'NDITHINI',74),
(371,'IKOMBE',75),
(372,'KATANGI',75),
(370,'KITHIMANI',75),
(369,'MATUU',75),
(368,'NDALANI',75),
(374,'KANGUNDO CENTRAL',76),
(375,'KANGUNDO EAST',76),
(373,'KANGUNDO NORTH',76),
(376,'KANGUNDO WEST',76),
(381,'KYELENI',77),
(379,'MATUNGULU EAST',77),
(378,'MATUNGULU NORTH',77),
(380,'MATUNGULU WEST',77),
(377,'TALA',77),
(383,'KATHIANI CENTRAL',78),
(385,'LOWER KAEWA/KAANI',78),
(382,'MITABONI',78),
(384,'UPPER KAEWA/IVETI',78),
(386,'ATHI RIVER',79),
(387,'KINANIE',79),
(388,'MUTHWANI',79),
(389,'SYOKIMAU/MULOLONGO',79),
(390,'KALAMA',80),
(396,'KOLA',80),
(393,'MACHAKOS CENTRAL',80),
(391,'MUA',80),
(394,'MUMBUNI NORTH',80),
(392,'MUTITUNI',80),
(395,'MUVUTI/KIIMA-KIMWE',80),
(402,'KIBAUNI',81),
(398,'MAKUTANO/ MWALA',81),
(399,'MASII',81),
(397,'MBIUNI',81),
(400,'MUTHETHENI',81),
(401,'WAMUNYU',81),
(408,'KALAWA',82),
(406,'KITETA/KISAU',82),
(405,'KITHUNGO/KITUNDU',82),
(404,'MBOONI',82),
(403,'TULIMANI',82),
(407,'WAIA-KAKO',82),
(409,'KASIKEU',83),
(411,'KIIMA KIU/KALANZONI',83),
(410,'MUKAA',83),
(415,'ILIMA',84),
(413,'KEE',84),
(414,'KILUNGU',84),
(412,'UKIA',84),
(420,'KATHONZWENI',85),
(419,'KITISE/KITHUKI',85),
(418,'MAVINDINI',85),
(422,'MBITINI',85),
(417,'MUVAU/KIKUUMINI',85),
(421,'NZAUI/KILILI/KALAMBA',85),
(416,'WOTE',85),
(428,'EMALI/MULALA',86),
(425,'KIKUMBULYU NORTH',86),
(426,'KIKUMBULYU SOUTH',86),
(423,'MAKINDU',86),
(427,'NGUU/MASUMBA',86),
(424,'NGUUMO',86),
(432,'IVINGONI/NZAMBANI',87),
(429,'MASONGALENI',87),
(430,'MTITO ANDEI',87),
(431,'THANGE',87),
(433,'ENGINEER',88),
(434,'GATHARA',88),
(439,'GITHABAI',88),
(440,'MAGUMU',88),
(436,'MURUNGARU',88),
(437,'NJABINI\\\\KIBURU',88),
(435,'NORTH KINANGOP',88),
(438,'NYAKIO',88),
(443,'GETA',89),
(444,'GITHIORO',89),
(442,'KIPIPIRI',89),
(441,'WANJOHI',89),
(448,'KAIMBAGA',90),
(446,'KANJUIRI RANGE',90),
(445,'KARAU',90),
(447,'MIRANGINE',90),
(449,'RURII',90),
(453,'CHARAGITA',91),
(450,'GATHANJI',91),
(451,'GATIMU',91),
(452,'WERU',91),
(456,'CENTRAL',92),
(455,'KIRIITA',92),
(454,'LESHAU/PONDO',92),
(457,'SHAMATA',92),
(460,'AGUTHI-GAAKI',93),
(458,'DEDAN KIMANTHI',93),
(459,'WAMAGANA',93),
(468,'GAKAWA',94),
(465,'GATARAKWA',94),
(467,'KABARU',94),
(464,'MUGUNDA',94),
(461,'MWEIGA',94),
(463,'MWIYOGO/ENDARASHA',94),
(462,'NAROMORU KIAMATHAGA',94),
(466,'THEGU RIVER',94),
(471,'IRIAINI',95),
(474,'KARATINA TOWN',95),
(473,'KIRIMUKUYU',95),
(472,'KONYU',95),
(470,'MAGUTU',95),
(469,'RUGURU',95),
(477,'CHINGA',96),
(476,'IRIA-INI',96),
(478,'KARIMA',96),
(475,'MAHIGA',96),
(479,'GIKONDI',97),
(482,'MUKURWE-INI CENTRAL',97),
(481,'MUKURWE-INI WEST',97),
(480,'RUGI',97),
(485,'GATITU/MURUGURU',98),
(486,'KAMAKWA/MUKARO',98),
(483,'KIGANJO/MATHARI',98),
(484,'RWARE',98),
(493,'GATHIGIRIRI',99),
(488,'KANGAI',99),
(492,'MURINDUKO',99),
(487,'MUTITHI',99),
(491,'NYANGATI',99),
(494,'TEBERE',99),
(489,'THIBA',99),
(490,'WAMUMU',99),
(496,'BARAGWI',100),
(495,'KABARE',100),
(499,'KARUMANDI',100),
(498,'NGARIAMA',100),
(497,'NJUKIINI',100),
(502,'KARITI',101),
(501,'KIINE',101),
(500,'MUKURE',101),
(506,'INOI',102),
(504,'KANYEKINI',102),
(505,'KERUGOYA',102),
(503,'MUTIRA',102),
(507,'KANYENYA-INI',103),
(508,'MUGURU',103),
(509,'RWATHIA',103),
(510,'GITUGI',104),
(512,'KAMACHARIA',104),
(511,'KIRU',104),
(518,'GATURI',105),
(515,'MBIRI',105),
(514,'MUGOIRI',105),
(517,'MURARANDIA',105),
(516,'TOWNSHIP',105),
(513,'WANGU',105),
(519,'KAHUMBU',106),
(522,'KANGARI',106),
(521,'KIGUMO',106),
(523,'KINYONA',106),
(520,'MUTHITHI',106),
(528,'ICHAGAKI',107),
(527,'KAMAHUHA',107),
(526,'KAMBITI',107),
(524,'KIMORORI/WEMPA',107),
(525,'MAKUYU',107),
(529,'NGINDA',107),
(532,'GAICHANJIRU',108),
(533,'ITHIRU',108),
(531,'KAGUNDU-INI',108),
(530,'MURUKA',108),
(534,'RUCHU',108),
(539,'GATANGA',109),
(535,'ITHANGA',109),
(536,'KAKUZI/MITUBIRI',109),
(540,'KARIARA',109),
(538,'KIHUMBU-INI',109),
(537,'MUGUMO-INI',109),
(541,'KIAMWANGI',110),
(542,'KIGANJO',110),
(543,'NDARUGU',110),
(544,'NGENDA',110),
(547,'CHANIA',111),
(546,'GITHOBOKONI',111),
(545,'GITUAMBA',111),
(550,'JUJA',112),
(552,'KALIMONI',112),
(548,'MURERA',112),
(549,'THETA',112),
(551,'WITEITHIE',112),
(556,'GATUANYAGA',113),
(555,'HOSPITAL',113),
(554,'KAMENU',113),
(557,'NGOLIBA',113),
(553,'TOWNSHIP',113),
(559,'BIASHARA',114),
(560,'GATONGORA',114),
(558,'GITOTHUA',114),
(561,'KAHAWA SUKARI',114),
(562,'KAHAWA WENDANI',114),
(563,'KIUU',114),
(565,'MWIHOKO',114),
(564,'MWIKI',114),
(567,'GITHIGA',115),
(566,'GITHUNGURI',115),
(568,'IKINU',115),
(570,'KOMOTHAI',115),
(569,'NGEWA',115),
(572,'NDUMBERI',116),
(573,'RIABAI',116),
(571,'TING\\ANG\\A',116),
(574,'TOWNSHIP',116),
(575,'CIANDA',117),
(576,'KARURI',117),
(579,'KIHARA',117),
(578,'MUCHATHA',117),
(577,'NDENDERU',117),
(580,'GITARU',118),
(583,'KABETE',118),
(581,'MUGUGA',118),
(582,'NYADHUNA',118),
(584,'UTHIRU',118),
(585,'KARAI',119),
(588,'KIKUYU',119),
(589,'KINOO',119),
(586,'NACHU',119),
(587,'SIGONA',119),
(590,'BIBIRIONI',120),
(591,'LIMURU CENTRAL',120),
(593,'LIMURU EAST',120),
(592,'NDEIYA',120),
(594,'NGECHA TIGONI',120),
(598,'KAMBURU',121),
(596,'KIJABE',121),
(595,'KINALE',121),
(599,'LARI/KIRENGA',121),
(597,'NYANDUMA',121),
(603,'KAALENG/KAIKOR',122),
(600,'KAERIS',122),
(604,'KIBISH',122),
(601,'LAKE ZONE',122),
(602,'LAPUR',122),
(605,'NAKALALE',122),
(606,'KAKUMA',123),
(610,'KALOBEYEI',123),
(608,'LETEA',123),
(611,'LOKICHOGGIO',123),
(607,'LOPUR',123),
(612,'NANAAM',123),
(609,'SONGOT',123),
(614,'KALOKOL',124),
(616,'KANAMKEMER',124),
(613,'KERIO DELTA',124),
(615,'LODWAR TOWNSHIP',124),
(617,'KOTARUK/LOBEI',125),
(619,'LOIMA',125),
(620,'LOKIRIAMA/LORENGIPPI',125),
(618,'TURKWEL',125),
(624,'KALAPATA',126),
(621,'KAPUTIR',126),
(622,'KATILU',126),
(623,'LOBOKAT',126),
(625,'LOKICHAR',126),
(626,'KAPEDO/NAPEITOM',127),
(627,'KATILIA',127),
(628,'LOKORI/KOCHODIN',127),
(633,'ENDUGH',128),
(630,'KAPENGURIA',128),
(631,'MNAGEI',128),
(629,'RIWO',128),
(632,'SIYOI',128),
(634,'SOOK',128),
(637,'LOMUT',129),
(636,'MASOOL',129),
(635,'SEKERR',129),
(638,'WEIWEI',129),
(644,'ALALE',130),
(642,'KAPCHOK',130),
(641,'KASEI',130),
(643,'KIWAWA',130),
(640,'KODICH',130),
(639,'SUAM',130),
(646,'BATEI',131),
(645,'CHEPARERIA',131),
(647,'LELAN',131),
(648,'TAPACH',131),
(649,'LODOKEJEK',132),
(652,'LOOSUK',132),
(651,'MARALAL',132),
(653,'PORO',132),
(650,'SUGUTA MARMAR',132),
(658,'ANGATA NANYOKIE',133),
(659,'BAAWA',133),
(654,'EL-BARTA',133),
(655,'NACHOLA',133),
(656,'NDOTO',133),
(657,'NYIRO',133),
(662,'WAMBA EAST',134),
(663,'WAMBA NORTH',134),
(661,'WAMBA WEST',134),
(660,'WASO',134),
(667,'BIDII',135),
(664,'KAPOMBOI',135),
(666,'KEIYO',135),
(665,'KWANZA',135),
(668,'CHEPCHOINA',136),
(669,'ENDEBESS',136),
(670,'MATUMBEI',136),
(671,'KINYORO',137),
(675,'MACHEWA',137),
(672,'MATISI',137),
(674,'SABOTI',137),
(673,'TUWANI',137),
(679,'HOSPITAL',138),
(676,'KIMININI',138),
(681,'NABISWA',138),
(680,'SIKHENDU',138),
(678,'SIRENDE',138),
(677,'WAITALUK',138),
(687,'CHEPSIRO/KIPTOROR',139),
(686,'CHERANGANY/SUWERWA',139),
(684,'KAPLAMAI',139),
(683,'MAKUTANO',139),
(685,'MOTOSIET',139),
(682,'SINYERERE',139),
(688,'SITATUNGA',139),
(689,'KAPKURES',140),
(692,'KIPSOMBA',140),
(694,'KUINET/KAPSUSWA',140),
(691,'SEGERO/BARSOMBE',140),
(693,'SOY',140),
(690,'ZIWA',140),
(700,'HURUMA',141),
(697,'KAMAGUT',141),
(699,'KAPSAOS',141),
(698,'KIPLOMBE',141),
(695,'NGENYILEL',141),
(696,'TAPSAGOI',141),
(703,'KARUNA/MEIBEKI',142),
(705,'KIMUMU',142),
(704,'MOIBEN',142),
(702,'SERGOIT',142),
(701,'TEMBELIO',142),
(708,'AINABKOI/OLARE',143),
(706,'KAPSOYA',143),
(707,'KAPTAGAT',143),
(710,'KIPKENYO',144),
(713,'LANGAS',144),
(712,'MEGUN',144),
(711,'NGERIA',144),
(709,'SIMAT/KAPSERET',144),
(715,'CHEPTIRET/KIPCHAMO',145),
(714,'RACECOURSE',145),
(717,'TARAKWA',145),
(716,'TULWET/CHUIYAT',145),
(721,'EMBOBUT / EMBULOT',146),
(720,'ENDO',146),
(718,'KAPYEGO',146),
(719,'SAMBIRIR',146),
(726,'ARROR',147),
(725,'KAPSOWAR',147),
(722,'LELAN',147),
(724,'MOIBEN/KUSERWO',147),
(723,'SENGWER',147),
(727,'EMSOO',148),
(728,'KAMARINY',148),
(729,'KAPCHEMUTWA',148),
(730,'TAMBACH',148),
(732,'CHEPKORIO',149),
(735,'KABIEMIT',149),
(731,'KAPTARAKWA',149),
(736,'METKEI',149),
(733,'SOY NORTH',149),
(734,'SOY SOUTH',149),
(739,'CHEMELIL/CHEMASE',150),
(740,'KAPSIMOTWO',150),
(737,'SONGHOR/SOBA',150),
(738,'TINDIRET',150),
(741,'KABWARENG',151),
(745,'KAPTUMO-KABOI',151),
(743,'KEMELOI-MARABA',151),
(744,'KOBUJOI',151),
(746,'KOYO-NDURIO',151),
(742,'TERIK',151),
(748,'CHEPKUNYUK',152),
(749,'KAPCHORUA',152),
(747,'NANDI HILLS',152),
(752,'KAPTEL/KAMOIYWO',153),
(753,'KIPTUYA',153),
(750,'KOSIRAI',153),
(751,'LELMOKWO/NGECHEK',153),
(754,'CHEPKUMIA',154),
(755,'KAPKANGANI',154),
(756,'KAPSABET',154),
(757,'KILIBWONI',154),
(758,'CHEPTERWAI',155),
(763,'KABISAGA',155),
(761,'KABIYET',155),
(759,'KIPKAREN',155),
(760,'KURGUNG/SURUNGAI',155),
(762,'NDALAT',155),
(764,'SANGALO/KEBULONIK',155),
(771,'CHURO/AMAYA',156),
(766,'KOLOWA',156),
(769,'LOIYAMOROCK',156),
(767,'RIBKWO',156),
(768,'SILALE',156),
(770,'TANGULBEI/KOROSSI',156),
(765,'TIRIOKO',156),
(776,'BARTABWA',157),
(772,'BARWESSA',157),
(773,'KABARTONJO',157),
(774,'SAIMO/KIPSARAMAN',157),
(775,'SAIMO/SOI',157),
(780,'EWALEL/CHAPCHAP',158),
(777,'KABARNET',158),
(781,'KAPROPITA',158),
(778,'SACHO',158),
(779,'TENGES',158),
(783,'ILCHAMUS',159),
(782,'MARIGAT',159),
(784,'MOCHONGOI',159),
(785,'MUKUTANI',159),
(787,'EMINING',160),
(788,'KISANANA',160),
(786,'MOGOTIO',160),
(794,'KOIBATEK',161),
(789,'LEMBUS',161),
(790,'LEMBUS KWEN',161),
(793,'LEMBUS/PERKERRA',161),
(792,'MUMBERES/MAJI MAZURI',161),
(791,'RAVINE',161),
(797,'GITHIGA',162),
(799,'IGWAMITI',162),
(798,'MARMANET',162),
(795,'OL-MORAN',162),
(796,'RUMURUTI TOWNSHIP',162),
(800,'SALAMA',162),
(804,'NANYUKI',163),
(801,'NGOBIT',163),
(803,'THINGITHU',163),
(802,'TIGITHI',163),
(805,'UMANDE',163),
(809,'MUGOGODO EAST',164),
(808,'MUGOGODO WEST',164),
(807,'SEGERA',164),
(806,'SOSIAN',164),
(811,'ELBURGON',165),
(810,'MARIASHONI',165),
(813,'MOLO',165),
(812,'TURI',165),
(816,'KIHINGO',166),
(818,'LARE',166),
(814,'MAU NAROK',166),
(815,'MAUCHE',166),
(817,'NESSUIT',166),
(819,'NJORO',166),
(820,'BIASHARA',167),
(821,'HELLS GATE',167),
(822,'LAKE VIEW',167),
(823,'MAI MAHIU',167),
(824,'MAIELLA',167),
(826,'NAIVASHA EAST',167),
(825,'OLKARIA',167),
(827,'VIWANDANI',167),
(829,'ELEMENTAITA',168),
(828,'GILGIL',168),
(831,'MALEWA WEST',168),
(830,'MBARUK/EBURU',168),
(832,'MURINDATI',168),
(833,'AMALO',169),
(834,'KERINGET',169),
(835,'KIPTAGICH',169),
(836,'TINET',169),
(840,'KAMARA',170),
(837,'KIPTORORO',170),
(838,'NYOTA',170),
(839,'SIRIKWA',170),
(843,'KABAZI',171),
(841,'SUBUKIA',171),
(842,'WASEGES',171),
(844,'MENENGAI WEST',172),
(847,'MOSOP',172),
(845,'SOIN',172),
(848,'SOLAI',172),
(846,'VISOI',172),
(853,'BAHATI',173),
(849,'DUNDORI',173),
(850,'KABATINI',173),
(851,'KIAMAINA',173),
(852,'LANET/UMOJA',173),
(854,'BARUT',174),
(857,'KAPKURES',174),
(856,'KAPTEMBWO',174),
(855,'LONDON',174),
(858,'RHODA',174),
(859,'SHAABAB',174),
(860,'BIASHARA',175),
(862,'FLAMINGO',175),
(861,'KIVUMBINI',175),
(863,'MENENGAI',175),
(864,'NAKURU EAST',175),
(867,'ANGATA BARIKOI',176),
(866,'KEYIAN',176),
(865,'KILGORIS CENTRAL',176),
(869,'KIMINTET',176),
(870,'LOLGORIAN',176),
(868,'SHANKOE',176),
(871,'ILKERIN',177),
(874,'KAPSASIAN',177),
(873,'MOGONDO',177),
(872,'OLOlMASANI',177),
(880,'MELILI',178),
(877,'NAROK TOWN',178),
(878,'NKARETA',178),
(876,'OLOKURTO',178),
(879,'OLORROPIL',178),
(875,'OLPUSIMORU',178),
(882,'ILDAMAT',179),
(883,'KEEKONYOKIE',179),
(881,'MOSIRO',179),
(884,'SUSWA',179),
(887,'LOITA',180),
(885,'MAJIMOTO/NAROOSURA',180),
(886,'MELELO',180),
(889,'SAGAMIAN',180),
(888,'SOGOO',180),
(890,'ILMOTIOK',181),
(891,'MARA',181),
(893,'NAIKARRA',181),
(892,'SIANA',181),
(898,'NGONG',182),
(896,'NKAIMURUNYA',182),
(894,'OLKERI',182),
(897,'OLOOLUA',182),
(895,'ONGATA RONGAI',182),
(901,'DALALEKUTUK',183),
(900,'ILDAMAT',183),
(902,'MATAPATO NORTH',183),
(903,'MATAPATO SOUTH',183),
(899,'PURKO',183),
(908,'IMARORO',184),
(904,'KAPUTIEI NORTH',184),
(907,'KENYAWA-POKA',184),
(905,'KITENGELA',184),
(906,'OLOOSIRKON/SHOLINKE',184),
(910,'ILOODOKILANI',185),
(909,'KEEKONYOKIE',185),
(911,'MAGADI',185),
(912,'MOSIRO',185),
(913,'ENTONET/LENKISIM',186),
(917,'KIMANA',186),
(915,'KUKU',186),
(914,'MBIRIKANI/ESELENKEI',186),
(916,'ROMBO',186),
(920,'CHEPSEON',187),
(919,'KEDOWA/KIMUGUL',187),
(918,'LONDIANI',187),
(921,'TENDENO/SORGET',187),
(925,'CHILCHILA',188),
(923,'KAMASIAN',188),
(924,'KIPKELION',188),
(922,'KUNYAK',188),
(927,'AINAMOI',189),
(928,'KAPKUGERWET',189),
(931,'KAPSAOS',189),
(926,'KAPSOIT',189),
(929,'KIPCHEBOR',189),
(930,'KIPCHIMCHIM',189),
(934,'CHEBOIN',190),
(935,'CHEMOSOT',190),
(937,'CHEPLANGET',190),
(938,'KAPKATET',190),
(932,'KISIARA',190),
(936,'LITEIN',190),
(933,'TEBESONIK',190),
(942,'CHAIK',191),
(941,'CHEPTORORIET/SERETUT',191),
(940,'KABIANGA',191),
(943,'KAPSUSER',191),
(939,'WALDAI',191),
(945,'KAPLELARTET',192),
(944,'SIGOWET',192),
(947,'SOIN',192),
(946,'SOLIAT',192),
(949,'CHEMAGEL',193),
(951,'KAPLETUNDO',193),
(950,'KIPSONOI',193),
(948,'NDANAI/ABOSI',193),
(952,'RONGENA/MANARET',193),
(955,'CHEBUNYO',194),
(953,'NYANGORES',194),
(954,'SIGOR',194),
(956,'SIONGIROI',194),
(961,'CHEMANER',195),
(958,'KEMBU',195),
(960,'KIPRERES',195),
(959,'LONGISA',195),
(957,'MERIGI',195),
(965,'CHESOEN',196),
(966,'MUTARAKWA',196),
(963,'NDARAWETA',196),
(962,'SILIBWET TOWNSHIP',196),
(964,'SINGORWET',196),
(970,'BOITO',197),
(967,'CHEPCHABAS',197),
(971,'EMBOMOS',197),
(968,'KIMULOT',197),
(969,'MOGOGOSIEK',197),
(975,'CHEKALINI',198),
(976,'CHEVAYWA',198),
(973,'LUGARI',198),
(974,'LUMAKANDA',198),
(977,'LWANDETI',198),
(972,'MAUTUMA',198),
(980,'KONGONI',199),
(978,'LIKUYANI',199),
(981,'NZOIA',199),
(979,'SANGO',199),
(982,'SINOKO',199),
(986,'BUTALI/CHEGULO',200),
(984,'CHEMUCHE',200),
(985,'EAST KABRAS',200),
(987,'MANDA-SHIVANGA',200),
(988,'SHIRUGU-MUGAI',200),
(989,'SOUTH KABRAS',200),
(983,'WEST KABRAS',200),
(992,'BUTSOTSO CENTRAL',201),
(990,'BUTSOTSO EAST',201),
(991,'BUTSOTSO SOUTH',201),
(994,'MAHIAKALO',201),
(993,'SHEYWE',201),
(995,'SHIRERE',201),
(1000,'BUNYALA CENTRAL',202),
(999,'BUNYALA EAST',202),
(998,'BUNYALA WEST',202),
(996,'INGOSTSE-MATHIA',202),
(997,'SHINOYI-SHIKOMARI-ESUMEYIA',202),
(1003,'ETENJE',203),
(1001,'MUMIAS CENTRAL',203),
(1002,'MUMIAS NORTH',203),
(1004,'MUSANDA',203),
(1007,'EAST WANGA',204),
(1005,'LUSHEYA/LUBINU',204),
(1006,'MALAHA/ISONGO/MAKUNGA',204),
(1010,'KHALABA',205),
(1009,'KHOLERA',205),
(1008,'KOYONZO',205),
(1011,'MAYONI',205),
(1012,'NAMAMALI',205),
(1014,'MARAMA CENTRAL',206),
(1016,'MARAMA NORTH',206),
(1017,'MARAMA SOUTH',206),
(1013,'MARAMA WEST',206),
(1015,'MARENYO - SHIANDA',206),
(1021,'KISA CENTRAL',207),
(1019,'KISA EAST',207),
(1018,'KISA NORTH',207),
(1020,'KISA WEST',207),
(1024,'ISUKHA CENTRAL',208),
(1026,'ISUKHA EAST',208),
(1022,'ISUKHA NORTH',208),
(1025,'ISUKHA SOUTH',208),
(1027,'ISUKHA WEST',208),
(1023,'MURHANDA',208),
(1031,'IDAKHO CENTRAL',209),
(1029,'IDAKHO EAST',209),
(1030,'IDAKHO NORTH',209),
(1028,'IDAKHO SOUTH',209),
(1034,'CENTRAL MARAGOLI',210),
(1032,'LUGAGA-WAMULUMA',210),
(1035,'MUNGOMA',210),
(1033,'SOUTH MARAGOLI',210),
(1041,'BUSALI',211),
(1038,'CHAVAKALI',211),
(1036,'LYADUYWA/IZAVA',211),
(1039,'NORTH MARAGOLI',211),
(1037,'WEST SABATIA',211),
(1040,'WODANGA',211),
(1045,'BANJA',212),
(1043,'GISAMBAI',212),
(1048,'JEPKOYAI',212),
(1046,'MUHUDU',212),
(1044,'SHAMAKHOKHO',212),
(1042,'SHIRU',212),
(1047,'TAMBUA',212),
(1053,'EMABUNGO',213),
(1052,'LUANDA SOUTH',213),
(1049,'LUANDA TOWNSHIP',213),
(1051,'MWIBONA',213),
(1050,'WEMILABI',213),
(1055,'CENTRAL BUNYORE',214),
(1054,'NORTH EAST BUNYORE',214),
(1056,'WEST BUNYORE',214),
(1057,'CHEPTAIS',215),
(1059,'CHEPYUK',215),
(1058,'CHESIKAKI',215),
(1062,'ELGON',215),
(1060,'KAPKATENY',215),
(1061,'KAPTAMA',215),
(1065,'LWANDANYI',216),
(1064,'MALAKISI/SOUTH KULISIRU',216),
(1063,'NAMWELA',216),
(1068,'BWAKE/LUUYA',217),
(1066,'KABUCHAI/CHWELE',217),
(1069,'MUKUYUNI',217),
(1067,'WEST NALONDO',217),
(1071,'BUMULA',218),
(1073,'KABULA',218),
(1072,'KHASOKO',218),
(1074,'KIMAETI',218),
(1076,'SIBOTI',218),
(1070,'SOUTH BUKUSU',218),
(1075,'WEST BUKUSU',218),
(1078,'BUKEMBE EAST',219),
(1077,'BUKEMBE WEST',219),
(1080,'KHALABA',219),
(1082,'MARAKARU/TUUTI',219),
(1081,'MUSIKOMA',219),
(1079,'TOWNSHIP',219),
(1085,'MARAKA',220),
(1083,'MIHUU',220),
(1084,'NDIVISI',220),
(1089,'BOKOLI',221),
(1088,'MATULO',221),
(1086,'MISIKHU',221),
(1087,'SITIKHO',221),
(1093,'KAMUKUYWA',222),
(1090,'KIBINGEI',222),
(1091,'KIMILILI',222),
(1092,'MAENI',222),
(1094,'MBAKALO',223),
(1096,'MILIMA',223),
(1095,'NAITIRI/KABUYEFWE',223),
(1097,'NDALU/ TABANI',223),
(1099,'SOYSAMBU/ MITUA',223),
(1098,'TONGAREN',223),
(1100,'MALABA CENTRAL',224),
(1101,'MALABA NORTH',224),
(1102,'MALABA SOUTH',224),
(1107,'AMUKURA CENTRAL',225),
(1106,'AMUKURA EAST',225),
(1105,'AMUKURA WEST',225),
(1104,'CHAKOL NORTH',225),
(1103,'CHAKOL SOUTH',225),
(1111,'BUKHAYO CENTRAL',226),
(1110,'BUKHAYO EAST',226),
(1109,'BUKHAYO NORTH/WALTSI',226),
(1108,'NAMBALE TOWNSHIP',226),
(1112,'BUKHAYO WEST',227),
(1116,'BURUMBA',227),
(1115,'BUSIBWABO',227),
(1114,'MATAYOS SOUTH',227),
(1113,'MAYENJE',227),
(1122,'ELUGULU',228),
(1118,'KINGANDOLE',228),
(1119,'MARACHI CENTRAL',228),
(1120,'MARACHI EAST',228),
(1121,'MARACHI NORTH',228),
(1117,'MARACHI WEST',228),
(1125,'BWIRI',229),
(1123,'NAMBOBOTO NAMBUKU',229),
(1124,'NANGINA',229),
(1126,'BUNYALA CENTRAL',230),
(1127,'BUNYALA NORTH',230),
(1129,'BUNYALA SOUTH',230),
(1128,'BUNYALA WEST',230),
(1133,'EAST UGENYA',231),
(1132,'NORTH UGENYA',231),
(1131,'UKWALA',231),
(1130,'WEST UGENYA',231),
(1134,'SIDINDI',232),
(1135,'SIGOMERE',232),
(1136,'UGUNJA',232),
(1139,'CENTRAL ALEGO',233),
(1141,'NORTH ALEGO',233),
(1140,'SIAYA TOWNSHIP',233),
(1142,'SOUTH EAST ALEGO',233),
(1137,'USONGA',233),
(1138,'WEST ALEGO',233),
(1145,'CENTRAL GEM',234),
(1147,'EAST GEM',234),
(1143,'NORTH GEM',234),
(1148,'SOUTH GEM',234),
(1144,'WEST GEM',234),
(1146,'YALA TOWNSHIP',234),
(1150,'CENTRAL SAKWA',235),
(1154,'NORTH SAKWA',235),
(1151,'SOUTH SAKWA',235),
(1153,'WEST SAKWA',235),
(1149,'WEST YIMBO',235),
(1152,'YIMBO EAST',235),
(1155,'EAST ASEMBO',236),
(1157,'NORTH UYOMA',236),
(1158,'SOUTH UYOMA',236),
(1156,'WEST ASEMBO',236),
(1159,'WEST UYOMA',236),
(1160,'KAJULU',237),
(1164,'KOLWA CENTRAL',237),
(1161,'KOLWA EAST',237),
(1162,'MANYATTA \\B\\',237),
(1163,'NYALENDA \\A\\',237),
(1166,'CENTRAL KISUMU',238),
(1167,'KISUMU NORTH',238),
(1169,'NORTH WEST KISUMU',238),
(1165,'SOUTH WEST KISUMU',238),
(1168,'WEST KISUMU',238),
(1174,'KONDELE',239),
(1173,'MARKET MILIMANI',239),
(1171,'MIGOSI',239),
(1175,'NYALENDA B',239),
(1170,'RAILWAYS',239),
(1172,'SHAURIMOYO KALOLENI',239),
(1177,'CENTRAL SEME',240),
(1178,'EAST SEME',240),
(1179,'NORTH SEME',240),
(1176,'WEST SEME',240),
(1182,'AHERO',241),
(1181,'AWASI/ONJIKO',241),
(1180,'EAST KANO/WAWIDHI',241),
(1183,'KABONYO/KANYAGWAL',241),
(1184,'KOBURA',241),
(1187,'CHEMELIL',242),
(1185,'MIWANI',242),
(1188,'MUHORONI/KORU',242),
(1186,'OMBEYI',242),
(1191,'CENTRAL NYAKACH',243),
(1190,'NORTH NYAKACH',243),
(1193,'SOUTH EAST NYAKACH',243),
(1189,'SOUTH WEST NYAKACH',243),
(1192,'WEST NYAKACH',243),
(1196,'CENTRAL KASIPUL',244),
(1197,'EAST KAMAGAK',244),
(1195,'SOUTH KASIPUL',244),
(1198,'WEST KAMAGAK',244),
(1194,'WEST KASIPUL',244),
(1199,'KABONDO EAST',245),
(1200,'KABONDO WEST',245),
(1202,'KOJWACH',245),
(1201,'KOKWANYO/KAKELO',245),
(1205,'CENTRAL',246),
(1206,'KANYALUO',246),
(1209,'KENDU BAY TOWN',246),
(1207,'KIBIRI',246),
(1204,'NORTH KARACHUONYO',246),
(1208,'WANGCHIENG',246),
(1203,'WEST KARACHUONYO',246),
(1211,'EAST GEM',247),
(1212,'KAGAN',247),
(1213,'KOCHIA',247),
(1210,'WEST GEM',247),
(1215,'HOMA BAY ARUJO',248),
(1214,'HOMA BAY CENTRAL',248),
(1217,'HOMA BAY EAST',248),
(1216,'HOMA BAY WEST',248),
(1221,'KABUOCH NORTH',249),
(1222,'KABUOCH SOUTH/PALA',249),
(1219,'KANYADOTO',249),
(1223,'KANYAMWA KOLOGI',249),
(1224,'KANYAMWA KOSEWE',249),
(1220,'KANYIKELA',249),
(1218,'KWABWAI',249),
(1228,'GEMBE',250),
(1227,'KASGUNGA',250),
(1229,'LAMBWE',250),
(1225,'MFANGANO ISLAND',250),
(1226,'RUSINGA ISLAND',250),
(1231,'GWASSI NORTH',251),
(1230,'GWASSI SOUTH',251),
(1232,'KAKSINGRI WEST',251),
(1233,'RUMA-KAKSINGRI',251),
(1235,'CENTRAL KAMAGAMBO',252),
(1236,'EAST KAMAGAMBO',252),
(1234,'NORTH KAMAGAMBO',252),
(1237,'SOUTH KAMAGAMBO',252),
(1241,'CENTRAL SAKWA',253),
(1238,'NORTH SAKWA',253),
(1239,'SOUTH SAKWA',253),
(1240,'WEST SAKWA',253),
(1242,'GOD JOPE',254),
(1244,'KAKRAO',254),
(1245,'KWA',254),
(1243,'SUNA CENTRAL',254),
(1248,'RAGANA-ORUBA',255),
(1249,'WASIMBETE',255),
(1247,'WASWETA II',255),
(1246,'WIGA',255),
(1252,'CENTRAL KANYAMKAGO',256),
(1254,'EAST KANYAMKAGO',256),
(1251,'NORTH KANYAMKAGO',256),
(1253,'SOUTH KANYAMKAGO',256),
(1250,'WEST KANYAMKAGO',256),
(1259,'GOT KACHOLA',257),
(1258,'KALER',257),
(1255,'KANYASA',257),
(1257,'MACALDER/KANYARWANDA',257),
(1260,'MUHURU',257),
(1256,'NORTH KADEM',257),
(1262,'BUKIRA CENTRL/IKEREGE',258),
(1261,'BUKIRA EAST',258),
(1263,'ISIBANIA',258),
(1264,'MAKERERO',258),
(1265,'MASABA',258),
(1267,'NYAMOSENSE/KOMOSOKO',258),
(1266,'TAGARE',258),
(1268,'GOKEHARAKA/GETAMBWEGA',259),
(1270,'NTIMARU EAST',259),
(1269,'NTIMARU WEST',259),
(1271,'NYABASI EAST',259),
(1272,'NYABASI WEST',259),
(1274,'BOGIAKUMU',260),
(1273,'BOMARIBA',260),
(1275,'BOMORENDA',260),
(1276,'RIANA',260),
(1278,'BOGETENGA',261),
(1279,'BORABU / CHITAGO',261),
(1281,'GETENGA',261),
(1280,'MOTICHO',261),
(1277,'TABAKA',261),
(1284,'BOKIMONGE',262),
(1282,'BOMBABA BORABU',262),
(1283,'BOOCHI BORABU',262),
(1285,'MAGENCHE',262),
(1290,'BASI BOGETAORIO',263),
(1288,'BASI CENTRAL',263),
(1293,'BOBASI BOITANGARE',263),
(1291,'BOBASI CHACHE',263),
(1287,'MASIGE EAST',263),
(1286,'MASIGE WEST',263),
(1289,'NYACHEKI',263),
(1292,'SAMETA/MOKWERERO',263),
(1295,'BOOCHI/TENDERE',264),
(1296,'BOSOTI/SENGERA',264),
(1294,'MAJOGE BASI',264),
(1300,'GESUSU',265),
(1297,'ICHUNI',265),
(1301,'KIAMOKAMA',265),
(1299,'MASIMBA',265),
(1298,'NYAMASIBI',265),
(1306,'BIRONGO',266),
(1302,'BOBARACHO',266),
(1307,'IBENO',266),
(1304,'KEUMBU',266),
(1305,'KIOGORO',266),
(1303,'KISII CENTRAL',266),
(1311,'KEGOGI',267),
(1310,'MARANI',267),
(1308,'MONYERERO',267),
(1309,'SENSI',267),
(1313,'BOGEKA',268),
(1312,'BOGUSERO',268),
(1315,'KITUTU CENTRAL',268),
(1314,'NYAKOE',268),
(1316,'NYATIEKO',268),
(1318,'GACHUBA',269),
(1322,'GESIMA',269),
(1319,'KEMERA',269),
(1320,'MAGOMBO',269),
(1321,'MANGA',269),
(1317,'RIGOMA',269),
(1324,'BOGICHORA',270),
(1326,'BONYAMATUTA',270),
(1325,'BOSAMARO',270),
(1323,'NYAMAIYA',270),
(1327,'TOWNSHIP',270),
(1330,'BOKEIRA',271),
(1329,'BOMWAGAMO',271),
(1332,'EKERENYO',271),
(1328,'ITIBO',271),
(1331,'MAGWAGWA',271),
(1336,'ESISE',272),
(1334,'KIABONYORU',272),
(1333,'MEKENENE',272),
(1335,'NYANSIONGO',272),
(1340,'KANGEMI',273),
(1339,'KARURA',273),
(1337,'KITISURU',273),
(1341,'MOUNTAIN VIEW',273),
(1338,'PARKLANDS/HIGHRIDGE',273),
(1344,'GATINA',274),
(1346,'KABIRO',274),
(1343,'KAWANGWARE',274),
(1345,'KILELESHWA',274),
(1342,'KILIMANI',274),
(1347,'MUTU-INI',275),
(1348,'NGANDO',275),
(1349,'RIRUTA',275),
(1350,'UTHIRU/RUTHIMITU',275),
(1351,'WAITHAKA',275),
(1352,'KAREN',276),
(1354,'MUGUMU-INI',276),
(1353,'NAIROBI WEST',276),
(1356,'NYAYO HIGHRISE',276),
(1355,'SOUTH C',276),
(1357,'LAINI SABA',277),
(1358,'LINDI',277),
(1359,'MAKINA',277),
(1361,'SARANGOMBE',277),
(1360,'WOODLEY/KENYATTA GOLF COURSE',277),
(1362,'GITHURAI',278),
(1366,'KAHAWA',278),
(1363,'KAHAWA WEST',278),
(1365,'ROYSAMBU',278),
(1364,'ZIMMERMAN',278),
(1367,'CLAY CITY',279),
(1369,'KASARANI',279),
(1368,'MWIKI',279),
(1370,'NJIRU',279),
(1371,'RUAI',279),
(1372,'BABA DOGO',280),
(1376,'KOROGOCHO',280),
(1375,'LUCKY SUMMER',280),
(1374,'MATHARE NORTH',280),
(1373,'UTALII',280),
(1377,'IMARA DAIMA',281),
(1378,'KWA NJENGA',281),
(1379,'KWA REUBEN',281),
(1381,'KWARE',281),
(1380,'PIPELINE',281),
(1383,'DANDORA AREA I',282),
(1384,'DANDORA AREA II',282),
(1385,'DANDORA AREA III',282),
(1386,'DANDORA AREA IV',282),
(1382,'KARIOBANGI NORTH',282),
(1388,'KAYOLE CENTRAL',283),
(1387,'KAYOLE NORTH',283),
(1389,'KAYOLE SOUTH',283),
(1390,'KOMAROCK',283),
(1391,'MATOPENI/SPRING VALLEY',283),
(1394,'EMBAKASI',284),
(1393,'LOWER SAVANNAH',284),
(1396,'MIHANGO',284),
(1392,'UPPER SAVANNAH',284),
(1395,'UTAWALA',284),
(1400,'KARIOBANGI SOUTH',285),
(1399,'MOWLEM',285),
(1397,'UMOJA I',285),
(1398,'UMOJA II',285),
(1403,'HARAMBEE',286),
(1404,'MAKONGENI',286),
(1401,'MARINGO/HAMZA',286),
(1402,'VIWANDANI',286),
(1408,'AIRBASE',287),
(1409,'CALIFORNIA',287),
(1406,'EASTLEIGH NORTH',287),
(1407,'EASTLEIGH SOUTH',287),
(1405,'PUMWANI',287),
(1414,'LANDIMAWE',288),
(1410,'NAIROBI CENTRAL',288),
(1415,'NAIROBI SOUTH',288),
(1411,'NGARA',288),
(1412,'PANGANI',288),
(1413,'ZIWANI/KARIOKOR',288),
(1416,'HOSPITAL',289),
(1418,'HURUMA',289),
(1421,'KIAMAIKO',289),
(1417,'MABATINI',289),
(1420,'MLANGO KUBWA',289),
(1419,'NGEI',289);
/*!40000 ALTER TABLE `wards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'majuu_portal'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-07-24 19:29:11
