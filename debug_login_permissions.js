const { Pool } = require('pg');

// Configuración de la base de datos
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_2voINaxf1TOJ@ep-withered-lake-adl08ukw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function debugLoginPermissions() {
  try {
    console.log('🔗 Conectando a la base de datos...');
    
    // Simular exactamente la consulta del login para el usuario admin
    const userQuery = `
      SELECT 
        u.*,
        r.nombre as rol_nombre,
        r.descripcion as rol_descripcion
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.rol_id
      WHERE (u.username = $1 OR u.email = $1) 
        AND u.activo = true 
        AND u.is_deleted = false
    `;

    const userResult = await pool.query(userQuery, ['admin']);
    
    if (userResult.rows.length === 0) {
      console.log('❌ Usuario admin no encontrado');
      return;
    }

    const user = userResult.rows[0];
    console.log(`\n👤 Usuario encontrado:`);
    console.log(`   - ID: ${user.usuario_id}`);
    console.log(`   - Username: ${user.username}`);
    console.log(`   - Rol ID: ${user.rol_id}`);
    console.log(`   - Rol Nombre: ${user.rol_nombre}`);
    console.log(`   - Activo: ${user.activo}`);

    // Ejecutar exactamente la consulta de permisos del login
    const permissionsQuery = `
      SELECT p.nombre
      FROM permisos p
      INNER JOIN rol_permisos rp ON p.permiso_id = rp.permiso_id
      WHERE rp.rol_id = $1 AND p.activo = true
    `;

    console.log(`\n🔍 Ejecutando consulta de permisos para rol_id = ${user.rol_id}...`);
    const permissionsResult = await pool.query(permissionsQuery, [user.rol_id]);
    const permisos = permissionsResult.rows.map(row => row.nombre);

    console.log(`\n📊 RESULTADOS:`);
    console.log(`   - Total permisos encontrados: ${permisos.length}`);
    console.log(`   - Permisos esperados: 240`);

    // Mostrar los primeros 20 permisos
    console.log(`\n🔍 Primeros 20 permisos encontrados:`);
    permisos.slice(0, 20).forEach((permiso, index) => {
      console.log(`   ${index + 1}. ${permiso}`);
    });

    // Buscar permisos específicos de caja
    const cajaPermissions = permisos.filter(p => p.includes('caja') || p.includes('apertura') || p.includes('cierre'));
    console.log(`\n🔍 Permisos relacionados con caja encontrados: ${cajaPermissions.length}`);
    cajaPermissions.forEach(permiso => {
      console.log(`   - ${permiso}`);
    });

    // Verificar si hay algún problema con la consulta
    console.log(`\n🔍 Verificando la consulta paso a paso:`);
    
    // Verificar que el rol existe
    const rolCheck = await pool.query('SELECT * FROM roles WHERE rol_id = $1', [user.rol_id]);
    console.log(`   - Rol existe: ${rolCheck.rows.length > 0 ? 'Sí' : 'No'}`);
    
    // Verificar permisos en rol_permisos
    const rolPermisosCheck = await pool.query('SELECT COUNT(*) as count FROM rol_permisos WHERE rol_id = $1', [user.rol_id]);
    console.log(`   - Permisos asignados al rol: ${rolPermisosCheck.rows[0].count}`);
    
    // Verificar permisos activos
    const permisosActivosCheck = await pool.query(`
      SELECT COUNT(*) as count 
      FROM permisos p
      INNER JOIN rol_permisos rp ON p.permiso_id = rp.permiso_id
      WHERE rp.rol_id = $1 AND p.activo = true
    `, [user.rol_id]);
    console.log(`   - Permisos activos asignados: ${permisosActivosCheck.rows[0].count}`);

    // Verificar si hay permisos inactivos
    const permisosInactivosCheck = await pool.query(`
      SELECT COUNT(*) as count 
      FROM permisos p
      INNER JOIN rol_permisos rp ON p.permiso_id = rp.permiso_id
      WHERE rp.rol_id = $1 AND p.activo = false
    `, [user.rol_id]);
    console.log(`   - Permisos inactivos asignados: ${permisosInactivosCheck.rows[0].count}`);

    // Mostrar algunos permisos inactivos si los hay
    if (parseInt(permisosInactivosCheck.rows[0].count) > 0) {
      const permisosInactivos = await pool.query(`
        SELECT p.nombre 
        FROM permisos p
        INNER JOIN rol_permisos rp ON p.permiso_id = rp.permiso_id
        WHERE rp.rol_id = $1 AND p.activo = false
        LIMIT 10
      `, [user.rol_id]);
      
      console.log(`\n⚠️ Primeros 10 permisos inactivos:`);
      permisosInactivos.rows.forEach(permiso => {
        console.log(`   - ${permiso.nombre}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
    console.log('🔌 Conexión cerrada');
  }
}

debugLoginPermissions();
