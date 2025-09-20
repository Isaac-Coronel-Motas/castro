const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_2voINaxf1TOJ@ep-withered-lake-adl08ukw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkCajaPermissions() {
  try {
    console.log('🔍 Verificando permisos de caja...\n');

    // Permisos necesarios para caja
    const requiredPermissions = [
      'leer_apertura_cierre_caja',
      'crear_apertura_cierre_caja', 
      'cerrar_caja'
    ];

    console.log('📋 Permisos requeridos para caja:');
    requiredPermissions.forEach(perm => {
      console.log(`  - ${perm}`);
    });

    // Verificar qué permisos existen
    console.log('\n🔍 Verificando permisos existentes...');
    const existingPermissionsQuery = `
      SELECT permiso_id, nombre, descripcion, activo
      FROM permisos 
      WHERE nombre IN (${requiredPermissions.map((_, i) => `$${i + 1}`).join(', ')})
      ORDER BY nombre
    `;
    
    const existingPermissionsResult = await pool.query(existingPermissionsQuery, requiredPermissions);
    
    console.log('\n📋 Permisos existentes:');
    if (existingPermissionsResult.rows.length === 0) {
      console.log('❌ No se encontraron permisos de caja');
    } else {
      existingPermissionsResult.rows.forEach(perm => {
        const estado = perm.activo ? '✅ Activo' : '❌ Inactivo';
        console.log(`ID: ${perm.permiso_id} | ${perm.nombre} | ${estado}`);
      });
    }

    // Verificar qué permisos faltan
    const existingNames = existingPermissionsResult.rows.map(p => p.nombre);
    const missingPermissions = requiredPermissions.filter(name => !existingNames.includes(name));
    
    if (missingPermissions.length > 0) {
      console.log('\n📝 Permisos faltantes:');
      missingPermissions.forEach(perm => {
        console.log(`  - ${perm}`);
      });

      console.log('\n🔧 Creando permisos faltantes...');
      for (const permName of missingPermissions) {
        const insertPermissionQuery = `
          INSERT INTO permisos (nombre, descripcion, activo) 
          VALUES ($1, $2, true)
          RETURNING permiso_id
        `;
        
        const descripcion = permName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        try {
          const permResult = await pool.query(insertPermissionQuery, [permName, descripcion]);
          console.log(`✅ Permiso creado: ${permName} (ID: ${permResult.rows[0].permiso_id})`);
        } catch (error) {
          console.log(`❌ Error al crear permiso ${permName}: ${error.message}`);
        }
      }
    }

    // Verificar permisos asignados al rol Administrador
    console.log('\n🔍 Verificando permisos del rol Administrador...');
    const adminPermissionsQuery = `
      SELECT p.nombre, p.descripcion, p.activo
      FROM permisos p
      INNER JOIN rol_permisos rp ON p.permiso_id = rp.permiso_id
      INNER JOIN roles r ON rp.rol_id = r.rol_id
      WHERE r.nombre = 'Administrador' 
      AND p.nombre IN (${requiredPermissions.map((_, i) => `$${i + 1}`).join(', ')})
      ORDER BY p.nombre
    `;
    
    const adminPermissionsResult = await pool.query(adminPermissionsQuery, requiredPermissions);
    
    console.log('\n📋 Permisos asignados al Administrador:');
    if (adminPermissionsResult.rows.length === 0) {
      console.log('❌ El Administrador no tiene permisos de caja asignados');
    } else {
      adminPermissionsResult.rows.forEach(perm => {
        const estado = perm.activo ? '✅ Activo' : '❌ Inactivo';
        console.log(`${perm.nombre} | ${estado}`);
      });
    }

    // Asignar permisos faltantes al Administrador
    const adminRoleQuery = 'SELECT rol_id FROM roles WHERE nombre = $1';
    const adminRoleResult = await pool.query(adminRoleQuery, ['Administrador']);
    
    if (adminRoleResult.rows.length > 0) {
      const adminRoleId = adminRoleResult.rows[0].rol_id;
      console.log(`\n🔧 Asignando permisos al Administrador (ID: ${adminRoleId})...`);
      
      for (const permName of requiredPermissions) {
        // Verificar si ya está asignado
        const checkAssignmentQuery = `
          SELECT COUNT(*) as count
          FROM rol_permisos rp
          INNER JOIN permisos p ON rp.permiso_id = p.permiso_id
          WHERE rp.rol_id = $1 AND p.nombre = $2
        `;
        
        const checkResult = await pool.query(checkAssignmentQuery, [adminRoleId, permName]);
        const isAssigned = parseInt(checkResult.rows[0].count) > 0;
        
        if (!isAssigned) {
          // Obtener el permiso_id
          const permQuery = 'SELECT permiso_id FROM permisos WHERE nombre = $1';
          const permResult = await pool.query(permQuery, [permName]);
          
          if (permResult.rows.length > 0) {
            const permisoId = permResult.rows[0].permiso_id;
            
            // Asignar el permiso
            const assignQuery = `
              INSERT INTO rol_permisos (rol_id, permiso_id) 
              VALUES ($1, $2)
            `;
            
            try {
              await pool.query(assignQuery, [adminRoleId, permisoId]);
              console.log(`✅ Permiso asignado: ${permName}`);
            } catch (error) {
              console.log(`❌ Error al asignar permiso ${permName}: ${error.message}`);
            }
          }
        } else {
          console.log(`✅ Permiso ya asignado: ${permName}`);
        }
      }
    }

    console.log('\n✅ Verificación de permisos de caja completada');

  } catch (error) {
    console.error('❌ Error al verificar permisos:', error.message);
  } finally {
    await pool.end();
  }
}

checkCajaPermissions();
