import { pool } from '@/lib/db';

/**
 * Limpia registros de accesos antiguos (más de 24 horas)
 * Esta función puede ser llamada periódicamente para mantenimiento
 */
export async function limpiarAccesosAntiguos(): Promise<number> {
  try {
    const query = `
      DELETE FROM accesos 
      WHERE fecha_acceso < NOW() - INTERVAL '24 hours'
    `;

    const result = await pool.query(query);
    return result.rowCount || 0;
  } catch (error) {
    console.error('Error al limpiar accesos antiguos:', error);
    return 0;
  }
}

/**
 * Verifica si un usuario está bloqueado por intentos fallidos
 * @param usuario_id ID del usuario
 * @returns Objeto con información del bloqueo
 */
export async function verificarBloqueoUsuario(usuario_id: number): Promise<{
  bloqueado: boolean;
  intentos_fallidos: number;
  tiempo_restante_minutos: number;
  ultimo_intento: string | null;
}> {
  try {
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

    let bloqueado = false;
    let tiempoRestante = 0;

    if (intentosFallidos >= 3 && ultimoIntento) {
      const tiempoTranscurrido = Date.now() - new Date(ultimoIntento).getTime();
      const quinceMinutos = 15 * 60 * 1000; // 15 minutos en milisegundos
      
      if (tiempoTranscurrido < quinceMinutos) {
        bloqueado = true;
        tiempoRestante = Math.ceil((quinceMinutos - tiempoTranscurrido) / 1000 / 60);
      }
    }

    return {
      bloqueado,
      intentos_fallidos: intentosFallidos,
      tiempo_restante_minutos: tiempoRestante,
      ultimo_intento: ultimoIntento
    };
  } catch (error) {
    console.error('Error al verificar bloqueo de usuario:', error);
    return {
      bloqueado: false,
      intentos_fallidos: 0,
      tiempo_restante_minutos: 0,
      ultimo_intento: null
    };
  }
}

/**
 * Registra un intento de acceso (exitoso o fallido)
 * @param usuario_id ID del usuario
 * @param tipo_acceso 'exitoso' o 'fallido'
 * @param ip_origen IP de origen
 * @param info_extra Información adicional
 */
export async function registrarAcceso(
  usuario_id: number,
  tipo_acceso: 'exitoso' | 'fallido',
  ip_origen: string,
  info_extra?: any
): Promise<void> {
  try {
    const query = `
      INSERT INTO accesos (usuario_id, tipo_acceso, ip_origen, info_extra)
      VALUES ($1, $2, $3, $4)
    `;

    const infoExtraString = info_extra ? JSON.stringify(info_extra) : null;
    await pool.query(query, [usuario_id, tipo_acceso, ip_origen, infoExtraString]);
  } catch (error) {
    console.error('Error al registrar acceso:', error);
  }
}

/**
 * Obtiene estadísticas de accesos para un usuario
 * @param usuario_id ID del usuario
 * @param dias Número de días a consultar (por defecto 7)
 */
export async function obtenerEstadisticasAccesos(
  usuario_id: number,
  dias: number = 7
): Promise<{
  total_accesos: number;
  accesos_exitosos: number;
  accesos_fallidos: number;
  ultimo_acceso: string | null;
  accesos_por_dia: Array<{
    fecha: string;
    exitosos: number;
    fallidos: number;
  }>;
}> {
  try {
    // Estadísticas generales
    const statsQuery = `
      SELECT 
        COUNT(*) as total_accesos,
        COUNT(CASE WHEN tipo_acceso = 'exitoso' THEN 1 END) as accesos_exitosos,
        COUNT(CASE WHEN tipo_acceso = 'fallido' THEN 1 END) as accesos_fallidos,
        MAX(fecha_acceso) as ultimo_acceso
      FROM accesos 
      WHERE usuario_id = $1 
        AND fecha_acceso > NOW() - INTERVAL '${dias} days'
    `;

    const statsResult = await pool.query(statsQuery, [usuario_id]);
    const stats = statsResult.rows[0];

    // Accesos por día
    const dailyQuery = `
      SELECT 
        DATE(fecha_acceso) as fecha,
        COUNT(CASE WHEN tipo_acceso = 'exitoso' THEN 1 END) as exitosos,
        COUNT(CASE WHEN tipo_acceso = 'fallido' THEN 1 END) as fallidos
      FROM accesos 
      WHERE usuario_id = $1 
        AND fecha_acceso > NOW() - INTERVAL '${dias} days'
      GROUP BY DATE(fecha_acceso)
      ORDER BY fecha DESC
    `;

    const dailyResult = await pool.query(dailyQuery, [usuario_id]);

    return {
      total_accesos: parseInt(stats.total_accesos),
      accesos_exitosos: parseInt(stats.accesos_exitosos),
      accesos_fallidos: parseInt(stats.accesos_fallidos),
      ultimo_acceso: stats.ultimo_acceso,
      accesos_por_dia: dailyResult.rows.map(row => ({
        fecha: row.fecha,
        exitosos: parseInt(row.exitosos),
        fallidos: parseInt(row.fallidos)
      }))
    };
  } catch (error) {
    console.error('Error al obtener estadísticas de accesos:', error);
    return {
      total_accesos: 0,
      accesos_exitosos: 0,
      accesos_fallidos: 0,
      ultimo_acceso: null,
      accesos_por_dia: []
    };
  }
}
