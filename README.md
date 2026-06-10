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
# Servidor
PORT=3000

# Base de datos MySQL
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=ecorutas
DB_PORT=3306

# JWT
JWT_SECRET=tu_clave_secreta

# Firebase Realtime Database
FIREBASE_DATABASE_URL=https://tu-proyecto.firebaseio.com
```
**Proyecto Firebase:**

```bash
https://console.firebase.google.com/project/routes-9acfa/overview?hl=es-419
```

Esta última (FIREBASE_DATABASE_URL), la encuentras en la sección de categorías de producto (en el menú), bases de datos y almacenamiento, Realtime Database, en la tab de datos. Es un enlace similar a este: **https://tu-basedatos-9rfg-defautl-rtdb.firebaseio.com** 

> **Importante:** las credenciales de Firebase deben colocarse en `src/config/firebase-credentials.json` para que el SDK de `firebase-admin` pueda autenticarse.

Para las credenciales, debes dirigirte a configuración y luego a cuentas de servicio, luego en la tab de SDK de Firebase Admin dar clic en el botón **generar nueva clave privada**. Eso iniciará la descarga del archivo de credenciales, el cual debes renombrar a firebase-credentials.json y pegarlo en la ruta mencionada. 

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
    │   ├── authController.js
    │   ├── registerController.js
    │   ├── updateProfileController.js
    │   ├── seedController.js
    │   ├── zoneController.js
    │   ├── reportController.js
    │   ├── routeController.js
    │   ├── routeViewController.js
    │   ├── userRouteController.js
    │   ├── userController.js
    │   └── reminderController.js
    ├── models/                  # Modelos de datos (acceso a tablas)
    │   ├── User.js
    │   ├── Route.js
    │   ├── Zone.js
    │   └── Report.js
    ├── middleware/
    │   └── auth.js              # Middleware de autenticación vía JWT
    ├── routes/
    │   └── routes.js            # Definición de todos los endpoints de la API
    ├── services/
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

## Notificaciones FCM con Recordatorio

### Descripción

El sistema incluye un servicio automático de notificaciones para recordar a los usuarios sacar la basura antes de que pase el camión. Las notificaciones se envían 30 minutos antes de la hora de inicio de cada ruta.

### Características

1. **Notificaciones automáticas diarias** a las 05:50 AM
2. **Personalización por frecuencia**: Las rutas se ejecutan en específicos días de la semana (Lun-Mié-Vie o Mar-Jue-Sáb)
3. **Firebase Cloud Messaging (FCM)**: Integración con Firebase para enviar notificaciones push
4. **Tokens FCM**: Cada usuario puede registrar su token para recibir notificaciones
5. **Demo manual**: Botón en la vista de rutas para enviar notificaciones de forma manual

### Flujo de funcionamiento

#### 1. Registro del token FCM

El usuario debe enviar su token FCM al servidor:

```bash
curl -X POST http://localhost:3000/api/user/fcm-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"fcm_token": "eB0_bVHqZ3k:APA91bF..."}'
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Token FCM actualizado correctamente",
  "data": {
    "fcm_token": "eB0_bVHqZ3k:APA91bF..."
  }
}
```

#### 2. Ejecución automática

- Diariamente a las **05:50 AM** se ejecuta el servicio `scheduleReminderNotifications()`
- El servicio obtiene el día actual en español (ej: "lun", "mar")
- Busca todas las rutas activas que se ejecutan ese día
- Para cada ruta, obtiene los usuarios asociados con tokens FCM válidos
- Calcula el tiempo de espera: `startTime - 30 minutos`
- Programa el envío de notificación para esa hora exacta

#### 3. Contenido de la notificación

**Título:** "Hoy pasa el camión 🚛"
**Cuerpo:** "No olvides sacar tu basura"

#### 4. Envío manual (Demo)

Para fines de demostración, es posible enviar una notificación de forma manual:

```bash
curl -X POST http://localhost:3000/api/routes/1/send-reminder \
  -H "Content-Type: application/json"
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Notificación enviada a 5 usuario(s)",
  "data": {
    "tokensCount": 5
  }
}
```

### Configuración requerida

1. **Firebase Realtime Database** debe estar configurada (credenciales en `src/config/firebase-credentials.json`)
2. **node-cron** está instalado para la programación de tareas
3. **Firebase Admin SDK** está inicializado correctamente
4. Los usuarios deben tener un **token FCM válido** registrado en la BD

### Estructura de datos

#### Token FCM en la tabla `citizen`

```sql
ALTER TABLE citizen ADD COLUMN fcm_token VARCHAR(255) NULL;
```

#### Mapeo de frecuencias de ruta

- `Lun-Mie-Vie`: Se ejecuta lunes, miércoles y viernes
- `Mar-Jue-Sab`: Se ejecuta martes, jueves y sábado

### Monitoreo

El servicio registra sus operaciones en la consola:

```
✓ Servicio de recordatorios programado para 05:50 AM diarios
📅 Verificación de recordatorios - Día: lun - 9/6/2026 5:50:00 AM
Encontradas 2 rutas activas para hoy
⏰ Programando notificación para Ruta Centro en 1800s
📢 Enviando notificación para: Ruta Centro
✓ Notificaciones enviadas: 5 éxito, 0 fallo
```

### Troubleshooting

| Problema | Causa | Solución |
|----------|-------|----------|
| "No hay usuarios con tokens para esta ruta" | Usuarios sin token FCM registrado | El usuario debe hacer POST a `/api/user/fcm-token` |
| Notificaciones no llegan | Token FCM inválido o expirado | Renovar el token en el cliente |
| Servicio no inicia | Firebase no configurado | Verificar credenciales en `firebase-credentials.json` |
| "La hora de envío ya pasó" | startTime es anterior a las 05:50 AM | Configurar startTime posterior a 05:50 AM |

 |
