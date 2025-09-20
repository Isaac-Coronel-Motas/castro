const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_2voINaxf1TOJ@ep-withered-lake-adl08ukw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function testFixedSortingAPI() {
  try {
    console.log('🧪 Probando API con ordenamiento corregido...\n');

    // Primero necesitamos obtener un token de autenticación
    console.log('🔐 Obteniendo token de autenticación...');
    
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Error al hacer login:', loginResponse.status);
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    console.log('✅ Token obtenido');

    // Probar API con diferentes parámetros de ordenamiento
    const testCases = [
      {
        name: 'Ordenamiento por created_at (debería mapear a fecha_apertura)',
        url: 'http://localhost:3000/api/ventas/apertura-cierre-caja?page=1&limit=10&sort_by=created_at&sort_order=desc'
      },
      {
        name: 'Ordenamiento por fecha_apertura',
        url: 'http://localhost:3000/api/ventas/apertura-cierre-caja?page=1&limit=10&sort_by=fecha_apertura&sort_order=desc'
      },
      {
        name: 'Ordenamiento por estado',
        url: 'http://localhost:3000/api/ventas/apertura-cierre-caja?page=1&limit=10&sort_by=estado&sort_order=asc'
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n🔍 ${testCase.name}...`);
      
      const response = await fetch(testCase.url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log(`Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API funcionando correctamente');
        console.log(`📊 Total de aperturas: ${data.data?.length || 0}`);
        
        if (data.data && data.data.length > 0) {
          data.data.forEach((apertura, index) => {
            console.log(`${index + 1}. ID: ${apertura.apertura_cierre_id} | Caja: ${apertura.caja_nro} | Estado: ${apertura.estado} | Fecha: ${apertura.fecha_apertura}`);
          });
        }
      } else {
        const errorData = await response.json();
        console.log('❌ Error en la API');
        console.log('Error:', errorData);
      }
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  } finally {
    await pool.end();
  }
}

testFixedSortingAPI();
