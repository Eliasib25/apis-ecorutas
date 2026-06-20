CREATE DATABASE IF NOT EXISTS ecorutas;

USE ecorutas;

CREATE TABLE truck (
identification INT NOT NULL AUTO_INCREMENT,
plate VARCHAR (45) NOT NULL,
capacityKg DECIMAL(10, 2) NOT NULL,
conditionTruck ENUM ('disponible', 'En mantenimiento', 'fuera de servicio') DEFAULT 'disponible',
PRIMARY KEY (identification)
);

CREATE TABLE route(
  identification INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(45) NOT NULL,
  frecuency ENUM('Lun-Mie-Vie', 'Mar-Jue-Sab') NULL,
  startTime VARCHAR(45) NOT NULL,
  isActive VARCHAR(45) NOT NULL,
  truckIdentification INT NULL,
  PRIMARY KEY (identification),
  CONSTRAINT routetruck 
    FOREIGN KEY (truckIdentification)
    REFERENCES truck (identification));

CREATE TABLE user (
  identificationtype ENUM('CC', 'TI', 'CE') NOT NULL,
  identification VARCHAR(45) NOT NULL,
  names VARCHAR(45) NOT NULL,
  lastnames VARCHAR(45) NOT NULL,
  email VARCHAR(45) NOT NULL,
  phone VARCHAR(45) NOT NULL,
  address VARCHAR(45) NOT NULL,
  neighborhood VARCHAR(45) NOT NULL,
  role ENUM ('admin', 'citizen') DEFAULT 'citizen',
  userName VARCHAR(45) NOT NULL,
  password VARCHAR(255) NOT NULL,
  routesIdentification INT NULL,
  fcm_token VARCHAR(255) NULL,  
  last_latitude DECIMAL(10, 8) NULL,
  last_longitude DECIMAL(11, 8) NULL,
  PRIMARY KEY (identificationtype, identification),
  CONSTRAINT citizenroute
    FOREIGN KEY (routesIdentification)
    REFERENCES route (identification));
    
CREATE TABLE problem (
identification INT NOT NULL AUTO_INCREMENT, 
name VARCHAR (255),
state ENUM ('activo', 'inactivo'),
PRIMARY KEY (identification)
);

CREATE TABLE report (
  identification INT NOT NULL AUTO_INCREMENT,
  type INT NOT NULL,
  problem LONGTEXT NOT NULL,
  address VARCHAR(45) NOT NULL,
  date DATETIME NOT NULL,
  state ENUM('Pendiente', 'Resuelto') NOT NULL DEFAULT 'Pendiente',
  citizenidentificationtype ENUM('CC', 'TI', 'CE') NOT NULL,
  citizenidentification VARCHAR(45) NOT NULL,
  PRIMARY KEY (identification),
  CONSTRAINT reportproblem
	FOREIGN KEY (type)
    REFERENCES problem (identification),
  CONSTRAINT reportcitizen
    FOREIGN KEY (citizenidentificationtype , citizenidentification)
    REFERENCES user (identificationtype , identification));


CREATE TABLE zone (
  identification INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(45) NOT NULL,
  routeidentification INT NOT NULL,
  PRIMARY KEY (`identification`),
  CONSTRAINT zoneroute
    FOREIGN KEY (routeidentification)
    REFERENCES route (identification));
    
CREATE TABLE notice (
  identification INT NOT NULL AUTO_INCREMENT,
  title VARCHAR (255) NOT NULL,
  description LONGTEXT NOT NULL,
  date DATE NOT NULL,
  PRIMARY KEY (identification)
);