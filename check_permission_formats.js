const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_2voINaxf1TOJ@ep-withered-lake-adl08ukw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function checkPermissionFormats() {
  try {
    console.log('🔗 Verificando formatos de permisos...');
    
    // Obtener todos los permisos del administrador
    const permissions = await pool.query(`
      SELECT p.nombre
      FROM permisos p
      INNER JOIN rol_permisos rp ON p.permiso_id = rp.permiso_id
      WHERE rp.rol_id = 1 AND p.activo = true
      ORDER BY p.nombre
    `);
    
    const permissionNames = permissions.rows.map(row => row.nombre);
    
    // Separar por formato
    const dotFormat = permissionNames.filter(p => p.includes('.'));
    const underscoreFormat = permissionNames.filter(p => p.includes('_') && !p.includes('.'));
    const otherFormat = permissionNames.filter(p => !p.includes('.') && !p.includes('_'));
    
    console.log(`\n📊 ANÁLISIS DE FORMATOS:`);
    console.log(`   - Total permisos: ${permissionNames.length}`);
    console.log(`   - Formato módulo.acción: ${dotFormat.length}`);
    console.log(`   - Formato módulo_acción: ${underscoreFormat.length}`);
    console.log(`   - Otros formatos: ${otherFormat.length}`);
    
    console.log(`\n🔍 PERMISOS CON FORMATO módulo.acción (${dotFormat.length}):`);
    dotFormat.slice(0, 10).forEach(perm => {
      console.log(`   - ${perm}`);
    });
    if (dotFormat.length > 10) {
      console.log(`   ... y ${dotFormat.length - 10} más`);
    }
    
    console.log(`\n🔍 PERMISOS CON FORMATO módulo_acción (${underscoreFormat.length}):`);
    underscoreFormat.slice(0, 10).forEach(perm => {
      console.log(`   - ${perm}`);
    });
    if (underscoreFormat.length > 10) {
      console.log(`   ... y ${underscoreFormat.length - 10} más`);
    }
    
    // Buscar permisos específicos de caja
    const cajaPermissions = permissionNames.filter(p => 
      p.includes('caja') || p.includes('apertura') || p.includes('cierre')
    );
    
    console.log(`\n🔍 PERMISOS DE CAJA ENCONTRADOS (${cajaPermissions.length}):`);
    cajaPermissions.forEach(perm => {
      console.log(`   - ${perm}`);
    });
    
    // Verificar si hay permisos duplicados con diferentes formatos
    const duplicates = [];
    for (const dotPerm of dotFormat) {
      const underscoreVersion = dotPerm.replace('.', '_');
      if (underscoreFormat.includes(underscoreVersion)) {
        duplicates.push({ dot: dotPerm, underscore: underscoreVersion });
      }
    }
    
    if (duplicates.length > 0) {
      console.log(`\n⚠️ PERMISOS DUPLICADOS ENCONTRADOS:`);
      duplicates.forEach(dup => {
        console.log(`   - ${dup.dot} ↔ ${dup.underscore}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
    console.log('🔌 Conexión cerrada');
  }
}

checkPermissionFormats();
