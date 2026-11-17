Sonido Vivo
Integrantes: [Thian Pereira] - [ thi.pereira@duocuc.cl ] [Jesús Serrano] - [ jes.serrano@duocuc.cl ] [Constanza Carrasco] - [ cons.carrascoc@duocuc.cl ]

Descripción del proyecto
Backend del proyecto Sonido Vivo desarrollado con Node.js, Express y PostgreSQL (AWS RDS), documentado con Swagger.

Tecnologías utilizadas
- Node.js
- Express
- PostgreSQL (AWS RDS)
- dotenv
- cors
- pg
- swagger-ui-express
- swagger-jsdoc

Requisitos previos
Para ejecutar el proyecto se necesita tener instalado Node.js y npm.

Instalación
Clonar el repositorio y entrar a la carpeta del proyecto:
git clone https://github.com/Thian-Pereira/Backend-SonidoVivo.git
cd Backend-SonidoVivo

Instalar las dependencias:
npm install

Configuración del entorno
Crear un archivo `.env` en la raíz del proyecto basándose en las variables necesarias:
PORT=3000
DB_HOST=tu_host_rds
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=bdnodecons
JWT_SECRET=tu_clave_secreta

Ejecución del proyecto
Iniciar el servidor en desarrollo:
npm start

Abrir en el navegador la documentación de Swagger:
http://localhost:3000/api-docs

Estructura del proyecto
src/
├── controllers/
├── routes/
├── app.js
├── db.js
└── swagger.js
database/
└── schema.sql
index.js
README.md

## Estado de Avance - Evaluación Parcial 3 (Semana 15)

| Operación | Estado | Descripción |
| :--- | :--- | :--- |
| **Tabla de usuarios** | Listo | Creada en PostgreSQL con roles definidos. |
| **Inicio de sesión** | Listo | Login comprueba hash y entrega JWT. |
| **Registro** | Listo | Guarda usuario con hash y rol asignado por servidor. |
| **Modificar usuario** | En avance | Controlador inicial creado. |
| **Listar usuarios** | En avance | Controlador inicial creado. |
| **Eliminar usuario** | En avance | Controlador inicial creado. |
