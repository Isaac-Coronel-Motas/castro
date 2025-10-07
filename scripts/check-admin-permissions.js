const { pool } = require('./lib/db');

async function checkAdminPermissions() {
  try {
    console.log('🔍 Verificando permisos del usuario admin...\n');

    // Verificar usuario admin
    const userQuery = `
      SELECT 
        u.usuario_id,
        u.username,
        u.nombre,
        u.activo,
        r.nombre as rol_nombre,
        r.rol_id
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.rol_id
      WHERE u.username = 'admin'
    `;
    
    const userResult = await pool.query(userQuery);
    
    if (userResult.rows.length === 0) {
      console.log('❌ Usuario admin no encontrado');
      return;
    }
    
    const user = userResult.rows[0];
    console.log('👤 Usuario Admin:');
    console.log(`   ID: ${user.usuario_id}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Nombre: ${user.nombre}`);
    console.log(`   Activo: ${user.activo}`);
    console.log(`   Rol: ${user.rol_nombre} (ID: ${user.rol_id})\n`);

    // Verificar permisos del rol admin
    const permissionsQuery = `
      SELECT 
        p.nombre as permiso_nombre,
        p.descripcion,
        p.activo
      FROM roles r
      INNER JOIN rol_permisos rp ON r.rol_id = rp.rol_id
      INNER JOIN permisos p ON rp.permiso_id = p.permiso_id
      WHERE r.rol_id = $1
      ORDER BY p.nombre
    `;
    
    const permissionsResult = await pool.query(permissionsQuery, [user.rol_id]);
    
    console.log(`🔑 Permisos del rol ${user.rol_nombre} (${permissionsResult.rows.length} total):`);
    permissionsResult.rows.forEach(perm => {
      console.log(`   - ${perm.permiso_nombre}: ${perm.descripcion}`);
    });

    // Verificar permisos específicos que están causando problemas
    const specificPermissions = [
      'dashboard.ver',
      'leer_referencias',
      'administracion.leer',
      'administracion.crear'
    ];

    console.log('\n🎯 Verificando permisos específicos:');
    specificPermissions.forEach(permName => {
      const hasPermission = permissionsResult.rows.some(p => p.permiso_nombre === permName);
      console.log(`   ${hasPermission ? '✅' : '❌'} ${permName}`);
    });

    // Verificar si existen permisos similares
    console.log('\n🔍 Permisos relacionados con dashboard:');
    const dashboardPerms = permissionsResult.rows.filter(p => 
      p.permiso_nombre.includes('dashboard') || 
      p.permiso_nombre.includes('ver') ||
      p.permiso_nombre.includes('leer')
    );
    
    dashboardPerms.forEach(perm => {
      console.log(`   - ${perm.permiso_nombre}: ${perm.descripcion}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkAdminPermissions();
