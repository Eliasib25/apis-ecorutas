# EcoRutas API

## Descripción
APIs del proyecto EcoRutas desarrolladas en Node.js + Express con MySQL.

## Requisitos
- Node.js v14+
- MySQL 5.7+
- npm o yarn

## Instalación

1. Instalar dependencias:
```bash
npm install
```

3. Configurar las variables de entorno en `.env`:
```
PORT = el puerto que desees para el servidor
DB_HOST = el host de tu base de datos
DB_USER = el usuario de tu base de datos
DB_PASSWORD = la contraseña de tu base de datos
DB_NAME = el nombre de tu base de datos
DB_PORT = el puerto de tu base de datos
JWT_SECRET = tu_clave_secreta_aqui
```

## Ejecución

Desarrollo (con auto-reinicio):
```bash
npm run dev
```

Producción:
```bash
npm start
```

## Endpoints

### 1. **POST** `/api/auth/login`
Inicia sesión con usuario y contraseña

### 2. **POST** `/api/auth/register`
Registra un nuevo usuario

### 3. **GET** `/api/auth/profile`
Obtiene el perfil del usuario autenticado (requiere token)

### 4. **PATCH** `/api/auth/profile`
Edita el perfil del usuario autenticado

### 5. **GET** `/api/seed`
Rellena la base de datos con rutas y zonas predefinidas

### 6. **GET** `/api/zones`
Obtiene las zonas o barrios

### 7. **GET** `/api/health`
Verifica que el servidor está funcionando


## Estructura del Proyecto

```
apis-ecorutas/
├── app.js                    # Archivo principal
├── package.json
├── .env                      # Variables de entorno
├── ecorutas-db.sql           # Script para crear la base de datos
├── src/
│   ├── config/
│   │   └── database.js       # Configuración de conexión a BD
│   ├── controllers/
│   │   └── 
│   ├── models/
│   │   └── 
│   ├── middleware/
│   │   └── auth.js           # Middleware para verificar JWT
│   └── routes/
│       └── routes.js         # rutas, es decir los endpoints
```
