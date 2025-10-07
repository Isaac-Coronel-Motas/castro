const { pool } = require('./lib/db');

async function addMissingPermissions() {
  try {
    console.log('🔧 Agregando permisos faltantes...\n');

    // Permisos que están causando problemas 403
    const missingPermissions = [
      { id: 34, name: 'dashboard.ver', description: 'Ver dashboard' },
      { id: 35, name: 'leer_referencias', description: 'Leer referencias' },
      { id: 36, name: 'administracion.leer', description: 'Leer administración' },
      { id: 37, name: 'administracion.crear', description: 'Crear en administración' },
      { id: 38, name: 'administracion.actualizar', description: 'Actualizar administración' },
      { id: 39, name: 'administracion.eliminar', description: 'Eliminar administración' }
    ];

    // Insertar permisos faltantes
    for (const perm of missingPermissions) {
      try {
        const insertQuery = `
          INSERT INTO permisos (permiso_id, nombre, descripcion, activo, created_at, id)
          VALUES ($1, $2, $3, true, CURRENT_TIMESTAMP, $1)
          ON CONFLICT (permiso_id) DO NOTHING
        `;
        
        await pool.query(insertQuery, [perm.id, perm.name, perm.description]);
        console.log(`✅ Permiso agregado: ${perm.name}`);
      } catch (error) {
        console.log(`⚠️  Permiso ${perm.name} ya existe o error: ${error.message}`);
      }
    }

    // Asignar todos los permisos al rol administrador (ID: 1)
    console.log('\n🔗 Asignando permisos al rol administrador...');
    
    const assignQuery = `
      INSERT INTO rol_permisos (rol_id, permiso_id, created_at)
      SELECT 1, permiso_id, CURRENT_TIMESTAMP
      FROM permisos
      WHERE activo = true
      ON CONFLICT (rol_id, permiso_id) DO NOTHING
    `;
    
    const assignResult = await pool.query(assignQuery);
    console.log('✅ Permisos asignados al rol administrador');

    // Verificar resultado final
    const verifyQuery = `
      SELECT COUNT(*) as total_permisos
      FROM rol_permisos rp
      INNER JOIN permisos p ON rp.permiso_id = p.permiso_id
      WHERE rp.rol_id = 1 AND p.activo = true
    `;
    
    const verifyResult = await pool.query(verifyQuery);
    console.log(`\n📊 Total permisos del rol administrador: ${verifyResult.rows[0].total_permisos}`);

    // Mostrar permisos específicos
    const specificQuery = `
      SELECT p.nombre
      FROM rol_permisos rp
      INNER JOIN permisos p ON rp.permiso_id = p.permiso_id
      WHERE rp.rol_id = 1 AND p.nombre IN ('dashboard.ver', 'leer_referencias', 'administracion.leer', 'administracion.crear')
      ORDER BY p.nombre
    `;
    
    const specificResult = await pool.query(specificQuery);
    console.log('\n🎯 Permisos específicos verificados:');
    specificResult.rows.forEach(row => {
      console.log(`   ✅ ${row.nombre}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

addMissingPermissions();
