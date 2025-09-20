#!/usr/bin/env node

/**
 * Script para verificar estructura de rol_permisos y asignar permisos
 */

const { Pool } = require('pg');

// Configuración de conexión
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_2voINaxf1TOJ@ep-withered-lake-adl08ukw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function fixPermissions() {
  try {
    console.log('🔍 Verificando estructura de rol_permisos...\n');
    
    const client = await pool.connect();
    
    // Verificar estructura de la tabla
    const structureResult = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'rol_permisos' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Estructura de tabla rol_permisos:');
    structureResult.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Verificar si hay datos
    const countResult = await client.query('SELECT COUNT(*) as total FROM rol_permisos');
    console.log(`\n📊 Total registros en rol_permisos: ${countResult.rows[0].total}`);
    
    // Asignar permisos sin ON CONFLICT
    if (countResult.rows[0].total == 0) {
      console.log('\n🔧 Asignando permisos al rol Administrador...');
      
      // Obtener todos los permisos activos
      const permisosResult = await client.query('SELECT permiso_id FROM permisos WHERE activo = true ORDER BY permiso_id');
      
      console.log(`📋 Encontrados ${permisosResult.rows.length} permisos activos`);
      
      // Insertar cada permiso individualmente
      let inserted = 0;
      for (const permiso of permisosResult.rows) {
        try {
          await client.query(`
            INSERT INTO rol_permisos (rol_id, permiso_id, created_at)
            VALUES (1, $1, CURRENT_TIMESTAMP)
          `, [permiso.permiso_id]);
          inserted++;
        } catch (error) {
          if (error.code === '23505') { // Unique violation
            console.log(`   ⚠️  Permiso ${permiso.permiso_id} ya existe`);
          } else {
            console.log(`   ❌ Error con permiso ${permiso.permiso_id}: ${error.message}`);
          }
        }
      }
      
      console.log(`✅ Insertados ${inserted} permisos`);
      
      // Verificar resultado final
      const finalResult = await client.query('SELECT COUNT(*) as total FROM rol_permisos WHERE rol_id = 1');
      console.log(`📊 Total permisos asignados al rol 1: ${finalResult.rows[0].total}`);
      
      // Mostrar algunos permisos
      const sampleResult = await client.query(`
        SELECT p.nombre
        FROM permisos p
        INNER JOIN rol_permisos rp ON p.permiso_id = rp.permiso_id
        WHERE rp.rol_id = 1
        ORDER BY p.nombre
        LIMIT 5
      `);
      
      console.log('\n🔑 Primeros 5 permisos asignados:');
      sampleResult.rows.forEach(permiso => {
        console.log(`   - ${permiso.nombre}`);
      });
      
    } else {
      console.log('✅ Ya hay permisos asignados');
    }
    
    client.release();
    
    console.log('\n✅ Proceso completado');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

fixPermissions();
