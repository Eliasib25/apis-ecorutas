# EcoRutas API

API REST para el proyecto **EcoRutas**, desarrollada con Node.js, Express y MySQL, con integración de Firebase Realtime Database para el seguimiento en tiempo real de las rutas.

---

## Tabla de contenidos
1. [Requisitos](#requisitos)
2. [Configuración](#configuración)
3. [Uso](#uso)
4. [Despliegue con Docker](#despliegue-con-docker)
5. [Estructura del proyecto](#estructura-del-proyecto)
6. [Endpoints](#endpoints)

---

## Requisitos

- **Node.js** v14 o superior
- **MySQL** 5.7 o superior
- **npm** o **yarn**
- (Opcional) **Docker** y **Docker Compose** para ejecutar la app con contenedores

---

## Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Crear la base de datos

Importa el script `ecorutas-db.sql` en tu servidor MySQL. Este archivo crea la base de datos y las tablas necesarias.


### 3. Crear el archivo `.env`

Copia `.env.example` como `.env` y completa los valores:

```env
##Server 
PORT = el puerto que deseas usar para tu servidor, por ejemplo: 3000

##Database
DB_HOST = el host de tu base de datos
DB_USER = el usuario de tu base de datos
DB_PASSWORD = la contraseña de tu base de datos
DB_NAME = el nombre de tu base de datos
DB_PORT = el puerto de tu base de datos

##JWT
JWT_SECRET = tu_clave_secreta_aqui

##Firebase Real-time Database
FIREBASE_DATABASE_URL = La URL de tu base de datos de Firebas Real-time Database

##SendPulse API
SENDPULSE_API_USER_ID = tu_api_user_id_de_sendpulse
SENDPULSE_API_SECRET = tu_api_key_estatico_de_sendpulse
EMAIL_FROM = tu_correo_verificado_en_sendpulse
EMAIL_FROM_NAME = Nombre del Remitente

##Firebase credentials
FIREBASE_CREDENTIALS = {
  "type": "tu-tipo-de-credencial",
  "project_id": "tu-id-de-proyecto",
  "private_key_id": "tu-id-de-clave-privada",
  "private_key": "-----BEGIN PRIVATE KEY-----\ntu-clave-privada-aqui\n-----END PRIVATE KEY-----",
  "client_email": "tu-firebase-client-email",
  "client_id": "tu-firebase-client-id",
  "auth_uri": "tu-firebase-auth-uri",
  "token_uri": "tu-firebase-token-uri",
  "auth_provider_x509_cert_url": "tu-firebase-auth-provider-cert-url",
  "client_x509_cert_url": "tu-firebase-client-cert-url",
  "universe_domain": "tu-firebase-universe-domain"
}


##Sendpulse API
SENDPULSE_API_SECRET = tu_api_key_estatico_de_sendpulse
EMAIL_FROM_NAME = Nombre del Remitente
EMAIL_FROM = tu_correo_verificado_en_sendpulse
```
**Proyecto Firebase:**

```bash
https://console.firebase.google.com/project/routes-9acfa/overview?hl=es-419
```

Esta última (FIREBASE_DATABASE_URL), la encuentras en la sección de categorías de producto (en el menú), bases de datos y almacenamiento, Realtime Database, en la tab de datos. Es un enlace similar a este: **https://tu-basedatos-9rfg-defautl-rtdb.firebaseio.com** 

Para las credenciales, debes dirigirte a configuración y luego a cuentas de servicio, luego en la tab de SDK de Firebase Admin dar clic en el botón **generar nueva clave privada**. Eso iniciará la descarga del archivo de credenciales, abrelo y pega cada una de las credenciales en el archivo .env en FIREBASE_CRDENTIALS.

---

## Uso

### Modo desarrollo (con auto-reinicio gracias a `nodemon`)

```bash
npm run dev
```

### Modo producción

```bash
npm start
```

El servidor quedará escuchando en `http://localhost:3000` (o el puerto definido en `PORT`).

Luego de esto, debes hacer una petición **GET** al siguiente endpoint (puedes usar postman o directamente ejecutarlo en el navegador): `http://localhost:3000/api/seed`

Esto anterior con el fin de poblar la base de datos y garantizar el correcto funcionamiento de los demás endpoints

---

## Despliegue con Docker

El proyecto incluye un `docker-compose.yml` que levanta tres servicios:

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| `db`     | 3306   | MySQL 8.1 con la BD inicializada a partir de `ecorutas-db.sql` |
| `api`    | 3000   | API de Node.js |
| `nginx`  | 8080   | Reverse proxy hacia la API (expone el servicio en el puerto 8080) |

Para levantar todo el stack:

```bash
docker-compose up --D
```

La API quedará disponible en `http://localhost:8080`.

---

## Estructura del proyecto

```
apis-ecorutas/
├── app.js                       # Punto de entrada: configura Express, middlewares y rutas
├── package.json                 # Dependencias y scripts npm
├── .env                         # Variables de entorno (no se versiona)
├── .env.example                 # Plantilla de variables de entorno
├── ecorutas-db.sql              # Script SQL para crear la base de datos
├── Dockerfile                   # Imagen Docker de la API
├── docker-compose.yml           # Orquestación: MySQL + API + Nginx
├── nginx/
│   └── default.conf             # Configuración del reverse proxy (Nginx)
└── src/
    ├── config/
    │   ├── database.js          # Conexión a MySQL
    │   ├── firebase.js          # Inicialización del SDK de Firebase Admin
    │   └── firebase-credentials.json  # Credenciales del proyecto Firebase
    ├── controllers/             # Lógica de negocio de cada endpoint
    |
    ├── models/                  # Modelos de datos (acceso a tablas)
    |
    ├── middleware/
    │   └── auth.js              # Middleware de autenticación vía JWT
    ├── routes/
    │   └── routes.js            # Definición de todos los endpoints de la API
    ├── services/
    |   |__emailService          # Lógica para el envío de emails
    |   |__ proximityNotification # Lógica para el envío de notificaciones de proximidad
    │   ├── routeSimulator.js    # Lógica de simulación/generación de rutas
    │   └── reminderNotification.js # Servicio de notificaciones FCM por recordatorio
    └── views/
        └── routes/
            └── index.html       # Vista HTML servida por la API
```

### Descripción de carpetas

| Carpeta | Propósito |
|---------|-----------|
| `src/config/` | Configuración de servicios externos (MySQL, Firebase). |
| `src/controllers/` | Manejan las peticiones HTTP y devuelven las respuestas. |
| `src/models/` | Encapsulan el acceso y las consultas a la base de datos. |
| `src/middleware/` | Funciones que se ejecutan antes de los controladores (p. ej. verificación de JWT). |
| `src/routes/` | Define las URLs/endpoints y los asocia a los controladores. |
| `src/services/` | Lógica auxiliar o de soporte (simuladores, integraciones, etc.). |
| `src/views/` | Plantillas/archivos HTML servidos por la API. |

---

## Endpoints

Base URL: `/api`

### Autenticación y perfil

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/auth/login` | No | Inicia sesión con usuario y contraseña. |
| `POST` | `/auth/register` | No | Registra un nuevo usuario. |
| `GET`  | `/auth/profile` | Sí (JWT) | Obtiene el perfil del usuario autenticado. |
| `PATCH`| `/auth/profile` | Sí (JWT) | Edita el perfil del usuario autenticado. |

### Datos y seed

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET`  | `/seed` | No | Puebla la base de datos con rutas y zonas predefinidas. |
| `GET`  | `/zones` | No | Lista las zonas o barrios disponibles. |

### Reportes

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/reports` | Sí (JWT) | Crea un nuevo reporte. |
| `GET`  | `/reports/types` | No | Devuelve los tipos de reporte disponibles. |

### Rutas

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET`  | `/user/route` | Sí (JWT) | Obtiene la ruta asignada al usuario. |
| `POST` | `/user/fcm-token` | Sí (JWT) | Actualiza el token FCM del usuario para recibir notificaciones. |
| `GET`  | `/views/routes` | No | Renderiza la vista HTML de rutas. |
| `POST` | `/routes/:id/start` | No | Inicia el seguimiento de una ruta. |
| `POST` | `/routes/:id/stop` | No | Detiene el seguimiento de una ruta. |
| `POST` | `/routes/:routeId/send-reminder` | No | Envía notificación manual de recordatorio (demo). |

### Salud

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET`  | `/health` | No | Verifica que el servidor está funcionando.

---

