const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_2voINaxf1TOJ@ep-withered-lake-adl08ukw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function fixPermissions() {
  try {
    console.log('🔗 Verificando permisos...');
    
    // Verificar permisos inactivos
    const inactivePermissions = await pool.query(`
      SELECT COUNT(*) as count 
      FROM permisos 
      WHERE activo = false
    `);
    
    console.log(`Permisos inactivos: ${inactivePermissions.rows[0].count}`);
    
    // Activar todos los permisos
    await pool.query(`
      UPDATE permisos 
      SET activo = true 
      WHERE activo = false
    `);
    
    console.log('✅ Todos los permisos activados');
    
    // Verificar permisos del administrador
    const adminPermissions = await pool.query(`
      SELECT COUNT(*) as count 
      FROM permisos p
      INNER JOIN rol_permisos rp ON p.permiso_id = rp.permiso_id
      WHERE rp.rol_id = 1 AND p.activo = true
    `);
    
    console.log(`Permisos del administrador: ${adminPermissions.rows[0].count}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

fixPermissions();
