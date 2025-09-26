import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// POST /api/security/accesos - Registrar intento de acceso
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { usuario_id, tipo_acceso, ip_origen, info_extra } = body;

    if (!usuario_id || !tipo_acceso) {
      return NextResponse.json({ 
        success: false, 
        message: 'usuario_id y tipo_acceso son requeridos' 
      }, { status: 400 });
    }

    const query = `
      INSERT INTO accesos (usuario_id, tipo_acceso, ip_origen, info_extra)
      VALUES ($1, $2, $3, $4)
      RETURNING acceso_id, fecha_acceso
    `;

    const result = await pool.query(query, [usuario_id, tipo_acceso, ip_origen, info_extra]);

    return NextResponse.json({
      success: true,
      message: 'Acceso registrado exitosamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error al registrar acceso:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    }, { status: 500 });
  }
}

// GET /api/security/accesos - Verificar si usuario está bloqueado
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const usuario_id = searchParams.get('usuario_id');
    const ip_origen = searchParams.get('ip_origen');

    if (!usuario_id) {
      return NextResponse.json({ 
        success: false, 
        message: 'usuario_id es requerido' 
      }, { status: 400 });
    }

    // Verificar intentos fallidos en la última hora
    const query = `
      SELECT 
        COUNT(*) as intentos_fallidos,
        MAX(fecha_acceso) as ultimo_intento
      FROM accesos 
      WHERE usuario_id = $1 
        AND tipo_acceso = 'fallido'
        AND fecha_acceso > NOW() - INTERVAL '1 hour'
    `;

    const result = await pool.query(query, [usuario_id]);
    const intentosFallidos = parseInt(result.rows[0].intentos_fallidos);
    const ultimoIntento = result.rows[0].ultimo_intento;

    // Si hay 3 o más intentos fallidos, verificar si han pasado 15 minutos desde el último
    let bloqueado = false;
    let tiempoRestante = 0;

    if (intentosFallidos >= 3 && ultimoIntento) {
      const tiempoTranscurrido = Date.now() - new Date(ultimoIntento).getTime();
      const quinceMinutos = 15 * 60 * 1000; // 15 minutos en milisegundos
      
      if (tiempoTranscurrido < quinceMinutos) {
        bloqueado = true;
        tiempoRestante = Math.ceil((quinceMinutos - tiempoTranscurrido) / 1000 / 60); // minutos restantes
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        bloqueado,
        intentos_fallidos: intentosFallidos,
        ultimo_intento: ultimoIntento,
        tiempo_restante_minutos: tiempoRestante
      }
    });

  } catch (error) {
    console.error('Error al verificar accesos:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    }, { status: 500 });
  }
}

// DELETE /api/security/accesos - Limpiar accesos antiguos (para mantenimiento)
export async function DELETE(request: NextRequest) {
  try {
    // Eliminar accesos más antiguos de 24 horas
    const query = `
      DELETE FROM accesos 
      WHERE fecha_acceso < NOW() - INTERVAL '24 hours'
    `;

    const result = await pool.query(query);

    return NextResponse.json({
      success: true,
      message: `Se eliminaron ${result.rowCount} registros de accesos antiguos`,
      data: { eliminados: result.rowCount }
    });

  } catch (error) {
    console.error('Error al limpiar accesos:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    }, { status: 500 });
  }
}
