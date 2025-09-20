const http = require('http');

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testServicioAPI() {
  try {
    console.log('🧪 Probando API de servicios...\n');

    // Primero necesitamos obtener un token de autenticación
    console.log('🔐 Obteniendo token de autenticación...');
    
    const loginOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const loginData = {
      username: 'admin',
      password: 'admin123'
    };

    const loginResponse = await makeRequest(loginOptions, loginData);

    if (loginResponse.status !== 200) {
      console.log('❌ Error al hacer login:', loginResponse.status);
      return;
    }

    const token = loginResponse.data.data.token;
    console.log('✅ Token obtenido');

    // Datos del servicio a crear
    const servicioData = {
      nombre: "Reparacion Televisores",
      descripcion: "reparacion de teevisores",
      precio_base: 100,
      tipo_serv_id: 1
    };

    console.log('\n📋 Datos del servicio:');
    console.log(`Nombre: ${servicioData.nombre}`);
    console.log(`Descripción: ${servicioData.descripcion}`);
    console.log(`Precio base: ${servicioData.precio_base}`);
    console.log(`Tipo servicio ID: ${servicioData.tipo_serv_id}`);

    // Crear servicio usando la API
    console.log('\n🔧 Creando servicio via API...');
    
    const createOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/referencias/servicios',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    const createResponse = await makeRequest(createOptions, servicioData);
    
    console.log(`\n📡 Respuesta de la API:`);
    console.log(`Status: ${createResponse.status}`);
    console.log(`Success: ${createResponse.data.success}`);
    console.log(`Message: ${createResponse.data.message}`);
    
    if (createResponse.data.error) {
      console.log(`Error: ${createResponse.data.error}`);
    }
    
    if (createResponse.data.data) {
      console.log(`Data:`, createResponse.data.data);
    }

    if (createResponse.status === 201) {
      console.log('\n✅ Servicio creado exitosamente via API');
    } else {
      console.log('\n❌ Error al crear servicio via API');
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

testServicioAPI();
