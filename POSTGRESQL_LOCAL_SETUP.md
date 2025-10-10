# Configuración de PostgreSQL Local

## Pasos para configurar PostgreSQL localmente

### 1. Instalar PostgreSQL

#### Windows:
- Descargar desde: https://www.postgresql.org/download/windows/
- Instalar con configuración por defecto
- Recordar la contraseña del usuario `postgres`

#### macOS:
```bash
# Con Homebrew
brew install postgresql
brew services start postgresql
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Crear la base de datos

```sql
-- Conectar como usuario postgres
psql -U postgres

-- Crear la base de datos
CREATE DATABASE castro;

-- Crear usuario (opcional)
CREATE USER castro_user WITH PASSWORD 'admin';
GRANT ALL PRIVILEGES ON DATABASE castro TO castro_user;

-- Salir
\q
```

### 3. Configurar variables de entorno

Crear un archivo `.env.local` en la raíz del proyecto con:

```env
# Configuración de PostgreSQL Local
DB_HOST=localhost
DB_PORT=5432
DB_NAME=castro
DB_USER=postgres
DB_PASSWORD=admin

# Configuración del pool de conexiones
DB_POOL_MAX=10
DB_POOL_IDLE_TIMEOUT=30000
DB_POOL_CONNECTION_TIMEOUT=10000

# Configuración de la aplicación
NODE_ENV=development
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### 4. Ejecutar el esquema de la base de datos

```bash
# Ejecutar el archivo SQL principal
psql -U postgres -d castro -f lib/sql/sys_taller_jc_v4.sql

# Ejecutar los archivos de demo (opcional)
psql -U postgres -d castro -f demo_01_parametros_y_referencias.sql
psql -U postgres -d castro -f demo_02_roles_permisos_usuarios.sql
psql -U postgres -d castro -f demo_03_clientes_proveedores_productos.sql
psql -U postgres -d castro -f demo_04_compras_y_ventas.sql
psql -U postgres -d castro -f demo_05_servicios_tecnicos_y_datos_adicionales.sql
```

### 5. Verificar la conexión

```bash
# Iniciar el servidor de desarrollo
npm run dev

# Verificar en la consola que aparezca:
# ✅ Conexión a PostgreSQL local exitosa
```

### 6. Credenciales por defecto

- **Host**: localhost
- **Puerto**: 5432
- **Base de datos**: castro
- **Usuario**: postgres
- **Contraseña**: admin (o la que configuraste)

### 7. Solución de problemas

#### Error de conexión:
1. Verificar que PostgreSQL esté ejecutándose
2. Verificar las credenciales en `.env.local`
3. Verificar que la base de datos `castro` exista
4. Verificar que el puerto 5432 esté disponible

#### Comandos útiles:
```bash
# Verificar estado de PostgreSQL
sudo systemctl status postgresql

# Reiniciar PostgreSQL
sudo systemctl restart postgresql

# Conectar a la base de datos
psql -U postgres -d castro

# Listar bases de datos
psql -U postgres -l

# Verificar conexiones activas
psql -U postgres -c "SELECT * FROM pg_stat_activity;"
```

### 8. Cambiar configuración

Si necesitas cambiar la configuración, edita el archivo `.env.local` y reinicia el servidor:

```bash
npm run dev
```

### 9. Volver a Neon (producción)

Para volver a usar Neon en producción, simplemente cambia las variables de entorno en tu plataforma de despliegue o crea un `.env.production` con la configuración de Neon.
