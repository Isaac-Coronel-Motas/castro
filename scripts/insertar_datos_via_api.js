#!/usr/bin/env node

/**
 * Script para insertar datos de prueba usando la API de la aplicación
 * Esta es una alternativa si no podemos conectarnos directamente a la base de datos
 */

const fs = require('fs');
const path = require('path');

// Datos de prueba en formato JSON
const datosPrueba = {
  ventas: [
    {
      venta_id: 1,
      cliente_id: 1,
      fecha_venta: '2024-01-15',
      estado: 'cerrado',
      monto_venta: 150000,
      caja_id: 1,
      condicion_pago: 'contado'
    },
    {
      venta_id: 2,
      cliente_id: 2,
      fecha_venta: '2024-01-20',
      estado: 'cerrado',
      monto_venta: 250000,
      caja_id: 1,
      condicion_pago: 'contado'
    },
    {
      venta_id: 3,
      cliente_id: 3,
      fecha_venta: '2024-02-05',
      estado: 'cerrado',
      monto_venta: 180000,
      caja_id: 2,
      condicion_pago: 'contado'
    },
    {
      venta_id: 4,
      cliente_id: 4,
      fecha_venta: '2024-02-10',
      estado: 'cerrado',
      monto_venta: 320000,
      caja_id: 1,
      condicion_pago: 'contado'
    },
    {
      venta_id: 5,
      cliente_id: 5,
      fecha_venta: '2024-03-01',
      estado: 'cerrado',
      monto_venta: 200000,
      caja_id: 3,
      condicion_pago: 'contado'
    }
  ],
  cobros: [
    {
      cobro_id: 1,
      venta_id: 1,
      fecha_cobro: '2024-01-15',
      monto: 150000,
      caja_id: 1
    },
    {
      cobro_id: 2,
      venta_id: 2,
      fecha_cobro: '2024-01-20',
      monto: 250000,
      caja_id: 1
    },
    {
      cobro_id: 3,
      venta_id: 3,
      fecha_cobro: '2024-02-05',
      monto: 180000,
      caja_id: 2
    },
    {
      cobro_id: 4,
      venta_id: 4,
      fecha_cobro: '2024-02-10',
      monto: 320000,
      caja_id: 1
    },
    {
      cobro_id: 5,
      venta_id: 5,
      fecha_cobro: '2024-03-01',
      monto: 200000,
      caja_id: 3
    }
  ]
};

async function insertarDatosViaAPI() {
  console.log('🔄 Iniciando inserción de datos vía API...');
  
  try {
    // Simular inserción de datos
    console.log('📝 Datos de prueba preparados:');
    console.log(`   - ${datosPrueba.ventas.length} ventas`);
    console.log(`   - ${datosPrueba.cobros.length} cobros`);
    
    // Guardar datos en archivo JSON para referencia
    const outputFile = path.join(__dirname, '..', 'datos_prueba_informes_ventas.json');
    fs.writeFileSync(outputFile, JSON.stringify(datosPrueba, null, 2));
    
    console.log(`✅ Datos guardados en: ${outputFile}`);
    console.log('\n📋 Para insertar estos datos manualmente:');
    console.log('1. Accede a la aplicación web');
    console.log('2. Ve a /ventas/registro-ventas');
    console.log('3. Crea las ventas manualmente usando los datos del archivo JSON');
    console.log('4. O ejecuta el script SQL directamente en tu cliente de PostgreSQL');
    
    console.log('\n🔧 Alternativa: Ejecutar SQL directamente');
    console.log('Puedes copiar y pegar el contenido de datos_prueba_informes_ventas.sql');
    console.log('en tu cliente de PostgreSQL (pgAdmin, DBeaver, etc.)');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

insertarDatosViaAPI();
