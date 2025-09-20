const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_2voINaxf1TOJ@ep-withered-lake-adl08ukw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkPedidosPermissions() {
  try {
    console.log('🔍 Verificando permisos para pedidos de clientes...\n');

    // Verificar permisos existentes relacionados con ventas
    const permissionsQuery = `
      SELECT p.id, p.nombre, p.descripcion, p.activo
      FROM permisos p
      WHERE p.nombre LIKE '%venta%' OR p.nombre LIKE '%pedido%' OR p.nombre LIKE '%cliente%'
      ORDER BY p.nombre
    `;

    const permissionsResult = await pool.query(permissionsQuery);
    
    console.log('📋 Permisos existentes relacionados:');
    if (permissionsResult.rows.length > 0) {
      permissionsResult.rows.forEach(row => {
        console.log(`- ${row.nombre} (${row.activo ? 'Activo' : 'Inactivo'}) - ${row.descripcion}`);
      });
    } else {
      console.log('No se encontraron permisos relacionados');
    }

    // Verificar permisos específicos que necesitamos
    const requiredPermissions = [
      'leer_ventas',
      'crear_ventas', 
      'actualizar_ventas',
      'eliminar_ventas',
      'leer_productos',
      'leer_clientes'
    ];

    console.log('\n🔍 Verificando permisos requeridos:');
    for (const permName of requiredPermissions) {
      const checkQuery = `SELECT id, nombre, activo FROM permisos WHERE nombre = $1`;
      const checkResult = await pool.query(checkQuery, [permName]);
      
      if (checkResult.rows.length > 0) {
        const perm = checkResult.rows[0];
        console.log(`✅ ${perm.nombre} - ${perm.activo ? 'Activo' : 'Inactivo'}`);
      } else {
        console.log(`❌ ${permName} - No existe`);
      }
    }

    // Verificar si los permisos están asignados al rol Administrador
    console.log('\n🔍 Verificando asignación al rol Administrador:');
    const roleQuery = `
      SELECT r.id, r.nombre 
      FROM roles r 
      WHERE r.nombre = 'Administrador'
    `;
    
    const roleResult = await pool.query(roleQuery);
    
    if (roleResult.rows.length > 0) {
      const adminRole = roleResult.rows[0];
      console.log(`✅ Rol Administrador encontrado (ID: ${adminRole.id})`);
      
      // Verificar permisos asignados al Administrador
      const assignedQuery = `
        SELECT p.nombre, p.activo
        FROM rol_permisos rp
        JOIN permisos p ON rp.permiso_id = p.id
        WHERE rp.rol_id = $1
        AND (p.nombre LIKE '%venta%' OR p.nombre LIKE '%pedido%' OR p.nombre LIKE '%cliente%')
        ORDER BY p.nombre
      `;
      
      const assignedResult = await pool.query(assignedQuery, [adminRole.id]);
      
      if (assignedResult.rows.length > 0) {
        console.log('\n📋 Permisos asignados al Administrador:');
        assignedResult.rows.forEach(row => {
          console.log(`- ${row.nombre} (${row.activo ? 'Activo' : 'Inactivo'})`);
        });
      } else {
        console.log('\n❌ No hay permisos relacionados asignados al Administrador');
      }
    } else {
      console.log('❌ Rol Administrador no encontrado');
    }

    // Crear permisos faltantes si es necesario
    console.log('\n🔧 Creando permisos faltantes...');
    const missingPermissions = [];
    
    for (const permName of requiredPermissions) {
      const checkQuery = `SELECT id FROM permisos WHERE nombre = $1`;
      const checkResult = await pool.query(checkQuery, [permName]);
      
      if (checkResult.rows.length === 0) {
        missingPermissions.push(permName);
      }
    }

    if (missingPermissions.length > 0) {
      console.log(`Permisos a crear: ${missingPermissions.join(', ')}`);
      
      for (const permName of missingPermissions) {
        const insertQuery = `
          INSERT INTO permisos (nombre, descripcion, activo)
          VALUES ($1, $2, true)
          RETURNING id
        `;
        
        const description = `Permiso para ${permName.replace('_', ' ')}`;
        const result = await pool.query(insertQuery, [permName, description]);
        
        console.log(`✅ Creado permiso: ${permName} (ID: ${result.rows[0].id})`);
        
        // Asignar al rol Administrador
        if (roleResult.rows.length > 0) {
          const assignQuery = `
            INSERT INTO rol_permisos (rol_id, permiso_id)
            VALUES ($1, $2)
            ON CONFLICT (rol_id, permiso_id) DO NOTHING
          `;
          
          await pool.query(assignQuery, [roleResult.rows[0].id, result.rows[0].id]);
          console.log(`✅ Asignado al rol Administrador`);
        }
      }
    } else {
      console.log('✅ Todos los permisos requeridos ya existen');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkPedidosPermissions();
