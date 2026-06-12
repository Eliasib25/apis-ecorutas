CREATE TABLE route(
  identification INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(45) NOT NULL,
  frecuency ENUM('Lun-Mie-Vie', 'Mar-Jue-Sab') NULL,
  startTime VARCHAR(45) NOT NULL,
  isActive VARCHAR(45) NOT NULL,
  PRIMARY KEY (identification));

CREATE TABLE citizen (
  identificationtype ENUM('CC', 'TI', 'CE') NOT NULL,
  identification VARCHAR(45) NOT NULL,
  names VARCHAR(45) NOT NULL,
  lastnames VARCHAR(45) NOT NULL,
  email VARCHAR(45) NOT NULL,
  phone VARCHAR(45) NOT NULL,
  address VARCHAR(45) NOT NULL,
  neighborhood VARCHAR(45) NOT NULL,
  userName VARCHAR(45) NOT NULL,
  password VARCHAR(255) NOT NULL,
  routesIdentification INT NULL,
  fcm_token VARCHAR(255) NULL,  
  last_latitude DECIMAL NULL,
  last_longitude DECIMAL NULL,
  PRIMARY KEY (identificationtype, identification),
  CONSTRAINT citizenroute
    FOREIGN KEY (routesIdentification)
    REFERENCES route (identification));


CREATE TABLE report (
  identification INT(11) NOT NULL AUTO_INCREMENT,
  type ENUM('operacional', 'calidadservicio', 'administrativo', 'contaminacion', 'otro') NOT NULL,
  problem LONGTEXT NOT NULL,
  address VARCHAR(45) NOT NULL,
  date DATETIME NOT NULL,
  citizenidentificationtype ENUM('CC', 'TI', 'CE') NOT NULL,
  citizenidentification VARCHAR(45) NOT NULL,
  PRIMARY KEY (identification),
  CONSTRAINT reportcitizen
    FOREIGN KEY (citizenidentificationtype , citizenidentification)
    REFERENCES citizen (identificationtype , identification));


CREATE TABLE zone (
  identification INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(45) NOT NULL,
  routeidentification INT NOT NULL,
  PRIMARY KEY (`identification`),
  CONSTRAINT zoneroute
    FOREIGN KEY (routeidentification)
    REFERENCES route (identification));