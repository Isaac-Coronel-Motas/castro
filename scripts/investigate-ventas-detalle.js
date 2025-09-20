const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_2voINaxf1TOJ@ep-withered-lake-adl08ukw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function investigateVentasDetalle() {
  try {
    console.log('🔍 Investigando tabla ventas_detalle...\n');

    // Verificar estructura de ventas_detalle
    console.log('📊 Estructura de la tabla: ventas_detalle');
    console.log('='.repeat(60));
    
    const structureQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'ventas_detalle'
      ORDER BY ordinal_position
    `;
    
    const structureResult = await pool.query(structureQuery);
    
    if (structureResult.rows.length > 0) {
      structureResult.rows.forEach(row => {
        console.log(`${row.column_name.padEnd(25)} | ${row.data_type.padEnd(20)} | ${row.is_nullable.padEnd(3)} | ${row.column_default || 'NULL'}`);
      });
      
      // Verificar datos
      const dataQuery = `SELECT COUNT(*) as count FROM ventas_detalle`;
      const dataResult = await pool.query(dataQuery);
      console.log(`\n📈 Total de registros: ${dataResult.rows[0].count}`);
    } else {
      console.log('❌ La tabla ventas_detalle no existe');
    }

    // Verificar tipos de datos personalizados
    console.log('\n🔍 Verificando tipos de datos personalizados...');
    const typesQuery = `
      SELECT typname, typtype 
      FROM pg_type 
      WHERE typtype = 'e' 
      AND (
        typname LIKE '%estado%' OR 
        typname LIKE '%venta%' OR 
        typname LIKE '%cliente%' OR
        typname LIKE '%condicion%'
      )
      ORDER BY typname
    `;
    
    const typesResult = await pool.query(typesQuery);
    if (typesResult.rows.length > 0) {
      console.log('Tipos de datos encontrados:');
      typesResult.rows.forEach(row => {
        console.log(`- ${row.typname} (${row.typtype})`);
      });
    }

    // Verificar valores de los enums
    for (const typeRow of typesResult.rows) {
      console.log(`\n📋 Valores del enum ${typeRow.typname}:`);
      const enumQuery = `
        SELECT enumlabel 
        FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = $1)
        ORDER BY enumsortorder
      `;
      
      const enumResult = await pool.query(enumQuery, [typeRow.typname]);
      enumResult.rows.forEach(row => {
        console.log(`  - ${row.enumlabel}`);
      });
    }

    // Verificar si existen APIs relacionadas
    console.log('\n🔍 Verificando APIs existentes...');
    const apiFiles = [
      'app/api/ventas/pedidos/route.ts',
      'app/api/ventas/pedidos/[id]/route.ts',
      'app/api/ventas/ventas/route.ts',
      'app/api/ventas/ventas/[id]/route.ts',
      'app/api/ventas/solicitudes/route.ts',
      'app/api/ventas/solicitudes/[id]/route.ts'
    ];

    const fs = require('fs');
    const path = require('path');
    
    for (const apiFile of apiFiles) {
      const fullPath = path.join(process.cwd(), apiFile);
      if (fs.existsSync(fullPath)) {
        console.log(`✅ ${apiFile} - Existe`);
      } else {
        console.log(`❌ ${apiFile} - No existe`);
      }
    }

    // Verificar frontend existente
    console.log('\n🔍 Verificando frontend existente...');
    const frontendFiles = [
      'app/ventas/pedidos-clientes/page.tsx',
      'app/ventas/pedidos-clientes/loading.tsx',
      'components/modals/pedido-cliente-modal.tsx',
      'components/modals/solicitud-cliente-modal.tsx'
    ];

    for (const frontendFile of frontendFiles) {
      const fullPath = path.join(process.cwd(), frontendFile);
      if (fs.existsSync(fullPath)) {
        console.log(`✅ ${frontendFile} - Existe`);
      } else {
        console.log(`❌ ${frontendFile} - No existe`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

investigateVentasDetalle();
