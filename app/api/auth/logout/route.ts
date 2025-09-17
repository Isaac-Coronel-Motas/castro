import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken, createAuthErrorResponse } from '@/lib/middleware/auth';
import { ApiResponse } from '@/lib/types/auth';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const { user, error } = authenticateToken(request);
    
    if (error) {
      return createAuthErrorResponse(error);
    }

    if (!user) {
      return createAuthErrorResponse('Usuario no autenticado');
    }

    // Aquí podrías invalidar el refresh token en la base de datos
    // si tienes una tabla de refresh_tokens
    
    // Log de auditoría
    console.log('Logout exitoso:', {
      usuario_id: user.usuario_id,
      username: user.username,
      ip: request.ip || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString()
    });

    const response: ApiResponse = {
      success: true,
      message: 'Logout exitoso'
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error en logout:', error);
    
    const response: ApiResponse = {
      success: false,
      message: 'Error interno del servidor',
      error: 'Error interno'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
