#!/usr/bin/env node

/**
 * Script de configuración para Neon Database
 * Ejecutar con: node scripts/setup-neon.js
 */

import fs from 'fs';
import path from 'path';

const neonConfig = `# Configuración de Base de Datos Neon
# Cadena de conexión completa para Neon Database
DATABASE_URL=postgresql://neondb_owner:npg_2voINaxf1TOJ@ep-withered-lake-adl08ukw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Configuración individual (extraída de DATABASE_URL)
DB_HOST=ep-withered-lake-adl08ukw-pooler.c-2.us-east-1.aws.neon.tech
DB_PORT=5432
DB_NAME=neondb
DB_USER=neondb_owner
DB_PASSWORD=npg_2voINaxf1TOJ

# Configuración SSL para Neon (requerido)
SSL_MODE=require
NODE_ENV=production

# Configuración adicional para Neon
DB_POOL_MAX=20
DB_POOL_IDLE_TIMEOUT=30000
DB_POOL_CONNECTION_TIMEOUT=2000`;

async function setupNeon() {
  console.log('🚀 Configurando aplicación para Neon Database...\n');
  
  try {
    // Crear archivo .env.local
    const envPath = path.join(process.cwd(), '.env.local');
    
    if (fs.existsSync(envPath)) {
      console.log('⚠️  El archivo .env.local ya existe.');
      console.log('   ¿Deseas sobrescribirlo? (y/N)');
      
      // En un script real, podrías usar readline para input del usuario
      // Por ahora, creamos un backup
      const backupPath = path.join(process.cwd(), '.env.local.backup');
      fs.copyFileSync(envPath, backupPath);
      console.log(`   📁 Backup creado en: ${backupPath}`);
    }
    
    fs.writeFileSync(envPath, neonConfig);
    console.log('✅ Archivo .env.local creado exitosamente');
    
    // Verificar que los archivos SQL estén disponibles
    const sqlFiles = [
      'lib/sql/sys_taller_jc_v5.sql',
      'create_admin_user_v5.sql',
      'create_configuracion_table_v5.sql'
    ];
    
    console.log('\n📋 Verificando archivos SQL necesarios:');
    let allFilesExist = true;
    
    for (const file of sqlFiles) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        console.log(`   ✅ ${file}`);
      } else {
        console.log(`   ❌ ${file} - NO ENCONTRADO`);
        allFilesExist = false;
      }
    }
    
    if (allFilesExist) {
      console.log('\n🎉 ¡Configuración completada!');
      console.log('\n📝 Próximos pasos:');
      console.log('   1. Despliega la base de datos en Neon:');
      console.log('      - Ejecuta sys_taller_jc_v5.sql');
      console.log('      - Ejecuta create_admin_user_v5.sql');
      console.log('      - Ejecuta create_configuracion_table_v5.sql');
      console.log('   2. Prueba la conexión:');
      console.log('      npm run test:neon');
      console.log('   3. Inicia la aplicación:');
      console.log('      npm run dev');
    } else {
      console.log('\n⚠️  Algunos archivos SQL no se encontraron.');
      console.log('   Asegúrate de tener todos los archivos v5 antes de continuar.');
    }
    
  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message);
  }
}

// Ejecutar solo si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  setupNeon().catch(console.error);
}

export { setupNeon };
