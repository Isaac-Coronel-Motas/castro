const fs = require('fs');
const path = require('path');

// Lista de archivos que necesitan corrección
const filesToFix = [
  'components/modals/nota-credito-debito-modal.tsx',
  'components/informes-servicios/informe-solicitudes.tsx',
  'components/informes-servicios/informe-recepcion.tsx',
  'components/informes-servicios/informe-diagnosticos.tsx',
  'components/informes-servicios/informe-retiro.tsx',
  'components/informes-servicios/informe-reclamos.tsx',
  'components/informes-servicios/informe-ordenes.tsx',
  'components/informes-servicios/informe-presupuestos.tsx',
  'components/informes-servicios/dashboard-servicios.tsx',
  'components/informes/informe-notas.tsx',
  'components/informes/informe-registro.tsx',
  'components/informes/informe-ordenes.tsx',
  'components/informes/informe-presupuestos.tsx',
  'components/informes/dashboard-compras.tsx',
  'components/informes/informe-pedidos.tsx',
  'components/informes/informe-ajustes.tsx',
  'components/modals/transferencia-stock-modal.tsx'
];

function fixAuthenticatedFetchDuplication(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ Archivo no encontrado: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Buscar el patrón problemático
    const problematicPattern = /authenticatedFetch\.authenticatedFetch/g;
    
    if (problematicPattern.test(content)) {
      // Reemplazar el patrón problemático
      content = content.replace(problematicPattern, 'authenticatedFetch');
      
      // Escribir el archivo corregido
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Corregido: ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️  No necesita corrección: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return false;
  }
}

console.log('🔧 Corrigiendo uso duplicado de authenticatedFetch...\n');

let correctedCount = 0;
let totalCount = filesToFix.length;

filesToFix.forEach(filePath => {
  if (fixAuthenticatedFetchDuplication(filePath)) {
    correctedCount++;
  }
});

console.log(`\n📊 Resumen:`);
console.log(`Total archivos procesados: ${totalCount}`);
console.log(`Archivos corregidos: ${correctedCount}`);
console.log(`Archivos sin cambios: ${totalCount - correctedCount}`);

if (correctedCount > 0) {
  console.log('\n✅ Corrección completada exitosamente!');
} else {
  console.log('\nℹ️  No se encontraron archivos que necesiten corrección.');
}

