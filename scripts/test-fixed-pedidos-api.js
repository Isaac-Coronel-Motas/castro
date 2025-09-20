const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_2voINaxf1TOJ@ep-withered-lake-adl08ukw-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function testFixedAPI() {
  try {
    console.log('🧪 Probando API corregida de pedidos...\n');

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

    // Probar API de pedidos
    console.log('\n🔍 Probando API de pedidos...');
    const pedidosResponse = await fetch('http://localhost:3000/api/ventas/pedidos-clientes?page=1&limit=10&sort_by=created_at&sort_order=desc', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`Status: ${pedidosResponse.status}`);
    const pedidosData = await pedidosResponse.json();
    console.log('Respuesta:', JSON.stringify(pedidosData, null, 2));

    if (pedidosResponse.ok) {
      console.log('\n✅ API funcionando correctamente');
      console.log(`📊 Total de pedidos: ${pedidosData.data?.length || 0}`);
      
      if (pedidosData.data && pedidosData.data.length > 0) {
        pedidosData.data.forEach((pedido, index) => {
          console.log(`${index + 1}. ID: ${pedido.venta_id} | Cliente: ${pedido.cliente_nombre} | Estado: ${pedido.estado} | Monto: ${pedido.monto_venta}`);
        });
      }
    } else {
      console.log('\n❌ Error en la API');
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  } finally {
    await pool.end();
  }
}

testFixedAPI();
