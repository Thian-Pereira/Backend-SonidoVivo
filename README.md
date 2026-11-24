# Sonido Vivo — API RESTful Backend (Node.js + Express + PostgreSQL)

API RESTful de la plataforma e-commerce de instrumentos musicales **Sonido Vivo**, desarrollada con **Node.js**, **Express** y **PostgreSQL**. Implementa autenticación mediante **JSON Web Tokens (JWT)**, control de acceso basado en roles (`ADMIN` / `CLIENTE`), transacciones SQL ACID para la gestión de pedidos e inventario, pruebas automatizadas y documentación interactiva con **Swagger (OpenAPI 3.0)**.

- **Asignatura:** DESARROLLO FULLSTACK II_004D

- **Integrantes:**
  - Jesús Serrano
  - Thian Pereira
  - Constanza Carrasco

- **Repositorio Backend:** https://github.com/Thian-Pereira/Backend-SonidoVivo.git
- **Repositorio Frontend:** https://github.com/Constanza05-ctrl/PS-Sonido-Vivo.git

---

## Tecnologías y Arquitectura

- **Entorno y Framework:** Node.js v22 + Express.js
- **Base de Datos Relacional:** PostgreSQL (`pg` con pool de conexiones, llaves foráneas y transacciones `BEGIN / COMMIT / ROLLBACK`)
- **Autenticación y Seguridad:** JSON Web Tokens (`jsonwebtoken`) y encriptación de contraseñas con `bcryptjs`
- **Documentación Interactiva:** Swagger UI (`swagger-ui-express` + `swagger-jsdoc`) expuesto en `/api/docs`
- **Testing Automatizado:** Node Native Test Runner (`node --test` en `test.js`)
- **Despliegue en Producción:** PM2 sobre AWS EC2 (Ubuntu Server, puerto `8080`)

---

## Estructura Completa del Proyecto

```text
Backend-SonidoVivo/
├── README.md                                   # Documentación principal del proyecto backend
├── index.js                                    # Punto de entrada: inicializa PostgreSQL y levanta Express
├── package.json                                # Dependencias y scripts (start, test)
├── package-lock.json                           # Árbol exacto de dependencias
├── test.js                                     # Suite de pruebas automatizadas de endpoints y servicios
├── .env                                        # Variables de entorno y credenciales BD/JWT (no versionado)
└── src/
    ├── app.js                                  # Configuración de Express, CORS, Swagger UI y montaje de rutas
    ├── db.js                                   # Pool de conexión hacia PostgreSQL
    ├── initDb.js                               # Creación automática de tablas (DDL) y carga inicial (Seed)
    ├── swagger.js                              # Especificación OpenAPI 3.0 y esquema de seguridad Bearer JWT
    ├── controllers/
    │   ├── auth.controller.js                  # Registro, login y consulta de perfil autenticado
    │   ├── instrumento.controller.js           # Lógica CRUD del catálogo e inventario de productos
    │   ├── pedido.controller.js                # Procesamiento transaccional de órdenes y descuento de stock
    │   ├── saludo.controller.js                # Controlador de verificación de estado/salud del servicio
    │   └── usuario.controller.js               # Lógica CRUD administrativa de usuarios y asignación de roles
    ├── middleware/
    │   ├── auth.middleware.js                  # Validación y decodificación de token JWT en cabecera Bearer
    │   └── roles.middleware.js                 # Autorización por rol (ADMIN / CLIENTE)
    ├── routes/
    │   ├── auth.routes.js                      # Definición y anotaciones Swagger de /api/auth
    │   ├── instrumento.routes.js               # Definición y anotaciones Swagger de /api/productos
    │   ├── pedido.routes.js                    # Definición y anotaciones Swagger de /api/pedidos
    │   ├── saludo.routes.js                    # Rutas de comprobación base del servidor
    │   └── usuario.routes.js                   # Definición y anotaciones Swagger de /api/usuarios
    ├── services/
    │   ├── auth.service.js                     # Firma de tokens JWT y hashing/comparación con bcrypt
    │   └── usuario.service.js                  # Reglas de negocio para registro y validación de credenciales
    └── utils/
        └── usuario.validation.js               # Validaciones de formato de correo electrónico y contraseña
```

---

## Modelo de Base de Datos (PostgreSQL — `sonido_vivo`)

Al arrancar la aplicación (`src/initDb.js`), el servidor verifica y crea automáticamente la estructura relacional y precarga los usuarios base y el catálogo inicial de instrumentos:

1. **`usuarios`**: `id` (PK), `nombre`, `email` (UNIQUE), `password_hash`, `rol` (`ADMIN` | `CLIENTE`), `activo` (boolean), `creado_en`.
2. **`productos`**: `id` (PK), `nombre`, `marca`, `modelo`, `descripcion`, `categoria`, `precio`, `stock`, `en_oferta`, `descuento`, `creado_en`.
3. **`pedidos`**: `id` (PK), `numero_pedido` (UNIQUE), `usuario_id` (FK -> `usuarios.id`), `usuario_email`, `cliente_nombre`, `cliente_telefono`, `tipo_entrega` (`retiro` | `despacho`), `direccion`, `metodo_pago`, `estado_pago`, `subtotal`, `costo_despacho`, `total`, `estado`, `fecha`.
4. **`detalles_pedido`**: `id` (PK), `pedido_id` (FK -> `pedidos.id` `ON DELETE CASCADE`), `producto_id` (FK -> `productos.id`), `nombre`, `precio`, `cantidad`, `subtotal`.

> **Integridad Transaccional:** En `src/controllers/pedido.controller.js`, la creación de cada pedido ejecuta una transacción explícita (`BEGIN` / `COMMIT` / `ROLLBACK`) con bloqueo de fila (`FOR UPDATE`), validando disponibilidad y descontando el stock en `productos` de forma atómica.

---

## Endpoints REST y Métodos CRUD (Documentados en Swagger)

La documentación interactiva completa con soporte de autenticación **Bearer JWT (`Authorize`)** está disponible en **`http://<IP_PUBLICA_EC2>:5173/api/docs`** (vía proxy) o **`http://<IP_PUBLICA_EC2>:8080/api/docs`**.

### 1. Autenticación (`/api/auth`)
| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Público | Registra un nuevo usuario con rol `CLIENTE` |
| `POST` | `/api/auth/login` | Público | Valida credenciales y retorna el token JWT (`expiresIn: 2h`) |
| `GET` | `/api/auth/me` | JWT | Retorna los datos del usuario autenticado actualmente |

### 2. Administración y Catálogo de Productos (`/api/productos`)
| Método | Endpoint | Acceso | Operación CRUD |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/productos` | Público | **Read:** Lista el catálogo completo de instrumentos musicales |
| `GET` | `/api/productos/:id` | Público | **Read:** Obtiene el detalle de un producto por su ID |
| `POST` | `/api/productos` | **ADMIN (JWT)** | **Create:** Crea un nuevo instrumento en el catálogo |
| `PUT` | `/api/productos/:id` | **ADMIN (JWT)** | **Update:** Actualiza precio, stock, oferta, descuento o descripción |
| `DELETE` | `/api/productos/:id` | **ADMIN (JWT)** | **Delete:** Elimina un producto del catálogo por ID |

### 3. Administración de Usuarios (`/api/usuarios`)
| Método | Endpoint | Acceso | Operación CRUD |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/usuarios` | **ADMIN (JWT)** | **Read:** Lista todos los usuarios registrados en el sistema |
| `POST` | `/api/usuarios` | **ADMIN (JWT)** | **Create:** Crea un usuario asignando rol (`ADMIN` o `CLIENTE`) |
| `GET` | `/api/usuarios/:id` | JWT | **Read:** Consulta los datos de un usuario específico por ID |
| `PUT` | `/api/usuarios/:id` | JWT | **Update:** Modifica nombre, rol o estado activo de un usuario |
| `DELETE` | `/api/usuarios/:id` | **ADMIN (JWT)** | **Delete:** Desactiva una cuenta de usuario (borrado lógico `activo = false`) |

### 4. Pedidos y Administración de Órdenes (`/api/pedidos`)
| Método | Endpoint | Acceso | Operación CRUD |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/pedidos` | JWT | **Read:** Lista pedidos (todos para `ADMIN`, propios para `CLIENTE`) |
| `POST` | `/api/pedidos` | JWT | **Create:** Crea un pedido, registra detalles y descuenta stock en PostgreSQL |
| `PATCH` | `/api/pedidos/:numeroPedido` | **ADMIN (JWT)** | **Update:** Actualiza estado del pedido (`En preparación`, `Enviado`, `Entregado`) o estado de pago |
| `DELETE` | `/api/pedidos/:numeroPedido` | **ADMIN (JWT)** | **Delete:** Elimina un pedido por ID o número de orden |

---

## Instalación, Pruebas y Despliegue en AWS EC2

1. **Clonar el repositorio e instalar dependencias:**
   ```bash
   git clone https://github.com/Thian-Pereira/Backend-SonidoVivo.git
   cd Backend-SonidoVivo
   npm install
   ```

2. **Ejecutar suite de pruebas automatizadas:**
   ```bash
   npm test
   ```

3. **Levantar la API en producción con PM2 (puerto `8080`):**
   ```bash
   npx pm2 start index.js --name api-sonido-vivo
   npx pm2 save
   ```

### Credenciales Precargadas (Seed)
- **Administrador (`ADMIN`):** `admin@sonidovivo.cl` / `Admin123!`
- **Cliente (`CLIENTE`):** `cliente@sonidovivo.cl` / `Cliente123!`